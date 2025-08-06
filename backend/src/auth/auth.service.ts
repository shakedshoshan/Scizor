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
  private readonly CONSENT_TOKEN_EXPIRES_IN = '10m'; // 10 minutes for consent tokens

  /**
   * Generate JWT consent token for device flow
   */
  generateConsentToken(userId: string, userEmail: string, userName?: string): string {
    const payload = {
      userId,
      userEmail,
      userName: userName || userEmail.split('@')[0], // Use email prefix as default name
      type: 'consent',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (10 * 60) // 10 minutes
    };
    
    return jwt.sign(payload, this.JWT_SECRET);
  }

  /**
   * Verify and decode JWT consent token
   */
  verifyConsentToken(token: string): any {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as any;
      if (decoded.type !== 'consent') {
        throw new Error('Invalid token type');
      }
      return decoded;
    } catch (error) {
      throw new Error('Invalid consent token');
    }
  }

  /**
   * Exchange authorization code for tokens (device flow)
   */
  async exchangeDeviceToken(deviceTokenDto: DeviceTokenExchangeDto): Promise<DeviceTokenResponseDto> {
    try {
      // Check if this is a consent token or authorization code
      if (deviceTokenDto.consent_token) {
        // Handle JWT consent token
        const decoded = this.verifyConsentToken(deviceTokenDto.consent_token);
        
        if (!decoded) {
          throw new Error('Invalid consent token');
        }

        const userId = decoded.userId;
        
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
      } else if (deviceTokenDto.authorization_code) {
        // Handle legacy authorization code (for backward compatibility)
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
      } else {
        throw new Error('No consent token or authorization code provided');
      }
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