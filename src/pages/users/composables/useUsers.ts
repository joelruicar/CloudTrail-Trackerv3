import { Ref, ref, unref, watch, computed } from 'vue'
import { User } from '../types'
import { useUsersStore } from '../../../stores/users'

export interface Filters {
  search: string
  from: string
  to: string
  eventName?: string
  isActive: boolean
}

export interface Pagination {
  page: number
  perPage: number
  total: number
}

export interface Sorting {
  sortBy: keyof User | undefined
  sortingOrder: 'asc' | 'desc' | null
}

const makePaginationRef = () => ref<Pagination>({ page: 1, perPage: 10, total: 0 })
const makeSortingRef = () => ref<Sorting>({ sortBy: 'fullname', sortingOrder: null })
const makeFiltersRef = () => ref<Partial<Filters>>({ isActive: true, search: '' })

export const useUsers = (options?: {
  pagination?: Ref<Pagination>
  sorting?: Ref<Sorting>
  filters?: Ref<Partial<Filters>>
}) => {
  const isLoading = ref(false)
  const error = ref()
  const usersStore = useUsersStore()

  const { filters = makeFiltersRef(), sorting = makeSortingRef(), pagination = makePaginationRef() } = options || {}

  const fetch = async () => {
    isLoading.value = true
    try {
      await usersStore.getAll({
        filters: unref(filters),
        sorting: unref(sorting),
        pagination: unref(pagination),
      })

      pagination.value.total = usersStore.pagination.total
    } catch (e) {
      error.value = e
    } finally {
      isLoading.value = false
    }
  }

  watch([filters, sorting, pagination], () => fetch(), { deep: true })

  fetch()

  const users = computed(() => usersStore.items)

  return {
    error,
    isLoading,
    filters,
    sorting,
    pagination,
    users,
    fetch,
  }
}
