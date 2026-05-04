import { computed, type Ref } from 'vue'
import { REFERDATA } from '../data/evenprac'
import eventLinksJson from '../data/event-links.json'

interface StudentProgressRow {
  subject: string
  events: Array<{ eventName: string }>
  [key: string]: any
}

interface MissingEventRow {
  practice: string
  eventName: string
  missing: number
  eventLink?: string
  description?: string
}

const locale = navigator.language.startsWith('es') ? 'es' : 'en'

const eventLinkMap = (eventLinksJson as any[]).reduce(
  (acc: Record<string, { url: string; description?: string }>, it) => {
    const desc = it.description
    acc[it.eventName] = {
      url: it.url,
      description: typeof desc === 'object' ? (desc[locale] ?? desc['en'] ?? '') : desc,
    }
    return acc
  },
  {},
)

const referData: Record<string, Record<string, number>> = (REFERDATA as any).REFERDATA ?? {}

export function useMissingEvents(
  subjects: Ref<string[]>,
  studentProgressData: Ref<StudentProgressRow[]>,
) {
  const missingEventsRows = computed((): MissingEventRow[] => {
    if (!subjects.value.length || !studentProgressData.value.length) return []
    const allServices: Record<string, number> = {}
    for (const row of studentProgressData.value) {
      for (const ev of row.events || []) {
        allServices[ev.eventName] = (allServices[ev.eventName] || 0) + 1
      }
    }

    const rows: MissingEventRow[] = []

    for (const subject of subjects.value) {
      const eventsForSub = referData[subject] || {}
      for (const [ename, req] of Object.entries(eventsForSub)) {
        if (ename === 'totalref') continue
        const required = Number(req)

        if (allServices[ename] > 0) {
          if (allServices[ename] >= required) {
            allServices[ename] -= required
          } else {
            rows.push({
              practice: subject,
              eventName: ename,
              missing: required - allServices[ename],
              eventLink: eventLinkMap[ename]?.url,
              description: eventLinkMap[ename]?.description,
            })
            allServices[ename] = 0
          }
        } else if (required > 0) {
          rows.push({
            practice: subject,
            eventName: ename,
            missing: required,
            eventLink: eventLinkMap[ename]?.url,
            description: eventLinkMap[ename]?.description,
          })
        }
      }
    }

    return rows.sort((a, b) => a.practice.localeCompare(b.practice) || b.missing - a.missing)
  })

  return { missingEventsRows }
}