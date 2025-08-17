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

import { Controller, Post, Body, HttpStatus, HttpCode } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { UserIdDto, PaymentResponseDto, MonthlyRenewResponseDto } from './dto/payment.dto';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  /**
   * POST /payment/new-subscriber
   * Convert user to premium subscriber (500 tokens + premium status)
   */
  @Post('new-subscriber')
  @HttpCode(HttpStatus.OK)
  async newSubscriber(@Body() userIdDto: UserIdDto): Promise<PaymentResponseDto> {
    return await this.paymentService.newSubscriber(userIdDto.user_id);
  }

  /**
   * POST /payment/return-to-free
   * Convert user to free subscriber (20 tokens + remove premium status)
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
