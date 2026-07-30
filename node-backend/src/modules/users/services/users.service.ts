import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { UsersRepository } from '../repositories/users.repository';
import { CreateUserDto, UpdateUserStatusDto } from '../dtos/users.dto';
import { AppError, BadRequestError, NotFoundError } from '../../../shared/exceptions/app-error';

export class UsersService {
  private repository: UsersRepository;

  constructor() {
    this.repository = new UsersRepository();
  }

  async getAllUsers() {
    return this.repository.findAll();
  }

  async createUser(dto: CreateUserDto) {
    const existingUser = await this.repository.findByEmail(dto.email);
    if (existingUser) {
      throw new BadRequestError('Email is already in use');
    }

    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(dto.password, saltRounds);

    return this.repository.create({
      ...dto,
      password: hashedPassword,
    });
  }

  async updateUserStatus(id: string, dto: UpdateUserStatusDto) {
    const user = await this.repository.findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    return this.repository.updateStatus(id, dto.status as any);
  }

  async resetPassword(id: string) {
    const user = await this.repository.findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Generate secure random password
    const rawPassword = crypto.randomBytes(8).toString('hex') + '!A1'; 
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(rawPassword, saltRounds);

    await this.repository.updatePassword(id, hashedPassword);

    return {
      newPassword: rawPassword,
    };
  }
}
