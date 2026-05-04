<template>
  <RouterView />
</template>

<script lang="ts" setup>
import { onMounted } from 'vue'
import { useAuthStore } from './stores/auth'
import { useColors } from 'vuestic-ui'

const authStore = useAuthStore()
const { applyPreset } = useColors()

onMounted(async () => {
  // Initialize theme
  const savedTheme = localStorage.getItem('theme-preset')
  applyPreset(
    (savedTheme === 'dark' || savedTheme === 'light')
      ? savedTheme
      : window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  )

  await authStore.refreshUser()
})
</script>

<style lang="scss">
#app {
  font-family: 'Inter', Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  margin: 0;
  min-width: 20rem;
}
</style>
