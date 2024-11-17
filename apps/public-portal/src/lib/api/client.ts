import axios, { AxiosError } from 'axios';
import { ApiError } from '../utils/errors';
import { ApiErrorResponse } from '@/types/api';
import * as dotenv from 'dotenv';

dotenv.config();

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_GATEWAY_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    if (error.response?.data) {
      const errorData = error.response.data;
      throw new ApiError(
        errorData.message || 'An error occurred',
        error.response.status || 500,
        errorData.error,
        errorData.details
      );
    }
    throw new Error('Network error');
  }
);

// Add request interceptor to handle auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
); 