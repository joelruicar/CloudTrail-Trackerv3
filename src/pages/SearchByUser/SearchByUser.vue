<template>
  <div
    v-if="awsStore.loading"
    class="loading-overlay"
  >
    <AtomSpinner
      :animation-duration="1000"
      :size="60"
      color="var(--va-primary)"
    />
  </div>
  <template v-else>
    <div class="page-shell">
      <h1 class="page-title">
        Search by User
      </h1>
      <div
        class="p-4 widgets-card mb-4"
        @click.capture="onWidgetsAreaClick"
      >
        <InfoWidgets />
      </div>

      <VaCard class="page-card p-2 sm:p-4 overflow-visible">
        <div class="search-controls mb-6">
          <div class="user-select-fixed">
            <UserSearchSelector
              v-model="user_name"
              :all-users="awsStore.allUsers"
            />
          </div>
          <div class="date-filter-fixed">
            <DateFilter
              v-model="range"
              v-model:enabled="dateFilterEnabled"
            />
          </div>
          <VaButton
            icon="search"
            color="buttonColor"
            class="search-button-fixed form-action-button"
            @click="search"
          >
            Search
          </VaButton>
        </div>

        <div class="charts-column mb-4">
          <VaCard>
            <VaCardTitle style="color: var(--va-chart-title)">
              Services used by {{ appliedUserName }}
            </VaCardTitle>
            <Chart
              :chart-data="awsStore.chartDataServices"
              x-axis="Services"
              y-axis="#times"
              @barClick="handleBarClick"
            />
          </VaCard>
        </div>

        <VaButton
          color="buttonColor"
          class="details-button"
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
            v-model:filter="searchQuery"
            :items="awsStore.formattedEvents"
            :columns="eventColumns"
            :loading="awsStore.loading"
            :enable-event-link="true"
          />
        </Transition>
      </VaCard>
    </div>
  </template>
</template>

<script setup lang="ts">
import { VaButton, VaCard, VaCardTitle } from 'vuestic-ui'
import { useAcademicYear } from '../../composables/useAcademicYear'
import { ref, onMounted, nextTick } from 'vue'
import { AtomSpinner } from 'epic-spinners'
import InfoWidgets from '../../components/InfoWidgets.vue'
import DateFilter from '../../components/DateFilter.vue'
import UserSearchSelector from '../../components/UserSearchSelector.vue'
import { useAuthStore } from '../../stores/auth'
import { useAwsStore } from '../../stores/aws'
import { useRoute } from 'vue-router'
import Chart from '../../components/Chart.vue'
import Table from '../../components/Table.vue'
import dayjs from 'dayjs'

const eventColumns = [
  { key: 'id',           label: '#',         sortable: true },
  { key: 'user',         label: 'User',       sortable: true },
  { key: 'eventName',    label: 'Event',      sortable: true },
  { key: 'formatedTime', label: 'Timestamp',  sortable: true },
]

const WIDGET_EVENT_MAP: Record<string, string> = {
  runInstances:       'RunInstances',
  createDBInstance:   'CreateDBInstance',
  createFunction:     'CreateFunction',
  createLoadBalancer: 'CreateLoadBalancer',
}

const authStore  = useAuthStore()
const awsStore   = useAwsStore()
const route      = useRoute()
const { range, calculateRange } = useAcademicYear()
const currentUser = authStore.username

const user_name   = ref(currentUser)
const appliedUserName = ref(currentUser)
const display     = ref(true)
const searchQuery = ref('')
const eventsTable = ref<InstanceType<typeof Table> | null>(null)
const dateFilterEnabled = ref(true)

const getDateStrings = () => {
  const activeRange = dateFilterEnabled.value ? range.value : calculateRange()
  return {
    startStr: dayjs(activeRange.start).format('YYYY-MM-DDTHH:mm:ss'),
    endStr:   dayjs(activeRange.end).format('YYYY-MM-DDTHH:mm:ss'),
  }
}

const search = () => {
  appliedUserName.value = user_name.value || currentUser
  const { startStr, endStr } = getDateStrings()
  awsStore.fetchUserDashboardData(user_name.value || currentUser, startStr, endStr)
}

const handleAfterEnter = () => eventsTable.value?.scrollToTable()

const handleBarClick = (label: string) => {
  searchQuery.value = searchQuery.value === label ? '' : label
  display.value = false
  nextTick(() => eventsTable.value?.scrollToTable())
}

const onWidgetsAreaClick = (event: MouseEvent) => {
  const card = (event.target as HTMLElement).closest('.metric-card')
  if (!card) return
  const eventName = WIDGET_EVENT_MAP[card.getAttribute('data-store-key') || '']
  if (!eventName) return
  searchQuery.value = searchQuery.value === eventName ? '' : eventName
  display.value = false
  nextTick(() => eventsTable.value?.scrollToTable())
}

onMounted(async () => {
  const routeUser = Array.isArray(route.query.user) ? route.query.user[0] : route.query.user
  user_name.value = authStore.isProfessor && routeUser ? String(routeUser) : currentUser
  appliedUserName.value = user_name.value

  const { startStr, endStr } = getDateStrings()
  awsStore.fetchUserDashboardData(user_name.value, startStr, endStr)

  if (authStore.isProfessor) {
    await awsStore.getAllUsers()
  } else {
    awsStore.allUsers = [authStore.username]
  }
})
</script>

<style scoped src="./SearchByUser.css" />