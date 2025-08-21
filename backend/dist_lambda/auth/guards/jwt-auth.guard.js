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
exports.JwtAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("../auth.service");
let JwtAuthGuard = class JwtAuthGuard {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);
        if (!token) {
            throw new common_1.UnauthorizedException('Access token is required');
        }
        try {
            const payload = this.verifyToken(token);
            request.user = {
                userId: payload.userId,
                tokenType: payload.type,
                issuedAt: payload.iat,
                expiresAt: payload.exp
            };
            return true;
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Invalid or expired token');
        }
    }
    extractTokenFromHeader(request) {
        const authHeader = request.headers.authorization;
        if (!authHeader) {
            return undefined;
        }
        const [type, token] = authHeader.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
    verifyToken(token) {
        try {
            if (!token || typeof token !== 'string') {
                throw new Error('Token must be a valid string');
            }
            const parts = token.split('.');
            if (parts.length !== 3) {
                throw new Error('Token must have 3 parts separated by dots');
            }
            return this.authService.verifyAccessToken(token);
        }
        catch (error) {
            throw new common_1.UnauthorizedException(error.message);
        }
    }
};
exports.JwtAuthGuard = JwtAuthGuard;
exports.JwtAuthGuard = JwtAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], JwtAuthGuard);
//# sourceMappingURL=jwt-auth.guard.js.map