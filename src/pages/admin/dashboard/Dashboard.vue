<template>
  <VaCard class="p-4">
    <h1 class="text-2xl font-bold mb-4">Dashboard</h1>
    
    <VaSelect
      v-model="timeRange"
      :options="options"
      label="Select time range"
      class="mb-4"
    />
    <VaButton class="w-full" type="submit" :loading="processing" @click="handleClick" >
        Confirm
      </VaButton>
    <!-- <div v-if="loading" class="flex justify-center p-10">
      <VaProgressCircle indeterminate />
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
       <Bar :data="chartData" />
    </div>

    <VaDataTable 
      :items="tableData" 
      :columns="columns" 
      striped 
      hoverable 
    /> -->
  </VaCard>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useAwsStore } from '../../../stores/aws';
import { VaDataTable, VaCard, VaSelect, VaProgressCircle } from 'vuestic-ui';

const processing = ref(false)
const awsStore = useAwsStore();
const timeRange = ref('last hour');
const options = ['last hour', 'last day', 'last week'];

const handleClick = async () => {
  processing.value = true
  await awsStore.fetchDashboardData(timeRange.value);
  processing.value = false
}

// Watch for changes in timeRange
watch(timeRange, (newValue) => {
  awsStore.fetchDashboardData(newValue);
});

// Initial load
onMounted(() => {
  awsStore.fetchDashboardData(timeRange.value);
});
</script>