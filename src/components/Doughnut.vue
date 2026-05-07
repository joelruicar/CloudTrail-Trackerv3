<template>
  <div class="chart-wrapper">
    <div class="chart-container">
      <Doughnut
        :data="chartData"
        :options="chartOptions"
      />
      <div class="chart-center-text">
        <span class="number">{{ number }}%</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Doughnut } from 'vue-chartjs'

ChartJS.register(ArcElement, Tooltip, Legend)

const props = defineProps({
  number: { type: Number, required: true },
  color: { type: String, default: '#4ade80' }
})

const chartData = computed(() => ({
  datasets: [
    {
      data: [props.number, 100 - props.number],
      backgroundColor: [props.color, '#1f2e49'],
      borderWidth: 0,
      hoverBackgroundColor: [props.color, '#1f2e49'],
    },
  ],
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '90%',
  rotation: -90,
  circumference: 360,
  plugins: {
    legend: { display: false },
    tooltip: { enabled: false },
    datalabels: {
      display: false
    }
  },
  events: [],
}
</script>

<style scoped>
.chart-container {
  width: 100px;
  height: 100px;
  position: relative;
}

.chart-center-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.number {
  font-size: 1.2rem;
  font-weight: 800;
  color: #333; 
}
</style>