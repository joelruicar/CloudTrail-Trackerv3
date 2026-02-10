<template>
  <VaInput v-model="searchValue" class="mb-4" placeholder="Search">
    <template #appendInner>
      <VaIcon color="secondary" name="mso-search" />
    </template>
  </VaInput>
  <section class="grid grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
    <template >
      <VaCard class="col-span-3 md:col-span-1 min-h-[146px]" href="#">
        <VaCardContent class="leading-5 text-sm">
         
        </VaCardContent>
      </VaCard>
    </template>
  </section>
 
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'

const searchValue = ref('')

const filteredCategories = computed(() => {
  const value = searchValue.value.trim().toLowerCase()
  if (value.length === 0) {
  }
 
})
</script>
