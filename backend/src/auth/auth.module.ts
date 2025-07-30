/**
 * auth.module.ts - Authentication Module
 * 
 * This module handles authentication-related functionality including:
 * - User authentication and authorization
 * - JWT token management
 * - Session handling
 * - Error handling and graceful fallbacks
 * 
 * Responsibilities:
 * - Imports required dependencies (ConfigModule)
 * - Declares auth controllers and services
 * - Provides authentication-related functionality to the application
 */

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [],
  providers: [],
  exports: [], // Export services for use in other modules if needed
})
export class AuthModule {} 