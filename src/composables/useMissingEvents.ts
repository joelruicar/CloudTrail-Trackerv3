import { computed, type Ref } from 'vue'
import { REFERDATA } from '../data/evenprac'
import eventLinksJson from '../data/event-links.json'

interface StudentProgressRow {
  subject: string
  events: Array<{ eventName: string }>
  [key: string]: any
}

export interface MissingEventRow {
  practice: string
  eventName: string
  missing: number
  eventLink?: string
  description?: string
}

export const missingEventColumns = [
  { key: 'practice',  label: 'Practice',                sortable: true },
  { key: 'eventName', label: 'Event',                   sortable: true },
  { key: 'missing',   label: 'Number of missing events', sortable: true },
]

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

export function useMissingEvents(
  subjects: Ref<string[]>,
  studentProgressData: Ref<StudentProgressRow[]>,
  courseLabel?: Ref<string>,
) {
  const missingEventsRows = computed((): MissingEventRow[] => {
    if (!subjects.value.length || !studentProgressData.value.length) return []

    const useAlternativeReference = ['MUCNAP-ICP', 'MUCC-DDS'].includes(courseLabel?.value || '')
    const referData: Record<string, Record<string, number>> = useAlternativeReference
      ? ((REFERDATA as any).REFERDATA1 ?? {})
      : ((REFERDATA as any).REFERDATA ?? {})
    const subjectOrder = Object.keys(referData)

    const eventCounts: Record<string, number> = {}
    for (const row of studentProgressData.value) {
      for (const ev of row.events || []) {
        eventCounts[ev.eventName] = (eventCounts[ev.eventName] || 0) + 1
      }
    }

    const remaining = { ...eventCounts }
    const subjectsSet = new Set(subjects.value)
    const rows: MissingEventRow[] = []

    for (const subject of subjectOrder) {
      if (!subjectsSet.has(subject)) continue

      const eventsForSub = referData[subject] || {}

      for (const [ename, req] of Object.entries(eventsForSub)) {
        if (ename === 'totalref') continue
        const required = Number(req)
        const available = remaining[ename] ?? 0

        if (available >= required) {
          remaining[ename] = available - required
        } else {
          remaining[ename] = 0
          if (required - available > 0) {
            rows.push({
              practice: subject,
              eventName: ename,
              missing: required - available,
              eventLink: eventLinkMap[ename]?.url,
              description: eventLinkMap[ename]?.description,
            })
          }
        }
      }
    }

    return rows.sort((a, b) => a.practice.localeCompare(b.practice) || b.missing - a.missing)
  })

  return { missingEventsRows }
}