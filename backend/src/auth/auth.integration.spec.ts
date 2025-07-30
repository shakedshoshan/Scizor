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
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AuthModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/auth (GET)', () => {
    return request(app.getHttpServer())
      .get('/auth')
      .expect(200);
  });
}); 