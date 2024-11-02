import { Logger } from '@nestjs/common';
import * as net from 'net';

export class PortManager {
  private static usedPorts = new Set<number>();
  private static logger = new Logger('PortManager');

  static async getAvailablePort(startPort = 3000): Promise<number> {
    const server = net.createServer();

    const getPort = (port: number): Promise<number> => {
      return new Promise((resolve, reject) => {
        server.listen(port, () => {
          const { port } = server.address() as net.AddressInfo;
          server.close(() => resolve(port));
        });

        server.on('error', (err: NodeJS.ErrnoException) => {
          if (err.code === 'EADDRINUSE') {
            // Port is in use, try the next one
            getPort(port + 1).then(resolve, reject);
          } else {
            reject(err);
          }
        });
      });
    };

    try {
      const port = await getPort(startPort);
      this.usedPorts.add(port);
      this.logger.debug(`Allocated port: ${port}`);
      return port;
    } catch (error) {
      this.logger.error(`Failed to get port: ${error.message}`);
      throw error;
    }
  }

  static async getMultiplePorts(count: number, startPort = 3000): Promise<number[]> {
    const ports: number[] = [];
    let currentPort = startPort;

    for (let i = 0; i < count; i++) {
      const port = await this.getAvailablePort(currentPort);
      ports.push(port);
      currentPort = port + 1;
    }

    return ports;
  }

  static releasePort(port: number): void {
    this.usedPorts.delete(port);
    this.logger.debug(`Released port: ${port}`);
  }

  static releaseAllPorts(): void {
    this.usedPorts.clear();
    this.logger.debug('Released all ports');
  }
} 