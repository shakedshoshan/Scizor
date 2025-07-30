/**
 * firestore.service.ts - Firestore Service
 * 
 * This service handles Firestore database operations including:
 * - Initializing Firestore connection
 * - Writing documents to collections
 * - Managing database connections
 * 
 * Responsibilities:
 * - Manages Firestore client initialization
 * - Handles document creation and updates
 * - Provides database operation utilities
 */

import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { CreateTextDto } from './dto/text.dto';
import { CreateUserTokenDto, UserTokenDto, UpdateUserTokenDto } from './dto/user-token.dto';

@Injectable()
export class FirestoreService implements OnModuleInit {
  private firestore: admin.firestore.Firestore;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    // Initialize Firebase Admin SDK
    if (!admin.apps.length) {
      admin.initializeApp({
        projectId: this.configService.get<string>('FIREBASE_PROJECT_ID'),
        // For local development, you can use service account key
        // credential: admin.credential.cert(serviceAccountKey),
      });
    }
    
    this.firestore = admin.firestore();
  }

  /**
   * Add a new text document to Firestore
   */
  async addTextDocument(data: CreateTextDto): Promise<string> {
    try {
      const docRef = await this.firestore
        .collection('texts')
        .add({
          ...data,
          created_at: admin.firestore.FieldValue.serverTimestamp(),
          updated_at: admin.firestore.FieldValue.serverTimestamp(),
        });

      return docRef.id;
    } catch (error) {
      throw new Error(`Failed to add text document: ${error.message}`);
    }
  }

  /**
   * Check if user exists in user_token collection
   */
  async userExists(userId: string): Promise<boolean> {
    try {
      const querySnapshot = await this.firestore
        .collection('user_token')
        .where('user_id', '==', userId)
        .limit(1)
        .get();

      return !querySnapshot.empty;
    } catch (error) {
      throw new Error(`Failed to check user existence: ${error.message}`);
    }
  }

  /**
   * Create a new user with 0 tokens
   */
  async createUser(data: CreateUserTokenDto): Promise<string> {
    try {
      // Check if user already exists
      const userExists = await this.userExists(data.user_id);
      if (userExists) {
        throw new Error('User already exists');
      }

      const docRef = await this.firestore
        .collection('user_token')
        .add({
          user_id: data.user_id,
          tokens: 20,
          created_at: admin.firestore.FieldValue.serverTimestamp(),
          updated_at: admin.firestore.FieldValue.serverTimestamp(),
        });

      return docRef.id;
    } catch (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  /**
   * Get user token data
   */
  async getUserToken(userId: string): Promise<UserTokenDto | null> {
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
      };
    } catch (error) {
      throw new Error(`Failed to get user token: ${error.message}`);
    }
  }

  /**
   * Update user token count
   */
  async updateUserToken(userId: string, updateData: UpdateUserTokenDto): Promise<UserTokenDto> {
    try {
      // Check if user exists
      const userExists = await this.userExists(userId);
      if (!userExists) {
        throw new Error('User not found');
      }

      // Get the user document
      const querySnapshot = await this.firestore
        .collection('user_token')
        .where('user_id', '==', userId)
        .limit(1)
        .get();

      if (querySnapshot.empty) {
        throw new Error('User not found');
      }

      const doc = querySnapshot.docs[0];
      
      // Update the document
      await doc.ref.update({
        tokens: updateData.tokens,
        updated_at: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Return the updated user token data
      return {
        user_id: userId,
        tokens: updateData.tokens,
      };
    } catch (error) {
      throw new Error(`Failed to update user token: ${error.message}`);
    }
  }

  /**
   * Get Firestore instance
   */
  getFirestore(): admin.firestore.Firestore {
    return this.firestore;
  }
} 