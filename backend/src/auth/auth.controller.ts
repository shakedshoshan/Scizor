/**
 * auth.controller.ts - Authentication Controller
 * 
 * This controller handles authentication-related HTTP requests including:
 * - User login/logout endpoints
 * - Token refresh endpoints
 * - User registration endpoints
 * - Password reset endpoints
 * 
 * Responsibilities:
 * - Defines authentication API endpoints
 * - Handles request/response validation
 * - Delegates business logic to auth service
 */

import { Controller } from '@nestjs/common';

@Controller('auth')
export class AuthController {} 