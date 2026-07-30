import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AuthRepository } from '../repositories/auth.repository';
import { RegisterDto, LoginDto } from '../dtos/auth.dto';
import { AppError, UnauthorizedError, BadRequestError } from '../../../shared/exceptions/app-error';

export class AuthService {
  private repository: AuthRepository;

  constructor() {
    this.repository = new AuthRepository();
  }

  async register(dto: RegisterDto) {
    // 1. Check if user already exists
    const existingUser = await this.repository.findByEmail(dto.email);
    if (existingUser) {
      throw new BadRequestError('Email is already registered');
    }

    // 2. Hash password (Cost factor 12 per security skill)
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(dto.password, saltRounds);

    // 3. Create user
    const newUser = await this.repository.createUser({
      email: dto.email,
      name: dto.name,
      password: hashedPassword
    });

    return newUser;
  }

  async login(dto: LoginDto) {
    // 1. Find user by email
    const user = await this.repository.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedError('Invalid credentials'); // Generic message for security
    }

    if (user.status === 'SUSPENDED') {
      throw new UnauthorizedError('Your account has been suspended. Please contact support.');
    }

    // 2. Verify password
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // 3. Generate tokens (Dual-token pattern)
    const payload = { userId: user.id, role: user.role };
    const accessTokenSecret = process.env.JWT_ACCESS_SECRET || 'secret';
    const refreshTokenSecret = process.env.JWT_REFRESH_SECRET || 'refresh-secret';

    const accessToken = jwt.sign(payload, accessTokenSecret, { expiresIn: '15m' }); // Short-lived
    const refreshToken = jwt.sign(payload, refreshTokenSecret, { expiresIn: '30d' }); // Long-lived (30 days)

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      accessToken,
      refreshToken
    };
  }

  async refreshTokens(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedError('No refresh token provided');
    }

    try {
      const secret = process.env.JWT_REFRESH_SECRET || 'refresh-secret';
      const decoded = jwt.verify(refreshToken, secret) as any;
      
      const user = await this.repository.findById(decoded.userId);
      if (!user) {
        throw new UnauthorizedError('User not found');
      }

      if (user.status === 'SUSPENDED') {
        throw new UnauthorizedError('Your account has been suspended. Please contact support.');
      }

      const payload = { userId: user.id, role: user.role };
      const accessTokenSecret = process.env.JWT_ACCESS_SECRET || 'secret';
      
      // We can also rotate the refresh token here for better security, 
      // but for standard 30-day requirement, just returning new access token is okay.
      const newAccessToken = jwt.sign(payload, accessTokenSecret, { expiresIn: '15m' });
      
      return {
        accessToken: newAccessToken,
        user
      };
    } catch (error) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }
  }
}
