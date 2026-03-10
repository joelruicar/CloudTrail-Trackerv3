<template>
  <VaCard class="p-4">
    <h1 class="text-2xl font-bold mb-4">Dashboard</h1>
    <div class="widget-container mb-4">
      <VaProgressCircle v-if="loading" indeterminate />
      <DashboardInfoWidgets v-else />
    </div>
    <VaSelect v-model="timeRange" :options="options" label="Select time range" class="mb-4 date-select" />
    <VaDivider v-if="loading" indeterminate />
    <div v-else class="main-content-grid">
      <div class="charts-column">
        <VaCard class="mb-4 chart-card">
          <VaCardTitle>AWS services used in the last hour</VaCardTitle>
          <VaCardContent>
            <Chart title="" />
          </VaCardContent>
        </VaCard>

        <VaCard class="chart-card">
          <VaCardTitle>Users who have used AWS services</VaCardTitle>
          <VaCardContent>
            <!-- <UserChart />  -->
          </VaCardContent>
        </VaCard>
      </div>
      <VaCard class="full-height-card">
        <VaCardContent>
          <div class="table-container">
            <div class="table-toolbar">
              <VaInput v-model="searchQuery" placeholder="Buscar eventos..." class="search-input" clearable>
                <template #prependInner>
                  <VaIcon name="search" />
                </template>
              </VaInput>

              <VaSelect v-model="perPage" :options="[10, 25, 50, 100]" label="Items por página" class="page-select" />
            </div>

            <VaDataTable
              :items="awsStore.events"
              :columns="columns"
              :filter="searchQuery"
              :per-page="perPage"
              :current-page="currentPage"
              hoverable
            />
            <div class="pagination-footer">
              <VaPagination v-model="currentPage" :pages="pages" color="primary" size="small" />
            </div>
          </div>
        </VaCardContent>
      </VaCard>
    </div>
  </VaCard>
</template>

<script setup lang="ts">
import DashboardInfoWidgets from './DashboardInfoWidgets.vue'
import { VaDataTable, VaCard, VaSelect, VaProgressCircle } from 'vuestic-ui'
import { useAwsStore } from '../../stores/aws'
import { ref, onMounted, watch } from 'vue'
import Chart from '../data/Chart.vue'
import { computed } from 'vue'

const options = ['last hour', 'last six hours', 'last day', 'last week']
const awsStore = useAwsStore()
const timeRange = ref('last hour')
const searchQuery = ref('')
const perPage = ref(10)
const currentPage = ref(1)

const columns = [
  { key: 'id', label: '#', sortable: true },
  { key: 'userIdentity_userName', label: 'User', sortable: true },
  { key: 'eventName', label: 'EventName', sortable: true },
  { key: 'eventTime', label: 'Timestamp', sortable: true },
]

const loading = computed(() => awsStore.loading)

const pages = computed(() => {
  return Math.ceil(awsStore.events.length / perPage.value)
})
watch(timeRange, (newValue) => {
  awsStore.fetchDashboardData(newValue)
})
onMounted(() => {
  awsStore.fetchDashboardData(timeRange.value)
})
</script>

<style scoped>
.dashboard-layout {
  padding: 1.5rem;
  background-color: #f4f6f8;
}

.main-content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  align-items: start;
}

.charts-column {
  display: flex;
  flex-direction: column;
}

.chart-card {
  border-radius: 15px;
  background: white;
}

.table-column {
  height: 100%;
}

.full-height-card {
  height: 100%;
  border-radius: 15px;
}

.search-input {
  max-width: 200px;
}

:deep(.date-select) {
  max-width: 250px;
}
@media (max-width: 1024px) {
  .main-content-grid {
    grid-template-columns: 1fr;
  }
}
.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.search-input {
  width: 300px;
}

.page-select {
  width: 150px;
}

.pagination-footer {
  margin-top: 1rem;
  display: flex;
  justify-content: center;
}
</style>
