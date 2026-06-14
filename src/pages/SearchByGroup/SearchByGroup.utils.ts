import dayjs from 'dayjs'
import { REFERDATA } from '../../data/evenprac'
import type { StudentProgress } from '../../stores/interfaces/studentProgress'

type HeatmapPoint = { x: string; y: string; v: number }
export type HeatmapData = {
  students: string[]
  subjects: string[]
  points: HeatmapPoint[]
  studentGrades: Record<string, number>
}

export type GroupMetrics = {
  completed: { subject: string; percent: number; count: number }
  notStarted: number
  stuck: { subject: string; percent: number; count: number }
}

export const calculateFinalGrade = (subjects: string[], values: Record<string, number>) => {
  if (!subjects.length) return 0
  return subjects.reduce((sum, subject) => {
    const progress = values[subject] ?? 0
    return sum + (progress >= 80 ? progress : 0)
  }, 0) / subjects.length / 10
}

export const formatPracticeRows = (rows: StudentProgress[]) =>
  rows.map(({ subject, studentName, progress, events }) => {
    // ISO strings are lexicographically comparable — no Date conversion needed
    const lastEvent = events.reduce<string>(
      (latest, { eventTime }) => (eventTime && eventTime > latest ? eventTime : latest),
      '',
    )

    return {
      practiceName: subject,
      user: studentName,
      completionPercent: Number(progress.toFixed(2)),
      completionPercentLabel: `${progress.toFixed(2)}%`,
      lastRelatedEventDate: lastEvent ? dayjs(lastEvent).format('HH:mm:ss DD-MM-YYYY') : 'N/A',
    }
  })

export const buildHeatmapData = (rows: StudentProgress[], baseSubjects: string[]): HeatmapData => {
  // Map preserves insertion order — no index tracking needed
  const byStudent = new Map<string, Record<string, number>>()

  rows.forEach((row) => {
    if (!baseSubjects.includes(row.subject)) return
    if (!byStudent.has(row.studentName)) byStudent.set(row.studentName, {})
    byStudent.get(row.studentName)![row.subject] = Number(row.progress.toFixed(2))
  })

  const students = Array.from(byStudent.keys())
  const points: HeatmapPoint[] = []
  const studentGrades: Record<string, number> = {}

  students.forEach((student) => {
    const values = byStudent.get(student)!
    baseSubjects.forEach((subject) => points.push({ x: subject, y: student, v: values[subject] ?? 0 }))

    const note = calculateFinalGrade(baseSubjects, values)
    studentGrades[student] = note
    points.push({ x: 'Nota', y: student, v: Number(note.toFixed(1)) })
  })

  return { students, subjects: [...baseSubjects, 'Nota'], points, studentGrades }
}

export const buildSingleStudentFinalGrade = (rows: StudentProgress[], subjects: string[]) => {
  if (!subjects.length || !rows.length) return null

  const values = rows.reduce<Record<string, number>>((acc, row) => {
    if (subjects.includes(row.subject)) acc[row.subject] = Number(row.progress.toFixed(2))
    return acc
  }, {})

  return Number(calculateFinalGrade(subjects, values).toFixed(1))
}

export const buildGroupMetrics = (rows: StudentProgress[], subjects: string[]): GroupMetrics => {
  const subjectsSet = new Set(subjects)
  const rowsInCourse = rows.filter((row) => subjectsSet.has(row.subject))
  const students = Array.from(new Set(rowsInCourse.map((row) => row.studentName)))
  const totalStudents = students.length

  const bySubject = new Map(subjects.map((subject) => [subject, [] as number[]]))
  rowsInCourse.forEach((row) => bySubject.get(row.subject)?.push(row.progress))

  const ratio = (values: number[], test: (value: number) => boolean) =>
    totalStudents ? (values.filter(test).length / totalStudents) * 100 : 0

  const bestByRatio = (test: (value: number) => boolean) =>
    subjects
      .map((subject) => {
        const values = bySubject.get(subject) ?? []
        return {
          subject,
          ratio: ratio(values, test),
          count: values.filter(test).length,
        }
      })
      .sort((a, b) => b.ratio - a.ratio)[0]

  const completed = bestByRatio((v) => v >= 80)
  const stuck     = bestByRatio((v) => v > 0 && v < 80)

  // Simpler: a student hasn't started if they have no row with progress > 0
  const startedStudents = new Set(rowsInCourse.filter((row) => row.progress > 0).map((row) => row.studentName))
  const notStarted = students.filter((student) => !startedStudents.has(student)).length

  return {
    completed: {
      subject: completed?.subject || subjects[0] || '-',
      percent: Math.round(completed?.ratio || 0),
      count: Math.round((completed?.ratio || 0) * totalStudents / 100),
    },
    notStarted,
    stuck: {
      subject: stuck?.subject || subjects[0] || '-',
      percent: Math.round(stuck?.ratio || 0),
      count: stuck?.count || 0,
    },
  }
}

const progressColor = (
  value: number,
  colors: { success: string; warning: string; danger: string; empty: string },
) => {
  if (value === 0)  return colors.empty
  if (value >= 80)  return colors.success
  if (value > 40)   return colors.warning
  return colors.danger
}

export const buildAverageProgressChart = (
  rows: StudentProgress[],
  labels: string[],
  colors: { success: string; warning: string; danger: string; empty: string },
) => {
  const subjectRows = new Map(labels.map((label) => [label, [] as StudentProgress[]]))
  rows.forEach((row) => subjectRows.get(row.subject)?.push(row))

  const data = labels.map((label) => {
    const progressRows = subjectRows.get(label) ?? []
    if (!progressRows.length) return 0
    return Number((progressRows.reduce((sum, row) => sum + row.progress, 0) / progressRows.length).toFixed(2))
  })

  return {
    labels,
    datasets: [{
      label: 'Promedio de Avance (%)',
      backgroundColor: data.map((value) => progressColor(value, colors)),
      data,
    }],
  }
}

const getReferenceData = (courseLabel: string): Record<string, Record<string, number>> => {
  if (courseLabel === 'MUCNAP-ICP' || courseLabel === 'MUCC-DDS') {
    return REFERDATA.REFERDATA1 as Record<string, Record<string, number>>
  }

  return REFERDATA.REFERDATA as Record<string, Record<string, number>>
}

const quantile = (values: number[], q: number): number => {
  if (!values.length) return 0

  const sorted = [...values].sort((a, b) => a - b)
  const pos = (sorted.length - 1) * q
  const base = Math.floor(pos)
  const rest = pos - base
  const next = sorted[base + 1]

  if (next === undefined) return sorted[base]
  return sorted[base] + rest * (next - sorted[base])
}

const buildSubjectTimeline = (row: StudentProgress, allowedEvents: Record<string, number>) => {
  const events = [...row.events].sort((a, b) => new Date(a.eventTime).getTime() - new Date(b.eventTime).getTime())
  const totalRequired = Object.values(allowedEvents).reduce((sum, value) => sum + value, 0)

  if (!events.length || !totalRequired) return {} as Record<string, number>

  const remaining = { ...allowedEvents }
  const firstDay = dayjs(events[0].eventTime).format('YYYY-MM-DD')
  const timeline: Record<string, number> = {
    [dayjs(firstDay).subtract(1, 'day').format('YYYY-MM-DD')]: 0,
  }

  let completed = 0
  for (const event of events) {
    if (!remaining[event.eventName]) continue
    remaining[event.eventName] -= 1
    completed += 1

    const day = dayjs(event.eventTime).format('YYYY-MM-DD')
    timeline[day] = Number(((completed / totalRequired) * 100).toFixed(2))
  }

  return timeline
}

export const buildLearningBandChart = (
  rows: StudentProgress[],
  subjects: string[],
  courseLabel: string,
) => {
  if (!rows.length || !subjects.length) {
    return { labels: [], datasets: [] as Array<Record<string, unknown>> }
  }

  const referenceData = getReferenceData(courseLabel)
  const students = Array.from(new Set(rows.map((row) => row.studentName)))
  const allDays = new Set<string>()

  const byStudent = new Map<string, Map<string, Record<string, number>>>()
  for (const student of students) byStudent.set(student, new Map())

  for (const row of rows) {
    if (!subjects.includes(row.subject)) continue

    const allowedEvents = referenceData[row.subject] || {}
    const timeline = buildSubjectTimeline(row, allowedEvents)

    byStudent.get(row.studentName)?.set(row.subject, timeline)
    Object.keys(timeline).forEach((day) => allDays.add(day))
  }

  const sortedDays = Array.from(allDays).sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
  if (!sortedDays.length) {
    return { labels: [], datasets: [] as Array<Record<string, unknown>> }
  }

  const studentSeries = students.map((student) => {
    const subjectTimelines = byStudent.get(student) || new Map<string, Record<string, number>>()
    const latestBySubject = new Map(subjects.map((subject) => [subject, 0]))

    return sortedDays.map((day) => {
      for (const subject of subjects) {
        const value = subjectTimelines.get(subject)?.[day]
        if (value !== undefined) latestBySubject.set(subject, value)
      }

      const total = Array.from(latestBySubject.values()).reduce((sum, value) => sum + value, 0)
      return Number((total / subjects.length).toFixed(2))
    })
  })

  const p25: number[] = []
  const p50: number[] = []
  const p75: number[] = []

  for (let index = 0; index < sortedDays.length; index += 1) {
    const values = studentSeries.map((series) => series[index])
    p25.push(Number(quantile(values, 0.25).toFixed(2)))
    p50.push(Number(quantile(values, 0.5).toFixed(2)))
    p75.push(Number(quantile(values, 0.75).toFixed(2)))
  }

  return {
    labels: sortedDays.map((day) => dayjs(day).format('DD/MM')),
    datasets: [
      {
        label: 'P75',
        data: p75,
        borderColor: 'rgba(77, 212, 95, 0.65)',
        borderDash: [4, 4],
        pointRadius: 0,
        fill: false,
        tension: 0.18,
      },
      {
        label: 'P25',
        data: p25,
        borderColor: 'rgba(77, 212, 95, 0.65)',
        borderDash: [4, 4],
        backgroundColor: 'rgba(77, 212, 99, 0.22)',
        pointRadius: 0,
        fill: '-1',
        tension: 0.18,
      },
      {
        label: 'Median',
        data: p50,
        borderColor: 'rgb(20, 136, 45)',
        pointBackgroundColor: 'rgb(20, 136, 45)',
        pointRadius: 2,
        pointHoverRadius: 4,
        fill: false,
        tension: 0.2,
      },
    ],
  }
}
