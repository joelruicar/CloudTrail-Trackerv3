<template>
  <div v-if="awsStore.loading" class="loading-overlay">
    <VaProgressCircle indeterminate size="large" />
  </div>

  <VaCard v-else class="p-2 sm:p-4 overflow-visible">
    <h1 class="text-xl sm:text-2xl font-bold mb-4">Search by user</h1>
    <InfoWidgets class="mb-4" />

    <div class="search-controls mb-6">
      <div class="user-select-fixed">
        <VaSelect
          ref="userSelect"
          v-model="user_name"
          label="USERNAME"
          :options="selectOptions"
          searchable
          :highlight-matched-text="false"
          @focus="userSelect?.showDropdown()"
        >
          <template #option-content="{ option }">
            <span class="select-option-text">{{ getUserOptionText(option) }}</span>
          </template>
        </VaSelect>
      </div>
      <div class="date-filter-fixed">
        <DateFilter v-model="range" />
      </div>
      <VaButton icon="search" class="search-button-fixed" @click="search"> Search </VaButton>
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
import { ref, onMounted, computed } from 'vue'
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

const selectOptions = computed(() => {
  if (awsStore.allUsers.length) {
    return awsStore.allUsers
  }

  return user_name.value ? [user_name.value] : []
})

const getUserOptionText = (option: unknown) => {
  if (typeof option === 'string') return option
  if (option && typeof option === 'object' && 'text' in option) {
    return String((option as { text: unknown }).text ?? '')
  }
  return String(option ?? '')
}

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
  } else {
    awsStore.allUsers = [authStore.username]
    user_name.value = authStore.username
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
.search-controls {
  display: grid;
  grid-template-columns: 450px 20px 320px 200px auto;
  align-items: end;
  width: 100%;
  margin-bottom: 1.5rem;
}

.user-select-fixed {
  grid-column: 1;
}

.date-filter-fixed {
  grid-column: 3;
  width: 320px;
  display: flex;
  align-items: center;
  min-height: 38px;
}

.search-button-fixed {
  grid-column: 5;
  height: 36px;
  white-space: nowrap;
  width: fit-content;
}

@media (max-width: 1100px) {
  .search-controls {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .user-select-fixed,
  .date-filter-fixed {
    width: 100%;
    grid-column: auto;
  }

  .date-filter-fixed {
    height: auto;
  }

  .search-button-fixed {
    grid-column: auto;
    width: 100%;
    margin-top: 8px;
  }
}

:deep(.va-input-wrapper) {
  width: 100% !important;
}

.select-option-text {
  color: var(--va-text-primary);
}
</style>
