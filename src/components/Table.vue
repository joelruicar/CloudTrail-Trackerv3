<template>
  <VaCard ref="tableCard" class="full-height-card">
    <VaCardContent>
      <div class="table-container">
        <div class="table-toolbar">
          <div class="search-group">
            <VaInput v-model="searchQuery" class="search-input" placeholder="Search..." clearable />
          </div>
          <label class="per-page-label">
            Show
            <VaSelect v-model="perPage" :options="[10, 25, 50, 100]" class="page-select-inline" />
            entries
          </label>
        </div>
        <div class="table-container" :style="{ minHeight: `${perPage * 45 + 50}px` }">
          <VaDataTable
            v-model:sort-by="sortBy"
            v-model:sorting-order="sortingOrder"
            :items="awsStore.formattedEvents"
            :columns="columns"
            :disable-client-side-sorting="false"
            :filter="searchQuery"
            :per-page="perPage"
            :current-page="currentPage"
            hoverable
          >
            <template #cell(eventName)="{ rowData }">
              <!-- <VaPopover :message="rowData.description" trigger="hover" placement="right" color="info">
                <a
                  :href="rowData.eventLink"
                  target="_blank"
                  class="event-link"
                >
                  {{ rowData.eventName }}
                </a>
              </VaPopover> -->
              <VaPopover
                :message="rowData.description"
                trigger="hover"
                placement="right"
                color="info"
                content-class="event-popover-content"
                stick-to-edges
              >
                <a :href="rowData.eventLink" target="_blank" class="event-link">
                  {{ rowData.eventName }}
                </a>
              </VaPopover>
            </template>
          </VaDataTable>
        </div>
        <div class="pagination-footer">
          <VaPagination
            v-model="currentPage"
            :pages="pages"
            active-page-color="remarkPrimary"
            color="primary"
            size="small"
          />
        </div>
      </div>
    </VaCardContent>
  </VaCard>
</template>
<script setup lang="ts">
import { ref, computed, watch, nextTick, ComponentPublicInstance } from 'vue'
import { useAwsStore } from '../stores/aws'

const awsStore = useAwsStore()
const tableCard = ref<ComponentPublicInstance | null>(null)

const sortingOrder = ref<'asc' | 'desc' | null>(null)
const sortBy = ref('')
const perPage = ref(10)
const searchQuery = ref('')
const currentPage = ref(1)

const columns = [
  { key: 'id', label: '#', sortable: true },
  { key: 'user', label: 'User', sortable: true },
  { key: 'eventName', label: 'Event', sortable: true },
  { key: 'formatedTime', label: 'Timestamp', sortable: true },
]

const pages = computed(() => Math.ceil(awsStore.events.length / perPage.value))

const scrollToTable = () => {
  const el = tableCard.value?.$el as HTMLElement | undefined
  el?.scrollIntoView({ behavior: 'smooth', block: 'end' })
}

watch(currentPage, async () => {
  await nextTick()
  scrollToTable()
})

defineExpose({ scrollToTable })
</script>

<style scoped>
.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.full-height-card {
  height: 100%;
  border-radius: 15px;
}

.chart-card {
  border-radius: 15px;
  background: white;
}

.per-page-label {
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}

.page-select {
  width: 30px !important;
  min-width: 20px !important;
}

.search-input {
  width: 300px;
}

.event-link {
  color: #000;
  text-decoration: none;
  cursor: pointer;
}

.event-link:hover,
.event-link:focus,
.event-link:visited,
.event-link:active {
  color: #000;
  text-decoration: none;
}

:global(.event-popover-content) {
  max-width: min(85vw, 420px);
  white-space: normal;
  overflow-wrap: anywhere;
  word-break: break-word;
  line-height: 1.35;
}

.pagination-footer {
  margin-top: 1rem;
  display: flex;
  justify-content: center;
}
</style>
