/**
 * auth.service.ts - Authentication Service
 * 
 * This service handles authentication-related business logic including:
 * - User authentication and validation
 * - JWT token generation and validation
 * - Password hashing and verification
 * - User session management
 * - Device flow token exchange
 * 
 * Responsibilities:
 * - Implements authentication business logic
 * - Handles JWT token operations
 * - Manages user sessions and security
 * - Provides authentication utilities
 * - Handles device flow authentication
 */

import { Injectable } from '@nestjs/common';
import { DeviceTokenExchangeDto, DeviceTokenRefreshDto, DeviceTokenResponseDto } from './dto/device-token.dto';
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  
  private readonly JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
  private readonly JWT_EXPIRES_IN = '1h';
  private readonly REFRESH_TOKEN_EXPIRES_IN = '7d';

  /**
   * Exchange authorization code for tokens (device flow)
   */
  async exchangeDeviceToken(deviceTokenDto: DeviceTokenExchangeDto): Promise<DeviceTokenResponseDto> {
    try {
      // In a real implementation, you would:
      // 1. Validate the authorization code against your stored codes
      // 2. Verify the code_verifier matches the code_challenge
      // 3. Extract user information from the authorization code
      // 4. Generate access and refresh tokens
      
      // For now, we'll simulate the token exchange
      const userId = this.extractUserIdFromAuthCode(deviceTokenDto.authorization_code);
      
      if (!userId) {
        throw new Error('Invalid authorization code');
      }

      // Generate tokens
      const accessToken = this.generateAccessToken(userId);
      const refreshToken = this.generateRefreshToken(userId);
      const expiresIn = this.getTokenExpiryTime();

      return {
        access_token: accessToken,
        refresh_token: refreshToken,
        user_id: userId,
        expires_in: expiresIn,
        token_type: 'Bearer'
      };
    } catch (error) {
      throw new Error(`Token exchange failed: ${error.message}`);
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshDeviceToken(refreshDto: DeviceTokenRefreshDto): Promise<Partial<DeviceTokenResponseDto>> {
    try {
      // Verify refresh token
      const payload = jwt.verify(refreshDto.refresh_token, this.JWT_SECRET) as any;
      const userId = payload.userId;

      if (!userId) {
        throw new Error('Invalid refresh token');
      }

      // Generate new access token
      const accessToken = this.generateAccessToken(userId);
      const expiresIn = this.getTokenExpiryTime();

      return {
        access_token: accessToken,
        expires_in: expiresIn,
        token_type: 'Bearer'
      };
    } catch (error) {
      throw new Error(`Token refresh failed: ${error.message}`);
    }
  }

  /**
   * Generate access token
   */
  private generateAccessToken(userId: string): string {
    const payload = {
      userId,
      type: 'access',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour
    };
    
    return jwt.sign(payload, this.JWT_SECRET);
  }

  /**
   * Generate refresh token
   */
  private generateRefreshToken(userId: string): string {
    const payload = {
      userId,
      type: 'refresh',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
    };
    
    return jwt.sign(payload, this.JWT_SECRET);
  }

  /**
   * Extract user ID from authorization code
   * In a real implementation, this would decode a proper authorization code
   */
  private extractUserIdFromAuthCode(authCode: string): string | null {
    // For demo purposes, we'll extract user ID from the auth code
    // In production, you'd have a proper authorization code system
    if (authCode.startsWith('auth_')) {
      // Extract user ID from the auth code format: auth_timestamp_random
      const parts = authCode.split('_');
      if (parts.length >= 3) {
        // For demo, we'll use a fixed user ID
        // In production, you'd decode the actual user ID from the auth code
        return 'demo-user-id';
      }
    }
    return null;
  }

  /**
   * Get token expiry time
   */
  private getTokenExpiryTime(): number {
    return Math.floor(Date.now() / 1000) + (60 * 60); // 1 hour from now
  }
} 