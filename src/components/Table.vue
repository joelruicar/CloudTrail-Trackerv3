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
                :href="rowData.awsLink"
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
                v-if="!props.enableEventLinkWithPopover"
                name="cell-eventName"
                :row-data="rowData"
              >
                <a
                  v-if="props.enableEventLink"
                  :href="String(rowData.eventLink || '#')"
                  target="_blank"
                  class="event-link"
                >
                  {{ rowData.eventName }}
                </a>
                <span v-else>{{ rowData.eventName }}</span>
              </slot>
              <VaPopover
                v-else
                :key="`popover-${rowData.eventLink || rowData.eventName}`"
                :message="rowData.description"
                :trigger="popoverTrigger"
                :placement="popoverPlacement"
                color="info"
                content-class="event-popover-content"
                stick-to-edges
                :hover-over-timeout="0"
                :hover-out-timeout="50"
                @open="handlePopoverOpen(rowData.eventLink)"
                @close="handlePopoverClose(rowData.eventLink)"
              >
                <a
                  :href="rowData.eventLink"
                  target="_blank"
                  class="event-link"
                  @click.capture="handleEventLinkTap(rowData.eventLink, $event)"
                >
                  {{ rowData.eventName }}
                </a>
              </VaPopover>
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
import { useBreakpoint } from 'vuestic-ui'

type TableColumn = { key: string; label: string; sortable?: boolean }

const props = withDefaults(defineProps<{
  items: Array<Record<string, any>>
  columns: TableColumn[]
  loading?: boolean
  enableEventLinkWithPopover?: boolean
  enableEventLink?: boolean
  linkColumnKey?: string
  filter?: string
}>(), {
  loading: false,
  enableEventLinkWithPopover: false,
  enableEventLink: false,
  filter: '',
})

const emit = defineEmits<{
  'update:filter': [value: string]
}>()

const tableCard = ref<ComponentPublicInstance | null>(null)
const breakpoints = useBreakpoint()

const sortingOrder = ref<'asc' | 'desc' | null>(null)
const sortBy = ref('')
const perPage = ref(10)
const currentPage = ref(1)

const searchQuery = computed({
  get: () => props.filter,
  set: (val: string) => emit('update:filter', val),
})

const popoverTrigger = computed(() => (breakpoints.smDown ? 'click' : 'hover'))
const popoverPlacement = computed(() => (breakpoints.smDown ? 'bottom-start' : 'right'))
const activeMobilePopoverLink = ref<string | null>(null)

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
  if (!query) return props.items
  return props.items.filter((item) =>
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

const handleEventLinkTap = (link: string, event: MouseEvent) => {
  if (!breakpoints.smDown || !link) return
  event.preventDefault()
  if (activeMobilePopoverLink.value === link) {
    activeMobilePopoverLink.value = null
    window.open(link, '_blank', 'noopener')
  }
}

const handlePopoverOpen = (link: string) => {
  if (breakpoints.smDown && link) {
    activeMobilePopoverLink.value = link
  }
}

const handlePopoverClose = (link: string) => {
  if (breakpoints.smDown && activeMobilePopoverLink.value === link) {
    activeMobilePopoverLink.value = null
  }
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
  color: var(--va-plain-text) !important;
}

.event-link {
  color: var(--va-primary);
  text-decoration: none;
  cursor: pointer;
}

.event-link:visited {
  color: var(--va-primary);
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