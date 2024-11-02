export interface IProxyService {
  forward(serviceName: string, path: string, request: ProxyRequest): Promise<any>;
}

export interface ProxyRequest {
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: any;
  query?: Record<string, string>;
}

export interface ProxyResponse {
  data: any;
  status: number;
  headers: Record<string, string>;
} 