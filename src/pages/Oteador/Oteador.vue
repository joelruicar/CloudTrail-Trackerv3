<template>
  <div class="oteador p-4">
    <div
      v-if="store.loadingInitial"
      class="loading-center"
    >
      <VaProgressCircle
        indeterminate
        size="large"
      />
    </div>

    <template v-else>
      <div
        class="widgets-click-wrapper"
        @click.capture="onWidgetsAreaClick"
      >
        <InfoWidgets source="oteador" />
      </div>

      <VaCard class="mt-4">
        <VaCardContent>
          <div class="row g-4 mb-4">
            <div class="flex xs12 md5">
              <VaSelect
                :model-value="store.selectedService"
                :options="SERVICE_OPTIONS"
                label="Select service"
                @update:modelValue="onServiceChange"
              />
            </div>
            <div class="flex xs12 md5">
              <VaSelect
                :model-value="selectedRegionValue"
                :options="regionOptions"
                label="Relevant AWS Regions"
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
          <Table
            v-model:filter="searchQuery"
            :items="filteredRows"
            :columns="store.currentColumns"
            :loading="store.loadingService"
            :link-column-key="linkColumnKey"
          />
        </VaCardContent>
      </VaCard>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useOteadorStore, SERVICE_OPTIONS } from '../../stores/oteador'
import InfoWidgets from '../../components/InfoWidgets.vue'
import { ref, computed, onMounted, onUnmounted } from 'vue'
import Chart from '../../components/Chart.vue'
import Table from '../../components/Table.vue'

const store = useOteadorStore()
const searchQuery = ref('')
const REFRESH_INTERVAL_MS = 12000
let refreshInterval: ReturnType<typeof setInterval> | undefined
let refreshInProgress = false

const regionOptions = computed(() => store.availableRegions)

const selectedRegionValue = computed(() => store.selectedRegion)

const filteredRows = computed(() => store.items)
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
}

async function clearWidgetFilter() {
  searchQuery.value = ''
  await store.fetchTableData()
}

async function onServiceChange(value: string) {
  searchQuery.value = ''
  store.setSelectedService(value as typeof SERVICE_OPTIONS[number])
  await store.fetchTableData()
}

async function onRegionChange(value: string) {
  searchQuery.value = ''
  store.setSelectedRegion(value)
  await store.fetchGlobalData()
}

onMounted(async () => {
  await store.fetchRegions()
  await store.fetchGlobalData()
  refreshInterval = setInterval(async () => {
    if (refreshInProgress || store.loadingInitial || store.loadingService) return
    refreshInProgress = true
    try {
      await store.fetchGlobalData({ refreshPrices: false, showLoading: false })
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
.loading-center {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}
</style>
