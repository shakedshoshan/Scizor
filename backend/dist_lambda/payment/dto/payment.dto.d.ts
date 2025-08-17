export declare class UserIdDto {
    user_id: string;
}
export declare class PaymentResponseDto {
    success: boolean;
    message: string;
    data?: {
        user_id: string;
        tokens: number;
        is_premium: boolean;
    };
}
export declare class MonthlyRenewResponseDto {
    success: boolean;
    message: string;
    data?: {
        processed_users: number;
        failed_users: number;
    };
}
