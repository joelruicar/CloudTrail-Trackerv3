<template>
  <VaLayout
    v-if="breakpoint.lgUp"
    class="h-screen bg-[var(--va-background-secondary)]"
  >
    <template #right>
      <div
        class="bg-primary h-full flex items-center justify-center px-6"
        style="width: 35vw"
      >
        <VuesticLogo
          :height="28"
          start="white"
        />
      </div>
    </template>
    <template #content>
      <main class="h-full flex items-center justify-center mx-auto w-full max-w-[420px] px-6">
        <RouterView />
      </main>
    </template>
  </VaLayout>

  <VaLayout
    v-else
    class="h-screen bg-[var(--va-background-secondary)]"
  >
    <template #content>
      <div class="flex h-full flex-col">
        <main class="flex w-full flex-1 items-center justify-center">
          <div class="w-full max-w-[420px] flex flex-col items-center gap-6">
            <RouterView />
          </div>
        </main>
        <div
          class="bg-primary"
        />
      </div>
    </template>
  </VaLayout>
</template>

<script lang="ts" setup>
import { useBreakpoint } from 'vuestic-ui'
import VuesticLogo from '../components/VuesticLogo.vue'

const breakpoint = useBreakpoint()
</script>
