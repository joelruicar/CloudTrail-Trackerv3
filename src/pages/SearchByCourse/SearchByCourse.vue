<template>
  <section class="page-shell">
    <h1 class="page-title">
      Search by Course
    </h1>
    <VaCard class="page-card p-2 sm:p-4 overflow-visible">
      <div class="filters-panel search-course-filters mb-6">
        <div class="search-course-filters-grid">
          <div class="filter-field course-field">
            <label
              for="course"
              style="color: var(--va-plain-text)"
            >Course</label>
            <VaSelect
              id="course"
              v-model="selectedCourse"
              :options="courseOptions"
              class="interactive-field"
              background="textInput"
              color="primary"
            />
          </div>

          <div class="filter-field">
            <UserSearchSelector
              v-model="user_name"
              :all-users="awsStore.allUsers"
            />
          </div>

          <DateFilter v-model="selectedDateRange" />
        </div>

        <div class="search-course-actions">
          <VaButton
            class="form-action-button search-course-search-btn"
            color="buttonColor"
            :disabled="!selectedCourse"
            @click="performSearch"
          >
            Search
          </VaButton>
        </div>
      </div>
    </VaCard>

    <div
      v-if="awsStore.loading"
      class="loading-overlay"
    >
      <AtomSpinner
        :animation-duration="1000"
        :size="60"
        color="var(--va-primary)"
      />
    </div>

    <div
      v-else-if="hasSearched"
      class="mt-6 mb-4"
    >
      <VaCard class="page-card p-2 sm:p-4 overflow-visible">
        <VaCard class="content-card">
          <h2 class="section-title">
            Percentage completed by practice
          </h2>
          <Chart
            ref="practiceChartRef"
            :chart-data="practiceCompletionChart"
            x-axis="Laboratory practices"
            y-axis="%"
            title="laboratory"
            @barClick="handleBarClick"
          />

          <div class="course-results-actions">
            <VaButton
              color="buttonColor"
              class="details-button"
              @click="display = !display"
            >
              Details
            </VaButton>

            <VaButton
              color="buttonColor"
              class="details-button"
              :loading="isExportingPdf"
              :disabled="!hasSearched || !hasChartData || isExportingPdf"
              @click="handlePdfExport"
            >
              Download PDF
            </VaButton>

            <div class="course-grade-summary">
              <span class="course-grade-label">Grade</span>
              <strong>{{ studentFinalGradeLabel }}</strong>
            </div>
          </div>

          <Transition
            name="expand"
            @afterEnter="handleAfterEnter"
          >
            <div
              v-if="!display"
              ref="tableContainerRef"
            >
              <Table
                v-model:filter="searchQuery"
                :items="missingEventsRows"
                :columns="missingEventColumns"
                :enable-event-link="true"
              />
            </div>
          </Transition>
        </VaCard>
      </VaCard>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useAcademicYear } from '../../composables/useAcademicYear'
import { useMissingEvents } from '../../composables/useMissingEvents'
import { AtomSpinner } from 'epic-spinners'
import { courseSubjectsMap, courseOptions } from '../../data/courseSubjectsMap'
import UserSearchSelector from '../../components/UserSearchSelector.vue'
import DateFilter from '../../components/DateFilter.vue'
import { ref, computed, onMounted, nextTick } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { useAwsStore } from '../../stores/aws'
import { useRoute } from 'vue-router'
import { VaSelect, VaButton, useColors } from 'vuestic-ui'
import Chart from '../../components/Chart.vue'
import Table from '../../components/Table.vue'
import dayjs from 'dayjs'
import { REFERDATA } from '../../data/evenprac'
import { buildSingleStudentFinalGrade } from '../SearchByGroup/SearchByGroup.utils'
import { downloadCourseChartReport } from './SearchByCourse.pdf'

type ReferenceDataSet = Record<string, Record<string, number>>

const awsStore = useAwsStore()
const authStore = useAuthStore()
const route = useRoute()
const { calculateRange } = useAcademicYear()
const { getColor } = useColors()

const selectedCourseLabel = ref('')
const hasSearched = ref(false)
const display = ref(true)
const user_name = ref(authStore.username)
const selectedCourse = ref(courseOptions[0] ?? '')
const selectedDateRange = ref<{ start: Date; end: Date } | null>(calculateRange())
const searchQuery = ref('')
const tableContainerRef = ref<HTMLElement | null>(null)
const practiceChartRef = ref<InstanceType<typeof Chart> | null>(null)
const isExportingPdf = ref(false)

const courseSubjects = computed(() =>
  Array.from(new Set(courseSubjectsMap[selectedCourseLabel.value] || []))
)

const missingEventColumns = [
  { key: 'practice',  label: 'Practice',                sortable: true },
  { key: 'eventName', label: 'Event',                   sortable: true },
  { key: 'missing',   label: 'Number of missing events', sortable: true },
]

const { missingEventsRows } = useMissingEvents(
  courseSubjects,
  computed(() => awsStore.studentProgressData),
  selectedCourseLabel,
)

const studentFinalGrade = computed(() =>
  buildSingleStudentFinalGrade(awsStore.studentProgressData, courseSubjects.value)
)

const studentFinalGradeLabel = computed(() =>
  studentFinalGrade.value === null ? '-' : `${studentFinalGrade.value.toFixed(1)}/1`
)

const hasChartData = computed(() =>
  (practiceCompletionChart.value.datasets[0]?.data?.length ?? 0) > 0
)

const referData = computed<Record<string, Record<string, number>>>(() => {
  const references = REFERDATA as {
    REFERDATA?: ReferenceDataSet
    REFERDATA1?: ReferenceDataSet
  }

  if (selectedCourseLabel.value === 'MUCNAP-ICP' || selectedCourseLabel.value === 'MUCC-DDS') {
    return references.REFERDATA1 ?? {}
  }
  return references.REFERDATA ?? {}
})

const practiceCompletionChart = computed(() => {
  const labels = courseSubjects.value
  const missingByPractice = missingEventsRows.value.reduce<Record<string, number>>((acc, row) => {
    acc[row.practice] = (acc[row.practice] || 0) + row.missing
    return acc
  }, {})

  const data = labels.map((practice) => {
    const totalRequired = Object.entries(referData.value[practice] || {}).reduce((sum, [k, v]) => {
      return k === 'totalref' ? sum : sum + Number(v)
    }, 0)
    if (totalRequired <= 0) return 0
    const completed = Math.max(0, totalRequired - (missingByPractice[practice] || 0))
    return Number(((completed / totalRequired) * 100).toFixed(2))
  })

  const backgroundColor = data.map((value) => {
    if (value === 0) return getColor('heatmapEmpty')
    if (value >= 80) return getColor('heatmapSuccess')
    if (value > 40) return getColor('heatmapWarning')
    return getColor('heatmapDanger')
  })

  const borderColor = data.map((value) => {
    if (value === 0) return getColor('emptyState')
    if (value >= 80) return getColor('heatmapSuccess')
    if (value > 40) return getColor('heatmapWarning')
    return getColor('heatmapDanger')
  })

  return {
    labels,
    datasets: [{
      label: '%',
      data,
      backgroundColor,
      borderColor,
      borderWidth: 1,
    }],
  }
})

const handleBarClick = (label: string) => {
  searchQuery.value = searchQuery.value === label ? '' : label
  display.value = false
}

const handleAfterEnter = () => {
  tableContainerRef.value?.scrollIntoView({ behavior: 'smooth', block: 'end' })
}

const handlePdfExport = async () => {
  const canvas = practiceChartRef.value?.getCanvas()
  if (!canvas || !selectedCourseLabel.value) return

  isExportingPdf.value = true
  try {
    await downloadCourseChartReport({
      canvas,
      courseLabel: selectedCourseLabel.value,
      studentName: user_name.value,
      gradeLabel: studentFinalGradeLabel.value,
    })
  } catch (error) {
    console.error('Error generating course chart PDF:', error)
  } finally {
    isExportingPdf.value = false
  }
}

const performSearch = async () => {
  if (!selectedCourse.value) return
  hasSearched.value = true
  display.value = true
  selectedCourseLabel.value = selectedCourse.value

  const defaultRange = calculateRange()
  const startDate = dayjs(selectedDateRange.value?.start ?? defaultRange.start).format('YYYY-MM-DD')
  const endDate   = dayjs(selectedDateRange.value?.end   ?? defaultRange.end).format('YYYY-MM-DD')
  const subjects  = Array.from(new Set(courseSubjectsMap[selectedCourse.value] || []))

  await awsStore.fetchStudentProgressForUsers([user_name.value], subjects, startDate, endDate)
}
onMounted(async () => {
  if (authStore.isProfessor && awsStore.allUsers.length === 0) await awsStore.getAllUsers()
  if (!authStore.isProfessor) user_name.value = authStore.username

  const queryUser   = route.query.user   as string | undefined
  const queryCourse = route.query.course as string | undefined

  if (queryUser)   user_name.value      = queryUser
  if (queryCourse) selectedCourse.value = queryCourse

  if (queryCourse) {
    await nextTick()
    await performSearch()
  }
})
</script>

<style scoped src="./SearchByCourse.css" />
