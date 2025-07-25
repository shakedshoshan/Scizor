/**
 * main.ts - Application Entry Point
 * 
 * This is the main entry point for the NestJS application.
 * It bootstraps the application and starts the HTTP server.
 * 
 * Responsibilities:
 * - Creates the NestJS application instance
 * - Loads the root module (AppModule)
 * - Starts the HTTP server on specified port
 * - Handles application lifecycle
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

/**
 * Bootstrap function - Application startup
 * 
 * This async function:
 * 1. Creates a NestJS application instance using NestFactory
 * 2. Loads the AppModule which contains all dependencies
 * 3. Starts the HTTP server on the specified port
 * 4. Handles graceful shutdown and error handling
 */
async function bootstrap() {
  // Create NestJS application instance
  // This initializes the dependency injection container
  const app = await NestFactory.create(AppModule);
  
  // Start the HTTP server
  // Uses PORT from environment variables or defaults to 3000
  await app.listen(process.env.PORT ?? 3000);
  
  console.log(`🚀 Application is running on: http://localhost:${process.env.PORT ?? 3000}`);
}

// Start the application
bootstrap();
