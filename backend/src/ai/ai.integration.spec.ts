/**
 * ai.integration.spec.ts - AI Integration Tests
 * 
 * Integration tests for the AI module using Supertest.
 * Tests include:
 * - HTTP endpoint behavior with real requests
 * - DTO validation
 * - Error handling scenarios
 * - Response structure validation
 * - Service integration
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { ConfigModule } from '@nestjs/config';
import { AiModule } from './ai.module';
import { AiService } from './ai.service';
import { EnhancementType } from './dto/enhance-prompt.dto';
import { ResponseType } from './dto/generate-response.dto';

describe('AI Integration Tests', () => {
  let app: INestApplication;
  let aiService: AiService;

  // Mock the AiService to avoid actual OpenAI API calls
  const mockAiService = {
    enhancePrompt: jest.fn(),
    generateResponse: jest.fn(),
    healthCheck: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
        AiModule,
      ],
    })
      .overrideProvider(AiService)
      .useValue(mockAiService)
      .compile();

    app = moduleFixture.createNestApplication();
    
    // Enable validation pipes for DTO validation testing
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
    aiService = moduleFixture.get<AiService>(AiService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /ai/enhance-prompt', () => {
    const validEnhancePromptDto = {
      prompt: 'Write a function to sort an array',
      enhancementType: EnhancementType.CODE,
      context: 'JavaScript programming',
      targetAudience: 'Intermediate developers',
    };

    it('should enhance prompt successfully', async () => {
      const mockResult = {
        enhancedPrompt: 'Create a JavaScript function that efficiently sorts an array using modern ES6+ syntax...',
      };

      mockAiService.enhancePrompt.mockResolvedValue(mockResult);

      const response = await request(app.getHttpServer())
        .post('/ai/enhance-prompt')
        .send(validEnhancePromptDto)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockResult,
        message: 'Prompt enhanced successfully',
      });

      expect(mockAiService.enhancePrompt).toHaveBeenCalledWith(validEnhancePromptDto);
    });

    it('should validate required fields', async () => {
      const invalidDto = {
        // Missing required 'prompt' field
        enhancementType: EnhancementType.GENERAL,
      };

      await request(app.getHttpServer())
        .post('/ai/enhance-prompt')
        .send(invalidDto)
        .expect(400);
    });

    it('should validate enhancement type enum', async () => {
      const invalidDto = {
        prompt: 'Test prompt',
        enhancementType: 'invalid-type',
      };

      await request(app.getHttpServer())
        .post('/ai/enhance-prompt')
        .send(invalidDto)
        .expect(400);
    });

    it('should handle service errors', async () => {
      mockAiService.enhancePrompt.mockRejectedValue(new Error('Service error'));

      await request(app.getHttpServer())
        .post('/ai/enhance-prompt')
        .send(validEnhancePromptDto)
        .expect(500);
    });

    it('should work with minimal valid data', async () => {
      const minimalDto = {
        prompt: 'Minimal prompt',
      };

      const mockResult = {
        enhancedPrompt: 'Enhanced minimal prompt',
      };

      mockAiService.enhancePrompt.mockResolvedValue(mockResult);

      const response = await request(app.getHttpServer())
        .post('/ai/enhance-prompt')
        .send(minimalDto)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockAiService.enhancePrompt).toHaveBeenCalledWith({
        ...minimalDto,
        enhancementType: EnhancementType.GENERAL,
      });
    });

    it('should reject non-whitelisted properties', async () => {
      const dtoWithExtraFields = {
        ...validEnhancePromptDto,
        extraField: 'should be rejected',
      };

      await request(app.getHttpServer())
        .post('/ai/enhance-prompt')
        .send(dtoWithExtraFields)
        .expect(400);
    });
  });

  describe('POST /ai/generate-response', () => {
    const validGenerateResponseDto = {
      content: 'How do I implement a binary search algorithm?',
      responseType: ResponseType.EDUCATIONAL,
      context: 'Computer science fundamentals',
      tone: 'friendly and encouraging',
      maxLength: '300 words',
    };

    it('should generate response successfully', async () => {
      const mockResult = {
        response: 'Binary search is a fundamental algorithm that efficiently finds elements in sorted arrays...',
      };

      mockAiService.generateResponse.mockResolvedValue(mockResult);

      const response = await request(app.getHttpServer())
        .post('/ai/generate-response')
        .send(validGenerateResponseDto)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockResult,
        message: 'Response generated successfully',
      });

      expect(mockAiService.generateResponse).toHaveBeenCalledWith(validGenerateResponseDto);
    });

    it('should validate required fields', async () => {
      const invalidDto = {
        // Missing required 'content' field
        responseType: ResponseType.GENERAL,
      };

      await request(app.getHttpServer())
        .post('/ai/generate-response')
        .send(invalidDto)
        .expect(400);
    });

    it('should validate response type enum', async () => {
      const invalidDto = {
        content: 'Test content',
        responseType: 'invalid-type',
      };

      await request(app.getHttpServer())
        .post('/ai/generate-response')
        .send(invalidDto)
        .expect(400);
    });

    it('should handle service errors', async () => {
      mockAiService.generateResponse.mockRejectedValue(new Error('Service error'));

      await request(app.getHttpServer())
        .post('/ai/generate-response')
        .send(validGenerateResponseDto)
        .expect(500);
    });

    it('should work with minimal valid data', async () => {
      const minimalDto = {
        content: 'Minimal content',
      };

      const mockResult = {
        response: 'Generated response for minimal content',
      };

      mockAiService.generateResponse.mockResolvedValue(mockResult);

      const response = await request(app.getHttpServer())
        .post('/ai/generate-response')
        .send(minimalDto)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockAiService.generateResponse).toHaveBeenCalledWith({
        ...minimalDto,
        responseType: ResponseType.GENERAL,
      });
    });
  });


  describe('GET /ai/health', () => {
    it('should return healthy status', async () => {
      const mockHealth = {
        status: 'healthy',
        message: 'OpenAI service is available and ready',
      };

      mockAiService.healthCheck.mockResolvedValue(mockHealth);

      const response = await request(app.getHttpServer())
        .get('/ai/health')
        .expect(200);

      expect(response.body).toEqual({
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

      const response = await request(app.getHttpServer())
        .get('/ai/health')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockHealth,
        message: 'Health check completed',
      });
    });

    it('should handle service errors', async () => {
      mockAiService.healthCheck.mockRejectedValue(new Error('Health check failed'));

      await request(app.getHttpServer())
        .get('/ai/health')
        .expect(500);
    });
  });

  describe('Error handling', () => {
    it('should handle 404 for non-existent endpoints', async () => {
      await request(app.getHttpServer())
        .get('/ai/non-existent')
        .expect(404);
    });

    it('should handle malformed JSON', async () => {
      await request(app.getHttpServer())
        .post('/ai/enhance-prompt')
        .send('invalid json')
        .set('Content-Type', 'application/json')
        .expect(400);
    });

    it('should handle unsupported HTTP methods', async () => {
      await request(app.getHttpServer())
        .put('/ai/enhance-prompt')
        .send({ prompt: 'test' })
        .expect(404);
    });
  });

  describe('Response headers', () => {
    it('should return correct content type', async () => {
      const mockResult = {
        enhancedPrompt: 'Enhanced prompt',
      };

      mockAiService.enhancePrompt.mockResolvedValue(mockResult);

      const response = await request(app.getHttpServer())
        .post('/ai/enhance-prompt')
        .send({ prompt: 'test' })
        .expect(200);

      expect(response.headers['content-type']).toContain('application/json');
    });
  });

  describe('Request validation edge cases', () => {
    it('should handle very long prompts', async () => {
      const longPrompt = 'A'.repeat(10000);
      const dto = { prompt: longPrompt };

      const mockResult = { enhancedPrompt: 'Enhanced long prompt' };
      mockAiService.enhancePrompt.mockResolvedValue(mockResult);

      const response = await request(app.getHttpServer())
        .post('/ai/enhance-prompt')
        .send(dto)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should handle special characters in prompts', async () => {
      const specialPrompt = 'Test prompt with special chars: !@#$%^&*()_+-=[]{}|;:,.<>?';
      const dto = { prompt: specialPrompt };

      const mockResult = { enhancedPrompt: 'Enhanced special prompt' };
      mockAiService.enhancePrompt.mockResolvedValue(mockResult);

      const response = await request(app.getHttpServer())
        .post('/ai/enhance-prompt')
        .send(dto)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should handle unicode characters', async () => {
      const unicodePrompt = 'Test prompt with unicode: 🚀🌟🎉';
      const dto = { prompt: unicodePrompt };

      const mockResult = { enhancedPrompt: 'Enhanced unicode prompt' };
      mockAiService.enhancePrompt.mockResolvedValue(mockResult);

      const response = await request(app.getHttpServer())
        .post('/ai/enhance-prompt')
        .send(dto)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });
}); 