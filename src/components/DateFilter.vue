<template>
  <div
    ref="container"
    class="relative z-[90] inline-flex items-end gap-3 min-h-10"
  >
    <VaCheckbox
      v-model="showInput"
      label="Dates"
      
      style="color: var(--va-plain-text)"
      class="whitespace-nowrap date-checkbox"
    />

    <Transition name="expand-width">
      <div
        v-if="showInput"
        class="overflow-hidden flex items-center"
      >
        <VaInput
          v-model="appliedText"
          placeholder="DD/MM/YYYY - DD/MM/YYYY"
          class="w-72 interactive-field"
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
    </Transition>

    <Teleport to="body">
      <div
        v-if="open && showInput"
        ref="popup"
        class="fixed p-4 bg-[var(--va-background-date)] border rounded shadow-xl z-[10000] flex flex-col max-w-[calc(100vw-2rem)] overflow-x-auto"
        :style="popupStyle"
      >
        <div class="flex gap-4 min-w-max">
          <VaDatePicker v-bind="pickerProps" />
          <VaDatePicker
            v-bind="pickerProps"
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
}>()

const emit = defineEmits(['update:modelValue'])
const { calculateRange } = useAcademicYear()

const open = ref(false)
const showInput = ref(false)
const container = ref<HTMLElement | null>(null)
const popup = ref<HTMLElement | null>(null)
const popupStyle = ref<Record<string, string>>({ top: '0px', left: '0px' })

const internalRange = ref(props.modelValue ? { ...props.modelValue } : null)
const appliedText = ref(formatRange(props.modelValue))

// inputText refleja internalRange en tiempo real (durante edición)
const inputText = computed(() => formatRange(internalRange.value))

// pickerProps compartido entre los dos VaDatePicker
const pickerProps = computed(() => ({
  modelValue: internalRange.value,
  'onUpdate:modelValue': (v: any) => { internalRange.value = v },
  mode: 'range' as const,
  class: 'w-64',
}))

function formatDate(date: Date | null) {
  if (!date || isNaN(date.getTime())) return ''
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function formatRange(r: any) {
  return r?.start && r?.end ? `${formatDate(r.start)} - ${formatDate(r.end)}` : ''
}

watch(open, (isOpen) => {
  if (isOpen) {
    internalRange.value = props.modelValue ? { ...props.modelValue } : null
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
.expand-width-enter-active,
.expand-width-leave-active {
  transition: all 0.3s ease-in-out;
  max-width: 400px;
}
.expand-width-enter-from,
.expand-width-leave-to {
  max-width: 0;
  opacity: 0;
}

:deep(.date-checkbox .va-checkbox__square) {
  background-color: #ffffff;
  border: 1px solid rgb(15, 23, 42);
  align-self: center;
}
</style>