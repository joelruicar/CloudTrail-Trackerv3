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
              <template v-if="selectedRegionValue !== 'all'">
                in <strong>{{ store.selectedRegion }}</strong>
              </template>
              <template v-else>
                across all regions
              </template>.
            </p>
          </div>
          <Table
            v-model:filter="searchQuery"
            :items="filteredRows"
            :columns="store.currentColumns"
            :loading="store.loadingService"
          />
        </VaCardContent>
      </VaCard>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useOteadorStore, SERVICE_OPTIONS } from '../../stores/oteador'
import InfoWidgets from '../../components/InfoWidgets.vue'
import { ref, computed, onMounted } from 'vue'
import Chart from '../../components/Chart.vue'
import Table from '../../components/Table.vue'

const store = useOteadorStore()
const searchQuery = ref('')
const ALL_REGIONS_VALUE = 'all'

const regionOptions = computed(() => [
  ALL_REGIONS_VALUE,
  ...store.availableRegions,
])

const selectedRegionValue = computed(() =>
  store.widgetServiceFilter ? ALL_REGIONS_VALUE : store.selectedRegion
)

const filteredRows = computed(() => store.items)

function onBarClick(label: string) {
  searchQuery.value = searchQuery.value === label ? '' : label
}

// Usamos event delegation sobre el wrapper para detectar en qué card se hizo click.
const WIDGET_KEY_MAP: Record<string, string> = {
  'EC2':           'ec2',
  'RDS':           'rds',
  'AUTOSCALING':   'autoscaling',
  'ELB':           'elb',
  'ELASTIC IP':    'elasticIP',
  'LAMB':          'lambda',
  'LAMBDA':        'lambda',
}

function onWidgetsAreaClick(event: MouseEvent) {
  const card = (event.target as HTMLElement).closest('.metric-card')
  if (!card) return
  const titleEl = card.querySelector('.stats-label')
  if (!titleEl) return
  const rawTitle = (titleEl.textContent ?? '').trim().toUpperCase()
  const serviceKey = Object.entries(WIDGET_KEY_MAP).find(
    ([label]) => label.toUpperCase() === rawTitle
  )?.[1]
  if (!serviceKey) return
  onWidgetClick(serviceKey)
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
  if (value === ALL_REGIONS_VALUE) {
    const serviceToKey: Record<string, string> = {
      'EC2 instances':          'ec2',
      'RDS instances':          'rds',
      'Auto Scaling Groups':    'autoscaling',
      'Elastic IPs':            'elasticIP',
      'Elastic Load Balancers': 'elb',
      'Lambda Functions':       'lambda',
      'Buckets S3':             'ec2', 
    }
    await store.fetchAllRegionItems(serviceToKey[store.selectedService] ?? 'ec2')
  } else {
    store.setSelectedRegion(value)
    await store.fetchTableData()
  }
}

onMounted(async () => {
  await store.fetchRegions()
  await store.fetchGlobalData()
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