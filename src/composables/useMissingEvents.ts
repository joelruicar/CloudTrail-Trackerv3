import { computed, type Ref } from 'vue'
import { REFERDATA } from '../data/evenprac'
import { resolveEventLink } from '../services/eventLinks'

type ReferenceDataSet = Record<string, Record<string, number>>

interface StudentProgressRow {
  subject: string
  events: Array<{ eventName: string }>
}

export interface MissingEventRow {
  practice: string
  eventName: string
  missing: number
  eventLink?: string
}

export function useMissingEvents(
  subjects: Ref<string[]>,
  studentProgressData: Ref<StudentProgressRow[]>,
  courseLabel?: Ref<string>,
) {
  const missingEventsRows = computed((): MissingEventRow[] => {
    if (!subjects.value.length || !studentProgressData.value.length) return []

    const useAlternativeReference = ['MUCNAP-ICP', 'MUCC-DDS'].includes(courseLabel?.value || '')
    const references = REFERDATA as {
      REFERDATA?: ReferenceDataSet
      REFERDATA1?: ReferenceDataSet
    }
    const referData = useAlternativeReference
      ? (references.REFERDATA1 ?? {})
      : (references.REFERDATA ?? {})
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
            const linkConfig = resolveEventLink(ename)

            rows.push({
              practice: subject,
              eventName: ename,
              missing: required - available,
              eventLink: linkConfig.url,
            })
          }
        }
      }
    }

    return rows.sort((a, b) => a.practice.localeCompare(b.practice) || b.missing - a.missing)
  })

  return { missingEventsRows }
}