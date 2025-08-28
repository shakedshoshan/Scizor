/**
 * payment.dto.ts - Payment Data Transfer Objects
 * 
 * This DTO defines the structure for payment-related operations
 * including Lemon Squeezy webhook payloads
 */

import { IsString, IsNotEmpty, IsObject, IsOptional, IsBoolean } from 'class-validator';

export class UserIdDto {
  @IsString()
  @IsNotEmpty()
  user_id: string;
}

export class PaymentResponseDto {
  success: boolean;
  message: string;
  data?: {
    user_id: string;
    tokens: number;
    is_premium: boolean;
  };
}

export class MonthlyRenewResponseDto {
  success: boolean;
  message: string;
  data?: {
    processed_users: number;
    failed_users: number;
  };
}

// Lemon Squeezy webhook DTOs
export class LemonSqueezyMeta {
  @IsString()
  @IsNotEmpty()
  event_name: string;

  @IsOptional()
  @IsObject()
  custom_data?: {
    user_id?: string;
    [key: string]: any;
  };
}

export class LemonSqueezyAttributes {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  user_email?: string;

  @IsOptional()
  @IsString()
  user_name?: string;

  @IsOptional()
  @IsString()
  product_name?: string;

  @IsOptional()
  @IsString()
  variant_name?: string;

  @IsOptional()
  product_id?: number;

  @IsOptional()
  variant_id?: number;

  @IsOptional()
  @IsBoolean()
  cancelled?: boolean;

  @IsOptional()
  @IsString()
  renews_at?: string;

  @IsOptional()
  @IsString()
  ends_at?: string;

  @IsOptional()
  @IsBoolean()
  test_mode?: boolean;
}

export class LemonSqueezyData {
  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsNotEmpty()
  id: string;

  @IsObject()
  attributes: LemonSqueezyAttributes;
}

export class LemonSqueezyWebhookDto {
  @IsObject()
  meta: LemonSqueezyMeta;

  @IsObject()
  data: LemonSqueezyData;
}

export class WebhookResponseDto {
  success: boolean;
  message: string;
  processed?: boolean;
}
