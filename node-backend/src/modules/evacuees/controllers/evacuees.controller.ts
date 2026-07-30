import { Request, Response, NextFunction } from 'express';
import { EvacueesService } from '../services/evacuees.service';
import { checkInSchema, checkOutSchema, updateCapacitySchema } from '../schemas/evacuee.schema';
import { AppError } from '../../../shared/exceptions/app-error';

export class EvacueesController {
  
  // ---------------------------------------------------------
  // BRANCH
  // ---------------------------------------------------------

  static async updateCapacity(req: Request, res: Response, next: NextFunction) {
    try {
      const { capacity, specInfo } = updateCapacitySchema.parse(req.body);
      const userId = req.user!.userId; // from auth middleware

      const result = await EvacueesService.updateLocationCapacity(userId, capacity, specInfo);
      res.json({ message: 'Capacity updated successfully', data: result });
    } catch (error) {
      next(error);
    }
  }

  static async checkIn(req: Request, res: Response, next: NextFunction) {
    try {
      const data = checkInSchema.parse(req.body);
      const userId = req.user!.userId;

      const result = await EvacueesService.checkIn(userId, data);
      res.status(201).json({ message: 'Checked in successfully', data: result });
    } catch (error) {
      next(error);
    }
  }

  static async checkOut(req: Request, res: Response, next: NextFunction) {
    try {
      const { identifier } = checkOutSchema.parse(req.body);
      const userId = req.user!.userId;

      const result = await EvacueesService.checkOut(userId, identifier);
      res.json({ message: 'Checked out successfully', data: result });
    } catch (error) {
      next(error);
    }
  }

  static async getBranchInShelter(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const result = await EvacueesService.getBranchEvacuees(userId, 'IN_SHELTER');
      res.json({ data: result });
    } catch (error) {
      next(error);
    }
  }

  static async getBranchHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const result = await EvacueesService.getBranchEvacuees(userId);
      res.json({ data: result });
    } catch (error) {
      next(error);
    }
  }

  static async getBranchDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const result = await EvacueesService.getBranchDashboard(userId);
      res.json({ data: result });
    } catch (error) {
      next(error);
    }
  }

  // ---------------------------------------------------------
  // CENTRAL
  // ---------------------------------------------------------

  static async getCentralDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await EvacueesService.getCentralDashboard();
      res.json({ data: result });
    } catch (error) {
      next(error);
    }
  }

  static async getCentralBranches(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await EvacueesService.getCentralBranches();
      res.json({ data: result });
    } catch (error) {
      next(error);
    }
  }

  static async getCentralBranchPeople(req: Request, res: Response, next: NextFunction) {
    try {
      const { branchId } = req.params;
      const result = await EvacueesService.getCentralBranchPeople(branchId as string);
      res.json({ data: result });
    } catch (error) {
      next(error);
    }
  }
}
