<template>
  <div class="chart-wrapper">
    <Bar
      v-if="chartData?.datasets?.[0]?.data?.length > 0"
      ref="barRef"
      :key="chartRenderKey"
      :data="chartData"
      :options="chartOptions"
      @click="onBarClick"
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
import { Bar } from 'vue-chartjs'
import { Chart, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js'
import { computed, ref } from 'vue'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { useColors } from 'vuestic-ui'
Chart.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ChartDataLabels)
const { getColor, colorToRgba, currentPresetName } = useColors()
const props = defineProps({
  chartData: { type: Object, required: true },
  title: { type: String, default: '' },
  xAxis: { type: String, default: '' },
  yAxis: { type: String, default: '' },
})

const emit = defineEmits(['barClick'])
const barRef = ref(null)

function onBarClick(event) {
  if (!barRef.value?.chart) return
  const elements = barRef.value.chart.getElementsAtEventForMode(event, 'nearest', { intersect: true }, false)
  if (!elements.length) return
  const label = props.chartData.labels?.[elements[0].index]
  if (label) emit('barClick', label)
}

const isLaboratoryChart = computed(() => props.title.toLowerCase().includes('laboratory'))
const chartTextColor = computed(() => getColor('plainText'))
const chartNumberColor = computed(() => getColor('chartColor'))
const chartRenderKey = computed(() => `${currentPresetName.value}-${props.title}-${props.xAxis}-${props.yAxis}`)

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  layout: {
    padding: {
      top: 25,
    },
  },
  onClick: (event, elements, chart) => {
    if (elements.length) return  
    const xScale = chart.scales['x']
    if (!xScale) return
    const xPos = event.x
    const ticks = xScale.ticks
    const tickWidth = xScale.width / ticks.length
    const startX = xScale.left
    const index = Math.floor((xPos - startX) / tickWidth)
    if (index >= 0 && index < ticks.length) {
      const label = props.chartData.labels?.[index]
      if (label) emit('barClick', label)
    }
  },
  datasets: {
    bar: {
      backgroundColor: colorToRgba(getColor('chartColor'), 0.8),
      borderColor: 'transparent',
      borderWidth: 0,
      borderRadius: 15,
      maxBarThickness: 50,
      barPercentage: 0.5,
      categoryPercentage: 0.8,
    },
  },
  plugins: {
    legend: { display: false },
    title: {
      display: false,
      text: props.title,
      color: chartTextColor.value,
    },
    datalabels: {
      display: (context) => {
        return context.chart.width > 300
      },
      align: 'end',
      anchor: 'end',
      color: chartNumberColor.value,
      font: {
        size: 10,
        weight: 'bold',
      },
      offset: 4,
      formatter: (value) => Math.round(value),
    },
  },
  scales: {
    x: {
      title: {
        display: true,
        text: props.xAxis,
        color: chartTextColor.value,
        font: { weight: 'bold', family: 'Helvetica' },
      },
      grid: { display: false },
      ticks: { color: chartTextColor.value },
    },
    y: {
      title: {
        display: true,
        text: props.yAxis,
        color: chartTextColor.value,
        font: { weight: 'bold', family: 'Helvetica' },
      },
      beginAtZero: true,
      max: isLaboratoryChart.value ? 100 : undefined,
      grid: {
        display: false,
      },
      ticks: { color: chartTextColor.value },
    },
  },
}))
</script>
<style scoped>
.chart-wrapper {
  position: relative;
  height: 350px;
  width: 100%;
  cursor: pointer;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--va-empty-state);
}
</style>