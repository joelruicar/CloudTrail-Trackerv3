<template>
  <div v-if="awsStore.loading" class="loading-overlay">
    <VaProgressCircle indeterminate size="large" />
  </div>
  <VaCard v-else class="p-4">
    <h1 class="text-2xl font-bold mb-4">Dashboard</h1>
    <InfoWidgets />
    <VaSelect v-model="timeRange" :options="options" label="Select time range" class="date-select" />
    <div class="charts-column">
      <VaCard class="hart-card">
        <VaCardTitle>AWS services used in the last hour</VaCardTitle>
        <Chart :chart-data="awsStore.chartDataServices" x-axis="Services" />
      </VaCard>
      <VaCard class="chart-card">
        <VaCardTitle>Users who have used AWS services</VaCardTitle>
        <Chart :chart-data="awsStore.chartDataUsers" x-axis="Users" />
      </VaCard>
    </div>
    <VaButton color="primary" @click="display = !display">Details</VaButton>
    <Transition name="expand" @afterEnter="handleAfterEnter">
      <Table v-if="!display" ref="eventsTable" />
    </Transition>
  </VaCard>
</template>

<script setup lang="ts">
import { VaCard, VaSelect, VaProgressCircle } from 'vuestic-ui'
import InfoWidgets from '../data/InfoWidgets.vue'
import { useAwsStore } from '../../stores/aws'
import { ref, onMounted, watch } from 'vue'
import Chart from '../data/Chart.vue'
import Table from '../data/Table.vue'

const options = ['last hour', 'last six hours', 'last day', 'last week']
const timeRange = ref('last hour')
const display = ref(true)

const awsStore = useAwsStore()
watch(timeRange, (newValue) => {
  awsStore.fetchDashboardData(newValue)
})
onMounted(() => {
  awsStore.fetchDashboardData(timeRange.value)
})

const eventsTable = ref<InstanceType<typeof Table> | null>(null)

const handleAfterEnter = () => {
  eventsTable.value?.scrollToTable()
}
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

:deep(.date-select) {
  max-width: 250px;
  margin-top: 1%;
}
@media (max-width: 1024px) {
  .main-content-grid {
    grid-template-columns: 1fr;
  }
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;

  display: flex;
  justify-content: center;
  align-items: center;
}

.search-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.expand-enter-active,
.expand-leave-active {
  transition: all 0.1s ease-in-out;
  overflow: hidden;
  max-height: 1000px;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
  margin-top: 0;
  margin-bottom: 0;
}
</style>
