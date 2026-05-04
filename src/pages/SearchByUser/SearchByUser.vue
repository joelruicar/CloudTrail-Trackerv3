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
  <template v-else>
    <h1
      class="sm:text-2xl font-bold text-center"
      style="color: var(--va-plain-text)"
    >
      Search by User
    </h1>
    <div
      class="p-4 widgets-card mb-4"
      @click.capture="onWidgetsAreaClick"
    >
      <InfoWidgets />
    </div>

    <VaCard class="p-2 sm:p-4 overflow-visible">
      <div class="search-controls mb-6">
        <div class="user-select-fixed">
          <VaSelect
            v-if="authStore.isProfessor"
            ref="userSelect"
            v-model="user_name"
            label="USERNAME"
            :options="filteredOptions"
            autocomplete
            :text-by="getUserOptionText"
            :value-by="getUserOptionText"
            @focus="openAllOptions"
            @click="openAllOptions"
            @update:search="userSearch = $event"
          >
            <template #option-content="{ option }">
              <span class="select-option-text">
                <template
                  v-for="(part, index) in getHighlightedParts(option)"
                  :key="`${getUserOptionText(option)}-${index}`"
                >
                  <span :class="{ 'select-option-match': part.match }">{{ part.text }}</span>
                </template>
              </span>
            </template>
          </VaSelect>
          <VaInput
            v-else
            :model-value="currentUser"
            label="USERNAME"
            readonly
          />
        </div>
        <div class="date-filter-fixed">
          <DateFilter v-model="range" />
        </div>
        <VaButton
          icon="search"
          color="buttonColor"
          class="search-button-fixed"
          @click="search"
        >
          Search
        </VaButton>
      </div>

      <div class="charts-column mb-4">
        <VaCard>
          <VaCardTitle style="color: var(--va-chart-title)">
            AWS services used in the last hour
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
          :enable-event-link-with-popover="true"
        />
      </Transition>
    </VaCard>
  </template>
</template>

<script setup lang="ts">
import { VaProgressCircle, VaButton, VaCard, VaCardTitle, VaInput } from 'vuestic-ui'
import { useAcademicYear } from '../../composables/useAcademicYear'
import { useUserSelect } from '../../composables/useUserSelect'
import { ref, onMounted, computed, nextTick } from 'vue'
import InfoWidgets from '../../components/InfoWidgets.vue'
import DateFilter from '../../components/DateFilter.vue'
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
const { range }  = useAcademicYear()
const currentUser = authStore.username

const user_name   = ref(currentUser)
const userSelect  = ref<any>(null)
const display     = ref(true)
const searchQuery = ref('')
const eventsTable = ref<InstanceType<typeof Table> | null>(null)

const { userSearch, filteredOptions, getUserOptionText, getHighlightedParts } = useUserSelect(
  computed(() => awsStore.allUsers),
  currentUser,
)

const openAllOptions = () => {
  userSearch.value = ''
  userSelect.value?.showDropdown?.()
}

const getDateStrings = () => ({
  startStr: dayjs(range.value.start).format('YYYY-MM-DDTHH:mm:ss'),
  endStr:   dayjs(range.value.end).format('YYYY-MM-DDTHH:mm:ss'),
})

const search = () => {
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