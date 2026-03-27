<template>
  <div class="range-selector">
    <div class="range-inputs">
      <div class="input-group">
        <label
          for="course" 
          style="color: var(--va-plain-text)"
        >Curso:</label>
        <VaSelect
          id="course"
          v-model="selectedCourse"
          :options="courseOptions"
          class="interactive-field"
          background="textInput"
          color="primary"
        />
      </div>
      <div
        v-if="authStore.isProfessor"
        class="input-group"
      >
        <label
          for="fromStudent" 
          style="color: var(--va-plain-text)"
        >Desde alumno:</label>
        <VaInput
          id="fromStudent"
          v-model.number="localRange.from"
          class="interactive-field"
          background="textInput"
          type="number"
          :min="0"
          :max="maxFrom"
          placeholder="0"
          @update:modelValue="normalizeRange"
        />
      </div>
      <div
        v-if="authStore.isProfessor"
        class="input-group"
      >
        <label
          for="toStudent" 
          style="color: var(--va-plain-text)"
        >Hasta alumno:</label>
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
        class="admin-checkbox"
      >
        <VaCheckbox
          v-model="singleStudentMode"
          label="Buscar por alumno"
        
          style="color: var(--va-plain-text)"
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
const localRange = ref({ from: 0, to: Math.min(0, Math.max(0, props.totalStudents - 1)) })
const selectedCourse = ref<string>(props.courses[0] ?? '')
const selectedDateRange = ref<{ start: Date; end: Date } | null>(calculateRange())
const singleStudentMode = ref(false)

const courseOptions = computed(() => props.courses)
const maxStudents = computed(() => Math.max(0, props.totalStudents))
const maxIndex = computed(() => Math.max(0, maxStudents.value - 1))
const maxFrom = computed(() => maxIndex.value)
const hasValidBounds = computed(() => localRange.value.from >= 0 && localRange.value.to <= maxIndex.value)

const normalizeRange = () => {
  const fromRaw = Number(localRange.value.from)
  const toRaw = Number(localRange.value.to)

  let from = Number.isFinite(fromRaw) ? Math.trunc(fromRaw) : 0
  let to = Number.isFinite(toRaw) ? Math.trunc(toRaw) : maxIndex.value

  from = Math.max(0, Math.min(from, maxFrom.value))
  to = Math.max(0, Math.min(to, maxIndex.value))

  if (singleStudentMode.value) {
    to = from
  }

  localRange.value = { from, to }
}

watch(
  () => props.courses,
  (courses) => {
    if (!selectedCourse.value && courses.length > 0) {
      selectedCourse.value = courses[0]
    }
  },
  { immediate: true },
)

watch(singleStudentMode, (enabled) => {
  if (enabled) {
    localRange.value.to = localRange.value.from
  }
})

watch(
  () => localRange.value.from,
  (from) => {
    if (singleStudentMode.value) {
      localRange.value.to = from
    }
  },
)

const applyFilter = () => {
  normalizeRange()

  if (!singleStudentMode.value && authStore.isProfessor) {
    const lower = Math.min(localRange.value.from, localRange.value.to)
    const upper = Math.max(localRange.value.from, localRange.value.to)
    localRange.value = { from: lower, to: upper }
  }

  if (!selectedCourse.value || !hasValidBounds.value) {
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

:deep(.admin-checkbox .va-checkbox__square) {
  background-color: #ffffff;
  border: 1px solid rgb(15, 23, 42);
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
