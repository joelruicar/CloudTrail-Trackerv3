<template>
  <VaSidebar
    :width="sidebarWidth"
    class="app-sidebar"
    :class="{ 'sidebar-hidden': minimized, 'app-sidebar--mobile': mobile && !minimized }"
  >
    <!-- Logo en la parte superior del sidebar -->
    <div class="sidebar-logo">
      <VaIcon
        v-if="mobile"
        color="primary"
        name="close"
        size="24px"
        class="mobile-toggle"
        @click="$emit('toggle')"
      />
      <RouterLink
        to="/"
        aria-label="Visit home page"
      >
        <VuesticLogo />
      </RouterLink>
    </div>

    <VaSidebarItem
      v-for="route in routes"
      :key="route.name"
      class="sidebar-item-wrapper"
    >
      <VaSidebarItemContent
        class="sidebar-item"
        :class="{ active: isActive(route) }"
        @click="navigate(route)"
      >
        <VaIcon
          v-if="iconFor(route.name)"
          :name="iconFor(route.name)"
          class="mr-2"
          size="20px"
        />
        <span>{{ formatName(route.name) }}</span>
      </VaSidebarItemContent>
    </VaSidebarItem>
  </VaSidebar>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import navigationRoutes from './NavigationRoutes'
import VuesticLogo from '../VuesticLogo.vue'

const props = defineProps({
  minimized: { type: Boolean, default: false },
  animated: { type: Boolean, default: true },
  mobile: { type: Boolean, default: false },
})

defineEmits(['toggle'])

const sidebarWidth = computed(() => {
  if (props.minimized) return '0px'
  return props.mobile ? '100vw' : '250px'
})

const router = useRouter()
const currentRoute = useRoute()

const routes = router.options.routes
  .find(r => r.name === 'admin')
  .children
  .filter(route => route.name !== 'change-password')

const iconByName = Object.fromEntries(
  navigationRoutes.routes.map((route) => [route.name, route.meta?.icon]),
)

const iconFor = (name) => iconByName[name]

const navigate = (route) => {
  router.push(`/${route.path}`)
}

const isActive = (route) => {
  return currentRoute.name === route.name
}

const formatName = (name) => {
  return name
    .replace(/-/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
}
</script>

<style scoped>
/* 1. Sidebar Base */
.app-sidebar {
  min-height: 100vh;
  background: linear-gradient(182deg,var(--va-background-card-secondary) 10%, var(--va-background-primary) 80%);
  overflow: visible !important;
  border-right: none  ;
}

.sidebar-hidden {
  width: 0  ;
  min-width: 0  ;
  overflow: hidden  ;
  opacity: 0  ;
  pointer-events: none  ;
}

:deep(.va-sidebar__menu) {
  overflow: visible  ;
  padding: 0  ;
  display: flex;
  flex-direction: column;
}

:deep(.va-sidebar-item) {
  padding: 0  ;
  margin: 0  ;
}

.sidebar-item.active {
  background-color: var(--va-background-primary)  ;
  color: var(--va-primary)  ;
  position: relative;
  
  border-radius: 40px 0 0 40px  ; 
  margin-left: 12px;
  
  width: calc(100% - 11px)  ;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  z-index: 10;
}

.sidebar-item.active::before,
.sidebar-item.active::after {
  content: "";
  position: absolute;
  right: 0; 
  width: 25px;
  height: 25px;
  background: transparent;
  pointer-events: none;
}

.sidebar-item.active::before {
  top: -25px;
  border-radius: 0 0 25px 0;
  box-shadow: 10px 10px 0 0 var(--va-background-primary)  ; 
}

.sidebar-item.active::after {
  bottom: -25px;
  border-radius: 0 25px 0 0;
  box-shadow: 10px -10px 0 0 var(--va-background-primary)  ; 
}

.sidebar-item {
  padding: 12px 20px;
  margin-left: 12px;
  transition: all 0.2s ease;
  color: var(--va-on-background-card-secondary);
  font-size: 0.85rem;
}

.sidebar-item:not(.active):hover {
  background: rgba(0, 0, 0, 0.04);
  border-radius: 40px 0 0 40px;
}

.sidebar-logo {
  padding: 1.8rem 1rem 1.25rem;
  background: var(--va-background-card-secondary);
  width: 100%;
  position: relative;
  justify-content: center;
  align-items: center;
}

.sidebar-logo a {
  display: inline-flex;
  justify-content: center;
  width: 100%;
}

.mobile-toggle {
  cursor: pointer;
  flex-shrink: 0;
}

.app-sidebar--mobile {
  position: fixed;
  inset: 0;
  height: 100vh;
  width: 100vw  ;
  min-width: 100vw;
  max-width: 100vw;
  z-index: 1000;
  overflow-y: auto  ;
}

@media (max-width: 768px) {
  .sidebar-logo {
    padding: 1.5rem 1rem;
  }

  .mobile-toggle {
    position: absolute;
    left: 1rem;
    top: 1.35rem;
  }

  .sidebar-item-wrapper {
    width: 100%;
  }

  .sidebar-item {
    width: calc(100% - 2rem);
    margin-left: 1rem;
    justify-content: center;
    font-size: 0.9rem;
    border-radius: 14px  ;
  }

  .sidebar-item.active,
  .sidebar-item:not(.active):hover {
    width: calc(100% - 2rem)  ;
    margin-left: 1rem;
    border-radius: 14px  ;
  }

  .sidebar-item.active::before,
  .sidebar-item.active::after {
    display: none;
  }
}
</style>