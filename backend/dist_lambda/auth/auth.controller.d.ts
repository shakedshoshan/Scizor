import { AuthService } from './auth.service';
import { FirestoreService } from './firestore.service';
import { CreateUserTokenDto } from './dto/user-token.dto';
import { DeviceTokenExchangeDto, DeviceTokenRefreshDto } from './dto/device-token.dto';
export declare class AuthController {
    private readonly authService;
    private readonly firestoreService;
    constructor(authService: AuthService, firestoreService: FirestoreService);
    generateConsentToken(body: {
        userId: string;
        userEmail: string;
        userName?: string;
        codeChallenge?: string;
    }): Promise<{
        success: boolean;
        message: string;
        data: {
            consent_token: string;
            expires_in: number;
            code_challenge: string | null;
        };
    } | {
        success: boolean;
        message: string;
        data: null;
    }>;
    exchangeDeviceToken(deviceTokenDto: DeviceTokenExchangeDto): Promise<{
        success: boolean;
        message: string;
        data: import("./dto/device-token.dto").DeviceTokenResponseDto;
    } | {
        success: boolean;
        message: string;
        data: null;
    }>;
    refreshDeviceToken(refreshDto: DeviceTokenRefreshDto): Promise<{
        success: boolean;
        message: string;
        data: Partial<import("./dto/device-token.dto").DeviceTokenResponseDto>;
    } | {
        success: boolean;
        message: string;
        data: null;
    }>;
    createUser(createUserDto: CreateUserTokenDto): Promise<{
        success: boolean;
        message: string;
        data: {
            document_id: string;
            user_id: string;
            tokens: number;
            is_premium: boolean;
        };
    }>;
    getUserToken(userId: string): Promise<{
        success: boolean;
        message: string;
        data: null;
    } | {
        success: boolean;
        message: string;
        data: import("./dto/user-token.dto").UserTokenDto;
    }>;
}
