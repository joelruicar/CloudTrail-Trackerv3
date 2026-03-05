export interface AwsEvent {
  eventName: string;
  eventID: string;
  eventSource: string;
  userIdentity_userName: string;
  eventTime: string;
}

export interface AwsMetrics {
  total: number;
  runInstances: number;
  createDBInstance: number;
  createFunction: number;
  createLoadBalancer: number;
}