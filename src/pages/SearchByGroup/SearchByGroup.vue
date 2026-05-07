<template>
  <section class="search-group-page">
    <h1
      class="search-group-title"
      style="color: var(--va-heading)"
    >
      Search by group
    </h1>
    <VaCard class="search-group-shell p-2 sm:p-4 overflow-visible">
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
        v
        else-if="hasSearched"
        class="mb-4"
      >
        <template v-if="hasResults">
          <VaCard class="content-card">
            <VaCardTitle style="color: var(--va-chart-title)">
              Promedio de Avance por Práctica de laboratorio - {{ selectedCourseLabel || 'Sin curso' }}
            </VaCardTitle>
            <div
              class="progress-stats group-stats"
              :class="{ 'single-student': singleStudentSelected }"
            >
              <div
                v-if="singleStudentSelected"
                class="stat-item stat-item--wide"
              >
                <span
                  class="stat-label"
                  style="color: var(--va-plain-text)"
                >Usuario:</span>
                <span class="stat-value">alucloud{{ selectedStudentsFrom }}</span>
              </div>
              <div
                v-if="!singleStudentSelected"
                class="stat-item-group"
              >
                <div class="stat-item stat-item--wide">
                  <span
                    class="stat-label"
                    style="color: var(--va-plain-text)"
                  >Usuarios en rango:</span>
                  <span class="stat-value">alucloud{{ selectedStudentsFrom }} - alucloud{{ selectedStudentsTo }}</span>
                </div>
                <div class="stat-item stat-item--avg">
                  <Doughnut 
                    :number="Number(awsStore.averageProgressByRange.toFixed(0))" 
                    color="#6DADD1" 
                  />
                  <span
                    class="stat-label"
                    style="color: var(--va-plain-text)"
                  >Promedio:</span>
                  <span class="stat-value">{{ awsStore.averageProgressByRange.toFixed(2) }}%</span>
                </div>
              </div>
              <div
                v-if="singleStudentSelected && singleStudentFinalGrade !== null"
                class="stat-item stat-item--avg"
              >
                <span
                  class="stat-label"
                  style="color: var(--va-plain-text)"
                >Nota:</span>
                <span class="stat-value">{{ singleStudentFinalGrade.toFixed(1) }}/1</span>
              </div>
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
                    class="donut-placeholder donut-placeholder--small"
                    :class="stat.donutClass"
                  >
                    <span>{{ stat.valueLabel }}</span>
                  </div>
                  <span
                    v-else
                    class="stat-value"
                  >{{ stat.valueLabel }}</span>
                  <span class="stat-label">{{ stat.label }}</span>
                </div>
              </div>
              <Chart
                :chart-data="averageProgressChart"
                x-axis="Práctica"
                y-axis="%"
                title="laboratory"
                @barClick="handleBarClick"
              />
            </div>
            <div v-if="heatmapData.students.length && !singleStudentSelected">
              <VaCardTitle style="color: var(--va-chart-title)">
                Heatmap de Progreso por Usario
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
          </VaCard>
        </template>
      </div>
    </VaCard>
  </section>
</template>

<script setup lang="ts">
import { useColors } from 'vuestic-ui'
import { useAcademicYear } from '../../composables/useAcademicYear'
import { useMissingEvents } from '../../composables/useMissingEvents'
import { courseSubjectsMap, courseOptions } from '../../data/courseSubjectsMap'
import Doughnut from '../../components/Doughnut.vue'
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
    insights.push({ id: 'completed', tone: 'success', message: `${topCompleted.subject} completada por ${Math.round(topCompleted.ratio)}% de usuarios` })
  if ((topStuck?.ratio || 0) > 0)
    insights.push({ id: 'stuck', tone: 'danger', message: `${topStuck.subject} tiene ${Math.round(topStuck.ratio)}% de usuarios atascados` })
  if (nonStarted > 0)
    insights.push({ id: 'not-started', tone: 'warning', message: `${nonStarted} usuario(s) no han empezado ninguna práctica` })

  return insights
})

const miniStats = computed(() => {
  const completed = courseInsights.value.find((item) => item.id === 'completed')
  const stuck = courseInsights.value.find((item) => item.id === 'stuck')
  const notStarted = courseInsights.value.find((item) => item.id === 'not-started')

  const parsePercent = (message?: string) => {
    const match = message?.match(/(\d+)%/)
    return match ? `${match[1]}%` : '0%'
  }
  const parseCount = (message?: string) => {
    const match = message?.match(/^(\d+)/)
    return match ? match[1] : '0'
  }

  return [
    {
      id: 'completed',
      hasDonut: true,
      valueLabel: parsePercent(completed?.message),
      label: completed?.message || 'Sin datos de completado',
      donutClass: 'donut-warning',
    },
    {
      id: 'not-started',
      hasDonut: false,
      valueLabel: parseCount(notStarted?.message),
      label: notStarted?.message || 'Sin datos de no iniciados',
      donutClass: '',
    },
    {
      id: 'stuck',
      hasDonut: true,
      valueLabel: parsePercent(stuck?.message),
      label: stuck?.message || 'Sin datos de atascados',
      donutClass: 'donut-danger',
    },
  ]
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
<style scoped>
.search-group-title {
  font-size: 2rem;
  font-weight: 800;
  margin: 0 0 0.85rem;
}
 
.search-group-shell {
  border-radius: 12px;
  padding: 1rem !important;
  background: transparent !important;
}
 
.content-card {
  border-radius: 10px;
  padding: 0 !important;
  margin: 0 !important;
}
 
:deep(.content-card .va-card__title) {
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  padding: 1.25rem 1.25rem 0 1.25rem;
}
 
/* ── Stats area ─────────────────────────────────────────────────────────── */
 
:deep(.progress-stats) {
  background: var(--va-background-secondary) ;
  padding: 1rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin: 0 !important;
}
 
/* Tarjeta superior: usuarios en rango + donut — fila horizontal */
:deep(.stat-item-group) {
  border-radius: 10px;
  background: var(--va-background-primary);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  gap: 1rem;
  flex: 1 1 100%;
}
 
:deep(.stat-item-group .stat-item) {
  min-height: auto;
  padding: 0;
  flex: unset;
}
 
/* Texto "usuarios en rango" + rango en negrita */
:deep(.stat-item--wide) {
  flex: 1 1 auto;
}
 

/* Mini stats row — 3 columnas iguales */
.mini-stat-row {
  width: 90%;
  display: grid;
  justify-content: space-between;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
}
 
:deep(.stat-item) {
  border-radius: 10px;
  background: var(--va-background-primary);
  min-height: 96px;
  flex: 1 1 auto;
  padding: 0.85rem 1rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
 
/* Single student: vista lista vertical sin tarjetas */
:deep(.progress-stats.single-student) {
  padding: 1.2rem 1.25rem;
  gap: 0;
  flex-direction: column;
  margin: 0 !important;
}
 
:deep(.progress-stats.single-student .stat-item) {
  border-radius: 0;
  background: transparent !important;
  flex: 1 1 auto;
  min-height: auto;
  padding: 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 1rem;
}
 
/* ── Chart / heatmap padding ─────────────────────────────────────────────── */
 
:deep(.content-card > div:nth-child(n+3)) {
  padding: 0 1.25rem;
}
 
:deep(.content-card .heatmap-block) {
  padding: 1rem 0;
}
 
:deep(.content-card .va-button) {
  margin: 1rem 0;
}
 
/* ── Mini stat inside card ───────────────────────────────────────────────── */
 
.mini-stat {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}
 
.mini-stat--center {
  justify-content: center;
}
 
/* ── Donuts ──────────────────────────────────────────────────────────────── */
 
.donut-placeholder {
  border-radius: 999px;
  display: grid;
  place-items: center;
  font-weight: 700;
  color: var(--va-plain-text);
  border: 5px solid #69b2da;
  border-right-color: transparent;
  flex-shrink: 0;
}
 
.donut-placeholder--large {
  width: 80px;
  height: 80px;
}
 
.donut-placeholder--small {
  width: 52px;
  height: 52px;
  border-width: 4px;
}
 
.donut-warning {
  border-color: #f0b43a;
}
 
.donut-danger {
  border-color: #6276f1;
}
 
@media (max-width: 900px) {
  .search-group-title {
    font-size: 2rem;
    text-align: center;
  }
 
  .mini-stat-row {
    grid-template-columns: 1fr;
  }
}
</style>