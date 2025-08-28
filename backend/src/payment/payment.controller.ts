/**
 * payment.controller.ts - Payment Controller
 * 
 * This controller handles payment-related HTTP requests including:
 * - New subscriber activation endpoints
 * - Return to free subscriber endpoints
 * - Monthly renewal webhook endpoints
 * 
 * Responsibilities:
 * - Defines payment API endpoints
 * - Handles request/response validation
 * - Delegates business logic to payment service
 */

import { Controller, Post, Body, HttpStatus, HttpCode, Headers, BadRequestException, Req } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { WebhookValidatorService } from './webhook-validator.service';
import { UserIdDto, PaymentResponseDto, MonthlyRenewResponseDto, LemonSqueezyWebhookDto, WebhookResponseDto } from './dto/payment.dto';

@Controller('payment')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly webhookValidator: WebhookValidatorService,
  ) {}

  /**
   * POST /payment/subscription
   * Unified Lemon Squeezy webhook endpoint
   * Handles subscription_created, subscription_cancelled, subscription_updated, etc.
   */
  @Post('subscription')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Body() webhookPayload: LemonSqueezyWebhookDto,
    @Headers('x-signature') signature?: string,
    @Req() request?: any,
  ): Promise<WebhookResponseDto> {
    
    console.log('webhookPayload:', JSON.stringify(webhookPayload, null, 2));
    // Validate webhook signature for security
    if (signature && request?.rawBody) {
      this.webhookValidator.validateOrThrow(signature, request.rawBody);
    }

    // Validate webhook payload structure
    if (!webhookPayload.meta?.event_name || !webhookPayload.data) {
      throw new BadRequestException('Invalid webhook payload structure');
    }

    return await this.paymentService.handleWebhook(webhookPayload);
  }


  /**
   * POST /payment/return-to-free
   * Convert user to free subscriber (20 tokens + remove premium status)
   * @deprecated Use webhook endpoint instead
   */
  @Post('return-to-free')
  @HttpCode(HttpStatus.OK)
  async returnToFree(@Body() userIdDto: UserIdDto): Promise<PaymentResponseDto> {
    return await this.paymentService.returnToFree(userIdDto.user_id);
  }

  /**
   * POST /payment/monthly-renew
   * Monthly renewal for all premium users (webhook endpoint)
   * Sets all premium users' tokens to 500
   */
  @Post('monthly-renew')
  @HttpCode(HttpStatus.OK)
  async monthlyRenew(): Promise<MonthlyRenewResponseDto> {
    return await this.paymentService.monthlyRenew();
  }
}
