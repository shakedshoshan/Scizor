/**
 * rate-limit.middleware.ts - Rate Limiting Middleware
 * 
 * This middleware provides rate limiting functionality to protect against:
 * - Brute force attacks
 * - DDoS attacks
 * - API abuse
 * 
 * It uses an in-memory store for simplicity, but in production should use Redis
 */

import { Injectable, NestMiddleware, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { authConfig } from '../../config/auth.config';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private store: RateLimitStore = {};
  private readonly windowMs = authConfig.rateLimit.windowMs;
  private readonly maxRequests = authConfig.rateLimit.maxRequests;

  use(req: Request, res: Response, next: NextFunction) {
    const key = this.getClientIdentifier(req);
    const now = Date.now();

    // Clean up expired entries
    this.cleanupExpiredEntries(now);

    // Get or create rate limit entry for this client
    if (!this.store[key]) {
      this.store[key] = {
        count: 0,
        resetTime: now + this.windowMs,
      };
    }

    const entry = this.store[key];

    // Check if window has reset
    if (now > entry.resetTime) {
      entry.count = 0;
      entry.resetTime = now + this.windowMs;
    }

    // Check if limit exceeded
    if (entry.count >= this.maxRequests) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
      
      res.setHeader('Retry-After', retryAfter);
      res.setHeader('X-RateLimit-Limit', this.maxRequests);
      res.setHeader('X-RateLimit-Remaining', 0);
      res.setHeader('X-RateLimit-Reset', new Date(entry.resetTime).toISOString());
      
      throw new HttpException(
        {
          success: false,
          message: 'Rate limit exceeded. Please try again later.',
          data: null,
          retryAfter,
        },
        HttpStatus.TOO_MANY_REQUESTS
      );
    }

    // Increment counter
    entry.count++;

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', this.maxRequests);
    res.setHeader('X-RateLimit-Remaining', this.maxRequests - entry.count);
    res.setHeader('X-RateLimit-Reset', new Date(entry.resetTime).toISOString());

    next();
  }

  /**
   * Get client identifier for rate limiting
   * In production, you might want to use IP address, user ID, or a combination
   */
  private getClientIdentifier(req: Request): string {
    // Use IP address as primary identifier
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    
    // For authenticated requests, include user ID
    const userId = (req as any).user?.id;
    if (userId) {
      return `${ip}:${userId}`;
    }
    
    // For specific endpoints, use endpoint as part of the key
    const endpoint = req.route?.path || req.path;
    if (endpoint.includes('/auth/')) {
      return `${ip}:auth`;
    }
    
    return ip;
  }

  /**
   * Clean up expired rate limit entries
   */
  private cleanupExpiredEntries(now: number): void {
    Object.keys(this.store).forEach(key => {
      if (now > this.store[key].resetTime) {
        delete this.store[key];
      }
    });
  }

  /**
   * Reset rate limit for a specific client (useful for testing)
   */
  resetClientLimit(identifier: string): void {
    delete this.store[identifier];
  }

  /**
   * Get current rate limit status for a client
   */
  getClientStatus(identifier: string): { count: number; resetTime: number } | null {
    return this.store[identifier] || null;
  }
}
