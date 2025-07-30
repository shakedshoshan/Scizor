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
   * Get Firestore instance
   */
  getFirestore(): admin.firestore.Firestore {
    return this.firestore;
  }
} 