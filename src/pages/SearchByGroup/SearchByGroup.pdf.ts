import dayjs from 'dayjs'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import {
  Chart,
  Title,
  Tooltip,
  Legend,
  BarElement,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Filler,
} from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import type { ChartData, ChartOptions } from 'chart.js'
import type { Context as DataLabelsContext } from 'chartjs-plugin-datalabels'
import type { PDFFont, PDFPage } from 'pdf-lib'

import { REFERDATA } from '../../data/evenprac'
import { calculateFinalGrade } from './SearchByGroup.utils'
import type { StudentProgress } from '../../stores/interfaces/studentProgress'

Chart.register(Title, Tooltip, Legend, BarElement, LineElement, CategoryScale, LinearScale, PointElement, Filler, ChartDataLabels)

const CHART_WIDTH = 600
const CHART_HEIGHT = 300
const PAGE_WIDTH = 600
const PAGE_HEIGHT = 800

const colorPalette = [
  'rgba(235, 54, 54, 1)',
  'rgba(99, 232, 255, 1)',
  'rgba(190, 145, 29, 1)',
  'rgba(201, 87, 176, 1)',
  'rgba(6, 27, 87, 1)',
  'rgba(36, 189, 100, 1)',
  'rgba(104, 141, 35, 1)',
  'rgba(83, 64, 255, 1)',
  'rgba(92, 6, 53, 1)',
]

const waitForPaint = () => new Promise<void>((resolve) => {
  if (typeof requestAnimationFrame !== 'undefined') {
    requestAnimationFrame(() => resolve())
  } else {
    setTimeout(resolve, 100)
  }
})

const canvasToBytes = async (canvas: HTMLCanvasElement): Promise<ArrayBuffer> => {
  return new Promise<ArrayBuffer>((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Canvas blob conversion timeout'))
    }, 5000)

    canvas.toBlob(
      async (blob) => {
        clearTimeout(timeout)
        if (!blob) {
          reject(new Error('Unable to render chart image'))
          return
        }
        try {
          const buffer = await blob.arrayBuffer()
          resolve(buffer)
        } catch (error) {
          reject(error)
        }
      },
      'image/png',
    )
  })
}

type ReportChartType = 'bar' | 'line'
type ReportChartData = ChartData<ReportChartType, number[], string>
type ReportChartOptions = ChartOptions<ReportChartType>

const createChartImage = async (
  type: ReportChartType,
  data: ReportChartData,
  options: ReportChartOptions,
): Promise<ArrayBuffer> => {
  const canvas = document.createElement('canvas')
  canvas.width = CHART_WIDTH
  canvas.height = CHART_HEIGHT
  canvas.style.display = 'none'
  document.body.appendChild(canvas)

  try {
    const chart = new Chart(canvas, {
      type,
      data,
      options: {
        responsive: false,
        animation: false,
        ...options,
      },
    })

    await waitForPaint()
    const bytes = await canvasToBytes(canvas)
    chart.destroy()
    return bytes
  } finally {
    document.body.removeChild(canvas)
  }
}

const drawCenteredText = (page: PDFPage, font: PDFFont, text: string, y: number, size = 16) => {
  try {
    const textWidth = font.widthOfTextAtSize(text, size)
    const x = (PAGE_WIDTH - textWidth) / 2
    page.drawText(text, {
      x,
      y,
      size,
      font,
      color: rgb(0, 0, 0),
    })
  } catch (error) {
    console.warn('Error drawing centered text:', error)
    page.drawText(text, {
      x: 10,
      y,
      size,
      font,
      color: rgb(0, 0, 0),
    })
  }
}

// Darkens an rgba color by reducing each channel by the given factor (0-1)
const darkenColor = (rgba: string, factor = 0.6): string => {
  const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
  if (!match) return rgba
  const [r, g, b] = match.slice(1).map((v) => Math.round(Number(v) * factor))
  return `rgba(${r}, ${g}, ${b}, 1)`
}

const getReferenceData = (courseLabel: string) => {
  if (courseLabel === 'MUCNAP-ICP' || courseLabel === 'MUCC-DDS') {
    return REFERDATA.REFERDATA1
  }

  return REFERDATA.REFERDATA
}


const buildCompletionTimeline = (rows: StudentProgress[], subjects: string[], courseLabel: string) => {
  const referenceData = getReferenceData(courseLabel) as Record<string, Record<string, number>>
  const allDays = new Set<string>()
  const subjectToDayProgress: Record<string, Record<string, number>> = {}

  for (const subject of subjects) {
    const row = rows.find((item) => item.subject === subject)
    const allowedEvents = (referenceData[subject] || {}) as Record<string, number>
    const events = [...(row?.events || [])].sort((a, b) => new Date(a.eventTime).getTime() - new Date(b.eventTime).getTime())

    if (!events.length || !Object.keys(allowedEvents).length) {
      subjectToDayProgress[subject] = {}
      continue
    }

    const totals = { ...allowedEvents }

    const totalRequired = Object.values(totals).reduce((sum, value) => sum + value, 0)
    if (!totalRequired) {
      subjectToDayProgress[subject] = {}
      continue
    }

    const firstDay = dayjs(events[0].eventTime).format('YYYY-MM-DD')
    const dayProgress: Record<string, number> = {
      [dayjs(firstDay).subtract(1, 'day').format('YYYY-MM-DD')]: 0,
    }

    let completed = 0
    for (const event of events) {
      if (!totals[event.eventName]) continue

      totals[event.eventName] -= 1
      completed += 1

      const day = dayjs(event.eventTime).format('YYYY-MM-DD')
      const percent = Number(((completed / totalRequired) * 100).toFixed(2))
      dayProgress[day] = percent
      allDays.add(day)
    }

    subjectToDayProgress[subject] = dayProgress
    Object.keys(dayProgress).forEach((day) => allDays.add(day))
  }

  return {
    allDays: Array.from(allDays).sort((a, b) => new Date(a).getTime() - new Date(b).getTime()),
    subjectToDayProgress,
  }
}

const buildProgressChartData = (rows: StudentProgress[]) => {
  const labels = Array.from(new Set(rows.map((row) => row.subject)))
  const progressMap = new Map(rows.map((row) => [row.subject, row.progress]))
  const data = labels.map((label) => Number((progressMap.get(label) ?? 0).toFixed(2)))

  return {
    labels,
    datasets: [
      {
        label: 'Progress (%)',
        data,
        backgroundColor: data.map((value) => (
          value >= 80 ? 'rgba(74,227,135,0.2)' : value > 50 ? 'rgba(206,193,83,0.2)' : 'rgba(255,51,0,0.2)'
        )),
        borderColor: data.map((value) => (
          value >= 80 ? 'rgba(0,102,0,1)' : value > 50 ? 'rgba(197,167,67,1)' : 'rgba(173,39,6,1)'
        )),
        borderWidth: 1,
      },
    ],
  }
}

const buildTimelineChartData = (rows: StudentProgress[], subjects: string[], courseLabel: string) => {
  const { allDays, subjectToDayProgress } = buildCompletionTimeline(rows, subjects, courseLabel)

  return {
    labels: allDays.map((day) => dayjs(day).format('DD/MM/YYYY')),
    datasets: subjects.map((subject, index) => {
      const dayProgress = subjectToDayProgress[subject] || {}
      let lastPercent = 0

      return {
        label: subject,
        data: allDays.map((day) => {
          if (dayProgress[day] !== undefined) {
            lastPercent = dayProgress[day]
          }

          return lastPercent
        }),
        fill: false,
        borderColor: colorPalette[index % colorPalette.length],
        tension: 0.15,
        pointRadius: 3,
        pointHoverRadius: 4,
      }
    }),
  }
}


const buildPdfForStudent = async (courseLabel: string, studentRows: StudentProgress[], subjects: string[]): Promise<Uint8Array> => {
  const pdfDoc = await PDFDocument.create()
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const studentName = studentRows[0]?.studentName || 'alucloud'

  const barImageBytes = await createChartImage('bar', buildProgressChartData(studentRows), {
    scales: { y: { beginAtZero: true, min: 0, max: 100 } },
    plugins: { legend: { display: false } },
  })

  const timelineData = buildTimelineChartData(studentRows, subjects, courseLabel)

  // Pre-compute the exact dataIndex where each dataset first reaches >= 80
  // so display order doesn't depend on chartjs internal call order
  const firstAbove80 = new Map(
    timelineData.datasets.map((ds, i) => {
      const idx = (ds.data as number[]).findIndex((v) => v >= 80)
      return [i, idx] // -1 if never reaches 80
    })
  )

  const timelineImageBytes = await createChartImage('line', timelineData, {
    spanGaps: true,
    scales: {
      y: {
        beginAtZero: true,
        min: 0,
        max: 100,
      },
    },
    layout: {
      padding: { top: 28 }, // extra room so labels above 100% line don't clip
    },
    plugins: {
      legend: { position: 'bottom' },
      datalabels: {
        display: (context: DataLabelsContext) => {
          const idx = firstAbove80.get(context.datasetIndex)
          return idx !== undefined && idx !== -1 && idx === context.dataIndex
        },
        formatter: (value: number) => `${value}%`,
        anchor: 'end',
        align: 'top',
        offset: 2, // closer to the line
        font: { size: 9, weight: 'bold' },
        color: (context: DataLabelsContext) => darkenColor(colorPalette[context.datasetIndex % colorPalette.length], 0.6),
      },
    },
  })

  const barImage = await pdfDoc.embedPng(barImageBytes)
  const lineImage = await pdfDoc.embedPng(timelineImageBytes)
  const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT])

  const progressBySubject = Object.fromEntries(studentRows.map((r) => [r.subject, r.progress]))
  const mark = subjects.length ? calculateFinalGrade(subjects, progressBySubject).toFixed(2) : '0.00'
  drawCenteredText(page, boldFont, `${courseLabel} - ${studentName}: ${mark}`, PAGE_HEIGHT - 34, 16)
  page.drawImage(barImage, { x: 0, y: PAGE_HEIGHT - 350, width: CHART_WIDTH, height: CHART_HEIGHT })
  drawCenteredText(page, font, 'Time progression', PAGE_HEIGHT - 365, 14)
  page.drawImage(lineImage, { x: 0, y: 120, width: CHART_WIDTH, height: CHART_HEIGHT })

  return pdfDoc.save()
}

export async function downloadStudentProgressReports(
  rows: StudentProgress[],
  courseLabel: string,
  subjects: string[],
  from: number,
  to: number,
) {
  const groupedRows = rows.reduce<Record<string, StudentProgress[]>>((acc, row) => {
    if (!acc[row.studentName]) acc[row.studentName] = []
    acc[row.studentName].push(row)
    return acc
  }, {})

  const students = Object.keys(groupedRows)

  if (!students.length) return

  const pdfsByStudent = await Promise.all(
    students.map(async (studentName) => [studentName, await buildPdfForStudent(courseLabel, groupedRows[studentName], subjects)] as const),
  )

  if (pdfsByStudent.length > 1) {
    const zip = new JSZip()
    for (const [studentName, pdfBytes] of pdfsByStudent) {
      zip.file(`${courseLabel}-${studentName}-reporte.pdf`, pdfBytes)
    }

    const blob = await zip.generateAsync({ type: 'blob' })
    saveAs(blob, `${courseLabel}:${from}-${to}.zip`)
    return
  }

  const [studentName, pdfBytes] = pdfsByStudent[0]
  const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' })
  saveAs(blob, `${courseLabel}-${studentName}-reporte.pdf`)
}
