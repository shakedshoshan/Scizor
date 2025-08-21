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
exports.TextToSpeechDto = exports.ResponseFormat = exports.VoiceType = void 0;
const class_validator_1 = require("class-validator");
var VoiceType;
(function (VoiceType) {
    VoiceType["ALLOY"] = "alloy";
    VoiceType["ECHO"] = "echo";
    VoiceType["FABLE"] = "fable";
    VoiceType["ONYX"] = "onyx";
    VoiceType["NOVA"] = "nova";
    VoiceType["SHIMMER"] = "shimmer";
})(VoiceType || (exports.VoiceType = VoiceType = {}));
var ResponseFormat;
(function (ResponseFormat) {
    ResponseFormat["MP3"] = "mp3";
    ResponseFormat["OPUS"] = "opus";
    ResponseFormat["AAC"] = "aac";
    ResponseFormat["FLAC"] = "flac";
})(ResponseFormat || (exports.ResponseFormat = ResponseFormat = {}));
class TextToSpeechDto {
    text;
    voice = VoiceType.ALLOY;
    responseFormat = ResponseFormat.MP3;
    speed = 1;
    model = 'tts-1';
}
exports.TextToSpeechDto = TextToSpeechDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], TextToSpeechDto.prototype, "text", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(VoiceType),
    __metadata("design:type", String)
], TextToSpeechDto.prototype, "voice", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(ResponseFormat),
    __metadata("design:type", String)
], TextToSpeechDto.prototype, "responseFormat", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)([0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]),
    __metadata("design:type", Number)
], TextToSpeechDto.prototype, "speed", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TextToSpeechDto.prototype, "model", void 0);
//# sourceMappingURL=text-to-speech.dto.js.map