/**
 * app.controller.ts - Root HTTP Request Handler
 * 
 * This controller handles HTTP requests to the root path of the application.
 * It serves as the main entry point for API endpoints and manages
 * the HTTP request/response cycle.
 * 
 * Responsibilities:
 * - Defines API routes and endpoints
 * - Handles incoming HTTP requests (GET, POST, PUT, DELETE)
 * - Validates incoming request data
 * - Calls appropriate services for business logic
 * - Returns HTTP responses to clients
 * - Manages request/response transformation
 */

import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

/**
 * @Controller decorator - HTTP request handler
 * 
 * This decorator marks this class as a controller and defines:
 * - The base route path for all endpoints in this controller
 * - Empty string means root path (/)
 * - Can be '/api', '/v1', etc. for versioned APIs
 */
@Controller()
export class AppController {
  /**
   * Constructor - Dependency Injection
   * 
   * NestJS automatically injects the AppService instance.
   * This follows the dependency injection pattern for loose coupling.
   * 
   * @param appService - Injected service containing business logic
   */
  constructor(private readonly appService: AppService) {}

  /**
   * @Get decorator - HTTP GET request handler
   * 
   * This method handles GET requests to the root path (/).
   * 
   * Route: GET /
   * Purpose: Returns a simple greeting message
   * Returns: string - Hello message from the service
   */
  @Get()
  getHello(): string {
    // Delegate business logic to the service layer
    // This maintains separation of concerns
    return this.appService.getHello();
  }
}
