<template>
  <div class="user-select-container">
    <VaSelect
      v-if="authStore.isProfessor"
      ref="userSelect"
      :model-value="modelValue"
      label="USERNAME"
      :options="filteredOptions"
      autocomplete
      :text-by="getUserOptionText"
      :value-by="getUserOptionText"
      background="textInput"
      color="primary"
      @update:modelValue="$emit('update:modelValue', $event)"
      @focus="openAllOptions"
      @click="openAllOptions"
      @update:search="userSearch = $event"
    >
      <template #option-content="{ option }">
        <span class="select-option-text">
          <template
            v-for="(part, index) in getHighlightedParts(option)"
            :key="`${getUserOptionText(option)}-${index}`"
          >
            <span :class="{ 'select-option-match': part.match }">{{ part.text }}</span>
          </template>
        </span>
      </template>
    </VaSelect>
    <VaInput
      v-else
      :model-value="modelValue"
      label="USERNAME"
      readonly
    />
  </div>
</template>

<script setup lang="ts">
import { VaSelect, VaInput } from 'vuestic-ui'
import { useAuthStore } from '../stores/auth'
import { computed, ref } from 'vue'

const authStore = useAuthStore()

const props = defineProps<{
  modelValue: string
  allUsers: string[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const userSelect = ref()
const userSearch = ref('')

const filteredOptions = computed(() => {
  const search = userSearch.value.toLowerCase()
  return search
    ? props.allUsers.filter((user) => user.toLowerCase().includes(search))
    : props.allUsers
})

const getUserOptionText = (user: unknown) => (typeof user === 'string' ? user : '')

const getHighlightedParts = (user: unknown) => {
  const text = getUserOptionText(user)

  if (!userSearch.value) return [{ text, match: false }]

  const search = userSearch.value.toLowerCase()
  const lower = text.toLowerCase()
  const parts: { text: string; match: boolean }[] = []
  let lastIndex = 0

  let matchIndex = lower.indexOf(search)
  while (matchIndex !== -1) {
    if (matchIndex > lastIndex) {
      parts.push({ text: text.slice(lastIndex, matchIndex), match: false })
    }
    parts.push({ text: text.slice(matchIndex, matchIndex + search.length), match: true })
    lastIndex = matchIndex + search.length
    matchIndex = lower.indexOf(search, lastIndex)
  }

  if (lastIndex < text.length) {
    parts.push({ text: text.slice(lastIndex), match: false })
  }

  return parts.length > 0 ? parts : [{ text, match: false }]
}

const openAllOptions = () => {
  userSearch.value = ''
  userSelect.value?.focus()
}
</script>

<style scoped>
.user-select-container {
  flex: 1;
  min-width: 200px;
}

.select-option-text {
  display: flex;
  gap: 0;
}

.select-option-match {
  background-color: rgba(255, 193, 7, 0.3);
  font-weight: 600;
  padding: 0 2px;
}
</style>
