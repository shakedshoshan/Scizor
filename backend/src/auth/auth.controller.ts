/**
 * auth.controller.ts - Authentication Controller
 * 
 * This controller handles authentication-related HTTP requests including:
 * - User login/logout endpoints
 * - Token refresh endpoints
 * - User registration endpoints
 * - Password reset endpoints
 * - Firestore text document creation
 * - User token management
 * - Device flow authentication with PKCE
 * 
 * Responsibilities:
 * - Defines authentication API endpoints
 * - Handles request/response validation
 * - Delegates business logic to auth service
 */

import { Controller, Post, Body, HttpStatus, HttpCode, Get, Param, BadRequestException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { FirestoreService } from './firestore.service';
import { CreateTextDto } from './dto/text.dto';
import { CreateUserTokenDto } from './dto/user-token.dto';
import { DeviceTokenExchangeDto, DeviceTokenRefreshDto } from './dto/device-token.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly firestoreService: FirestoreService,
  ) {}

  /**
   * POST /auth/consent-token
   * Generate JWT consent token for device flow with PKCE
   */
  @Post('consent-token')
  @HttpCode(HttpStatus.OK)
  async generateConsentToken(@Body() body: { 
    userId: string; 
    userEmail: string; 
    userName?: string;
    codeChallenge?: string; // PKCE code challenge
  }) {
    try {
      // Validate required fields
      if (!body.userId || !body.userEmail) {
        throw new BadRequestException('userId and userEmail are required');
      }

      // Store PKCE challenge if provided
      if (body.codeChallenge) {
        // Note: In a real implementation, you'd store this in a database or Redis
        // For now, we'll pass it to the consent token generation
        console.log(`PKCE challenge received: ${body.codeChallenge}`);
      }

      const consentToken = this.authService.generateConsentToken(
        body.userId,
        body.userEmail,
        body.userName,
        body.codeChallenge
      );
      
      return {
        success: true,
        message: 'Consent token generated successfully',
        data: {
          consent_token: consentToken,
          expires_in: 600, // 10 minutes in seconds
          code_challenge: body.codeChallenge || null
        },
      };
    } catch (error) {
      return {
        success: false,
        message: (error as Error).message,
        data: null,
      };
    }
  }

  /**
   * POST /auth/device/token
   * Exchange authorization code for tokens (device flow with PKCE)
   */
  @Post('device/token')
  @HttpCode(HttpStatus.OK)
  async exchangeDeviceToken(@Body() deviceTokenDto: DeviceTokenExchangeDto) {
    try {
      const tokenData = await this.authService.exchangeDeviceToken(deviceTokenDto);
      
      return {
        success: true,
        message: 'Token exchange successful',
        data: tokenData,
      };
    } catch (error) {
      return {
        success: false,
        message: (error as Error).message,
        data: null,
      };
    }
  }

  /**
   * POST /auth/device/refresh
   * Refresh access token using refresh token (device flow)
   */
  @Post('device/refresh')
  @HttpCode(HttpStatus.OK)
  async refreshDeviceToken(@Body() refreshDto: DeviceTokenRefreshDto) {
    try {
      const tokenData = await this.authService.refreshDeviceToken(refreshDto);
      
      return {
        success: true,
        message: 'Token refresh successful',
        data: tokenData,
      };
    } catch (error) {
      return {
        success: false,
        message: (error as Error).message,
        data: null,
      };
    }
  }

  /**
   * POST /auth/create-user-token
   * Create a new user with 20 tokens
   */
  @Post('create-user-token')
  async createUser(@Body() createUserDto: CreateUserTokenDto) {
    try {
      const documentId = await this.firestoreService.createUser(createUserDto);
      
      return {
        success: true,
        message: 'User created successfully with 20 tokens',
        data: {
          document_id: documentId,
          user_id: createUserDto.user_id,
          tokens: 20,
          is_premium: false,
        },
      };
    } catch (error) {
      const message = (error as Error).message || '';
      if (message.toLowerCase().includes('already exists')) {
        // Translate to 409 Conflict for clients to handle gracefully
        throw new ConflictException('User already exists');
      }
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  /**
   * GET /auth/user/:userId
   * Get user token information
   */
  @Get('user/:userId')
  async getUserToken(@Param('userId') userId: string) {
    try {
      const userToken = await this.firestoreService.getUserToken(userId);
      
      if (!userToken) {
        return {
          success: false,
          message: 'User not found',
          data: null,
        };
      }

      return {
        success: true,
        message: 'User token retrieved successfully',
        data: userToken,
      };
    } catch (error) {
      return {
        success: false,
        message: (error as Error).message,
        data: null,
      };
    }
  }
} 