<template>
  <svg
    :height="height"
    :width="width"
    fill="none"
  >
    <text
      x="0"
      y="22"
      font-size="22"
      font-weight="700"
      :fill="colorsComputed.start"
    >
      <tspan>CloudTrail</tspan>
      <tspan
        x="0"
        dy="28"
        :fill="colorsComputed.tracker"
      >Tracker</tspan>
    </text>
  </svg>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useColors } from 'vuestic-ui'

const { getColor, currentPresetName } = useColors()

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

const width = computed(() => Math.round((props.height * 120) / 52))

const colorsComputed = computed(() => {
  return {
    start: getColor(props.start),
    end: getColor(props.end || props.start),
    tracker: currentPresetName.value === 'dark' ? '#ffffff' : '#000000',
  }
})
</script>