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
var PaymentService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const common_1 = require("@nestjs/common");
const firestore_service_1 = require("../auth/firestore.service");
let PaymentService = PaymentService_1 = class PaymentService {
    firestoreService;
    logger = new common_1.Logger(PaymentService_1.name);
    constructor(firestoreService) {
        this.firestoreService = firestoreService;
    }
    async newSubscriber(userId) {
        try {
            this.logger.log(`Processing new subscriber: ${userId}`);
            let existingUser;
            try {
                existingUser = await this.firestoreService.getUserToken(userId);
            }
            catch (error) {
                this.logger.error(`Firebase error checking user ${userId}: ${error.message}`);
                return {
                    success: false,
                    message: 'Unable to connect to user database. Please try again later.',
                };
            }
            if (!existingUser) {
                return {
                    success: false,
                    message: 'User not found',
                };
            }
            let updatedUser;
            try {
                updatedUser = await this.firestoreService.updateUserToken(userId, {
                    tokens: 500,
                    is_premium: true,
                });
            }
            catch (error) {
                this.logger.error(`Failed to update user ${userId} tokens: ${error.message}`);
                return {
                    success: false,
                    message: 'Unable to update user subscription. Please try again later.',
                };
            }
            this.logger.log(`Successfully upgraded user ${userId} to premium`);
            return {
                success: true,
                message: 'User successfully upgraded to premium subscriber',
                data: {
                    user_id: userId,
                    tokens: updatedUser.tokens,
                    is_premium: updatedUser.is_premium,
                },
            };
        }
        catch (error) {
            this.logger.error(`Failed to upgrade user ${userId} to premium: ${error.message}`);
            return {
                success: false,
                message: `Failed to upgrade user to premium: ${error.message}`,
            };
        }
    }
    async returnToFree(userId) {
        try {
            this.logger.log(`Processing return to free: ${userId}`);
            let existingUser;
            try {
                existingUser = await this.firestoreService.getUserToken(userId);
            }
            catch (error) {
                this.logger.error(`Firebase error checking user ${userId}: ${error.message}`);
                return {
                    success: false,
                    message: 'Unable to connect to user database. Please try again later.',
                };
            }
            if (!existingUser) {
                return {
                    success: false,
                    message: 'User not found',
                };
            }
            let updatedUser;
            try {
                updatedUser = await this.firestoreService.updateUserToken(userId, {
                    tokens: 20,
                    is_premium: false,
                });
            }
            catch (error) {
                this.logger.error(`Failed to update user ${userId} tokens: ${error.message}`);
                return {
                    success: false,
                    message: 'Unable to update user subscription. Please try again later.',
                };
            }
            this.logger.log(`Successfully downgraded user ${userId} to free`);
            return {
                success: true,
                message: 'User successfully downgraded to free subscriber',
                data: {
                    user_id: userId,
                    tokens: updatedUser.tokens,
                    is_premium: updatedUser.is_premium,
                },
            };
        }
        catch (error) {
            this.logger.error(`Failed to downgrade user ${userId} to free: ${error.message}`);
            return {
                success: false,
                message: `Failed to downgrade user to free: ${error.message}`,
            };
        }
    }
    async monthlyRenew() {
        try {
            this.logger.log('Starting monthly premium user token renewal');
            let premiumUsers;
            try {
                premiumUsers = await this.firestoreService.getAllPremiumUsers();
            }
            catch (error) {
                this.logger.error(`Firebase error getting premium users: ${error.message}`);
                return {
                    success: false,
                    message: 'Unable to connect to user database. Please try again later.',
                };
            }
            if (!premiumUsers || premiumUsers.length === 0) {
                this.logger.log('No premium users found for renewal');
                return {
                    success: true,
                    message: 'No premium users found for renewal',
                    data: {
                        processed_users: 0,
                        failed_users: 0,
                    },
                };
            }
            let processedUsers = 0;
            let failedUsers = 0;
            for (const user of premiumUsers) {
                try {
                    await this.firestoreService.updateUserToken(user.user_id, {
                        tokens: 500,
                        is_premium: true,
                    });
                    processedUsers++;
                    this.logger.log(`Renewed tokens for premium user: ${user.user_id}`);
                }
                catch (error) {
                    failedUsers++;
                    this.logger.error(`Failed to renew tokens for user ${user.user_id}: ${error.message}`);
                }
            }
            this.logger.log(`Monthly renewal completed. Processed: ${processedUsers}, Failed: ${failedUsers}`);
            return {
                success: true,
                message: `Monthly renewal completed successfully`,
                data: {
                    processed_users: processedUsers,
                    failed_users: failedUsers,
                },
            };
        }
        catch (error) {
            this.logger.error(`Monthly renewal failed: ${error.message}`);
            return {
                success: false,
                message: `Monthly renewal failed: ${error.message}`,
            };
        }
    }
};
exports.PaymentService = PaymentService;
exports.PaymentService = PaymentService = PaymentService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [firestore_service_1.FirestoreService])
], PaymentService);
//# sourceMappingURL=payment.service.js.map