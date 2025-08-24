/**
 * auth.service.spec.ts - Authentication Service Tests
 * 
 * This file contains unit tests for the authentication service
 */

import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    // Set JWT_SECRET environment variable
    process.env.JWT_SECRET = 'test-jwt-secret-key-that-is-at-least-32-characters-long';

    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    // Clean up environment variable
    delete process.env.JWT_SECRET;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
}); 