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
const user_lookup_service_1 = require("../auth/user-lookup.service");
let PaymentService = PaymentService_1 = class PaymentService {
    firestoreService;
    userLookupService;
    logger = new common_1.Logger(PaymentService_1.name);
    PRODUCT_CONFIG = {
        PREMIUM_PRODUCT_ID: process.env.LEMON_SQUEEZY_PRO_PRODUCT_ID || '1',
        FREE_PRODUCT_ID: process.env.LEMON_SQUEEZY_STANDARD_PRODUCT_ID || '2',
    };
    constructor(firestoreService, userLookupService) {
        this.firestoreService = firestoreService;
        this.userLookupService = userLookupService;
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
    async handleWebhook(webhookPayload) {
        try {
            const { meta, data } = webhookPayload;
            const eventName = meta.event_name;
            const userId = meta.custom_data?.user_id;
            this.logger.log(`Processing webhook event: ${eventName} for user: ${userId}`);
            let resolvedUserId = userId;
            if (!resolvedUserId && data.attributes.user_email) {
                this.logger.log(`No user_id in custom_data for event ${eventName}, looking up by email: ${data.attributes.user_email}`);
                try {
                    const lookupResult = await this.userLookupService.getUserIdByEmail(data.attributes.user_email);
                    if (lookupResult) {
                        resolvedUserId = lookupResult;
                        this.logger.log(`Resolved user_id: ${resolvedUserId} for email: ${data.attributes.user_email}`);
                    }
                    else {
                        this.logger.warn(`No user found for email: ${data.attributes.user_email}`);
                        return {
                            success: true,
                            message: 'Webhook received but no user found for email',
                            processed: false,
                        };
                    }
                }
                catch (error) {
                    this.logger.error(`Failed to lookup user by email ${data.attributes.user_email}: ${error.message}`);
                    return {
                        success: false,
                        message: 'Failed to lookup user by email',
                        processed: false,
                    };
                }
            }
            if (!resolvedUserId) {
                this.logger.warn(`No user identifier found for event ${eventName}`);
                return {
                    success: true,
                    message: 'Webhook received but no user identifier found',
                    processed: false,
                };
            }
            switch (eventName) {
                case 'subscription_created':
                case 'subscription_updated':
                case 'subscription_resumed':
                case 'subscription_unpaused':
                    return await this.handleSubscriptionActivation(resolvedUserId, data);
                case 'subscription_cancelled':
                case 'subscription_expired':
                case 'subscription_paused':
                    return await this.handleSubscriptionDeactivation(resolvedUserId, data);
                case 'subscription_payment_success':
                case 'subscription_payment_recovered':
                    return await this.handlePaymentSuccess(resolvedUserId, data);
                case 'subscription_payment_failed':
                    this.logger.log(`Payment failed for user ${resolvedUserId}, maintaining current status`);
                    return {
                        success: true,
                        message: 'Payment failure logged, user status maintained',
                        processed: true,
                    };
                default:
                    this.logger.log(`Unhandled webhook event: ${eventName}`);
                    return {
                        success: true,
                        message: `Event ${eventName} received but not processed`,
                        processed: false,
                    };
            }
        }
        catch (error) {
            this.logger.error(`Webhook processing failed: ${error.message}`);
            return {
                success: false,
                message: `Webhook processing failed: ${error.message}`,
                processed: false,
            };
        }
    }
    async handleSubscriptionActivation(userId, data) {
        try {
            const productId = data.attributes.product_id?.toString();
            const status = data.attributes.status;
            if (status !== 'active') {
                this.logger.log(`Subscription not active for user ${userId}, status: ${status}`);
                return {
                    success: true,
                    message: `Subscription status ${status} - no action taken`,
                    processed: false,
                };
            }
            const isPremiumProduct = productId === this.PRODUCT_CONFIG.PREMIUM_PRODUCT_ID;
            if (isPremiumProduct) {
                const result = await this.newSubscriber(userId);
                return {
                    success: result.success,
                    message: result.message,
                    processed: result.success,
                };
            }
            else {
                const result = await this.returnToFree(userId);
                return {
                    success: result.success,
                    message: result.message,
                    processed: result.success,
                };
            }
        }
        catch (error) {
            this.logger.error(`Failed to handle subscription activation for user ${userId}: ${error.message}`);
            return {
                success: false,
                message: `Failed to process subscription activation: ${error.message}`,
                processed: false,
            };
        }
    }
    async handleSubscriptionDeactivation(userId, data) {
        try {
            const result = await this.returnToFree(userId);
            return {
                success: result.success,
                message: result.message,
                processed: result.success,
            };
        }
        catch (error) {
            this.logger.error(`Failed to handle subscription deactivation for user ${userId}: ${error.message}`);
            return {
                success: false,
                message: `Failed to process subscription deactivation: ${error.message}`,
                processed: false,
            };
        }
    }
    async handlePaymentSuccess(userId, data) {
        try {
            const productId = data.attributes.product_id?.toString();
            const isPremiumProduct = productId === this.PRODUCT_CONFIG.PREMIUM_PRODUCT_ID;
            if (isPremiumProduct) {
                const result = await this.newSubscriber(userId);
                return {
                    success: result.success,
                    message: `Premium subscription renewed: ${result.message}`,
                    processed: result.success,
                };
            }
            else {
                this.logger.log(`Payment success for non-premium product, user ${userId}`);
                return {
                    success: true,
                    message: 'Payment success processed for non-premium product',
                    processed: true,
                };
            }
        }
        catch (error) {
            this.logger.error(`Failed to handle payment success for user ${userId}: ${error.message}`);
            return {
                success: false,
                message: `Failed to process payment success: ${error.message}`,
                processed: false,
            };
        }
    }
};
exports.PaymentService = PaymentService;
exports.PaymentService = PaymentService = PaymentService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [firestore_service_1.FirestoreService,
        user_lookup_service_1.UserLookupService])
], PaymentService);
//# sourceMappingURL=payment.service.js.map