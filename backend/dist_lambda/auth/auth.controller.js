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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const firestore_service_1 = require("./firestore.service");
const user_token_dto_1 = require("./dto/user-token.dto");
const device_token_dto_1 = require("./dto/device-token.dto");
let AuthController = class AuthController {
    authService;
    firestoreService;
    constructor(authService, firestoreService) {
        this.authService = authService;
        this.firestoreService = firestoreService;
    }
    async generateConsentToken(body) {
        try {
            if (!body.userId || !body.userEmail) {
                throw new common_1.BadRequestException('userId and userEmail are required');
            }
            if (body.codeChallenge) {
                console.log(`PKCE challenge received: ${body.codeChallenge}`);
            }
            const consentToken = this.authService.generateConsentToken(body.userId, body.userEmail, body.userName, body.codeChallenge);
            return {
                success: true,
                message: 'Consent token generated successfully',
                data: {
                    consent_token: consentToken,
                    expires_in: 600,
                    code_challenge: body.codeChallenge || null
                },
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message,
                data: null,
            };
        }
    }
    async exchangeDeviceToken(deviceTokenDto) {
        try {
            const tokenData = await this.authService.exchangeDeviceToken(deviceTokenDto);
            return {
                success: true,
                message: 'Token exchange successful',
                data: tokenData,
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message,
                data: null,
            };
        }
    }
    async refreshDeviceToken(refreshDto) {
        try {
            const tokenData = await this.authService.refreshDeviceToken(refreshDto);
            return {
                success: true,
                message: 'Token refresh successful',
                data: tokenData,
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message,
                data: null,
            };
        }
    }
    async createUser(createUserDto) {
        try {
            const documentId = await this.firestoreService.createUser(createUserDto);
            return {
                success: true,
                message: 'User created successfully with 20 tokens',
                data: {
                    document_id: documentId,
                    user_id: createUserDto.user_id,
                    tokens: 20,
                    is_premium: false,
                },
            };
        }
        catch (error) {
            const message = error.message || '';
            if (message.toLowerCase().includes('already exists')) {
                throw new common_1.ConflictException('User already exists');
            }
            throw new common_1.InternalServerErrorException('Failed to create user');
        }
    }
    async getUserToken(userId) {
        try {
            const userToken = await this.firestoreService.getUserToken(userId);
            if (!userToken) {
                return {
                    success: false,
                    message: 'User not found',
                    data: null,
                };
            }
            return {
                success: true,
                message: 'User token retrieved successfully',
                data: userToken,
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message,
                data: null,
            };
        }
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('consent-token'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "generateConsentToken", null);
__decorate([
    (0, common_1.Post)('device/token'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [device_token_dto_1.DeviceTokenExchangeDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "exchangeDeviceToken", null);
__decorate([
    (0, common_1.Post)('device/refresh'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [device_token_dto_1.DeviceTokenRefreshDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refreshDeviceToken", null);
__decorate([
    (0, common_1.Post)('create-user-token'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_token_dto_1.CreateUserTokenDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "createUser", null);
__decorate([
    (0, common_1.Get)('user/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getUserToken", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        firestore_service_1.FirestoreService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map