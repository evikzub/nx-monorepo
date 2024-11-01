export interface ServiceRoute {
  path: string;
  service: string;
  port: number;
  healthCheck: string;
}

export interface GatewayConfig {
  services: {
    userService: ServiceRoute;
    // Add other services here
  };
  gateway: {
    port: number;
    prefix: string;
  };
}

export const gatewayConfig: GatewayConfig = {
  services: {
    userService: {
      path: '/api/users',
      service: 'user-service',
      port: 3011,
      healthCheck: '/health'
    }
  },
  gateway: {
    port: 3010,
    prefix: '/api'
  }
}; 