/**
 * auth.controller.ts - Authentication Controller
 * 
 * This controller handles authentication-related HTTP requests including:
 * - User login/logout endpoints
 * - Token refresh endpoints
 * - User registration endpoints
 * - Password reset endpoints
 * - Firestore text document creation
 * 
 * Responsibilities:
 * - Defines authentication API endpoints
 * - Handles request/response validation
 * - Delegates business logic to auth service
 */

import { Controller, Post, Body, HttpStatus, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { FirestoreService } from './firestore.service';
import { CreateTextDto } from './dto/text.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly firestoreService: FirestoreService,
  ) {}

  /**
   * POST /auth/text
   * Create a new text document in Firestore
   */
  @Post('text')
  @HttpCode(HttpStatus.CREATED)
  async createTextDocument(@Body() createTextDto: CreateTextDto) {
    try {
      const documentId = await this.firestoreService.addTextDocument(createTextDto);
      
      return {
        success: true,
        message: 'Text document created successfully',
        data: {
          document_id: documentId,
          ...createTextDto,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: null,
      };
    }
  }
} 