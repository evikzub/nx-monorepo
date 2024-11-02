export interface IRateLimiter {
  isAllowed(key: string): Promise<boolean>;
  consume(key: string, points?: number): Promise<RateLimitResult>;
  reset(key: string): Promise<void>;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: Date;
  limit: number;
}

export interface RateLimitConfig {
  points: number;
  duration: number;
  blockDuration?: number;
  keyPrefix?: string;
} 