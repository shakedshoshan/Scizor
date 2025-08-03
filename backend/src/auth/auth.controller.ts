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
 * 
 * Responsibilities:
 * - Defines authentication API endpoints
 * - Handles request/response validation
 * - Delegates business logic to auth service
 */

import { Controller, Post, Body, HttpStatus, HttpCode, Get, Param } from '@nestjs/common';
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

  /**
   * POST /auth/user
   * Create a new user with 0 tokens
   */
  @Post('create-user-token')
  @HttpCode(HttpStatus.CREATED)
  async createUser(@Body() createUserDto: CreateUserTokenDto) {
    try {
      const documentId = await this.firestoreService.createUser(createUserDto);
      
      return {
        success: true,
        message: 'User created successfully with 0 tokens',
        data: {
          document_id: documentId,
          user_id: createUserDto.user_id,
          tokens: 0,
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
        message: error.message,
        data: null,
      };
    }
  }

  /**
   * POST /auth/device/token
   * Exchange authorization code for tokens (device flow)
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
        message: error.message,
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
        message: error.message,
        data: null,
      };
    }
  }
} 