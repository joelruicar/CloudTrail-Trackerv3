<template>
  <div class="metrics-row">
    <VaCard
      v-for="item in metricItems"
      :key="item.key"
      class="compact-metric-card metric-card"
      :data-store-key="item.storeKey"
      :class="{ 'card-zero': item.value === 0 }"
    >
      <VaCardContent :class="['card-content-compact', { 'card-clickable': item.value > 0 }]">
        <!-- Contenedor del Icono -->
        <div
          class="icon-container"
          :class="item.storeKey"
        >
          <VaIcon
            :name="getServiceIcon(item.storeKey)"
            size="24px"
          />
        </div>

        <!-- Textos (Título arriba, Valor abajo) -->
        <div class="text-container">
          <div class="stats-label">
            {{ item.displayLabel ?? item.key }}
          </div>
          <div class="value-row">
            <span class="stats-number">{{ item.value }}</span>
            <!-- En InfoWidgets.vue, localiza la sección de stats-price -->
            <span
              v-if="item.price !== null && !isNaN(Number(item.price))"
              class="stats-price"
            >
              - {{ Number(item.price).toFixed(4) }} <span class="currency">USD/h</span>
            </span>
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
    pointer: 'aws',
    validator: (value) => ['aws', 'oteador'].includes(value),
  },

})

const awsStore = useAwsStore()
const oteadorStore = useOteadorStore()

const displayData = computed(() => {
  if (props.source === 'oteador') {
    const metrics = oteadorStore.globalMetrics;
    const prices = oteadorStore.prices; 
    console.log('metrics:', JSON.parse(JSON.stringify(metrics)))
    console.log('prices:', JSON.parse(JSON.stringify(prices)))
    
    return Object.keys(metrics).map((storeKey) => {
      const labelMap = {
        ec2: 'EC2 running',
        rds: 'RDS running',
        autoscaling: 'Auto Scaling Groups',
        elb: 'ELB',
        elasticIP: 'Unattached Elastic IP',
        lambda: 'Lambda functions',
      }
      const label = labelMap[storeKey] ?? storeKey;
      return {
        storeKey,
        label,
        displayLabel: label,
        value: Number(metrics[storeKey] ?? 0), // Forzar número
        price: (prices[storeKey] != null && !isNaN(Number(prices[storeKey]))) ? Number(prices[storeKey]) : null,
      };
    });
  }

  return Object.entries(awsStore.metrics).map(([key, val]) => ({
    storeKey: key,
    label: key,
    displayLabel: key,
    value: val,
    price: null,
  }));
});

const metricItems = computed(() =>
  displayData.value.map(item => ({
    key:      item.label,     
    storeKey: item.storeKey,  
    value:    Number(item.value ?? 0),
    price:    item.price,
  }))
);

const getServiceIcon = (serviceKey) => {
  const iconMap = {
    ec2: 'material-icons-monitor',
    rds: 'material-icons-storage',
    autoscaling: 'material-icons-unfold_more',
    elb: 'material-icons-checklist',
    elasticIP: 'material-icons-device_hub',
    lambda: 'material-icons-folder',
    runInstances: 'material-icons-monitor',
    createDBInstance: 'material-icons-storage',
    createFunction: 'material-icons-content_paste',
    createLoadBalancer: 'material-icons-unfold_more',
  }
  return iconMap[serviceKey] || 'material-icons-help'
}
</script>
<style scoped>
.metrics-row {
  display: flex;
  flex-wrap: wrap; 
  gap: 1rem;
  justify-content: flex-start;
}

.compact-metric-card {
  flex: 1 1 calc(25% - 1rem); 
  min-width: 250px; 
  border-radius: 8px; 
  transition: all 0.3s ease;
}

@media (max-width: 1403px) {
  .compact-metric-card {
    flex: 1 1 calc(50% - 1rem); 
  }
}

@media (min-width: 1600px) and (max-width: 1920px) {
  .compact-metric-card {
    flex: 1 1 calc(33.33% - 1rem);
  }
}

@media (min-width: 1940px) {
  .compact-metric-card {
    flex: 1 1 calc(16.66% - 1rem);
  }
}

@media (max-width: 600px) {
  .compact-metric-card {
    flex: 1 1 100%;
  }
}

.card-content-compact {
  display: flex;
  align-items: center; 
  gap: 1rem; 
  padding: 1rem 1.25rem !important;
  cursor: default;
}

.card-content-compact.card-clickable { 
  cursor: pointer; 
}

.icon-container {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--va-background-element); 
  color: var(--va-primary);
  cursor: default;
}

.card-content-compact.card-clickable .icon-container,
.card-content-compact.card-clickable .text-container,
.card-content-compact.card-clickable .stats-label,
.card-content-compact.card-clickable .stats-number,
.card-content-compact.card-clickable .stats-price,
.card-content-compact.card-clickable .currency {
  cursor: pointer;
}

.icon-container.ec2 { background-color: #ffbeb2; color: #f51d00; }
.icon-container.rds  { background-color: #fbf7bb; color: #978b1e; }
.icon-container.autoscaling { background-color: #c5e7be; color: #328a17; }
.icon-container.elb { background-color: #bee1e7; color: #1f58a2; }
.icon-container.elasticIP { background-color: #ffd8f2; color: #da11a7; }
.icon-container.lambda { background-color: #e1bee7; color: #7b1fa2; }
.icon-container.runInstances  { background-color: #ffbeb2; color: #f51d00; }
.icon-container.createDBInstance { background-color: #fbf7bb; color: #978b1e; }
.icon-container.createFunction { background-color: #c5e7be; color: #328a17; }
.icon-container.createLoadBalancer { background-color: #bee1e7; color: #1f58a2; }

.text-container {
  display: flex;
  flex-direction: column;
  cursor: default;
}

.stats-label {
  font-size: 0.85rem;
  color: var(--va-text-secondary);
  font-weight: 500;  
  text-transform: capitalize;
  cursor: default;
}

.value-row {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}

.stats-number {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--va-text-primary);
  cursor: default;
}

.stats-price {
  font-size: 0.8rem;
  color: var(--va-text-secondary);
  font-family: monospace;
  cursor: default;
}

.currency {
  font-size: 0.7rem;
  cursor: default;
}
</style>