import { PDFDocument, rgb } from 'pdf-lib'
import Chart from 'chart.js'

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

function centerText(page, text, y, fontSize = 16, width = 600) {
  const textWidth = fontSize * 0.6 * text.length
  const x = (width - textWidth) / 2
  page.drawText(text, { x, y, size: fontSize, color: rgb(0, 0, 0) })
}

async function createGraphicImage({ ctx, type, data, options }) {
  const chart = new Chart(ctx, { type, data, options })
  await delay(200)
  const dataUrl = ctx.canvas.toDataURL('image/png')
  const imageBytes = await fetch(dataUrl).then(r => r.arrayBuffer())
  chart.destroy()
  return imageBytes
}

function percentPerDay(practData) {
  const result = {}
  for (const percent in practData) {
    const dateStr = new Date(practData[percent]).toISOString().slice(0, 10)
    const pct = Number(percent)
    if (!result[dateStr] || pct > result[dateStr]) result[dateStr] = pct
  }
  return result
}

export async function generarPDFConGraficos(aluclouds, asignatura, milestones) {
  const resultados = {}
  const canvas = document.createElement('canvas')
  canvas.width = 600
  canvas.height = 300
  const ctx = canvas.getContext('2d')
  const colorPalette = [
    'rgba(235, 54, 54, 1)', 'rgba(99, 232, 255, 1)', 'rgba(190, 145, 29, 1)',
    'rgba(201, 87, 176, 1)', 'rgba(6, 27, 87, 1)', 'rgba(36, 189, 100, 1)',
    'rgba(104, 141, 35, 1)', 'rgba(83, 64, 255, 1)', 'rgba(92, 6, 53, 1)'
  ]

  for (const [alucloud, data] of Object.entries(aluclouds)) {
    const pdfDoc = await PDFDocument.create()
    // Gráfico de barras 
    const labels = Object.keys(data).filter(k => k !== 'mark')
    const percentage = labels.map(k => data[k].percent)
    const backgroundColor = percentage.map(p => p >= 80 ? 'rgba(74,227,135,0.2)' : p > 50 ? 'rgba(206,193,83,0.2)' : 'rgba(255,51,0,0.2)')
    const borderColor = percentage.map(p => p >= 80 ? 'rgba(0,102,0,1)' : p > 50 ? 'rgba(197,167,67,1)' : 'rgba(173,39,6,1)')

    const imageBytesBar = await createGraphicImage({
      ctx,
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: `Progreso de ${alucloud}`,
          data: percentage,
          backgroundColor,
          borderColor,
          borderWidth: 1
        }]
      },
      options: {
        responsive: false,
        animation: false,
        scales: { yAxes: [{ ticks: { beginAtZero: true, min: 0, max: 100 } }] }
      }
    })

    const imageBar = await pdfDoc.embedPng(imageBytesBar)

    // Gráfico unificado 
    const practNames = Object.keys(milestones[alucloud])
    const allChangeDaysSet = new Set()
    const practiceDayToPercent = {}

    for (const pract of practNames) {
      const dayToMaxPercent = percentPerDay(milestones[alucloud][pract])
      const practDates = Object.keys(dayToMaxPercent).sort((a, b) => new Date(a) - new Date(b))
      if (practDates.length > 0) {
        const firstDate = practDates[0]
        const zeroDate = new Date(new Date(firstDate).getTime() - 86400000).toISOString().slice(0, 10)
        dayToMaxPercent[zeroDate] = 0
      }
      practiceDayToPercent[pract] = dayToMaxPercent
      Object.keys(dayToMaxPercent).forEach(day => allChangeDaysSet.add(day))
    }

    const allChangeDays = Array.from(allChangeDaysSet).sort()

    const datasets = practNames.map((pract, idx) => {
      const dayData = practiceDayToPercent[pract]
      let lastPercent = null
      return {
        label: pract,
        data: allChangeDays.map(day => {
          if (dayData[day] !== undefined) lastPercent = dayData[day]
          return lastPercent
        }),
        fill: false,
        borderColor: colorPalette[idx % colorPalette.length],
        tension: 0.1,
        pointRadius: 3,
        pointHoverRadius: 4
      }
    })

    const imageBytesLine = await createGraphicImage({
      ctx,
      type: 'line',
      data: {
        labels: allChangeDays.map(d => new Date(d).toLocaleDateString()),
        datasets
      },
      options: {
        responsive: false,
        animation: false,
        spanGaps: true,
        plugins: { tooltip: { enabled: false }, datalabels: { display: false } },
        scales: { yAxes: [{ ticks: { beginAtZero: true, min: 0, max: 100 } }] }
      }
    })

    // Página principal
    const PAGE_WIDTH = 600
    const PAGE_HEIGHT = 800
    const CHART_HEIGHT = 300
    const CHART_WIDTH = 600

    const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
    centerText(page, `${asignatura} - ${alucloud}: ${aluclouds[alucloud].mark}`, PAGE_HEIGHT - 30)

    page.drawImage(imageBar, { x: 0, y: PAGE_HEIGHT - 30 - CHART_HEIGHT - 10, width: CHART_WIDTH, height: CHART_HEIGHT })

    centerText(page, "Time progression", PAGE_HEIGHT - 30 - CHART_HEIGHT - 40)
    const imageLine = await pdfDoc.embedPng(imageBytesLine)
    page.drawImage(imageLine, { x: 0, y: 120, width: CHART_WIDTH, height: CHART_HEIGHT })

    // Gráficos por práctica 
    // for (let i = 0; i < practNames.length; i += 2) {
    //   const pagePract = pdfDoc.addPage([600, 800])
    //   for (let j = 0; j < 2; j++) {
    //     const idx = i + j
    //     if (idx >= practNames.length) break
    //     const pract = practNames[idx]
    //     const dayToPercent = percentPerDay(milestones[alucloud][pract])
    //     let dates = Object.keys(dayToPercent).sort((a, b) => new Date(a) - new Date(b))
    //     let values = dates.map(d => dayToPercent[d])
    //     if (dates.length > 0) {
    //       const first = dates[0]
    //       const zero = new Date(new Date(first).getTime() - 86400000).toISOString().slice(0, 10)
    //       dates = [zero, ...dates]
    //       values = [0, ...values]
    //     }
    //     const labels = dates.map(d => new Date(d).toLocaleDateString())

    //     const imageBytes = await createGraphicImage({
    //       ctx,
    //       type: 'line',
    //       data: {
    //         labels,
    //         datasets: [{
    //           label: pract,
    //           data: values,
    //           fill: false,
    //           borderColor: colorPalette[idx % colorPalette.length],
    //           tension: 0.1
    //         }]
    //       },
    //       options: {
    //         responsive: false,
    //         animation: false,
    //         plugins: { tooltip: { enabled: false }, datalabels: { display: false } },
    //         scales: { yAxes: [{ ticks: { beginAtZero: true, min: 0, max: 100 } }] }
    //       }
    //     })

    //     const image = await pdfDoc.embedPng(imageBytes)
    //     const yBase = j === 0 ? 500 : 100
    //     centerText(pagePract, `${asignatura} - ${alucloud} - ${pract}`, yBase + 230, 14)
    //     const dims = image.scale(1)
    //     pagePract.drawImage(image, { x: 0, y: yBase + 230 - dims.height - 10, width: dims.width, height: dims.height })
    //   }
    // }

    resultados[alucloud] = await pdfDoc.save()
  }

  return resultados
}
