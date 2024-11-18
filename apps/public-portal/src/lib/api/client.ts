import axios, { AxiosError } from 'axios';
//import { ApiError } from '../utils/errors';
//import { ApiErrorResponse } from '@/types/api';

const API_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL;

if (!API_URL) {
  throw new Error('API_GATEWAY_URL environment variable is not defined');
}

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
  // // Ensure we get proper error responses
  // validateStatus: (status) => {
  //   return status >= 200 && status < 500; // Handle 4xx errors as responses, not network errors
  // },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => { //: AxiosError<ApiErrorResponse>
    //console.log('! AxiosError', error);
    if (axios.isAxiosError(error)){
      //const axiosError = error as AxiosError<ApiError>;
      //const axiosError = error as AxiosError<ApiErrorResponse>;
      return Promise.reject(error);
    }
    // if (error.response?.data) {
    //   const errorData = error.response.data;
    //   throw new ApiError(
    //     errorData.message || 'An error occurred',
    //     error.response.status || 500,
    //     errorData.error,
    //     errorData.details
    //   );
    // }
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