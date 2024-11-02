import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ExtendedInternalAxiosRequestConfig } from '../interfaces/axios.interface';
import { InternalAxiosRequestConfig } from 'axios';

@Injectable()
export class AxiosMetadataInterceptor {
  constructor(private readonly httpService: HttpService) {
    this.httpService.axiosRef.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // Safely cast to our extended type
        const extendedConfig = config as ExtendedInternalAxiosRequestConfig;
        
        // You can add additional metadata handling here
        if (extendedConfig.metadata) {
          // Handle metadata if needed
        }

        return config;
      }
    );
  }
} 