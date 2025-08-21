/**
 * ai.controller.ts - AI Controller
 * 
 * Controller responsible for handling AI-related HTTP requests including:
 * - Prompt enhancement endpoints
 * - Smart response generation endpoints
 * - Input validation and error handling
 * 
 * Responsibilities:
 * - Defines API endpoints for AI functionality
 * - Handles HTTP requests and responses
 * - Validates incoming data using DTOs
 * - Delegates business logic to AiService
 */

import { Controller, Post, Get, Body, HttpCode, HttpStatus, Logger, UseGuards, Request } from '@nestjs/common';
import { AiService } from './ai.service';
import { FirestoreService } from '../auth/firestore.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EnhancePromptDto, EnhancementType } from './dto/enhance-prompt.dto';
import { GenerateResponseDto, ResponseType } from './dto/generate-response.dto';
import { TextToSpeechDto } from './dto/text-to-speech.dto';
import { TranslateDto } from './dto/translate.dto';
import { CreateTextDto, ActionType } from '../auth/dto/text.dto';

@Controller('ai')
export class AiController {
  private readonly logger = new Logger(AiController.name);

  constructor(
    private readonly aiService: AiService,
    private readonly firestoreService: FirestoreService,
  ) {}

  /**
   * POST /ai/enhance-prompt
   * Enhances a prompt using AI to make it more specific, clear, and effective
   * 
   * @param enhancePromptDto - The prompt enhancement request data
   * @param req - Request object containing JWT user information
   * @returns Enhanced prompt with improved context and specificity
   */
  @Post('enhance-prompt')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async enhancePrompt(@Body() enhancePromptDto: EnhancePromptDto, @Request() req: any) {
    const userId = req.user.userId;
    this.logger.log(`Enhancing prompt for user: ${userId} with type: ${enhancePromptDto.enhancementType || 'general'}`);
    
    try {
      const result = await this.aiService.enhancePrompt(userId, enhancePromptDto);

      // Try to log the text operation to Firestore (do not fail the request if logging fails)
      try {
        const textData: CreateTextDto = {
          user_id: userId,
          action_type: ActionType.ENHANCE,
          text: enhancePromptDto.prompt,
        };
        await this.firestoreService.addTextDocument(textData);
      } catch (logError: any) {
        this.logger.warn(`Enhance logging skipped: ${logError?.message || 'Unknown logging error'}`);
      }

      this.logger.log(`Prompt enhancement completed successfully for user: ${userId}`);
      return {
        success: true,
        data: result,
        message: 'Prompt enhanced successfully',
      };
    } catch (error) {
      this.logger.error(`Prompt enhancement failed for user: ${userId}:`, error.message);
      
      // Return structured error response
      return {
        success: false,
        error: {
          message: error.message || 'Failed to enhance prompt',
          type: error.constructor.name,
          timestamp: new Date().toISOString(),
        },
        message: 'Prompt enhancement failed',
      };
    }
  }

  /**
   * POST /ai/generate-response
   * Generates a smart response based on input content and selected response type
   * 
   * @param generateResponseDto - The response generation request data
   * @param req - Request object containing JWT user information
   * @returns Generated response based on the specified type
   */
  @Post('generate-response')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async generateResponse(@Body() generateResponseDto: GenerateResponseDto, @Request() req: any) {
    const userId = req.user.userId;
    this.logger.log(`Generating response for user: ${userId} with type: ${generateResponseDto.responseType || 'general'}`);
    
    try {
      const result = await this.aiService.generateResponse(userId, generateResponseDto);

      // Try to log the text operation to Firestore (do not fail the request if logging fails)
      try {
        const textData: CreateTextDto = {
          user_id: userId,
          action_type: ActionType.RESPOND,
          text: generateResponseDto.content,
        };
        await this.firestoreService.addTextDocument(textData);
      } catch (logError: any) {
        this.logger.warn(`Generate logging skipped: ${logError?.message || 'Unknown logging error'}`);
      }
      
      this.logger.log(`Response generation completed successfully for user: ${userId}`);
      return {
        success: true,
        data: result,
        message: 'Response generated successfully',
      };
    } catch (error) {
      this.logger.error(`Response generation failed for user: ${userId}:`, error.message);
      
      // Return structured error response
      return {
        success: false,
        error: {
          message: error.message || 'Failed to generate response',
          type: error.constructor.name,
          timestamp: new Date().toISOString(),
        },
        message: 'Response generation failed',
      };
    }
  }

  /**
   * POST /ai/text-to-speech
   * Converts text to speech using OpenAI's Speech API
   * 
   * @param textToSpeechDto - The text-to-speech request data
   * @param req - Request object containing JWT user information
   * @returns Audio file in the specified format
   */
  @Post('text-to-speech')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async textToSpeech(@Body() textToSpeechDto: TextToSpeechDto, @Request() req: any) {
    const userId = req.user.userId;
    this.logger.log(`Converting text to speech for user: ${userId} with voice: ${textToSpeechDto.voice || 'alloy'}`);
    
    try {
      const result = await this.aiService.textToSpeech(userId, textToSpeechDto);
      
      // Try to log the text operation to Firestore (do not fail the request if logging fails)
      try {
        const textData: CreateTextDto = {
          user_id: userId,
          action_type: ActionType.READ,
          text: textToSpeechDto.text,
        };
        await this.firestoreService.addTextDocument(textData);
      } catch (logError: any) {
        this.logger.warn(`TTS logging skipped: ${logError?.message || 'Unknown logging error'}`);
      }
      
      // Return the response in the format expected by Lambda/API Gateway
      return {
        statusCode: 200,
        headers: {
          'Content-Type': this.getContentType(result.format),
          'Content-Length': result.audioBuffer.length.toString(),
          'Content-Disposition': 'attachment; filename="speech.mp3"',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
          'Access-Control-Allow-Methods': 'GET,OPTIONS,POST,PUT'
        },
        body: result.audioBuffer.toString('base64'),
        isBase64Encoded: true
      };
      
    } catch (error) {
      this.logger.error(`Text-to-speech conversion failed for user: ${userId}:`, error.message);
      
      // Return structured error response for text-to-speech
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
          'Access-Control-Allow-Methods': 'GET,OPTIONS,POST,PUT'
        },
        body: JSON.stringify({
          success: false,
          error: {
            message: error.message || 'Failed to convert text to speech',
            type: error.constructor.name,
            timestamp: new Date().toISOString(),
          },
          message: 'Text-to-speech conversion failed',
        })
      };
    }
  }

  /**
   * POST /ai/translate
   * Translates text from one language to another using OpenAI
   * 
   * @param translateDto - The translation request data
   * @param req - Request object containing JWT user information
   * @returns Translated text in the target language
   */
  @Post('translate')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async translate(@Body() translateDto: TranslateDto, @Request() req: any) {
    const userId = req.user.userId;
    this.logger.log(`Translating text for user: ${userId} to ${translateDto.to_language}`);
    
    try {
      const result = await this.aiService.translate(userId, translateDto);

      // Try to log the text operation to Firestore (do not fail the request if logging fails)
      try {
        const textData: CreateTextDto = {
          user_id: userId,
          action_type: ActionType.TRANSLATE,
          text: translateDto.text,
        };
        await this.firestoreService.addTextDocument(textData);
      } catch (logError: any) {
        this.logger.warn(`Translation logging skipped: ${logError?.message || 'Unknown logging error'}`);
      }

      this.logger.log(`Translation completed successfully for user: ${userId}`);
      return {
        success: true,
        data: result,
        message: 'Translation completed successfully',
      };
    } catch (error) {
      this.logger.error(`Translation failed for user: ${userId}:`, error.message);
      
      // Return structured error response
      return {
        success: false,
        error: {
          message: error.message || 'Failed to translate text',
          type: error.constructor.name,
          timestamp: new Date().toISOString(),
        },
        message: 'Translation failed',
      };
    }
  }

  /**
   * GET /ai/health
   * Health check endpoint to verify OpenAI service status
   * This endpoint is public and doesn't require authentication
   * 
   * @returns Service health status
   */
  @Get('health')
  @HttpCode(HttpStatus.OK)
  async healthCheck() {
    this.logger.log('Health check requested');
    
    try {
      const health = await this.aiService.healthCheck();
      return {
        success: true,
        data: health,
        message: 'Health check completed',
      };
    } catch (error) {
      this.logger.error('Health check failed:', error.message);
      throw error;
    }
  }

  /**
   * Helper method to get the appropriate content type for audio formats
   */
  private getContentType(format: string): string {
    const contentTypes = {
      'mp3': 'audio/mpeg',
      'opus': 'audio/opus',
      'aac': 'audio/aac',
      'flac': 'audio/flac',
    };
    
    return contentTypes[format] || 'audio/mpeg';
  }
}
