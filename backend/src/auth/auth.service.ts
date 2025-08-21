/**
 * auth.service.ts - Authentication Service
 * 
 * This service handles authentication-related business logic including:
 * - User authentication and validation
 * - JWT token generation and validation
 * - Password hashing and verification
 * - User session management
 * - Device flow token exchange with PKCE
 * 
 * Responsibilities:
 * - Implements authentication business logic
 * - Handles JWT token operations
 * - Manages user sessions and security
 * - Provides authentication utilities
 * - Handles device flow authentication with PKCE
 */

import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { DeviceTokenExchangeDto, DeviceTokenRefreshDto, DeviceTokenResponseDto } from './dto/device-token.dto';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  
  private readonly JWT_SECRET: string;
  private readonly JWT_EXPIRES_IN = '1h';
  private readonly REFRESH_TOKEN_EXPIRES_IN = '7d';
  private readonly CONSENT_TOKEN_EXPIRES_IN = '10m'; // 10 minutes for consent tokens
  
  // In-memory storage for PKCE challenges (in production, use Redis or database)
  private readonly pkceChallenges = new Map<string, { codeVerifier: string; expiresAt: number }>();

  constructor() {
    const secret = process.env.JWT_SECRET;
    if (!secret || secret === 'your-secret-key') {
      throw new Error('JWT_SECRET environment variable must be set with a strong secret key (minimum 32 characters)');
    }
    this.JWT_SECRET = secret;
  }

  /**
   * Generate JWT consent token for device flow
   */
  generateConsentToken(userId: string, userEmail: string, userName?: string, codeChallenge?: string): string {
    const payload = {
      userId,
      userEmail,
      userName: userName || userEmail.split('@')[0],
      type: 'consent',
      codeChallenge // Include code challenge for PKCE validation
    };
    
    return jwt.sign(payload, this.JWT_SECRET, { 
      algorithm: 'HS256',
      expiresIn: '10m'
    });
  }

  /**
   * Verify and decode JWT consent token
   */
  verifyConsentToken(token: string): any {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET, { 
        algorithms: ['HS256'],
        clockTolerance: 30 // Allow 30 seconds of clock drift
      }) as any;
      
      if (decoded.type !== 'consent') {
        throw new Error(`Invalid token type. Expected 'consent', got '${decoded.type}'`);
      }
      return decoded;
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        throw new Error(`Invalid consent token: ${error.message}`);
      } else if (error.name === 'TokenExpiredError') {
        throw new Error(`Consent token expired: ${error.message}`);
      } else {
        throw new Error(`Consent token verification failed: ${error.message}`);
      }
    }
  }

  /**
   * Store PKCE challenge for validation (not required when comparing directly)
   */
  storePKCEChallenge(codeChallenge: string, codeVerifier: string): void {
    const expiresAt = Date.now() + (10 * 60 * 1000); // 10 minutes
    this.pkceChallenges.set(codeChallenge, { codeVerifier, expiresAt });
    this.cleanupExpiredPKCEChallenges();
  }

  /**
   * Validate PKCE: compute challenge from code_verifier and compare
   */
  validatePKCEChallenge(codeChallenge: string, codeVerifier: string): boolean {
    const expectedChallenge = this.generateCodeChallenge(codeVerifier);
    return expectedChallenge === codeChallenge;
  }

  /**
   * Generate code challenge from code verifier (PKCE)
   */
  private generateCodeChallenge(codeVerifier: string): string {
    const hash = crypto.createHash('sha256');
    hash.update(codeVerifier);
    return hash.digest('base64url');
  }

  /**
   * Clean up expired PKCE challenges (only used if storePKCEChallenge is used)
   */
  private cleanupExpiredPKCEChallenges(): void {
    const now = Date.now();
    for (const [challenge, data] of this.pkceChallenges.entries()) {
      if (now > data.expiresAt) {
        this.pkceChallenges.delete(challenge);
      }
    }
  }

  /**
   * Exchange authorization code for tokens (device flow with PKCE)
   */
  async exchangeDeviceToken(deviceTokenDto: DeviceTokenExchangeDto): Promise<DeviceTokenResponseDto> {
    try {
      // Validate PKCE challenge
      if (!deviceTokenDto.code_verifier || !deviceTokenDto.redirect_uri) {
        throw new BadRequestException('Missing required parameters: code_verifier and redirect_uri');
      }

      if (deviceTokenDto.consent_token) {
        // Handle JWT consent token with PKCE validation
        const decoded = this.verifyConsentToken(deviceTokenDto.consent_token);
        
        if (!decoded) {
          throw new UnauthorizedException('Invalid consent token');
        }

        // Validate PKCE challenge embedded in token against provided verifier
        if (decoded.codeChallenge) {
          if (!this.validatePKCEChallenge(decoded.codeChallenge, deviceTokenDto.code_verifier)) {
            throw new UnauthorizedException('Invalid PKCE challenge');
          }
        }

        const userId = decoded.userId;
        
        // Generate tokens
        const accessToken = this.generateAccessToken(userId);
        const refreshToken = this.generateRefreshToken(userId);
        const expiresIn = this.getTokenExpiryTime();

        console.log('\n🎯 TOKEN EXCHANGE COMPLETED (Consent Token):');
        console.log('==================================================');
        console.log(`User ID: ${userId}`);
        console.log(`Access Token: ${accessToken}`);
        console.log(`Refresh Token: ${refreshToken}`);
        console.log(`Expires In: ${expiresIn} seconds`);
        console.log('==================================================\n');

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
          throw new UnauthorizedException('Invalid authorization code');
        }

        // Generate tokens
        const accessToken = this.generateAccessToken(userId);
        const refreshToken = this.generateRefreshToken(userId);
        const expiresIn = this.getTokenExpiryTime();

        console.log('\n🎯 TOKEN EXCHANGE COMPLETED (Auth Code):');
        console.log('==================================================');
        console.log(`User ID: ${userId}`);
        console.log(`Access Token: ${accessToken}`);
        console.log(`Refresh Token: ${refreshToken}`);
        console.log(`Expires In: ${expiresIn} seconds`);
        console.log('==================================================\n');

        return {
          access_token: accessToken,
          refresh_token: refreshToken,
          user_id: userId,
          expires_in: expiresIn,
          token_type: 'Bearer'
        };
      } else {
        throw new BadRequestException('No consent token or authorization code provided');
      }
    } catch (error) {
      if (error instanceof UnauthorizedException || error instanceof BadRequestException) {
        throw error;
      }
      throw new UnauthorizedException(`Token exchange failed: ${error.message}`);
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshDeviceToken(refreshDto: DeviceTokenRefreshDto): Promise<Partial<DeviceTokenResponseDto>> {
    try {
      // Verify refresh token with consistent options
      const payload = jwt.verify(refreshDto.refresh_token, this.JWT_SECRET, { 
        algorithms: ['HS256'],
        clockTolerance: 30
      }) as any;
      
      const userId = payload.userId;

      if (!userId || payload.type !== 'refresh') {
        throw new UnauthorizedException(`Invalid refresh token. Expected type 'refresh', got '${payload.type}'`);
      }

      // Generate new access token
      const accessToken = this.generateAccessToken(userId);
      const expiresIn = this.getTokenExpiryTime();

      console.log('\n🔄 TOKEN REFRESH COMPLETED:');
      console.log('==================================================');
      console.log(`User ID: ${userId}`);
      console.log(`New Access Token: ${accessToken}`);
      console.log(`Expires In: ${expiresIn} seconds`);
      console.log('==================================================\n');

      return {
        access_token: accessToken,
        expires_in: expiresIn,
        token_type: 'Bearer'
      };
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException(`Invalid refresh token: ${error.message}`);
      } else if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException(`Refresh token expired: ${error.message}`);
      } else {
        throw new UnauthorizedException(`Token refresh failed: ${error.message}`);
      }
    }
  }

  /**
   * Generate access token
   */
  private generateAccessToken(userId: string): string {
    const payload = {
      userId,
      type: 'access'
    };
    
    // Use expiresIn option instead of manual iat/exp to avoid timing issues
    const token = jwt.sign(payload, this.JWT_SECRET, { 
      algorithm: 'HS256',
      expiresIn: '1h'
    });
    
    // Log the generated token for debugging/testing
    console.log('\n🔑 GENERATED ACCESS TOKEN:');
    console.log('==================================================');
    console.log(token);
    console.log('==================================================');
    console.log(`User ID: ${userId}`);
    console.log(`Token Type: access`);
    console.log(`Expires: 1 hour from now`);
    console.log('Copy this token to use in Authorization header: Bearer <token>\n');
    
    return token;
  }

  /**
   * Generate refresh token
   */
  private generateRefreshToken(userId: string): string {
    const payload = {
      userId,
      type: 'refresh'
    };
    
    // Use expiresIn option instead of manual iat/exp to avoid timing issues
    return jwt.sign(payload, this.JWT_SECRET, { 
      algorithm: 'HS256',
      expiresIn: '7d'
    });
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
   * Verify JWT access token
   * @param token - The JWT token to verify
   * @returns Decoded token payload
   */
  verifyAccessToken(token: string): any {
    try {
      // Verify token with explicit algorithm specification
      const decoded = jwt.verify(token, this.JWT_SECRET, { 
        algorithms: ['HS256'],
        clockTolerance: 30 // Allow 30 seconds of clock drift
      }) as any;
      
      // Validate token type (should be 'access' for API requests)
      if (decoded.type !== 'access') {
        throw new Error(`Invalid token type for API access. Expected 'access', got '${decoded.type}'`);
      }

      return decoded;
    } catch (error) {
      // Provide more specific error messages based on error type
      if (error.name === 'JsonWebTokenError') {
        throw new Error(`Invalid token: ${error.message}`);
      } else if (error.name === 'TokenExpiredError') {
        throw new Error(`Token expired: ${error.message}`);
      } else if (error.name === 'NotBeforeError') {
        throw new Error(`Token not active: ${error.message}`);
      } else {
        throw new Error(`Token verification failed: ${error.message}`);
      }
    }
  }

  /**
   * Debug method to test token generation and verification
   * This method is for debugging purposes only
   */
  debugJWT(): { success: boolean; message: string; data?: any } {
    try {
      const testUserId = 'test-user-123';
      
      // Generate a test token
      const token = this.generateAccessToken(testUserId);
      console.log('Generated test token:', token);
      
      // Immediately verify the same token
      const decoded = this.verifyAccessToken(token);
      console.log('Verified test token:', decoded);
      
      return {
        success: true,
        message: 'JWT generation and verification working correctly',
        data: {
          generated: token,
          decoded: decoded,
          jwtSecretLength: this.JWT_SECRET?.length
        }
      };
    } catch (error) {
      console.error('JWT debug error:', error);
      return {
        success: false,
        message: `JWT debug failed: ${error.message}`,
        data: {
          jwtSecretExists: !!this.JWT_SECRET,
          jwtSecretLength: this.JWT_SECRET?.length
        }
      };
    }
  }

  /**
   * Get token expiry time
   */
  private getTokenExpiryTime(): number {
    return Math.floor(Date.now() / 1000) + (60 * 60); // 1 hour from now
  }
} 