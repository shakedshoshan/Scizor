"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimitMiddleware = void 0;
const common_1 = require("@nestjs/common");
const auth_config_1 = require("../../config/auth.config");
let RateLimitMiddleware = class RateLimitMiddleware {
    store = {};
    windowMs = auth_config_1.authConfig.rateLimit.windowMs;
    maxRequests = auth_config_1.authConfig.rateLimit.maxRequests;
    use(req, res, next) {
        const key = this.getClientIdentifier(req);
        const now = Date.now();
        this.cleanupExpiredEntries(now);
        if (!this.store[key]) {
            this.store[key] = {
                count: 0,
                resetTime: now + this.windowMs,
            };
        }
        const entry = this.store[key];
        if (now > entry.resetTime) {
            entry.count = 0;
            entry.resetTime = now + this.windowMs;
        }
        if (entry.count >= this.maxRequests) {
            const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
            res.setHeader('Retry-After', retryAfter);
            res.setHeader('X-RateLimit-Limit', this.maxRequests);
            res.setHeader('X-RateLimit-Remaining', 0);
            res.setHeader('X-RateLimit-Reset', new Date(entry.resetTime).toISOString());
            throw new common_1.HttpException({
                success: false,
                message: 'Rate limit exceeded. Please try again later.',
                data: null,
                retryAfter,
            }, common_1.HttpStatus.TOO_MANY_REQUESTS);
        }
        entry.count++;
        res.setHeader('X-RateLimit-Limit', this.maxRequests);
        res.setHeader('X-RateLimit-Remaining', this.maxRequests - entry.count);
        res.setHeader('X-RateLimit-Reset', new Date(entry.resetTime).toISOString());
        next();
    }
    getClientIdentifier(req) {
        const ip = req.ip || req.connection.remoteAddress || 'unknown';
        const userId = req.user?.id;
        if (userId) {
            return `${ip}:${userId}`;
        }
        const endpoint = req.route?.path || req.path;
        if (endpoint.includes('/auth/')) {
            return `${ip}:auth`;
        }
        return ip;
    }
    cleanupExpiredEntries(now) {
        Object.keys(this.store).forEach(key => {
            if (now > this.store[key].resetTime) {
                delete this.store[key];
            }
        });
    }
    resetClientLimit(identifier) {
        delete this.store[identifier];
    }
    getClientStatus(identifier) {
        return this.store[identifier] || null;
    }
};
exports.RateLimitMiddleware = RateLimitMiddleware;
exports.RateLimitMiddleware = RateLimitMiddleware = __decorate([
    (0, common_1.Injectable)()
], RateLimitMiddleware);
//# sourceMappingURL=rate-limit.middleware.js.map