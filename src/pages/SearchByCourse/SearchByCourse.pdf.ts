import { saveAs } from 'file-saver'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

const PAGE_WIDTH = 600
const PAGE_HEIGHT = 500
const MARGIN = 36

const canvasToBytes = async (canvas: HTMLCanvasElement): Promise<ArrayBuffer> =>
  new Promise((resolve, reject) => {
    canvas.toBlob(async (blob) => {
      if (!blob) {
        reject(new Error('Unable to export chart image'))
        return
      }

      resolve(await blob.arrayBuffer())
    }, 'image/png')
  })

export async function downloadCourseChartReport({
  canvas,
  courseLabel,
  studentName,
  gradeLabel,
}: {
  canvas: HTMLCanvasElement
  courseLabel: string
  studentName: string
  gradeLabel: string
}) {
  const pdfDoc = await PDFDocument.create()
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const chartImage = await pdfDoc.embedPng(await canvasToBytes(canvas))
  const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT])

  page.drawText('Course progress report', {
    x: MARGIN,
    y: PAGE_HEIGHT - 42,
    size: 16,
    font: boldFont,
    color: rgb(0, 0, 0),
  })

  page.drawText(`${courseLabel} - ${studentName}`, {
    x: MARGIN,
    y: PAGE_HEIGHT - 66,
    size: 10,
    font,
    color: rgb(0.25, 0.25, 0.25),
  })

  page.drawText(`Grade: ${gradeLabel}`, {
    x: PAGE_WIDTH - MARGIN - boldFont.widthOfTextAtSize(`Grade: ${gradeLabel}`, 12),
    y: PAGE_HEIGHT - 66,
    size: 12,
    font: boldFont,
    color: rgb(0.2, 0.45, 0.28),
  })

  const chartWidth = PAGE_WIDTH - MARGIN * 2
  const chartHeight = chartWidth * (canvas.height / canvas.width)
  page.drawImage(chartImage, {
    x: MARGIN,
    y: PAGE_HEIGHT - 98 - chartHeight,
    width: chartWidth,
    height: chartHeight,
  })

  const pdfBytes = await pdfDoc.save()
  const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' })
  saveAs(blob, `${courseLabel}-${studentName}-chart.pdf`)
}
