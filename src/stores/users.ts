import { defineStore } from 'pinia'
import { useAuthStore } from './auth'
import type { Pagination, Sorting, Filters } from '../pages/users/composables/useUsers'
import { API_CONFIG } from '../services/config'
import { User } from '../pages/users/types'

export const useUsersStore = defineStore('users', {
  state: () => {
    return {
      items: [] as User[],
      pagination: { page: 1, perPage: 10, total: 0 } as Pagination,
    }
  },

  actions: {
    async getAll(options: { pagination?: Pagination; sorting?: Sorting; filters?: Partial<Filters> }) {
      const auth = useAuthStore()
      const { from, to, search } = options.filters || {}

      // 1. Definir la URL base de tu API Gateway
      const baseUrl = API_CONFIG.GENERAL

      // 2. Determinar el endpoint basado en el Rol (Lógica de Negocio)
      let endpoint = ''

      if (auth.isProfessor) {
        endpoint = search ? `/users/${search}` : `/scan`
      } else {
        endpoint = `/users/${auth.user.username}`
      }

      const queryParams = new URLSearchParams()
      if (from) queryParams.append('from', from)
      if (to) queryParams.append('to', to)

      try {
        const response = await fetch(`${baseUrl}${endpoint}?${queryParams.toString()}`)

        if (!response.ok) throw new Error('Error en la respuesta del servidor')

        const data = await response.json()

        // 4. Mapear los datos de CloudTrail al formato de la tabla (User[])
        // La API devuelve eventID, eventName, etc.
        this.items = data.map((event: any) => ({
          id: event.eventID,
          fullname: event.userIdentity_userName, // Quien realizó la acción
          username: event.eventName, // Mostramos la acción en este campo
          email: event.eventSource, // Mostramos el servicio (rds, ec2...)
          role: event.eventTime, // Usamos el campo role para la fecha/hora
          active: true,
        }))

        this.pagination.total = data.length
      } catch (error) {
        console.error('Error cargando datos de CloudTrail:', error)
        this.items = []
      }
    },
  },
})
