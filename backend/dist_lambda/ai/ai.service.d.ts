import { ConfigService } from '@nestjs/config';
import { FirestoreService } from '../auth/firestore.service';
import { EnhancePromptDto } from './dto/enhance-prompt.dto';
import { GenerateResponseDto } from './dto/generate-response.dto';
import { TextToSpeechDto } from './dto/text-to-speech.dto';
import { TranslateDto } from './dto/translate.dto';
export declare class AiService {
    private readonly configService;
    private readonly firestoreService;
    private readonly logger;
    private openai;
    private isInitialized;
    private initializationPromise;
    private readonly TOKEN_COSTS;
    constructor(configService: ConfigService, firestoreService: FirestoreService);
    private initializeOpenAI;
    private performInitialization;
    private ensureOpenAIInitialized;
    private deductTokensForOperation;
    enhancePrompt(userId: string, enhancePromptDto: EnhancePromptDto): Promise<{
        enhancedPrompt: string;
    }>;
    generateResponse(userId: string, generateResponseDto: GenerateResponseDto): Promise<{
        response: string;
    }>;
    private getEnhancementSystemPrompt;
    private getResponseSystemPrompt;
    private buildEnhancementUserPrompt;
    private buildResponseUserPrompt;
    textToSpeech(userId: string, textToSpeechDto: TextToSpeechDto): Promise<{
        audioBuffer: Buffer;
        format: string;
    }>;
    translate(userId: string, translateDto: TranslateDto): Promise<{
        translatedText: string;
    }>;
    private getTranslationSystemPrompt;
    private buildTranslationUserPrompt;
    healthCheck(): Promise<{
        status: string;
        message: string;
    }>;
}
