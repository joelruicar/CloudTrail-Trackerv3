export const courseSubjectsMap: Record<string, string[]> = {
  CursoCloudAWS: [
    'PL_EC2', 'PL_EC2_S3', 'PL_RDS', 'PL_DYNAMODB',
    'PL_APP', 'PL_CF', 'PL_VPC', 'PL_LAMBDA_SQS', 'PL_SERVERLESS_APP',
  ],
  'MBDA-CGDNGB':  ['PL_EC2', 'PL_EC2_S3', 'PL_RDS', 'PL_APP', 'PL_LAMBDA_SQS'],
  'MBDA-MEGBD':   ['PL_EMR'],
  'MUCNAP-ICP':   ['PL_EC2', 'PL_EC2_S3', 'PL_RDS', 'PL_DYNAMODB', 'PL_APP', 'PL_CF', 'PL_VPC', 'PL_LAMBDA_SQS'],
  'MUCNAP-CBD':   ['PL_EMR'],
  'MUGI-SEN':     ['PL_EC2', 'PL_EC2_S3', 'PL_RDS', 'PL_DYNAMODB', 'PL_APP', 'PL_CF', 'PL_LAMBDA_SQS'],
  'GII-CNA':      ['PL_EC2', 'PL_EC2_S3'],
  'GCD-IPD':      ['PL_EC2', 'PL_EC2_S3'],
  'MUCC-DDS':     ['PL_EC2', 'PL_EC2_S3', 'PL_VPC', 'PL_RDS', 'PL_APP', 'PL_CF', 'PL_LAMBDA_SQS'],
  'MUIS-DOS':     ['PL_EC2', 'PL_CF', 'PL_LAMBDA_SQS'],
  TCC:            ['PL_GRAVITON', 'PL_DATA_LAKE', 'PL_EVENTS_WORKFLOWS'],
}

export const courseOptions = Object.keys(courseSubjectsMap)