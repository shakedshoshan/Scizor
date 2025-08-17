import { FirestoreService } from '../auth/firestore.service';
import { PaymentResponseDto, MonthlyRenewResponseDto } from './dto/payment.dto';
export declare class PaymentService {
    private readonly firestoreService;
    private readonly logger;
    constructor(firestoreService: FirestoreService);
    newSubscriber(userId: string): Promise<PaymentResponseDto>;
    returnToFree(userId: string): Promise<PaymentResponseDto>;
    monthlyRenew(): Promise<MonthlyRenewResponseDto>;
}
