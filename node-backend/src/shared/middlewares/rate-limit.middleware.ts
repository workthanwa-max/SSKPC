import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { redisClient } from '../../infrastructure/redis/redis.client';

// Use Redis only if explicitly configured (for production), otherwise use memory store
const getStore = () => {
  if (process.env.REDIS_URL) {
    return new RedisStore({
      sendCommand: (...args: string[]) => redisClient.call(args[0], ...args.slice(1)) as any,
    });
  }
  return undefined; // Falls back to express-rate-limit's default MemoryStore
};

export const apiLimiter = rateLimit({
  store: getStore(),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window`
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again after 15 minutes',
  },
});

export const publicLimiter = rateLimit({
  store: getStore(),
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'ขณะนี้มีผู้ใช้งานจำนวนมาก กรุณารอสักครู่ (Too many requests)',
  },
});
