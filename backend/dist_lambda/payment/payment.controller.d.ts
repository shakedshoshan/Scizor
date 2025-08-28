import { PaymentService } from './payment.service';
import { WebhookValidatorService } from './webhook-validator.service';
import { UserIdDto, PaymentResponseDto, MonthlyRenewResponseDto, LemonSqueezyWebhookDto, WebhookResponseDto } from './dto/payment.dto';
export declare class PaymentController {
    private readonly paymentService;
    private readonly webhookValidator;
    constructor(paymentService: PaymentService, webhookValidator: WebhookValidatorService);
    handleWebhook(webhookPayload: LemonSqueezyWebhookDto, signature?: string, request?: any): Promise<WebhookResponseDto>;
    newSubscriber(userIdDto: UserIdDto): Promise<PaymentResponseDto>;
    returnToFree(userIdDto: UserIdDto): Promise<PaymentResponseDto>;
    monthlyRenew(): Promise<MonthlyRenewResponseDto>;
}
