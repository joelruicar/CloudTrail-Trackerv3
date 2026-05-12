<template>
  <div class="chart-wrapper">
    <div class="chart-container">
      <Doughnut
        :data="chartData"
        :options="chartOptions"
      />
      <div class="chart-center-text">
        <span class="number">{{ Math.round(number) }}%</span>
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
  color: { type: String, default: '#4ade80' },
  numberColor: { type: String, default: 'var(--va-plain-text)' },
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
  cutout: '70%',
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
.chart-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.chart-container {
  height: 100%;
  position: relative;
  min-width: 40px; 
  min-height: 40px;
}

.chart-center-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  text-align: center;
}

.number {
  font-size: clamp(0.8rem, 4vw, 1.3rem);
  font-weight: 800;
  color: v-bind("props.numberColor");
}
</style>