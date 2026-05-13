<template>
  <div
    v-if="store.loadingInitial"
    class="loading-overlay"
  >
    <AtomSpinner
      :animation-duration="1000"
      :size="60"
      color="var(--va-primary)"
    />
  </div>

  <div
    v-else
    class="page-shell p-4"
  >
    <h1 class="page-title text-center">
      Oteador
    </h1>
    <div
      class="widgets-click-wrapper"
      @click.capture="onWidgetsAreaClick"
    >
      <InfoWidgets source="oteador" />
    </div>

    <VaCard class="page-card mt-4">
      <VaCardContent>
        <div class="filters-row mb-4">
          <div class="filter-field">
            <label
              style="color: var(--va-plain-text)"
            >Select Service</label>
            <VaSelect
              :model-value="store.selectedService"
              :options="SERVICE_OPTIONS"
              background="textInput"
              color="primary"
              @update:modelValue="onServiceChange"
            />
          </div>
          <div class="filter-field">
            <label
              for="course"
              style="color: var(--va-plain-text)"
            >Select AWS region</label>
            <VaSelect
              :model-value="store.selectedRegion"
              :options="store.availableRegions"
              background="textInput"
              color="primary"
              @update:modelValue="onRegionChange"
            />
          </div>
        </div>
        <div
          v-if="store.items.length > 0 && !store.loadingService"
          class="mb-5"
        >
          <h4 class="va-h3 text-center mb-4">
            Distribution by {{ store.chartXAxis }}
          </h4>
          <div style="height: 350px;">
            <Chart
              :chart-data="store.chartData"
              :x-axis="store.chartXAxis"
              y-axis="#times"
              @barClick="onBarClick"
            />
          </div>
        </div>
        <div
          v-if="!store.loadingService && store.items.length === 0"
          class="text-center py-8"
        >
          <p class="va-text-secondary">
            No instances of <strong>{{ store.selectedService }}</strong>
            in <strong>{{ store.selectedRegion }}</strong>.
          </p>
        </div>
        <VaButton
          color="buttonColor"
          class="mb-4 details-button"
          @click="display = !display"
        >
          Details
        </VaButton>
        <Transition name="expand">
          <div v-if="!display">
            <Table
              v-model:filter="searchQuery"
              :items="store.items"
              :columns="store.currentColumns"
              :loading="store.loadingService"
              :link-column-key="linkColumnKey"
            />
          </div>
        </Transition>
      </VaCardContent>
    </VaCard>
  </div>
</template>

<script setup lang="ts">
import { useOteadorStore, SERVICE_OPTIONS } from '../../stores/oteador'
import InfoWidgets from '../../components/InfoWidgets.vue'
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { VaButton } from 'vuestic-ui'
import Chart from '../../components/Chart.vue'
import Table from '../../components/Table.vue'
import { AtomSpinner } from 'epic-spinners'

const store = useOteadorStore()
const searchQuery = ref('')
const display = ref(true)
const REFRESH_INTERVAL_MS = 12000
let refreshInterval: ReturnType<typeof setInterval> | undefined
let refreshInProgress = false

const linkColumnKey = computed(() => store.currentColumns[0]?.key ?? '')

function onBarClick(label: string) {
  searchQuery.value = searchQuery.value === label ? '' : label
}

function onWidgetsAreaClick(event: MouseEvent) {
  const card = (event.target as HTMLElement).closest('.metric-card')
  if (!card) return
  const serviceKeyFromAttr = card.getAttribute('data-store-key')
  if (!serviceKeyFromAttr) return
  onWidgetClick(serviceKeyFromAttr)
}

async function onWidgetClick(serviceKey: string) {
  if (store.widgetServiceFilter === serviceKey) {
    await clearWidgetFilter()
    return
  }
  await store.fetchAllRegionItems(serviceKey)
  display.value = false
}

async function clearWidgetFilter() {
  searchQuery.value = ''
  await store.fetchTableData()
}

async function onServiceChange(value: string) {
  searchQuery.value = ''
  store.selectedService = value as typeof SERVICE_OPTIONS[number]
  await store.fetchTableData()
}

async function onRegionChange(value: string) {
  searchQuery.value = ''
  store.selectedRegion = value
  await store.fetchGlobalData()
}

onMounted(async () => {
  store.setLoadingInitial(true)
  await store.fetchRegions()
  await store.fetchGlobalData()
  refreshInterval = setInterval(async () => {
    if (refreshInProgress || store.loadingInitial || store.loadingService) return
    refreshInProgress = true
    try {
      await store.fetchGlobalData({ refreshPrices: true, showLoading: false })
    } finally {
      refreshInProgress = false
    }
  }, REFRESH_INTERVAL_MS)
})

onUnmounted(() => {
  if (refreshInterval) clearInterval(refreshInterval)
})
</script>

<style scoped>
.loading-overlay {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}

.filters-row {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.filter-field {
  flex: 1 1 320px;
  max-width: 430px;
}

@media (max-width: 768px) {
  .filter-field {
    max-width: 100%;
  }
}
</style>