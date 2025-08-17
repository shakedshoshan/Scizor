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
import { PaymentResponseDto, MonthlyRenewResponseDto } from './dto/payment.dto';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(private readonly firestoreService: FirestoreService) {}

  /**
   * Convert user to premium subscriber
   * - Set tokens to 500
   * - Set is_premium to true
   */
  async newSubscriber(userId: string): Promise<PaymentResponseDto> {
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
}
