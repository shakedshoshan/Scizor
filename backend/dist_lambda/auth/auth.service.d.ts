import { DeviceTokenExchangeDto, DeviceTokenRefreshDto, DeviceTokenResponseDto } from './dto/device-token.dto';
export declare class AuthService {
    private readonly JWT_SECRET;
    private readonly JWT_EXPIRES_IN;
    private readonly REFRESH_TOKEN_EXPIRES_IN;
    private readonly CONSENT_TOKEN_EXPIRES_IN;
    private readonly pkceChallenges;
    constructor();
    generateConsentToken(userId: string, userEmail: string, userName?: string, codeChallenge?: string): string;
    verifyConsentToken(token: string): any;
    storePKCEChallenge(codeChallenge: string, codeVerifier: string): void;
    validatePKCEChallenge(codeChallenge: string, codeVerifier: string): boolean;
    private generateCodeChallenge;
    private cleanupExpiredPKCEChallenges;
    exchangeDeviceToken(deviceTokenDto: DeviceTokenExchangeDto): Promise<DeviceTokenResponseDto>;
    refreshDeviceToken(refreshDto: DeviceTokenRefreshDto): Promise<Partial<DeviceTokenResponseDto>>;
    private generateAccessToken;
    private generateRefreshToken;
    private extractUserIdFromAuthCode;
    verifyAccessToken(token: string): any;
    debugJWT(): {
        success: boolean;
        message: string;
        data?: any;
    };
    private getTokenExpiryTime;
}
