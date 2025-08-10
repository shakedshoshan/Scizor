export declare class DeviceTokenExchangeDto {
    authorization_code?: string;
    consent_token?: string;
    code_verifier: string;
    redirect_uri: string;
}
export declare class DeviceTokenRefreshDto {
    refresh_token: string;
}
export declare class DeviceTokenResponseDto {
    access_token: string;
    refresh_token: string;
    user_id: string;
    expires_in: number;
    token_type?: string;
}
