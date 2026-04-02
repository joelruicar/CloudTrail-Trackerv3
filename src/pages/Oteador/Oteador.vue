<template>
  <div class="oteador p-4">
    <!-- InfoWidgets ya muestra métricas + precios desde oteadorStore -->
    <InfoWidgets
      v-if="!store.loadingInitial"
      source="oteador"
    />

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
              :model-value="store.selectedRegion"
              :options="store.availableRegions"
              label="Relevant AWS Regions"
              @update:modelValue="onRegionChange"
            />
          </div>
        </div>

        <div
          v-if="store.items.length > 0 && !store.loadingService"
          class="mb-5"
        >
          <h3 class="va-h3 text-center mb-4">
            Distribution by {{ store.chartXAxis }}
          </h3>
          <div style="height: 350px;">
            <Chart
              :chart-data="store.chartData"
              :x-axis="store.chartXAxis"
              y-axis="#times"
              @barClick="onBarClick"
            />
          </div>
          <p
            v-if="activeFilter"
            class="text-center mt-2 va-text-secondary"
            style="font-size: 0.85rem;"
          >
            Filtering by <strong>{{ activeFilter }}</strong> —
            <a
              class="cursor-pointer"
              style="color: var(--va-primary)"
              @click="activeFilter = ''"
            >clear</a>
          </p>
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

        <VaDataTable
          :items="filteredRows"
          :columns="store.currentColumns"
          :loading="store.loadingService"
          striped
          hoverable
        />
      </VaCardContent>
    </VaCard>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useOteadorStore, SERVICE_OPTIONS } from '../../stores/oteador'
import InfoWidgets from '../../components/InfoWidgets.vue'
import Chart from '../../components/Chart.vue'

const store = useOteadorStore()
const activeFilter = ref('')

const filteredRows = computed(() => {
  if (!activeFilter.value) return store.items
  return store.items.filter(item => {
    const status = item.State || item.DBInstanceStatus || item.Status || ''
    const type   = item.Type  || item.DBInstanceClass  || item.Runtime || ''
    return status === activeFilter.value || type === activeFilter.value
  })
})

function onBarClick(label: string) {
  activeFilter.value = activeFilter.value === label ? '' : label
}

async function onServiceChange(value: string) {
  activeFilter.value = ''
  store.setSelectedService(value as typeof SERVICE_OPTIONS[number])
  await store.fetchAllData()
}

async function onRegionChange(value: string) {
  activeFilter.value = ''
  store.setSelectedRegion(value)
  await store.fetchAllData()
}

onMounted(async () => {
  await store.fetchRegions()
  await store.fetchAllData()
})
</script>