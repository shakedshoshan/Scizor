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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AiController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiController = void 0;
const common_1 = require("@nestjs/common");
const ai_service_1 = require("./ai.service");
const firestore_service_1 = require("../auth/firestore.service");
const enhance_prompt_dto_1 = require("./dto/enhance-prompt.dto");
const generate_response_dto_1 = require("./dto/generate-response.dto");
const text_to_speech_dto_1 = require("./dto/text-to-speech.dto");
const text_dto_1 = require("../auth/dto/text.dto");
let AiController = AiController_1 = class AiController {
    aiService;
    firestoreService;
    logger = new common_1.Logger(AiController_1.name);
    constructor(aiService, firestoreService) {
        this.aiService = aiService;
        this.firestoreService = firestoreService;
    }
    async enhancePrompt(enhancePromptDto) {
        this.logger.log(`Enhancing prompt for user: ${enhancePromptDto.user_id} with type: ${enhancePromptDto.enhancementType || 'general'}`);
        try {
            const result = await this.aiService.enhancePrompt(enhancePromptDto);
            try {
                const textData = {
                    user_id: enhancePromptDto.user_id,
                    action_type: text_dto_1.ActionType.ENHANCE,
                    text: enhancePromptDto.prompt,
                };
                await this.firestoreService.addTextDocument(textData);
            }
            catch (logError) {
                this.logger.warn(`Enhance logging skipped: ${logError?.message || 'Unknown logging error'}`);
            }
            this.logger.log(`Prompt enhancement completed successfully for user: ${enhancePromptDto.user_id}`);
            return {
                success: true,
                data: result,
                message: 'Prompt enhanced successfully',
            };
        }
        catch (error) {
            this.logger.error(`Prompt enhancement failed for user: ${enhancePromptDto.user_id}:`, error.message);
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
    async generateResponse(generateResponseDto) {
        this.logger.log(`Generating response for user: ${generateResponseDto.user_id} with type: ${generateResponseDto.responseType || 'general'}`);
        try {
            const result = await this.aiService.generateResponse(generateResponseDto);
            try {
                const textData = {
                    user_id: generateResponseDto.user_id,
                    action_type: text_dto_1.ActionType.RESPOND,
                    text: generateResponseDto.content,
                };
                await this.firestoreService.addTextDocument(textData);
            }
            catch (logError) {
                this.logger.warn(`Generate logging skipped: ${logError?.message || 'Unknown logging error'}`);
            }
            this.logger.log(`Response generation completed successfully for user: ${generateResponseDto.user_id}`);
            return {
                success: true,
                data: result,
                message: 'Response generated successfully',
            };
        }
        catch (error) {
            this.logger.error(`Response generation failed for user: ${generateResponseDto.user_id}:`, error.message);
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
    async textToSpeech(textToSpeechDto) {
        this.logger.log(`Converting text to speech for user: ${textToSpeechDto.user_id} with voice: ${textToSpeechDto.voice || 'alloy'}`);
        try {
            const result = await this.aiService.textToSpeech(textToSpeechDto);
            try {
                const textData = {
                    user_id: textToSpeechDto.user_id,
                    action_type: text_dto_1.ActionType.READ,
                    text: textToSpeechDto.text,
                };
                await this.firestoreService.addTextDocument(textData);
            }
            catch (logError) {
                this.logger.warn(`TTS logging skipped: ${logError?.message || 'Unknown logging error'}`);
            }
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
        }
        catch (error) {
            this.logger.error(`Text-to-speech conversion failed for user: ${textToSpeechDto.user_id}:`, error.message);
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
    async healthCheck() {
        this.logger.log('Health check requested');
        try {
            const health = await this.aiService.healthCheck();
            return {
                success: true,
                data: health,
                message: 'Health check completed',
            };
        }
        catch (error) {
            this.logger.error('Health check failed:', error.message);
            throw error;
        }
    }
    getContentType(format) {
        const contentTypes = {
            'mp3': 'audio/mpeg',
            'opus': 'audio/opus',
            'aac': 'audio/aac',
            'flac': 'audio/flac',
        };
        return contentTypes[format] || 'audio/mpeg';
    }
};
exports.AiController = AiController;
__decorate([
    (0, common_1.Post)('enhance-prompt'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [enhance_prompt_dto_1.EnhancePromptDto]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "enhancePrompt", null);
__decorate([
    (0, common_1.Post)('generate-response'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [generate_response_dto_1.GenerateResponseDto]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "generateResponse", null);
__decorate([
    (0, common_1.Post)('text-to-speech'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [text_to_speech_dto_1.TextToSpeechDto]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "textToSpeech", null);
__decorate([
    (0, common_1.Get)('health'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AiController.prototype, "healthCheck", null);
exports.AiController = AiController = AiController_1 = __decorate([
    (0, common_1.Controller)('ai'),
    __metadata("design:paramtypes", [ai_service_1.AiService,
        firestore_service_1.FirestoreService])
], AiController);
//# sourceMappingURL=ai.controller.js.map