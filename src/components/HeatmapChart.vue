<template>
  <div
    class="chart-wrapper"
    :style="{ height: `${chartHeight}px` }"
  >
    <VueChart
      v-if="hasData"
      :key="chartRenderKey"
      type="matrix"
      :data="chartData"
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

<script setup>
import { computed } from 'vue'
import { Chart as VueChart } from 'vue-chartjs'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { Chart as ChartJS, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js'
import { MatrixController, MatrixElement } from 'chartjs-chart-matrix'
import { useColors } from 'vuestic-ui'

ChartJS.register(CategoryScale, LinearScale, Tooltip, Legend, MatrixController, MatrixElement, ChartDataLabels)

const props = defineProps({
  heatmapData: {
    type: Object,
    required: true,
  },
  xAxis: {
    type: String,
    default: 'Laboratory practices',
  },
  yAxis: {
    type: String,
    default: 'User',
  },
})

const emit = defineEmits(['student-click'])

const hasData = computed(() => props.heatmapData.points.length > 0)
const { getColor, currentPresetName } = useColors()

const chartRenderKey = computed(
  () => `${currentPresetName.value}-${props.heatmapData.points.length}-${props.heatmapData.subjects.length}`,
)

const chartHeight = computed(() => {
  const rows = Math.max(1, props.heatmapData.students.length)
  return Math.max(360, rows * 28 + 140)
})

const heatmapColors = computed(() => ({
  nota: getColor('heatmapNota'),
  success: getColor('heatmapSuccess'),
  warning: getColor('heatmapWarning'),
  danger: getColor('heatmapDanger'),
  empty: getColor('heatmapEmpty'),
  axisText: getColor('plainText'),
  notaText: getColor('notaText'),
}))

const isNotaPoint = (raw) => raw?.x === 'Nota'
const pointValue = (raw) => Number(raw?.v ?? 0)
const cellSize = (chart, dimension, count) => {
  const chartArea = chart?.chartArea
  if (!chartArea) return 24

  const size = dimension === 'width' ? chartArea.width : chartArea.height
  return Math.max(14, size / Math.max(1, count) - 3)
}

const colorForValue = (value, raw) => {
  if (isNotaPoint(raw)) return heatmapColors.value.nota

  if (value <= 0) return heatmapColors.value.empty
  if (value < 30) return heatmapColors.value.danger
  if (value < 80) return heatmapColors.value.warning
  return heatmapColors.value.success
}

const chartData = computed(() => ({
  datasets: [
    {
      label: 'Progreso (%)',
      data: props.heatmapData.points,
      borderWidth: (context) => {
        return isNotaPoint(context.raw) ? 2 : 0.1
      },
      backgroundColor: (context) => {
        const raw = context.raw
        return colorForValue(pointValue(raw), raw)
      },
      hoverBackgroundColor: (context) => {
        const raw = context.raw
        return colorForValue(pointValue(raw), raw)
      },
      hoverBorderWidth: (context) => {
        return isNotaPoint(context.raw) ? 2 : 0.1
      },
      width: (context) => {
        return cellSize(context.chart, 'width', props.heatmapData.subjects.length)
      },
      height: (context) => {
        return cellSize(context.chart, 'height', props.heatmapData.students.length)
      },
    },
  ],
}))

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  onClick: (_event, activeElements, chart) => {
    if (!activeElements?.length) return
    const { datasetIndex, index } = activeElements[0]
    const point = chart.data.datasets?.[datasetIndex]?.data?.[index]
    const student = point?.y
    if (!student) return
    emit('student-click', student)
  },
  plugins: {
    legend: { display: false },
    datalabels: {
      display: (context) => isNotaPoint(context.dataset.data[context.dataIndex]),
      formatter: (value) => value.v,
      color: heatmapColors.value.notaText,
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
        color: heatmapColors.value.axisText,
        font: { weight: 'bold', family: 'Helvetica' },
      },
      grid: { display: false },
      ticks: {
        color: heatmapColors.value.axisText,
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
        color: heatmapColors.value.axisText,
        font: { weight: 'bold', family: 'Helvetica' },
      },
      grid: { display: false },
      ticks: { color: heatmapColors.value.axisText },
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
  color: var(--va-empty-state);
}
</style>
