import { FirestoreService } from '../auth/firestore.service';
import { UserLookupService } from '../auth/user-lookup.service';
import { PaymentResponseDto, MonthlyRenewResponseDto, LemonSqueezyWebhookDto, WebhookResponseDto } from './dto/payment.dto';
export declare class PaymentService {
    private readonly firestoreService;
    private readonly userLookupService;
    private readonly logger;
    private readonly PRODUCT_CONFIG;
    constructor(firestoreService: FirestoreService, userLookupService: UserLookupService);
    private newSubscriber;
    returnToFree(userId: string): Promise<PaymentResponseDto>;
    monthlyRenew(): Promise<MonthlyRenewResponseDto>;
    handleWebhook(webhookPayload: LemonSqueezyWebhookDto): Promise<WebhookResponseDto>;
    private handleSubscriptionActivation;
    private handleSubscriptionDeactivation;
    private handlePaymentSuccess;
}
