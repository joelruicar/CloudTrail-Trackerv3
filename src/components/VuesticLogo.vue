<template>
  <svg :height="height * 1.25" viewBox="0 0 600 70" fill="none" xmlns="http://www.w3.org/2000/svg">
    <text x="0" y="55" font-size="60" font-weight="bold" font-family="Arial, sans-serif" :fill="colorsComputed.start">
      CloudTrail-Tracker
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
    height: 18,
    start: 'primary',
    end: undefined,
  },
)

const colorsComputed = computed(() => {
  return {
    start: getColor(props.start),
    end: getColor(props.end || props.start),
  }
})
</script>
