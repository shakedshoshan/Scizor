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
export declare class LemonSqueezyMeta {
    event_name: string;
    custom_data?: {
        user_id?: string;
        [key: string]: any;
    };
}
export declare class LemonSqueezyAttributes {
    status?: string;
    user_email?: string;
    user_name?: string;
    product_name?: string;
    variant_name?: string;
    product_id?: number;
    variant_id?: number;
    cancelled?: boolean;
    renews_at?: string;
    ends_at?: string;
    test_mode?: boolean;
}
export declare class LemonSqueezyData {
    type: string;
    id: string;
    attributes: LemonSqueezyAttributes;
}
export declare class LemonSqueezyWebhookDto {
    meta: LemonSqueezyMeta;
    data: LemonSqueezyData;
}
export declare class WebhookResponseDto {
    success: boolean;
    message: string;
    processed?: boolean;
}
