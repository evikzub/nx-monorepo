export interface ApiErrorResponse {
  message: string;
  statusCode: number;
  error?: string;
  path?: string;
  timestamp?: string;
  details?: Record<string, any>;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  statusCode: number;
} 