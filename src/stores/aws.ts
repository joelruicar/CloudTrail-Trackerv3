import { REFERDATA } from '../data/evenprac'
import { defineStore } from 'pinia'
import { AwsEvent, AwsMetrics } from './interfaces/aws'
import { StudentProgress } from './interfaces/studentProgress'
import eventLinksJson from '../data/event-links.json'
import { EventLinkItem } from './interfaces/eventLink'
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

const eventLinksMap = (eventLinksJson as EventLinkItem[]).reduce(
  (num, item) => {
    num[item.eventName] = item
    return num
  },
  {} as Record<string, EventLinkItem>,
)

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
    studentRangeFilter: {
      from: 0,
      to: 350,
      subject: '',
    },
    studentProgressData: [] as StudentProgress[],
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
            data: Object.values(counts),
          },
        ],
      }
    },
    formattedEvents: (state) => {
      const lang = navigator.language === 'es-ES' ? 'es' : 'en'

      return state.events.map((event) => {
        const linkConfig = eventLinksMap[event.eventName] || eventLinksMap['Empty']
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

      try {
        const { start, end } = calculateDateRange(range)

        const eventsRes = await api.client.get('/scan', { params: { from: start, to: end } })
        const rawEvents = Array.isArray(eventsRes.data) ? eventsRes.data : []

        const countExact = (eventName: string) =>
          rawEvents.filter((event: any) => event.eventName === eventName).length

        const countStartsWith = (eventName: string) =>
          rawEvents.filter((event: any) => String(event.eventName ?? '').startsWith(eventName)).length

        this.metrics = {
          runInstances: countExact('RunInstances'),
          createDBInstance: countStartsWith('CreateDBInstance'),
          createFunction: countStartsWith('CreateFunction'),
          createLoadBalancer: countExact('CreateLoadBalancer'),
        }

        this.events = rawEvents.map((event: any, index: number) => {
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
            formatedTime: `${day}-${month}-${year} ${hh}:${mm}:${ss}`,
            user: event.userIdentity_userName,
          }
        })
      } catch (error) {
        console.error('Error en la migración de datos AWS:', error)
      } finally {
        this.loading = false
      }
    },
    async getAllUsers(setLoading = true): Promise<string[]> {
      if (setLoading) {
        this.loading = true
      }
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
        return []
      } finally {
        if (setLoading) {
          this.loading = false
        }
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
    async fetchStudentProgressByRangeForSubjects(
      from: number,
      to: number,
      subjects: string[],
      startDate?: string,
      endDate?: string,
    ) {
      this.loading = true
      try {
        this.studentRangeFilter = { from, to, subject: '' }

        const to_date = endDate || formatLocal(new Date(), false)
        const from_date = startDate || formatLocal(new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000), false)

        const allUsersList = await this.getAllUsers(false)
        const studentUsers = allUsersList.filter((u) => u.startsWith('alucloud')).slice(from, to)

        const referDataBySubject = (REFERDATA.REFERDATA || {}) as Record<string, Record<string, number>>
        const normalizedSubjects = subjects.filter(Boolean)
        const normalizedSubjectsSet = new Set(normalizedSubjects)
        const subjectOrder = Object.keys(referDataBySubject)
        const progressDataList: StudentProgress[] = []

        for (const username of studentUsers) {
          try {
            const eventsRes = await api.client.get(`/users/${username}`, {
              params: { from: from_date, to: to_date },
            })

            const events = (eventsRes.data || []) as AwsEvent[]
            const studentIndex = parseInt(username.replace('alucloud', '')) || 0
            const remainingEventCounts = events.reduce<Record<string, number>>((acc, event) => {
              const eventName = event.eventName
              acc[eventName] = (acc[eventName] || 0) + 1
              return acc
            }, {})

            for (const subject of subjectOrder) {
              const allowedEvents: Record<string, number> = referDataBySubject[subject] || {}
              let completedPractices = 0

              Object.entries(allowedEvents).forEach(([eventName, requiredCount]) => {
                const observedCount = remainingEventCounts[eventName] || 0
                const consumed = Math.min(observedCount, requiredCount)
                completedPractices += consumed
                remainingEventCounts[eventName] = Math.max(0, observedCount - consumed)
              })

              const totalPractices = Object.values(allowedEvents).reduce((sum, val) => sum + val, 0)
              const progress = totalPractices > 0 ? (completedPractices / totalPractices) * 100 : 0

              if (!normalizedSubjectsSet.has(subject)) {
                continue
              }

              progressDataList.push({
                studentIndex,
                studentName: username,
                subject,
                progress: Math.round(Math.min(progress, 100) * 100) / 100,
                completedPractices,
                totalPractices,
                events: events.filter((e: AwsEvent) => e.eventName in allowedEvents),
              })
            }
          } catch (error) {
            console.error(`Error obteniendo datos del usuario ${username}:`, error)
          }
        }

        this.studentProgressData = progressDataList
      } catch (error) {
        console.error('Error fetching student progress by subjects:', error)
      } finally {
        this.loading = false
      }
    },
  },
})