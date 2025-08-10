"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AiService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const firestore_service_1 = require("../auth/firestore.service");
const enhance_prompt_dto_1 = require("./dto/enhance-prompt.dto");
const generate_response_dto_1 = require("./dto/generate-response.dto");
const text_to_speech_dto_1 = require("./dto/text-to-speech.dto");
const utils_1 = require("./utils");
let AiService = AiService_1 = class AiService {
    configService;
    firestoreService;
    logger = new common_1.Logger(AiService_1.name);
    openai;
    isInitialized = false;
    initializationPromise = null;
    TOKEN_COSTS = {
        ENHANCE_PROMPT: 1,
        GENERATE_RESPONSE: 1,
        TEXT_TO_SPEECH: 1,
    };
    constructor(configService, firestoreService) {
        this.configService = configService;
        this.firestoreService = firestoreService;
        this.initializeOpenAI();
    }
    async initializeOpenAI() {
        if (this.initializationPromise) {
            return this.initializationPromise;
        }
        this.initializationPromise = this.performInitialization();
        return this.initializationPromise;
    }
    async performInitialization() {
        try {
            const apiKey = this.configService.get('OPENAI_API_KEY');
            if (!apiKey) {
                this.logger.warn('OPENAI_API_KEY not found in environment variables');
                this.isInitialized = false;
                return;
            }
            try {
                const OpenAI = await Promise.resolve().then(() => require('openai'));
                this.openai = new OpenAI.default({
                    apiKey,
                });
                this.isInitialized = true;
                this.logger.log('OpenAI client initialized successfully');
            }
            catch (importError) {
                this.logger.error('Failed to import OpenAI package. Please install it with: npm install openai');
                this.isInitialized = false;
                throw new common_1.ServiceUnavailableException('OpenAI package not available. Please install it with: npm install openai');
            }
        }
        catch (error) {
            this.logger.error('Error initializing OpenAI:', error.message);
            this.isInitialized = false;
            throw error;
        }
    }
    async ensureOpenAIInitialized() {
        if (!this.isInitialized) {
            await this.initializeOpenAI();
        }
        if (!this.openai) {
            throw new common_1.ServiceUnavailableException('OpenAI service is not available. Please check your configuration.');
        }
    }
    async deductTokensForOperation(userId, operationType) {
        try {
            const cost = this.TOKEN_COSTS[operationType];
            const result = await this.firestoreService.deductUserTokens(userId, cost);
            if (!result.success) {
                this.logger.warn(`Token deduction failed for user ${userId}: ${result.message}`);
                let errorType = 'UNKNOWN_ERROR';
                if (result.message.includes('User not found')) {
                    errorType = 'USER_NOT_FOUND';
                }
                else if (result.message.includes('Insufficient tokens')) {
                    errorType = 'INSUFFICIENT_TOKENS';
                }
                else if (result.message.includes('Failed to deduct tokens') ||
                    result.message.includes('default credentials') ||
                    result.message.includes('Could not load the default credentials')) {
                    errorType = 'FIRESTORE_UNAVAILABLE';
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
        }
        catch (error) {
            this.logger.error(`Error deducting tokens for user ${userId}:`, error.message);
            return {
                success: false,
                message: 'Failed to process token deduction. Please try again.',
                errorType: 'SYSTEM_ERROR'
            };
        }
    }
    async enhancePrompt(enhancePromptDto) {
        try {
            await this.ensureOpenAIInitialized();
            const { user_id, prompt, enhancementType, context, targetAudience } = enhancePromptDto;
            if (!user_id) {
                throw new common_1.BadRequestException('User ID is required to perform this operation.');
            }
            if (!prompt) {
                throw new common_1.BadRequestException('Prompt text is required for enhancement.');
            }
            const tokenResult = await this.deductTokensForOperation(user_id, 'ENHANCE_PROMPT');
            if (!tokenResult.success) {
                switch (tokenResult.errorType) {
                    case 'USER_NOT_FOUND':
                        throw new common_1.BadRequestException('User account not found. Please check your user ID or create an account.');
                    case 'INSUFFICIENT_TOKENS':
                        throw new common_1.BadRequestException('Insufficient tokens to perform this operation. Please purchase more tokens to continue.');
                    case 'FIRESTORE_UNAVAILABLE':
                        this.logger.warn('Firestore unavailable; skipping token enforcement for enhancePrompt');
                        break;
                    case 'SYSTEM_ERROR':
                        this.logger.warn('Token system error; skipping token enforcement for enhancePrompt');
                        break;
                    default:
                        throw new common_1.BadRequestException(tokenResult.message || 'Failed to process token deduction. Please try again.');
                }
            }
            const systemPrompt = this.getEnhancementSystemPrompt(enhancementType || enhance_prompt_dto_1.EnhancementType.GENERAL);
            const userPrompt = this.buildEnhancementUserPrompt(prompt, context, targetAudience);
            const completion = await this.openai.chat.completions.create({
                model: this.configService.get('ENHANCE_PROMPT_MODEL') || 'gpt-3.5-turbo',
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
        }
        catch (error) {
            this.logger.error('Error enhancing prompt:', error.message);
            throw (0, utils_1.serviceErrorHandler)(error, 'enhance prompt');
        }
    }
    async generateResponse(generateResponseDto) {
        try {
            await this.ensureOpenAIInitialized();
            const { user_id, content, responseType, context, tone, maxLength } = generateResponseDto;
            if (!user_id) {
                throw new common_1.BadRequestException('User ID is required to perform this operation.');
            }
            if (!content) {
                throw new common_1.BadRequestException('Content is required to generate a response.');
            }
            const tokenResult = await this.deductTokensForOperation(user_id, 'GENERATE_RESPONSE');
            if (!tokenResult.success) {
                switch (tokenResult.errorType) {
                    case 'USER_NOT_FOUND':
                        throw new common_1.BadRequestException('User account not found. Please check your user ID or create an account.');
                    case 'INSUFFICIENT_TOKENS':
                        throw new common_1.BadRequestException('Insufficient tokens to perform this operation. Please purchase more tokens to continue.');
                    case 'FIRESTORE_UNAVAILABLE':
                        this.logger.warn('Firestore unavailable; skipping token enforcement for generateResponse');
                        break;
                    case 'SYSTEM_ERROR':
                        this.logger.warn('Token system error; skipping token enforcement for generateResponse');
                        break;
                    default:
                        throw new common_1.BadRequestException(tokenResult.message || 'Failed to process token deduction. Please try again.');
                }
            }
            const systemPrompt = this.getResponseSystemPrompt(responseType || generate_response_dto_1.ResponseType.GENERAL);
            const userPrompt = this.buildResponseUserPrompt(content, context, tone, maxLength);
            const completion = await this.openai.chat.completions.create({
                model: this.configService.get('GENERATE_RESPONSE_MODEL') || 'gpt-3.5-turbo',
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
        }
        catch (error) {
            this.logger.error('Error generating response:', error.message);
            throw (0, utils_1.serviceErrorHandler)(error, 'generate response');
        }
    }
    getEnhancementSystemPrompt(enhancementType) {
        const prompts = {
            [enhance_prompt_dto_1.EnhancementType.GENERAL]: 'You are an expert at improving prompts to make them more clear, specific, and effective. Add context, specificity, and clarity while maintaining the original intent.',
            [enhance_prompt_dto_1.EnhancementType.EDUCATIONAL]: 'You are an educational expert who enhances prompts to make them more educational, informative, and suitable for learning purposes. Add educational context and learning objectives.',
            [enhance_prompt_dto_1.EnhancementType.CODE]: 'You are a programming expert who enhances prompts to make them more specific for coding tasks. Add technical context, programming language specifications, and code requirements.',
            [enhance_prompt_dto_1.EnhancementType.CREATIVE]: 'You are a creative writing expert who enhances prompts to make them more inspiring and creative. Add creative context, style guidance, and artistic direction.',
            [enhance_prompt_dto_1.EnhancementType.ANALYTICAL]: 'You are an analytical expert who enhances prompts to make them more precise for analytical tasks. Add analytical context, data requirements, and logical structure.',
            [enhance_prompt_dto_1.EnhancementType.STEP_BY_STEP]: 'You are an expert at creating step-by-step instructions. Enhance prompts to include clear steps, sequence, and progression.',
            [enhance_prompt_dto_1.EnhancementType.FUN]: 'You are an expert at making prompts more engaging and fun. Add humor, entertainment value, and playful elements while maintaining functionality.',
        };
        return prompts[enhancementType] || prompts[enhance_prompt_dto_1.EnhancementType.GENERAL];
    }
    getResponseSystemPrompt(responseType) {
        const prompts = {
            [generate_response_dto_1.ResponseType.GENERAL]: 'You are a helpful AI assistant that provides clear, informative, and well-structured responses.',
            [generate_response_dto_1.ResponseType.EDUCATIONAL]: 'You are an educational expert that provides informative, well-explained responses suitable for learning and understanding.',
            [generate_response_dto_1.ResponseType.CODE]: 'You are a programming expert that provides clear, well-documented code examples and technical explanations.',
            [generate_response_dto_1.ResponseType.CREATIVE]: 'You are a creative expert that provides imaginative, inspiring, and artistic responses.',
            [generate_response_dto_1.ResponseType.ANALYTICAL]: 'You are an analytical expert that provides logical, well-reasoned, and data-driven responses.',
            [generate_response_dto_1.ResponseType.STEP_BY_STEP]: 'You are an expert at providing clear, sequential, step-by-step instructions and explanations.',
            [generate_response_dto_1.ResponseType.FUN]: 'You are an entertaining AI that provides engaging, humorous, and enjoyable responses while being helpful.',
        };
        return prompts[responseType] || prompts[generate_response_dto_1.ResponseType.GENERAL];
    }
    buildEnhancementUserPrompt(prompt, context, targetAudience) {
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
    buildResponseUserPrompt(content, context, tone, maxLength) {
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
    async textToSpeech(textToSpeechDto) {
        try {
            await this.ensureOpenAIInitialized();
            const { user_id, text, voice, responseFormat, speed, model } = textToSpeechDto;
            if (!user_id) {
                throw new common_1.BadRequestException('User ID is required to perform this operation.');
            }
            if (!text) {
                throw new common_1.BadRequestException('Text content is required for text-to-speech conversion.');
            }
            const tokenResult = await this.deductTokensForOperation(user_id, 'TEXT_TO_SPEECH');
            if (!tokenResult.success) {
                switch (tokenResult.errorType) {
                    case 'USER_NOT_FOUND':
                        throw new common_1.BadRequestException('User account not found. Please check your user ID or create an account.');
                    case 'INSUFFICIENT_TOKENS':
                        throw new common_1.BadRequestException('Insufficient tokens to perform this operation. Please purchase more tokens to continue.');
                    case 'FIRESTORE_UNAVAILABLE':
                        this.logger.warn('Firestore unavailable; skipping token enforcement for textToSpeech');
                        break;
                    case 'SYSTEM_ERROR':
                        this.logger.warn('Token system error; skipping token enforcement for textToSpeech');
                        break;
                    default:
                        throw new common_1.BadRequestException(tokenResult.message || 'Failed to process token deduction. Please try again.');
                }
            }
            if (text.length > 4096) {
                throw new common_1.BadRequestException('Text is too long. Maximum length is 4096 characters. Please shorten your text and try again.');
            }
            const speechResponse = await this.openai.audio.speech.create({
                model: model || 'tts-1',
                voice: voice || text_to_speech_dto_1.VoiceType.ALLOY,
                input: text,
                response_format: responseFormat || text_to_speech_dto_1.ResponseFormat.MP3,
                speed: speed || 1,
            });
            const arrayBuffer = await speechResponse.arrayBuffer();
            const audioBuffer = Buffer.from(arrayBuffer);
            this.logger.log(`Text-to-speech conversion successful. Audio size: ${audioBuffer.length} bytes`);
            return {
                audioBuffer,
                format: (0, utils_1.getContentType)(responseFormat || text_to_speech_dto_1.ResponseFormat.MP3)
            };
        }
        catch (error) {
            this.logger.error('Error converting text to speech:', error.message);
            throw (0, utils_1.serviceErrorHandler)(error, 'convert text to speech');
        }
    }
    async healthCheck() {
        try {
            await this.ensureOpenAIInitialized();
            return {
                status: 'healthy',
                message: 'OpenAI service is available and ready'
            };
        }
        catch (error) {
            return {
                status: 'unhealthy',
                message: error.message
            };
        }
    }
};
exports.AiService = AiService;
exports.AiService = AiService = AiService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        firestore_service_1.FirestoreService])
], AiService);
//# sourceMappingURL=ai.service.js.map