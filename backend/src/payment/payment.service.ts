/**
 * payment.service.ts - Payment Service
 * 
 * This service handles payment-related business logic including:
 * - New subscriber activation (500 tokens + premium status)
 * - Return to free subscriber (20 tokens + remove premium)
 * - Monthly premium user token renewal (500 tokens for all premium users)
 * 
 * Responsibilities:
 * - Implements payment business logic
 * - Manages user token updates for subscription changes
 * - Handles bulk operations for monthly renewals
 */

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { FirestoreService } from '../auth/firestore.service';
import { UserLookupService } from '../auth/user-lookup.service';
import { PaymentResponseDto, MonthlyRenewResponseDto, LemonSqueezyWebhookDto, WebhookResponseDto } from './dto/payment.dto';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  // Product mapping for your two products
  private readonly PRODUCT_CONFIG = {
    // Add your actual Lemon Squeezy product IDs here
    PREMIUM_PRODUCT_ID: process.env.LEMON_SQUEEZY_PRO_PRODUCT_ID || '1', // Replace with actual ID
    FREE_PRODUCT_ID: process.env.LEMON_SQUEEZY_STANDARD_PRODUCT_ID || '2', // Replace with actual ID
  };

  constructor(
    private readonly firestoreService: FirestoreService,
    private readonly userLookupService: UserLookupService,
  ) {}

  /**
   * Convert user to premium subscriber
   * - Set tokens to 500
   * - Set is_premium to true
   */
  private async newSubscriber(userId: string): Promise<PaymentResponseDto> {
    try {
      this.logger.log(`Processing new subscriber: ${userId}`);

      // Check if user exists using the same pattern as AI service
      let existingUser;
      try {
        existingUser = await this.firestoreService.getUserToken(userId);
      } catch (error) {
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

      // Update user to premium with 500 tokens
      let updatedUser;
      try {
        updatedUser = await this.firestoreService.updateUserToken(userId, {
          tokens: 500,
          is_premium: true,
        });
      } catch (error) {
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
    } catch (error) {
      this.logger.error(`Failed to upgrade user ${userId} to premium: ${error.message}`);
      
      return {
        success: false,
        message: `Failed to upgrade user to premium: ${error.message}`,
      };
    }
  }

  /**
   * Convert user to free subscriber
   * - Set tokens to 20
   * - Set is_premium to false
   */
  async returnToFree(userId: string): Promise<PaymentResponseDto> {
    try {
      this.logger.log(`Processing return to free: ${userId}`);

      // Check if user exists using the same pattern as AI service
      let existingUser;
      try {
        existingUser = await this.firestoreService.getUserToken(userId);
      } catch (error) {
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

      // Update user to free with 20 tokens
      let updatedUser;
      try {
        updatedUser = await this.firestoreService.updateUserToken(userId, {
          tokens: 20,
          is_premium: false,
        });
      } catch (error) {
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
    } catch (error) {
      this.logger.error(`Failed to downgrade user ${userId} to free: ${error.message}`);
      
      return {
        success: false,
        message: `Failed to downgrade user to free: ${error.message}`,
      };
    }
  }

  /**
   * Monthly renewal for all premium users
   * - Find all users with is_premium = true
   * - Set their tokens to 500
   * This method is designed to be called by webhooks for monthly renewals
   */
  async monthlyRenew(): Promise<MonthlyRenewResponseDto> {
    try {
      this.logger.log('Starting monthly premium user token renewal');

      // Get all premium users with error handling
      let premiumUsers;
      try {
        premiumUsers = await this.firestoreService.getAllPremiumUsers();
      } catch (error) {
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

      // Process each premium user
      for (const user of premiumUsers) {
        try {
          await this.firestoreService.updateUserToken(user.user_id, {
            tokens: 500,
            is_premium: true, // Keep premium status
          });
          processedUsers++;
          this.logger.log(`Renewed tokens for premium user: ${user.user_id}`);
        } catch (error) {
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
    } catch (error) {
      this.logger.error(`Monthly renewal failed: ${error.message}`);
      
      return {
        success: false,
        message: `Monthly renewal failed: ${error.message}`,
      };
    }
  }

  /**
   * Handle Lemon Squeezy webhook events
   * Processes subscription events and manages user subscriptions
   */
  async handleWebhook(webhookPayload: LemonSqueezyWebhookDto): Promise<WebhookResponseDto> {
    try {
      const { meta, data } = webhookPayload;
      const eventName = meta.event_name;
      const userId = meta.custom_data?.user_id;

      this.logger.log(`Processing webhook event: ${eventName} for user: ${userId}`);

      // If no user_id in custom_data, try to get it from email
      let resolvedUserId = userId;
      if (!resolvedUserId && data.attributes.user_email) {
        this.logger.log(`No user_id in custom_data for event ${eventName}, looking up by email: ${data.attributes.user_email}`);
        try {
          const lookupResult = await this.userLookupService.getUserIdByEmail(data.attributes.user_email);
          if (lookupResult) {
            resolvedUserId = lookupResult;
            this.logger.log(`Resolved user_id: ${resolvedUserId} for email: ${data.attributes.user_email}`);
          } else {
            this.logger.warn(`No user found for email: ${data.attributes.user_email}`);
            return {
              success: true,
              message: 'Webhook received but no user found for email',
              processed: false,
            };
          }
        } catch (error) {
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
    } catch (error) {
      this.logger.error(`Webhook processing failed: ${error.message}`);
      return {
        success: false,
        message: `Webhook processing failed: ${error.message}`,
        processed: false,
      };
    }
  }

  /**
   * Handle subscription activation events
   */
  private async handleSubscriptionActivation(userId: string, data: any): Promise<WebhookResponseDto> {
    try {
      const productId = data.attributes.product_id?.toString();
      const status = data.attributes.status;

      // Check if subscription is active
      if (status !== 'active') {
        this.logger.log(`Subscription not active for user ${userId}, status: ${status}`);
        return {
          success: true,
          message: `Subscription status ${status} - no action taken`,
          processed: false,
        };
      }

      // Determine if this is a premium product
      const isPremiumProduct = productId === this.PRODUCT_CONFIG.PREMIUM_PRODUCT_ID;
      
      if (isPremiumProduct) {
        const result = await this.newSubscriber(userId);
        return {
          success: result.success,
          message: result.message,
          processed: result.success,
        };
      } else {
        // Handle other products or free tier
        const result = await this.returnToFree(userId);
        return {
          success: result.success,
          message: result.message,
          processed: result.success,
        };
      }
    } catch (error) {
      this.logger.error(`Failed to handle subscription activation for user ${userId}: ${error.message}`);
      return {
        success: false,
        message: `Failed to process subscription activation: ${error.message}`,
        processed: false,
      };
    }
  }

  /**
   * Handle subscription deactivation events
   */
  private async handleSubscriptionDeactivation(userId: string, data: any): Promise<WebhookResponseDto> {
    try {
      const result = await this.returnToFree(userId);
      return {
        success: result.success,
        message: result.message,
        processed: result.success,
      };
    } catch (error) {
      this.logger.error(`Failed to handle subscription deactivation for user ${userId}: ${error.message}`);
      return {
        success: false,
        message: `Failed to process subscription deactivation: ${error.message}`,
        processed: false,
      };
    }
  }

  /**
   * Handle successful payment events (renewals)
   */
  private async handlePaymentSuccess(userId: string, data: any): Promise<WebhookResponseDto> {
    try {
      const productId = data.attributes.product_id?.toString();
      const isPremiumProduct = productId === this.PRODUCT_CONFIG.PREMIUM_PRODUCT_ID;

      if (isPremiumProduct) {
        // Renew premium subscription (refresh tokens)
        const result = await this.newSubscriber(userId);
        return {
          success: result.success,
          message: `Premium subscription renewed: ${result.message}`,
          processed: result.success,
        };
      } else {
        this.logger.log(`Payment success for non-premium product, user ${userId}`);
        return {
          success: true,
          message: 'Payment success processed for non-premium product',
          processed: true,
        };
      }
    } catch (error) {
      this.logger.error(`Failed to handle payment success for user ${userId}: ${error.message}`);
      return {
        success: false,
        message: `Failed to process payment success: ${error.message}`,
        processed: false,
      };
    }
  }
}
