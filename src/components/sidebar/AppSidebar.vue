<template>
  <VaSidebar
    :width="sidebarWidth"
    class="app-sidebar"
    :class="{ 'sidebar-hidden': minimized, 'app-sidebar--mobile': mobile && !minimized }"
  >
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
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import navigationRoutes from './NavigationRoutes'
import VuesticLogo from '../VuesticLogo.vue'

const props = defineProps({
  minimized: { type: Boolean, default: false },
  mobile:    { type: Boolean, default: false },
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

const iconFor    = (name) => iconByName[name]
const navigate   = (route) => router.push(`/${route.path}`)
const isActive   = (route) => currentRoute.name === route.name
const formatName = (name) => name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
</script>

<style scoped>
/* ── Sidebar base ──────────────────────────────────────────────────────────── */

.app-sidebar {
  min-height: 100vh;
  background: linear-gradient(182deg, var(--va-background-card-secondary) 10%, var(--va-background-primary) 80%);
  border-right: none;
}

.sidebar-hidden {
  width: 0;
  min-width: 0;
  overflow: hidden;
  opacity: 0;
  pointer-events: none;
}

:deep(.va-sidebar__menu) {
  padding: 0;
  display: flex;
  flex-direction: column;
}

:deep(.va-sidebar-item) {
  padding: 0;
  margin: 0;
  background: transparent !important;
}

/* ── Items ─────────────────────────────────────────────────────────────────── */

.sidebar-item {
  padding: 12px 20px;
  margin-left: 12px;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  border-radius: 20px 0 0 20px;
  overflow: visible;
  transition: color 80ms linear, background-color 80ms linear;
  will-change: color, background-color;
}

:deep(.va-sidebar-item:hover),
:deep(.va-sidebar-item__content:hover) {
  background: transparent !important;
}

.sidebar-item:not(.active):hover {
  background-color: var(--va-focus);
  color: var(--va-sidebar-selected);
}

.sidebar-item.active {
  background-color: var(--va-focus);
  color: var(--va-sidebar-selected);
  z-index: 10;
}



/* ── Logo ──────────────────────────────────────────────────────────────────── */

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

/* ── Mobile ────────────────────────────────────────────────────────────────── */

.app-sidebar--mobile {
  position: fixed;
  inset: 0;
  height: 100vh;
  width: 100vw;
  min-width: 100vw;
  max-width: 100vw;
  z-index: 1000;
  overflow-y: auto;
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
}
</style>