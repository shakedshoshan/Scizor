/**
 * ai.service.spec.ts - AI Service Unit Tests
 * 
 * Comprehensive unit tests for the AiService class.
 * Tests include:
 * - OpenAI client initialization
 * - Prompt enhancement functionality
 * - Response generation functionality
 * - Error handling scenarios
 * - Health check functionality
 */

import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { BadRequestException, ServiceUnavailableException } from '@nestjs/common';
import { AiService } from './ai.service';
import { EnhancePromptDto, EnhancementType } from './dto/enhance-prompt.dto';
import { GenerateResponseDto, ResponseType } from './dto/generate-response.dto';

// Mock the OpenAI package
jest.mock('openai', () => {
  return {
    default: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn(),
        },
      },
    })),
  };
});

describe('AiService', () => {
  let service: AiService;
  let configService: ConfigService;
  let mockOpenAI: any;

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AiService>(AiService);
    configService = module.get<ConfigService>(ConfigService);
    
    // Reset mocks
    jest.clearAllMocks();
    
    // Reset the service's initialization state
    (service as any).isInitialized = false;
    (service as any).initializationPromise = null;
    (service as any).openai = null;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should initialize OpenAI client with valid API key', async () => {
      const mockApiKey = 'test-api-key';
      mockConfigService.get
        .mockReturnValueOnce(mockApiKey) // For OPENAI_API_KEY
        .mockReturnValueOnce('gpt-3.5-turbo') // For ENHANCE_PROMPT_MODEL
        .mockReturnValueOnce('gpt-3.5-turbo'); // For GENERATE_RESPONSE_MODEL

      // Mock successful OpenAI import
      const mockOpenAIConstructor = require('openai').default;
      mockOpenAIConstructor.mockImplementation(() => ({
        chat: {
          completions: {
            create: jest.fn(),
          },
        },
      }));

      // Trigger initialization
      await service['initializeOpenAI']();

      expect(mockOpenAIConstructor).toHaveBeenCalledWith({
        apiKey: mockApiKey,
      });
    });

    it('should handle missing API key gracefully', async () => {
      mockConfigService.get.mockReturnValue(undefined);

      await expect(service['initializeOpenAI']()).resolves.not.toThrow();
    });

    it('should handle OpenAI package import failure', async () => {
      const mockApiKey = 'test-api-key';
      mockConfigService.get.mockReturnValue(mockApiKey);

      // Reset the service state
      (service as any).isInitialized = false;
      (service as any).initializationPromise = null;

      // Mock the dynamic import to throw an error
      const mockImport = jest.fn().mockRejectedValue(new Error('Module not found'));
      
      // Temporarily replace the import function
      const originalImport = (service as any).performInitialization;
      (service as any).performInitialization = jest.fn().mockImplementation(async () => {
        try {
          await mockImport();
        } catch (error) {
          throw new ServiceUnavailableException('OpenAI package not available. Please install it with: npm install openai');
        }
      });

      await expect(service['initializeOpenAI']()).rejects.toThrow(ServiceUnavailableException);
      
      // Restore original function
      (service as any).performInitialization = originalImport;
    });
  });

  describe('enhancePrompt', () => {
    const mockEnhancePromptDto: EnhancePromptDto = {
      prompt: 'Write a function',
      enhancementType: EnhancementType.CODE,
      context: 'JavaScript',
      targetAudience: 'Intermediate developers',
    };

    beforeEach(async () => {
      // Setup successful initialization
      mockConfigService.get
        .mockReturnValueOnce('test-api-key') // For OPENAI_API_KEY
        .mockReturnValueOnce('gpt-3.5-turbo') // For ENHANCE_PROMPT_MODEL
        .mockReturnValueOnce('gpt-3.5-turbo'); // For GENERATE_RESPONSE_MODEL
      
      const mockOpenAIConstructor = require('openai').default;
      mockOpenAI = {
        chat: {
          completions: {
            create: jest.fn(),
          },
        },
      };
      mockOpenAIConstructor.mockImplementation(() => mockOpenAI);
      
      // Initialize the service
      await service['initializeOpenAI']();
    });

    it('should enhance prompt successfully', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: 'Enhanced prompt with more context and specificity',
            },
          },
        ],
      };

      mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse);

      const result = await service.enhancePrompt(mockEnhancePromptDto);

      expect(result).toEqual({
        enhancedPrompt: 'Enhanced prompt with more context and specificity',
      });
      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledWith({
        model: 'gpt-3.5-turbo',
        messages: expect.arrayContaining([
          { role: 'system', content: expect.stringContaining('programming expert') },
          { role: 'user', content: expect.stringContaining('Write a function') },
        ]),
        max_tokens: 500,
        temperature: 0.7,
      });
    });

    it('should use default enhancement type when not provided', async () => {
      const dtoWithoutType = { ...mockEnhancePromptDto };
      delete (dtoWithoutType as any).enhancementType;

      const mockResponse = {
        choices: [{ message: { content: 'Enhanced prompt' } }],
      };
      mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse);

      await service.enhancePrompt(dtoWithoutType);

      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            { role: 'system', content: expect.stringContaining('improving prompts') },
          ]),
        })
      );
    });

    it('should handle OpenAI API errors', async () => {
      const apiError = {
        response: { status: 401 },
        message: 'Invalid API key',
      };
      mockOpenAI.chat.completions.create.mockRejectedValue(apiError);

      await expect(service.enhancePrompt(mockEnhancePromptDto)).rejects.toThrow(BadRequestException);
    });

    it('should handle rate limit errors', async () => {
      const rateLimitError = {
        response: { status: 429 },
        message: 'Rate limit exceeded',
      };
      mockOpenAI.chat.completions.create.mockRejectedValue(rateLimitError);

      await expect(service.enhancePrompt(mockEnhancePromptDto)).rejects.toThrow(BadRequestException);
    });

    it('should handle general API errors', async () => {
      const generalError = new Error('Network error');
      mockOpenAI.chat.completions.create.mockRejectedValue(generalError);

      await expect(service.enhancePrompt(mockEnhancePromptDto)).rejects.toThrow(BadRequestException);
    });

    it('should return original prompt if OpenAI returns no content', async () => {
      const mockResponse = {
        choices: [{ message: { content: null } }],
      };
      mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse);

      const result = await service.enhancePrompt(mockEnhancePromptDto);

      expect(result.enhancedPrompt).toBe(mockEnhancePromptDto.prompt);
    });
  });

  describe('generateResponse', () => {
    const mockGenerateResponseDto: GenerateResponseDto = {
      content: 'How do I implement a binary search?',
      responseType: ResponseType.EDUCATIONAL,
      context: 'Computer science fundamentals',
      tone: 'friendly and encouraging',
      maxLength: '300 words',
    };

    beforeEach(async () => {
      mockConfigService.get
        .mockReturnValueOnce('test-api-key') // For OPENAI_API_KEY
        .mockReturnValueOnce('gpt-3.5-turbo') // For ENHANCE_PROMPT_MODEL
        .mockReturnValueOnce('gpt-3.5-turbo'); // For GENERATE_RESPONSE_MODEL
      
      const mockOpenAIConstructor = require('openai').default;
      mockOpenAI = {
        chat: {
          completions: {
            create: jest.fn(),
          },
        },
      };
      mockOpenAIConstructor.mockImplementation(() => mockOpenAI);
      
      // Initialize the service
      await service['initializeOpenAI']();
    });

    it('should generate response successfully', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: 'Here is a comprehensive explanation of binary search...',
            },
          },
        ],
      };

      mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse);

      const result = await service.generateResponse(mockGenerateResponseDto);

      expect(result).toEqual({
        response: 'Here is a comprehensive explanation of binary search...',
      });
      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledWith({
        model: 'gpt-3.5-turbo',
        messages: expect.arrayContaining([
          { role: 'system', content: expect.stringContaining('educational expert') },
          { role: 'user', content: expect.stringContaining('How do I implement a binary search?') },
        ]),
        max_tokens: 800,
        temperature: 0.8,
      });
    });

    it('should return fallback message if OpenAI returns no content', async () => {
      const mockResponse = {
        choices: [{ message: { content: null } }],
      };
      mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse);

      const result = await service.generateResponse(mockGenerateResponseDto);

      expect(result.response).toBe('Unable to generate response');
    });
  });

  describe('healthCheck', () => {
    it('should return healthy status when OpenAI is available', async () => {
      mockConfigService.get
        .mockReturnValueOnce('test-api-key') // For OPENAI_API_KEY
        .mockReturnValueOnce('gpt-3.5-turbo') // For ENHANCE_PROMPT_MODEL
        .mockReturnValueOnce('gpt-3.5-turbo'); // For GENERATE_RESPONSE_MODEL
      
      const mockOpenAIConstructor = require('openai').default;
      mockOpenAIConstructor.mockImplementation(() => ({
        chat: { completions: { create: jest.fn() } },
      }));

      // Reset service state and initialize
      (service as any).isInitialized = false;
      (service as any).initializationPromise = null;
      await service['initializeOpenAI']();

      const result = await service.healthCheck();

      expect(result).toEqual({
        status: 'healthy',
        message: 'OpenAI service is available and ready',
      });
    });

  });

  describe('system prompts', () => {
    it('should return correct system prompt for each enhancement type', () => {
      const enhancementTypes = Object.values(EnhancementType);
      
      enhancementTypes.forEach(type => {
        const prompt = service['getEnhancementSystemPrompt'](type);
        expect(prompt).toBeDefined();
        expect(typeof prompt).toBe('string');
        expect(prompt.length).toBeGreaterThan(0);
      });
    });

    it('should return correct system prompt for each response type', () => {
      const responseTypes = Object.values(ResponseType);
      
      responseTypes.forEach(type => {
        const prompt = service['getResponseSystemPrompt'](type);
        expect(prompt).toBeDefined();
        expect(typeof prompt).toBe('string');
        expect(prompt.length).toBeGreaterThan(0);
      });
    });

    it('should return default prompt for unknown enhancement type', () => {
      const prompt = service['getEnhancementSystemPrompt']('unknown' as EnhancementType);
      expect(prompt).toContain('improving prompts');
    });

    it('should return default prompt for unknown response type', () => {
      const prompt = service['getResponseSystemPrompt']('unknown' as ResponseType);
      expect(prompt).toContain('helpful AI assistant');
    });
  });

  describe('user prompt building', () => {
    it('should build enhancement user prompt with all optional fields', () => {
      const prompt = service['buildEnhancementUserPrompt'](
        'Test prompt',
        'Test context',
        'Test audience'
      );

      expect(prompt).toContain('Test prompt');
      expect(prompt).toContain('Test context');
      expect(prompt).toContain('Test audience');
    });

    it('should build enhancement user prompt without optional fields', () => {
      const prompt = service['buildEnhancementUserPrompt']('Test prompt');

      expect(prompt).toContain('Test prompt');
      expect(prompt).not.toContain('Context:');
      expect(prompt).not.toContain('Target Audience:');
    });

    it('should build response user prompt with all optional fields', () => {
      const prompt = service['buildResponseUserPrompt'](
        'Test content',
        'Test context',
        'Test tone',
        'Test length'
      );

      expect(prompt).toContain('Test content');
      expect(prompt).toContain('Test context');
      expect(prompt).toContain('Test tone');
      expect(prompt).toContain('Test length');
    });

    it('should build response user prompt without optional fields', () => {
      const prompt = service['buildResponseUserPrompt']('Test content');

      expect(prompt).toContain('Test content');
      expect(prompt).not.toContain('Context:');
      expect(prompt).not.toContain('Tone:');
      expect(prompt).not.toContain('Maximum Length:');
    });
  });

  describe('textToSpeech', () => {
    it('should convert text to speech successfully', async () => {
      const mockAudioBuffer = Buffer.from('mock audio data');
      const mockResponse = {
        arrayBuffer: jest.fn().mockResolvedValue(mockAudioBuffer),
      };

      jest.spyOn(service['openai'].audio.speech, 'create').mockResolvedValue(mockResponse);

      const textToSpeechDto = {
        text: 'Hello, world!',
        voice: 'alloy' as any,
        responseFormat: 'mp3' as any,
        speed: 1,
        model: 'tts-1',
      };

      const result = await service.textToSpeech(textToSpeechDto);

      expect(result.audioBuffer).toEqual(mockAudioBuffer);
      expect(result.format).toBe('mp3');
      expect(service['openai'].audio.speech.create).toHaveBeenCalledWith({
        model: 'tts-1',
        voice: 'alloy',
        input: 'Hello, world!',
        response_format: 'mp3',
        speed: 1,
      });
    });

    it('should throw error for text longer than 4096 characters', async () => {
      const longText = 'a'.repeat(4097);
      const textToSpeechDto = {
        text: longText,
      };

      await expect(service.textToSpeech(textToSpeechDto)).rejects.toThrow(
        'Text is too long. Maximum length is 4096 characters.',
      );
    });
  });
}); 