/**
 * webhook-validator.service.ts - Webhook Signature Validation Service
 * 
 * This service handles Lemon Squeezy webhook signature validation
 * to ensure webhook requests are authentic and from Lemon Squeezy
 */

import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class WebhookValidatorService {
  private readonly logger = new Logger(WebhookValidatorService.name);
  private readonly webhookSecret: string;

  constructor(private readonly configService: ConfigService) {
    this.webhookSecret = this.configService.get<string>('LEMON_SQUEEZY_WEBHOOK_SECRET') || '';
    
    if (!this.webhookSecret) {
      this.logger.warn('LEMON_SQUEEZY_WEBHOOK_SECRET not configured - webhook validation disabled');
    }
  }

  /**
   * Validate Lemon Squeezy webhook signature
   * According to Lemon Squeezy docs, the signature is created using:
   * HMAC-SHA256(webhook_secret + request_body)
   */
  validateSignature(signature: string, requestBody: string): boolean {
    try {
      if (!this.webhookSecret) {
        this.logger.warn('Webhook secret not configured, skipping validation');
        return true; // Allow through in development if secret not set
      }

      if (!signature) {
        throw new UnauthorizedException('Missing webhook signature');
      }

      // Remove 'sha256=' prefix if present (some webhook services include this)
      const cleanSignature = signature.replace(/^sha256=/, '');
      
      // Create expected signature
      const expectedSignature = crypto
        .createHmac('sha256', this.webhookSecret)
        .update(requestBody, 'utf8')
        .digest('hex');

      // Use crypto.timingSafeEqual to prevent timing attacks
      const signatureBuffer = Buffer.from(cleanSignature, 'hex');
      const expectedBuffer = Buffer.from(expectedSignature, 'hex');

      if (signatureBuffer.length !== expectedBuffer.length) {
        this.logger.error('Webhook signature length mismatch');
        return false;
      }

      const isValid = crypto.timingSafeEqual(signatureBuffer, expectedBuffer);
      
      if (!isValid) {
        this.logger.error('Webhook signature validation failed');
      } else {
        this.logger.log('Webhook signature validated successfully');
      }

      return isValid;
    } catch (error) {
      this.logger.error(`Webhook signature validation error: ${error.message}`);
      return false;
    }
  }

  /**
   * Validate webhook and throw exception if invalid
   */
  validateOrThrow(signature: string, requestBody: string): void {
    if (!this.validateSignature(signature, requestBody)) {
      throw new UnauthorizedException('Invalid webhook signature');
    }
  }
}
