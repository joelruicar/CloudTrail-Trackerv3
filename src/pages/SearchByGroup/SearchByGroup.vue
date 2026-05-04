<template>
  <h1
    class="sm:text-2xl font-bold text-center mb-3"
    style="color: var(--va-plain-text)"
  >
    Search by Group
  </h1>
  <VaCard class="p-2 sm:p-4 overflow-visible">
    <RangeSelector
      :total-students="awsStore.allUsers.filter((u) => u.startsWith('alucloud')).length"
      :courses="courseOptions"
      @filterApplied="handleFilterApplied"
    />
    <div
      v-if="awsStore.loading"
      class="loading-overlay"
    >
      <VaProgressCircle
        indeterminate
        size="large"
      />
    </div>
    <div
      v-else-if="hasSearched"
      class="mb-4"
    >
      <template v-if="hasResults">
        <VaCard>
          <VaCardTitle style="color: var(--va-chart-title)">
            Promedio de Avance por Práctica de laboratorio - {{ selectedCourseLabel || 'Sin curso' }}
          </VaCardTitle>
          <div class="progress-stats">
            <div
              v-if="singleStudentSelected"
              class="stat-item"
            >
              <span
                class="stat-label"
                style="color: var(--va-plain-text)"
              >Alumno:</span>
              <span class="stat-value">alucloud{{ selectedStudentsFrom }}</span>
            </div>
            <div
              v-else
              class="stat-item"
            >
              <span
                class="stat-label"
                style="color: var(--va-plain-text)"
              >Alumnos en rango:</span>
              <span class="stat-value">alucloud{{ selectedStudentsFrom }} - alucloud{{ selectedStudentsTo }}</span>
            </div>
            <div
              v-if="!singleStudentSelected"
              class="stat-item"
            >
              <span
                class="stat-label"
                style="color: var(--va-plain-text)"
              >Promedio:</span>
              <span class="stat-value">{{ awsStore.averageProgressByRange.toFixed(2) }}%</span>
            </div>
            <div
              v-if="singleStudentSelected && singleStudentFinalGrade !== null"
              class="stat-item"
            >
              <span
                class="stat-label"
                style="color: var(--va-plain-text)"
              >Nota:</span>
              <span class="stat-value">{{ singleStudentFinalGrade.toFixed(1) }}/1</span>
            </div>
          </div>
          <div
            v-if="courseInsights.length && !singleStudentSelected"
            class="mb-4"
          >
            <VaCard>
              <div class="insights-list">
                <div
                  v-for="insight in courseInsights"
                  :key="insight.id"
                  class="insight-item"
                  :class="`insight-item--${insight.tone}`"
                  style="color: var(--va-plain-text)"
                >
                  {{ insight.message }}
                </div>
              </div>
            </VaCard>
          </div>
          <Chart
            :chart-data="averageProgressChart"
            x-axis="Práctica"
            y-axis="%"
            title="laboratory"
            @barClick="handleBarClick"
          />
        </VaCard>
        <VaCard
          v-if="heatmapData.students.length && !singleStudentSelected"
          class="mb-4"
        >
          <VaCardTitle style="color: var(--va-chart-title)">
            Heatmap de Progreso por Alumno
          </VaCardTitle>
          <HeatmapChart
            :heatmap-data="heatmapData"
            x-axis="Práctica"
            y-axis="Alumno"
            class="heatmap-block"
            @studentClick="handleStudentRowClick"
          />
        </VaCard>
        <VaButton
          color="buttonColor"
          class="mb-4"
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
      </template>
    </div>
  </VaCard>
</template>

<script setup lang="ts">
import { useColors } from 'vuestic-ui'
import { useAcademicYear } from '../../composables/useAcademicYear'
import { useMissingEvents } from '../../composables/useMissingEvents'
import { courseSubjectsMap, courseOptions } from '../../data/courseSubjectsMap'
import RangeSelector from '../../components/RangeSelector.vue'
import HeatmapChart from '../../components/HeatmapChart.vue'
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { useRouter } from 'vue-router'
import Chart from '../../components/Chart.vue'
import { useAwsStore } from '../../stores/aws'
import Table from '../../components/Table.vue'
import dayjs from 'dayjs'

const awsStore = useAwsStore()
const authStore = useAuthStore()
const router = useRouter()
const { getColor } = useColors()
const { calculateRange } = useAcademicYear()

const display = ref(true)
const selectedCourseLabel = ref('')
const selectedStudentsFrom = ref(0)
const selectedStudentsTo = ref(0)
const hasSearched = ref(false)
const tableContainerRef = ref<HTMLElement | null>(null)
const searchQuery = ref('')

const courseSubjects = computed(() =>
  Array.from(new Set(courseSubjectsMap[selectedCourseLabel.value] || []))
)

const practiceColumns = [
  { key: 'practiceName',          label: 'Practice',  sortable: true },
  { key: 'user',                  label: 'User',      sortable: true },
  { key: 'completionPercent',     label: 'State',     sortable: true },
  { key: 'lastRelatedEventDate',  label: 'Timestamp', sortable: true },
]

const missingEventColumns = [
  { key: 'practice',  label: 'Practice',                sortable: true },
  { key: 'eventName', label: 'Event',                   sortable: true },
  { key: 'missing',   label: 'Number of missing events', sortable: true },
]

const practiceRows = computed(() =>
  awsStore.studentProgressData.map((studentRow) => {
    const lastEvent = studentRow.events.reduce<string>((latest, event) => {
      if (!event.eventTime) return latest
      if (!latest) return event.eventTime
      return new Date(event.eventTime) > new Date(latest) ? event.eventTime : latest
    }, '')
    return {
      practiceName: studentRow.subject,
      user: studentRow.studentName,
      completionPercent: Number(studentRow.progress.toFixed(2)),
      lastRelatedEventDate: lastEvent ? dayjs(lastEvent).format('HH:mm:ss DD-MM-YYYY') : 'N/A',
    }
  })
)

const hasResults = computed(() => awsStore.studentProgressData.length > 0)
const singleStudentSelected = computed(() =>
  selectedStudentsFrom.value === selectedStudentsTo.value && awsStore.studentProgressData.length > 0
)

const { missingEventsRows } = useMissingEvents(
  courseSubjects,
  computed(() => awsStore.studentProgressData),
)

watch(singleStudentSelected, () => { searchQuery.value = '' })

// ── Helpers ──────────────────────────────────────────────────────────────────

function calculateFinalGrade(subjects: string[], values: Record<string, number>): number {
  if (!subjects.length) return 0
  const sum = subjects.reduce((acc, s) => acc + (values[s] ?? 0), 0)
  return sum / subjects.length / 100
}

const scrollToTable = () =>
  tableContainerRef.value?.scrollIntoView({ behavior: 'smooth', block: 'end' })

const handleAfterEnter = () => scrollToTable()

const handleBarClick = (label: string) => {
  searchQuery.value = searchQuery.value === label ? '' : label
  display.value = false
  nextTick(scrollToTable)
}

// ── Computeds ─────────────────────────────────────────────────────────────────

const heatmapData = computed(() => {
  const baseSubjects = courseSubjects.value
  const byStudent = new Map<string, { index: number; values: Record<string, number> }>()

  awsStore.studentProgressData.forEach((row) => {
    if (!baseSubjects.includes(row.subject)) return
    if (!byStudent.has(row.studentName)) {
      byStudent.set(row.studentName, { index: byStudent.size, values: {} })
    }
    byStudent.get(row.studentName)!.values[row.subject] = Number(row.progress.toFixed(2))
  })

  const students = Array.from(byStudent.entries())
    .sort((a, b) => a[1].index - b[1].index)
    .map(([name]) => name)

  const subjects = [...baseSubjects, 'Nota']
  const points: Array<{ x: string; y: string; v: number }> = []
  const studentGrades: Record<string, number> = {}

  for (const student of students) {
    const values = byStudent.get(student)?.values || {}
    for (const subject of baseSubjects) {
      points.push({ x: subject, y: student, v: values[subject] ?? 0 })
    }
    const note = calculateFinalGrade(baseSubjects, values)
    studentGrades[student] = note
    points.push({ x: 'Nota', y: student, v: Number(note.toFixed(1)) })
  }

  return { students, subjects, points, studentGrades }
})

const singleStudentFinalGrade = computed(() => {
  const subjects = courseSubjects.value
  if (!subjects.length || !awsStore.studentProgressData.length) return null
  const values: Record<string, number> = {}
  for (const row of awsStore.studentProgressData) {
    if (subjects.includes(row.subject)) values[row.subject] = Number(row.progress.toFixed(2))
  }
  return Number(calculateFinalGrade(subjects, values).toFixed(1))
})

const courseInsights = computed(() => {
  const subjects = courseSubjects.value
  const subjectsSet = new Set(subjects)
  const rowsInCourse = awsStore.studentProgressData.filter((r) => subjectsSet.has(r.subject))
  const students = Array.from(new Set(rowsInCourse.map((r) => r.studentName)))
  const totalStudents = students.length

  const bySubject = new Map<string, number[]>()
  subjects.forEach((s) => bySubject.set(s, []))
  rowsInCourse.forEach((r) => bySubject.get(r.subject)?.push(r.progress))

  const ratio = (values: number[], test: (v: number) => boolean) =>
    totalStudents ? (values.filter(test).length / totalStudents) * 100 : 0

  const topStuck     = subjects.map((s) => ({ subject: s, ratio: ratio(bySubject.get(s) || [], (v) => v > 0 && v < 80) }))
    .sort((a, b) => b.ratio - a.ratio)[0]
  const topCompleted = subjects.map((s) => ({ subject: s, ratio: ratio(bySubject.get(s) || [], (v) => v >= 80) }))
    .sort((a, b) => b.ratio - a.ratio)[0]

  const byStudentMap = new Map(students.map((s) => [s, {} as Record<string, number>]))
  rowsInCourse.forEach((r) => { byStudentMap.get(r.studentName)![r.subject] = r.progress })
  const nonStarted = students.filter((s) => subjects.every((sub) => (byStudentMap.get(s)![sub] ?? 0) <= 0)).length

  const insights: Array<{ id: string; tone: 'success' | 'danger' | 'warning'; message: string }> = []
  if ((topCompleted?.ratio || 0) > 0)
    insights.push({ id: 'completed', tone: 'success', message: `${topCompleted.subject} completada por ${Math.round(topCompleted.ratio)}% de alumnos` })
  if ((topStuck?.ratio || 0) > 0)
    insights.push({ id: 'stuck', tone: 'danger', message: `${topStuck.subject} tiene ${Math.round(topStuck.ratio)}% de alumnos atascados` })
  if (nonStarted > 0)
    insights.push({ id: 'not-started', tone: 'warning', message: `${nonStarted} alumno(s) no han empezado ninguna práctica` })

  return insights
})

const averageProgressChart = computed(() => {
  const labels = courseSubjects.value
  const successColor = getColor('heatmapSuccess')
  const warningColor = getColor('heatmapWarning')
  const dangerColor  = getColor('heatmapDanger')
  const emptyColor   = getColor('heatmapEmpty')

  const colors: Record<string, string> = {}
  const data = labels.map((subject) => {
    const rows = awsStore.studentProgressData.filter((r) => r.subject === subject)
    if (!rows.length) { colors[subject] = emptyColor; return 0 }
    const avg = Number((rows.reduce((s, r) => s + r.progress, 0) / rows.length).toFixed(2))
    colors[subject] = avg >= 80 ? successColor : avg > 40 ? warningColor : dangerColor
    return avg
  })

  return { labels, datasets: [{ label: 'Promedio de Avance (%)', backgroundColor: labels.map((s) => colors[s]), data }] }
})


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

  let from: number
  let to: number

  if (authStore.isProfessor) {
    from = filter.from
    to   = filter.to
  } else {
    const studentUsers = awsStore.allUsers.filter((u) => u.startsWith('alucloud'))
    const pos = Math.max(0, studentUsers.indexOf(authStore.username))
    from = pos
    to   = pos
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
</script>

<style scoped src="../SearchByCourse/SearchByCourse.css" />