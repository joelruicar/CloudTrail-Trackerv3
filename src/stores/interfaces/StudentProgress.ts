import { AwsEvent } from './aws'
export interface StudentProgress {
  studentIndex: number
  studentName: string
  subject: string
  progress: number // porcentaje 0-100
  completedPractices: number
  totalPractices: number
  events: AwsEvent[]
}
