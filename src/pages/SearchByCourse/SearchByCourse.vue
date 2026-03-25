<template>
  <VaCard class="p-2 sm:p-4 overflow-visible">
    <h1 class="text-xl sm:text-2xl font-bold mb-4">Search by course</h1>
    <RangeSelector
      :total-students="awsStore.allUsers.filter((u) => u.startsWith('alucloud')).length"
      :courses="courseOptions"
      @filterApplied="handleFilterApplied"
    />
    <div v-if="awsStore.loading" class="loading-overlay">
      <VaProgressCircle indeterminate size="large" />
    </div>
    <div v-else-if="hasSearched" class="mb-4">
      <template v-if="hasResults">
        <VaCard>
          <VaCardTitle>
            Promedio de Avance por Práctica de laboratorio - {{ selectedCourseLabel || 'Sin curso' }}
          </VaCardTitle>
          <div class="progress-stats">
            <div v-if="selectedStudentsFrom == selectedStudentsTo" class="stat-item">
              <span class="stat-label">Alumno:</span>
              <span class="stat-value">alucloud{{ selectedStudentsFrom }}</span>
            </div>
            <div v-else class="stat-item">
              <span class="stat-label">Alumnos en rango:</span>
              <span class="stat-value">alucloud{{ selectedStudentsFrom }} - alucloud{{ selectedStudentsTo }}</span>
            </div>
            <div v-if="selectedStudentsFrom != selectedStudentsTo" class="stat-item">
              <span class="stat-label">Promedio:</span>
              <span class="stat-value">{{ awsStore.averageProgressByRange.toFixed(2) }}%</span>
            </div>
            <div
              v-if="selectedStudentsFrom === selectedStudentsTo && singleStudentFinalGrade !== null"
              class="stat-item"
            >
              <span class="stat-label">Nota:</span>
              <span class="stat-value">{{ singleStudentFinalGrade.toFixed(1) }}/1</span>
            </div>
          </div>
          <div v-if="courseInsights.length && selectedStudentsFrom != selectedStudentsTo" class="mb-4">
            <VaCard>
              <div class="insights-list">
                <div
                  v-for="insight in courseInsights"
                  :key="insight.id"
                  class="insight-item"
                  :class="`insight-item--${insight.tone}`"
                >
                  {{ insight.message }}
                </div>
              </div>
            </VaCard>
          </div>
          <Chart :chart-data="averageProgressChart" x-axis="Práctica" y-axis="%" title="laboratory" />
        </VaCard>
        <VaCard v-if="heatmapData.students.length && selectedStudentsFrom != selectedStudentsTo" class="mb-4">
          <VaCardTitle>Heatmap de Progreso por Alumno</VaCardTitle>
          <HeatmapChart :heatmap-data="heatmapData" x-axis="Práctica" y-axis="Alumno" class="heatmap-block" />
        </VaCard>
        <VaButton color="primary" class="mb-4" @click="displayDetails = !displayDetails"> Details </VaButton>
        <Transition name="expand" @afterEnter="handleAfterEnter">
          <div
            v-if="!displayDetails"
            ref="tableContainerRef"
            class="table-container"
            :style="{ minHeight: `${perPage * 45 + 50}px` }"
          >
            <VaCard>
              <div class="table-toolbar">
                <VaInput v-model="searchQuery" class="search-input" placeholder="Search" clearable />
                <label class="per-page-label">
                  Show
                  <VaSelect v-model="perPage" :options="[10, 25, 50, 100]" class="page-select-inline" />
                  entries
                </label>
              </div>
              <VaDataTable
                v-model:sort-by="sortBy"
                v-model:sorting-order="sortingOrder"
                :items="practiceRows"
                :columns="practiceColumns"
                :filter="searchQuery"
                :per-page="perPage"
                :current-page="currentPage"
                :disable-client-side-sorting="false"
                hoverable
              >
                <template #cell(completionPercent)="{ rowData }">{{ rowData.completionPercent.toFixed(2) }}%</template>
                <template #cell(lastRelatedEventDate)="{ rowData }">
                  {{ rowData.lastRelatedEventDate || '-' }}
                </template>
              </VaDataTable>
              <div class="pagination-footer">
                <VaPagination
                  v-model="currentPage"
                  :pages="pages"
                  active-page-color="remarkPrimary"
                  color="primary"
                  size="small"
                />
              </div>
            </VaCard>
          </div>
        </Transition>
      </template>
    </div>
  </VaCard>
</template>

<script setup lang="ts">
import {
  VaCard,
  VaCardTitle,
  VaButton,
  VaProgressCircle,
  VaDataTable,
  VaInput,
  VaSelect,
  VaPagination,
} from 'vuestic-ui'
import { useAcademicYear } from '../../composables/useAcademicYear'
import RangeSelector from '../../components/RangeSelector.vue'
import HeatmapChart from '../../components/HeatmapChart.vue'
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useAuthStore } from '../../stores/auth'
import Chart from '../../components/Chart.vue'
import { useAwsStore } from '../../stores/aws'
import dayjs from 'dayjs'

const awsStore = useAwsStore()
const authStore = useAuthStore()
const { calculateRange } = useAcademicYear()
const displayDetails = ref(true)
const selectedCourseLabel = ref('')
const selectedStudentsFrom = ref(0)
const selectedStudentsTo = ref(0)
const sortingOrder = ref<'asc' | 'desc' | null>(null)
const sortBy = ref('index')
const perPage = ref(10)
const searchQuery = ref('')
const currentPage = ref(1)
const hasSearched = ref(false)

const courseSubjectsMap: Record<string, string[]> = {
  CursoCloudAWS: [
    'PL_EC2',
    'PL_EC2_S3',
    'PL_RDS',
    'PL_DYNAMODB',
    'PL_APP',
    'PL_CF',
    'PL_VPC',
    'PL_LAMBDA_SQS',
    'PL_SERVERLESS_APP',
  ],
  'MBDA-CGDNGB': ['PL_EC2', 'PL_EC2_S3', 'PL_RDS', 'PL_APP', 'PL_LAMBDA_SQS'],
  'MBDA-MEGBD': ['PL_EMR'],
  'MUCNAP-ICP': ['PL_EC2', 'PL_EC2_S3', 'PL_RDS', 'PL_DYNAMODB', 'PL_APP', 'PL_CF', 'PL_VPC', 'PL_LAMBDA_SQS'],
  'MUCNAP-CBD': ['PL_EMR'],
  'MUGI-SEN': ['PL_EC2', 'PL_EC2_S3', 'PL_RDS', 'PL_DYNAMODB', 'PL_APP', 'PL_CF', 'PL_LAMBDA_SQS'],
  'GII-CNA': ['PL_EC2', 'PL_EC2_S3'],
  'GCD-IPD': ['PL_EC2', 'PL_EC2_S3'],
  'MUCC-DDS': ['PL_EC2', 'PL_EC2_S3', 'PL_VPC', 'PL_RDS', 'PL_APP', 'PL_CF', 'PL_LAMBDA_SQS'],
  'MUIS-DOS': ['PL_EC2', 'PL_CF', 'PL_LAMBDA_SQS'],
  TCC: ['PL_GRAVITON', 'PL_DATA_LAKE', 'PL_EVENTS_WORKFLOWS'],
}

const courseOptions = computed(() => Object.keys(courseSubjectsMap))

const practiceColumns = [
  { key: 'practiceName', label: 'Practice', sortable: true },
  { key: 'user', label: 'User', sortable: true },
  { key: 'completionPercent', label: 'State', sortable: true },
  { key: 'lastRelatedEventDate', label: 'Timestamp', sortable: true },
]

const practiceRows = computed(() => {
  const rows: Array<{
    practiceName: string
    user: string
    completionPercent: number
    lastRelatedEventDate: string
  }> = []

  awsStore.studentProgressData.forEach((studentRow) => {
    const lastEvent = studentRow.events.reduce<string>((latest, event) => {
      if (!event.eventTime) return latest
      if (!latest) return event.eventTime
      return new Date(event.eventTime) > new Date(latest) ? event.eventTime : latest
    }, '')

    rows.push({
      practiceName: studentRow.subject,
      user: studentRow.studentName,
      completionPercent: Number(studentRow.progress.toFixed(2)),
      lastRelatedEventDate: lastEvent ? dayjs(lastEvent).format('HH:mm:ss DD-MM-YYYY') : 'N/A',
    })
  })

  return rows
})

const pages = computed(() => Math.max(1, Math.ceil(practiceRows.value.length / perPage.value)))
const hasResults = computed(() => awsStore.studentProgressData.length > 0)

const calculateFinalGrade = (subjects: string[], values: Record<string, number>) => {
  if (!subjects.length) return 0
  const completedCount = subjects.filter((subject) => (values[subject] ?? 0) >= 80).length
  return completedCount / subjects.length
}

const heatmapData = computed(() => {
  const baseSubjects = Array.from(new Set(courseSubjectsMap[selectedCourseLabel.value] || []))

  const subjectsSet = new Set(baseSubjects)
  const byStudent = new Map<string, { index: number; values: Record<string, number> }>()

  for (const row of awsStore.studentProgressData) {
    const subject = row.subject
    if (!subjectsSet.has(subject)) continue

    if (!byStudent.has(row.studentName)) {
      byStudent.set(row.studentName, { index: row.studentIndex, values: {} })
    }

    byStudent.get(row.studentName)!.values[subject] = Number(row.progress.toFixed(2))
  }

  const students = Array.from(byStudent.entries())
    .sort((a, b) => a[1].index - b[1].index)
    .map(([studentName]) => studentName)

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

    points.push({
      x: 'Nota',
      y: student,
      v: Number(note.toFixed(1)),
    })
  }

  return { students, subjects, points, studentGrades }
})

const singleStudentFinalGrade = computed(() => {
  const baseSubjects = Array.from(new Set(courseSubjectsMap[selectedCourseLabel.value] || []))
  if (!baseSubjects.length || !awsStore.studentProgressData.length) return null

  const values: Record<string, number> = {}
  for (const row of awsStore.studentProgressData) {
    if (!baseSubjects.includes(row.subject)) continue
    values[row.subject] = Number(row.progress.toFixed(2))
  }

  return Number(calculateFinalGrade(baseSubjects, values).toFixed(1))
})

const tableContainerRef = ref<HTMLElement | null>(null)

const scrollToTable = () => {
  const el = tableContainerRef.value
  el?.scrollIntoView({ behavior: 'smooth', block: 'end' })
}

const handleAfterEnter = () => {
  scrollToTable()
}

watch(currentPage, () => {
  if (displayDetails.value) return
  nextTick(() => {
    scrollToTable()
  })
})

const courseInsights = computed(() => {
  const subjects = Array.from(new Set(courseSubjectsMap[selectedCourseLabel.value] || []))

  const subjectsSet = new Set(subjects)
  const rowsInCourse = awsStore.studentProgressData.filter((row) => subjectsSet.has(row.subject))

  const students = Array.from(new Set(rowsInCourse.map((row) => row.studentName)))
  const totalStudents = students.length
  const bySubject = new Map<string, number[]>()
  for (const subject of subjects) {
    bySubject.set(subject, [])
  }

  for (const row of rowsInCourse) {
    const subject = row.subject
    const values = bySubject.get(subject)
    if (values) {
      values.push(row.progress)
    }
  }

  const stuckBySubject = subjects.map((subject) => {
    const values = bySubject.get(subject) || []
    const stuckCount = values.filter((value) => value > 0 && value < 80).length
    return { subject, ratio: totalStudents ? (stuckCount / totalStudents) * 100 : 0 }
  })

  const completedBySubject = subjects.map((subject) => {
    const values = bySubject.get(subject) || []
    const completedCount = values.filter((value) => value >= 80).length
    return { subject, ratio: totalStudents ? (completedCount / totalStudents) * 100 : 0 }
  })

  const byStudent = new Map<string, Record<string, number>>()
  for (const studentName of students) {
    byStudent.set(studentName, {})
  }
  for (const row of rowsInCourse) {
    const subject = row.subject
    byStudent.get(row.studentName)![subject] = row.progress
  }

  const nonStartedStudents = students.filter((studentName) => {
    const values = byStudent.get(studentName) || {}
    return subjects.every((subject) => (values[subject] ?? 0) <= 0)
  }).length

  const topStuck = stuckBySubject.sort((a, b) => b.ratio - a.ratio)[0]
  const topCompleted = completedBySubject.sort((a, b) => b.ratio - a.ratio)[0]

  const insights: Array<{ id: string; tone: 'success' | 'danger' | 'warning'; message: string }> = []

  if ((topCompleted?.ratio || 0) > 0) {
    insights.push({
      id: 'completed',
      tone: 'success',
      message: `${topCompleted?.subject || 'N/A'} completado por ${Math.round(topCompleted?.ratio || 0)}% de alumnos`,
    })
  }

  if ((topStuck?.ratio || 0) > 0) {
    insights.push({
      id: 'stuck',
      tone: 'danger',
      message: `${topStuck?.subject || 'N/A'} tiene ${Math.round(topStuck?.ratio || 0)}% de alumnos atascados`,
    })
  }

  if (nonStartedStudents > 0) {
    insights.push({
      id: 'not-started',
      tone: 'warning',
      message: `${nonStartedStudents} alumno(s) no han empezado ninguna práctica`,
    })
  }

  return insights
})

const averageProgressChart = computed(() => {
  const subjectsInCourse = courseSubjectsMap[selectedCourseLabel.value] || []
  const labels = Array.from(new Set(subjectsInCourse))

  const myColors: Record<string, string> = {}
  const data = labels.map((subject) => {
    const subjectRows = awsStore.studentProgressData.filter((row) => row.subject === subject)
    if (!subjectRows.length) {
      myColors[subject] = 'rgb(200,200,200)'
      return 0
    }

    const number = Number((subjectRows.reduce((sum, row) => sum + row.progress, 0) / subjectRows.length).toFixed(2))

    if (80 <= number && number <= 100) {
      myColors[subject] = 'rgb(34, 197, 94)'
    } else if (40 < number && number < 79) {
      myColors[subject] = 'rgb(250, 204, 21)'
    } else {
      myColors[subject] = 'rgb(249, 115, 22)'
    }

    return number
  })

  return {
    labels,
    datasets: [
      {
        label: 'Promedio de Avance (%)',
        backgroundColor: labels.map((subject) => myColors[subject]),
        // borderWidth: 1
        data,
      },
    ],
  }
})

const handleFilterApplied = async (filter: {
  from: number
  to: number
  course: string
  dateRange: { start: Date; end: Date } | null
}) => {
  hasSearched.value = true
  selectedCourseLabel.value = filter.course

  const rangeStart = filter.dateRange?.start ?? calculateRange().start
  const rangeEnd = filter.dateRange?.end ?? calculateRange().end
  const startDate = dayjs(rangeStart).format('YYYY-MM-DD')
  const endDate = dayjs(rangeEnd).format('YYYY-MM-DD')

  const selectedCourseSubjects = courseSubjectsMap[filter.course] || []
  const normalizedSubjects = Array.from(new Set(selectedCourseSubjects))

  if (authStore.isProfessor) {
    selectedStudentsFrom.value = filter.from
    selectedStudentsTo.value = filter.to

    await awsStore.fetchStudentProgressByRangeForSubjects(
      filter.from,
      filter.to + 1,
      normalizedSubjects,
      startDate,
      endDate,
    )
    return
  }

  const currentUsername = authStore.username
  const studentUsers = awsStore.allUsers.filter((u) => u.startsWith('alucloud'))
  const currentUserPosition = studentUsers.indexOf(currentUsername)

  selectedStudentsFrom.value = currentUserPosition
  selectedStudentsTo.value = currentUserPosition

  await awsStore.fetchStudentProgressByRangeForSubjects(
    currentUserPosition,
    currentUserPosition + 1,
    normalizedSubjects,
    startDate,
    endDate,
  )
}

onMounted(async () => {
  if (authStore.isProfessor && awsStore.allUsers.length === 0) {
    await awsStore.getAllUsers()
  }
})
</script>

<style scoped src="./SearchByCourse.css" />
