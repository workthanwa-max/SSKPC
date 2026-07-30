import { Request, Response, NextFunction } from 'express';
import { MonitoringService } from '../services/monitoring.service';
import { getAuditLogsQuerySchema } from '../dtos/monitoring.dto';
import { BadRequestError } from '../../../shared/exceptions/app-error';

export class MonitoringController {
  private monitoringService: MonitoringService;

  constructor() {
    this.monitoringService = new MonitoringService();
  }

  getAuditLogs = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parseResult = getAuditLogsQuerySchema.safeParse(req.query);
      
      if (!parseResult.success) {
        throw new BadRequestError('Invalid query parameters');
      }

      const result = await this.monitoringService.getAuditLogs(parseResult.data);

      res.status(200).json({
        success: true,
        data: result.data,
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  };
}
