"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var FirestoreService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirestoreService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const admin = require("firebase-admin");
let FirestoreService = FirestoreService_1 = class FirestoreService {
    configService;
    firestore;
    logger = new common_1.Logger(FirestoreService_1.name);
    constructor(configService) {
        this.configService = configService;
    }
    formatPrivateKey(privateKeyRaw) {
        let privateKey = privateKeyRaw.trim();
        if (privateKey.includes('\\n')) {
            privateKey = privateKey.replace(/\\n/g, '\n');
        }
        if (!privateKey.startsWith('-----BEGIN PRIVATE KEY-----')) {
            throw new Error('Private key must start with -----BEGIN PRIVATE KEY-----');
        }
        if (!privateKey.endsWith('-----END PRIVATE KEY-----')) {
            throw new Error('Private key must end with -----END PRIVATE KEY-----');
        }
        return privateKey;
    }
    async onModuleInit() {
        if (!admin.apps.length) {
            const projectId = this.configService.get('FIREBASE_PROJECT_ID');
            const clientEmail = this.configService.get('FIREBASE_CLIENT_EMAIL');
            const privateKeyInput = this.configService.get('FIREBASE_PRIVATE_KEY');
            try {
                if (clientEmail && privateKeyInput) {
                    let normalizedPem;
                    if (privateKeyInput.includes('BEGIN PRIVATE KEY')) {
                        normalizedPem = this.formatPrivateKey(privateKeyInput);
                    }
                    else {
                        const decoded = Buffer.from(privateKeyInput, 'base64').toString('utf8');
                        normalizedPem = this.formatPrivateKey(decoded);
                    }
                    admin.initializeApp({
                        credential: admin.credential.cert({
                            projectId,
                            clientEmail,
                            privateKey: normalizedPem,
                        }),
                        projectId,
                    });
                    this.logger.log('Firebase Admin initialized with service account credentials');
                }
                else {
                    admin.initializeApp({
                        projectId,
                    });
                    this.logger.log('Firebase Admin initialized with application default credentials');
                }
            }
            catch (error) {
                this.logger.error('Failed to initialize Firebase Admin:', error.message);
                try {
                    admin.initializeApp({
                        projectId,
                    });
                    this.logger.log('Firebase Admin initialized with fallback credentials');
                }
                catch (fallbackError) {
                    this.logger.error('Firebase Admin initialization completely failed:', fallbackError.message);
                    throw new Error(`Firebase initialization failed: ${fallbackError.message}`);
                }
            }
        }
        this.firestore = admin.firestore();
    }
    async addTextDocument(data) {
        try {
            const docRef = await this.firestore
                .collection('texts')
                .add({
                ...data,
                created_at: admin.firestore.FieldValue.serverTimestamp(),
                updated_at: admin.firestore.FieldValue.serverTimestamp(),
            });
            return docRef.id;
        }
        catch (error) {
            throw new Error(`Failed to add text document: ${error.message}`);
        }
    }
    async userExists(userId) {
        try {
            const querySnapshot = await this.firestore
                .collection('user_token')
                .where('user_id', '==', userId)
                .limit(1)
                .get();
            return !querySnapshot.empty;
        }
        catch (error) {
            throw new Error(`Failed to check user existence: ${error.message}`);
        }
    }
    async createUser(data) {
        try {
            const userExists = await this.userExists(data.user_id);
            if (userExists) {
                throw new Error('User already exists');
            }
            const docRef = await this.firestore
                .collection('user_token')
                .add({
                user_id: data.user_id,
                tokens: 20,
                is_premium: false,
                created_at: admin.firestore.FieldValue.serverTimestamp(),
                updated_at: admin.firestore.FieldValue.serverTimestamp(),
            });
            return docRef.id;
        }
        catch (error) {
            throw new Error(`Failed to create user: ${error.message}`);
        }
    }
    async getUserToken(userId) {
        try {
            const querySnapshot = await this.firestore
                .collection('user_token')
                .where('user_id', '==', userId)
                .limit(1)
                .get();
            if (querySnapshot.empty) {
                return null;
            }
            const doc = querySnapshot.docs[0];
            return {
                user_id: doc.data().user_id,
                tokens: doc.data().tokens,
                is_premium: doc.data().is_premium,
            };
        }
        catch (error) {
            throw new Error(`Failed to get user token: ${error.message}`);
        }
    }
    async updateUserToken(userId, updateData) {
        try {
            const userExists = await this.userExists(userId);
            if (!userExists) {
                throw new Error('User not found');
            }
            const querySnapshot = await this.firestore
                .collection('user_token')
                .where('user_id', '==', userId)
                .limit(1)
                .get();
            if (querySnapshot.empty) {
                throw new Error('User not found');
            }
            const doc = querySnapshot.docs[0];
            await doc.ref.update({
                tokens: updateData.tokens,
                updated_at: admin.firestore.FieldValue.serverTimestamp(),
            });
            return {
                user_id: userId,
                tokens: updateData.tokens,
                is_premium: doc.data().is_premium,
            };
        }
        catch (error) {
            throw new Error(`Failed to update user token: ${error.message}`);
        }
    }
    async deductUserTokens(userId, cost) {
        try {
            const userExists = await this.userExists(userId);
            if (!userExists) {
                return {
                    success: false,
                    message: 'User not found',
                };
            }
            const querySnapshot = await this.firestore
                .collection('user_token')
                .where('user_id', '==', userId)
                .limit(1)
                .get();
            if (querySnapshot.empty) {
                return {
                    success: false,
                    message: 'User not found',
                };
            }
            const doc = querySnapshot.docs[0];
            const currentTokens = doc.data().tokens;
            if (currentTokens < cost) {
                return {
                    success: false,
                    message: `Insufficient tokens. Required: ${cost}, Available: ${currentTokens}`,
                };
            }
            const remainingTokens = currentTokens - cost;
            await doc.ref.update({
                tokens: remainingTokens,
                updated_at: admin.firestore.FieldValue.serverTimestamp(),
            });
            return {
                success: true,
                message: `Successfully deducted ${cost} tokens`,
                remainingTokens: remainingTokens,
            };
        }
        catch (error) {
            return {
                success: false,
                message: `Failed to deduct tokens: ${error.message}`,
            };
        }
    }
    getFirestore() {
        return this.firestore;
    }
    isInitialized() {
        return !!this.firestore && admin.apps.length > 0;
    }
    getInitializationStatus() {
        return {
            firebaseApps: admin.apps.length,
            firestore: !!this.firestore,
            projectId: this.configService.get('FIREBASE_PROJECT_ID'),
            hasCredentials: !!(this.configService.get('FIREBASE_CLIENT_EMAIL') && this.configService.get('FIREBASE_PRIVATE_KEY'))
        };
    }
};
exports.FirestoreService = FirestoreService;
exports.FirestoreService = FirestoreService = FirestoreService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], FirestoreService);
//# sourceMappingURL=firestore.service.js.map