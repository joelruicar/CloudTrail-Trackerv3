<script lang="ts" setup>
import { ref, computed } from 'vue'
import { eventLinks } from '../data/event-links'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()
const searchValue = ref('')

const filteredCategories = computed(() => {
  const query = searchValue.value.trim().toLowerCase()

  // Solución al error 'expected to return a value'
  if (!query) {
    return eventLinks
  }

  // Solución al error 'empty block' y lógica de filtrado
  return eventLinks.filter((event) => {
    const desc = event.description[locale.value as 'es' | 'en'] || ''
    return event.id.toLowerCase().includes(query) || desc.toLowerCase().includes(query)
  })
})
</script>

<template>
  <VaInput v-model="searchValue" class="mb-4" placeholder="Buscar evento (ej. CreateKeyPair)...">
    <template #appendInner>
      <VaIcon color="secondary" name="mso-search" />
    </template>
  </VaInput>

  <section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
    <VaCard v-for="event in filteredCategories" :key="event.id" class="min-h-[140px]" :href="event.url" target="_blank">
      <VaCardContent>
        <h4 class="font-bold text-primary">{{ event.id }}</h4>
        <p class="text-sm mt-2">
          {{ event.description[locale as 'es' | 'en'] }}
        </p>
      </VaCardContent>
    </VaCard>
  </section>
</template>
