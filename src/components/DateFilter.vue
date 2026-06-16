<template>
  <div
    ref="container"
    class="relative z-[90] inline-flex items-center gap-3 min-h-10"
  >
    <VaCheckbox
      v-model="showInput"
      label="Dates"
      style="color: var(--va-plain-text)"
      class="whitespace-nowrap date-checkbox flex-none"
    />
    <div
      class="w-72 flex-none overflow-hidden flex items-center transition-opacity duration-300 ease-in-out"
      :class="showInput ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'"
    >
      <VaInput
        v-model="appliedText"
        placeholder="DD/MM/YYYY - DD/MM/YYYY"
        class="w-72 shrink-0 interactive-field"
        background="textInput"
        color="primary"
        @click="open = true"
        @focus="open = true"
      >
        <template #prependInner>
          <VaIcon
            name="calendar_today"
            color="secondary"
            size="small"
          />
        </template>
      </VaInput>
    </div>
    <Teleport to="body">
      <div
        v-if="open && showInput"
        ref="popup"
        class="fixed p-4 bg-[var(--va-background-date)] border rounded shadow-xl z-[10000] flex flex-col max-w-[calc(100vw-2rem)] overflow-x-auto"
        :style="popupStyle"
      >
        <div class="flex gap-4 min-w-max">
          <VaDatePicker v-bind="pickerPropsLeft" />
          <VaDatePicker
            v-bind="pickerPropsRight"
            class="w-64 hidden md:block"
          />
        </div>
        <div class="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
          <span class="text-xs font-mono text-gray-500">{{ inputText }}</span>
          <div class="flex gap-2">
            <VaButton
              preset="secondary"
              size="small"
              color="info"
              @click="moveToToday"
            >
              TODAY
            </VaButton>
            <VaButton
              preset="secondary"
              size="small"
              color="info"
              @click="resetToDefault"
            >
              RESET
            </VaButton>
            <VaButton
              preset="plain"
              size="small"
              color="secondary"
              @click="cancel"
            >
              CANCEL
            </VaButton>
            <VaButton
              size="small"
              color="success"
              @click="apply"
            >
              APPLY
            </VaButton>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useAcademicYear } from '../composables/useAcademicYear'

const props = defineProps<{
  modelValue: { start: Date; end: Date } | null
  enabled?: boolean
}>()

type DateRange = { start: Date; end: Date }

const emit = defineEmits<{
  'update:modelValue': [value: DateRange | null]
  'update:enabled': [value: boolean]
}>()
const { calculateRange } = useAcademicYear()

const open = ref(false)
const showInput = ref(props.enabled ?? true)
const container = ref<HTMLElement | null>(null)
const popup = ref<HTMLElement | null>(null)
const popupStyle = ref<Record<string, string>>({ top: '0px', left: '0px' })

const internalRange = ref(props.modelValue ? { ...props.modelValue } : null)
const appliedText = ref(formatRange(props.modelValue))

const inputText = computed(() => formatRange(internalRange.value))

function toView(date: Date) {
  return { type: 'day' as const, year: date.getFullYear(), month: date.getMonth() }
}

function monthIndex(view: { year: number; month: number }) {
  return view.year * 12 + view.month
}

function addMonths(view: { type: 'day'; year: number; month: number }, n: number) {
  const total = view.year * 12 + view.month + n
  return { type: 'day' as const, year: Math.floor(total / 12), month: ((total % 12) + 12) % 12 }
}

const viewLeft  = ref(toView(internalRange.value?.start ?? new Date()))
const viewRight = ref(toView(internalRange.value?.end   ?? new Date()))

function ensureRightAfterLeft() {
  if (monthIndex(viewRight.value) <= monthIndex(viewLeft.value)) {
    viewRight.value = addMonths(viewLeft.value, 1)
  }
}

const pickerPropsLeft = computed(() => ({
  modelValue: internalRange.value,
  'onUpdate:modelValue': (value: DateRange | null) => { internalRange.value = value },
  mode: 'range' as const,
  class: 'w-64',
  view: viewLeft.value,
  'onUpdate:view': (v: typeof viewLeft.value) => {
    viewLeft.value = v
    ensureRightAfterLeft()
  },
}))

const pickerPropsRight = computed(() => ({
  modelValue: internalRange.value,
  'onUpdate:modelValue': (value: DateRange | null) => { internalRange.value = value },
  mode: 'range' as const,
  class: 'w-64',
  view: viewRight.value,
  'onUpdate:view': (v: typeof viewRight.value) => {
    if (monthIndex(v) <= monthIndex(viewLeft.value)) {
      viewRight.value = addMonths(viewLeft.value, 1)
    } else {
      viewRight.value = v
    }
  },
}))

function syncViews(range: { start: Date; end: Date } | null) {
  const now = new Date()
  viewLeft.value  = toView(range?.start ?? now)
  viewRight.value = toView(range?.end   ?? now)
  ensureRightAfterLeft()
}

watch(() => internalRange.value?.start, (start) => {
  if (!start) return
  const nextMonth = new Date(start.getFullYear(), start.getMonth() + 1, 1)
  viewLeft.value = toView(start)
  viewRight.value = toView(nextMonth)
})

function formatDate(date: Date | null) {
  if (!date || isNaN(date.getTime())) return ''
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function formatRange(range: DateRange | null) {
  return range?.start && range?.end ? `${formatDate(range.start)} - ${formatDate(range.end)}` : ''
}

watch(showInput, (value) => {
  emit('update:enabled', value)
})

watch(open, (isOpen) => {
  if (isOpen) {
    internalRange.value = props.modelValue ? { ...props.modelValue } : null
    syncViews(internalRange.value)
  }
})

const updatePopupPosition = () => {
  if (!open.value || !showInput.value || !container.value) return

  const rect = container.value.getBoundingClientRect()
  const margin = 8
  const top = rect.bottom + margin

  let left = rect.left
  const estimatedWidth = popup.value?.offsetWidth ?? 720
  if (left + estimatedWidth > window.innerWidth - margin) {
    left = window.innerWidth - estimatedWidth - margin
  }
  if (left < margin) {
    left = margin
  }

  popupStyle.value = {
    top: `${top}px`,
    left: `${left}px`,
  }
}

watch([open, showInput], async ([isOpen, isShown]) => {
  if (!isOpen || !isShown) return
  await nextTick()
  updatePopupPosition()
})

const apply = () => {
  appliedText.value = inputText.value
  emit('update:modelValue', internalRange.value)
  open.value = false
}

const cancel = () => {
  internalRange.value = props.modelValue ? { ...props.modelValue } : null
  appliedText.value = formatRange(props.modelValue)
  open.value = false
}

const resetToDefault = () => {
  internalRange.value = calculateRange()
  syncViews(internalRange.value)
}

const moveToToday = async () => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  if (internalRange.value) {
    internalRange.value = { start: today, end: internalRange.value.end }
  } else {
    internalRange.value = { start: today, end: today }
  }
  syncViews(internalRange.value)
  await nextTick()
  updatePopupPosition()
}

const handleClickOutside = (e: MouseEvent) => {
  const target = e.target as Node
  const clickedContainer = container.value?.contains(target)
  const clickedPopup = popup.value?.contains(target)
  if (!clickedContainer && !clickedPopup) {
    cancel()
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
  window.addEventListener('resize', updatePopupPosition)
  window.addEventListener('scroll', updatePopupPosition, true)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside)
  window.removeEventListener('resize', updatePopupPosition)
  window.removeEventListener('scroll', updatePopupPosition, true)
})
</script>

<style scoped>
:deep(.date-checkbox .va-checkbox__square) {
  background-color: #ffffff;
  border: 1px solid rgb(15, 23, 42);
  align-self: center;
}
</style>