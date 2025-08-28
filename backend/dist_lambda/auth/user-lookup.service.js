"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var UserLookupService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserLookupService = void 0;
const common_1 = require("@nestjs/common");
const admin = require("firebase-admin");
let UserLookupService = UserLookupService_1 = class UserLookupService {
    logger = new common_1.Logger(UserLookupService_1.name);
    async getUserIdByEmail(email) {
        try {
            this.logger.log(`Looking up user ID for email: ${email}`);
            const userRecord = await admin.auth().getUserByEmail(email);
            this.logger.log(`Found user ID: ${userRecord.uid} for email: ${email}`);
            return userRecord.uid;
        }
        catch (error) {
            if (error.code === 'auth/user-not-found') {
                this.logger.warn(`User not found for email: ${email}`);
                return null;
            }
            this.logger.error(`Error looking up user by email ${email}: ${error.message}`);
            throw error;
        }
    }
};
exports.UserLookupService = UserLookupService;
exports.UserLookupService = UserLookupService = UserLookupService_1 = __decorate([
    (0, common_1.Injectable)()
], UserLookupService);
//# sourceMappingURL=user-lookup.service.js.map