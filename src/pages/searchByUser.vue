<template>
  <div v-if="awsStore.loading" class="loading-overlay">
    <VaProgressCircle indeterminate size="large" />
  </div>

  <VaCard v-else class="p-4 overflow-visible">
    <h1 class="text-2xl font-bold mb-4">Search by user</h1>
    <InfoWidgets class="mb-4" />

    <div class="flex flex-row items-end gap-4 mb-6 relative">
      <VaSelect
        ref="userSelect"
        v-model="user_name"
        v-model:search="autoCompleteSearchValue"
        label="USERNAME"
        :options="awsStore.allUsers"
        autocomplete
        @focus="userSelect?.showDropdown()"
      />
      <DateFilter v-model="range" />
      <VaButton icon="search" class="mb-1" @click="search"> Search </VaButton>
    </div>
    <div class="charts-column mb-4">
      <VaCard>
        <VaCardTitle>AWS services used in the last hour</VaCardTitle>
        <Chart :chart-data="awsStore.chartDataServices" x-axis="Services" />
      </VaCard>
    </div>
    <VaButton color="primary" @click="display = !display">Details</VaButton>
    <Transition name="expand" @afterEnter="handleAfterEnter">
      <Table v-if="!display" ref="eventsTable" />
    </Transition>
  </VaCard>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAwsStore } from '../stores/aws'
import { useAuthStore } from '../stores/auth'
import DateFilter from './data/DateFilter.vue'
import { VaProgressCircle, VaButton, VaCard, VaCardTitle } from 'vuestic-ui'
import InfoWidgets from './data/InfoWidgets.vue'
import Chart from './data/Chart.vue'
import Table from './data/Table.vue'
import dayjs from 'dayjs'
const authStore = useAuthStore()
const awsStore = useAwsStore()
const userSelect = ref<any>(null)
const currentUser = authStore.username
const user_name = ref(currentUser)
const now = new Date()
const currYear = now.getFullYear()
const currMonth = now.getMonth()

const display = ref(true)
const autoCompleteSearchValue = ref('')
let startDateDefault: Date
let endDateDefault: Date

if (currMonth >= 8) {
  startDateDefault = new Date(currYear, 8, 1)
  endDateDefault = new Date(currYear + 1, 6, 31)
} else {
  startDateDefault = new Date(currYear - 1, 8, 1)
  endDateDefault = new Date(currYear, 6, 31)
}

const range = ref({ start: startDateDefault, end: endDateDefault })

const search = () => {
  const startStr = dayjs(range.value.start).format('YYYY-MM-DDTHH:mm:ss')
  const endStr = dayjs(range.value.end).format('YYYY-MM-DDTHH:mm:ss')
  if (user_name.value) {
    awsStore.fetchUserDashboardData(user_name.value, startStr, endStr)
  } else {
    awsStore.fetchUserDashboardData(currentUser, startStr, endStr)
  }
}

onMounted(async () => {
  const startStr = dayjs(range.value.start).format('YYYY-MM-DDTHH:mm:ss')
  const endStr = dayjs(range.value.end).format('YYYY-MM-DDTHH:mm:ss')
  awsStore.fetchUserDashboardData(currentUser, startStr, endStr)
  if (authStore.isProfessor) {
    await awsStore.getAllUsers()
    autoCompleteSearchValue.value = currentUser
  } else {
    awsStore.allUsers = [authStore.username]
    user_name.value = authStore.username
    autoCompleteSearchValue.value = currentUser
  }
})

const eventsTable = ref<InstanceType<typeof Table> | null>(null)
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

/* Forzamos a que el contenedor interno de Vuestic también se encoja */
:deep(.va-input-wrapper) {
  min-width: 0 !important;
  width: 20% !important;
}
</style>
