/**
 * auth.integration.spec.ts - Authentication Integration Tests
 * 
 * This file contains integration tests for the authentication module
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AuthModule } from './auth.module';

describe('AuthModule (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    // Set JWT_SECRET environment variable
    process.env.JWT_SECRET = 'test-jwt-secret-key-that-is-at-least-32-characters-long';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AuthModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    // Clean up environment variable
    delete process.env.JWT_SECRET;
  });

  it('should initialize auth module successfully', () => {
    expect(app).toBeDefined();
    expect(app.get(AuthModule)).toBeDefined();
  });
}); 