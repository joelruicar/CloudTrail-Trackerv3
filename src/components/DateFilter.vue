<template>
  <div ref="container" class="relative inline-flex items-end gap-3 min-h-10">
    <VaCheckbox v-model="showInput" label="Dates" class="whitespace-nowrap" />

    <Transition name="expand-width">
      <div v-if="showInput" class="overflow-hidden flex items-center">
        <VaInput
          v-model="appliedText"
          placeholder="DD/MM/YYYY - DD/MM/YYYY"
          class="w-72"
          @click="open = true"
          @focus="open = true"
        >
          <template #prependInner>
            <VaIcon name="calendar_today" color="secondary" size="small" />
          </template>
        </VaInput>
      </div>
    </Transition>

    <div
      v-if="open && showInput"
      class="absolute top-full left-0 mt-2 p-4 bg-white border rounded shadow-xl z-50 flex flex-col"
    >
      <div class="flex gap-4">
        <VaDatePicker v-model="internalRange" mode="range" class="w-64" />
        <VaDatePicker v-model="internalRange" mode="range" class="w-64 hidden md:block" />
      </div>

      <div class="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
        <span class="text-xs font-mono text-gray-500">{{ inputText }}</span>

        <div class="flex gap-2">
          <VaButton preset="secondary" size="small" color="info" @click="resetToDefault"> RESET </VaButton>
          <VaButton preset="plain" size="small" color="secondary" @click="cancel"> CANCEL </VaButton>
          <VaButton size="small" color="success" @click="apply"> APPLY </VaButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useAcademicYear } from '../composables/useAcademicYear'

const props = defineProps<{
  modelValue: { start: Date; end: Date } | null
}>()

const emit = defineEmits(['update:modelValue'])
const { calculateRange } = useAcademicYear()

const open = ref(false)
const showInput = ref(false)
const container = ref<HTMLElement | null>(null)

const internalRange = ref(props.modelValue ? { ...props.modelValue } : null)

const appliedText = ref('')
const inputText = ref('')

const formatDate = (date: Date | null) => {
  if (!date || isNaN(date.getTime())) return ''
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const formatRange = (r: any) => (r?.start && r?.end ? `${formatDate(r.start)} - ${formatDate(r.end)}` : '')

appliedText.value = formatRange(props.modelValue)
inputText.value = appliedText.value

watch(open, (isOpen) => {
  if (isOpen) {
    internalRange.value = props.modelValue ? { ...props.modelValue } : null
    inputText.value = formatRange(internalRange.value)
  }
})

watch(
  internalRange,
  (val) => {
    inputText.value = formatRange(val)
  },
  { deep: true },
)

watch(inputText, (newVal) => {
  const match = newVal.match(/^(\d{2}\/\d{2}\/\d{4})\s*-\s*(\d{2}\/\d{2}\/\d{4})$/)
  if (match) {
    const [d1, m1, y1] = match[1].split('/').map(Number)
    const [d2, m2, y2] = match[2].split('/').map(Number)
    internalRange.value = {
      start: new Date(y1, m1 - 1, d1),
      end: new Date(y2, m2 - 1, d2),
    }
  }
})

const apply = () => {
  appliedText.value = inputText.value
  emit('update:modelValue', internalRange.value)
  open.value = false
}

const cancel = () => {
  internalRange.value = props.modelValue ? { ...props.modelValue } : null
  inputText.value = formatRange(props.modelValue)
  appliedText.value = inputText.value
  open.value = false
}

const resetToDefault = () => {
  const defaultRange = calculateRange()
  internalRange.value = defaultRange
}

const handleClickOutside = (e: MouseEvent) => {
  if (container.value && !container.value.contains(e.target as Node)) {
    cancel()
  }
}

onMounted(() => document.addEventListener('mousedown', handleClickOutside))
onUnmounted(() => document.removeEventListener('mousedown', handleClickOutside))
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
</style>
