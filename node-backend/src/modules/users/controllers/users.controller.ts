import { Request, Response, NextFunction } from 'express';
import { UsersService } from '../services/users.service';
import { createUserSchema, updateUserStatusSchema } from '../dtos/users.dto';

export class UsersController {
  private usersService: UsersService;

  constructor() {
    this.usersService = new UsersService();
  }

  getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await this.usersService.getAllUsers();
      res.status(200).json({ success: true, data: users });
    } catch (error) {
      next(error);
    }
  };

  createUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validation = createUserSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ success: false, error: (validation.error as any).errors[0].message });
      }

      const user = await this.usersService.createUser(validation.data);
      res.status(201).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  };

  updateUserStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const validation = updateUserStatusSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ success: false, error: (validation.error as any).errors[0].message });
      }

      const updated = await this.usersService.updateUserStatus(id as string, validation.data);
      res.status(200).json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  };

  resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const result = await this.usersService.resetPassword(id as string);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };
}
