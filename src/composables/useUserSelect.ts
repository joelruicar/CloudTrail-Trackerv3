import { ref, computed, type Ref } from 'vue'

export function useUserSelect(allUsers: Ref<string[]>, initialUser: string) {
  const userSearch = ref('')

  const filteredOptions = computed(() => {
    const base = allUsers.value.length ? allUsers.value : (initialUser ? [initialUser] : [])
    const query = userSearch.value.trim().toLowerCase()
    return query ? base.filter((u) => u.toLowerCase().includes(query)) : base
  })

  const getUserOptionText = (option: unknown): string => {
    if (typeof option === 'string') return option
    if (option && typeof option === 'object' && 'text' in option)
      return String((option as { text: unknown }).text ?? '')
    return String(option ?? '')
  }

  const getHighlightedParts = (option: unknown) => {
    const text = getUserOptionText(option)
    const query = userSearch.value.trim()
    if (!query) return [{ text, match: false }]

    const lowerText = text.toLowerCase()
    const lowerQuery = query.toLowerCase()
    const parts: Array<{ text: string; match: boolean }> = []
    let from = 0

    while (from < text.length) {
      const index = lowerText.indexOf(lowerQuery, from)
      if (index === -1) { parts.push({ text: text.slice(from), match: false }); break }
      if (index > from) parts.push({ text: text.slice(from, index), match: false })
      parts.push({ text: text.slice(index, index + query.length), match: true })
      from = index + query.length
    }

    return parts
  }

  return { userSearch, filteredOptions, getUserOptionText, getHighlightedParts }
}