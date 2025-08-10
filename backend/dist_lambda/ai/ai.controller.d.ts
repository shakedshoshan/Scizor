import { Response } from 'express';
import { AiService } from './ai.service';
import { FirestoreService } from '../auth/firestore.service';
import { EnhancePromptDto } from './dto/enhance-prompt.dto';
import { GenerateResponseDto } from './dto/generate-response.dto';
import { TextToSpeechDto } from './dto/text-to-speech.dto';
export declare class AiController {
    private readonly aiService;
    private readonly firestoreService;
    private readonly logger;
    constructor(aiService: AiService, firestoreService: FirestoreService);
    enhancePrompt(enhancePromptDto: EnhancePromptDto): Promise<{
        success: boolean;
        data: {
            enhancedPrompt: string;
        };
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: {
            message: any;
            type: any;
            timestamp: string;
        };
        message: string;
        data?: undefined;
    }>;
    generateResponse(generateResponseDto: GenerateResponseDto): Promise<{
        success: boolean;
        data: {
            response: string;
        };
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: {
            message: any;
            type: any;
            timestamp: string;
        };
        message: string;
        data?: undefined;
    }>;
    textToSpeech(textToSpeechDto: TextToSpeechDto, res: Response): Promise<void>;
    healthCheck(): Promise<{
        success: boolean;
        data: {
            status: string;
            message: string;
        };
        message: string;
    }>;
    private getContentType;
}
