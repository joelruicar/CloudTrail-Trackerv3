import { ref } from 'vue'

export function useAcademicYear() {
  const calculateRange = () => {
    const now = new Date()
    const currYear = now.getFullYear()
    const currMonth = now.getMonth()
    let start: Date
    let end: Date

    if (currMonth >= 8) {
      start = new Date(currYear, 8, 1)
      end = new Date(currYear + 1, 6, 31)
    } else {
      start = new Date(currYear - 1, 8, 1)
      end = new Date(currYear, 6, 31)
    }
    return { start, end }
  }

  const range = ref(calculateRange())

  return { range, calculateRange }
}
