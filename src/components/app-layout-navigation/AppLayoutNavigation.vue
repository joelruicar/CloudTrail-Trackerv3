<template>
  <div class="align-left">
    <VaIconMenuCollapsed
      class="cursor-pointer"
      :class="{ 'x-flip': !isSidebarMinimized }"
      :color="collapseIconColor"
      @click="isSidebarMinimized = !isSidebarMinimized"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useColors } from 'vuestic-ui'
import VaIconMenuCollapsed from '../icons/VaIconMenuCollapsed.vue'
import { storeToRefs } from 'pinia'
import { useGlobalStore } from '../../stores/global-store'
const { isSidebarMinimized } = storeToRefs(useGlobalStore())
const { getColor } = useColors()
const collapseIconColor = computed(() => getColor('secondary'))
</script>

<style lang="scss" scoped>
.x-flip {
  transform: scaleX(-100%);
}

.align-left {
  display: flex;
}
</style>
