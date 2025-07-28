/**
 * text-to-speech.dto.ts - Text to Speech DTO
 * 
 * Data Transfer Object for text-to-speech requests.
 * Defines the structure and validation rules for converting
 * text to speech using OpenAI's Speech API.
 */

import { IsString, IsNotEmpty, IsOptional, IsEnum, IsIn } from 'class-validator';

export enum VoiceType {
  ALLOY = 'alloy',
  ECHO = 'echo',
  FABLE = 'fable',
  ONYX = 'onyx',
  NOVA = 'nova',
  SHIMMER = 'shimmer',
}

export enum ResponseFormat {
  MP3 = 'mp3',
  OPUS = 'opus',
  AAC = 'aac',
  FLAC = 'flac',
}

export class TextToSpeechDto {
  @IsString()
  @IsNotEmpty()
  text: string;

  @IsOptional()
  @IsEnum(VoiceType)
  voice?: VoiceType = VoiceType.ALLOY;

  @IsOptional()
  @IsEnum(ResponseFormat)
  responseFormat?: ResponseFormat = ResponseFormat.MP3;

  @IsOptional()
  @IsIn([0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2])
  speed?: number = 1;

  @IsOptional()
  @IsString()
  model?: string = 'tts-1';
} 