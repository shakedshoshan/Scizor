import { ConfigService } from '@nestjs/config';
export declare class WebhookValidatorService {
    private readonly configService;
    private readonly logger;
    private readonly webhookSecret;
    constructor(configService: ConfigService);
    validateSignature(signature: string, requestBody: string): boolean;
    validateOrThrow(signature: string, requestBody: string): void;
}
