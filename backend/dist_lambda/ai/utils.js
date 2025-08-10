"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getContentType = getContentType;
exports.serviceErrorHandler = serviceErrorHandler;
const common_1 = require("@nestjs/common");
function getContentType(format) {
    const contentTypes = {
        'mp3': 'audio/mpeg',
        'opus': 'audio/opus',
        'aac': 'audio/aac',
        'flac': 'audio/flac',
    };
    return contentTypes[format] || 'audio/mpeg';
}
function serviceErrorHandler(error, operationName) {
    if (error instanceof common_1.BadRequestException) {
        throw error;
    }
    if (error instanceof common_1.ServiceUnavailableException) {
        throw new common_1.BadRequestException('AI service is currently unavailable. Please try again later.');
    }
    if (error?.response?.status) {
        switch (error.response.status) {
            case 401:
                throw new common_1.BadRequestException('AI service authentication failed. Please contact support.');
            case 429:
                throw new common_1.BadRequestException('AI service is experiencing high demand. Please try again in a few minutes.');
            case 400:
                throw new common_1.BadRequestException(`Invalid request parameters for ${operationName}. Please check your input and try again.`);
            case 500:
                throw new common_1.BadRequestException('AI service encountered an internal error. Please try again later.');
            default:
                throw new common_1.BadRequestException(`AI service error occurred during ${operationName}. Please try again later.`);
        }
    }
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        throw new common_1.BadRequestException('Unable to connect to AI service. Please check your internet connection and try again.');
    }
    if (error.code === 'ETIMEDOUT' || error.message?.includes('timeout')) {
        throw new common_1.BadRequestException('AI service request timed out. Please try again.');
    }
    throw new common_1.BadRequestException(`Failed to ${operationName}. Please try again later.`);
}
//# sourceMappingURL=utils.js.map