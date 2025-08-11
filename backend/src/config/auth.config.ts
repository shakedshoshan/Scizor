/**
 * auth.config.ts - Authentication Configuration
 * 
 * This file contains secure configuration for authentication including:
 * - JWT secrets and algorithms
 * - PKCE configuration
 * - Rate limiting settings
 * - Security headers
 */

export const authConfig = {
  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || (() => {
      throw new Error('JWT_SECRET environment variable must be set with a strong secret key (minimum 32 characters)');
    })(),
    algorithms: ['HS256'] as const,
    accessTokenExpiry: '1h',
    refreshTokenExpiry: '7d',
    consentTokenExpiry: '10m',
  },

  // PKCE Configuration
  pkce: {
    codeVerifierLength: 32,
    challengeMethod: 'S256',
    challengeExpiry: 10 * 60 * 1000, // 10 minutes in milliseconds
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
  },

  // CORS Configuration
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || [
      'http://localhost:3000',
      'http://localhost:8080'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  },

  // Security Headers
  security: {
    helmet: {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
    },
  },

  // Session Configuration
  session: {
    secret: process.env.SESSION_SECRET || (() => {
      throw new Error('SESSION_SECRET environment variable must be set');
    })(),
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'strict' as const,
    },
  },

  // Password Security
  password: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12'),
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
  },

  // Device Flow Configuration
  deviceFlow: {
    clientId: 'scizor-desktop-app',
    redirectUri: 'http://localhost:8080/callback',
    scope: 'openid email profile',
    responseType: 'code',
    codeChallengeMethod: 'S256',
  },
};

// Validation function to ensure all required environment variables are set
export function validateAuthConfig(): void {
  const requiredEnvVars = [
    'JWT_SECRET',
    'SESSION_SECRET',
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }

  // Validate JWT secret strength
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long');
  }

  // Validate session secret strength
  if (process.env.SESSION_SECRET && process.env.SESSION_SECRET.length < 32) {
    throw new Error('SESSION_SECRET must be at least 32 characters long');
  }
}
