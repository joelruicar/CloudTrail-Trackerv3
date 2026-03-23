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
    <div v-else-if="awsStore.studentProgressData.length" class="mb-4">
      <VaCard>
        <VaCardTitle>
          Promedio de Avance por Práctica de laboratorio - {{ selectedCourseLabel || 'Sin curso' }}
        </VaCardTitle>
        <div class="progress-stats">
          <div class="stat-item">
            <span class="stat-label">Promedio:</span>
            <span class="stat-value">{{ awsStore.averageProgressByRange.toFixed(2) }}%</span>
          </div>
          <div v-if="selectedStudentsFrom == selectedStudentsTo" class="stat-item">
            <span class="stat-label">Alumno:</span>
            <span class="stat-value">alucloud{{ selectedStudentsFrom }}</span>
          </div>
          <div v-else class="stat-item">
            <span class="stat-label">Alumnos en rango:</span>
            <span class="stat-value">alucloud{{ selectedStudentsFrom }} - alucloud{{ selectedStudentsTo }}</span>
          </div>
        </div>
        <Chart :chart-data="averageProgressChart" x-axis="Práctica" y-axis="%" title="laboratory" />
      </VaCard>
    </div>
    <div v-if="studentCharts.length && selectedStudentsFrom != selectedStudentsTo" class="mb-4">
      <VaCard>
        <VaCardTitle>Progreso por Alumno</VaCardTitle>
        <p v-if="hiddenStudentChartsCount > 0" class="charts-note">
          Mostrando {{ studentCharts.length }} de {{ studentCharts.length + hiddenStudentChartsCount }} alumnos.
        </p>
        <div class="student-charts-grid">
          <VaCard v-for="student in studentCharts" :key="student.studentName" class="student-chart-card">
            <VaCardTitle>{{ student.studentName }} - {{ student.average.toFixed(2) }}%</VaCardTitle>
            <Chart :chart-data="student.chartData" x-axis="Práctica" y-axis="%" />
          </VaCard>
        </div>
      </VaCard>
    </div>
    <div v-if="awsStore.studentProgressData.length" class="mb-4">
      <VaButton color="primary" class="mb-4" @click="displayDetails = !displayDetails"> Details </VaButton>
      <Transition name="expand">
        <div v-if="!displayDetails" class="table-container">
          <VaCard>
            <VaCardTitle>Detalle por práctica</VaCardTitle>
            <div class="table-toolbar">
              <VaInput
                v-model="searchQuery"
                class="search-input"
                placeholder="Buscar práctica o usuario..."
                clearable
              />
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
import { ref, computed, onMounted } from 'vue'
import { useAwsStore } from '../../stores/aws'
import { useAuthStore } from '../../stores/auth'
import { useAcademicYear } from '../../composables/useAcademicYear'
import RangeSelector from '../../components/RangeSelector.vue'
import Chart from '../../components/Chart.vue'
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

const normalizeSubject = (subject: string) => {
  if (subject === 'PL_EC_S3') return 'PL_EC2_S3'
  return subject
}

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
const maxStudentCharts = 10

const allStudentCharts = computed(() => {
  const labels = Array.from(new Set((courseSubjectsMap[selectedCourseLabel.value] || []).map(normalizeSubject)))

  if (!labels.length || !awsStore.studentProgressData.length) {
    return [] as Array<{
      studentName: string
      average: number
      chartData: Record<string, unknown>
      studentIndex: number
    }>
  }

  const labelsSet = new Set(labels)
  const grouped = new Map<string, { studentIndex: number; values: Record<string, number> }>()

  for (const row of awsStore.studentProgressData) {
    const subject = normalizeSubject(row.subject)
    if (!labelsSet.has(subject)) continue

    if (!grouped.has(row.studentName)) {
      grouped.set(row.studentName, { studentIndex: row.studentIndex, values: {} })
    }

    grouped.get(row.studentName)!.values[subject] = Number(row.progress.toFixed(2))
  }

  return Array.from(grouped.entries())
    .map(([studentName, payload], index) => {
      const data = labels.map((subject) => payload.values[subject] ?? 0)
      const average = data.length ? data.reduce((sum, value) => sum + value, 0) / data.length : 0
      const hue = (index * 47) % 360

      return {
        studentName,
        studentIndex: payload.studentIndex,
        average,
        chartData: {
          labels,
          datasets: [
            {
              label: 'Avance (%)',
              data,
              backgroundColor: `hsla(${hue}, 80%, 70%, 0.35)`,
              borderColor: `hsla(${hue}, 80%, 35%, 1)`,
              borderWidth: 1,
            },
          ],
        },
      }
    })
    .sort((a, b) => a.studentIndex - b.studentIndex)
})

const studentCharts = computed(() => allStudentCharts.value.slice(0, maxStudentCharts))
const hiddenStudentChartsCount = computed(() => Math.max(0, allStudentCharts.value.length - studentCharts.value.length))

const averageProgressChart = computed(() => {
  const subjectsInCourse = (courseSubjectsMap[selectedCourseLabel.value] || []).map(normalizeSubject)
  const labels = Array.from(new Set(subjectsInCourse))

  const myColors: Record<string, string> = {}
  const borderColor: Record<string, string> = {}

  const data = labels.map((subject) => {
    const subjectRows = awsStore.studentProgressData.filter((row) => row.subject === subject)
    if (!subjectRows.length) {
      myColors[subject] = 'rgba(200,200,200,0.2)'
      borderColor[subject] = 'rgba(120,120,120,1)'
      return 0
    }

    const number = Number((subjectRows.reduce((sum, row) => sum + row.progress, 0) / subjectRows.length).toFixed(2))

    if (80 <= number && number <= 100) {
      myColors[subject] = 'rgba(74,227,135,0.2)'
      borderColor[subject] = 'rgba(0,102,0,1)'
    } else if (40 < number && number < 79) {
      myColors[subject] = 'rgba(214,236,97,1)'
      borderColor[subject] = 'rgba(255,102,0,1)'
    } else {
      myColors[subject] = 'rgba(255,51,0,0.2)'
      borderColor[subject] = 'rgba(255,51,0,1)'
    }

    return number
  })

  return {
    labels,
    datasets: [
      {
        label: 'Promedio de Avance (%)',
        backgroundColor: labels.map((subject) => myColors[subject]),
        borderColor: labels.map((subject) => borderColor[subject]),
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
  selectedCourseLabel.value = filter.course

  const rangeStart = filter.dateRange?.start ?? calculateRange().start
  const rangeEnd = filter.dateRange?.end ?? calculateRange().end
  const startDate = dayjs(rangeStart).format('YYYY-MM-DD')
  const endDate = dayjs(rangeEnd).format('YYYY-MM-DD')

  const selectedCourseSubjects = (courseSubjectsMap[filter.course] || []).map(normalizeSubject)
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
