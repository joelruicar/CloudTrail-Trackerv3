<template>
  <div
    v-if="awsStore.loading"
    class="loading-overlay"
  >
    <VaProgressCircle
      indeterminate
      size="large"
    />
  </div>
  <VaCard
    v-else
    class="p-4"
  >
    <h1
      class="text-2xl font-bold mb-4" 
      style="color: var(--va-plain-text)"
    >
      Dashboard
    </h1>
    <InfoWidgets />
    <VaSelect
      v-model="timeRange"
      :options="options"
      label="Select time range"
      class="date-select"
    />
    <div class="charts-column">
      <VaCard class="hart-card">
        <VaCardTitle style="color: var(--va-chart-title)">
          AWS services used in the last hour
        </VaCardTitle>
        <Chart
          :chart-data="awsStore.chartDataServices"
          x-axis="Services"
          y-axis="#times"
        />
      </VaCard>
      <VaCard class="chart-card">
        <VaCardTitle style="color: var(--va-chart-title)">
          Users who have used AWS services
        </VaCardTitle>
        <Chart
          :chart-data="awsStore.chartDataUsers"
          x-axis="Users"
          y-axis="#times"
        />
      </VaCard>
    </div>
    <VaButton
      color="buttonColor"
      @click="display = !display"
    >
      Details
    </VaButton>
    <Transition
      name="expand"
      @afterEnter="handleAfterEnter"
    >
      <Table
        v-if="!display"
        ref="eventsTable"
        :items="awsStore.formattedEvents"
        :columns="eventColumns"
        :loading="awsStore.loading"
        :enable-event-link-with-popover="true"
      />
    </Transition>
  </VaCard>
</template>

<script setup lang="ts">
import { VaCard, VaSelect, VaProgressCircle } from 'vuestic-ui'
import InfoWidgets from '../../components/InfoWidgets.vue'
import { useAwsStore } from '../../stores/aws'
import { ref, onMounted, watch } from 'vue'
import Chart from '../../components/Chart.vue'
import Table from '../../components/Table.vue'

const eventColumns = [
  { key: 'id', label: '#', sortable: true },
  { key: 'user', label: 'User', sortable: true },
  { key: 'eventName', label: 'Event', sortable: true },
  { key: 'formatedTime', label: 'Timestamp', sortable: true },
]

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

<style scoped src="./Dashboard.css" />
