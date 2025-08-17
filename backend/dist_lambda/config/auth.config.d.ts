export declare const authConfig: {
    jwt: {
        secret: string;
        algorithms: readonly ["HS256"];
        accessTokenExpiry: string;
        refreshTokenExpiry: string;
        consentTokenExpiry: string;
    };
    pkce: {
        codeVerifierLength: number;
        challengeMethod: string;
        challengeExpiry: number;
    };
    rateLimit: {
        windowMs: number;
        maxRequests: number;
        skipSuccessfulRequests: boolean;
        skipFailedRequests: boolean;
    };
    cors: {
        origin: string[];
        credentials: boolean;
        methods: string[];
        allowedHeaders: string[];
    };
    security: {
        helmet: {
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: string[];
                    styleSrc: string[];
                    scriptSrc: string[];
                    imgSrc: string[];
                };
            };
            hsts: {
                maxAge: number;
                includeSubDomains: boolean;
                preload: boolean;
            };
        };
    };
    session: {
        secret: string;
        resave: boolean;
        saveUninitialized: boolean;
        cookie: {
            secure: boolean;
            httpOnly: boolean;
            maxAge: number;
            sameSite: "strict";
        };
    };
    password: {
        bcryptRounds: number;
        minLength: number;
        requireUppercase: boolean;
        requireLowercase: boolean;
        requireNumbers: boolean;
        requireSpecialChars: boolean;
    };
    deviceFlow: {
        clientId: string;
        redirectUri: string;
        scope: string;
        responseType: string;
        codeChallengeMethod: string;
    };
};
export declare function validateAuthConfig(): void;
