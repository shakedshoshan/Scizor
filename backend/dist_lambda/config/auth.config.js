"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authConfig = void 0;
exports.validateAuthConfig = validateAuthConfig;
exports.authConfig = {
    jwt: {
        secret: process.env.JWT_SECRET || (() => {
            throw new Error('JWT_SECRET environment variable must be set with a strong secret key (minimum 32 characters)');
        })(),
        algorithms: ['HS256'],
        accessTokenExpiry: '1h',
        refreshTokenExpiry: '7d',
        consentTokenExpiry: '10m',
    },
    pkce: {
        codeVerifierLength: 32,
        challengeMethod: 'S256',
        challengeExpiry: 10 * 60 * 1000,
    },
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
        maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
        skipSuccessfulRequests: false,
        skipFailedRequests: false,
    },
    cors: {
        origin: process.env.CORS_ORIGIN?.split(',') || [
            'http://localhost:3000',
            'http://localhost:8080'
        ],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    },
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
    session: {
        secret: process.env.SESSION_SECRET || (() => {
            throw new Error('SESSION_SECRET environment variable must be set');
        })(),
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000,
            sameSite: 'strict',
        },
    },
    password: {
        bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12'),
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
    },
    deviceFlow: {
        clientId: 'scizor-desktop-app',
        redirectUri: 'http://localhost:8080/callback',
        scope: 'openid email profile',
        responseType: 'code',
        codeChallengeMethod: 'S256',
    },
};
function validateAuthConfig() {
    const requiredEnvVars = [
        'JWT_SECRET',
        'SESSION_SECRET',
    ];
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    if (missingVars.length > 0) {
        throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }
    if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
        throw new Error('JWT_SECRET must be at least 32 characters long');
    }
    if (process.env.SESSION_SECRET && process.env.SESSION_SECRET.length < 32) {
        throw new Error('SESSION_SECRET must be at least 32 characters long');
    }
}
//# sourceMappingURL=auth.config.js.map