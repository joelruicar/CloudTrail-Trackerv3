<template>
  <VaButtonToggle
    v-model="theme"
    color="background-element"
    border-color="background-element"
    :options="options"
  />
</template>
<script lang="ts" setup>
import { computed, onMounted, watch } from 'vue'

import { useI18n } from 'vue-i18n'

import { useColors } from 'vuestic-ui'

const { applyPreset, currentPresetName } = useColors()
const THEME_STORAGE_KEY = 'theme-preset'
const availableThemes = ['dark', 'light'] as const

const isThemePreset = (value: string): value is (typeof availableThemes)[number] => {
  return availableThemes.includes(value as (typeof availableThemes)[number])
}

const theme = computed({
  get() {
    return currentPresetName.value
  },
  set(value) {
    applyPreset(value)
  },
})

const { t } = useI18n()

const options = [
  { label: t('buttonSelect.dark'), value: 'dark' },
  { label: t('buttonSelect.light'), value: 'light' },
]

onMounted(() => {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY)

  if (savedTheme && isThemePreset(savedTheme)) {
    applyPreset(savedTheme)
    return
  }

  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    applyPreset('dark')
  }
})

watch(
  currentPresetName,
  (preset) => {
    if (preset && isThemePreset(preset)) {
      localStorage.setItem(THEME_STORAGE_KEY, preset)
    }
  },
  { immediate: true },
)
</script>
