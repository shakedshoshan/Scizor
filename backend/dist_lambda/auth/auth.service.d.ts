import { DeviceTokenExchangeDto, DeviceTokenRefreshDto, DeviceTokenResponseDto } from './dto/device-token.dto';
export declare class AuthService {
    private readonly JWT_SECRET;
    private readonly JWT_EXPIRES_IN;
    private readonly REFRESH_TOKEN_EXPIRES_IN;
    private readonly CONSENT_TOKEN_EXPIRES_IN;
    generateConsentToken(userId: string, userEmail: string, userName?: string): string;
    verifyConsentToken(token: string): any;
    exchangeDeviceToken(deviceTokenDto: DeviceTokenExchangeDto): Promise<DeviceTokenResponseDto>;
    refreshDeviceToken(refreshDto: DeviceTokenRefreshDto): Promise<Partial<DeviceTokenResponseDto>>;
    private generateAccessToken;
    private generateRefreshToken;
    private extractUserIdFromAuthCode;
    private getTokenExpiryTime;
}
