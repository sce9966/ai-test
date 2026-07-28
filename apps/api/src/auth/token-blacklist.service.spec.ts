import { Test, TestingModule } from '@nestjs/testing';
import { TokenBlacklistService } from './token-blacklist.service';
import { RedisService } from '../redis/redis.service';

describe('TokenBlacklistService', () => {
  let service: TokenBlacklistService;
  const redisClient = {
    set: jest.fn().mockResolvedValue('OK'),
    get: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenBlacklistService,
        {
          provide: RedisService,
          useValue: {
            getClient: () => redisClient,
          },
        },
      ],
    }).compile();

    service = module.get(TokenBlacklistService);
  });

  it('add 应以 EX TTL 写入黑名单 key', async () => {
    await service.add('abc', 120);
    expect(redisClient.set).toHaveBeenCalledWith('auth:blacklist:abc', '1', 'EX', 120);
  });

  it('isBlacklisted 在 key 存在时应返回 true', async () => {
    redisClient.get.mockResolvedValue('1');
    await expect(service.isBlacklisted('abc')).resolves.toBe(true);
  });

  it('isBlacklisted 在 key 不存在时应返回 false', async () => {
    redisClient.get.mockResolvedValue(null);
    await expect(service.isBlacklisted('abc')).resolves.toBe(false);
  });
});
