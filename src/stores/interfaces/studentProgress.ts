import { AwsEvent } from './aws'
export interface StudentProgress {
  studentIndex: number
  studentName: string
  subject: string
  progress: number
  completedPractices: number
  totalPractices: number
  events: AwsEvent[]
}
