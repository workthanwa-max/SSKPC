import { Request, Response, NextFunction } from 'express';
import { DashboardService } from '../services/dashboard.service';

export class DashboardController {
  private dashboardService: DashboardService;

  constructor() {
    this.dashboardService = new DashboardService();
  }

  getAdminOverview = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.dashboardService.getAdminOverview();
      res.json({
        success: true,
        data
      });
    } catch (error) {
      next(error);
    }
  };

  getCentralOverview = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.dashboardService.getCentralOverview();
      res.json({
        success: true,
        data
      });
    } catch (error) {
      next(error);
    }
  };

  getBranchOverview = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Security Check: Ensure tenant isolation
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }
      
      const data = await this.dashboardService.getBranchOverview(userId);
      res.json({
        success: true,
        data
      });
    } catch (error) {
      next(error);
    }
  };
}
