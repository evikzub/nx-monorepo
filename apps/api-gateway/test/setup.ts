import { config } from 'dotenv';
import { join } from 'path';

// Load test environment variables
config({ path: join(__dirname, '../../../.env.test') });

// Enable debug logging for nock
require('nock').debug = true;

console.log('test setup is loaded');
// Mock console methods if needed
// global.console = {
//   ...console,
//   log: jest.fn(),
//   debug: jest.fn(),
//   info: jest.fn(),
//   warn: jest.fn(),
//   error: jest.fn(),
// }; 