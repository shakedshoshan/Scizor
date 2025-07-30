/**
 * auth.controller.spec.ts - Authentication Controller Tests
 * 
 * This file contains unit tests for the authentication controller
 */

import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { FirestoreService } from './firestore.service';

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            // Add mock methods if needed
          },
        },
        {
          provide: FirestoreService,
          useValue: {
            addTextDocument: jest.fn().mockResolvedValue('test-doc-id'),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
}); 