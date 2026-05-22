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
              background="textInput"
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
          class="table-body"
          :style="{ minHeight: `${perPage * 45 + 50}px` }"
        >
          <VaDataTable
            v-model:sort-by="sortBy"
            v-model:sorting-order="sortingOrder"
            :items="filteredItems"
            :columns="props.columns"
            :loading="props.loading"
            :disable-client-side-sorting="false"
            :per-page="perPage"
            :current-page="currentPage"
            hoverable
            striped
          >
            <template
              v-if="linkColumnKey && linkColumnKey !== 'eventName'"
              #[`cell(${linkColumnKey})`]="{ rowData }"
            >
              <a
                v-if="rowData.awsLink"
                :href="String(rowData.awsLink)"
                target="_blank"
                class="event-link"
              >
                {{ rowData[linkColumnKey] }}
              </a>
              <span v-else>
                {{ rowData[linkColumnKey] }}
              </span>
            </template>
            <template #cell(eventName)="{ rowData }">
              <slot
                name="cell-eventName"
                :row-data="rowData"
              >
                <a
                  v-if="props.enableEventLink"
                  :href="String(rowData.eventLink || '#')"
                  target="_blank"
                  class="event-link"
                  rel="noopener"
                >
                  {{ rowData.eventName }}
                </a>
                <span v-else>{{ rowData.eventName }}</span>
              </slot>
            </template>
            <template
              v-for="(_, name) in cellSlots"
              :key="name"
              #[name]="slotProps"
            >
              <slot
                :name="name"
                v-bind="slotProps"
              />
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
import { ref, computed, watch, nextTick, useSlots, ComponentPublicInstance } from 'vue'

type TableColumn = { key: string; label: string; sortable?: boolean }
type TableRow = Record<string, unknown>

const props = withDefaults(defineProps<{
  items: object[]
  columns: TableColumn[]
  loading?: boolean
  enableEventLink?: boolean
  linkColumnKey?: string
  filter?: string
}>(), {
  loading: false,
  enableEventLink: false,
  filter: '',
})

const emit = defineEmits<{
  'update:filter': [value: string]
}>()

const tableCard = ref<ComponentPublicInstance | null>(null)

const sortingOrder = ref<'asc' | 'desc' | null>(null)
const sortBy = ref('')
const perPage = ref(10)
const currentPage = ref(1)

const searchQuery = computed({
  get: () => props.filter,
  set: (val: string) => emit('update:filter', val),
})

const linkColumnKey = computed(() => props.linkColumnKey ?? '')

const slots = useSlots()

const cellSlots = computed(() =>
  Object.fromEntries(
    Object.entries(slots).filter(
      ([name]) => name.startsWith('cell(') && name !== 'cell(eventName)',
    ),
  ),
)

const filteredItems = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  const items = props.items as TableRow[]
  if (!query) return items
  return items.filter((item) =>
    Object.values(item).some((value) => String(value ?? '').toLowerCase().includes(query)),
  )
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

watch(perPage, () => { currentPage.value = 1 })
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

.per-page-label {
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}

.search-input {
  width: 300px;
}

@media (max-width: 768px) {
  .table-toolbar {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }

  .search-group {
    width: 100%;
  }

  .search-input {
    width: 100%;
  }

  .per-page-label {
    width: 100%;
    justify-content: flex-start;
    flex-wrap: wrap;
  }
}

.table-container :deep(.va-data-table),
.table-container :deep(.va-data-table table),
.table-container :deep(.va-data-table th),
.table-container :deep(.va-data-table td) {
  color: var(--va-plain-text) ;
}

.event-link {
  color: var(--va-widget-text);
  text-decoration: none;
  cursor: pointer;
}

.event-link:visited {
  color: var(--va-widget-text);
}

.pagination-footer {
  margin-top: 1rem;
  display: flex;
  justify-content: center;
}
</style>
