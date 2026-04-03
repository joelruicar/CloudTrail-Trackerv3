<template>
  <VaCard
    ref="tableCard"
    class="full-height-card"
  >
    <VaCardContent>
      <div class="table-container">
        <div class="table-toolbar">
          <div class="search-group">
            <VaInput
              v-model="searchQuery"
              class="search-input"
              placeholder="Search..."
              clearable
            />
          </div>
          <label class="per-page-label">
            Show
            <VaSelect
              v-model="perPage"
              :options="[10, 25, 50, 100]"
              class="page-select-inline"
            />
            entries
          </label>
        </div>
        <div
          class="table-container"
          :style="{ minHeight: `${perPage * 45 + 50}px` }"
        >
          <VaDataTable
            v-model:sort-by="sortBy"
            v-model:sorting-order="sortingOrder"
            :items="filteredItems"
            :columns="columns"
            :loading="loading"
            :disable-client-side-sorting="false"
            :per-page="perPage"
            :current-page="currentPage"
            hoverable
            striped
          >
            <template #cell(eventName)="{ rowData }">
              <slot
                v-if="!enableEventLinkWithPopover"
                name="cell-eventName"
                :row-data="rowData"
              >
                <a
                  v-if="enableEventLink"
                  :href="String(rowData.eventLink || '#')"
                  target="_blank"
                  class="event-link"
                >
                  {{ rowData.eventName }}
                </a>
                <span v-else>
                  {{ rowData.eventName }}
                </span>
              </slot>
              <VaPopover
                v-else
                :message="rowData.description"
                trigger="hover"
                placement="right"
                color="info"
                content-class="event-popover-content"
                stick-to-edges
              >
                <a
                  :href="rowData.eventLink"
                  target="_blank"
                  class="event-link"
                >
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

type TableColumn = { key: string; label: string; sortable?: boolean }

const props = withDefaults(defineProps<{
  items: Array<Record<string, any>>
  columns: TableColumn[]
  loading?: boolean
  enableEventLinkWithPopover?: boolean
  enableEventLink?: boolean
}>(), {
  loading: false,
  enableEventLinkWithPopover: false,
  enableEventLink: false,
})

const tableCard = ref<ComponentPublicInstance | null>(null)

const sortingOrder = ref<'asc' | 'desc' | null>(null)
const sortBy = ref('')
const perPage = ref(10)
const searchQuery = ref('')
const currentPage = ref(1)

const columns = computed(() => props.columns)
const loading = computed(() => props.loading)
const enableEventLinkWithPopover = computed(() => props.enableEventLinkWithPopover)
const enableEventLink = computed(() => props.enableEventLink)

const filteredItems = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return props.items
  return props.items.filter((item) => {
    return Object.values(item).some((value) => String(value ?? '').toLowerCase().includes(query))
  })
})

const pages = computed(() => {
  const count = Math.ceil(filteredItems.value.length / perPage.value)
  return count > 0 ? count : 1
})

const scrollToTable = () => {
  const el = tableCard.value?.$el as HTMLElement | undefined
  el?.scrollIntoView({ behavior: 'smooth', block: 'end' })
}

watch(currentPage, async () => {
  await nextTick()
  scrollToTable()
})

watch([perPage, searchQuery], () => {
  currentPage.value = 1
})

watch(pages, (newPages) => {
  if (currentPage.value > newPages) currentPage.value = newPages
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
  /* background: white; */
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

.table-container :deep(.va-data-table),
.table-container :deep(.va-data-table table),
.table-container :deep(.va-data-table th),
.table-container :deep(.va-data-table td) {
  color: var(--va-plain-text) !important;
}

.event-link {
  color: var(--va-plain-text);
  text-decoration: none;
  cursor: pointer;
}

.event-link:hover,
.event-link:focus,
.event-link:visited,
.event-link:active {
  color: var(--va-plain-text);
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
