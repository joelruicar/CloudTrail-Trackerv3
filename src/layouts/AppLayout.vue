<template>
  <VaLayout
    :left="{ fixed: false, absolute: breakpoints.mdDown, order: 1, overlay: breakpoints.mdDown && !isSidebarMinimized }"
    @leftOverlayClick="isSidebarMinimized = true"
  >
    <template #left>
      <AppSidebar
        :minimized="isSidebarMinimized"
        :animated="!isMobile"
        :mobile="isMobile"
        @toggle="isSidebarMinimized = !isSidebarMinimized"
      />
    </template>

    <template #content>
      <div class="content-wrapper">
        <!-- Botón hamburguesa en mobile (sidebar cerrado) -->
        <VaIcon
          v-if="isMobile && isSidebarMinimized"
          color="primary"
          name="menu"
          size="24px"
          class="mobile-menu-btn"
          @click="isSidebarMinimized = false"
        />
        <!-- ProfileDropdown arriba a la derecha, se mueve con el scroll -->
        <div class="profile-top-right">
          <ProfileDropdown />
        </div>

        <div
          :class="{ minimized: isSidebarMinimized }"
          class="app-layout__sidebar-wrapper"
        >
          <div
            v-if="isFullScreenSidebar"
            class="flex justify-end"
          >
            <VaButton
              class="px-4 py-4"
              icon="md_close"
              preset="plain"
              @click="onCloseSidebarButtonClick"
            />
          </div>
        </div>
        <AppLayoutNavigation
          v-if="!isMobile"
          class="p-4"
        />
        <main :class="[{ 'with-sidebar': !isSidebarMinimized && !isMobile }, 'p-4', 'pt-0']">
          <article>
            <RouterView />
          </article>
        </main>
      </div>
    </template>
  </VaLayout>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { onBeforeRouteUpdate } from 'vue-router'
import { useBreakpoint } from 'vuestic-ui'

import { useGlobalStore } from '../stores/global-store'

import AppLayoutNavigation from '../components/app-layout-navigation/AppLayoutNavigation.vue'
import AppSidebar from '../components/sidebar/AppSidebar.vue'
import ProfileDropdown from '../components/navbar/components/ProfileDropdown.vue'

const GlobalStore = useGlobalStore()

const breakpoints = useBreakpoint()

const sidebarWidth = ref('15rem')
const sidebarMinimizedWidth = ref(undefined)

const isMobile = ref(false)
const isTablet = ref(false)
const { isSidebarMinimized } = storeToRefs(GlobalStore)

const onResize = () => {
  isSidebarMinimized.value = breakpoints.mdDown
  isMobile.value = breakpoints.smDown
  isTablet.value = breakpoints.mdDown
  sidebarMinimizedWidth.value = isMobile.value ? '0' : '4.5rem'
  sidebarWidth.value = isTablet.value ? '100%' : '15rem'
}

onMounted(() => {
  window.addEventListener('resize', onResize)
  onResize()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
})

onBeforeRouteUpdate(() => {
  if (breakpoints.mdDown) {
    // Collapse sidebar after route change for Mobile
    isSidebarMinimized.value = true
  }
})

const isFullScreenSidebar = computed(() => isTablet.value && !isSidebarMinimized.value)

const onCloseSidebarButtonClick = () => {
  isSidebarMinimized.value = true
}
</script>

<style lang="scss" scoped>
// Prevent icon jump on animation
.va-sidebar {
  width: unset ;
  min-width: unset ;
}

.content-wrapper {
  position: relative;
}

.mobile-menu-btn {
  position: absolute;
  top: 0.75rem;
  left: 1rem;
  cursor: pointer;
  z-index: 100;
}

.profile-top-right {
  position: absolute;
  top: 0.75rem;
  right: 1rem;
  z-index: 100;
}

main.with-sidebar {
  margin-left: 1rem; 
  transition: margin-left 200ms ease;
}

main {
  display: flex;
  justify-content: center;
}

main > article {
  width: 100%;
}

main > article > :not(.loading-overlay) {
  width: min(100%, 1680px);
  flex: 1 1 auto;
  margin: 0 auto;
}

@media (max-width: 768px) {
  main.with-sidebar {
    margin-left: 0;
  }
}
</style>