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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookResponseDto = exports.LemonSqueezyWebhookDto = exports.LemonSqueezyData = exports.LemonSqueezyAttributes = exports.LemonSqueezyMeta = exports.MonthlyRenewResponseDto = exports.PaymentResponseDto = exports.UserIdDto = void 0;
const class_validator_1 = require("class-validator");
class UserIdDto {
    user_id;
}
exports.UserIdDto = UserIdDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], UserIdDto.prototype, "user_id", void 0);
class PaymentResponseDto {
    success;
    message;
    data;
}
exports.PaymentResponseDto = PaymentResponseDto;
class MonthlyRenewResponseDto {
    success;
    message;
    data;
}
exports.MonthlyRenewResponseDto = MonthlyRenewResponseDto;
class LemonSqueezyMeta {
    event_name;
    custom_data;
}
exports.LemonSqueezyMeta = LemonSqueezyMeta;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], LemonSqueezyMeta.prototype, "event_name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], LemonSqueezyMeta.prototype, "custom_data", void 0);
class LemonSqueezyAttributes {
    status;
    user_email;
    user_name;
    product_name;
    variant_name;
    product_id;
    variant_id;
    cancelled;
    renews_at;
    ends_at;
    test_mode;
}
exports.LemonSqueezyAttributes = LemonSqueezyAttributes;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LemonSqueezyAttributes.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LemonSqueezyAttributes.prototype, "user_email", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LemonSqueezyAttributes.prototype, "user_name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LemonSqueezyAttributes.prototype, "product_name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LemonSqueezyAttributes.prototype, "variant_name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], LemonSqueezyAttributes.prototype, "product_id", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], LemonSqueezyAttributes.prototype, "variant_id", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], LemonSqueezyAttributes.prototype, "cancelled", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LemonSqueezyAttributes.prototype, "renews_at", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LemonSqueezyAttributes.prototype, "ends_at", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], LemonSqueezyAttributes.prototype, "test_mode", void 0);
class LemonSqueezyData {
    type;
    id;
    attributes;
}
exports.LemonSqueezyData = LemonSqueezyData;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], LemonSqueezyData.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], LemonSqueezyData.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", LemonSqueezyAttributes)
], LemonSqueezyData.prototype, "attributes", void 0);
class LemonSqueezyWebhookDto {
    meta;
    data;
}
exports.LemonSqueezyWebhookDto = LemonSqueezyWebhookDto;
__decorate([
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", LemonSqueezyMeta)
], LemonSqueezyWebhookDto.prototype, "meta", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", LemonSqueezyData)
], LemonSqueezyWebhookDto.prototype, "data", void 0);
class WebhookResponseDto {
    success;
    message;
    processed;
}
exports.WebhookResponseDto = WebhookResponseDto;
//# sourceMappingURL=payment.dto.js.map