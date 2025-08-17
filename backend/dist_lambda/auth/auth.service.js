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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
let AuthService = class AuthService {
    JWT_SECRET;
    JWT_EXPIRES_IN = '1h';
    REFRESH_TOKEN_EXPIRES_IN = '7d';
    CONSENT_TOKEN_EXPIRES_IN = '10m';
    pkceChallenges = new Map();
    constructor() {
        const secret = process.env.JWT_SECRET;
        if (!secret || secret === 'your-secret-key') {
            throw new Error('JWT_SECRET environment variable must be set with a strong secret key (minimum 32 characters)');
        }
        this.JWT_SECRET = secret;
    }
    generateConsentToken(userId, userEmail, userName, codeChallenge) {
        const payload = {
            userId,
            userEmail,
            userName: userName || userEmail.split('@')[0],
            type: 'consent',
            codeChallenge,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + (10 * 60)
        };
        return jwt.sign(payload, this.JWT_SECRET, { algorithm: 'HS256' });
    }
    verifyConsentToken(token) {
        try {
            const decoded = jwt.verify(token, this.JWT_SECRET, { algorithms: ['HS256'] });
            if (decoded.type !== 'consent') {
                throw new Error('Invalid token type');
            }
            return decoded;
        }
        catch (error) {
            throw new Error('Invalid consent token');
        }
    }
    storePKCEChallenge(codeChallenge, codeVerifier) {
        const expiresAt = Date.now() + (10 * 60 * 1000);
        this.pkceChallenges.set(codeChallenge, { codeVerifier, expiresAt });
        this.cleanupExpiredPKCEChallenges();
    }
    validatePKCEChallenge(codeChallenge, codeVerifier) {
        const expectedChallenge = this.generateCodeChallenge(codeVerifier);
        return expectedChallenge === codeChallenge;
    }
    generateCodeChallenge(codeVerifier) {
        const hash = crypto.createHash('sha256');
        hash.update(codeVerifier);
        return hash.digest('base64url');
    }
    cleanupExpiredPKCEChallenges() {
        const now = Date.now();
        for (const [challenge, data] of this.pkceChallenges.entries()) {
            if (now > data.expiresAt) {
                this.pkceChallenges.delete(challenge);
            }
        }
    }
    async exchangeDeviceToken(deviceTokenDto) {
        try {
            if (!deviceTokenDto.code_verifier || !deviceTokenDto.redirect_uri) {
                throw new common_1.BadRequestException('Missing required parameters: code_verifier and redirect_uri');
            }
            if (deviceTokenDto.consent_token) {
                const decoded = this.verifyConsentToken(deviceTokenDto.consent_token);
                if (!decoded) {
                    throw new common_1.UnauthorizedException('Invalid consent token');
                }
                if (decoded.codeChallenge) {
                    if (!this.validatePKCEChallenge(decoded.codeChallenge, deviceTokenDto.code_verifier)) {
                        throw new common_1.UnauthorizedException('Invalid PKCE challenge');
                    }
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
                    throw new common_1.UnauthorizedException('Invalid authorization code');
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
                throw new common_1.BadRequestException('No consent token or authorization code provided');
            }
        }
        catch (error) {
            if (error instanceof common_1.UnauthorizedException || error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.UnauthorizedException(`Token exchange failed: ${error.message}`);
        }
    }
    async refreshDeviceToken(refreshDto) {
        try {
            const payload = jwt.verify(refreshDto.refresh_token, this.JWT_SECRET, { algorithms: ['HS256'] });
            const userId = payload.userId;
            if (!userId || payload.type !== 'refresh') {
                throw new common_1.UnauthorizedException('Invalid refresh token');
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
            throw new common_1.UnauthorizedException(`Token refresh failed: ${error.message}`);
        }
    }
    generateAccessToken(userId) {
        const payload = {
            userId,
            type: 'access',
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + (60 * 60)
        };
        return jwt.sign(payload, this.JWT_SECRET, { algorithm: 'HS256' });
    }
    generateRefreshToken(userId) {
        const payload = {
            userId,
            type: 'refresh',
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60)
        };
        return jwt.sign(payload, this.JWT_SECRET, { algorithm: 'HS256' });
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
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], AuthService);
//# sourceMappingURL=auth.service.js.map