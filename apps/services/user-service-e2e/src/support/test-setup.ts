/* eslint-disable */

import axios from 'axios';
import { config } from 'dotenv';
import { join } from 'path';

console.log('TEST-SETUP: Loading test environment variables...');
const env = join(__dirname, '../../../user-service/.env.test')
console.log('__dirname -> ', env);
// Load test environment variables
config({ path: env });

module.exports = async function () {
  console.log('TEST-SETUP: Setting up test environment...');
  // Configure axios for tests to use.
  // const host = process.env.HOST ?? 'localhost';
  // const port = process.env.PORT ?? '3000';
  // axios.defaults.baseURL = `http://${host}:${port}`;
};
