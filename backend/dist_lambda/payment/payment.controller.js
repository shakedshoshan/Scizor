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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentController = void 0;
const common_1 = require("@nestjs/common");
const payment_service_1 = require("./payment.service");
const webhook_validator_service_1 = require("./webhook-validator.service");
const payment_dto_1 = require("./dto/payment.dto");
let PaymentController = class PaymentController {
    paymentService;
    webhookValidator;
    constructor(paymentService, webhookValidator) {
        this.paymentService = paymentService;
        this.webhookValidator = webhookValidator;
    }
    async handleWebhook(webhookPayload, signature, request) {
        console.log('webhookPayload:', JSON.stringify(webhookPayload, null, 2));
        if (signature && request?.rawBody) {
            this.webhookValidator.validateOrThrow(signature, request.rawBody);
        }
        if (!webhookPayload.meta?.event_name || !webhookPayload.data) {
            throw new common_1.BadRequestException('Invalid webhook payload structure');
        }
        return await this.paymentService.handleWebhook(webhookPayload);
    }
    async returnToFree(userIdDto) {
        return await this.paymentService.returnToFree(userIdDto.user_id);
    }
    async monthlyRenew() {
        return await this.paymentService.monthlyRenew();
    }
};
exports.PaymentController = PaymentController;
__decorate([
    (0, common_1.Post)('subscription'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-signature')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [payment_dto_1.LemonSqueezyWebhookDto, String, Object]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "handleWebhook", null);
__decorate([
    (0, common_1.Post)('return-to-free'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [payment_dto_1.UserIdDto]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "returnToFree", null);
__decorate([
    (0, common_1.Post)('monthly-renew'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "monthlyRenew", null);
exports.PaymentController = PaymentController = __decorate([
    (0, common_1.Controller)('payment'),
    __metadata("design:paramtypes", [payment_service_1.PaymentService,
        webhook_validator_service_1.WebhookValidatorService])
], PaymentController);
//# sourceMappingURL=payment.controller.js.map