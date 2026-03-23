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
          v-model:search="userSearch"
          label="USERNAME"
          :options="selectOptions"
          searchable
          :highlight-matched-text="false"
          @focus="handleSelectFocus"
          @open="focusSearchInput"
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
      </div>
      <div class="date-filter-fixed">
        <DateFilter v-model="range" />
      </div>
      <VaButton icon="search" class="search-button-fixed" @click="search"> Search </VaButton>
    </div>
    <div class="charts-column mb-4">
      <VaCard>
        <VaCardTitle>AWS services used in the last hour</VaCardTitle>
        <Chart :chart-data="awsStore.chartDataServices" x-axis="Services" y-axis="#times" />
      </VaCard>
    </div>
    <VaButton color="primary" @click="display = !display">Details</VaButton>
    <Transition name="expand" @afterEnter="handleAfterEnter">
      <Table v-if="!display" ref="eventsTable" />
    </Transition>
  </VaCard>
</template>

<script setup lang="ts">
import { VaProgressCircle, VaButton, VaCard, VaCardTitle } from 'vuestic-ui'
import { useAcademicYear } from '../composables/useAcademicYear'
import { ref, onMounted, computed, nextTick } from 'vue'
import InfoWidgets from '../components/InfoWidgets.vue'
import DateFilter from '../components/DateFilter.vue'
import { useAuthStore } from '../stores/auth'
import { useAwsStore } from '../stores/aws'
import Chart from '../components/Chart.vue'
import Table from '../components/Table.vue'
import dayjs from 'dayjs'
const authStore = useAuthStore()
const awsStore = useAwsStore()
const { range } = useAcademicYear()
const currentUser = authStore.username
const user_name = ref(currentUser)
const userSelect = ref<any>(null)
const userSearch = ref('')
const display = ref(true)

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

const getHighlightedParts = (option: unknown) => {
  const text = getUserOptionText(option)
  const query = userSearch.value.trim()

  if (!query) return [{ text, match: false }]

  const lowerText = text.toLowerCase()
  const lowerQuery = query.toLowerCase()
  const parts: Array<{ text: string; match: boolean }> = []

  let from = 0
  while (from < text.length) {
    const index = lowerText.indexOf(lowerQuery, from)

    if (index === -1) {
      parts.push({ text: text.slice(from), match: false })
      break
    }

    if (index > from) {
      parts.push({ text: text.slice(from, index), match: false })
    }

    parts.push({ text: text.slice(index, index + query.length), match: true })
    from = index + query.length
  }

  return parts
}

const handleSelectFocus = async () => {
  userSelect.value?.showDropdown()
}

const focusSearchInput = async () => {
  await nextTick()
  const searchInput = document.querySelector('[data-testid="searchInput"]') as HTMLInputElement
  if (searchInput) {
    searchInput.focus()
    return
  }
  const dropdown = document.querySelector('[role="listbox"]')
  if (dropdown && dropdown.parentElement) {
    const inputs = dropdown.parentElement.querySelectorAll('input')
    if (inputs.length > 0) {
      ;(inputs[0] as HTMLInputElement).focus()
    }
  }
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

const eventsTable = ref<InstanceType<typeof Table> | null>(null)
const handleAfterEnter = () => {
  eventsTable.value?.scrollToTable()
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

.select-option-match {
  color: var(--va-primary);
  font-weight: 600;
  text-decoration: underline;
  text-decoration-color: #f59e0b;
  text-decoration-thickness: 2px;
}
</style>
