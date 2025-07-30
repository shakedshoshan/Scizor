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
  let authService: AuthService;
  let firestoreService: FirestoreService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            // Add mock methods as needed
          },
        },
        {
          provide: FirestoreService,
          useValue: {
            addTextDocument: jest.fn(),
            createUser: jest.fn(),
            getUserToken: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    firestoreService = module.get<FirestoreService>(FirestoreService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should have auth service', () => {
    expect(authService).toBeDefined();
  });

  it('should have firestore service', () => {
    expect(firestoreService).toBeDefined();
  });
}); 