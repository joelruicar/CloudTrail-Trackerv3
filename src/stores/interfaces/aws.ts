export interface AwsEvent {
  eventName: string
  eventID: string
  eventSource: string
  user: string
  eventTime: string
}

export interface AwsMetrics {
  runInstances: number
  createDBInstance: number
  createFunction: number
  createLoadBalancer: number
}
