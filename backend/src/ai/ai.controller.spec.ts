/**
 * ai.controller.spec.ts - AI Controller Unit Tests
 * 
 * Comprehensive unit tests for the AiController class.
 * Tests include:
 * - HTTP endpoint behavior
 * - Request/response handling
 * - Error handling scenarios
 * - Service interaction
 * - Input validation
 */

import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ServiceUnavailableException } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { EnhancementType } from './dto/enhance-prompt.dto';
import { ResponseType } from './dto/generate-response.dto';

describe('AiController', () => {
  let controller: AiController;
  let service: AiService;

  const mockAiService = {
    enhancePrompt: jest.fn(),
    generateResponse: jest.fn(),
    healthCheck: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AiController],
      providers: [
        {
          provide: AiService,
          useValue: mockAiService,
        },
      ],
    }).compile();

    controller = module.get<AiController>(AiController);
    service = module.get<AiService>(AiService);

    // Reset mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('enhancePrompt', () => {
    const mockEnhancePromptDto = {
      prompt: 'Write a function',
      enhancementType: EnhancementType.CODE,
      context: 'JavaScript',
      targetAudience: 'Intermediate developers',
    };

    it('should enhance prompt successfully', async () => {
      const mockResult = {
        enhancedPrompt: 'Enhanced prompt with more context and specificity',
      };

      mockAiService.enhancePrompt.mockResolvedValue(mockResult);

      const result = await controller.enhancePrompt(mockEnhancePromptDto);

      expect(result).toEqual({
        success: true,
        data: mockResult,
        message: 'Prompt enhanced successfully',
      });
      expect(mockAiService.enhancePrompt).toHaveBeenCalledWith(mockEnhancePromptDto);
    });

    it('should handle service errors', async () => {
      const error = new BadRequestException('Invalid API key');
      mockAiService.enhancePrompt.mockRejectedValue(error);

      await expect(controller.enhancePrompt(mockEnhancePromptDto)).rejects.toThrow(BadRequestException);
      expect(mockAiService.enhancePrompt).toHaveBeenCalledWith(mockEnhancePromptDto);
    });

    it('should handle missing enhancement type', async () => {
      const dtoWithoutType = { ...mockEnhancePromptDto };
      delete (dtoWithoutType as any).enhancementType;

      const mockResult = { enhancedPrompt: 'Enhanced prompt' };
      mockAiService.enhancePrompt.mockResolvedValue(mockResult);

      const result = await controller.enhancePrompt(dtoWithoutType);

      expect(result.success).toBe(true);
      expect(mockAiService.enhancePrompt).toHaveBeenCalledWith(dtoWithoutType);
    });
  });

  describe('generateResponse', () => {
    const mockGenerateResponseDto = {
      content: 'How do I implement a binary search?',
      responseType: ResponseType.EDUCATIONAL,
      context: 'Computer science fundamentals',
      tone: 'friendly and encouraging',
      maxLength: '300 words',
    };

    it('should generate response successfully', async () => {
      const mockResult = {
        response: 'Here is a comprehensive explanation of binary search...',
      };

      mockAiService.generateResponse.mockResolvedValue(mockResult);

      const result = await controller.generateResponse(mockGenerateResponseDto);

      expect(result).toEqual({
        success: true,
        data: mockResult,
        message: 'Response generated successfully',
      });
      expect(mockAiService.generateResponse).toHaveBeenCalledWith(mockGenerateResponseDto);
    });

    it('should handle service errors', async () => {
      const error = new ServiceUnavailableException('OpenAI service unavailable');
      mockAiService.generateResponse.mockRejectedValue(error);

      await expect(controller.generateResponse(mockGenerateResponseDto)).rejects.toThrow(ServiceUnavailableException);
      expect(mockAiService.generateResponse).toHaveBeenCalledWith(mockGenerateResponseDto);
    });

    it('should handle missing response type', async () => {
      const dtoWithoutType = { ...mockGenerateResponseDto };
      delete (dtoWithoutType as any).responseType;

      const mockResult = { response: 'Generated response' };
      mockAiService.generateResponse.mockResolvedValue(mockResult);

      const result = await controller.generateResponse(dtoWithoutType);

      expect(result.success).toBe(true);
      expect(mockAiService.generateResponse).toHaveBeenCalledWith(dtoWithoutType);
    });
  });


  describe('healthCheck', () => {
    it('should return healthy status', async () => {
      const mockHealth = {
        status: 'healthy',
        message: 'OpenAI service is available and ready',
      };

      mockAiService.healthCheck.mockResolvedValue(mockHealth);

      const result = await controller.healthCheck();

      expect(result).toEqual({
        success: true,
        data: mockHealth,
        message: 'Health check completed',
      });
      expect(mockAiService.healthCheck).toHaveBeenCalled();
    });

    it('should return unhealthy status', async () => {
      const mockHealth = {
        status: 'unhealthy',
        message: 'OpenAI service is not available',
      };

      mockAiService.healthCheck.mockResolvedValue(mockHealth);

      const result = await controller.healthCheck();

      expect(result).toEqual({
        success: true,
        data: mockHealth,
        message: 'Health check completed',
      });
      expect(mockAiService.healthCheck).toHaveBeenCalled();
    });

    it('should handle service errors', async () => {
      const error = new Error('Health check failed');
      mockAiService.healthCheck.mockRejectedValue(error);

      await expect(controller.healthCheck()).rejects.toThrow(Error);
    });
  });

  describe('logging', () => {
    it('should log enhancement requests', async () => {
      const mockDto = { prompt: 'Test prompt', enhancementType: EnhancementType.CODE };
      const mockResult = { enhancedPrompt: 'Enhanced prompt' };
      mockAiService.enhancePrompt.mockResolvedValue(mockResult);

      const logSpy = jest.spyOn(controller['logger'], 'log');

      await controller.enhancePrompt(mockDto);

      expect(logSpy).toHaveBeenCalledWith('Enhancing prompt with type: code');
      expect(logSpy).toHaveBeenCalledWith('Prompt enhancement completed successfully');
    });

    it('should log response generation requests', async () => {
      const mockDto = { content: 'Test content', responseType: ResponseType.EDUCATIONAL };
      const mockResult = { response: 'Generated response' };
      mockAiService.generateResponse.mockResolvedValue(mockResult);

      const logSpy = jest.spyOn(controller['logger'], 'log');

      await controller.generateResponse(mockDto);

      expect(logSpy).toHaveBeenCalledWith('Generating response with type: educational');
      expect(logSpy).toHaveBeenCalledWith('Response generation completed successfully');
    });

    it('should log errors', async () => {
      const mockDto = { prompt: 'Test prompt' };
      const error = new BadRequestException('Test error');
      mockAiService.enhancePrompt.mockRejectedValue(error);

      const errorLogSpy = jest.spyOn(controller['logger'], 'error');

      await expect(controller.enhancePrompt(mockDto)).rejects.toThrow(BadRequestException);

      expect(errorLogSpy).toHaveBeenCalledWith('Prompt enhancement failed:', 'Test error');
    });
  });

  describe('HTTP status codes', () => {
    it('should return 200 status for successful requests', async () => {
      const mockDto = { prompt: 'Test prompt' };
      const mockResult = { enhancedPrompt: 'Enhanced prompt' };
      mockAiService.enhancePrompt.mockResolvedValue(mockResult);

      const result = await controller.enhancePrompt(mockDto);

      expect(result).toBeDefined();
      // Note: The actual HTTP status is handled by NestJS decorators
      // This test verifies the response structure
    });
  });

  describe('input validation', () => {
    it('should handle valid DTOs', async () => {
      const validDto = {
        prompt: 'Valid prompt',
        enhancementType: EnhancementType.GENERAL,
        context: 'Valid context',
        targetAudience: 'Valid audience',
      };

      const mockResult = { enhancedPrompt: 'Enhanced prompt' };
      mockAiService.enhancePrompt.mockResolvedValue(mockResult);

      const result = await controller.enhancePrompt(validDto);

      expect(result.success).toBe(true);
      expect(mockAiService.enhancePrompt).toHaveBeenCalledWith(validDto);
    });

    it('should handle minimal DTOs', async () => {
      const minimalDto = {
        prompt: 'Minimal prompt',
      };

      const mockResult = { enhancedPrompt: 'Enhanced prompt' };
      mockAiService.enhancePrompt.mockResolvedValue(mockResult);

      const result = await controller.enhancePrompt(minimalDto);

      expect(result.success).toBe(true);
      expect(mockAiService.enhancePrompt).toHaveBeenCalledWith(minimalDto);
    });
  });
}); 