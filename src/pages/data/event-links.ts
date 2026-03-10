export const eventLinks = [
  {
    eventName: 'Empty',
    url: 'https://docs.aws.amazon.com/',
    description: {
      es: 'Sin datos',
      en: 'No data',
    },
  },
  {
    eventName: 'CreateKeyPair',
    url: 'https://docs.aws.amazon.com/AWSEC2/latest/APIReference/API_CreateKeyPair.html',
    description: {
      es: 'Crea un par de claves ED25519 o RSA de 2048 bits con el nombre especificado y en el formato especificado.',
      en: 'Creates an ED25519 or 2048-bit RSA key pair with the specified name and format.',
    },
  },
  {
    eventName: 'CreateSecurityGroup',
    url: 'https://docs.aws.amazon.com/AWSEC2/latest/APIReference/API_CreateSecurityGroup.html',
    description: {
      es: 'Crea un grupo de seguridad dentro de una VPC para instancias EC2.',
      en: 'Creates a security group within a VPC for EC2 instances.',
    },
  },
  {
    eventName: 'AuthorizeSecurityGroupIngress',
    url: 'https://docs.aws.amazon.com/AWSEC2/latest/APIReference/API_AuthorizeSecurityGroupIngress.html',
    description: {
      es: 'Añade reglas a un grupo de seguridad que permiten el acceso entrante a instancias EC2.',
      en: 'Adds rules to a security group that allow inbound access to EC2 instances.',
    },
  },
  {
    eventName: 'RunInstances',
    url: 'https://docs.aws.amazon.com/AWSEC2/latest/APIReference/API_RunInstances.html',
    description: {
      es: 'Inicia una o más instancias EC2.',
      en: 'Launches one or more EC2 instances.',
    },
  },
  {
    eventName: 'StopInstances',
    url: 'https://docs.aws.amazon.com/AWSEC2/latest/APIReference/API_StopInstances.html',
    description: {
      es: 'Para una o más instancias EC2.',
      en: 'Stops one or more EC2 instances.',
    },
  },
  {
    eventName: 'StartInstances',
    url: 'https://docs.aws.amazon.com/AWSEC2/latest/APIReference/API_StartInstances.html',
    description: {
      es: 'Inicia una instancia respaldada por Amazon EBS que haya detenido previamente.',
      en: 'Starts an Amazon EBS-backed instance that was previously stopped.',
    },
  },
  {
    eventName: 'TerminateInstances',
    url: 'https://docs.aws.amazon.com/AWSEC2/latest/APIReference/API_TerminateInstances.html',
    description: {
      es: 'Termina una o más instancias EC2.',
      en: 'Terminates one or more EC2 instances.',
    },
  },
  {
    eventName: 'AttachVolume',
    url: 'https://docs.aws.amazon.com/AWSEC2/latest/APIReference/API_AttachVolume.html',
    description: {
      es: 'Asocia un volumen de Amazon EBS a una instancia en ejecución.',
      en: 'Attaches an Amazon EBS volume to a running instance.',
    },
  },
  {
    eventName: 'CreateAutoScalingGroup',
    url: 'https://docs.aws.amazon.com/autoscaling/ec2/APIReference/API_CreateAutoScalingGroup.html',
    description: {
      es: 'Crea un grupo de Auto Scaling con los parámetros especificados.',
      en: 'Creates an Auto Scaling group with the specified parameters.',
    },
  },
  {
    eventName: 'CreateBucket',
    url: 'https://docs.aws.amazon.com/AmazonS3/latest/API/API_CreateBucket.html',
    description: {
      es: 'Crea un nuevo bucket S3.',
      en: 'Creates a new S3 bucket.',
    },
  },
  {
    eventName: 'CreateImage',
    url: 'https://docs.aws.amazon.com/AWSEC2/latest/APIReference/API_CreateImage.html',
    description: {
      es: 'Crea una imagen de una instancia EC2.',
      en: 'Creates an image from an EC2 instance.',
    },
  },
  {
    eventName: 'CreateLaunchTemplate',
    url: 'https://docs.aws.amazon.com/AWSEC2/latest/APIReference/API_CreateLaunchTemplate.html',
    description: {
      es: 'Crea una plantilla de lanzamiento para iniciar instancias EC2.',
      en: 'Creates a launch template for launching EC2 instances.',
    },
  },
  {
    eventName: 'CreateListener',
    url: 'https://docs.aws.amazon.com/elasticloadbalancing/latest/APIReference/API_CreateListener.html',
    description: {
      es: 'Crea un listener para un equilibrador de carga de aplicaciones o un equilibrador de carga de red.',
      en: 'Creates a listener for an application or network load balancer.',
    },
  },
  {
    eventName: 'CreateLoadBalancer',
    url: 'https://docs.aws.amazon.com/elasticloadbalancing/latest/APIReference/API_CreateLoadBalancer.html',
    description: {
      es: 'Crea un equilibrador de carga de aplicaciones o un equilibrador de carga de red.',
      en: 'Creates an application or network load balancer.',
    },
  },
  {
    eventName: 'CreateSnapshot',
    url: 'https://docs.aws.amazon.com/AWSEC2/latest/APIReference/API_CreateSnapshot.html',
    description: {
      es: 'Crea una instantánea de un volumen de Amazon EBS.',
      en: 'Creates a snapshot of an Amazon EBS volume.',
    },
  },
  {
    eventName: 'CreateTags',
    url: 'https://docs.aws.amazon.com/AWSEC2/latest/APIReference/API_CreateTags.html',
    description: {
      es: 'Agrega o sobrescribe etiquetas para los recursos de Amazon EC2 especificados.',
      en: 'Adds or overwrites tags for the specified Amazon EC2 resources.',
    },
  },
  {
    eventName: 'CreateTargetGroup',
    url: 'https://docs.aws.amazon.com/elasticloadbalancing/latest/APIReference/API_CreateTargetGroup.html',
    description: {
      es: 'Crea un grupo de destino para un equilibrador de carga de aplicaciones o un equilibrador de carga de red.',
      en: 'Creates a target group for an application or network load balancer.',
    },
  },
  {
    eventName: 'CreateVolume',
    url: 'https://docs.aws.amazon.com/AWSEC2/latest/APIReference/API_CreateVolume.html',
    description: {
      es: 'Crea un volumen Amazon EBS.',
      en: 'Creates an Amazon EBS volume.',
    },
  },
  {
    eventName: 'DeleteAutoScalingGroup',
    url: 'https://docs.aws.amazon.com/autoscaling/ec2/APIReference/API_DeleteAutoScalingGroup.html',
    description: {
      es: 'Elimina un grupo de Auto Scaling.',
      en: 'Deletes an Auto Scaling group.',
    },
  },
  {
    eventName: 'DeleteLaunchTemplate',
    url: 'https://docs.aws.amazon.com/AWSEC2/latest/APIReference/API_DeleteLaunchTemplate.html',
    description: {
      es: 'Elimina una plantilla de lanzamiento.',
      en: 'Deletes a launch template.',
    },
  },
  {
    eventName: 'DeleteLoadBalancer',
    url: 'https://docs.aws.amazon.com/elasticloadbalancing/latest/APIReference/API_DeleteLoadBalancer.html',
    description: {
      es: 'Elimina un equilibrador de carga de aplicaciones o un equilibrador de carga de red.',
      en: 'Deletes an application or network load balancer.',
    },
  },
  {
    eventName: 'DeleteBucket',
    url: 'https://docs.aws.amazon.com/AmazonS3/latest/API/API_DeleteBucket.html',
    description: {
      es: 'Elimina un bucket de S3.',
      en: 'Deletes an S3 bucket.',
    },
  },
  {
    eventName: 'DeleteVolume',
    url: 'https://docs.aws.amazon.com/AWSEC2/latest/APIReference/API_DeleteVolume.html',
    description: {
      es: 'Elimina un volumen de Amazon EBS.',
      en: 'Deletes an Amazon EBS volume.',
    },
  },
  {
    eventName: 'DeleteTargetGroup',
    url: 'https://docs.aws.amazon.com/elasticloadbalancing/latest/APIReference/API_DeleteTargetGroup.html',
    description: {
      es: 'Elimina un grupo de destino.',
      en: 'Deletes a target group.',
    },
  },
  {
    eventName: 'DeregisterTargets',
    url: 'https://docs.aws.amazon.com/elasticloadbalancing/latest/APIReference/API_DeregisterTargets.html',
    description: {
      es: 'Elimina los objetivos especificados del grupo de objetivos especificado.',
      en: 'Removes the specified targets from the specified target group.',
    },
  },
  {
    eventName: 'DetachVolume',
    url: 'https://docs.aws.amazon.com/AWSEC2/latest/APIReference/API_DetachVolume.html',
    description: {
      es: 'Desconecta un volumen Amazon EBS de una instancia.',
      en: 'Detaches an Amazon EBS volume from an instance.',
    },
  },
  {
    eventName: 'PutBucketWebsite',
    url: 'https://docs.aws.amazon.com/AmazonS3/latest/API/API_PutBucketWebsite.html',
    description: {
      es: 'Configura el sitio web para un bucket S3.',
      en: 'Sets the website configuration for an S3 bucket.',
    },
  },
  {
    eventName: 'PutMetricAlarm',
    url: 'https://docs.aws.amazon.com/AmazonCloudWatch/latest/APIReference/API_PutMetricAlarm.html',
    description: {
      es: 'Crea o actualiza una alarma de CloudWatch que monitoriza una métrica o el resultado de una expresión matemática.',
      en: 'Creates or updates a CloudWatch alarm that monitors a Amazon CloudWatch metric or the result of a metric math expression.',
    },
  },
  {
    eventName: 'PutScalingPolicy',
    url: 'https://docs.aws.amazon.com/autoscaling/ec2/APIReference/API_PutScalingPolicy.html',
    description: {
      es: 'Crea o actualiza una política de escalado para un grupo de Auto Scaling.',
      en: 'Creates or updates a scaling policy for an Auto Scaling group.',
    },
  },
  {
    eventName: 'RegisterTargets',
    url: 'https://docs.aws.amazon.com/elasticloadbalancing/latest/APIReference/API_RegisterTargets.html',
    description: {
      es: 'Registra los objetivos especificados en el grupo de destino especificado.',
      en: 'Registers the specified targets with the specified target group.',
    },
  },
  {
    eventName: 'ChangeResourceRecordSets',
    url: 'https://docs.aws.amazon.com/Route53/latest/APIReference/API_ChangeResourceRecordSets.html',
    description: {
      es: 'Crea, cambia o elimina un conjunto de registros de recursos en una zona hospedada.',
      en: 'Creates, changes, or deletes a resource record set in a hosted zone.',
    },
  },
  {
    eventName: 'CreateDBInstance',
    url: 'https://docs.aws.amazon.com/AmazonRDS/latest/APIReference/API_CreateDBInstance.html',
    description: {
      es: 'Crea una nueva instancia de base de datos.',
      en: 'Creates a new DB instance.',
    },
  },
  {
    eventName: 'CreateDBInstanceReadReplica',
    url: 'https://docs.aws.amazon.com/AmazonRDS/latest/APIReference/API_CreateDBInstanceReadReplica.html',
    description: {
      es: 'Crea una réplica de lectura de una instancia de base de datos.',
      en: 'Creates a DB instance read replica.',
    },
  },
  {
    eventName: 'DeleteDBInstance',
    url: 'https://docs.aws.amazon.com/AmazonRDS/latest/APIReference/API_DeleteDBInstance.html',
    description: {
      es: 'Elimina una instancia de base de datos.',
      en: 'Deletes a DB instance.',
    },
  },
  {
    eventName: 'ModifyDBInstance',
    url: 'https://docs.aws.amazon.com/AmazonRDS/latest/APIReference/API_ModifyDBInstance.html',
    description: {
      es: 'Modifica la configuración de una instancia de base de datos.',
      en: 'Modifies settings for a DB instance.',
    },
  },
  {
    eventName: 'RebootDBInstance',
    url: 'https://docs.aws.amazon.com/AmazonRDS/latest/APIReference/API_RebootDBInstance.html',
    description: {
      es: 'Reinicia una instancia de base de datos.',
      en: 'Reboots a DB instance.',
    },
  },
  {
    eventName: 'CreateTable',
    url: 'https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_CreateTable.html',
    description: {
      es: 'Crea una nueva tabla de Amazon DynamoDB.',
      en: 'Creates a new Amazon DynamoDB table.',
    },
  },
  {
    eventName: 'DeleteTable',
    url: 'https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_DeleteTable.html',
    description: {
      es: 'Elimina una tabla de Amazon DynamoDB.',
      en: 'Deletes an Amazon DynamoDB table.',
    },
  },
  {
    eventName: 'AllocateAddress',
    url: 'https://docs.aws.amazon.com/AWSEC2/latest/APIReference/API_AllocateAddress.html',
    description: {
      es: 'Asigna una dirección IP elástica (Elastic IP) a tu cuenta.',
      en: 'Allocates an Elastic IP address to your account.',
    },
  },
  {
    eventName: 'ReleaseAddress',
    url: 'https://docs.aws.amazon.com/AWSEC2/latest/APIReference/API_ReleaseAddress.html',
    description: {
      es: 'Libera una dirección IP elástica de tu cuenta.',
      en: 'Releases an Elastic IP address from your account.',
    },
  },
  {
    eventName: 'UpdateAutoScalingGroup',
    url: 'https://docs.aws.amazon.com/autoscaling/ec2/APIReference/API_UpdateAutoScalingGroup.html',
    description: {
      es: 'Actualiza la configuración de un grupo de Auto Scaling existente.',
      en: 'Updates the configuration of an existing Auto Scaling group.',
    },
  },
  {
    eventName: 'DeregisterImage',
    url: 'https://docs.aws.amazon.com/AWSEC2/latest/APIReference/API_DeregisterImage.html',
    description: {
      es: 'Anula el registro de una AMI.',
      en: 'Deregisters an AMI.',
    },
  },
  {
    eventName: 'AuthorizeSecurityGroupEgress',
    url: 'https://docs.aws.amazon.com/AWSEC2/latest/APIReference/API_AuthorizeSecurityGroupEgress.html',
    description: {
      es: 'Agrega reglas a un grupo de seguridad que permiten el acceso saliente desde instancias EC2.',
      en: 'Adds rules to a security group that allow outbound access from EC2 instances.',
    },
  },
  {
    eventName: 'CreateChangeSet',
    url: 'https://docs.aws.amazon.com/AWSCloudFormation/latest/APIReference/API_CreateChangeSet.html',
    description: {
      es: 'Crea un conjunto de cambios para una pila de CloudFormation.',
      en: 'Creates a change set for a CloudFormation stack.',
    },
  },
  {
    eventName: 'CreateStack',
    url: 'https://docs.aws.amazon.com/AWSCloudFormation/latest/APIReference/API_CreateStack.html',
    description: {
      es: 'Crea una pila de CloudFormation.',
      en: 'Creates a CloudFormation stack.',
    },
  },
  {
    eventName: 'DeleteSecurityGroup',
    url: 'https://docs.aws.amazon.com/AWSEC2/latest/APIReference/API_DeleteSecurityGroup.html',
    description: {
      es: 'Elimina un grupo de seguridad.',
      en: 'Deletes a security group.',
    },
  },
  {
    eventName: 'DeleteStack',
    url: 'https://docs.aws.amazon.com/AWSCloudFormation/latest/APIReference/API_DeleteStack.html',
    description: {
      es: 'Elimina una pila de CloudFormation.',
      en: 'Deletes a CloudFormation stack.',
    },
  },
  {
    eventName: 'ModifyInstanceAttribute',
    url: 'https://docs.aws.amazon.com/AWSEC2/latest/APIReference/API_ModifyInstanceAttribute.html',
    description: {
      es: 'Modifica un atributo de una instancia EC2.',
      en: 'Modifies an attribute of an EC2 instance.',
    },
  },
  {
    eventName: 'RestoreDBInstanceFromDBSnapshot',
    url: 'https://docs.aws.amazon.com/AmazonRDS/latest/APIReference/API_RestoreDBInstanceFromDBSnapshot.html',
    description: {
      es: 'Crea una nueva instancia de base de datos a partir de una instantánea.',
      en: 'Creates a new DB instance from a DB snapshot.',
    },
  },
  {
    eventName: 'RevokeSecurityGroupEgress',
    url: 'https://docs.aws.amazon.com/AWSEC2/latest/APIReference/API_RevokeSecurityGroupEgress.html',
    description: {
      es: 'Revoca reglas de acceso saliente de un grupo de seguridad.',
      en: 'Revokes outbound access rules from a security group.',
    },
  },
  {
    eventName: 'UpdateStack',
    url: 'https://docs.aws.amazon.com/AWSCloudFormation/latest/APIReference/API_UpdateStack.html',
    description: {
      es: 'Actualiza una pila de CloudFormation.',
      en: 'Updates a CloudFormation stack.',
    },
  },
  {
    eventName: 'AssociateAddress',
    url: 'https://docs.aws.amazon.com/AWSEC2/latest/APIReference/API_AssociateAddress.html',
    description: {
      es: 'Asocia una dirección IP elástica con una instancia EC2 o interfaz de red.',
      en: 'Associates an Elastic IP address with an EC2 instance or network interface.',
    },
  },
  {
    eventName: 'AssociateRouteTable',
    url: 'https://docs.aws.amazon.com/AWSEC2/latest/APIReference/API_AssociateRouteTable.html',
    description: {
      es: 'Asocia una tabla de rutas con una subred o una gateway.',
      en: 'Associates a route table with a subnet or a gateway.',
    },
  },
  {
    eventName: 'AttachInternetGateway',
    url: 'https://docs.aws.amazon.com/AWSEC2/latest/APIReference/API_AttachInternetGateway.html',
    description: {
      es: 'Adjunta una gateway de Internet a una VPC.',
      en: 'Attaches an internet gateway to a VPC.',
    },
  },
  {
    eventName: 'CreateInternetGateway',
    url: 'https://docs.aws.amazon.com/AWSEC2/latest/APIReference/API_CreateInternetGateway.html',
    description: {
      es: 'Crea una gateway de Internet.',
      en: 'Creates an internet gateway.',
    },
  },
  {
    eventName: 'CreateRouteTable',
    url: 'https://docs.aws.amazon.com/AWSEC2/latest/APIReference/API_CreateRouteTable.html',
    description: {
      es: 'Crea una tabla de rutas para la VPC especificada.',
      en: 'Creates a route table for the specified VPC.',
    },
  },
  {
    eventName: 'CreateSubnet',
    url: 'https://docs.aws.amazon.com/vpc/latest/userguide/create-subnets.html',
    description: {
      es: 'Crea una subred en la VPC especificada.',
      en: 'Creates a subnet in the specified VPC.',
    },
  },
  {
    eventName: 'CreateVpc',
    url: 'https://docs.aws.amazon.com/AWSEC2/latest/APIReference/API_CreateVpc.html',
    description: {
      es: 'Crea una VPC con el bloque CIDR IPv4 especificado.',
      en: 'Creates a VPC with the specified IPv4 CIDR block.',
    },
  },
  {
    eventName: 'DeleteInternetGateway',
    url: 'https://docs.aws.amazon.com/vpc/latest/userguide/delete-igw.html',
    description: {
      es: 'Elimina la gateway de Internet especificada.',
      en: 'Deletes the specified internet gateway.',
    },
  },
  {
    eventName: 'DeleteRouteTable',
    url: 'https://docs.aws.amazon.com/AWSEC2/latest/APIReference/API_DeleteRouteTable.html',
    description: {
      es: 'Elimina la tabla de rutas especificada.',
      en: 'Deletes the specified route table.',
    },
  },
  {
    eventName: 'DeleteSubnet',
    url: 'https://docs.aws.amazon.com/AWSEC2/latest/APIReference/API_DeleteSubnet.html',
    description: {
      es: 'Elimina la subred especificada.',
      en: 'Deletes the specified subnet.',
    },
  },
  {
    eventName: 'DeleteVpc',
    url: 'https://docs.aws.amazon.com/AWSEC2/latest/APIReference/API_DeleteVpc.html',
    description: {
      es: 'Elimina la VPC especificada.',
      en: 'Deletes the specified VPC.',
    },
  },
  {
    eventName: 'DetachInternetGateway',
    url: 'https://docs.aws.amazon.com/AWSEC2/latest/APIReference/API_DetachInternetGateway.html',
    description: {
      es: 'Desasocia una gateway de Internet de una VPC.',
      en: 'Detaches an internet gateway from a VPC.',
    },
  },
  {
    eventName: 'ModifyVpcAttribute',
    url: 'https://docs.aws.amazon.com/AWSEC2/latest/APIReference/API_ModifyVpcAttribute.html',
    description: {
      es: 'Modifica el atributo especificado de la VPC especificada.',
      en: 'Modifies the specified attribute of the specified VPC.',
    },
  },
  {
    eventName: 'RunJobFlow',
    url: 'https://docs.aws.amazon.com/emr/latest/APIReference/API_RunJobFlow.html',
    description: {
      es: 'Lanza un nuevo clúster EMR con las configuraciones especificadas.',
      en: 'Launches a new EMR cluster with the specified configurations.',
    },
  },
  {
    eventName: 'CreateFunction20150331',
    url: 'https://docs.aws.amazon.com/lambda/latest/dg/API_CreateFunction.html',
    description: {
      es: 'Crea una nueva función Lambda.',
      en: 'Creates a new Lambda function.',
    },
  },
  {
    eventName: 'CreateQueue',
    url: 'https://docs.aws.amazon.com/AWSSimpleQueueService/latest/APIReference/API_CreateQueue.html',
    description: {
      es: 'Crea una nueva cola de Amazon SQS.',
      en: 'Creates a new Amazon SQS queue.',
    },
  },
  {
    eventName: 'DeleteFunction20150331',
    url: 'https://docs.aws.amazon.com/lambda/latest/dg/API_DeleteFunction.html',
    description: {
      es: 'Elimina una función Lambda.',
      en: 'Deletes a Lambda function.',
    },
  },
  {
    eventName: 'DeleteLogGroup',
    url: 'https://docs.aws.amazon.com/AmazonCloudWatchLogs/latest/APIReference/API_DeleteLogGroup.html',
    description: {
      es: 'Elimina el grupo de logs especificado y borra permanentemente todos los eventos archivados asociados.',
      en: 'Deletes the specified log group and permanently deletes all the archived log events associated with the log group.',
    },
  },
  {
    eventName: 'PutBucketNotification',
    url: 'https://docs.aws.amazon.com/AmazonS3/latest/API/API_PutBucketNotificationConfiguration.html',
    description: {
      es: 'Habilita o deshabilita notificaciones para eventos en un bucket.',
      en: 'Enables or disables notifications for events on a bucket.',
    },
  },
  {
    eventName: 'PutRule',
    url: 'https://docs.aws.amazon.com/AmazonCloudWatchEvents/latest/APIReference/API_PutRule.html',
    description: {
      es: 'Crea o actualiza una regla de CloudWatch Events que coincide con eventos entrantes y los dirige a destinos.',
      en: 'Creates or updates a CloudWatch Events rule that matches incoming events and routes them to targets.',
    },
  },
  {
    eventName: 'PutTargets',
    url: 'https://docs.aws.amazon.com/AmazonCloudWatchEvents/latest/APIReference/API_PutTargets.html',
    description: {
      es: 'Agrega o actualiza un destino para una regla de CloudWatch Events.',
      en: 'Adds or updates a target to a CloudWatch Events rule.',
    },
  },
  {
    eventName: 'SetQueueAttributes',
    url: 'https://docs.aws.amazon.com/AWSSimpleQueueService/latest/APIReference/API_SetQueueAttributes.html',
    description: {
      es: 'Establece atributos para la cola especificada.',
      en: 'Sets attributes for the specified queue.',
    },
  },
  {
    eventName: 'CreateAuthorizer',
    url: 'https://docs.aws.amazon.com/apigateway/latest/api/API_CreateAuthorizer.html',
    description: {
      es: 'Crea un nuevo recurso Authorizer en tu REST API.',
      en: 'Creates a new Authorizer resource in your REST API.',
    },
  },
  {
    eventName: 'CreateBasePathMapping',
    url: 'https://docs.aws.amazon.com/apigateway/latest/api/API_CreateBasePathMapping.html',
    description: {
      es: 'Crea un nuevo recurso BasePathMapping.',
      en: 'Creates a new BasePathMapping resource.',
    },
  },
  {
    eventName: 'CreateDeployment',
    url: 'https://docs.aws.amazon.com/apigateway/latest/api/API_CreateDeployment.html',
    description: {
      es: 'Crea un recurso Deployment bajo el RestApi especificado en tu cuenta de Amazon API Gateway.',
      en: 'Creates a Deployment resource under the specified RestApi in your Amazon API Gateway account.',
    },
  },
  {
    eventName: 'CreateDistribution',
    url: 'https://docs.aws.amazon.com/cloudfront/latest/APIReference/API_CreateDistribution.html',
    description: {
      es: 'Crea una nueva distribución de CloudFront.',
      en: 'Creates a new CloudFront distribution.',
    },
  },
  {
    eventName: 'CreateDomainName',
    url: 'https://docs.aws.amazon.com/apigateway/latest/api/API_CreateDomainName.html',
    description: {
      es: 'Crea un nuevo nombre de dominio.',
      en: 'Creates a new domain name.',
    },
  },
  {
    eventName: 'CreateFunction20050330',
    url: 'https://docs.aws.amazon.com/lambda/latest/dg/API_CreateFunction.html',
    description: {
      es: 'Crea una nueva función Lambda (versión antigua de la API, probablemente un alias de CreateFunction).',
      en: 'Creates a new Lambda function (older API version, likely an alias for CreateFunction).',
    },
  },
  {
    eventName: 'CreateGrant',
    url: 'https://docs.aws.amazon.com/kms/latest/APIReference/API_CreateGrant.html',
    description: {
      es: 'Agrega un permiso (grant) a una clave KMS.',
      en: 'Adds a grant to a KMS key.',
    },
  },
  {
    eventName: 'CreateLogGroup',
    url: 'https://docs.aws.amazon.com/AmazonCloudWatchLogs/latest/APIReference/API_CreateLogGroup.html',
    description: {
      es: 'Crea un nuevo grupo de logs con el nombre especificado.',
      en: 'Creates a new log group with the specified name.',
    },
  },
  {
    eventName: 'CreateResource',
    url: 'https://docs.aws.amazon.com/apigateway/latest/api/API_CreateResource.html',
    description: {
      es: 'Crea un recurso en una API REST.',
      en: 'Creates a resource in a REST API.',
    },
  },
  {
    eventName: 'CreateRestApi',
    url: 'https://docs.aws.amazon.com/apigateway/latest/api/API_CreateRestApi.html',
    description: {
      es: 'Crea una nueva API REST.',
      en: 'Creates a new REST API.',
    },
  },
  {
    eventName: 'CreateUserPool',
    url: 'https://docs.aws.amazon.com/cognito-user-identity-pools/latest/APIReference/API_CreateUserPool.html',
    description: {
      es: 'Crea un nuevo grupo de usuarios de Amazon Cognito.',
      en: 'Creates a new Amazon Cognito user pool.',
    },
  },
  {
    eventName: 'CreateUserPoolClient',
    url: 'https://docs.aws.amazon.com/cognito-user-identity-pools/latest/APIReference/API_CreateUserPoolClient.html',
    description: {
      es: 'Crea un nuevo cliente para el grupo de usuarios especificado.',
      en: 'Creates a new user pool client for the specified user pool.',
    },
  },
  {
    eventName: 'CreateUserPoolDomain',
    url: 'https://docs.aws.amazon.com/cognito-user-identity-pools/latest/APIReference/API_CreateUserPoolDomain.html',
    description: {
      es: 'Crea un nuevo dominio para un grupo de usuarios.',
      en: 'Creates a new domain for a user pool.',
    },
  },
  {
    eventName: 'DeleteDeployment',
    url: 'https://docs.aws.amazon.com/apigateway/latest/api/API_DeleteDeployment.html',
    description: {
      es: 'Elimina un recurso Deployment.',
      en: 'Deletes a Deployment resource.',
    },
  },
  {
    eventName: 'DeleteDomainName',
    url: 'https://docs.aws.amazon.com/apigateway/latest/api/API_DeleteDomainName.html',
    description: {
      es: 'Elimina un nombre de dominio personalizado.',
      en: 'Deletes a custom domain name.',
    },
  },
  {
    eventName: 'DeleteMethod',
    url: 'https://docs.aws.amazon.com/apigateway/latest/api/API_DeleteMethod.html',
    description: {
      es: 'Elimina un recurso Method existente.',
      en: 'Deletes an existing Method resource.',
    },
  },
  {
    eventName: 'DeleteResource',
    url: 'https://docs.aws.amazon.com/apigateway/latest/api/API_DeleteResource.html',
    description: {
      es: 'Elimina un recurso Resource.',
      en: 'Deletes a Resource resource.',
    },
  },
  {
    eventName: 'DeleteRestApi',
    url: 'https://docs.aws.amazon.com/apigateway/latest/api/API_DeleteRestApi.html',
    description: {
      es: 'Elimina una API REST existente.',
      en: 'Deletes an existing REST API.',
    },
  },
  {
    eventName: 'DeleteUserPool',
    url: 'https://docs.aws.amazon.com/cognito-user-identity-pools/latest/APIReference/API_DeleteUserPool.html',
    description: {
      es: 'Elimina un grupo de usuarios.',
      en: 'Deletes a user pool.',
    },
  },
  {
    eventName: 'DeleteUserPoolClient',
    url: 'https://docs.aws.amazon.com/cognito-user-identity-pools/latest/APIReference/API_DeleteUserPoolClient.html',
    description: {
      es: 'Elimina un cliente de grupo de usuarios.',
      en: 'Deletes a user pool client.',
    },
  },
  {
    eventName: 'DeleteUserPoolDomain',
    url: 'https://docs.aws.amazon.com/cognito-user-identity-pools/latest/APIReference/API_DeleteUserPoolDomain.html',
    description: {
      es: 'Elimina un dominio de grupo de usuarios.',
      en: 'Deletes a user pool domain.',
    },
  },
  {
    eventName: 'PublishVersion20150331',
    url: 'https://docs.aws.amazon.com/lambda/latest/dg/API_PublishVersion.html',
    description: {
      es: 'Crea una nueva versión de una función Lambda.',
      en: 'Creates a new version of a Lambda function.',
    },
  },
  {
    eventName: 'PutIntegration',
    url: 'https://docs.aws.amazon.com/apigateway/latest/api/API_PutIntegration.html',
    description: {
      es: 'Configura la integración de un método con un servicio de AWS o un endpoint URL.',
      en: "Sets up a specified method's integration with an AWS service or a URL endpoint.",
    },
  },
  {
    eventName: 'PutIntegrationResponse',
    url: 'https://docs.aws.amazon.com/apigateway/latest/api/API_PutIntegrationResponse.html',
    description: {
      es: 'Representa la respuesta de integración de un método.',
      en: "Represents a method's integration response.",
    },
  },
  {
    eventName: 'PutMethod',
    url: 'https://docs.aws.amazon.com/apigateway/latest/api/API_PutMethod.html',
    description: {
      es: 'Agrega un método a un recurso existente.',
      en: 'Adds a method to an existing Resource resource.',
    },
  },
  {
    eventName: 'PutMethodResponse',
    url: 'https://docs.aws.amazon.com/apigateway/latest/api/API_PutMethodResponse.html',
    description: {
      es: 'Agrega un recurso MethodResponse a un recurso Method existente.',
      en: 'Adds a MethodResponse resource to an existing Method resource.',
    },
  },
  {
    eventName: 'RemovePermission20150331v2',
    url: 'https://docs.aws.amazon.com/lambda/latest/dg/API_RemovePermission.html',
    description: {
      es: 'Revoca permisos de una función Lambda.',
      en: 'Revokes permissions from a Lambda function.',
    },
  },
  {
    eventName: 'TagResource',
    url: 'https://docs.aws.amazon.com/organizations/latest/APIReference/API_TagResource.html',
    description: {
      es: 'Agrega o sobrescribe etiquetas para el recurso de AWS especificado.',
      en: 'Adds or overwrites tags for the specified AWS resource.',
    },
  },
  {
    eventName: 'UpdateAuthorizer',
    url: 'https://docs.aws.amazon.com/apigateway/latest/api/API_UpdateAuthorizer.html',
    description: {
      es: 'Actualiza un recurso Authorizer existente.',
      en: 'Updates an existing Authorizer resource.',
    },
  },
  {
    eventName: 'UpdateDistribution',
    url: 'https://docs.aws.amazon.com/cloudfront/latest/APIReference/API_UpdateDistribution.html',
    description: {
      es: 'Actualiza la configuración de una distribución de CloudFront existente.',
      en: 'Updates the configuration of an existing CloudFront distribution.',
    },
  },
  {
    eventName: 'UpdateGatewayResponse',
    url: 'https://docs.aws.amazon.com/apigateway/latest/api/API_UpdateGatewayResponse.html',
    description: {
      es: 'Actualiza un recurso GatewayResponse.',
      en: 'Updates a GatewayResponse resource.',
    },
  },
  {
    eventName: 'UpdateIntegrationResponse',
    url: 'https://docs.aws.amazon.com/apigateway/latest/api/API_UpdateIntegrationResponse.html',
    description: {
      es: 'Representa una actualización de la respuesta de integración de un método.',
      en: "Represents an update to a method's integration response.",
    },
  },
  {
    eventName: 'UpdateMethod',
    url: 'https://docs.aws.amazon.com/apigateway/latest/api/API_UpdateMethod.html',
    description: {
      es: 'Actualiza un recurso Method existente.',
      en: 'Updates an existing Method resource.',
    },
  },
  {
    eventName: 'UpdateMethodResponse',
    url: 'https://docs.aws.amazon.com/apigateway/latest/api/API_UpdateMethodResponse.html',
    description: {
      es: 'Actualiza un recurso MethodResponse existente.',
      en: 'Updates an existing MethodResponse resource.',
    },
  },
  {
    eventName: 'UpdateStage',
    url: 'https://docs.aws.amazon.com/apigateway/latest/api/API_UpdateStage.html',
    description: {
      es: 'Actualiza un recurso Stage.',
      en: 'Updates a Stage resource.',
    },
  },
  {
    eventName: 'UpdateUserPoolClient',
    url: 'https://docs.aws.amazon.com/cognito-user-identity-pools/latest/APIReference/API_UpdateUserPoolClient.html',
    description: {
      es: 'Actualiza el cliente del grupo de usuarios especificado.',
      en: 'Updates the specified user pool client.',
    },
  },
  {
    eventName: 'ValidateTemplate',
    url: 'https://docs.aws.amazon.com/AWSCloudFormation/latest/APIReference/API_ValidateTemplate.html',
    description: {
      es: 'Valida una plantilla de CloudFormation especificada.',
      en: 'Validates a specified CloudFormation template.',
    },
  },
  {
    eventName: 'DeleteDistribution',
    url: 'https://docs.aws.amazon.com/cloudfront/latest/APIReference/API_DeleteDistribution.html',
    description: {
      es: 'Elimina una distribución de CloudFront.',
      en: 'Deletes a CloudFront distribution.',
    },
  },
  {
    eventName: 'DeleteRepository',
    url: 'https://docs.aws.amazon.com/AmazonECR/latest/APIReference/API_DeleteRepository.html',
    description: {
      es: 'Elimina un repositorio de Amazon ECR.',
      en: 'Deletes an Amazon ECR repository.',
    },
  },
  {
    eventName: 'PutCredentials',
    url: 'https://docs.aws.amazon.com/service-authorization/latest/reference/list_awscloudshell.html',
    description: {
      es: 'Sube un nuevo conjunto de credenciales para el usuario especificado.',
      en: 'Uploads a new set of credentials for the specified user.',
    },
  },
  {
    eventName: 'DeleteSession',
    url: 'https://docs.aws.amazon.com/glue/latest/webapi/API_DeleteSession.html',
    description: {
      es: 'Elimina una sesión.',
      en: 'Deletes a session.',
    },
  },
  {
    eventName: 'CreateSession',
    url: 'https://docs.aws.amazon.com/glue/latest/webapi/API_CreateSession.html',
    description: {
      es: 'Crea una nueva sesión para un usuario.',
      en: 'Creates a new session for a user.',
    },
  },
  {
    eventName: 'StartEnvironment',
    url: 'https://docs.aws.amazon.com/service-authorization/latest/reference/list_awscloudshell.html',
    description: {
      es: 'Inicia un entorno que esté detenido o en estado inactivo.',
      en: 'Starts a development environment that is stopped or inactive.',
    },
  },
  {
    eventName: 'CreateEnvironment',
    url: 'https://docs.aws.amazon.com/service-authorization/latest/reference/list_awscloudshell.html',
    description: {
      es: 'Otorga permisos para crear un entorno CloudShell.',
      en: 'Grants permissions to create a CloudShell environment.',
    },
  },
  {
    eventName: 'PutImage',
    url: 'https://docs.aws.amazon.com/AmazonECR/latest/APIReference/API_PutImage.html',
    description: {
      es: 'Sube un manifiesto de imagen a un repositorio de Amazon ECR.',
      en: 'Uploads an image manifest to an Amazon ECR repository',
    },
  },
  {
    eventName: 'UploadLayerPart',
    url: 'https://docs.aws.amazon.com/AmazonECR/latest/APIReference/API_UploadLayerPart.html',
    description: {
      es: 'Sube una parte específica de una capa de imagen a Amazon ECR.',
      en: 'Uploads a specified chunk of an image layer.',
    },
  },
  {
    eventName: 'CompleteLayerUpload',
    url: 'https://docs.aws.amazon.com/AmazonECR/latest/APIReference/API_CompleteLayerUpload.html',
    description: {
      es: 'Informa a Amazon ECR que la carga de la capa de imagen se ha completado.',
      en: 'Informs Amazon ECR that the image layer upload has completed.',
    },
  },
  {
    eventName: 'InitiateLayerUpload',
    url: 'https://docs.aws.amazon.com/AmazonECR/latest/APIReference/API_InitiateLayerUpload.html',
    description: {
      es: 'Notifica a Amazon ECR que deseas cargar una capa de imagen.',
      en: 'Notifies Amazon ECR that you intend to upload an image layer.',
    },
  },
  {
    eventName: 'CreateRepository',
    url: 'https://docs.aws.amazon.com/AmazonECR/latest/APIReference/API_CreateRepository.html',
    description: {
      es: 'Crea un repositorio de Amazon ECR.',
      en: 'Creates an Amazon ECR repository.',
    },
  },
  {
    eventName: 'UpdateFunctionCode20150331v2',
    url: 'https://docs.aws.amazon.com/lambda/latest/dg/API_UpdateFunctionCode.html',
    description: {
      es: 'Actualiza el código de una función Lambda.',
      en: 'Updates the code of a Lambda function.',
    },
  },
  {
    eventName: 'DeleteJob',
    url: 'https://docs.aws.amazon.com/glue/latest/webapi/API_DeleteJob.html',
    description: {
      es: 'Elimina una definición de trabajo de AWS especificada.',
      en: 'Deletes a specified AWS Glue job definition.',
    },
  },
  {
    eventName: 'DeleteDatabase',
    url: 'https://docs.aws.amazon.com/glue/latest/webapi/API_DeleteDatabase.html',
    description: {
      es: 'Elimina una base de datos de AWS Glue especificada.',
      en: 'Deletes a specified AWS Glue database.',
    },
  },
  {
    eventName: 'DeleteCrawler',
    url: 'https://docs.aws.amazon.com/glue/latest/webapi/API_DeleteCrawler.html',
    description: {
      es: 'Elimina un crawler de AWS Glue.',
      en: 'Deletes an AWS Glue crawler.',
    },
  },
  {
    eventName: 'DeleteDeliveryStream',
    url: 'https://docs.aws.amazon.com/firehose/latest/APIReference/API_DeleteDeliveryStream.html',
    description: {
      es: 'Elimina el stream de entrega de Amazon Kinesis Firehose especificado.',
      en: 'Deletes the specified Amazon Kinesis Firehose delivery stream.',
    },
  },
  {
    eventName: 'StartQueryExecution',
    url: 'https://docs.aws.amazon.com/athena/latest/APIReference/API_StartQueryExecution.html',
    description: {
      es: 'Inicia una nueva ejecución de consulta en Amazon Athena.',
      en: 'Starts a new query execution in Amazon Athena.',
    },
  },
  {
    eventName: 'StopSession',
    url: 'https://docs.aws.amazon.com/glue/latest/webapi/API_StopSession.html',
    description: {
      es: 'Detiene una sesión en Amazon Managed Blockchain.',
      en: 'Stops a session in Amazon Managed Blockchain.',
    },
  },
  {
    eventName: 'CreateJob',
    url: 'https://docs.aws.amazon.com/glue/latest/webapi/API_CreateJob.html',
    description: {
      es: 'Crea una nueva definición de trabajo de AWS Glue.',
      en: 'Creates a new AWS Glue job definition.',
    },
  },
  {
    eventName: 'StartCrawler',
    url: 'https://docs.aws.amazon.com/glue/latest/webapi/API_StartCrawler.html',
    description: {
      es: 'Inicia un crawler de AWS Glue especificado.',
      en: 'Starts a specified AWS Glue crawler.',
    },
  },
  {
    eventName: 'CreateDatabase',
    url: 'https://docs.aws.amazon.com/glue/latest/webapi/API_CreateDatabase.html',
    description: {
      es: 'Crea una nueva base de datos de AWS Glue.',
      en: 'Creates a new AWS Glue database.',
    },
  },
  {
    eventName: 'CreateCrawler',
    url: 'https://docs.aws.amazon.com/glue/latest/webapi/API_CreateCrawler.html',
    description: {
      es: 'Crea un nuevo crawler de AWS Glue.',
      en: 'Creates a new AWS Glue crawler.',
    },
  },
  {
    eventName: 'CreateDeliveryStream',
    url: 'https://docs.aws.amazon.com/firehose/latest/APIReference/API_CreateDeliveryStream.html',
    description: {
      es: 'Crea un nuevo stream de entrega de Amazon Kinesis Firehose.',
      en: 'Creates a new Amazon Kinesis Firehose delivery stream.',
    },
  },
  {
    eventName: 'CreateStage',
    url: 'https://docs.aws.amazon.com/apigateway/latest/api/API_CreateStage.html',
    description: {
      es: 'Crea un nuevo recurso Stage en API Gateway.',
      en: 'Creates a new Stage resource.',
    },
  },
  {
    eventName: 'CreateStateMachine',
    url: 'https://docs.aws.amazon.com/step-functions/latest/apireference/API_CreateStateMachine.html',
    description: {
      es: 'Crea una nueva máquina de estados en AWS Step Functions.',
      en: 'Creates a new state machine in AWS Step Functions.',
    },
  },
  {
    eventName: 'ImportApi',
    url: 'https://docs.aws.amazon.com/apigateway/latest/api/API_ImportRestApi.html',
    description: {
      es: 'Importa una API REST desde una definición OpenAPI.',
      en: 'Imports a REST API from an OpenAPI definition.',
    },
  },
  {
    eventName: 'CreateEventBus',
    url: 'https://docs.aws.amazon.com/eventbridge/latest/APIReference/API_CreateEventBus.html',
    description: {
      es: 'Crea un nuevo bus de eventos.',
      en: 'Creates a new event bus.',
    },
  },
  {
    eventName: 'CreatePlaceIndex',
    url: 'https://docs.aws.amazon.com/location/previous/APIReference/API_CreatePlaceIndex.html',
    description: {
      es: 'Crea un nuevo recurso de índice de lugares en Amazon Location Service.',
      en: 'Creates a new place index resource in Amazon Location Service.',
    },
  },
  {
    eventName: 'CreateRouteCalculator',
    url: 'https://docs.aws.amazon.com/location/latest/APIReference/API_CreateRouteCalculator.html',
    description: {
      es: 'Crea un nuevo recurso de calculadora de rutas en Amazon Location Service.',
      en: 'Creates a new route calculator resource in Amazon Location Service.',
    },
  },
  {
    eventName: 'DeleteEnvironment',
    url: 'https://docs.aws.amazon.com/service-authorization/latest/reference/list_awscloudshell.html',
    description: {
      es: 'Permite eliminar un entorno de AWS CloudShell.',
      en: 'Permission to delete an AWS CloudShell environment.',
    },
  },
  {
    eventName: 'GetEnvironmentStatus',
    url: 'https://docs.aws.amazon.com/service-authorization/latest/reference/list_awscloudshell.html',
    description: {
      es: 'Permite consultar el estado de un entorno CloudShell existente.',
      en: 'Allows querying the status of an existing CloudShell environment.',
    },
  },
  {
    eventName: 'DescribeEnvironments',
    url: 'https://docs.aws.amazon.com/service-authorization/latest/reference/list_awscloudshell.html',
    description: {
      es: 'Permite listar entornos CloudShell del usuario.',
      en: "Allows listing the user's CloudShell environments.",
    },
  },
  {
    eventName: 'GetFileDownloadUrls',
    url: 'https://docs.aws.amazon.com/service-authorization/latest/reference/list_awscloudshell.html',
    description: {
      es: 'Genera URLs prefirmadas para descargar archivos desde CloudShell.',
      en: 'Generates pre-signed URLs to download files from CloudShell.',
    },
  },
  {
    eventName: 'GetFileUploadUrls',
    url: 'https://docs.aws.amazon.com/service-authorization/latest/reference/list_awscloudshell.html',
    description: {
      es: 'Genera URLs prefirmadas para cargar archivos en CloudShell.',
      en: 'Generates pre-signed URLs to upload files to CloudShell',
    },
  },
  {
    eventName: 'RedeemCode',
    url: 'https://docs.aws.amazon.com/cloudshell/latest/userguide/logging-and-monitoring.html?utm',
    description: {
      es: 'Recupera el token de actualización en el entorno CloudShell.',
      en: 'Occurs when the workflow to retrieve refresh token in the CloudShell environment begins.',
    },
  },
  {
    eventName: 'SendHeartBeat',
    url: 'https://docs.aws.amazon.com/cloudshell/latest/userguide/logging-and-monitoring.html',
    description: {
      es: 'El cliente web envía un heartbeat periódico para mantener la sesión activa',
      en: 'The web client sends a periodic heartbeat to keep current session',
    },
  },
  {
    eventName: 'CreateLogStream',
    url: 'https://docs.aws.amazon.com/AmazonCloudWatchLogs/latest/APIReference/API_CreateLogStream.html',
    description: {
      es: 'Crea un flujo de registro para el grupo de registros especificado.',
      en: 'Creates a log stream for the specified log group.',
    },
  },
  {
    eventName: 'UpdateInstanceInformation',
    url: 'https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-setting-up-messageAPIs.html',
    description: {
      es: 'El agente SSM llama al servicio Systems Manager en la nube cada 5 minutos para proporcionar información sobre el latido.',
      en: 'SSM Agent calls the Systems Manager service in the cloud every 5 minutes to provide heartbeat information. ',
    },
  },
  {
    eventName: 'InitiateAuth',
    url: 'https://docs.aws.amazon.com/cognito-user-identity-pools/latest/APIReference/API_InitiateAuth.html',
    description: {
      es: 'Declara un flujo de autenticación e inicia el inicio de sesión de un usuario en el directorio de usuarios de Amazon Cognito.',
      en: 'Declares an authentication flow and initiates sign-in for a user in the Amazon Cognito user directory.',
    },
  },
  {
    eventName: 'RespondToAuthChallenge',
    url: 'https://docs.aws.amazon.com/cognito-user-identity-pools/latest/APIReference/API_RespondToAuthChallenge.html',
    description: {
      es: 'Proporciona la respuesta a un desafío de user pool',
      en: 'Provides the solution to a problem posed by the user pool.',
    },
  },
  {
    eventName: 'SharedSnapshotCopyInitiated',
    url: 'https://docs.aws.amazon.com/es_es/ebs/latest/userguide/ebs-modifying-snapshot-permissions.html',
    description: {
      es: 'Se está utilizando una instantánea compartida para crear un volumen.',
      en: 'A shared snapshot is being copied.',
    },
  },
  {
    eventName: 'SharedSnapshotVolumeCreated',
    url: 'https://docs.aws.amazon.com/es_es/ebs/latest/userguide/ebs-modifying-snapshot-permissions.html',
    description: {
      es: 'Se está copiando una instantánea compartida',
      en: 'A shared snapshot is being used to create a volume.',
    },
  },
  {
    eventName: 'RegisterManagedInstance',
    url: 'https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-setting-up-messageAPIs.html',
    description: {
      es: 'El agente SSM ejecuta esta operación API en los siguientes casos: Para registrar un servidor local o una máquina virtual (VM) en Systems Manager como instancia gestionada utilizando un código de activación y un ID. Para registrar las credenciales de AWS IoT Greengrass Versión 2.',
      en: 'SSM Agent runs this API operation for the following scenarios: To register an on-premises server or virtual machine (VM) with Systems Manager as a managed instance using an activation code and ID.  To register AWS IoT Greengrass Version 2 credentials.',
    },
  },
  {
    eventName: 'RotateKey',
    url: 'https://docs.aws.amazon.com/kms/latest/developerguide/ct-rotatekey.html',
    description: {
      es: 'Enlace a ejemplos',
      en: 'Link to examples',
    },
  },
  {
    eventName: 'DeleteAlarms',
    url: 'https://docs.aws.amazon.com/AmazonCloudWatch/latest/APIReference/API_DeleteAlarms.html',
    description: {
      es: 'Elimina las alarmas especificadas',
      en: 'Deletes the specified alarms',
    },
  },
  {
    eventName: 'SearchAgreements',
    url: 'https://docs.aws.amazon.com/marketplace/latest/APIReference/API_marketplace-agreements_SearchAgreements.html',
    description: {
      es: 'Busca en todos los acuerdos que un proponente tiene en AWS Marketplace.',
      en: 'Searches across all agreements that a proposer has in AWS Marketplace. ',
    },
  },
  {
    eventName: 'SearchListings',
    url: 'https://docs.aws.amazon.com/datazone/latest/APIReference/API_SearchListings.html',
    description: {
      es: 'Busca listados (registros de un activo en un momento dado) en Amazon DataZone.',
      en: 'Searches listings (records of an asset at a given time) in Amazon DataZone.',
    },
  },
  {
    eventName: 'PutBucketPublicAccessBlock',
    url: 'https://docs.aws.amazon.com/AmazonS3/latest/API/API_PutPublicAccessBlock.html',
    description: {
      es: 'Crea o modifica la configuración PublicAccessBlock para un bucket de Amazon S3.',
      en: 'Creates or modifies the PublicAccessBlock configuration for an Amazon S3 bucket.',
    },
  },
  {
    eventName: 'PutBucketEncryption',
    url: 'https://docs.aws.amazon.com/AmazonS3/latest/API/API_PutBucketEncryption.html',
    description: {
      es: 'Configura el cifrado predeterminado y las claves de Amazon S3 Bucket para un bucket existente.',
      en: 'Configures default encryption and Amazon S3 Bucket Keys for an existing bucket.',
    },
  },
  {
    eventName: 'ValidatePolicy',
    url: 'https://docs.aws.amazon.com/access-analyzer/latest/APIReference/API_ValidatePolicy.html',
    description: {
      es: 'Solicita la validación de una política y devuelve una lista de resultados.',
      en: 'Requests the validation of a policy and returns a list of findings.',
    },
  },
  {
    eventName: 'PutBucketPolicy',
    url: 'https://docs.aws.amazon.com/AmazonS3/latest/API/API_PutBucketPolicy.html',
    description: {
      es: 'Aplica una política de bucket de Amazon S3 a un bucket de Amazon S3.',
      en: 'Creates or modifies the PublicAccessBlock configuration for an Amazon S3 bucket.',
    },
  },
]
