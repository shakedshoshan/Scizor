/**
 * payment.module.ts - Payment Module
 * 
 * This module handles payment-related functionality including:
 * - User subscription management
 * - Premium/free tier conversions
 * - Monthly renewal operations
 * - Token allocation for subscription changes
 * 
 * Responsibilities:
 * - Imports required dependencies (ConfigModule, AuthModule)
 * - Declares payment controllers and services
 * - Provides payment-related functionality to the application
 */

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { WebhookValidatorService } from './webhook-validator.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [ConfigModule, AuthModule],
  controllers: [PaymentController],
  providers: [PaymentService, WebhookValidatorService],
  exports: [PaymentService], // Export service for use in other modules if needed
})
export class PaymentModule {}
