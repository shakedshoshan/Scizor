import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { CreateTextDto } from './dto/text.dto';
import { CreateUserTokenDto, UserTokenDto, UpdateUserTokenDto, DeductTokenResultDto } from './dto/user-token.dto';
export declare class FirestoreService implements OnModuleInit {
    private configService;
    private firestore;
    private readonly logger;
    constructor(configService: ConfigService);
    private formatPrivateKey;
    onModuleInit(): Promise<void>;
    addTextDocument(data: CreateTextDto): Promise<string>;
    userExists(userId: string): Promise<boolean>;
    createUser(data: CreateUserTokenDto): Promise<string>;
    getUserToken(userId: string): Promise<UserTokenDto | null>;
    updateUserToken(userId: string, updateData: UpdateUserTokenDto): Promise<UserTokenDto>;
    deductUserTokens(userId: string, cost: number): Promise<DeductTokenResultDto>;
    getFirestore(): admin.firestore.Firestore;
    isInitialized(): boolean;
    getInitializationStatus(): {
        firebaseApps: number;
        firestore: boolean;
        projectId: string | undefined;
        hasCredentials: boolean;
    };
}
