<template>
  <section class="page-shell">
    <h1 class="page-title">
      Search by Course
    </h1>
    <VaCard class="page-card p-2 sm:p-4 overflow-visible">
      <div class="filters-panel search-course-filters mb-6">
        <div class="search-course-filters-grid">
          <div class="filter-field">
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

          <div class="filter-field search-course-filters-dates">
            <DateFilter v-model="selectedDateRange" />
          </div>
        </div>

        <div class="search-course-actions">
          <VaButton
            class="search-btn search-course-search-btn"
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
            Porcentaje completado por práctica
          </h2>
          <Chart
            :chart-data="practiceCompletionChart"
            x-axis="Práctica"
            y-axis="% completado"
            title="laboratory"
            @barClick="handleBarClick"
          />

          <VaButton
            color="buttonColor"
            class="mb-4 ml-6 details-button"
            @click="display = !display"
          >
            Details
          </VaButton>

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
                :enable-event-link-with-popover="true"
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
import { VaSelect, VaButton } from 'vuestic-ui'
import Chart from '../../components/Chart.vue'
import Table from '../../components/Table.vue'
import dayjs from 'dayjs'
import { REFERDATA } from '../../data/evenprac'

const awsStore = useAwsStore()
const authStore = useAuthStore()
const route = useRoute()
const { calculateRange } = useAcademicYear()

const selectedCourseLabel = ref('')
const hasSearched = ref(false)
const display = ref(true)
const user_name = ref(authStore.username)
const selectedCourse = ref(courseOptions[0] ?? '')
const selectedDateRange = ref<{ start: Date; end: Date } | null>(calculateRange())
const searchQuery = ref('')
const tableContainerRef = ref<HTMLElement | null>(null)

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
)

const referData: Record<string, Record<string, number>> = (REFERDATA as any).REFERDATA ?? {}

const practiceCompletionChart = computed(() => {
  const labels = courseSubjects.value
  const missingByPractice = missingEventsRows.value.reduce<Record<string, number>>((acc, row) => {
    acc[row.practice] = (acc[row.practice] || 0) + row.missing
    return acc
  }, {})

  const data = labels.map((practice) => {
    const totalRequired = Object.entries(referData[practice] || {}).reduce((sum, [k, v]) => {
      return k === 'totalref' ? sum : sum + Number(v)
    }, 0)
    if (totalRequired <= 0) return 0
    const completed = Math.max(0, totalRequired - (missingByPractice[practice] || 0))
    return Number(((completed / totalRequired) * 100).toFixed(2))
  })

  return { labels, datasets: [{ label: '% completado', data }] }
})

const handleBarClick = (label: string) => {
  searchQuery.value = searchQuery.value === label ? '' : label
}

const handleAfterEnter = () => {
  tableContainerRef.value?.scrollIntoView({ behavior: 'smooth', block: 'end' })
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
  const studentUsers = awsStore.allUsers.filter((u) => u.startsWith('alucloud'))
  const pos = Math.max(0, studentUsers.indexOf(user_name.value))

  await awsStore.fetchStudentProgressByRangeForSubjects(pos, pos + 1, subjects, startDate, endDate)
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