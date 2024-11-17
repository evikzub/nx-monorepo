import { useState } from 'react';
import { ApiError } from '@/lib/utils/errors';

interface UseApiRequestOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

export function useApiRequest<T>(
  apiCall: (...args: any[]) => Promise<T>,
  options: UseApiRequestOptions<T> = {}
) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = async (...args: any[]) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiCall(...args);
      options.onSuccess?.(data);
      return data;
    } catch (err) {
      const message = err instanceof ApiError 
        ? err.message 
        : 'An unexpected error occurred';
      setError(message);
      options.onError?.(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    execute,
    isLoading,
    error,
    setError,
  };
} 