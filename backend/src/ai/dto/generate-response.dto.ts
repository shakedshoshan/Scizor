/**
 * generate-response.dto.ts - Smart Response Generation DTO
 * 
 * Data Transfer Object for smart response generation requests.
 * Defines the structure and validation rules for generating
 * intelligent responses based on input content and selected type.
 */

import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

export enum ResponseType {
  GENERAL = 'general',
  EDUCATIONAL = 'educational',
  CODE = 'code',
  CREATIVE = 'creative',
  ANALYTICAL = 'analytical',
  STEP_BY_STEP = 'step-by-step',
  FUN = 'fun',
}

export class GenerateResponseDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsOptional()
  @IsEnum(ResponseType)
  responseType?: ResponseType = ResponseType.GENERAL;

  @IsOptional()
  @IsString()
  context?: string;

  @IsOptional()
  @IsString()
  tone?: string;

  @IsOptional()
  @IsString()
  maxLength?: string;
} 