<template>
  <VaSidebar
    :width="sidebarWidth"
    color="backgroundSecondary"
    class="app-sidebar"
    :class="{ 'sidebar-hidden': minimized }"
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
        :style="isActive(route)
          ? { background: gradientBg, '--arrow-color': arrow }
          : {}"
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
import { useColors } from 'vuestic-ui'

import navigationRoutes from './NavigationRoutes'
import VuesticLogo from '../VuesticLogo.vue'

const props = defineProps({
  minimized: { type: Boolean, default: false },
  animated: { type: Boolean, default: true },
  mobile: { type: Boolean, default: false },
})

defineEmits(['toggle'])

const sidebarWidth = computed(() => props.minimized ? '0px' : '250px')

const router = useRouter()
const currentRoute = useRoute()
const { getColor } = useColors()

const routes = router.options.routes
  .find(r => r.name === 'admin')
  .children
  .filter(route => route.name !== 'change-password')

const iconByName = Object.fromEntries(
  navigationRoutes.routes.map((route) => [route.name, route.meta?.icon]),
)

const gradientStart = computed(() => getColor('primary'))
const arrow = computed(() => getColor('arrow'))
const gradientEnd = computed(() => getColor('gradientEnd'))
const gradientBg = computed(() => `linear-gradient(90deg, ${gradientStart.value}, ${gradientEnd.value})`)

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
.app-sidebar {
  overflow: hidden;
  transition: width 0.3s ease;
  min-height: 100vh;
}

.sidebar-hidden {
  width: 0 !important;
  min-width: 0 !important;
  overflow: hidden;
}

.sidebar-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1.25rem 1rem;
  border-bottom: 1px solid var(--va-background-border);
  margin-bottom: 0.5rem;
}

.mobile-toggle {
  cursor: pointer;
  flex-shrink: 0;
}

.sidebar-item-wrapper {
  margin: 4px 0;
}

.sidebar-item {
  position: relative;
  padding: 12px 24px;
  display: flex;
  align-items: center;
  color: var(--va-plain-text);
  font-weight: bold;
  border-radius: 5px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.sidebar-item.active {
  color: var(--va-arrow-color);
}

.sidebar-item.active::before {
  content: "";
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  border-top: 15px solid transparent;
  border-bottom: 15px solid transparent;
  border-left: 12px solid var(--arrow-color);
  z-index: 1;
}
</style>