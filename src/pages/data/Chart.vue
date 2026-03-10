<template>
  <div class="chart-wrapper">
    <Bar v-if="chartData.datasets[0].data.length > 0" :data="chartData" :options="chartOptions" />
    <div v-else class="empty-state">No hay datos para el rango seleccionado</div>
  </div>
</template>

<script setup>
import { Bar } from 'vue-chartjs'
import { Chart, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js'
import { computed } from 'vue'
import { useAwsStore } from '../../stores/aws'

Chart.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const props = defineProps({
  title: { type: String, default: 'Distribución de Servicios' },
})
const awsStore = useAwsStore()

const chartData = computed(() => awsStore.chartDataServices)
const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    title: {
      display: true,
      text: props.title,
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
    },
    y: {
      grid: {
        display: false,
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
