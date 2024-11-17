export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public error?: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
} 