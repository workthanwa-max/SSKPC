import { Request, Response, NextFunction } from 'express';
import { LocationsService } from '../services/locations.service';
import { LocationSchema } from '../dtos/locations.dto';
import { z } from 'zod';

export class LocationsController {
  constructor(private locationsService: LocationsService) {}

  createLocation = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = LocationSchema.parse(req.body);
      const userId = req.user.userId;
      const location = await this.locationsService.createLocation(userId, data);
      res.status(201).json({ success: true, data: location });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, error: error.issues[0].message });
      }
      next(error);
    }
  };

  updateLocation = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = LocationSchema.parse(req.body);
      const userId = req.user.userId;
      const location = await this.locationsService.updateLocation(userId, data);
      res.status(200).json({ success: true, data: location });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, error: error.issues[0].message });
      }
      next(error);
    }
  };

  updateMyStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { isReady } = req.body;
      if (typeof isReady !== 'boolean') {
        return res.status(400).json({ success: false, error: 'isReady must be a boolean' });
      }
      const userId = req.user.userId;
      const location = await this.locationsService.updateStatus(userId, isReady);
      res.status(200).json({ success: true, data: location });
    } catch (error) {
      next(error);
    }
  };

  getMyLocation = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user.userId;
      const location = await this.locationsService.getMySection(userId);
      res.status(200).json({ success: true, data: location });
    } catch (error) {
      next(error);
    }
  };

  getAllLocations = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const locations = await this.locationsService.getAllLocations();
      res.status(200).json({ success: true, data: locations });
    } catch (error) {
      next(error);
    }
  };
}
