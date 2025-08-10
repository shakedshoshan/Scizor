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

import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { CreateTextDto } from './dto/text.dto';
import { CreateUserTokenDto, UserTokenDto, UpdateUserTokenDto, DeductTokenResultDto } from './dto/user-token.dto';

@Injectable()
export class FirestoreService implements OnModuleInit {
  private firestore: admin.firestore.Firestore;
  private readonly logger = new Logger(FirestoreService.name);

  constructor(private configService: ConfigService) {}

  /**
   * Helper method to properly format Firebase private key
   */
  private formatPrivateKey(privateKeyRaw: string): string {
    if (!privateKeyRaw) {
      throw new Error('Private key is empty');
    }

    // Remove wrapping quotes if present (some env setups add them)
    let privateKey = privateKeyRaw.trim().replace(/^"|"$/g, '');

    // If the key contains literal \n, replace them with actual newlines
    if (privateKey.includes('\\n')) {
      privateKey = privateKey.replace(/\\n/g, '\n');
    }

    // Normalize Windows line endings just in case
    privateKey = privateKey.replace(/\r\n/g, '\n');

    // Ensure the key starts with proper PEM header
    if (!privateKey.startsWith('-----BEGIN PRIVATE KEY-----')) {
      throw new Error('Private key must start with -----BEGIN PRIVATE KEY-----');
    }

    // Ensure it ends with proper PEM footer; allow with or without trailing newline
    if (privateKey.endsWith('-----END PRIVATE KEY-----')) {
      privateKey = privateKey + '\n';
    } else if (!privateKey.endsWith('-----END PRIVATE KEY-----\n')) {
      // Some providers add extra whitespace; try to trim footer area once more
      const trimmed = privateKey.replace(/\s+$/g, '');
      if (trimmed.endsWith('-----END PRIVATE KEY-----')) {
        privateKey = trimmed + '\n';
      } else {
        throw new Error('Private key must end with -----END PRIVATE KEY-----');
      }
    }

    return privateKey;
  }

  async onModuleInit() {
    // Initialize Firebase Admin SDK
    if (!admin.apps.length) {
      const projectId = this.configService.get<string>('FIREBASE_PROJECT_ID');
      const clientEmail = this.configService.get<string>('FIREBASE_CLIENT_EMAIL');
      const privateKeyInput = this.configService.get<string>('FIREBASE_PRIVATE_KEY');

      try {
        if (clientEmail && privateKeyInput) {
          // Use explicit service account credentials (works on AWS Lambda)
          // Accept either raw PEM (with or without \n escaped) OR base64-encoded PEM
          let normalizedPem: string;
          if (privateKeyInput.includes('BEGIN PRIVATE KEY')) {
            // Raw PEM; may include \n escapes
            normalizedPem = this.formatPrivateKey(privateKeyInput);
          } else {
            // Likely base64-encoded string; decode then format
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
        } else {
          // Fallback to application default credentials (works on GCP/dev environments)
          admin.initializeApp({
            projectId,
          });
          
          this.logger.log('Firebase Admin initialized with application default credentials');
        }
      } catch (error) {
        this.logger.error('Failed to initialize Firebase Admin:', error.message);
        
        // If credentials fail, try to initialize without them (for development)
        try {
          admin.initializeApp({
            projectId,
          });
          this.logger.log('Firebase Admin initialized with fallback credentials');
        } catch (fallbackError) {
          this.logger.error('Firebase Admin initialization completely failed:', fallbackError.message);
          throw new Error(`Firebase initialization failed: ${fallbackError.message}`);
        }
      }
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
          is_premium: false,
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
        is_premium: doc.data().is_premium,
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
        is_premium: doc.data().is_premium,
      };
    } catch (error) {
      throw new Error(`Failed to update user token: ${error.message}`);
    }
  }

  /**
   * Deduct tokens from user if they have enough tokens
   */
  async deductUserTokens(userId: string, cost: number): Promise<DeductTokenResultDto> {
    try {
      // Check if user exists
      const userExists = await this.userExists(userId);
      if (!userExists) {
        return {
          success: false,
          message: 'User not found',
        };
      }

      // Get the user document
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

      // Check if user has enough tokens
      if (currentTokens < cost) {
        return {
          success: false,
          message: `Insufficient tokens. Required: ${cost}, Available: ${currentTokens}`,
        };
      }

      // Calculate remaining tokens
      const remainingTokens = currentTokens - cost;

      // Update the document with remaining tokens
      await doc.ref.update({
        tokens: remainingTokens,
        updated_at: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Return success with remaining tokens
      return {
        success: true,
        message: `Successfully deducted ${cost} tokens`,
        remainingTokens: remainingTokens,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to deduct tokens: ${error.message}`,
      };
    }
  }

  /**
   * Get Firestore instance
   */
  getFirestore(): admin.firestore.Firestore {
    return this.firestore;
  }

  /**
   * Check if Firebase is properly initialized
   */
  isInitialized(): boolean {
    return !!this.firestore && admin.apps.length > 0;
  }

  /**
   * Get initialization status for debugging
   */
  getInitializationStatus(): { 
    firebaseApps: number; 
    firestore: boolean; 
    projectId: string | undefined;
    hasCredentials: boolean;
  } {
    return {
      firebaseApps: admin.apps.length,
      firestore: !!this.firestore,
      projectId: this.configService.get<string>('FIREBASE_PROJECT_ID'),
      hasCredentials: !!(this.configService.get<string>('FIREBASE_CLIENT_EMAIL') && this.configService.get<string>('FIREBASE_PRIVATE_KEY'))
    };
  }
} 