<template>
  <section class="page-shell">
    <h1 class="page-title">
      {{ t('searchByGroup.title') }}
    </h1>

    <VaCard class="page-card p-2 sm:p-4 overflow-visible">
      <RangeSelector
        :total-students="awsStore.allUsers.filter((u) => u.startsWith('alucloud')).length"
        :courses="courseOptions"
        @filterApplied="handleFilterApplied"
      />
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
      <template v-if="hasResults">
        <VaCard class="page-card p-2 sm:p-4 overflow-visible">
          <VaCard class="content-card">
            <div
              class="progress-stats group-stats"
              :class="{ 'single-student': singleStudentSelected }"
            >
              <div
                v-if="singleStudentSelected"
                class="stat-hero single-student-hero"
              >
                <div class="stat-item stat-item--wide">
                  <span class="stat-label plain-text">{{ t('searchByGroup.user') }}</span>
                  <span class="stat-value">alucloud{{ selectedStudentsFrom }}</span>
                </div>
                <div
                  v-if="singleStudentFinalGrade !== null"
                  class="stat-item stat-item--avg"
                >
                  <div class="doughnut-container">
                    <Doughnut
                      :number="singleStudentGradePercent"
                      color="#6DADD1"
                      number-color="white"
                    />
                  </div>
                  <span class="stat-value">{{ t('searchByGroup.grade') }} {{ singleStudentFinalGrade.toFixed(1) }}/1</span>
                </div>
              </div>

              <div
                v-else
                class="stat-hero"
              >
                <div class="stat-item stat-item--wide">
                  <span class="stat-label plain-text">{{ t('searchByGroup.usersInRange') }}</span>
                  <span class="stat-value">alucloud{{ selectedStudentsFrom }} - alucloud{{ selectedStudentsTo }}</span>
                </div>
                <div class="stat-item stat-item--avg">
                  <div class="doughnut-container">
                    <Doughnut
                      :number="Number(awsStore.averageProgressByRange.toFixed(0))"
                      color="#6DADD1"
                      number-color="white"
                    />
                  </div>
                  <span class="stat-value">{{ t('searchByGroup.averagePracticesResolved') }}</span>
                </div>
              </div>

              <!-- Mini stats -->
              <div
                v-if="!singleStudentSelected && miniStats.length"
                class="mini-stat-row"
              >
                <div
                  v-for="stat in miniStats"
                  :key="stat.id"
                  class="stat-item mini-stat"
                  :class="{ 'mini-stat--center': !stat.hasDonut }"
                >
                  <div
                    v-if="stat.hasDonut"
                    class="mini-donut"
                  >
                    <Doughnut
                      :number="parseFloat(stat.valueLabel)"
                      :color="stat.color"
                    />
                  </div>
                  <div
                    v-else
                    class="mini-count"
                    :class="`mini-count--${stat.tone}`"
                  >
                    <VaIcon
                      :name="stat.icon"
                      size="30px"
                    />
                    <span>{{ stat.valueLabel }}</span>
                  </div>
                  <span class="stat-label">{{ stat.label }}</span>
                  <span
                    class="stat-caption"
                    :class="`stat-caption--${stat.tone}`"
                  >{{ stat.caption }}</span>
                </div>
              </div>

              <h2 class="section-title">
                AWS services used in the last hour
              </h2>
              <Chart
                :chart-data="averageProgressChart"
                x-axis="Práctica"
                y-axis="%"
                title="laboratory"
                @barClick="handleBarClick"
              />
            </div>

            <!-- Heatmap -->
            <div
              v-if="heatmapData.students.length && !singleStudentSelected"
              class="heatmap-section"
            >
              <VaCardTitle class="section-title">
                {{ t('searchByGroup.heatmapTitle') }}
              </VaCardTitle>
              <HeatmapChart
                :heatmap-data="heatmapData"
                x-axis="Práctica"
                y-axis="Usuario"
                class="heatmap-block"
                @studentClick="handleStudentRowClick"
              />
            </div>

            <VaButton
              color="buttonColor"
              class="mb-4 ml-6"
              @click="display = !display"
            >
              {{ t('searchByGroup.details') }}
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
                  :items="singleStudentSelected ? missingEventsRows : practiceRows"
                  :columns="singleStudentSelected ? missingEventColumns : practiceColumns"
                  :enable-event-link-with-popover="singleStudentSelected"
                >
                  <template #cell(completionPercent)="{ rowData }">
                    {{ rowData.completionPercent?.toFixed(2) }}%
                  </template>
                  <template #cell(lastRelatedEventDate)="{ rowData }">
                    {{ rowData.lastRelatedEventDate || '-' }}
                  </template>
                </Table>
              </div>
            </Transition>
          </VaCard>
        </VaCard>
      </template>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useColors } from 'vuestic-ui'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import dayjs from 'dayjs'
import { AtomSpinner } from 'epic-spinners'

import { useAcademicYear } from '../../composables/useAcademicYear'
import { useMissingEvents } from '../../composables/useMissingEvents'
import { courseSubjectsMap, courseOptions } from '../../data/courseSubjectsMap'
import { useAuthStore } from '../../stores/auth'
import { useAwsStore } from '../../stores/aws'

import Chart from '../../components/Chart.vue'
import Doughnut from '../../components/Doughnut.vue'
import HeatmapChart from '../../components/HeatmapChart.vue'
import RangeSelector from '../../components/RangeSelector.vue'
import Table from '../../components/Table.vue'
import {
  buildAverageProgressChart,
  buildGroupMetrics,
  buildHeatmapData,
  buildSingleStudentFinalGrade,
  formatPracticeRows,
} from './SearchByGroup.utils'

const awsStore = useAwsStore()
const authStore = useAuthStore()
const router = useRouter()
const { getColor } = useColors()
const { calculateRange } = useAcademicYear()
const { t } = useI18n()

const display = ref(true)
const hasSearched = ref(false)
const searchQuery = ref('')
const selectedCourseLabel = ref('')
const selectedStudentsFrom = ref(0)
const selectedStudentsTo = ref(0)
const tableContainerRef = ref<HTMLElement | null>(null)

const practiceColumns = [
  { key: 'practiceName',         label: t('searchByGroup.practiceColumn'),        sortable: true },
  { key: 'user',                 label: t('searchByGroup.userColumn'),            sortable: true },
  { key: 'completionPercent',    label: t('searchByGroup.stateColumn'),           sortable: true },
  { key: 'lastRelatedEventDate', label: t('searchByGroup.timestampColumn'),       sortable: true },
]

const missingEventColumns = [
  { key: 'practice',  label: t('searchByGroup.practiceColumn'),      sortable: true },
  { key: 'eventName', label: t('searchByGroup.eventColumn'),         sortable: true },
  { key: 'missing',   label: t('searchByGroup.missingEventsColumn'), sortable: true },
]

const courseSubjects = computed(() =>
  Array.from(new Set(courseSubjectsMap[selectedCourseLabel.value] || []))
)

const hasResults = computed(() => awsStore.studentProgressData.length > 0)

const singleStudentSelected = computed(() =>
  selectedStudentsFrom.value === selectedStudentsTo.value && hasResults.value
)

const practiceRows = computed(() => formatPracticeRows(awsStore.studentProgressData))

const { missingEventsRows } = useMissingEvents(
  courseSubjects,
  computed(() => awsStore.studentProgressData),
)

const heatmapData = computed(() => buildHeatmapData(awsStore.studentProgressData, courseSubjects.value))

const singleStudentFinalGrade = computed(() =>
  buildSingleStudentFinalGrade(awsStore.studentProgressData, courseSubjects.value)
)

const singleStudentGradePercent = computed(() =>
  singleStudentFinalGrade.value === null ? 0 : Math.round(singleStudentFinalGrade.value * 100)
)

type MiniStat = {
  id: string
  hasDonut: boolean
  valueLabel: string
  label: string
  caption: string
  tone: 'success' | 'danger' | 'warning'
  color?: string
  icon?: string
}

const groupMetrics = computed(() => buildGroupMetrics(awsStore.studentProgressData, courseSubjects.value))

const miniStats = computed<MiniStat[]>(() => {
  const metrics = groupMetrics.value
  const successColor = getColor('heatmapSuccess')
  const dangerColor = getColor('heatmapDanger')
  const warningColor = getColor('heatmapWarning')

  return [
    {
      id: 'completed',
      hasDonut: true,
      valueLabel: `${metrics.completed.percent}%`,
      label: t('searchByGroup.completedCard', {
        subject: metrics.completed.subject,
        percent: metrics.completed.count,
      }),
      caption: metrics.completed.percent > 0 ? t('searchByGroup.goodProgress') : t('searchByGroup.noDataCompleted'),
      tone: 'success',
      color: successColor,
    },
    {
      id: 'not-started',
      hasDonut: false,
      valueLabel: `${metrics.notStarted}`,
      label: t('searchByGroup.notStartedCard', { count: metrics.notStarted }),
      caption: metrics.notStarted > 0 ? t('searchByGroup.needsAttention') : t('searchByGroup.noDataNotStarted'),
      tone: metrics.notStarted > 0 ? 'danger' : 'success',
      icon: 'material-icons-group',
      color: dangerColor,
    },
    {
      id: 'stuck',
      hasDonut: true,
      valueLabel: `${metrics.stuck.percent}%`,
      label: t('searchByGroup.stuckCard', { subject: metrics.stuck.subject, count: metrics.stuck.count }),
      caption: metrics.stuck.percent > 0 ? t('searchByGroup.reviewNeeded') : t('searchByGroup.noDataStuck'),
      tone: 'warning',
      color: warningColor,
    },
  ]
})

const averageProgressChart = computed(() => {
  const labels = courseSubjects.value
  return buildAverageProgressChart(awsStore.studentProgressData, labels, {
    success: getColor('heatmapSuccess'),
    warning: getColor('heatmapWarning'),
    danger: getColor('heatmapDanger'),
    empty: getColor('heatmapEmpty'),
  })
})

const scrollToTable = () =>
  tableContainerRef.value?.scrollIntoView({ behavior: 'smooth', block: 'end' })

const handleAfterEnter = () => scrollToTable()

const handleBarClick = (label: string) => {
  searchQuery.value = searchQuery.value === label ? '' : label
  display.value = false
  nextTick(scrollToTable)
}

const handleFilterApplied = async (filter: {
  from: number; to: number; course: string
  dateRange: { start: Date; end: Date } | null
}) => {
  hasSearched.value = true
  selectedCourseLabel.value = filter.course

  const defaultRange = calculateRange()
  const startDate = dayjs(filter.dateRange?.start ?? defaultRange.start).format('YYYY-MM-DD')
  const endDate   = dayjs(filter.dateRange?.end   ?? defaultRange.end).format('YYYY-MM-DD')
  const subjects  = Array.from(new Set(courseSubjectsMap[filter.course] || []))

  let from: number, to: number

  if (authStore.isProfessor) {
    from = filter.from
    to   = filter.to
  } else {
    const studentUsers = awsStore.allUsers.filter((u) => u.startsWith('alucloud'))
    const pos = Math.max(0, studentUsers.indexOf(authStore.username))
    from = to = pos
  }

  selectedStudentsFrom.value = from
  selectedStudentsTo.value   = to

  await awsStore.fetchStudentProgressByRangeForSubjects(from, to + 1, subjects, startDate, endDate)
}

const handleStudentRowClick = (student: string) => {
  if (!student) return
  router.push({ name: 'search-by-course', query: { user: student, course: selectedCourseLabel.value } })
}

onMounted(async () => {
  if (authStore.isProfessor && awsStore.allUsers.length === 0) await awsStore.getAllUsers()
})

watch(singleStudentSelected, () => { searchQuery.value = '' })
</script>

<style src="./SearchByGroup.css" scoped></style>
