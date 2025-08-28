/**
 * user-lookup.service.ts - User Lookup Service
 * 
 * This service handles user lookups using Firebase Auth
 * Maps email addresses to user IDs
 */

import { Injectable, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class UserLookupService {
  private readonly logger = new Logger(UserLookupService.name);

  /**
   * Get user ID by email using Firebase Auth
   */
  async getUserIdByEmail(email: string): Promise<string | null> {
    try {
      this.logger.log(`Looking up user ID for email: ${email}`);
      
      const userRecord = await admin.auth().getUserByEmail(email);
      
      this.logger.log(`Found user ID: ${userRecord.uid} for email: ${email}`);
      return userRecord.uid;
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        this.logger.warn(`User not found for email: ${email}`);
        return null;
      }
      
      this.logger.error(`Error looking up user by email ${email}: ${error.message}`);
      throw error;
    }
  }
}
