export interface AwsEvent {
  Event: string
  eventID: string
  eventSource: string
  User: string
  TimeStamp: string
}

export interface AwsMetrics {
  runInstances: number
  createDBInstance: number
  createFunction: number
  createLoadBalancer: number
}
