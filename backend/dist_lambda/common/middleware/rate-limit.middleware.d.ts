import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
export declare class RateLimitMiddleware implements NestMiddleware {
    private store;
    private readonly windowMs;
    private readonly maxRequests;
    use(req: Request, res: Response, next: NextFunction): void;
    private getClientIdentifier;
    private cleanupExpiredEntries;
    resetClientLimit(identifier: string): void;
    getClientStatus(identifier: string): {
        count: number;
        resetTime: number;
    } | null;
}
