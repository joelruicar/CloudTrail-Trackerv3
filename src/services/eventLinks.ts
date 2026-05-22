import eventLinksJson from '../data/event-links.json'
import { EventLinkItem } from '../stores/interfaces/eventLink'

interface EventLinkResult {
  url: string
}

interface AwsDocsRoute {
  docsPath: string
  apiPrefix?: string
}

interface InferredEvent {
  eventName: string
  eventSource: string
}

const DEFAULT_EVENT_LINK = 'https://docs.aws.amazon.com/'

const eventLinksMap = (eventLinksJson as EventLinkItem[]).reduce(
  (acc, item) => {
    acc[item.eventName] = item
    return acc
  },
  {} as Record<string, EventLinkItem>,
)

const eventLinksMapByName = Object.values(eventLinksMap).reduce(
  (acc, item) => {
    acc[item.eventName.trim().toLowerCase()] = item
    return acc
  },
  {} as Record<string, EventLinkItem>,
)

const docsRoutesByEventSource: Record<string, AwsDocsRoute> = {
  'apigateway.amazonaws.com': { docsPath: 'apigateway/latest/api' },
  'autoscaling.amazonaws.com': { docsPath: 'autoscaling/ec2/APIReference' },
  'cloudformation.amazonaws.com': { docsPath: 'AWSCloudFormation/latest/APIReference' },
  'cloudfront.amazonaws.com': { docsPath: 'cloudfront/latest/APIReference' },
  'cloudtrail.amazonaws.com': { docsPath: 'awscloudtrail/latest/APIReference' },
  'cloudwatch.amazonaws.com': { docsPath: 'AmazonCloudWatch/latest/APIReference' },
  'cognito-idp.amazonaws.com': { docsPath: 'cognito-user-identity-pools/latest/APIReference' },
  'dynamodb.amazonaws.com': { docsPath: 'amazondynamodb/latest/APIReference' },
  'ec2.amazonaws.com': { docsPath: 'AWSEC2/latest/APIReference' },
  'elasticloadbalancing.amazonaws.com': { docsPath: 'elasticloadbalancing/latest/APIReference' },
  'events.amazonaws.com': { docsPath: 'eventbridge/latest/APIReference' },
  'iam.amazonaws.com': { docsPath: 'IAM/latest/APIReference' },
  'kms.amazonaws.com': { docsPath: 'kms/latest/APIReference' },
  'lambda.amazonaws.com': { docsPath: 'lambda/latest/api' },
  'logs.amazonaws.com': { docsPath: 'AmazonCloudWatchLogs/latest/APIReference' },
  'rds.amazonaws.com': { docsPath: 'AmazonRDS/latest/APIReference' },
  'route53.amazonaws.com': { docsPath: 'Route53/latest/APIReference' },
  's3.amazonaws.com': { docsPath: 'AmazonS3/latest/API', apiPrefix: 'API_' },
  'sqs.amazonaws.com': { docsPath: 'AWSSimpleQueueService/latest/APIReference' },
  'ssm.amazonaws.com': { docsPath: 'systems-manager/latest/APIReference' },
}

const buildInferredEventsByName = (eventsBySource: Record<string, string[]>) =>
  Object.entries(eventsBySource).reduce(
    (acc, [eventSource, eventNames]) => {
      eventNames.forEach((eventName) => {
        acc[eventName.toLowerCase()] = { eventName, eventSource }
      })
      return acc
    },
    {} as Record<string, InferredEvent>,
  )

const inferredEventsByName = buildInferredEventsByName({
  'apigateway.amazonaws.com': [
    'CreateAuthorizer',
    'CreateBasePathMapping',
    'CreateDeployment',
    'CreateResource',
    'CreateRestApi',
    'DeleteDeployment',
    'DeleteMethod',
    'DeleteResource',
    'DeleteRestApi',
    'ImportApi',
    'PutIntegration',
    'PutIntegrationResponse',
    'PutMethod',
    'PutMethodResponse',
    'UpdateAuthorizer',
    'UpdateGatewayResponse',
    'UpdateIntegrationResponse',
    'UpdateMethod',
    'UpdateMethodResponse',
    'UpdateRestApi',
    'UpdateStage',
  ],
  'autoscaling.amazonaws.com': [
    'CreateAutoScalingGroup',
    'DeleteAutoScalingGroup',
    'PutScalingPolicy',
    'UpdateAutoScalingGroup',
  ],
  'cloudformation.amazonaws.com': [
    'CreateChangeSet',
    'CreateStack',
    'DeleteStack',
    'ExecuteChangeSet',
    'UpdateStack',
    'ValidateTemplate',
  ],
  'cloudfront.amazonaws.com': [
    'CreateDistribution',
    'CreateOriginAccessControl',
    'DeleteDistribution',
    'DeleteOriginAccessControl',
    'UpdateDistribution',
  ],
  'cloudtrail.amazonaws.com': ['LookupEvents', 'StartQuery'],
  'cloudwatch.amazonaws.com': ['DeleteAlarms', 'PutMetricAlarm'],
  'cognito-idp.amazonaws.com': [
    'CreateUserPool',
    'CreateUserPoolClient',
    'CreateUserPoolDomain',
    'DeleteUserPool',
    'DeleteUserPoolClient',
    'DeleteUserPoolDomain',
    'RespondToAuthChallenge',
    'UpdateUserPoolClient',
  ],
  'dynamodb.amazonaws.com': ['CreateTable', 'DeleteTable'],
  'ec2.amazonaws.com': [
    'AllocateAddress',
    'AssociateAddress',
    'AssociateRouteTable',
    'AttachInternetGateway',
    'AttachVolume',
    'AuthorizeSecurityGroupEgress',
    'AuthorizeSecurityGroupIngress',
    'CreateImage',
    'CreateInternetGateway',
    'CreateKeyPair',
    'CreateLaunchTemplate',
    'CreateRouteTable',
    'CreateSecurityGroup',
    'CreateSnapshot',
    'CreateSubnet',
    'CreateTags',
    'CreateVolume',
    'CreateVpc',
    'DeleteInternetGateway',
    'DeleteLaunchTemplate',
    'DeleteRouteTable',
    'DeleteSecurityGroup',
    'DeleteSubnet',
    'DeleteVolume',
    'DeleteVpc',
    'DeregisterImage',
    'DetachInternetGateway',
    'DetachVolume',
    'ModifyInstanceAttribute',
    'ModifyVpcAttribute',
    'ReleaseAddress',
    'RevokeSecurityGroupEgress',
    'RunInstances',
    'StartInstances',
    'StopInstances',
    'TerminateInstances',
  ],
  'elasticloadbalancing.amazonaws.com': [
    'CreateListener',
    'CreateLoadBalancer',
    'CreateTargetGroup',
    'DeleteLoadBalancer',
    'DeleteTargetGroup',
    'DeregisterTargets',
    'RegisterTargets',
  ],
  'events.amazonaws.com': ['CreateEventBus', 'PutRule', 'PutTargets'],
  'iam.amazonaws.com': [
    'AttachRolePolicy',
    'CreateRole',
    'CreateServiceLinkedRole',
    'PutRolePolicy',
  ],
  'kms.amazonaws.com': ['Encrypt'],
  'lambda.amazonaws.com': [
    'AddPermission',
    'CreateFunction20150331',
    'DeleteFunction20150331',
    'PublishVersion20150331',
    'RemovePermission20150331v2',
    'TagResource',
    'UpdateFunctionCode20150331v2',
  ],
  'logs.amazonaws.com': ['CreateLogGroup', 'CreateLogStream', 'DeleteLogGroup'],
  'rds.amazonaws.com': [
    'CreateDBInstance',
    'CreateDBInstanceReadReplica',
    'DeleteDBInstance',
    'ModifyDBInstance',
    'RebootDBInstance',
    'RestoreDBInstanceFromDBSnapshot',
  ],
  'route53.amazonaws.com': ['ChangeResourceRecordSets'],
  's3.amazonaws.com': [
    'CreateBucket',
    'DeleteBucket',
    'PutBucketEncryption',
    'PutBucketNotification',
    'PutBucketPolicy',
    'PutBucketPublicAccessBlock',
    'PutBucketWebsite',
  ],
  'sqs.amazonaws.com': ['CreateQueue', 'SetQueueAttributes'],
  'ssm.amazonaws.com': [
    'RegisterManagedInstance',
    'SendHeartBeat',
    'UpdateInstanceInformation',
  ],
})

const normalizeEventNameForDocs = (eventName: string) =>
  eventName
    .trim()
    .replace(/20\d{6}(v\d+)?$/, '')
    .replace(/v\d+$/, '')

const normalizeEventSource = (eventSource?: string) => eventSource?.trim().toLowerCase()

const buildAwsDocsUrl = (eventName: string, eventSource?: string) => {
  const normalizedEventSource = normalizeEventSource(eventSource)
  const searchQuery = encodeURIComponent([eventName, normalizedEventSource].filter(Boolean).join(' '))

  if (!normalizedEventSource) {
    return `https://docs.aws.amazon.com/search/doc-search.html?searchPath=documentation&searchQuery=${searchQuery}`
  }

  const route = docsRoutesByEventSource[normalizedEventSource]
  if (!route) {
    return `https://docs.aws.amazon.com/search/doc-search.html?searchPath=documentation&searchQuery=${searchQuery}`
  }

  const normalizedEventName = normalizeEventNameForDocs(eventName)
  const apiPrefix = route.apiPrefix ?? 'API_'
  return `https://docs.aws.amazon.com/${route.docsPath}/${apiPrefix}${normalizedEventName}.html`
}

export const resolveEventLink = (eventName: string, eventSource?: string): EventLinkResult => {
  const normalizedEventNameKey = eventName.trim().toLowerCase()
  const configuredLink = eventLinksMap[eventName] || eventLinksMapByName[normalizedEventNameKey]
  const inferredEvent = inferredEventsByName[normalizedEventNameKey]
  const resolvedEventName = inferredEvent?.eventName || eventName.trim()
  const resolvedEventSource = eventSource || inferredEvent?.eventSource

  if (configuredLink) {
    return {
      url: configuredLink.url,
    }
  }

  return {
    url: buildAwsDocsUrl(resolvedEventName, resolvedEventSource) || eventLinksMap.Empty?.url || DEFAULT_EVENT_LINK,
  }
}
