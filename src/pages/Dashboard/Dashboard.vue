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
  <template v-else-if="awsStore.events && awsStore.events.length > 0">
    <h1
      class="sm:text-4xl font-bold  mb-3"
      style="color: var(--va-heading)"
    >
      Dashboard
    </h1>
    <div
      class="p-4 widgets-card"
      @click.capture="onWidgetsAreaClick"
    >
      <InfoWidgets />
    </div>

   
    <div class="charts-column">
      <VaCard class="hart-card">
        <VaSelect
          v-model="timeRange"
          :options="options"
          label="Select time range"
          class="date-select"
        />
        <VaCardTitle style="color: var(--va-chart-title)">
          AWS services used in the last hour
        </VaCardTitle>
        <Chart
          :chart-data="awsStore.chartDataServices"
          x-axis="Services"
          y-axis="#times"
          @barClick="handleBarClick"
        />
        <VaCardTitle style="color: var(--va-chart-title)">
          Users who have used AWS services
        </VaCardTitle>
        <Chart
          :chart-data="awsStore.chartDataUsers"
          x-axis="Users"
          y-axis="#times"
          @barClick="handleBarClick"
        />
        <VaButton
          color="buttonColor"
          class="mb-4 details-button"
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
              ref="eventsTable"
              v-model:filter="searchQuery"
              :items="awsStore.formattedEvents"
              :columns="eventColumns"
              :loading="awsStore.loading"
              :enable-event-link-with-popover="true"
            />
          </div>
        </Transition>
      </VaCard>
    </div>   
  </template>
</template>

<script setup lang="ts">
import { VaCard, VaSelect, VaProgressCircle } from 'vuestic-ui'
import InfoWidgets from '../../components/InfoWidgets.vue'
import { useAwsStore } from '../../stores/aws'
import { ref, onMounted, watch, nextTick } from 'vue'
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
const tableContainerRef = ref<HTMLElement | null>(null)

const searchQuery = ref('')
const widgetEventFilterMap: Record<string, string> = {
  runInstances: 'RunInstances',
  createDBInstance: 'CreateDBInstance',
  createFunction: 'CreateFunction',
  createLoadBalancer: 'CreateLoadBalancer',
}

function onWidgetsAreaClick(event: MouseEvent) {
  const card = (event.target as HTMLElement).closest('.metric-card')
  if (!card) return

  const storeKey = card.getAttribute('data-store-key')
  const eventName = storeKey ? widgetEventFilterMap[storeKey] : undefined
  if (!eventName) return

  searchQuery.value = searchQuery.value === eventName ? '' : eventName
  display.value = false

  nextTick(() => {
    eventsTable.value?.scrollToTable?.()
  })
}

const handleBarClick = (label: string) => {
  if (searchQuery.value === label) {
    searchQuery.value = ''
  } else {
    searchQuery.value = label
  }
  display.value = false
  nextTick(() => tableContainerRef.value?.scrollIntoView({ behavior: 'smooth', block: 'end' }))
}

const handleAfterEnter = () => {
  eventsTable.value?.scrollToTable()
}
</script>

<style scoped src="./Dashboard.css" />
