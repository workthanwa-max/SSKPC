import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { registerSchema, loginSchema } from '../dtos/auth.dto';
import { BadRequestError } from '../../../shared/exceptions/app-error';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  // Use arrow functions to bind 'this' automatically
  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Input Validation
      const parseResult = registerSchema.safeParse(req.body);
      if (!parseResult.success) {
        throw new BadRequestError(`Validation failed: ${(parseResult.error as any).errors.map((e: any) => e.message).join(', ')}`);
      }

      const user = await this.authService.register(parseResult.data);
      
      res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: user
      });
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    // Import at function level to avoid circular dependencies during initialization if any
    const { AuditLogService } = require('../../../shared/services/audit-log.service');
    const ipAddress = req.ip;

    try {
      // Input Validation
      const parseResult = loginSchema.safeParse(req.body);
      if (!parseResult.success) {
        throw new BadRequestError(`Validation failed: ${(parseResult.error as any).errors.map((e: any) => e.message).join(', ')}`);
      }

      const result = await this.authService.login(parseResult.data);

      // Log successful login
      await AuditLogService.log('LOGIN_SUCCESS', { email: parseResult.data.email }, result.user.id, ipAddress);

      // Set Refresh Token as HTTPOnly, Secure Cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
      });

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: result.user,
          accessToken: result.accessToken
        }
      });
    } catch (error) {
      // Log failed login
      if (req.body && req.body.email) {
        const { AuditLogService } = require('../../../shared/services/audit-log.service');
        await AuditLogService.log('LOGIN_FAILED', { email: req.body.email, error: (error as Error).message }, undefined, ipAddress);
      }
      next(error);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 1. Clear refresh token cookie
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      });
      
      // 2. Blacklist the current access token (Zero-Trust)
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        // Import redisClient dynamically or ensure it's imported at the top. We will import at the top later, but for now we require it if not imported.
        const { redisClient } = require('../../../infrastructure/redis/redis.client');
        
        // Access token normally expires in 15m (900s), we just set TTL to 900s to be safe
        await redisClient.set(`bl_${token}`, 'revoked', 'EX', 900);
      }

      res.status(200).json({
        success: true,
        message: 'Logout successful'
      });
    } catch (error) {
      next(error);
    }
  };

  refresh = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.cookies;
      
      const result = await this.authService.refreshTokens(refreshToken);

      res.status(200).json({
        success: true,
        message: 'Token refreshed',
        data: {
          user: result.user,
          accessToken: result.accessToken
        }
      });
    } catch (error) {
      next(error);
    }
  };

  getMe = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // req.user is set by auth middleware
      res.status(200).json({
        success: true,
        data: {
          user: req.user
        }
      });
    } catch (error) {
      next(error);
    }
  };
}
