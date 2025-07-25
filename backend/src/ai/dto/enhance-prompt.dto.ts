/**
 * enhance-prompt.dto.ts - Prompt Enhancement DTO
 * 
 * Data Transfer Object for prompt enhancement requests.
 * Defines the structure and validation rules for incoming
 * prompt enhancement requests.
 */

import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

export enum EnhancementType {
  GENERAL = 'general',
  EDUCATIONAL = 'educational',
  CODE = 'code',
  CREATIVE = 'creative',
  ANALYTICAL = 'analytical',
  STEP_BY_STEP = 'step-by-step',
  FUN = 'fun',
}

export class EnhancePromptDto {
  @IsString()
  @IsNotEmpty()
  prompt: string;

  @IsOptional()
  @IsEnum(EnhancementType)
  enhancementType?: EnhancementType = EnhancementType.GENERAL;

  @IsOptional()
  @IsString()
  context?: string;

  @IsOptional()
  @IsString()
  targetAudience?: string;
} 