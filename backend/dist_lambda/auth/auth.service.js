"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt = require("jsonwebtoken");
let AuthService = class AuthService {
    JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
    JWT_EXPIRES_IN = '1h';
    REFRESH_TOKEN_EXPIRES_IN = '7d';
    CONSENT_TOKEN_EXPIRES_IN = '10m';
    generateConsentToken(userId, userEmail, userName) {
        const payload = {
            userId,
            userEmail,
            userName: userName || userEmail.split('@')[0],
            type: 'consent',
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + (10 * 60)
        };
        return jwt.sign(payload, this.JWT_SECRET);
    }
    verifyConsentToken(token) {
        try {
            const decoded = jwt.verify(token, this.JWT_SECRET);
            if (decoded.type !== 'consent') {
                throw new Error('Invalid token type');
            }
            return decoded;
        }
        catch (error) {
            throw new Error('Invalid consent token');
        }
    }
    async exchangeDeviceToken(deviceTokenDto) {
        try {
            if (deviceTokenDto.consent_token) {
                const decoded = this.verifyConsentToken(deviceTokenDto.consent_token);
                if (!decoded) {
                    throw new Error('Invalid consent token');
                }
                const userId = decoded.userId;
                const accessToken = this.generateAccessToken(userId);
                const refreshToken = this.generateRefreshToken(userId);
                const expiresIn = this.getTokenExpiryTime();
                return {
                    access_token: accessToken,
                    refresh_token: refreshToken,
                    user_id: userId,
                    expires_in: expiresIn,
                    token_type: 'Bearer'
                };
            }
            else if (deviceTokenDto.authorization_code) {
                const userId = this.extractUserIdFromAuthCode(deviceTokenDto.authorization_code);
                if (!userId) {
                    throw new Error('Invalid authorization code');
                }
                const accessToken = this.generateAccessToken(userId);
                const refreshToken = this.generateRefreshToken(userId);
                const expiresIn = this.getTokenExpiryTime();
                return {
                    access_token: accessToken,
                    refresh_token: refreshToken,
                    user_id: userId,
                    expires_in: expiresIn,
                    token_type: 'Bearer'
                };
            }
            else {
                throw new Error('No consent token or authorization code provided');
            }
        }
        catch (error) {
            throw new Error(`Token exchange failed: ${error.message}`);
        }
    }
    async refreshDeviceToken(refreshDto) {
        try {
            const payload = jwt.verify(refreshDto.refresh_token, this.JWT_SECRET);
            const userId = payload.userId;
            if (!userId) {
                throw new Error('Invalid refresh token');
            }
            const accessToken = this.generateAccessToken(userId);
            const expiresIn = this.getTokenExpiryTime();
            return {
                access_token: accessToken,
                expires_in: expiresIn,
                token_type: 'Bearer'
            };
        }
        catch (error) {
            throw new Error(`Token refresh failed: ${error.message}`);
        }
    }
    generateAccessToken(userId) {
        const payload = {
            userId,
            type: 'access',
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + (60 * 60)
        };
        return jwt.sign(payload, this.JWT_SECRET);
    }
    generateRefreshToken(userId) {
        const payload = {
            userId,
            type: 'refresh',
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60)
        };
        return jwt.sign(payload, this.JWT_SECRET);
    }
    extractUserIdFromAuthCode(authCode) {
        if (authCode.startsWith('auth_')) {
            const parts = authCode.split('_');
            if (parts.length >= 3) {
                return 'demo-user-id';
            }
        }
        return null;
    }
    getTokenExpiryTime() {
        return Math.floor(Date.now() / 1000) + (60 * 60);
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)()
], AuthService);
//# sourceMappingURL=auth.service.js.map