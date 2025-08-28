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
var WebhookValidatorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookValidatorService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const crypto = require("crypto");
let WebhookValidatorService = WebhookValidatorService_1 = class WebhookValidatorService {
    configService;
    logger = new common_1.Logger(WebhookValidatorService_1.name);
    webhookSecret;
    constructor(configService) {
        this.configService = configService;
        this.webhookSecret = this.configService.get('LEMON_SQUEEZY_WEBHOOK_SECRET') || '';
        if (!this.webhookSecret) {
            this.logger.warn('LEMON_SQUEEZY_WEBHOOK_SECRET not configured - webhook validation disabled');
        }
    }
    validateSignature(signature, requestBody) {
        try {
            if (!this.webhookSecret) {
                this.logger.warn('Webhook secret not configured, skipping validation');
                return true;
            }
            if (!signature) {
                throw new common_1.UnauthorizedException('Missing webhook signature');
            }
            const cleanSignature = signature.replace(/^sha256=/, '');
            const expectedSignature = crypto
                .createHmac('sha256', this.webhookSecret)
                .update(requestBody, 'utf8')
                .digest('hex');
            const signatureBuffer = Buffer.from(cleanSignature, 'hex');
            const expectedBuffer = Buffer.from(expectedSignature, 'hex');
            if (signatureBuffer.length !== expectedBuffer.length) {
                this.logger.error('Webhook signature length mismatch');
                return false;
            }
            const isValid = crypto.timingSafeEqual(signatureBuffer, expectedBuffer);
            if (!isValid) {
                this.logger.error('Webhook signature validation failed');
            }
            else {
                this.logger.log('Webhook signature validated successfully');
            }
            return isValid;
        }
        catch (error) {
            this.logger.error(`Webhook signature validation error: ${error.message}`);
            return false;
        }
    }
    validateOrThrow(signature, requestBody) {
        if (!this.validateSignature(signature, requestBody)) {
            throw new common_1.UnauthorizedException('Invalid webhook signature');
        }
    }
};
exports.WebhookValidatorService = WebhookValidatorService;
exports.WebhookValidatorService = WebhookValidatorService = WebhookValidatorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], WebhookValidatorService);
//# sourceMappingURL=webhook-validator.service.js.map