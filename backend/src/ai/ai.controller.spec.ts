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
import { AuthService } from '../auth/auth.service';
import { FirestoreService } from '../auth/firestore.service';
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

  const mockAuthService = {
    verifyToken: jest.fn(),
  };

  const mockFirestoreService = {
    deductUserTokens: jest.fn(),
  };

  beforeEach(async () => {
    // Set JWT_SECRET environment variable
    process.env.JWT_SECRET = 'test-jwt-secret-key-that-is-at-least-32-characters-long';

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AiController],
      providers: [
        {
          provide: AiService,
          useValue: mockAiService,
        },
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: FirestoreService,
          useValue: mockFirestoreService,
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
    // Clean up environment variable
    delete process.env.JWT_SECRET;
  });

  describe('enhancePrompt', () => {
    const mockEnhancePromptDto = {
      prompt: 'Write a function',
      enhancementType: EnhancementType.CODE,
      context: 'JavaScript',
      targetAudience: 'Intermediate developers',
    };

    const mockRequest = {
      user: {
        userId: 'test-user-123',
      },
    };

    it('should enhance prompt successfully', async () => {
      const mockResult = {
        enhancedPrompt: 'Enhanced prompt with more context and specificity',
      };

      mockAiService.enhancePrompt.mockResolvedValue(mockResult);

      const result = await controller.enhancePrompt(mockEnhancePromptDto, mockRequest);

      expect(result).toEqual({
        success: true,
        data: mockResult,
        message: 'Prompt enhanced successfully',
      });
      expect(mockAiService.enhancePrompt).toHaveBeenCalledWith('test-user-123', mockEnhancePromptDto);
    });

    it('should handle service errors', async () => {
      const error = new BadRequestException('Invalid API key');
      mockAiService.enhancePrompt.mockRejectedValue(error);

      const result = await controller.enhancePrompt(mockEnhancePromptDto, mockRequest);
      
      expect(result).toEqual({
        success: false,
        message: 'Prompt enhancement failed',
        error: {
          type: 'BadRequestException',
          message: 'Invalid API key',
          timestamp: expect.any(String),
        },
      });
      expect(mockAiService.enhancePrompt).toHaveBeenCalledWith('test-user-123', mockEnhancePromptDto);
    });

    it('should handle missing enhancement type', async () => {
      const dtoWithoutType = { ...mockEnhancePromptDto };
      delete (dtoWithoutType as any).enhancementType;

      const mockResult = { enhancedPrompt: 'Enhanced prompt' };
      mockAiService.enhancePrompt.mockResolvedValue(mockResult);

      const result = await controller.enhancePrompt(dtoWithoutType, mockRequest);

      expect(result.success).toBe(true);
      expect(mockAiService.enhancePrompt).toHaveBeenCalledWith('test-user-123', dtoWithoutType);
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

    const mockRequest = {
      user: {
        userId: 'test-user-123',
      },
    };

    it('should generate response successfully', async () => {
      const mockResult = {
        response: 'Here is a comprehensive explanation of binary search...',
      };

      mockAiService.generateResponse.mockResolvedValue(mockResult);

      const result = await controller.generateResponse(mockGenerateResponseDto, mockRequest);

      expect(result).toEqual({
        success: true,
        data: mockResult,
        message: 'Response generated successfully',
      });
      expect(mockAiService.generateResponse).toHaveBeenCalledWith('test-user-123', mockGenerateResponseDto);
    });

    it('should handle service errors', async () => {
      const error = new ServiceUnavailableException('OpenAI service unavailable');
      mockAiService.generateResponse.mockRejectedValue(error);

      const result = await controller.generateResponse(mockGenerateResponseDto, mockRequest);
      
      expect(result).toEqual({
        success: false,
        message: 'Response generation failed',
        error: {
          type: 'ServiceUnavailableException',
          message: 'OpenAI service unavailable',
          timestamp: expect.any(String),
        },
      });
      expect(mockAiService.generateResponse).toHaveBeenCalledWith('test-user-123', mockGenerateResponseDto);
    });

    it('should handle missing response type', async () => {
      const dtoWithoutType = { ...mockGenerateResponseDto };
      delete (dtoWithoutType as any).responseType;

      const mockResult = { response: 'Generated response' };
      mockAiService.generateResponse.mockResolvedValue(mockResult);

      const result = await controller.generateResponse(dtoWithoutType, mockRequest);

      expect(result.success).toBe(true);
      expect(mockAiService.generateResponse).toHaveBeenCalledWith('test-user-123', dtoWithoutType);
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
    const mockRequest = {
      user: {
        userId: 'test-user-123',
      },
    };

    it('should log enhancement requests', async () => {
      const mockDto = { prompt: 'Test prompt', enhancementType: EnhancementType.CODE };
      const mockResult = { enhancedPrompt: 'Enhanced prompt' };
      mockAiService.enhancePrompt.mockResolvedValue(mockResult);

      const logSpy = jest.spyOn(controller['logger'], 'log');

      await controller.enhancePrompt(mockDto, mockRequest);

      expect(logSpy).toHaveBeenCalledWith('Enhancing prompt for user: test-user-123 with type: code');
      expect(logSpy).toHaveBeenCalledWith('Prompt enhancement completed successfully for user: test-user-123');
    });

    it('should log response generation requests', async () => {
      const mockDto = { content: 'Test content', responseType: ResponseType.EDUCATIONAL };
      const mockResult = { response: 'Generated response' };
      mockAiService.generateResponse.mockResolvedValue(mockResult);

      const logSpy = jest.spyOn(controller['logger'], 'log');

      await controller.generateResponse(mockDto, mockRequest);

      expect(logSpy).toHaveBeenCalledWith('Generating response for user: test-user-123 with type: educational');
      expect(logSpy).toHaveBeenCalledWith('Response generation completed successfully for user: test-user-123');
    });

    it('should log errors', async () => {
      const mockDto = { prompt: 'Test prompt' };
      const error = new BadRequestException('Test error');
      mockAiService.enhancePrompt.mockRejectedValue(error);

      const errorLogSpy = jest.spyOn(controller['logger'], 'error');

      const result = await controller.enhancePrompt(mockDto, mockRequest);

      expect(result.success).toBe(false);
      expect(errorLogSpy).toHaveBeenCalledWith('Prompt enhancement failed for user: test-user-123:', 'Test error');
    });
  });

  describe('HTTP status codes', () => {
    const mockRequest = {
      user: {
        userId: 'test-user-123',
      },
    };

    it('should return 200 status for successful requests', async () => {
      const mockDto = { prompt: 'Test prompt' };
      const mockResult = { enhancedPrompt: 'Enhanced prompt' };
      mockAiService.enhancePrompt.mockResolvedValue(mockResult);

      const result = await controller.enhancePrompt(mockDto, mockRequest);

      expect(result).toBeDefined();
      // Note: The actual HTTP status is handled by NestJS decorators
      // This test verifies the response structure
    });
  });

  describe('input validation', () => {
    const mockRequest = {
      user: {
        userId: 'test-user-123',
      },
    };

    it('should handle valid DTOs', async () => {
      const validDto = {
        prompt: 'Valid prompt',
        enhancementType: EnhancementType.GENERAL,
        context: 'Valid context',
        targetAudience: 'Valid audience',
      };

      const mockResult = { enhancedPrompt: 'Enhanced prompt' };
      mockAiService.enhancePrompt.mockResolvedValue(mockResult);

      const result = await controller.enhancePrompt(validDto, mockRequest);

      expect(result.success).toBe(true);
      expect(mockAiService.enhancePrompt).toHaveBeenCalledWith('test-user-123', validDto);
    });

    it('should handle minimal DTOs', async () => {
      const minimalDto = {
        prompt: 'Minimal prompt',
      };

      const mockResult = { enhancedPrompt: 'Enhanced prompt' };
      mockAiService.enhancePrompt.mockResolvedValue(mockResult);

      const result = await controller.enhancePrompt(minimalDto, mockRequest);

      expect(result.success).toBe(true);
      expect(mockAiService.enhancePrompt).toHaveBeenCalledWith('test-user-123', minimalDto);
    });
  });
}); 