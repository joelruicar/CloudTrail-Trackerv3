<template>
  <div class="learning-band-chart-wrapper">
    <Line
      v-if="hasData"
      :data="chartDataForRender"
      :options="chartOptions"
    />
    <div
      v-else
      class="empty-state"
    >
      No available data
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  type ChartData,
  type Point,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Filler,
} from 'chart.js'
import { useColors } from 'vuestic-ui'

ChartJS.register(Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale, Filler)

const props = defineProps<{
  chartData: {
    labels: string[]
    datasets: Array<Record<string, unknown>>
  }
  xAxis?: string
  yAxis?: string
}>()

const { getColor } = useColors()
const hasData = computed(() => props.chartData.labels.length > 0)
const chartDataForRender = computed(() => props.chartData as unknown as ChartData<'line', (number | Point | null)[], string>)

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index' as const,
    intersect: false,
  },
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        color: getColor('plainText'),
      },
    },
    title: {
      display: false,
    },
    datalabels: {
      display: false,
    },
  },
  scales: {
    x: {
      title: {
        display: !!props.xAxis,
        text: props.xAxis,
        color: getColor('plainText'),
        font: { weight: 'bold' as const, family: 'Helvetica' },
      },
      ticks: { color: getColor('plainText') },
      grid: { display: false },
    },
    y: {
      beginAtZero: true,
      min: 0,
      max: 100,
      title: {
        display: !!props.yAxis,
        text: props.yAxis,
        color: getColor('plainText'),
        font: { weight: 'bold' as const, family: 'Helvetica' },
      },
      ticks: {
        display: false,
      },
      grid: {
        color: getColor('backgroundBorder'),
      },
    },
  },
}))
</script>

<style scoped>
.learning-band-chart-wrapper {
  position: relative;
  width: 100%;
  height: 360px;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--va-empty-state);
}
</style>