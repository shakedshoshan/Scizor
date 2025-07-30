/**
 * firestore.service.spec.ts - Firestore Service Tests
 * 
 * This file contains unit tests for the Firestore service
 */

import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { FirestoreService } from './firestore.service';
import { CreateTextDto, ActionType } from './dto/text.dto';
import { CreateUserTokenDto, UpdateUserTokenDto } from './dto/user-token.dto';

describe('FirestoreService', () => {
  let service: FirestoreService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FirestoreService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test-project-id'),
          },
        },
      ],
    }).compile();

    service = module.get<FirestoreService>(FirestoreService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should get firestore instance', () => {
    const firestore = service.getFirestore();
    expect(firestore).toBeDefined();
  });

  it('should add text document', async () => {
    const mockData: CreateTextDto = {
      user_id: 'test-user-123',
      action_type: ActionType.ENHANCE,
      text: 'Test text content',
    };

    // Mock the firestore add method
    const mockAdd = jest.fn().mockResolvedValue({ id: 'test-doc-id' });
    const mockCollection = jest.fn().mockReturnValue({ add: mockAdd });
    const mockFirestore = {
      collection: mockCollection,
    };

    // Mock the service's firestore property
    (service as any).firestore = mockFirestore;

    const result = await service.addTextDocument(mockData);

    expect(result).toBe('test-doc-id');
    expect(mockCollection).toHaveBeenCalledWith('texts');
    expect(mockAdd).toHaveBeenCalledWith({
      ...mockData,
      created_at: expect.any(Object),
      updated_at: expect.any(Object),
    });
  });

  it('should check if user exists', async () => {
    // Mock the firestore query methods
    const mockGet = jest.fn().mockResolvedValue({ empty: false });
    const mockLimit = jest.fn().mockReturnValue({ get: mockGet });
    const mockWhere = jest.fn().mockReturnValue({ limit: mockLimit });
    const mockCollection = jest.fn().mockReturnValue({ where: mockWhere });
    const mockFirestore = {
      collection: mockCollection,
    };

    // Mock the service's firestore property
    (service as any).firestore = mockFirestore;

    const result = await service.userExists('test-user-123');

    expect(result).toBe(true);
    expect(mockCollection).toHaveBeenCalledWith('user_token');
    expect(mockWhere).toHaveBeenCalledWith('user_id', '==', 'test-user-123');
  });

  it('should create user with 0 tokens', async () => {
    const mockData: CreateUserTokenDto = {
      user_id: 'test-user-123',
    };

    // Mock the userExists method to return false (user doesn't exist)
    jest.spyOn(service, 'userExists').mockResolvedValue(false);

    // Mock the firestore add method
    const mockAdd = jest.fn().mockResolvedValue({ id: 'test-doc-id' });
    const mockCollection = jest.fn().mockReturnValue({ add: mockAdd });
    const mockFirestore = {
      collection: mockCollection,
    };

    // Mock the service's firestore property
    (service as any).firestore = mockFirestore;

    const result = await service.createUser(mockData);

    expect(result).toBe('test-doc-id');
    expect(mockCollection).toHaveBeenCalledWith('user_token');
    expect(mockAdd).toHaveBeenCalledWith({
      user_id: mockData.user_id,
      tokens: 0,
      created_at: expect.any(Object),
      updated_at: expect.any(Object),
    });
  });

  it('should throw error when creating existing user', async () => {
    const mockData: CreateUserTokenDto = {
      user_id: 'test-user-123',
    };

    // Mock the userExists method to return true (user exists)
    jest.spyOn(service, 'userExists').mockResolvedValue(true);

    await expect(service.createUser(mockData)).rejects.toThrow('User already exists');
  });

  it('should update user token', async () => {
    const userId = 'test-user-123';
    const updateData: UpdateUserTokenDto = {
      tokens: 100,
    };

    // Mock the userExists method to return true (user exists)
    jest.spyOn(service, 'userExists').mockResolvedValue(true);

    // Mock the firestore query and update methods
    const mockUpdate = jest.fn().mockResolvedValue(undefined);
    const mockRef = { update: mockUpdate };
    const mockDoc = { ref: mockRef, data: () => ({ user_id: userId, tokens: 50 }) };
    const mockDocs = [mockDoc];
    const mockGet = jest.fn().mockResolvedValue({ empty: false, docs: mockDocs });
    const mockLimit = jest.fn().mockReturnValue({ get: mockGet });
    const mockWhere = jest.fn().mockReturnValue({ limit: mockLimit });
    const mockCollection = jest.fn().mockReturnValue({ where: mockWhere });
    const mockFirestore = {
      collection: mockCollection,
    };

    // Mock the service's firestore property
    (service as any).firestore = mockFirestore;

    const result = await service.updateUserToken(userId, updateData);

    expect(result).toEqual({
      user_id: userId,
      tokens: updateData.tokens,
    });
    expect(mockCollection).toHaveBeenCalledWith('user_token');
    expect(mockWhere).toHaveBeenCalledWith('user_id', '==', userId);
    expect(mockUpdate).toHaveBeenCalledWith({
      tokens: updateData.tokens,
      updated_at: expect.any(Object),
    });
  });

  it('should throw error when updating non-existent user', async () => {
    const userId = 'test-user-123';
    const updateData: UpdateUserTokenDto = {
      tokens: 100,
    };

    // Mock the userExists method to return false (user doesn't exist)
    jest.spyOn(service, 'userExists').mockResolvedValue(false);

    await expect(service.updateUserToken(userId, updateData)).rejects.toThrow('User not found');
  });
}); 