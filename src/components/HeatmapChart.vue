<template>
  <div class="chart-wrapper" :style="{ height: `${chartHeight}px` }">
    <VueChart v-if="hasData" type="matrix" :data="chartData" :options="chartOptions" />
    <div v-else class="empty-state">No available data</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
//para la integracion con vue
import { Chart as VueChart } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js'
import { MatrixController, MatrixElement } from 'chartjs-chart-matrix'

ChartJS.register(CategoryScale, LinearScale, Tooltip, Legend, MatrixController, MatrixElement)

const props = defineProps({
  heatmapData: {
    type: Object,
    required: true,
  },
  xAxis: {
    type: String,
    default: 'Práctica',
  },
  yAxis: {
    type: String,
    default: 'Alumno',
  },
})

const hasData = computed(() => props.heatmapData.points.length > 0)

const chartHeight = computed(() => {
  const rows = Math.max(1, props.heatmapData.students.length)
  return Math.max(360, rows * 28 + 140)
})

const colorForValue = (value) => {
  if (value >= 80) return 'rgba(34, 197, 94, 0.78)'
  if (value >= 40) return 'rgba(250, 204, 21, 0.78)'
  if (value > 0) return 'rgba(249, 115, 22, 0.78)'
  return 'rgba(148, 163, 184, 0.45)'
}

const chartData = computed(() => ({
  datasets: [
    {
      label: 'Progreso (%)',
      data: props.heatmapData.points,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.65)',
      backgroundColor: (context) => {
        const value = Number(context.raw?.v ?? 0)
        return colorForValue(value)
      },
      width: (context) => {
        const chart = context.chart
        const chartArea = chart?.chartArea
        if (!chartArea) return 24
        const cols = Math.max(1, props.heatmapData.subjects.length)
        return Math.max(14, chartArea.width / cols - 3)
      },
      height: (context) => {
        const chart = context.chart
        const chartArea = chart?.chartArea
        if (!chartArea) return 24
        const rows = Math.max(1, props.heatmapData.students.length)
        return Math.max(14, chartArea.height / rows - 3)
      },
    },
  ],
}))

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    datalabels: { display: false },
    tooltip: {
      callbacks: {
        title: () => '',
        label: (context) => {
          const point = context.raw || { x: 0, y: 0, v: 0 }
          const subject = point.x
          const student = point.y
          return `${student} - ${subject}: ${Number(point.v || 0).toFixed(2)}%`
        },
      },
    },
  },
  scales: {
    x: {
      type: 'category',
      labels: props.heatmapData.subjects,
      offset: true,
      title: {
        display: true,
        text: props.xAxis,
        color: '#000',
        font: { weight: 'bold', family: 'Helvetica' },
      },
      grid: { display: false },
      ticks: {
        color: '#000',
        autoSkip: false,
        maxRotation: 60,
        minRotation: 35,
      },
    },
    y: {
      type: 'category',
      labels: props.heatmapData.students,
      offset: true,
      title: {
        display: true,
        text: props.yAxis,
        color: '#000',
        font: { weight: 'bold', family: 'Helvetica' },
      },
      grid: { display: false },
      ticks: { color: '#000' },
      reverse: true,
    },
  },
}))
</script>

<style scoped>
.chart-wrapper {
  position: relative;
  width: 100%;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #94a3b8;
}
</style>
