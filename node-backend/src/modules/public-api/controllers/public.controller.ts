import { Request, Response, NextFunction } from 'express';
import { PublicService } from '../services/public.service';
import { z } from 'zod';
import { ForbiddenError } from '../../../shared/exceptions/app-error';

const NearbySchema = z.object({
  lat: z.number(),
  lng: z.number(),
});

export class PublicController {
  static async getNearbyShelters(req: Request, res: Response, next: NextFunction) {
    try {
      const { lat, lng } = NearbySchema.parse(req.body);

      // Geofencing for Thailand (Rough Bounding Box)
      // Lat: 5.61 to 20.46, Lng: 97.34 to 105.63
      if (lat < 5.61 || lat > 20.46 || lng < 97.34 || lng > 105.63) {
        throw new ForbiddenError('บริการนี้สงวนสิทธิ์เฉพาะพื้นที่ในประเทศไทยเพื่อความปลอดภัย');
      }

      const shelters = await PublicService.findNearbyShelters(lat, lng);
      res.status(200).json({ success: true, data: shelters });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, error: 'พิกัดไม่ถูกต้อง' });
      }
      next(error);
    }
  }
}
