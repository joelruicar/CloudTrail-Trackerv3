<template>
  <div v-if="awsStore.loading" class="loading-overlay">
    <VaProgressCircle indeterminate size="large" />
  </div>
  <VaCard v-else class="p-4">
    <h1 class="text-2xl font-bold mb-4">Search by user</h1>
    <InfoWidgets />
    <VaCheckbox v-model="checked" label="Show dates" />
    <VaDatePicker
      v-if="checked"
      v-model="range"
      mode="range"
      columns="2"
      label="Select time range"
      class="date-select mb-4"
    />
    <div class="charts-column mb-4">
      <VaCard class="chart-card">
        <VaCardTitle>AWS services used in the last hour</VaCardTitle>
        <Chart :chart-data="awsStore.chartDataServices" x-axis="Services" />
      </VaCard>
    </div>
    <div class="flex gap-4">
      <VaButton @click="search">Search</VaButton>
      <VaButton color="primary" @click="display = !display">
        {{ display ? 'Show Details' : 'Hide Details' }}
      </VaButton>
    </div>
    <Transition name="expand" @afterEnter="handleAfterEnter">
      <Table v-if="!display" ref="eventsTable" />
    </Transition>
  </VaCard>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAwsStore } from '../stores/aws'
import { useAuthStore } from '../stores/auth'
import { VaDatePicker, VaProgressCircle, VaButton, VaCheckbox, VaCard, VaCardTitle } from 'vuestic-ui'
import InfoWidgets from './data/InfoWidgets.vue'
import Chart from './data/Chart.vue'
import Table from './data/Table.vue'
import dayjs from 'dayjs'

const authStore = useAuthStore()
const awsStore = useAwsStore()

const checked = ref(false)
const display = ref(true)
const eventsTable = ref<InstanceType<typeof Table> | null>(null)
const currentUser = authStore.username

// --- Lógica de fechas iniciales ---
const now = new Date()
const currYear = now.getFullYear()
const currMonth = now.getMonth() // 0 = Enero, 8 = Septiembre

let startDateDefault: Date
let endDateDefault: Date

if (currMonth >= 8) {
  // Septiembre o posterior
  startDateDefault = new Date(currYear, 8, 1)
  endDateDefault = new Date(currYear + 1, 6, 31)
} else {
  // Antes de Septiembre
  startDateDefault = new Date(currYear - 1, 8, 1)
  endDateDefault = new Date(currYear, 6, 31)
}

// El ref 'range' es el que se vincula al DatePicker
const range = ref({ start: startDateDefault, end: endDateDefault })

// --- Función de búsqueda ---
const search = () => {
  // Calculamos los strings formateados justo en el momento del click
  const startStr = dayjs(range.value.start).format('YYYY-MM-DDTHH:mm:ss')
  const endStr = dayjs(range.value.end).format('YYYY-MM-DDTHH:mm:ss')

  awsStore.fetchUserDashboardData(currentUser, startStr, endStr)
}

const handleAfterEnter = () => {
  eventsTable.value?.scrollToTable()
}
</script>

<style scoped>
.loading-overlay {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
.expand-enter-active,
.expand-leave-active {
  transition: all 0.5s ease;
  overflow: hidden;
}
.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
}
</style>
