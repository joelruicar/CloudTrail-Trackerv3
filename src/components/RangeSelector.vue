<template>
  <div class="range-selector">
    <div class="range-inputs">
      <div class="input-group">
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

      <div
        v-if="authStore.isProfessor"
        class="input-group"
      >
        <label for="fromStudent">From user</label>
        <VaInput
          id="fromStudent"
          v-model.number="localRange.from"
          class="interactive-field"
          background="textInput"
          type="number"
          :min="0"
          :max="maxIndex"
          placeholder="0"
          @update:modelValue="normalizeRange"
        />
      </div>

      <div
        v-if="authStore.isProfessor"
        class="input-group"
      >
        <label for="toStudent">To user</label>
        <VaInput
          id="toStudent"
          v-model.number="localRange.to"
          class="interactive-field"
          background="textInput"
          type="number"
          :disabled="singleStudentMode"
          :min="singleStudentMode ? localRange.from : 0"
          :max="maxIndex"
          :placeholder="maxIndex.toString()"
          @update:modelValue="normalizeRange"
        />
      </div>

      <div
        v-if="authStore.isProfessor"
        class="input-group admin-checkbox"
      >
        <VaCheckbox
          v-model="singleStudentMode"
          label="Search by user"
        />
      </div>

      <div class="input-group">
        <DateFilter v-model="selectedDateRange" />
      </div>

      <VaButton
        class="apply-btn"
        color="buttonColor"
        :disabled="!selectedCourse || !hasValidBounds"
        @click="applyFilter"
      >
        Search
      </VaButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAcademicYear } from '../composables/useAcademicYear'
import { VaInput, VaSelect, VaButton, VaCheckbox } from 'vuestic-ui'
import { useAuthStore } from '../stores/auth'
import { ref, computed, watch } from 'vue'
import DateFilter from './DateFilter.vue'

const authStore = useAuthStore()

const props = defineProps<{
  totalStudents: number
  courses: string[]
}>()

const emit = defineEmits<{
  filterApplied: [{ from: number; to: number; course: string; dateRange: { start: Date; end: Date } | null }]
}>()

const { calculateRange } = useAcademicYear()

const localRange        = ref({ from: 0, to: 0 })
const selectedCourse    = ref<string>(props.courses[0] ?? '')
const selectedDateRange = ref<{ start: Date; end: Date } | null>(calculateRange())
const singleStudentMode = ref(false)

const maxIndex      = computed(() => Math.max(0, props.totalStudents - 1))
const hasValidBounds = computed(() => localRange.value.from >= 0 && localRange.value.to <= maxIndex.value)

const clamp = (v: number) => Math.max(0, Math.min(Math.trunc(v), maxIndex.value))

const normalizeRange = () => {
  const from = clamp(Number(localRange.value.from))
  const to   = singleStudentMode.value ? from : clamp(Number(localRange.value.to))
  localRange.value = { from, to }
}

// Keep selectedCourse in sync if courses load asynchronously
watch(() => props.courses, (courses) => {
  if (!selectedCourse.value && courses.length) selectedCourse.value = courses[0]
}, { immediate: true })

// Mirror "to" when in single-student mode
watch([singleStudentMode, () => localRange.value.from], ([enabled, from]) => {
  if (enabled) localRange.value.to = from as number
})

const applyFilter = () => {
  normalizeRange()

  // Ensure from ≤ to for range mode
  if (!singleStudentMode.value) {
    const { from, to } = localRange.value
    if (from > to) localRange.value = { from: to, to: from }
  }

  emit('filterApplied', {
    ...localRange.value,
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
  padding: 1.15rem 1.2rem;
  background: var(--va-background-secondary) ;
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
  grid-template-columns: repeat(5, minmax(130px, 1fr));
  gap: 0.7rem 0.9rem;
  align-items: end;
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

.admin-checkbox {
  justify-content: flex-end;
}

.admin-checkbox :deep(.va-checkbox__square) {
  background-color: #ffffff;
  border: 1px solid rgb(15, 23, 42);
}

.apply-btn {
  grid-column: 2 / 5;
  justify-self: center;
  min-width: 170px;
  min-height: 30px;
  border-radius: 999px;
}

@media (max-width: 768px) {
  .range-inputs {
    grid-template-columns: 1fr;
  }

  .apply-btn {
    grid-column: auto;
    align-self: stretch;
  }
}
</style>