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
exports.EnhancePromptDto = exports.EnhancementType = void 0;
const class_validator_1 = require("class-validator");
var EnhancementType;
(function (EnhancementType) {
    EnhancementType["GENERAL"] = "general";
    EnhancementType["EDUCATIONAL"] = "educational";
    EnhancementType["CODE"] = "code";
    EnhancementType["CREATIVE"] = "creative";
    EnhancementType["ANALYTICAL"] = "analytical";
    EnhancementType["STEP_BY_STEP"] = "step-by-step";
    EnhancementType["FUN"] = "fun";
})(EnhancementType || (exports.EnhancementType = EnhancementType = {}));
class EnhancePromptDto {
    user_id;
    prompt;
    enhancementType = EnhancementType.GENERAL;
    context;
    targetAudience;
}
exports.EnhancePromptDto = EnhancePromptDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], EnhancePromptDto.prototype, "user_id", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], EnhancePromptDto.prototype, "prompt", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(EnhancementType),
    __metadata("design:type", String)
], EnhancePromptDto.prototype, "enhancementType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EnhancePromptDto.prototype, "context", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EnhancePromptDto.prototype, "targetAudience", void 0);
//# sourceMappingURL=enhance-prompt.dto.js.map