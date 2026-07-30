import { Request, Response, NextFunction } from 'express';
import { AnalyticsService } from '../services/analytics.service';

export class AnalyticsController {
  static async getBranchSurvival(req: Request, res: Response, next: NextFunction) {
    try {
      // req.user is set by requireAuth middleware
      const userId = req.user!.userId;
      const data = await AnalyticsService.getBranchSurvivalAnalytics(userId);
      res.json({ data });
    } catch (error) {
      next(error);
    }
  }

  static async getCentralSurvival(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AnalyticsService.getCentralSurvivalAnalytics();
      res.json({ data });
    } catch (error) {
      next(error);
    }
  }

  // ---------------------------------------------------------
  // NEW REPORTS (Analytics Module Expansion)
  // ---------------------------------------------------------

  static async getCentralStockReport(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AnalyticsService.getCentralStockReport();
      res.json({ data });
    } catch (error) {
      next(error);
    }
  }

  static async getCentralNetworkStats(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AnalyticsService.getCentralEvacueeStats();
      res.json({ data });
    } catch (error) {
      next(error);
    }
  }

  static async getBranchStockReport(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const data = await AnalyticsService.getBranchStockReport(userId);
      res.json({ data });
    } catch (error) {
      next(error);
    }
  }

  static async getBranchEvacueeStats(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const data = await AnalyticsService.getBranchEvacueeStats(userId);
      res.json({ data });
    } catch (error) {
      next(error);
    }
  }
}
