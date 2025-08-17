import { PaymentService } from './payment.service';
import { UserIdDto, PaymentResponseDto, MonthlyRenewResponseDto } from './dto/payment.dto';
export declare class PaymentController {
    private readonly paymentService;
    constructor(paymentService: PaymentService);
    newSubscriber(userIdDto: UserIdDto): Promise<PaymentResponseDto>;
    returnToFree(userIdDto: UserIdDto): Promise<PaymentResponseDto>;
    monthlyRenew(): Promise<MonthlyRenewResponseDto>;
}
