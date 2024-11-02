export interface ICache {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, options?: CacheOptions): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}

export interface CacheOptions {
  ttl?: number;
  tags?: string[];
  priority?: 'HIGH' | 'NORMAL' | 'LOW';
}

export interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  lastCleared?: Date;
} 