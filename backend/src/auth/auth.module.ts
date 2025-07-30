/**
 * auth.module.ts - Authentication Module
 * 
 * This module handles authentication-related functionality including:
 * - User authentication and authorization
 * - JWT token management
 * - Session handling
 * - Error handling and graceful fallbacks
 * - Firestore database operations
 * 
 * Responsibilities:
 * - Imports required dependencies (ConfigModule)
 * - Declares auth controllers and services
 * - Provides authentication-related functionality to the application
 */

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { FirestoreService } from './firestore.service';

@Module({
  imports: [ConfigModule],
  controllers: [AuthController],
  providers: [AuthService, FirestoreService],
  exports: [AuthService, FirestoreService], // Export services for use in other modules if needed
})
export class AuthModule {} 