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

import { Controller, Post, Get, Body, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { AiService } from './ai.service';
import { EnhancePromptDto, EnhancementType } from './dto/enhance-prompt.dto';
import { GenerateResponseDto, ResponseType } from './dto/generate-response.dto';

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
    this.logger.log(`Enhancing prompt with type: ${enhancePromptDto.enhancementType || 'general'}`);
    
    try {
      const result = await this.aiService.enhancePrompt(enhancePromptDto);
      this.logger.log('Prompt enhancement completed successfully');
      return {
        success: true,
        data: result,
        message: 'Prompt enhanced successfully',
      };
    } catch (error) {
      this.logger.error('Prompt enhancement failed:', error.message);
      throw error;
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
    this.logger.log(`Generating response with type: ${generateResponseDto.responseType || 'general'}`);
    
    try {
      const result = await this.aiService.generateResponse(generateResponseDto);
      this.logger.log('Response generation completed successfully');
      return {
        success: true,
        data: result,
        message: 'Response generated successfully',
      };
    } catch (error) {
      this.logger.error('Response generation failed:', error.message);
      throw error;
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
}
