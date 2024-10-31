export enum SpanType {
  // Database Operations
  DB_QUERY = 'db_query',
  DB_TRANSACTION = 'db_transaction',
  DB_MIGRATION = 'db_migration',

  // External Services
  HTTP_REQUEST = 'http_request',
  GRPC_CALL = 'grpc_call',
  QUEUE_OPERATION = 'queue_operation',
  CACHE_OPERATION = 'cache_operation',

  // Business Logic
  SERVICE_OPERATION = 'service_operation',
  VALIDATION = 'validation',
  AUTHORIZATION = 'authorization',
  FILE_OPERATION = 'file_operation',

  // Integration
  EMAIL_SEND = 'email_send',
  NOTIFICATION = 'notification',
  PAYMENT_PROCESS = 'payment_process',
}

export enum SpanCategory {
  DATABASE = 'database',
  EXTERNAL = 'external',
  BUSINESS = 'business',
  INTEGRATION = 'integration',
}

export const SpanCategories: Record<SpanType, SpanCategory> = {
  [SpanType.DB_QUERY]: SpanCategory.DATABASE,
  [SpanType.DB_TRANSACTION]: SpanCategory.DATABASE,
  [SpanType.DB_MIGRATION]: SpanCategory.DATABASE,

  [SpanType.HTTP_REQUEST]: SpanCategory.EXTERNAL,
  [SpanType.GRPC_CALL]: SpanCategory.EXTERNAL,
  [SpanType.QUEUE_OPERATION]: SpanCategory.EXTERNAL,
  [SpanType.CACHE_OPERATION]: SpanCategory.EXTERNAL,

  [SpanType.SERVICE_OPERATION]: SpanCategory.BUSINESS,
  [SpanType.VALIDATION]: SpanCategory.BUSINESS,
  [SpanType.AUTHORIZATION]: SpanCategory.BUSINESS,
  [SpanType.FILE_OPERATION]: SpanCategory.BUSINESS,

  [SpanType.EMAIL_SEND]: SpanCategory.INTEGRATION,
  [SpanType.NOTIFICATION]: SpanCategory.INTEGRATION,
  [SpanType.PAYMENT_PROCESS]: SpanCategory.INTEGRATION,
}; 