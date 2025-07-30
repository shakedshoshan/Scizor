/**
 * user-token.dto.ts - User Token Data Transfer Object
 * 
 * This DTO defines the structure for user token data to be stored in Firestore
 */

import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CreateUserTokenDto {
  @IsString()
  @IsNotEmpty()
  user_id: string;
}

export class UserTokenDto {
  @IsString()
  @IsNotEmpty()
  user_id: string;

  @IsNumber()
  @Min(0)
  tokens: number;
}

export class UpdateUserTokenDto {
  @IsNumber()
  @Min(0)
  tokens: number;
} 