import { defineStore } from 'pinia'
import { AwsEvent, AwsMetrics } from './interfaces/aws'
import { eventLinks } from '../pages/data/event-links'
import { EventLinkItem } from './interfaces/types'
import api from '../services/api'

const formatLocal = (date: Date, includeTime: boolean) => {
  const pad = (n: number) => n.toString().padStart(2, '0')

  const yyyy = date.getFullYear()
  const mm = pad(date.getMonth() + 1)
  const dd = pad(date.getDate())
  const dateStr = `${yyyy}-${mm}-${dd}`

  if (!includeTime) return dateStr

  const hh = pad(date.getHours())
  const min = pad(date.getMinutes())
  const ss = pad(date.getSeconds())
  return `${dateStr}T${hh}:${min}:${ss}Z`
}

const calculateDateRange = (range: string): { start: string; end: string } => {
  const now = new Date()
  let start: string
  let end: string

  if (range === 'last hour' || range === 'last six hours') {
    const offset = range === 'last hour' ? 3 : 10
    const endDate = new Date(now.getTime() - 2 * 60 * 60 * 1000)
    const startDate = new Date(now.getTime() - offset * 60 * 60 * 1000)

    end = formatLocal(endDate, true)
    start = formatLocal(startDate, true)
  } else {
    const daysMap: Record<string, number> = {
      'last day': 1,
      'last week': 7,
    }
    const daysToSubtract = daysMap[range] || 1
    const startDate = new Date(now.getTime() - daysToSubtract * 24 * 60 * 60 * 1000)

    end = formatLocal(now, false)
    start = formatLocal(startDate, false)
  }

  return { start, end }
}
export const useAwsStore = defineStore('aws', {
  state: () => ({
    events: [] as AwsEvent[],
    services: [] as string[],
    allUsers: [] as string[],
    filters: {
      eventName: '',
      date: '',
      searchQuery: '',
    },
    metrics: {
      runInstances: 0,
      createDBInstance: 0,
      createFunction: 0,
      createLoadBalancer: 0,
    } as AwsMetrics,
    loading: false,
    selectedRange: 'last hour',
    startDate: '',
    endDate: '',
  }),

  getters: {
    chartDataServices: (state) => {
      const counts = state.events.reduce((num: Record<string, number>, event) => {
        const service = event.eventSource.split('.')[0]
        num[service] = (num[service] || 0) + 1
        return num
      }, {})

      return {
        labels: Object.keys(counts),
        datasets: [
          {
            label: 'AWS Services Usage',
            backgroundColor: 'rgba(74, 227, 135, 0.2)',
            borderColor: 'rgba(0, 102, 0, 1)',
            borderWidth: 1,
            data: Object.values(counts),
          },
        ],
      }
    },

    chartDataUsers: (state) => {
      const counts = state.events.reduce((num: Record<string, number>, event) => {
        const user = event.user
        num[user] = (num[user] || 0) + 1
        return num
      }, {})
      return {
        labels: Object.keys(counts),
        datasets: [
          {
            label: 'Users who have used AWS services',
            backgroundColor: 'rgba(74, 227, 135, 0.2)',
            borderColor: 'rgba(0, 102, 0, 1)',
            borderWidth: 1,
            data: Object.values(counts),
          },
        ],
      }
    },

    formattedEvents: (state) => {
      const lang = navigator.language === 'es-ES' ? 'es' : 'en'
      const linksMap = (eventLinks as EventLinkItem[]).reduce(
        (num, item) => {
          num[item.eventName] = item
          return num
        },
        {} as Record<string, EventLinkItem>,
      )

      return state.events.map((event) => {
        const linkConfig = linksMap[event.eventName] || linksMap['Empty']
        return {
          ...event,
          eventLink: linkConfig ? linkConfig.url : '#',
          description: linkConfig ? linkConfig.description[lang] : 'No description',
          displayTime: new Date(event.eventTime).toLocaleString(),
        }
      })
    },
    filteredEvents: (state) => {
      let result = [...state.events]

      if (state.filters.eventName) {
        result = result.filter((e) => e.eventName === state.filters.eventName)
      }

      if (state.filters.searchQuery) {
        const query = state.filters.searchQuery.toLowerCase()
        result = result.filter((e) => e.eventID.toLowerCase().includes(query))
      }

      return result
    },
  },
  actions: {
    async fetchDashboardData(range: string) {
      this.loading = true
      this.selectedRange = range
      const now = new Date()
      let start: string
      let end: string

      try {
        const { start, end } = calculateDateRange(range)

        const [runRes, dbRes, funcRes, lbRes] = await Promise.all([
          api.client.get('/scan', { params: { from: start, to: end, eventName: 'RunInstances', count: 'True' } }),
          api.client.get('/scan', {
            params: { from: start, to: end, eventName: 'CreateDBInstance', count: 'True', begin_with: 'True' },
          }),
          api.client.get('/scan', {
            params: { from: start, to: end, eventName: 'CreateFunction', count: 'True', begin_with: 'True' },
          }),
          api.client.get('/scan', { params: { from: start, to: end, eventName: 'CreateLoadBalancer', count: 'True' } }),
        ])

        this.metrics = {
          runInstances: runRes.data,
          createDBInstance: dbRes.data,
          createFunction: funcRes.data,
          createLoadBalancer: lbRes.data,
        }

        // si se hacen a la vez es demasiado pesado y da error timeout
        const eventsRes = await api.client.get('/scan', { params: { from: start, to: end } })

        this.events = eventsRes.data.map((event: any, index: number) => {
          const rawDate = event.eventTime
          const dateObj = new Date(rawDate)

          const pad = (n: number) => n.toString().padStart(2, '0')

          const hh = pad(dateObj.getHours())
          const mm = pad(dateObj.getMinutes())
          const ss = pad(dateObj.getSeconds())
          const day = pad(dateObj.getDate())
          const month = pad(dateObj.getMonth() + 1)
          const year = dateObj.getFullYear()

          return {
            ...event,
            id: index + 1,
            formatedTime: `${hh}:${mm}:${ss} ${day}-${month}-${year}`,
            user: event.userIdentity_userName,
          }
        })
      } catch (error) {
        console.error('Error en la migración de datos AWS:', error)
      } finally {
        this.loading = false
      }
    },
    async getAllUsers() {
      this.loading = true
      try {
        const response = await api.client.get('/users')
        const rawUsers = response.data.usernames || response.data

        const alucloudUsers = rawUsers
          .filter((u: string) => u.startsWith('alucloud'))
          .sort((a: string | any[], b: string | any[]) => Number(a.slice(8)) - Number(b.slice(8)))

        const otherUsers = rawUsers
          .filter((u: string) => !u.startsWith('alucloud'))
          .sort((a: string, b: any) => a.localeCompare(b))

        this.allUsers = [...alucloudUsers, ...otherUsers]

        return this.allUsers
      } catch (error) {
        console.error('Error al obtener la lista de usuarios:', error)
        this.allUsers = []
      } finally {
        this.loading = false
      }
    },
    async fetchUserDashboardData(username: string, start: string, end: string) {
      this.loading = true
      try {
        const [runRes, dbRes, funcRes, lbRes] = await Promise.all([
          api.client.get(`/users/${username}`, { params: { from: start, to: end, eventName: 'RunInstances' } }),
          api.client.get(`/users/${username}`, { params: { from: start, to: end, eventName: 'CreateDBInstance' } }),
          api.client.get(`/users/${username}`, { params: { from: start, to: end, eventName: 'CreateFunction' } }),
          api.client.get(`/users/${username}`, { params: { from: start, to: end, eventName: 'CreateLoadBalancer' } }),
        ])

        this.metrics = {
          runInstances: runRes.data.length,
          createDBInstance: dbRes.data.length,
          createFunction: funcRes.data.length,
          createLoadBalancer: lbRes.data.length,
        }

        const eventsRes = await api.client.get(`/users/${username}`, {
          params: { from: start, to: end },
        })
        this.events = eventsRes.data.map((event: any, index: number) => {
          const dateObj = new Date(event.eventTime)
          const pad = (n: number) => n.toString().padStart(2, '0')

          const hh = pad(dateObj.getHours())
          const mm = pad(dateObj.getMinutes())
          const ss = pad(dateObj.getSeconds())
          const day = pad(dateObj.getDate())
          const month = pad(dateObj.getMonth() + 1)
          const year = dateObj.getFullYear()

          return {
            ...event,
            id: index + 1,
            formatedTime: `${hh}:${mm}:${ss} ${day}-${month}-${year}`,
            user: event.userIdentity_userName,
          }
        })
      } catch (error) {
        console.error(`Error cargando datos del usuario ${username}:`, error)
      } finally {
        this.loading = false
      }
    },
    setEventFilter(name: string) {
      this.filters.eventName = name
    },
  },
})
