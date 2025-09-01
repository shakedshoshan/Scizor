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
const axios_1 = require("axios");
let PaymentService = PaymentService_1 = class PaymentService {
    firestoreService;
    userLookupService;
    logger = new common_1.Logger(PaymentService_1.name);
    PRODUCT_CONFIG = {
        PREMIUM_PRODUCT_ID: process.env.LEMON_SQUEEZY_PRO_PRODUCT_ID || '1',
        FREE_PRODUCT_ID: process.env.LEMON_SQUEEZY_STANDARD_PRODUCT_ID || '2',
    };
    LEMON_SQUEEZY_API_BASE = 'https://api.lemonsqueezy.com/v1';
    LEMON_SQUEEZY_API_KEY = process.env.LEMON_SQUEEZY_API_KEY;
    constructor(firestoreService, userLookupService) {
        this.firestoreService = firestoreService;
        this.userLookupService = userLookupService;
    }
    async newSubscriber(userId, subscriptionId) {
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
                    subscription_id: subscriptionId,
                });
            }
            catch (error) {
                this.logger.error(`Failed to update user ${userId} tokens: ${error.message}`);
                return {
                    success: false,
                    message: 'Unable to update user subscription. Please try again later.',
                };
            }
            this.logger.log(`Successfully upgraded user ${userId} to premium${subscriptionId ? ` with subscription ${subscriptionId}` : ''}`);
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
    async cancelLemonSqueezySubscription(subscriptionId) {
        try {
            if (!this.LEMON_SQUEEZY_API_KEY) {
                this.logger.error('LEMON_SQUEEZY_API_KEY not configured');
                return false;
            }
            this.logger.log(`Cancelling Lemon Squeezy subscription: ${subscriptionId}`);
            const response = await axios_1.default.delete(`${this.LEMON_SQUEEZY_API_BASE}/subscriptions/${subscriptionId}`, {
                headers: {
                    'Accept': 'application/vnd.api+json',
                    'Content-Type': 'application/vnd.api+json',
                    'Authorization': `Bearer ${this.LEMON_SQUEEZY_API_KEY}`,
                },
            });
            if (response.status === 200) {
                this.logger.log(`Successfully cancelled Lemon Squeezy subscription: ${subscriptionId}`);
                return true;
            }
            else {
                this.logger.error(`Failed to cancel subscription. Status: ${response.status}`);
                return false;
            }
        }
        catch (error) {
            this.logger.error(`Error cancelling Lemon Squeezy subscription ${subscriptionId}: ${error.message}`);
            return false;
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
            let subscriptionCancelled = false;
            if (existingUser.subscription_id) {
                this.logger.log(`User ${userId} has subscription ${existingUser.subscription_id}, cancelling in Lemon Squeezy`);
                subscriptionCancelled = await this.cancelLemonSqueezySubscription(existingUser.subscription_id);
                if (!subscriptionCancelled) {
                    this.logger.warn(`Failed to cancel Lemon Squeezy subscription for user ${userId}, but continuing with local update`);
                }
            }
            let updatedUser;
            try {
                updatedUser = await this.firestoreService.updateUserToken(userId, {
                    tokens: 20,
                    is_premium: false,
                    subscription_id: undefined,
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
    async monthlyRenew(webhookPayload) {
        try {
            this.logger.log('Processing monthly renewal webhook');
            const { meta, data } = webhookPayload;
            const eventName = meta.event_name;
            const userId = meta.custom_data?.user_id;
            this.logger.log(`Processing monthly renewal event: ${eventName} for user: ${userId}`);
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
                            success: false,
                            message: 'No user found for email',
                            data: {
                                processed_users: 0,
                                failed_users: 1,
                            },
                        };
                    }
                }
                catch (error) {
                    this.logger.error(`Failed to lookup user by email ${data.attributes.user_email}: ${error.message}`);
                    return {
                        success: false,
                        message: 'Failed to lookup user by email',
                        data: {
                            processed_users: 0,
                            failed_users: 1,
                        },
                    };
                }
            }
            if (!resolvedUserId) {
                this.logger.warn(`No user identifier found for event ${eventName}`);
                return {
                    success: false,
                    message: 'No user identifier found',
                    data: {
                        processed_users: 0,
                        failed_users: 1,
                    },
                };
            }
            let existingUser;
            try {
                existingUser = await this.firestoreService.getUserToken(resolvedUserId);
            }
            catch (error) {
                this.logger.error(`Firebase error checking user ${resolvedUserId}: ${error.message}`);
                return {
                    success: false,
                    message: 'Unable to connect to user database. Please try again later.',
                    data: {
                        processed_users: 0,
                        failed_users: 1,
                    },
                };
            }
            if (!existingUser) {
                this.logger.warn(`User not found: ${resolvedUserId}`);
                return {
                    success: false,
                    message: 'User not found',
                    data: {
                        processed_users: 0,
                        failed_users: 1,
                    },
                };
            }
            if (!existingUser.is_premium) {
                this.logger.log(`User ${resolvedUserId} is not premium, skipping token renewal`);
                return {
                    success: true,
                    message: 'User is not premium, no tokens added',
                    data: {
                        processed_users: 0,
                        failed_users: 0,
                    },
                };
            }
            try {
                const updatedUser = await this.firestoreService.updateUserToken(resolvedUserId, {
                    tokens: 500,
                    is_premium: true,
                });
                this.logger.log(`Successfully renewed tokens for premium user: ${resolvedUserId}. New token count: ${updatedUser.tokens}`);
                return {
                    success: true,
                    message: `Monthly renewal completed successfully for user ${resolvedUserId}`,
                    data: {
                        processed_users: 1,
                        failed_users: 0,
                    },
                };
            }
            catch (error) {
                this.logger.error(`Failed to renew tokens for user ${resolvedUserId}: ${error.message}`);
                return {
                    success: false,
                    message: `Failed to renew tokens: ${error.message}`,
                    data: {
                        processed_users: 0,
                        failed_users: 1,
                    },
                };
            }
        }
        catch (error) {
            this.logger.error(`Monthly renewal failed: ${error.message}`);
            return {
                success: false,
                message: `Monthly renewal failed: ${error.message}`,
                data: {
                    processed_users: 0,
                    failed_users: 1,
                },
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
            const subscriptionId = data.id;
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
                const result = await this.newSubscriber(userId, subscriptionId);
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
            const subscriptionId = data.id;
            const status = data.attributes.status;
            this.logger.log(`Handling subscription deactivation for user ${userId}, subscription ${subscriptionId}, status: ${status}`);
            let result;
            if (status === 'cancelled' || status === 'expired' || status === 'paused') {
                result = await this.handleLocalSubscriptionDeactivation(userId, subscriptionId);
            }
            else {
                result = await this.returnToFree(userId);
            }
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
    async handleLocalSubscriptionDeactivation(userId, subscriptionId) {
        try {
            this.logger.log(`Processing local subscription deactivation for user: ${userId}`);
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
                    subscription_id: undefined,
                });
            }
            catch (error) {
                this.logger.error(`Failed to update user ${userId} tokens: ${error.message}`);
                return {
                    success: false,
                    message: 'Unable to update user subscription. Please try again later.',
                };
            }
            this.logger.log(`Successfully downgraded user ${userId} to free via webhook`);
            return {
                success: true,
                message: 'User successfully downgraded to free subscriber via webhook',
                data: {
                    user_id: userId,
                    tokens: updatedUser.tokens,
                    is_premium: updatedUser.is_premium,
                },
            };
        }
        catch (error) {
            this.logger.error(`Failed to handle local subscription deactivation for user ${userId}: ${error.message}`);
            return {
                success: false,
                message: `Failed to handle local subscription deactivation: ${error.message}`,
            };
        }
    }
    async handlePaymentSuccess(userId, data) {
        try {
            const productId = data.attributes.product_id?.toString();
            const isPremiumProduct = productId === this.PRODUCT_CONFIG.PREMIUM_PRODUCT_ID;
            if (isPremiumProduct) {
                const result = await this.newSubscriber(userId, data.id);
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