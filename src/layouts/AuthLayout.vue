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
      <main class="h-full flex items-center justify-center mx-auto w-full max-w-[420px] px-6 auth-content">
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
        <main class="flex w-full flex-1 items-center justify-center auth-content">
          <div class="w-full max-w-[420px] flex flex-col items-center gap-6 mx-6">
            <RouterView />
          </div>
        </main>
        <div
          class="bg-primary flex items-center justify-center bottom-landing"
        >
          <img
            src="../../public/landing.png"
            class="landingimg"
            alt="landing"
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
  max-width: 100%;
  width: auto;
  height: auto;
  max-height: 40vh;
  display: block;
  object-fit: contain;
  transform: none;
}

.bottom-landing {
  padding: 1.5rem 0;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--va-primary, #6fd1ab);
}

@media (max-width: 640px) {
  .landingimg {
    max-height: 30vh;
  }
  .bottom-landing {
    padding: 1rem 0;
  }
}

@media (min-width: 1024px) {
  .landingimg {
    max-width: 60%;
    max-height: 45vh;
  }
}

.auth-content {
  padding-top: 3.5rem; 
  padding-bottom: 2.5rem; 
  box-sizing: border-box;
}

@media (max-width: 640px) {
  .auth-content {
    padding-top: 2.2rem;
    padding-bottom: 1.5rem;
  }
}

@media (min-width: 1280px) {
  .auth-content {
    padding-top: 4.5rem;
    padding-bottom: 3rem;
  }
}
</style>