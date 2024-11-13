/* eslint-disable */
import { execSync } from 'child_process';

export default async function globalTeardown() {
  const ci = process.env.CI || 'true'; // do not run app in docker

  if (ci !== 'true') {
    // Stop services
    execSync('docker-compose down');
  }
  console.log(globalThis.__TEARDOWN_MESSAGE__);
}
