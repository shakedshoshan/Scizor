/**
 * ai.module.ts - AI Module
 * 
 * This module handles AI-related functionality including:
 * - Prompt enhancement using OpenAI GPT models
 * - Smart response generation with multiple response types
 * - Error handling and graceful fallbacks
 * 
 * Responsibilities:
 * - Imports required dependencies (ConfigModule, AuthModule)
 * - Declares AI controllers and services
 * - Provides AI-related functionality to the application
 */

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';

@Module({
  imports: [ConfigModule, AuthModule],
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService], // Export service for use in other modules if needed
})
export class AiModule {} 