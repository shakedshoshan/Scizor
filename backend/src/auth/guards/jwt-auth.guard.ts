/**
 * jwt-auth.guard.ts - JWT Authentication Guard
 * 
 * Guard that validates JWT tokens and extracts user information
 * for authenticated requests. Used to secure API endpoints.
 */

import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Access token is required');
    }

    try {
      const payload = this.verifyToken(token);
      
      // Attach user information to request object
      request.user = {
        userId: payload.userId,
        tokenType: payload.type,
        issuedAt: payload.iat,
        expiresAt: payload.exp
      };

      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const authHeader = request.headers.authorization;
    
    if (!authHeader) {
      return undefined;
    }

    const [type, token] = authHeader.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private verifyToken(token: string): any {
    try {
      // Validate token format (basic check)
      if (!token || typeof token !== 'string') {
        throw new Error('Token must be a valid string');
      }
      
      // Check if token has the basic JWT structure (header.payload.signature)
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Token must have 3 parts separated by dots');
      }
      
      return this.authService.verifyAccessToken(token);
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }
}
