import { FirestoreService } from '../auth/firestore.service';
import { UserLookupService } from '../auth/user-lookup.service';
import { PaymentResponseDto, MonthlyRenewResponseDto, LemonSqueezyWebhookDto, WebhookResponseDto } from './dto/payment.dto';
export declare class PaymentService {
    private readonly firestoreService;
    private readonly userLookupService;
    private readonly logger;
    private readonly PRODUCT_CONFIG;
    private readonly LEMON_SQUEEZY_API_BASE;
    private readonly LEMON_SQUEEZY_API_KEY;
    constructor(firestoreService: FirestoreService, userLookupService: UserLookupService);
    private newSubscriber;
    private cancelLemonSqueezySubscription;
    returnToFree(userId: string): Promise<PaymentResponseDto>;
    monthlyRenew(webhookPayload: LemonSqueezyWebhookDto): Promise<MonthlyRenewResponseDto>;
    handleWebhook(webhookPayload: LemonSqueezyWebhookDto): Promise<WebhookResponseDto>;
    private handleSubscriptionActivation;
    private handleSubscriptionDeactivation;
    private handleLocalSubscriptionDeactivation;
    private handlePaymentSuccess;
}
