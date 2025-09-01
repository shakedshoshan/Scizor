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
import axios from 'axios';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  // Product mapping for your two products
  private readonly PRODUCT_CONFIG = {
    // Add your actual Lemon Squeezy product IDs here
    PREMIUM_PRODUCT_ID: process.env.LEMON_SQUEEZY_PRO_PRODUCT_ID || '1', // Replace with actual ID
    FREE_PRODUCT_ID: process.env.LEMON_SQUEEZY_STANDARD_PRODUCT_ID || '2', // Replace with actual ID
  };

  // Lemon Squeezy API configuration
  private readonly LEMON_SQUEEZY_API_BASE = 'https://api.lemonsqueezy.com/v1';
  private readonly LEMON_SQUEEZY_API_KEY = process.env.LEMON_SQUEEZY_API_KEY;

  constructor(
    private readonly firestoreService: FirestoreService,
    private readonly userLookupService: UserLookupService,
  ) {}

  /**
   * Convert user to premium subscriber
   * - Set tokens to 500
   * - Set is_premium to true
   * - Store subscription_id if provided
   */
  private async newSubscriber(userId: string, subscriptionId?: string): Promise<PaymentResponseDto> {
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

      // Update user to premium with 500 tokens and subscription_id
      let updatedUser;
      try {
        updatedUser = await this.firestoreService.updateUserToken(userId, {
          tokens: 500,
          is_premium: true,
          subscription_id: subscriptionId,
        });
      } catch (error) {
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
    } catch (error) {
      this.logger.error(`Failed to upgrade user ${userId} to premium: ${error.message}`);
      
      return {
        success: false,
        message: `Failed to upgrade user to premium: ${error.message}`,
      };
    }
  }

  /**
   * Cancel subscription in Lemon Squeezy API
   */
  private async cancelLemonSqueezySubscription(subscriptionId: string): Promise<boolean> {
    try {
      if (!this.LEMON_SQUEEZY_API_KEY) {
        this.logger.error('LEMON_SQUEEZY_API_KEY not configured');
        return false;
      }

      this.logger.log(`Cancelling Lemon Squeezy subscription: ${subscriptionId}`);

      const response = await axios.delete(
        `${this.LEMON_SQUEEZY_API_BASE}/subscriptions/${subscriptionId}`,
        {
          headers: {
            'Accept': 'application/vnd.api+json',
            'Content-Type': 'application/vnd.api+json',
            'Authorization': `Bearer ${this.LEMON_SQUEEZY_API_KEY}`,
          },
        }
      );

      if (response.status === 200) {
        this.logger.log(`Successfully cancelled Lemon Squeezy subscription: ${subscriptionId}`);
        return true;
      } else {
        this.logger.error(`Failed to cancel subscription. Status: ${response.status}`);
        return false;
      }
    } catch (error) {
      this.logger.error(`Error cancelling Lemon Squeezy subscription ${subscriptionId}: ${error.message}`);
      return false;
    }
  }

  /**
   * Convert user to free subscriber
   * - Cancel Lemon Squeezy subscription if exists
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

      // Cancel Lemon Squeezy subscription if user has one
      let subscriptionCancelled = false;
      if (existingUser.subscription_id) {
        this.logger.log(`User ${userId} has subscription ${existingUser.subscription_id}, cancelling in Lemon Squeezy`);
        subscriptionCancelled = await this.cancelLemonSqueezySubscription(existingUser.subscription_id);
        
        if (!subscriptionCancelled) {
          this.logger.warn(`Failed to cancel Lemon Squeezy subscription for user ${userId}, but continuing with local update`);
        }
      }

      // Update user to free with 20 tokens and clear subscription_id
      let updatedUser;
      try {
        updatedUser = await this.firestoreService.updateUserToken(userId, {
          tokens: 20,
          is_premium: false,
          subscription_id: undefined,
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
   * Monthly renewal for individual premium users (webhook-based)
   * - Receives webhook payload with user information
   * - Checks if user is premium
   * - If yes, gives them 500 tokens
   * This method is designed to be called by webhooks for monthly renewals
   */
  async monthlyRenew(webhookPayload: LemonSqueezyWebhookDto): Promise<MonthlyRenewResponseDto> {
    try {
      this.logger.log('Processing monthly renewal webhook');

      const { meta, data } = webhookPayload;
      const eventName = meta.event_name;
      const userId = meta.custom_data?.user_id;

      this.logger.log(`Processing monthly renewal event: ${eventName} for user: ${userId}`);

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
              success: false,
              message: 'No user found for email',
              data: {
                processed_users: 0,
                failed_users: 1,
              },
            };
          }
        } catch (error) {
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

      // Check if user exists and is premium
      let existingUser;
      try {
        existingUser = await this.firestoreService.getUserToken(resolvedUserId);
      } catch (error) {
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

      // Check if user is premium
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

      // User is premium, give them 500 tokens
      try {
        const updatedUser = await this.firestoreService.updateUserToken(resolvedUserId, {
          tokens: 500,
          is_premium: true, // Keep premium status
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
      } catch (error) {
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
    } catch (error) {
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
      const subscriptionId = data.id;

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
        const result = await this.newSubscriber(userId, subscriptionId);
        
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
      const subscriptionId = data.id;
      const status = data.attributes.status;

      this.logger.log(`Handling subscription deactivation for user ${userId}, subscription ${subscriptionId}, status: ${status}`);

      // If this is a cancellation from Lemon Squeezy webhook, we don't need to cancel again
      // Just update the user status locally
      let result;
      if (status === 'cancelled' || status === 'expired' || status === 'paused') {
        // This is a webhook event, so Lemon Squeezy already handled the cancellation
        result = await this.handleLocalSubscriptionDeactivation(userId, subscriptionId);
      } else {
        // This might be a manual cancellation from our API
        result = await this.returnToFree(userId);
      }

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
   * Handle local subscription deactivation (when cancellation comes from webhook)
   * - Update user tokens to 20
   * - Set is_premium to false
   * - Clear subscription_id
   */
  private async handleLocalSubscriptionDeactivation(userId: string, subscriptionId: string): Promise<PaymentResponseDto> {
    try {
      this.logger.log(`Processing local subscription deactivation for user: ${userId}`);

      // Check if user exists
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

      // Update user to free with 20 tokens and clear subscription_id
      let updatedUser;
      try {
        updatedUser = await this.firestoreService.updateUserToken(userId, {
          tokens: 20,
          is_premium: false,
          subscription_id: undefined,
        });
      } catch (error) {
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
    } catch (error) {
      this.logger.error(`Failed to handle local subscription deactivation for user ${userId}: ${error.message}`);
      
      return {
        success: false,
        message: `Failed to handle local subscription deactivation: ${error.message}`,
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
        const result = await this.newSubscriber(userId, data.id);
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
