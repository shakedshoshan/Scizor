/**
 * app.service.ts - Root Business Logic Service
 * 
 * This service contains the core business logic for the application.
 * It handles data processing, business rules, and complex operations
 * that are separate from HTTP request/response handling.
 * 
 * Responsibilities:
 * - Implements business logic and algorithms
 * - Processes and transforms data
 * - Handles complex operations and calculations
 * - Can be shared across multiple controllers
 * - Maintains separation of concerns
 * - Provides reusable business functionality
 */

import { Injectable } from '@nestjs/common';

/**
 * @Injectable decorator - Dependency Injection
 * 
 * This decorator marks this class as injectable, meaning:
 * - It can be injected into other classes (controllers, other services)
 * - NestJS will manage its lifecycle and instantiation
 * - It can be used in the dependency injection container
 * - Supports singleton pattern by default
 */
@Injectable()
export class AppService {
  /**
   * getHello - Simple greeting method
   * 
   * This method demonstrates basic service functionality.
   * In a real application, this would contain complex business logic,
   * data processing, or integration with external services.
   * 
   * @returns string - A greeting message
   * 
   * Example usage:
   * const greeting = appService.getHello();
   * // Returns: "Hello World!"
   */
  getHello(): string {
    return 'Hello World!';
  }


}
