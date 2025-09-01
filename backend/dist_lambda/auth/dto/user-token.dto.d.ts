export declare class CreateUserTokenDto {
    user_id: string;
}
export declare class UserTokenDto {
    user_id: string;
    tokens: number;
    is_premium: boolean;
    subscription_id?: string;
}
export declare class UpdateUserTokenDto {
    tokens: number;
    is_premium: boolean;
    subscription_id?: string;
}
export declare class DeductTokenDto {
    user_id: string;
    cost: number;
}
export declare class DeductTokenResultDto {
    success: boolean;
    message: string;
    remainingTokens?: number;
}
