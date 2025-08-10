import { AuthService } from './auth.service';
import { FirestoreService } from './firestore.service';
import { CreateTextDto } from './dto/text.dto';
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
    }): Promise<{
        success: boolean;
        message: string;
        data: {
            consent_token: string;
            expires_in: number;
        };
    } | {
        success: boolean;
        message: any;
        data: null;
    }>;
    createTextDocument(createTextDto: CreateTextDto): Promise<{
        success: boolean;
        message: string;
        data: {
            user_id: string;
            action_type: import("./dto/text.dto").ActionType;
            text: string;
            document_id: string;
        };
    } | {
        success: boolean;
        message: any;
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
    } | {
        success: boolean;
        message: any;
        data: null;
    }>;
    getUserToken(userId: string): Promise<{
        success: boolean;
        message: string;
        data: import("./dto/user-token.dto").UserTokenDto;
    } | {
        success: boolean;
        message: any;
        data: null;
    }>;
    exchangeDeviceToken(deviceTokenDto: DeviceTokenExchangeDto): Promise<{
        success: boolean;
        message: string;
        data: import("./dto/device-token.dto").DeviceTokenResponseDto;
    } | {
        success: boolean;
        message: any;
        data: null;
    }>;
    refreshDeviceToken(refreshDto: DeviceTokenRefreshDto): Promise<{
        success: boolean;
        message: string;
        data: Partial<import("./dto/device-token.dto").DeviceTokenResponseDto>;
    } | {
        success: boolean;
        message: any;
        data: null;
    }>;
}
