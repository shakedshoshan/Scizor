/**
 * ai.service.ts - AI Service
 * 
 * Service responsible for AI-related operations including:
 * - Prompt enhancement using OpenAI GPT models
 * - Smart response generation with multiple response types
 * - Error handling and graceful fallbacks
 * 
 * Responsibilities:
 * - Interacts with OpenAI API for AI operations
 * - Handles different enhancement and response types
 * - Provides error handling and fallback mechanisms
 * - Manages API configuration and authentication
 */

import { Injectable, Logger, BadRequestException, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FirestoreService } from '../auth/firestore.service';
import { EnhancePromptDto, EnhancementType } from './dto/enhance-prompt.dto';
import { GenerateResponseDto, ResponseType } from './dto/generate-response.dto';
import { TextToSpeechDto, VoiceType, ResponseFormat } from './dto/text-to-speech.dto';
import { getContentType, serviceErrorHandler } from './utils';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private openai: any;
  private isInitialized = false;
  private initializationPromise: Promise<void> | null = null;

  // Token costs for different AI operations
  private readonly TOKEN_COSTS = {
    ENHANCE_PROMPT: 1,
    GENERATE_RESPONSE: 1,
    TEXT_TO_SPEECH: 1,
  };

  constructor(
    private readonly configService: ConfigService,
    private readonly firestoreService: FirestoreService,
  ) {
    this.initializeOpenAI();
  }

  /**
   * Initializes the OpenAI client with proper error handling
   */
  private async initializeOpenAI(): Promise<void> {
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this.performInitialization();
    return this.initializationPromise;
  }

  private async performInitialization(): Promise<void> {
    try {
      const apiKey = this.configService.get<string>('OPENAI_API_KEY');
      if (!apiKey) {
        this.logger.warn('OPENAI_API_KEY not found in environment variables');
        this.isInitialized = false;
        return;
      }

      // Try to import OpenAI package
      try {
        const OpenAI = await import('openai');
        this.openai = new OpenAI.default({
          apiKey,
        });
        this.isInitialized = true;
        this.logger.log('OpenAI client initialized successfully');
      } catch (importError) {
        this.logger.error('Failed to import OpenAI package. Please install it with: npm install openai');
        this.isInitialized = false;
        throw new ServiceUnavailableException('OpenAI package not available. Please install it with: npm install openai');
      }
    } catch (error) {
      this.logger.error('Error initializing OpenAI:', error.message);
      this.isInitialized = false;
      throw error;
    }
  }

  /**
   * Ensures OpenAI is initialized before making API calls
   */
  private async ensureOpenAIInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initializeOpenAI();
    }
    
    if (!this.openai) {
      throw new ServiceUnavailableException('OpenAI service is not available. Please check your configuration.');
    }
  }

  /**
   * Deducts tokens from user account before performing AI operations
   * @param userId - The user ID to deduct tokens from
   * @param operationType - The type of AI operation being performed
   * @returns Promise<{success: boolean, message: string, errorType?: string}> - Result with detailed message
   */
  private async deductTokensForOperation(userId: string, operationType: keyof typeof this.TOKEN_COSTS): Promise<{success: boolean, message: string, errorType?: string}> {
    try {
      const cost = this.TOKEN_COSTS[operationType];
      const result = await this.firestoreService.deductUserTokens(userId, cost);
      
      if (!result.success) {
        this.logger.warn(`Token deduction failed for user ${userId}: ${result.message}`);
        
        // Determine error type based on the message
        let errorType = 'UNKNOWN_ERROR';
        if (result.message.includes('User not found')) {
          errorType = 'USER_NOT_FOUND';
        } else if (result.message.includes('Insufficient tokens')) {
          errorType = 'INSUFFICIENT_TOKENS';
        }
        
        return {
          success: false,
          message: result.message,
          errorType
        };
      }
      
      this.logger.log(`Successfully deducted ${cost} tokens for ${operationType} operation. User ${userId} has ${result.remainingTokens} tokens remaining.`);
      return {
        success: true,
        message: `Successfully deducted ${cost} tokens. You have ${result.remainingTokens} tokens remaining.`
      };
    } catch (error) {
      this.logger.error(`Error deducting tokens for user ${userId}:`, error.message);
      return {
        success: false,
        message: 'Failed to process token deduction. Please try again.',
        errorType: 'SYSTEM_ERROR'
      };
    }
  }

  /**
   * Enhances a prompt using OpenAI GPT models
   * @param enhancePromptDto - The prompt enhancement request
   * @returns Enhanced prompt with improved context and specificity
   */
  async enhancePrompt(enhancePromptDto: EnhancePromptDto): Promise<{ enhancedPrompt: string }> {
    try {
      await this.ensureOpenAIInitialized();

      const { user_id, prompt, enhancementType, context, targetAudience } = enhancePromptDto;

      // Validate required fields
      if (!user_id) {
        throw new BadRequestException('User ID is required to perform this operation.');
      }
      if (!prompt) {
        throw new BadRequestException('Prompt text is required for enhancement.');
      }

      // Deduct tokens before performing the operation
      const tokenResult = await this.deductTokensForOperation(user_id, 'ENHANCE_PROMPT');
      if (!tokenResult.success) {
        switch (tokenResult.errorType) {
          case 'USER_NOT_FOUND':
            throw new BadRequestException('User account not found. Please check your user ID or create an account.');
          case 'INSUFFICIENT_TOKENS':
            throw new BadRequestException('Insufficient tokens to perform this operation. Please purchase more tokens to continue.');
          case 'SYSTEM_ERROR':
            throw new BadRequestException('System error occurred while processing your request. Please try again later.');
          default:
            throw new BadRequestException(tokenResult.message || 'Failed to process token deduction. Please try again.');
        }
      }

      const systemPrompt = this.getEnhancementSystemPrompt(enhancementType || EnhancementType.GENERAL);
      const userPrompt = this.buildEnhancementUserPrompt(prompt, context, targetAudience);

      const completion = await this.openai.chat.completions.create({
        model: this.configService.get<string>('ENHANCE_PROMPT_MODEL'),
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 500,
        temperature: 0.7,
      });

      const enhancedPrompt = completion.choices[0]?.message?.content || prompt;

      this.logger.log(`Prompt enhanced successfully for type: ${enhancementType || 'general'}`);
      return { enhancedPrompt };
    } catch (error) {
      this.logger.error('Error enhancing prompt:', error.message);
      throw serviceErrorHandler(error, 'enhance prompt');
    }
  }

  /**
   * Generates a smart response based on input content and selected type
   * @param generateResponseDto - The response generation request
   * @returns Generated response based on the specified type
   */
  async generateResponse(generateResponseDto: GenerateResponseDto): Promise<{ response: string }> {
    try {
      await this.ensureOpenAIInitialized();

      const { user_id, content, responseType, context, tone, maxLength } = generateResponseDto;

      // Validate required fields
      if (!user_id) {
        throw new BadRequestException('User ID is required to perform this operation.');
      }
      if (!content) {
        throw new BadRequestException('Content is required to generate a response.');
      }

      // Deduct tokens before performing the operation
      const tokenResult = await this.deductTokensForOperation(user_id, 'GENERATE_RESPONSE');
      if (!tokenResult.success) {
        switch (tokenResult.errorType) {
          case 'USER_NOT_FOUND':
            throw new BadRequestException('User account not found. Please check your user ID or create an account.');
          case 'INSUFFICIENT_TOKENS':
            throw new BadRequestException('Insufficient tokens to perform this operation. Please purchase more tokens to continue.');
          case 'SYSTEM_ERROR':
            throw new BadRequestException('System error occurred while processing your request. Please try again later.');
          default:
            throw new BadRequestException(tokenResult.message || 'Failed to process token deduction. Please try again.');
        }
      }

      const systemPrompt = this.getResponseSystemPrompt(responseType || ResponseType.GENERAL);
      const userPrompt = this.buildResponseUserPrompt(content, context, tone, maxLength);

      const completion = await this.openai.chat.completions.create({
        model: this.configService.get<string>('GENERATE_RESPONSE_MODEL'),
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 800,
        temperature: 0.8,
      });

      const response = completion.choices[0]?.message?.content || 'Unable to generate response';

      this.logger.log(`Response generated successfully for type: ${responseType || 'general'}`);
      return { response };
    } catch (error) {
      this.logger.error('Error generating response:', error.message);
      throw serviceErrorHandler(error, 'generate response');
    }
  }

  /**
   * Gets the system prompt for different enhancement types
   */
  private getEnhancementSystemPrompt(enhancementType: EnhancementType): string {
    const prompts = {
      [EnhancementType.GENERAL]: 'You are an expert at improving prompts to make them more clear, specific, and effective. Add context, specificity, and clarity while maintaining the original intent.',
      [EnhancementType.EDUCATIONAL]: 'You are an educational expert who enhances prompts to make them more educational, informative, and suitable for learning purposes. Add educational context and learning objectives.',
      [EnhancementType.CODE]: 'You are a programming expert who enhances prompts to make them more specific for coding tasks. Add technical context, programming language specifications, and code requirements.',
      [EnhancementType.CREATIVE]: 'You are a creative writing expert who enhances prompts to make them more inspiring and creative. Add creative context, style guidance, and artistic direction.',
      [EnhancementType.ANALYTICAL]: 'You are an analytical expert who enhances prompts to make them more precise for analytical tasks. Add analytical context, data requirements, and logical structure.',
      [EnhancementType.STEP_BY_STEP]: 'You are an expert at creating step-by-step instructions. Enhance prompts to include clear steps, sequence, and progression.',
      [EnhancementType.FUN]: 'You are an expert at making prompts more engaging and fun. Add humor, entertainment value, and playful elements while maintaining functionality.',
    };

    return prompts[enhancementType] || prompts[EnhancementType.GENERAL];
  }

  /**
   * Gets the system prompt for different response types
   */
  private getResponseSystemPrompt(responseType: ResponseType): string {
    const prompts = {
      [ResponseType.GENERAL]: 'You are a helpful AI assistant that provides clear, informative, and well-structured responses.',
      [ResponseType.EDUCATIONAL]: 'You are an educational expert that provides informative, well-explained responses suitable for learning and understanding.',
      [ResponseType.CODE]: 'You are a programming expert that provides clear, well-documented code examples and technical explanations.',
      [ResponseType.CREATIVE]: 'You are a creative expert that provides imaginative, inspiring, and artistic responses.',
      [ResponseType.ANALYTICAL]: 'You are an analytical expert that provides logical, well-reasoned, and data-driven responses.',
      [ResponseType.STEP_BY_STEP]: 'You are an expert at providing clear, sequential, step-by-step instructions and explanations.',
      [ResponseType.FUN]: 'You are an entertaining AI that provides engaging, humorous, and enjoyable responses while being helpful.',
    };

    return prompts[responseType] || prompts[ResponseType.GENERAL];
  }

  /**
   * Builds the user prompt for enhancement requests
   */
  private buildEnhancementUserPrompt(prompt: string, context?: string, targetAudience?: string): string {
    let userPrompt = `Please enhance the following prompt:\n\n"${prompt}"\n\n`;

    if (context) {
      userPrompt += `Context: ${context}\n\n`;
    }

    if (targetAudience) {
      userPrompt += `Target Audience: ${targetAudience}\n\n`;
    }

    userPrompt += 'Please provide an enhanced version that is more specific, clear, and effective.';
    return userPrompt;
  }

  /**
   * Builds the user prompt for response generation requests
   */
  private buildResponseUserPrompt(content: string, context?: string, tone?: string, maxLength?: string): string {
    let userPrompt = `Please generate a response based on the following content:\n\n"${content}"\n\n`;

    if (context) {
      userPrompt += `Context: ${context}\n\n`;
    }

    if (tone) {
      userPrompt += `Tone: ${tone}\n\n`;
    }

    if (maxLength) {
      userPrompt += `Maximum Length: ${maxLength}\n\n`;
    }

    userPrompt += 'Please provide a relevant and helpful response.';
    return userPrompt;
  }

  /**
   * Converts text to speech using OpenAI's Speech API
   * @param textToSpeechDto - The text-to-speech request
   * @returns Audio buffer in the specified format
   */
  async textToSpeech(textToSpeechDto: TextToSpeechDto): Promise<{ audioBuffer: Buffer; format: string }> {
    try {
      await this.ensureOpenAIInitialized();

      const { user_id, text, voice, responseFormat, speed, model } = textToSpeechDto;

      // Validate required fields
      if (!user_id) {
        throw new BadRequestException('User ID is required to perform this operation.');
      }
      if (!text) {
        throw new BadRequestException('Text content is required for text-to-speech conversion.');
      }

      // Deduct tokens before performing the operation
      const tokenResult = await this.deductTokensForOperation(user_id, 'TEXT_TO_SPEECH');
      if (!tokenResult.success) {
        switch (tokenResult.errorType) {
          case 'USER_NOT_FOUND':
            throw new BadRequestException('User account not found. Please check your user ID or create an account.');
          case 'INSUFFICIENT_TOKENS':
            throw new BadRequestException('Insufficient tokens to perform this operation. Please purchase more tokens to continue.');
          case 'SYSTEM_ERROR':
            throw new BadRequestException('System error occurred while processing your request. Please try again later.');
          default:
            throw new BadRequestException(tokenResult.message || 'Failed to process token deduction. Please try again.');
        }
      }

      // Validate text length (OpenAI has a limit of 4096 characters)
      if (text.length > 4096) {
        throw new BadRequestException('Text is too long. Maximum length is 4096 characters. Please shorten your text and try again.');
      }

      const speechResponse = await this.openai.audio.speech.create({
        model: model || 'tts-1',
        voice: voice || VoiceType.ALLOY,
        input: text,
        response_format: responseFormat || ResponseFormat.MP3,
        speed: speed || 1,
      });

      // Convert the response to a Buffer
      const arrayBuffer = await speechResponse.arrayBuffer();
      const audioBuffer = Buffer.from(arrayBuffer);

      this.logger.log(`Text-to-speech conversion successful. Audio size: ${audioBuffer.length} bytes`);
      return { 
        audioBuffer, 
        format: getContentType(responseFormat || ResponseFormat.MP3)
      };
    } catch (error) {
      this.logger.error('Error converting text to speech:', error.message);
      throw serviceErrorHandler(error, 'convert text to speech');
    }
  }

  /**
   * Health check method to verify OpenAI service status
   */
  async healthCheck(): Promise<{ status: string; message: string }> {
    try {
      await this.ensureOpenAIInitialized();
      return {
        status: 'healthy',
        message: 'OpenAI service is available and ready'
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: error.message
      };
    }
  }
} 