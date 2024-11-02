import { InternalAxiosRequestConfig, AxiosRequestConfig } from 'axios';
import { ServiceInstance } from '../discovery/types';

export interface ExtendedAxiosRequestConfig extends AxiosRequestConfig {
  metadata?: {
    instance: ServiceInstance;
  };
}

export interface ExtendedInternalAxiosRequestConfig extends InternalAxiosRequestConfig {
  metadata?: {
    instance: ServiceInstance;
  };
} 