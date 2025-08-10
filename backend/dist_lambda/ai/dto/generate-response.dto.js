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
exports.GenerateResponseDto = exports.ResponseType = void 0;
const class_validator_1 = require("class-validator");
var ResponseType;
(function (ResponseType) {
    ResponseType["GENERAL"] = "general";
    ResponseType["EDUCATIONAL"] = "educational";
    ResponseType["CODE"] = "code";
    ResponseType["CREATIVE"] = "creative";
    ResponseType["ANALYTICAL"] = "analytical";
    ResponseType["STEP_BY_STEP"] = "step-by-step";
    ResponseType["FUN"] = "fun";
})(ResponseType || (exports.ResponseType = ResponseType = {}));
class GenerateResponseDto {
    user_id;
    content;
    responseType = ResponseType.GENERAL;
    context;
    tone;
    maxLength;
}
exports.GenerateResponseDto = GenerateResponseDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], GenerateResponseDto.prototype, "user_id", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], GenerateResponseDto.prototype, "content", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(ResponseType),
    __metadata("design:type", String)
], GenerateResponseDto.prototype, "responseType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateResponseDto.prototype, "context", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateResponseDto.prototype, "tone", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateResponseDto.prototype, "maxLength", void 0);
//# sourceMappingURL=generate-response.dto.js.map