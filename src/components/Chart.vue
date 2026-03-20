<template>
  <div class="chart-wrapper">
    <Bar v-if="chartData?.datasets?.[0]?.data?.length > 0" :data="chartData" :options="chartOptions" />
    <div v-else class="empty-state">No available data</div>
  </div>
</template>

<script setup>
import { Bar } from 'vue-chartjs'
import { Chart, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js'
import { computed } from 'vue'
import ChartDataLabels from 'chartjs-plugin-datalabels'
Chart.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ChartDataLabels)

const props = defineProps({
  chartData: { type: Object, required: true },
  title: { type: String, default: '' },
  xAxis: { type: String, default: '' },
})
const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  datasets: {
    bar: {
      maxBarThickness: 50,
      barPercentage: 0.5,
      categoryPercentage: 0.8,
    },
  },
  plugins: {
    legend: { display: false },
    title: {
      display: true,
      text: props.title,
    },
    datalabels: {
      display: (context) => {
        return context.chart.width > 300
      },
      align: 'end',
      anchor: 'end',
      color: '#000',
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
        color: '#000',
        font: { weight: 'bold', family: 'Helvetica' },
      },
      grid: { display: false },
      ticks: { color: '#000' },
    },
    y: {
      grid: {
        display: false,
        color: 'rgba(220, 227, 241, 1)',
      },
    },
  },
}))
</script>

<style scoped>
.chart-wrapper {
  position: relative;
  height: 350px;
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
