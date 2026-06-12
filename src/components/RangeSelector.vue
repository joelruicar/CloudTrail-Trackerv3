<template>
  <div
    ref="rootEl"
    class="range-selector"
  >
    <div class="range-inputs">
      <div class="filter-field course-field">
        <label for="course">Course</label>
        <VaSelect
          id="course"
          v-model="selectedCourse"
          :options="courses"
          class="interactive-field"
          background="textInput"
          color="primary"
        />
      </div>

      <template v-if="authStore.isProfessor">
        <div class="filter-field search-field">
          <label for="user-search">Usernames</label>
          <div class="dropdown-wrapper user-list-search">
            <div ref="inputWrapperEl">
              <VaInput
                id="user-search"
                v-model="searchQuery"
                placeholder="Search users"
                background="textInput"
                clearable
                @focus="isDropdownOpen = true"
                @click="isDropdownOpen = true"
              >
                <template #prepend>
                  <VaIcon
                    name="search"
                    size="16px"
                    color="secondary"
                  />
                </template>
              </VaInput>
            </div>

            <div
              v-if="isDropdownOpen"
              class="dropdown-overlay"
              @mousedown.stop="isDropdownOpen = false"
            />

            <div
              v-show="isDropdownOpen"
              class="dropdown-panel"
            >
              <div
                class="user-list"
                @mouseleave="drag.active = false"
              >
                <div
                  v-for="user in filteredUsers"
                  :key="user"
                  class="user-item"
                  :class="{
                    'user-item--selected': selectedSet.has(user),
                    'user-item--in-range': isInDragRange(user),
                  }"
                  @mousedown.prevent="onMouseDown(user, $event)"
                  @mouseenter="onMouseEnter(user)"
                  @mouseup="onMouseUp"
                >
                  <span
                    class="user-checkbox"
                    aria-hidden="true"
                  >
                    <svg
                      v-if="selectedSet.has(user)"
                      viewBox="0 0 12 10"
                      fill="none"
                    >
                      <path
                        d="M1 5l3.5 3.5L11 1"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </span>
                  <span class="user-label">
                    <template
                      v-for="(part, i) in getHighlightedParts(user)"
                      :key="i"
                    >
                      <mark
                        v-if="part.match"
                        class="user-match"
                      >{{ part.text }}</mark>
                      <span v-else>{{ part.text }}</span>
                    </template>
                  </span>
                </div>

                <div
                  v-if="filteredUsers.length === 0"
                  class="user-empty"
                >
                  Sin resultados para "{{ searchQuery }}"
                </div>
              </div>

              <div class="user-list-actions">
                <button
                  class="action-btn"
                  :disabled="selectedUsernames.length === 0"
                  @click="clearAll"
                >
                  Limpiar selección
                </button>
                <button
                  class="action-btn"
                  @click="selectAll"
                >
                  Seleccionar todos
                </button>
              </div>
            </div>

            <div class="user-list-header">
              <span
                v-if="selectedUsernames.length > 0"
                class="user-list-count"
              >
                {{ selectedUsernamesLabel }} seleccionado{{ selectedUsernames.length !== 1 ? 's' : '' }}
              </span>
            </div>
          </div>
        </div>
      </template>

      <div class="filter-field date-field">
        <DateFilter v-model="selectedDateRange" />
      </div>

      <VaButton
        class="apply-btn"
        color="buttonColor"
        :disabled="!selectedCourse || !hasValidSelection"
        @click="applyFilter"
      >
        Search
      </VaButton>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { VaSelect, VaButton, VaInput, VaIcon } from 'vuestic-ui'
import { useAuthStore } from '../stores/auth'
import { useAwsStore } from '../stores/aws'
import { useAcademicYear } from '../composables/useAcademicYear'
import DateFilter from './DateFilter.vue'

const authStore = useAuthStore()
const awsStore  = useAwsStore()

const props = defineProps<{ courses: string[] }>()

const emit = defineEmits<{
  filterApplied: [{
    usernames: string[]
    course: string
    dateRange: { start: Date; end: Date } | null
  }]
}>()

const { calculateRange } = useAcademicYear()


const selectedCourse    = ref('')
const selectedDateRange = ref<{ start: Date; end: Date } | null>(calculateRange())

watch(() => props.courses, (courses) => {
  if (!selectedCourse.value && courses.length) selectedCourse.value = courses[0]
}, { immediate: true })


const rootEl         = ref<HTMLElement | null>(null)
const inputWrapperEl = ref<HTMLElement | null>(null)
const searchQuery    = ref('')
const isDropdownOpen = ref(false)
const users          = ref<string[]>([])

onMounted(async () => {
  users.value = await awsStore.getAllUsers() ?? []
  document.addEventListener('mousedown', onDocumentMouseDown)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', onDocumentMouseDown)
})

function onDocumentMouseDown(e: MouseEvent) {
  if (!isDropdownOpen.value) return
  const target = e.target as Node

  // Cerrar si el clic fue fuera del componente 
  if (!rootEl.value?.contains(target)) {
    isDropdownOpen.value = false
  }
}
const sortedUsers = computed<string[]>(() =>
  [...users.value].sort((a, b) =>
    a.localeCompare(b, 'es', { numeric: true, sensitivity: 'base' })
  )
)

const filteredUsers = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  return q ? sortedUsers.value.filter(u => u.toLowerCase().includes(q)) : sortedUsers.value
})

function getHighlightedParts(user: string) {
  const q = searchQuery.value.trim()
  if (!q) return [{ text: user, match: false }]
  return user
    .split(new RegExp(`(${q})`, 'i'))
    .filter(s => s.length)
    .map(text => ({ text, match: text.toLowerCase() === q.toLowerCase() }))
}

const selectedUsernames = ref<string[]>([])
const selectedSet = computed(() => new Set(selectedUsernames.value))
const selectedUsernamesLabel = computed(() => formatSelectedUsernames(selectedUsernames.value))

const drag = ref({ active: false, anchor: null as string | null, current: null as string | null })
const shiftAnchor = ref<string | null>(null)

function getRangeBetween(a: string, b: string): string[] {
  const list = filteredUsers.value
  const ia = list.indexOf(a)
  const ib = list.indexOf(b)
  if (ia === -1 || ib === -1) return []
  const [lo, hi] = ia < ib ? [ia, ib] : [ib, ia]
  return list.slice(lo, hi + 1)
}

function isInDragRange(user: string): boolean {
  const { active, anchor, current } = drag.value
  if (!active || !anchor || !current) return false
  return getRangeBetween(anchor, current).includes(user)
}

function applyRangeToggle(range: string[]) {
  const next = new Set(selectedUsernames.value)
  const allSelected = range.every(u => next.has(u))
  range.forEach(u => allSelected ? next.delete(u) : next.add(u))

  selectedUsernames.value = [...next]
}

function onMouseDown(user: string, e: MouseEvent) {
  if (e.shiftKey && shiftAnchor.value) {
    applyRangeToggle(getRangeBetween(shiftAnchor.value, user))
    return
  }

  drag.value    = { active: true, anchor: user, current: user }
  shiftAnchor.value = user
  window.addEventListener('mouseup', onMouseUp, { once: true })
}

function onMouseEnter(user: string) {
  if (drag.value.active) drag.value = { ...drag.value, current: user }
}

function onMouseUp() {
  const { active, anchor, current } = drag.value
  if (!active) return

  if (anchor && current) {
    const range = getRangeBetween(anchor, current)
    const next  = new Set(selectedUsernames.value)
    if (range.length === 1) {
      if (next.has(range[0])) {
        next.delete(range[0])
      } else {
        next.add(range[0])
      }
    } else {
      range.forEach(u => next.add(u))
    }
    selectedUsernames.value = [...next]
  }

  drag.value = { active: false, anchor: null, current: null }
}

function clearAll() { selectedUsernames.value = [] }
function selectAll() { selectedUsernames.value = [...filteredUsers.value] }

function formatSelectedUsernames(usernames: string[]) {
  if (usernames.length === 0) return '0'
  if (usernames.length === 1) return usernames[0]

  type ParsedEntry = { raw: string; prefix: string; number: number; width: number }

  const parsed = usernames
    .map((username): ParsedEntry | null => {
      const match = username.match(/^(.*?)(\d+)$/)
      if (!match) return null
      return { raw: username, prefix: match[1], number: Number(match[2]), width: match[2].length }
    })

  const allParsed = parsed.every((e): e is ParsedEntry => e !== null)
  if (allParsed) {
    const sorted = [...parsed].sort((a, b) => a.prefix.localeCompare(b.prefix) || a.number - b.number)

    const samePrefix = sorted.every(entry => entry.prefix === sorted[0].prefix)
    const consecutive = sorted.every((entry, index) => index === 0 || entry.number === sorted[index - 1].number + 1)

    if (samePrefix && consecutive) {
      const first = sorted[0]
      const last = sorted[sorted.length - 1]
      const pad = (value: number) => String(value).padStart(Math.max(first.width, last.width), '0')
      return `${first.prefix}${pad(first.number)} al ${last.prefix}${pad(last.number)}`
    }
  }

  return usernames.join(', ')
}

const hasValidSelection = computed(() =>
  !authStore.isProfessor || selectedUsernames.value.length > 0
)

function applyFilter() {
  emit('filterApplied', {
    usernames: selectedUsernames.value,
    course:    selectedCourse.value,
    dateRange: selectedDateRange.value,
  })
}
</script>

<style scoped>
.range-selector {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  padding: 1.15rem 1.2rem;
  background: var(--va-background-secondary);
  border-radius: 10px;
  margin-bottom: 1.2rem;
}

@media (min-width: 790px) {
  .range-selector {
    margin-left: 2rem;
    margin-right: 2rem;
  }
}

.range-inputs {
  display: grid;
  grid-template-columns: repeat(3, minmax(130px, 1fr));
  gap: 0.7rem 0.9rem;
  align-items: end;
  width: 100%;
}

.filter-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 200px;
  width: 50%;
}

.filter-field > label {
  font-weight: 600;
  font-size: 0.72rem;
  color: var(--va-plain-text);
}

.course-field {
  flex: 1;
}

.course-field :deep(.va-select),
.search-field :deep(.va-input-wrapper) {
  width: 100%;
}

.date-field {
  width: auto;
  min-width: 0;
  justify-content: flex-end;
}

.date-field :deep(> div) {
  width: auto;
  align-items: center;
}

.search-row {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  width: 100%;
  flex-wrap: wrap;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-group label {
  font-weight: 600;
  font-size: 0.72rem;
  color: var(--va-plain-text);
}

.apply-btn {
  grid-column: 1 / -1;
  justify-self: center;
  min-width: 170px;
  min-height: 30px;
  border-radius: 999px;
}

.user-list-header {
  position: absolute;
  top: calc(100% + 0.2rem);
  left: 0;
  right: 0;
  z-index: 1;
  min-width: 0;
  pointer-events: none;
}

.user-list-count {
  display: block;
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--va-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.dropdown-wrapper {
  position: relative;
}

.user-list-search {
  width: 100%;
}

.dropdown-panel {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  z-index: 100;
  background: var(--va-background-secondary);
  border: 1px solid var(--va-background-element, rgba(0, 0, 0, 0.08));
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 0.5rem;
}

.user-list {
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--va-primary) var(--va-background-element, rgba(0,0,0,0.03));
  max-height: 260px;
  padding: 0.25rem 0;
  background: var(--va-background-element, rgba(0,0,0,0.03));
  border-radius: 6px;
  user-select: none;
  cursor: default;
}

.user-list::-webkit-scrollbar        { width: 8px; display: block; }
.user-list::-webkit-scrollbar-track  { background: var(--va-background-element, rgba(0,0,0,0.03)); border-radius: 0 6px 6px 0; }
.user-list::-webkit-scrollbar-thumb  { background: color-mix(in srgb, var(--va-primary) 40%, transparent); border-radius: 4px; border: 1px solid transparent; background-clip: padding-box; }
.user-list::-webkit-scrollbar-thumb:hover { background: var(--va-primary); }

.user-item {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.3rem 0.75rem;
  border-radius: 5px;
  margin: 0 0.25rem;
  transition: background 0.1s;
  cursor: pointer;
}

.user-item:hover                      { background: var(--va-background-secondary); }
.user-item--in-range                  { background: color-mix(in srgb, var(--va-primary) 12%, transparent); }
.user-item--selected                  { background: color-mix(in srgb, var(--va-primary) 16%, transparent); }
.user-item--selected .user-label      { font-weight: 600; color: var(--va-primary); }

.user-checkbox {
  flex-shrink: 0;
  width: 14px;
  height: 14px;
  border-radius: 3px;
  border: 1.5px solid var(--va-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.12s;
}

.user-item--selected .user-checkbox   { background: var(--va-primary); color: white; }
.user-checkbox svg                    { width: 10px; height: 8px; display: block; }

.user-label {
  font-size: 0.82rem;
  color: var(--va-plain-text);
  line-height: 1.4;
}

.user-match {
  background: rgba(255, 193, 7, 0.32);
  font-weight: 700;
  padding: 0 2px;
  border-radius: 2px;
  color: inherit;
}

.user-empty {
  padding: 1rem;
  text-align: center;
  font-size: 0.8rem;
  color: var(--va-secondary);
}

.user-list-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.action-btn {
  background: none;
  border: none;
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--va-primary);
  cursor: pointer;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  transition: background 0.12s;
}

.action-btn:hover:not(:disabled) { background: color-mix(in srgb, var(--va-primary) 10%, transparent); }
.action-btn:disabled              { color: var(--va-secondary); cursor: not-allowed; }

@media (max-width: 768px) {
  .range-inputs {
    grid-template-columns: 1fr;
  }

  .filter-field {
    width: 100%;
  }

  .apply-btn {
    align-self: stretch;
    min-width: 0;
  }
}
.dropdown-overlay {
  position: fixed;
  inset: 0;
  z-index: 99;
}

</style>
