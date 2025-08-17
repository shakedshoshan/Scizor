/**
 * payment.dto.ts - Payment Data Transfer Objects
 * 
 * This DTO defines the structure for payment-related operations
 */

import { IsString, IsNotEmpty } from 'class-validator';

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
