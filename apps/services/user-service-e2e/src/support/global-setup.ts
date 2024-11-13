/* eslint-disable */
var __TEARDOWN_MESSAGE__: string;

import { execSync } from 'child_process';

module.exports = async function () {
  // Start required services
  console.log('NODE_ENV -> ', process.env.NODE_ENV);
  console.log('SKIP_QUEUE -> ', process.env.SKIP_QUEUE);
  const ci = process.env.CI || 'true'; // do not run app in docker
  console.log('CI -> ', ci);

  if (ci !== 'true') {
    console.log('Starting services...');
    execSync('docker-compose up -d rabbitmq');
    
    // Wait for RabbitMQ to be ready
    await new Promise((resolve) => setTimeout(resolve, 10000));
    
    // Start the user service
    execSync('nx serve user-service');
    
    // Start the notification service
    execSync('nx serve notification-service');
    
    // Wait for services to be ready
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }

  // Start services that that the app needs to run (e.g. database, docker-compose, etc.).
  console.log('\nSetting up...\n');

  // Hint: Use `globalThis` to pass variables to global teardown.
  globalThis.__TEARDOWN_MESSAGE__ = '\nTearing down...\n';
};
