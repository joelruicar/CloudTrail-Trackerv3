<template>
  <VaLayout
    v-if="breakpoint.lgUp"
    class="h-screen"
  >
    <template #right>
      <div
        class="bg-primary h-full flex items-center justify-center px-9"
        style="width: 35vw"
      >
        <img
          src="../../public/landing.png"
          class="landingimg"
        >
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
    class="h-screen"
  >
    <template #content>
      <div class="flex h-full flex-col">
        <main class="flex w-full flex-1 items-center justify-center">
          <div class="w-full max-w-[420px] flex flex-col items-center gap-6 mx-6">
            <RouterView />
          </div>
        </main>
        <div
          style="height: 5vw"
          class="bg-primary flex items-center justify-center"
        >
          <img
            src="../../public/landing.png"
            class="landingimg"
          >
        </div>
      </div>
    </template>
  </VaLayout>
</template>

<script lang="ts" setup>
import { useBreakpoint } from 'vuestic-ui'

const breakpoint = useBreakpoint()
</script>
<style lang="css">
.landingimg {
  max-width: 60%;
  height: auto;
}
</style>