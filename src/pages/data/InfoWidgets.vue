<template>
  <div class="metrics-grid">
    <VaCard v-for="(val, key) in data" :key="key" class="metric-card">
      <VaCardContent class="card-layout">
        <div class="stats-area">
          <div class="stats-number">{{ val }}</div>
          <div class="stats-title">{{ key }}</div>
        </div>
      </VaCardContent>
    </VaCard>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAwsStore } from '../../stores/aws'

const awsStore = useAwsStore()

const data = computed(() => awsStore.metrics)
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
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.metric-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.card-layout {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  height: 100%;
  background-color: #a5d6c0;
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
  color: #265822;
  line-height: 1.1;
  margin-bottom: 0.5rem;
}

.stats-title {
  font-size: 1rem;
  font-weight: 500;
  color: #00351c;
  letter-spacing: 0.05em;
  text-transform: capitalize;
}
</style>
