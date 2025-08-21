/**
 * translate.dto.ts - Text Translation DTO
 * 
 * Data Transfer Object for text translation requests.
 * Defines the structure and validation rules for translating
 * text between different languages using AI.
 */

import { IsString, IsNotEmpty } from 'class-validator';

export class TranslateDto {
  @IsString()
  @IsNotEmpty()
  text: string;

  @IsString()
  @IsNotEmpty()
  to_language: string;
}
