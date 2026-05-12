import dayjs from 'dayjs'
import type { StudentProgress } from '../../stores/interfaces/studentProgress'

export type HeatmapPoint = { x: string; y: string; v: number }
export type HeatmapData = {
  students: string[]
  subjects: string[]
  points: HeatmapPoint[]
  studentGrades: Record<string, number>
}

export type GroupMetrics = {
  completed: { subject: string; percent: number }
  notStarted: number
  stuck: { subject: string; percent: number }
}

export const calculateFinalGrade = (subjects: string[], values: Record<string, number>) => {
  if (!subjects.length) return 0
  return subjects.reduce((sum, subject) => sum + (values[subject] ?? 0), 0) / subjects.length / 100
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
      .map((subject) => ({ subject, ratio: ratio(bySubject.get(subject) ?? [], test) }))
      .sort((a, b) => b.ratio - a.ratio)[0]

  const completed = bestByRatio((v) => v >= 80)
  const stuck     = bestByRatio((v) => v > 0 && v < 80)

  // Simpler: a student hasn't started if they have no row with progress > 0
  const startedStudents = new Set(rowsInCourse.filter((row) => row.progress > 0).map((row) => row.studentName))
  const notStarted = students.filter((student) => !startedStudents.has(student)).length

  return {
    completed: { subject: completed?.subject || subjects[0] || '-', percent: Math.round(completed?.ratio || 0) },
    notStarted,
    stuck:     { subject: stuck?.subject     || subjects[0] || '-', percent: Math.round(stuck?.ratio     || 0) },
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