import { Redis } from 'ioredis';
import config from '../../config';

export const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB || '0'),
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  reconnectOnError: (err: Error) => {
    const targetError = 'READONLY';
    if (err.message.includes(targetError)) {
      return true;
    }
    return false;
  },
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  }
};

// Create a Redis connection for BullMQ
export const redisClient = new Redis(redisConfig);

// Handle connection events
redisClient.on('connect', () => {
  console.log('Redis client connected');
});

redisClient.on('ready', () => {
  console.log('Redis client ready');
});

redisClient.on('error', (err: Error) => {
  console.error('Redis client error:', err);
});

redisClient.on('end', () => {
  console.log('Redis client connection closed');
});

// Handle process termination
process.on('SIGINT', () => {
  redisClient.quit();
  process.exit(0);
});

export default redisClient;