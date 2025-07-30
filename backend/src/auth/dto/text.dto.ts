/**
 * text.dto.ts - Text Data Transfer Object
 * 
 * This DTO defines the structure for text data to be stored in Firestore
 */

import { IsString, IsEnum, IsNotEmpty } from 'class-validator';

export enum ActionType {
  ENHANCE = 'enhance',
  RESPOND = 'respond',
  TRANSLATE = 'translate',
  READ = 'read'
}

export class CreateTextDto {
  @IsString()
  @IsNotEmpty()
  user_id: string;

  @IsEnum(ActionType)
  action_type: ActionType;

  @IsString()
  @IsNotEmpty()
  text: string;
} 