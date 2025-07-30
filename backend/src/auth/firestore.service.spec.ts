/**
 * firestore.service.spec.ts - Firestore Service Tests
 * 
 * This file contains unit tests for the Firestore service
 */

import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { FirestoreService } from './firestore.service';
import { CreateTextDto, ActionType } from './dto/text.dto';

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
    expect(mockCollection).toHaveBeenCalledWith('text');
    expect(mockAdd).toHaveBeenCalledWith({
      ...mockData,
      created_at: expect.any(Object),
      updated_at: expect.any(Object),
    });
  });
}); 