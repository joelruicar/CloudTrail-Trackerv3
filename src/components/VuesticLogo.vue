<template>
  <svg
    :height="height"
    :width="width"
    viewBox="0 0 120 52"
    preserveAspectRatio="xMinYMid meet"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <text
      x="0"
      y="22"
      font-size="22"
      font-weight="700"
      font-family="Inter, Arial, sans-serif"
      :fill="colorsComputed.start"
    >
      <tspan
        x="0"
        dy="0"
      >CloudTrail-</tspan>
      <tspan
        x="0"
        dy="28"
      >Tracker</tspan>
    </text>
  </svg>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useColors } from 'vuestic-ui'

const { getColor } = useColors()

const props = withDefaults(
  defineProps<{
    height?: number
    start?: string
    end?: string
  }>(),
  {
    height: 52,
    start: 'primary',
    end: undefined,
  },
)

// Mantiene la proporción del viewBox 120×52
const width = computed(() => Math.round((props.height * 120) / 52))

const colorsComputed = computed(() => {
  return {
    start: getColor(props.start),
    end: getColor(props.end || props.start),
  }
})
</script>