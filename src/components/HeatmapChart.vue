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
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { Chart as ChartJS, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js'
import { MatrixController, MatrixElement } from 'chartjs-chart-matrix'

ChartJS.register(CategoryScale, LinearScale, Tooltip, Legend, MatrixController, MatrixElement, ChartDataLabels)

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

const colorForValue = (value, raw) => {
  if (raw?.x === 'Nota') {
    return ' rgb(206,245,227)'
  }

  if (value >= 80) return ' rgb(34, 197, 94 )'
  if (value >= 40) return ' rgb(250, 204, 21 )'
  if (value > 0) return ' rgb(249, 115, 22 )'
  return ' rgb(148, 163, 184, 0.45)'
}

const chartData = computed(() => ({
  datasets: [
    {
      label: 'Progreso (%)',
      data: props.heatmapData.points,
      borderWidth: (context) => {
        const raw = context.raw
        return raw?.x === 'Nota' ? 2 : 0.1
      },
      borderColor: ' rgb(255, 255, 255, 0.65)',
      backgroundColor: (context) => {
        const raw = context.raw
        const value = Number(raw?.v ?? 0)
        return colorForValue(value, raw)
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
    // Configuración detallada de datalabels
    datalabels: {
      display: (context) => {
        return context.dataset.data[context.dataIndex]?.x === 'Nota'
      },
      formatter: (value) => value.v, // Muestra el valor numérico (la nota)
      color: '#000',
      font: {
        weight: 'bold',
        size: 11,
      },
    },
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
