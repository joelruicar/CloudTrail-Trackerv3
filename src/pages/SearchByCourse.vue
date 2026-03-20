<template>
  <div v-if="awsStore.loading" class="loading-overlay">
    <VaProgressCircle indeterminate size="large" />
  </div>
  <VaCard v-else class="p-2 sm:p-4 overflow-visible">
    <h1 class="text-xl sm:text-2xl font-bold mb-4">Search by course</h1>

    <RangeSelector
      :total-students="awsStore.allUsers.filter((u) => u.startsWith('alucloud')).length"
      :courses="courseOptions"
      @filterApplied="handleFilterApplied"
    />

    <div v-if="awsStore.studentProgressData.length" class="charts-column mb-4">
      <VaCard>
        <VaCardTitle> Promedio de Avance por Asignatura - {{ selectedCourseLabel || 'Sin curso' }} </VaCardTitle>
        <div class="progress-stats">
          <div class="stat-item">
            <span class="stat-label">Promedio:</span>
            <span class="stat-value">{{ awsStore.averageProgressByRange.toFixed(2) }}%</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Alumnos en rango:</span>
            <span class="stat-value">{{ selectedStudentsFrom }} - {{ selectedStudentsTo }}</span>
          </div>
        </div>
        <Chart :chart-data="averageProgressChart" x-axis="Asignatura" />
      </VaCard>
    </div>

    <div v-if="awsStore.studentProgressData.length" class="charts-column mb-4">
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
import { useAwsStore } from '../stores/aws'
import { useAcademicYear } from '../composables/useAcademicYear'
import RangeSelector from '../components/RangeSelector.vue'
import Chart from '../components/Chart.vue'
import { REFERDATA } from '../data/evenprac'
import dayjs from 'dayjs'

const awsStore = useAwsStore()
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

type SubjectWithPractices = {
  subject: string
  practices: Record<string, number>
}

const allSubjectsWithPractices: SubjectWithPractices[] = Object.entries(
  REFERDATA.REFERDATA as Record<string, Record<string, number>>,
).map(([subject, practices]) => ({ subject, practices }))

const courseExcludedSubjectsMap: Record<string, string[]> = {
  CursoCloudAWS: ['PL_EMR', 'PL_GRAVITON', 'PL_DATA_LAKE', 'PL_EVENTS_WORKFLOWS'],
  'MBDA-CGDNGB': [
    'PL_EMR',
    'PL_VPC',
    'PL_SERVERLESS_APP',
    'PL_DYNAMODB',
    'PL_CF',
    'PL_GRAVITON',
    'PL_DATA_LAKE',
    'PL_EVENTS_WORKFLOWS',
  ],
  'MBDA-MEGBD': [
    'PL_EC2',
    'PL_EC_S3',
    'PL_VPC',
    'PL_DYNAMODB',
    'PL_RDS',
    'PL_APP',
    'PL_CF',
    'PL_LAMBDA_SQS',
    'PL_SERVERLESS_APP',
    'PL_GRAVITON',
    'PL_DATA_LAKE',
    'PL_EVENTS_WORKFLOWS',
  ],
  'MUCNAP-ICP': ['PL_EMR', 'PL_SERVERLESS_APP', 'PL_GRAVITON', 'PL_DATA_LAKE', 'PL_EVENTS_WORKFLOWS'],
  'MUCNAP-CBD': [
    'PL_EC2',
    'PL_EC_S3',
    'PL_VPC',
    'PL_DYNAMODB',
    'PL_RDS',
    'PL_APP',
    'PL_CF',
    'PL_LAMBDA_SQS',
    'PL_SERVERLESS_APP',
    'PL_GRAVITON',
    'PL_DATA_LAKE',
    'PL_EVENTS_WORKFLOWS',
  ],
  'MUGI-SEN': ['PL_VPC', 'PL_SERVERLESS_APP', 'PL_GRAVITON', 'PL_DATA_LAKE', 'PL_EVENTS_WORKFLOWS'],
  'GII-LPP': [
    'PL_VPC',
    'PL_DYNAMODB',
    'PL_RDS',
    'PL_APP',
    'PL_CF',
    'PL_LAMBDA_SQS',
    'PL_EMR',
    'PL_SERVERLESS_APP',
    'PL_GRAVITON',
    'PL_DATA_LAKE',
    'PL_EVENTS_WORKFLOWS',
  ],
  'GCD-IPD': [
    'PL_VPC',
    'PL_DYNAMODB',
    'PL_RDS',
    'PL_APP',
    'PL_CF',
    'PL_LAMBDA_SQS',
    'PL_EMR',
    'PL_SERVERLESS_APP',
    'PL_GRAVITON',
    'PL_DATA_LAKE',
    'PL_EVENTS_WORKFLOWS',
  ],
  'MUCC-DDS': ['PL_DYNAMODB', 'PL_EMR', 'PL_SERVERLESS_APP', 'PL_GRAVITON', 'PL_DATA_LAKE', 'PL_EVENTS_WORKFLOWS'],
  'MUIS-DOS': [
    'PL_EMR',
    'PL_EC2_S3',
    'PL_VPC',
    'PL_RDS',
    'PL_SERVERLESS_APP',
    'PL_DYNAMODB',
    'PL_GRAVITON',
    'PL_DATA_LAKE',
    'PL_EVENTS_WORKFLOWS',
    'PL_APP',
  ],
  TCC: [
    'PL_EMR',
    'PL_EC2_S3',
    'PL_VPC',
    'PL_RDS',
    'PL_SERVERLESS_APP',
    'PL_DYNAMODB',
    'PL_APP',
    'PL_LAMBDA_SQS',
    'PL_CF',
  ],
}

const courseSubjectsMap: Record<string, SubjectWithPractices[]> = Object.fromEntries(
  Object.entries(courseExcludedSubjectsMap).map(([course, excludedSubjects]) => {
    const excluded = new Set(excludedSubjects.map(normalizeSubject))
    const included = allSubjectsWithPractices.filter((item) => !excluded.has(item.subject))
    return [course, included]
  }),
) as Record<string, SubjectWithPractices[]>

const courseSubjectNamesMap: Record<string, string[]> = Object.fromEntries(
  Object.entries(courseSubjectsMap).map(([course, items]) => [course, items.map((item) => item.subject)]),
) as Record<string, string[]>

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
      lastRelatedEventDate: lastEvent ? dayjs(lastEvent).format('YYYY-MM-DDTHH:mm:ss.SSS[Z]') : 'N/A',
    })
  })

  return rows
})

const pages = computed(() => Math.max(1, Math.ceil(practiceRows.value.length / perPage.value)))

const averageProgressChart = computed(() => {
  const subjectsInCourse = (courseSubjectNamesMap[selectedCourseLabel.value] || []).map(normalizeSubject)
  const labels = Array.from(new Set(subjectsInCourse))

  const data = labels.map((subject) => {
    const subjectRows = awsStore.studentProgressData.filter((row) => row.subject === subject)
    if (!subjectRows.length) return 0
    return Number((subjectRows.reduce((sum, row) => sum + row.progress, 0) / subjectRows.length).toFixed(2))
  })

  return {
    labels,
    datasets: [
      {
        label: 'Promedio de Avance (%)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgb(54, 162, 235)',
        borderWidth: 2,
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
  selectedStudentsFrom.value = filter.from
  selectedStudentsTo.value = filter.to
  const rangeStart = filter.dateRange?.start ?? calculateRange().start
  const rangeEnd = filter.dateRange?.end ?? calculateRange().end
  const startDate = dayjs(rangeStart).format('YYYY-MM-DD')
  const endDate = dayjs(rangeEnd).format('YYYY-MM-DD')

  const selectedCourseSubjects = (courseSubjectNamesMap[filter.course] || []).map(normalizeSubject)
  const normalizedSubjects = Array.from(new Set(selectedCourseSubjects))

  await awsStore.fetchStudentProgressByRangeForSubjects(
    filter.from,
    filter.to + 1,
    normalizedSubjects,
    startDate,
    endDate,
  )
}

onMounted(async () => {
  if (awsStore.allUsers.length === 0) {
    await awsStore.getAllUsers()
  }
})
</script>

<style scoped>
.loading-overlay {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.charts-column {
  margin-bottom: 2rem;
}

.progress-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: var(--va-background-element);
  border-radius: 0.5rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--va-text-secondary);
  font-weight: 500;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--va-primary);
}

.table-container {
  overflow-x: auto;
  margin-top: 1.5rem;
}

.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  gap: 1rem;
}

.search-input {
  width: 320px;
}

.per-page-label {
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}

.pagination-footer {
  margin-top: 1rem;
  display: flex;
  justify-content: center;
}

.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
}

.expand-enter-to,
.expand-leave-from {
  opacity: 1;
  max-height: 2000px;
}

@media (max-width: 768px) {
  .search-input {
    width: 100%;
  }

  .table-toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .stat-value {
    font-size: 1.25rem;
  }
}
</style>
