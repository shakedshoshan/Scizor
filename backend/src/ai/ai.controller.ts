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

import { Controller, Post, Get, Body, HttpCode, HttpStatus, Logger, Res } from '@nestjs/common';
import { Response } from 'express';
import { AiService } from './ai.service';
import { EnhancePromptDto, EnhancementType } from './dto/enhance-prompt.dto';
import { GenerateResponseDto, ResponseType } from './dto/generate-response.dto';
import { TextToSpeechDto } from './dto/text-to-speech.dto';

@Controller('ai')
export class AiController {
  private readonly logger = new Logger(AiController.name);

  constructor(private readonly aiService: AiService) {}

  /**
   * POST /ai/enhance-prompt
   * Enhances a prompt using AI to make it more specific, clear, and effective
   * 
   * @param enhancePromptDto - The prompt enhancement request data
   * @returns Enhanced prompt with improved context and specificity
   */
  @Post('enhance-prompt')
  @HttpCode(HttpStatus.OK)
  async enhancePrompt(@Body() enhancePromptDto: EnhancePromptDto) {
    this.logger.log(`Enhancing prompt for user: ${enhancePromptDto.user_id} with type: ${enhancePromptDto.enhancementType || 'general'}`);
    
    try {
      const result = await this.aiService.enhancePrompt(enhancePromptDto);
      this.logger.log(`Prompt enhancement completed successfully for user: ${enhancePromptDto.user_id}`);
      return {
        success: true,
        data: result,
        message: 'Prompt enhanced successfully',
      };
    } catch (error) {
      this.logger.error(`Prompt enhancement failed for user: ${enhancePromptDto.user_id}:`, error.message);
      
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
   * @returns Generated response based on the specified type
   */
  @Post('generate-response')
  @HttpCode(HttpStatus.OK)
  async generateResponse(@Body() generateResponseDto: GenerateResponseDto) {
    this.logger.log(`Generating response for user: ${generateResponseDto.user_id} with type: ${generateResponseDto.responseType || 'general'}`);
    
    try {
      const result = await this.aiService.generateResponse(generateResponseDto);
      this.logger.log(`Response generation completed successfully for user: ${generateResponseDto.user_id}`);
      return {
        success: true,
        data: result,
        message: 'Response generated successfully',
      };
    } catch (error) {
      this.logger.error(`Response generation failed for user: ${generateResponseDto.user_id}:`, error.message);
      
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
   * @param res - Express response object for streaming audio
   * @returns Audio file in the specified format
   */
  @Post('text-to-speech')
  @HttpCode(HttpStatus.OK)
  async textToSpeech(@Body() textToSpeechDto: TextToSpeechDto, @Res() res: Response) {
    this.logger.log(`Converting text to speech for user: ${textToSpeechDto.user_id} with voice: ${textToSpeechDto.voice || 'alloy'}`);
    
    try {
      const result = await this.aiService.textToSpeech(textToSpeechDto);
      
      // Set appropriate headers for audio response
      const contentType = this.getContentType(result.format);
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Length', result.audioBuffer.length.toString());
      res.setHeader('Content-Disposition', 'attachment; filename="speech.mp3"');
      
      // Send the audio buffer
      res.send(result.audioBuffer);
      
      this.logger.log(`Text-to-speech conversion completed successfully for user: ${textToSpeechDto.user_id}`);
    } catch (error) {
      this.logger.error(`Text-to-speech conversion failed for user: ${textToSpeechDto.user_id}:`, error.message);
      
      // Return structured error response for text-to-speech
      res.status(400).json({
        success: false,
        error: {
          message: error.message || 'Failed to convert text to speech',
          type: error.constructor.name,
          timestamp: new Date().toISOString(),
        },
        message: 'Text-to-speech conversion failed',
      });
    }
  }

  /**
   * GET /ai/health
   * Health check endpoint to verify OpenAI service status
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
