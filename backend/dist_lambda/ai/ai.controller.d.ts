import { AiService } from './ai.service';
import { FirestoreService } from '../auth/firestore.service';
import { EnhancePromptDto } from './dto/enhance-prompt.dto';
import { GenerateResponseDto } from './dto/generate-response.dto';
import { TextToSpeechDto } from './dto/text-to-speech.dto';
import { TranslateDto } from './dto/translate.dto';
export declare class AiController {
    private readonly aiService;
    private readonly firestoreService;
    private readonly logger;
    constructor(aiService: AiService, firestoreService: FirestoreService);
    enhancePrompt(enhancePromptDto: EnhancePromptDto, req: any): Promise<{
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
    generateResponse(generateResponseDto: GenerateResponseDto, req: any): Promise<{
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
    textToSpeech(textToSpeechDto: TextToSpeechDto, req: any): Promise<{
        statusCode: number;
        headers: {
            'Content-Type': string;
            'Content-Length': string;
            'Content-Disposition': string;
            'Access-Control-Allow-Origin': string;
            'Access-Control-Allow-Headers': string;
            'Access-Control-Allow-Methods': string;
        };
        body: string;
        isBase64Encoded: boolean;
    } | {
        statusCode: number;
        headers: {
            'Content-Type': string;
            'Access-Control-Allow-Origin': string;
            'Access-Control-Allow-Headers': string;
            'Access-Control-Allow-Methods': string;
            'Content-Length'?: undefined;
            'Content-Disposition'?: undefined;
        };
        body: string;
        isBase64Encoded?: undefined;
    }>;
    translate(translateDto: TranslateDto, req: any): Promise<{
        success: boolean;
        data: {
            translatedText: string;
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
