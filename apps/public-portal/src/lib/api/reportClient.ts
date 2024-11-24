import axios from 'axios';

let REPORT_API_URL = process.env.NEXT_PUBLIC_NOTIFICATION_SERVICE_URL;

if (!REPORT_API_URL) {
  REPORT_API_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL
  //throw new Error('REPORT_API_URL is not defined')
}

// TODO: Temporrary API client for notification service
// TODO: Remove this after resolving Error: Failed to launch the browser process!
export const apiReportClient = axios.create({
  baseURL: REPORT_API_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  }
});

apiReportClient.interceptors.response.use(
  (response) => response,
  (error) => { 
    if (axios.isAxiosError(error)){
      return Promise.reject(error);
    }
    throw new Error('Network error');
  }
);

// Add request interceptor to handle auth token
apiReportClient.interceptors.request.use(
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