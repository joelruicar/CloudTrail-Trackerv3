<template>
  <div class="oteador">
    <InfoWidgets
      v-if="!store.loadingInitial"
      source="oteador"
    />
    <div
      v-if="store.loadingInitial"
      class="oteador__full-loader"
    >
      <VaProgressCircle
        indeterminate
        color="#4ae387"
        :thickness="0.2"
        size="80px"
      />
    </div>
    <VaCard
      v-else
      class="oteador__card"
    >
      <VaCardContent>
        <p class="oteador__select-label">
          Select an option to search in the
        </p>

        <div class="oteador__selectors">
          <select
            v-model="selectedService"
            class="oteador__selector oteador__native-select"
            @change="onServiceChange(selectedService)"
          >
            <option
              v-for="opt in SERVICE_OPTIONS"
              :key="opt"
              :value="opt"
            >
              {{ opt }}
            </option>
          </select>
          <select
            v-model="selectedRegion"
            class="oteador__selector oteador__native-select"
            @change="onRegionChange(selectedRegion)"
          >
            <option
              v-for="region in (store.availableRegions ?? [])"
              :key="region"
              :value="region"
            >
              {{ region }}
            </option>
          </select>
        </div>
        <div
          v-if="store.noResults && !store.loadingService"
          class="oteador__no-results"
        >
          <VaIcon name="search_off" />
          <span>No instances of <strong>{{ selectedService }}</strong> found.</span>
        </div>
        <div
          v-if="store.loadingService"
          class="oteador__service-loader"
        >
          <VaProgressCircle
            indeterminate
            color="#4ae387"
            :thickness="0.2"
            size="56px"
          />
        </div>
        <template v-if="store.graphPoints.length > 0 && !store.loadingService">
          <h3 class="oteador__chart-title">
            States in the {{ selectedService }}
          </h3>

          <div class="oteador__chart-wrap">
            <Chart
              :chart-data="store.chartData"
              :x-axis="store.chartXAxis"
              y-axis="#times"
              @barClick="onBarClick"
            />
          </div>
          <div class="oteador__details">
            <VaButton
              class="oteador__details-btn"
              color="#4ae387"
              @click="detailsOpen = !detailsOpen"
            >
              {{ detailsOpen ? 'Hide Details' : 'Details' }}
            </VaButton>
            <Transition name="oteador-slide">
              <div
                v-if="detailsOpen"
                class="oteador__table-wrap"
              >
                <div class="oteador__table-controls">
                  <label class="oteador__show-label">
                    Show
                    <VaSelect
                      v-model="perPage"
                      :options="pageSizeOptions"
                      class="oteador__page-size"
                    />
                    entries
                  </label>
                  <VaInput
                    v-model="searchQuery"
                    placeholder="Search…"
                    class="oteador__search"
                    clearable
                  >
                    <template #prependInner>
                      <VaIcon name="search" />
                    </template>
                  </VaInput>
                </div>
                <div class="oteador__table-container">
                  <VaDataTable
                    v-model:sort-by="sortBy"
                    v-model:sorting-order="sortingOrder"
                    :items="detailRows"
                    :columns="tableColumns"
                    :filter="searchQuery"
                    :per-page="perPage"
                    :current-page="currentPage"
                    :disable-client-side-sorting="false"
                    hoverable
                  >
                    <template #cell(id)="{ rowData }">
                      <a
                        :href="rowData.url"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="oteador__link"
                      >
                        {{ rowData.id }}
                      </a>
                    </template>
                    <template #cell(ip)="{ rowData }">
                      <a
                        v-if="rowData.ip"
                        :href="rowData.url"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="oteador__link"
                      >
                        {{ rowData.ip }}
                      </a>
                      <span v-else>-</span>
                    </template>
                    <template #cell(state)="{ rowData }">
                      <span
                        class="oteador__badge"
                        :class="`oteador__badge--${rowData.state}`"
                      >
                        {{ rowData.state || '-' }}
                      </span>
                    </template>
                  </VaDataTable>
                </div>
                <div class="oteador__pagination">
                  <VaPagination
                    v-model="currentPage"
                    :pages="pages"
                    color="buttonColor"
                    size="small"
                  />
                </div>
              </div>
            </Transition>
          </div>
        </template>
      </VaCardContent>
    </VaCard>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useOteadorStore, SERVICE_OPTIONS } from '../../stores/oteador'
import type { ServiceOption, TableRow } from '../../stores/oteador'
import InfoWidgets from '../../components/InfoWidgets.vue'
import Chart from '../../components/Chart.vue'
const store  = useOteadorStore()

const selectedService = ref<ServiceOption>(store.selectedService)
const selectedRegion  = ref<string>(store.selectedRegion)

const detailsOpen   = ref(false)
const searchQuery   = ref('')
const sortBy        = ref('index')
const sortingOrder  = ref<'asc' | 'desc' | null>(null)
const currentPage   = ref(1)
const perPage       = ref(10)
const activeFilter  = ref<string>('')
const pageSizeOptions = [10, 25, 50, 100]


const ALL_COLUMNS: { key: string; label: string }[] = [
  { key: 'index',       label: '#'              },
  { key: 'ip',          label: 'Public IP'      },
  { key: 'id',          label: 'Name'           },
  { key: 'desired',     label: 'Desired'        },
  { key: 'min',         label: 'Min'            },
  { key: 'max',         label: 'Max'            },
  { key: 'owner',       label: 'User'           },
  { key: 'type',        label: 'Type'           },
  { key: 'state',       label: 'State'          },
  { key: 'codeSize',    label: 'Code Size'      },
  { key: 'memorySize',  label: 'Memory Size'    },
  { key: 'timestamp',   label: 'Timestamp (UTC)'},
  { key: 'lastModified',label: 'Last Modified'  },
  { key: 'privateAddr', label: 'Private address'},
]

const activeColumns = computed(() =>
  ALL_COLUMNS.filter(col => store.visibleColumns.includes(col.key))
)

const tableColumns = computed(() =>
  activeColumns.value.map((col) => ({
    key: col.key,
    label: col.label,
    sortable: true,
  }))
)

const detailRows = computed<TableRow[]>(() => {
  if (!activeFilter.value) {
    return store.tableRows
  }
  return store.tableRows.filter((row) => row.state === activeFilter.value)
})

const pages = computed(() => Math.max(1, Math.ceil(detailRows.value.length / perPage.value)))

// Reset to page 1 when filters change
watch([searchQuery, activeFilter, perPage], () => { currentPage.value = 1 })

function onServiceChange(value: ServiceOption): void {
  store.setService(value)
  activeFilter.value = ''
  currentPage.value  = 1
}

function onRegionChange(value: string): void {
  store.setRegion(value)
  activeFilter.value = ''
  currentPage.value  = 1
}

function onBarClick(label: string): void {
  detailsOpen.value  = true
  activeFilter.value = activeFilter.value === label ? '' : label
}

onMounted(() => {
  store.startPolling()
})

onBeforeUnmount(() => {
  store.stopPolling()
})

</script>

<style lang="scss" src="./Oteador.scss" />