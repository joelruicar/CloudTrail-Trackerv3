<template>
  <div class="range-selector">
    <div class="date-filter-row">
      <DateFilter v-model="selectedDateRange" />
    </div>

    <div class="range-inputs">
      <div class="input-group">
        <label for="course">Curso:</label>
        <VaSelect id="course" v-model="selectedCourse" :options="courseOptions" />
      </div>

      <div class="input-group">
        <label for="fromStudent">Desde alumno:</label>
        <VaInput
          id="fromStudent"
          v-model.number="localRange.from"
          type="number"
          :min="0"
          :max="maxFrom"
          placeholder="0"
          @update:modelValue="normalizeRange"
        />
      </div>

      <div class="input-group">
        <label for="toStudent">Hasta alumno:</label>
        <VaInput
          id="toStudent"
          v-model.number="localRange.to"
          type="number"
          :min="localRange.from"
          :max="maxIndex"
          :placeholder="maxIndex.toString()"
          @update:modelValue="normalizeRange"
        />
      </div>
      <VaButton class="apply-btn" :disabled="!selectedCourse || !isRangeValid" @click="applyFilter"> Search </VaButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { VaInput, VaSelect, VaButton } from 'vuestic-ui'
import { ref, computed } from 'vue'
import { useAcademicYear } from '../composables/useAcademicYear'
import DateFilter from './DateFilter.vue'

const props = defineProps<{
  totalStudents: number
  courses: string[]
}>()
const emit = defineEmits<{
  filterApplied: [{ from: number; to: number; course: string; dateRange: { start: Date; end: Date } | null }]
}>()

const { calculateRange } = useAcademicYear()
const localRange = ref({ from: 0, to: Math.min(0, Math.max(0, props.totalStudents - 1)) })
const selectedCourse = ref<string>('')
const selectedDateRange = ref<{ start: Date; end: Date } | null>(calculateRange())

const courseOptions = computed(() => props.courses)
const maxStudents = computed(() => Math.max(0, props.totalStudents))
const maxIndex = computed(() => Math.max(0, maxStudents.value - 1))
const maxFrom = computed(() => maxIndex.value)
const isRangeValid = computed(
  () =>
    localRange.value.from >= 0 && localRange.value.to <= maxIndex.value && localRange.value.from <= localRange.value.to,
)

const normalizeRange = () => {
  const fromRaw = Number(localRange.value.from)
  const toRaw = Number(localRange.value.to)

  let from = Number.isFinite(fromRaw) ? Math.trunc(fromRaw) : 0
  let to = Number.isFinite(toRaw) ? Math.trunc(toRaw) : maxIndex.value

  from = Math.max(0, Math.min(from, maxFrom.value))
  to = Math.max(from, Math.min(to, maxIndex.value))

  localRange.value = { from, to }
}

const applyFilter = () => {
  normalizeRange()

  if (!selectedCourse.value || !isRangeValid.value) {
    return
  }

  emit('filterApplied', {
    from: localRange.value.from,
    to: localRange.value.to,
    course: selectedCourse.value,
    dateRange: selectedDateRange.value,
  })
}
</script>

<style scoped>
.range-selector {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  background: var(--va-background-border);
  border-radius: 0.5rem;
  margin-bottom: 1.5rem;
}

.date-filter-row {
  display: flex;
  justify-content: flex-start;
}

.range-inputs {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  align-items: end;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-group label {
  font-weight: 600;
  font-size: 0.875rem;
}

.apply-btn {
  align-self: flex-end;
  height: 2.5rem;
}

@media (max-width: 768px) {
  .range-inputs {
    grid-template-columns: 1fr;
  }

  .apply-btn {
    align-self: stretch;
  }
}
</style>
