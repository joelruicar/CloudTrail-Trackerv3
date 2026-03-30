<template>
  <div class="metrics-grid">
    <VaCard
      v-for="item in metricItems"
      :key="item.key"
      class="metric-card"
      :class="{ 'card-zero': item.value === 0 }"
    >
      <VaCardContent class="card-layout">
        <div class="stats-area">
          <div class="stats-number">
            {{ item.value }}
          </div>
          <div class="stats-title">
            {{ item.key }}
            <span v-if="item.price !== null"> - {{ item.price.toFixed(4) }} USD/h</span>
          </div>
        </div>
      </VaCardContent>
    </VaCard>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAwsStore } from '../stores/aws'
import { useOteadorStore } from '../stores/oteador'

const props = defineProps({
  source: {
    type: String,
    default: 'aws',
    validator: (value) => ['aws', 'oteador'].includes(value),
  },

})

const awsStore = useAwsStore()
const oteadorStore = useOteadorStore()

const displayData = computed(() => {
  if (props.source === 'oteador') {
    const metrics = oteadorStore.globalMetrics;
    const prices = oteadorStore.prices;
    const formatted = {};

    Object.keys(metrics).forEach((key) => {
      const label = key === 'elasticIP' ? 'Elastic IP' : key.toUpperCase();
      formatted[label] = {
        value: metrics[key], // Cambiado 'count' por 'value' para consistencia
        price: prices[key] || 0
      };
    });
    return formatted;
  }
  
  // Para AWS, normalizamos el formato para que siempre sea un objeto con 'value'
  const awsFormatted = {};
  Object.entries(awsStore.metrics).forEach(([key, val]) => {
    awsFormatted[key] = { value: val, price: null };
  });
  return awsFormatted;
});

const metricItems = computed(() => {
  return Object.entries(displayData.value).map(([key, data]) => ({
    key,
    value: Number(data.value ?? 0),
    price: data.price
  }));
});
</script>
<style scoped>
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  width: 100%;
  box-sizing: border-box;
}

@media (min-width: 768px) {
  .metrics-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.metric-card {
  min-width: 0;
  border-radius: 12px;
  border: 1px solid var(--va-widget-metric);
  box-shadow: 0 4px 12px var(--va-widget-metric);
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.metric-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px var(--va-widget-metric);
}

.metric-card.card-zero {
  background-color: var(--va-widget-zero);
  border-color: var(--va-widget-zero);
}

.metric-card.card-zero .card-layout {
  background-color: var(--va-widget-zero);
}

.card-layout {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  height: 100%;
  background-color: var(--va-widget-background);
}

.stats-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.stats-number {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--va-widget-text);
  line-height: 1.1;
  margin-bottom: 0.5rem;
}

.stats-title {
  font-size: 1rem;
  font-weight: 500;
  color: var(--va-widget-text);
  letter-spacing: 0.05em;
  text-transform: capitalize;
}
</style>
