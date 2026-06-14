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

const CHART_WIDTH = 900
const CHART_HEIGHT = 420
const PAGE_WIDTH = 600
const PAGE_HEIGHT = 800
const PAGE_MARGIN = 36
const PDF_CHART_WIDTH = PAGE_WIDTH - PAGE_MARGIN * 2
const PDF_CHART_HEIGHT = 220

const colorPalette = [
  'rgba(66, 133, 244, 1)',
  'rgba(15, 157, 88, 1)',
  'rgba(244, 180, 0, 1)',
  'rgba(219, 68, 55, 1)',
  'rgba(171, 71, 188, 1)',
  'rgba(0, 172, 193, 1)',
  'rgba(124, 179, 66, 1)',
  'rgba(251, 140, 0, 1)',
  'rgba(84, 110, 122, 1)',
]

const waitForPaint = () => new Promise<void>((resolve) => {
  if (typeof requestAnimationFrame !== 'undefined') {
    requestAnimationFrame(() => resolve())
  } else {
    setTimeout(resolve, 100)
  }
})

const canvasToBytes = (canvas: HTMLCanvasElement): Promise<ArrayBuffer> =>
  new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => blob
        ? blob.arrayBuffer().then(resolve).catch(reject)
        : reject(new Error('Unable to render chart image')),
      'image/png',
    )
  })

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
          value >= 80 ? 'rgba(80, 160, 105, 0.86)' : value > 40 ? 'rgba(225, 169, 70, 0.86)' : 'rgba(210, 92, 92, 0.86)'
        )),
        borderColor: data.map((value) => (
          value >= 80 ? 'rgba(58, 125, 80, 1)' : value > 40 ? 'rgba(183, 128, 37, 1)' : 'rgba(170, 66, 66, 1)'
        )),
        borderWidth: 0,
        borderRadius: 10,
        maxBarThickness: 46,
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
        backgroundColor: colorPalette[index % colorPalette.length],
        borderWidth: 2,
        tension: 0.25,
        pointRadius: 2,
        pointHoverRadius: 3,
      }
    }),
  }
}

const baseScales = {
  x: {
    grid: { display: false },
    ticks: {
      color: '#4b5563',
      font: { size: 11, family: 'Helvetica' },
      maxRotation: 35,
      minRotation: 0,
      autoSkip: true,
      maxTicksLimit: 10,
    },
  },
  y: {
    beginAtZero: true,
    min: 0,
    max: 100,
    grid: { color: 'rgba(15, 23, 42, 0.08)' },
    border: { display: false },
    ticks: {
      color: '#6b7280',
      font: { size: 11, family: 'Helvetica' },
      stepSize: 20,
    },
  },
}

const drawHeader = (
  page: PDFPage,
  font: PDFFont,
  boldFont: PDFFont,
  courseLabel: string,
  studentName: string,
  mark: string,
) => {
  page.drawText('Student progress report', {
    x: PAGE_MARGIN,
    y: PAGE_HEIGHT - 42,
    size: 16,
    font: boldFont,
    color: rgb(0, 0, 0),
  })

  page.drawText(`${courseLabel} - ${studentName}`, {
    x: PAGE_MARGIN,
    y: PAGE_HEIGHT - 66,
    size: 10,
    font,
    color: rgb(0.25, 0.25, 0.25),
  })

  const gradeText = `Grade: ${mark}/10`
  page.drawText(gradeText, {
    x: PAGE_WIDTH - PAGE_MARGIN - boldFont.widthOfTextAtSize(gradeText, 12),
    y: PAGE_HEIGHT - 66,
    size: 12,
    font: boldFont,
    color: rgb(0.2, 0.45, 0.28),
  })
}

const drawSectionTitle = (page: PDFPage, font: PDFFont, text: string, y: number) => {
  page.drawText(text, {
    x: PAGE_MARGIN,
    y,
    size: 11,
    font,
    color: rgb(0.18, 0.18, 0.18),
  })
}


const buildPdfForStudent = async (courseLabel: string, studentRows: StudentProgress[], subjects: string[]): Promise<Uint8Array> => {
  const pdfDoc = await PDFDocument.create()
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const studentName = studentRows[0]?.studentName ?? 'Unknown'

  const barImageBytes = await createChartImage('bar', buildProgressChartData(studentRows), {
    layout: { padding: { top: 22, right: 12, bottom: 4, left: 4 } },
    scales: baseScales,
    datasets: {
      bar: {
        barPercentage: 0.58,
        categoryPercentage: 0.78,
      },
    },
    plugins: {
      legend: { display: false },
      datalabels: {
        align: 'end',
        anchor: 'end',
        offset: 4,
        color: '#374151',
        font: { size: 11, weight: 'bold' },
        formatter: (value: number) => Math.round(value),
      },
    },
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
    layout: {
      padding: { top: 26, right: 12, bottom: 0, left: 4 },
    },
    scales: {
      ...baseScales,
      x: {
        ...baseScales.x,
        ticks: {
          ...baseScales.x.ticks,
          maxTicksLimit: 8,
          maxRotation: 30,
        },
      },
    },
    plugins: {
      legend: {
        position: 'bottom',
        align: 'start',
        labels: {
          color: '#4b5563',
          boxWidth: 10,
          boxHeight: 10,
          padding: 10,
          usePointStyle: true,
          pointStyle: 'line',
          font: { size: 10 },
        },
      },
      datalabels: {
        display: (context: DataLabelsContext) => {
          const idx = firstAbove80.get(context.datasetIndex)
          return idx !== undefined && idx !== -1 && idx === context.dataIndex
        },
        formatter: (value: number) => `${value}%`,
        anchor: 'end',
        align: 'top',
        offset: 3,
        font: { size: 9, weight: 'bold' },
        color: (context: DataLabelsContext) => darkenColor(colorPalette[context.datasetIndex % colorPalette.length], 0.6),
      },
    },
  })

  const barImage = await pdfDoc.embedPng(barImageBytes)
  const lineImage = await pdfDoc.embedPng(timelineImageBytes)
  const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT])

  const progressBySubject = Object.fromEntries(studentRows.map((r) => [r.subject, r.progress]))
  const mark = subjects.length ? calculateFinalGrade(subjects, progressBySubject).toFixed(1) : '0.0'

  drawHeader(page, font, boldFont, courseLabel, studentName, mark)
  drawSectionTitle(page, font, 'Progress by practice', PAGE_HEIGHT - 98)
  page.drawImage(barImage, {
    x: PAGE_MARGIN,
    y: PAGE_HEIGHT - 330,
    width: PDF_CHART_WIDTH,
    height: PDF_CHART_HEIGHT,
  })

  drawSectionTitle(page, font, 'Time progression', PAGE_HEIGHT - 366)
  page.drawImage(lineImage, {
    x: PAGE_MARGIN,
    y: PAGE_HEIGHT - 600,
    width: PDF_CHART_WIDTH,
    height: PDF_CHART_HEIGHT,
  })

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
  const blob = new Blob([pdfBytes as unknown as Uint8Array<ArrayBuffer>], { type: 'application/pdf' })
  saveAs(blob, `${courseLabel}-${studentName}-reporte.pdf`)
}