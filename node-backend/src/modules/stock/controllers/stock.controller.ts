import { Request, Response, NextFunction } from 'express';
import { StockService } from '../services/stock.service';
import { createCategorySchema, updateCategorySchema, createProductSchema, updateProductSchema, transactionSchema } from '../dtos/stock.dto';
import { BadRequestError } from '../../../shared/exceptions/app-error';
import { TransactionType } from '@prisma/client';

export class StockController {
  private stockService: StockService;

  constructor() {
    this.stockService = new StockService();
  }

  // --- Categories ---
  getCategories = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ownerId = req.user!.userId;
      const categories = await this.stockService.getCategories(ownerId);
      res.status(200).json({ success: true, data: categories });
    } catch (error) { next(error); }
  };

  createCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ownerId = req.user!.userId;
      const parsed = createCategorySchema.safeParse(req.body);
      if (!parsed.success) throw new BadRequestError((parsed.error as any).errors[0].message);
      const category = await this.stockService.createCategory(ownerId, parsed.data);
      res.status(201).json({ success: true, data: category });
    } catch (error) { next(error); }
  };

  updateCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ownerId = req.user!.userId;
      const parsed = updateCategorySchema.safeParse(req.body);
      if (!parsed.success) throw new BadRequestError((parsed.error as any).errors[0].message);
      const category = await this.stockService.updateCategory(req.params.id as string, ownerId, parsed.data);
      res.status(200).json({ success: true, data: category });
    } catch (error) { next(error); }
  };

  deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ownerId = req.user!.userId;
      await this.stockService.deleteCategory(req.params.id as string, ownerId);
      res.status(200).json({ success: true, message: 'Category deleted' });
    } catch (error) { next(error); }
  };

  // --- Products ---
  getProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ownerId = req.user!.userId;
      const categoryId = req.query.categoryId as string;
      const products = await this.stockService.getProducts(ownerId, categoryId);
      res.status(200).json({ success: true, data: products });
    } catch (error) { next(error); }
  };

  createProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ownerId = req.user!.userId;
      const parsed = createProductSchema.safeParse(req.body);
      if (!parsed.success) throw new BadRequestError((parsed.error as any).errors[0].message);
      const product = await this.stockService.createProduct(ownerId, parsed.data);
      res.status(201).json({ success: true, data: product });
    } catch (error) { next(error); }
  };

  updateProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ownerId = req.user!.userId;
      const parsed = updateProductSchema.safeParse(req.body);
      if (!parsed.success) throw new BadRequestError((parsed.error as any).errors[0].message);
      const product = await this.stockService.updateProduct(req.params.id as string, ownerId, parsed.data);
      res.status(200).json({ success: true, data: product });
    } catch (error) { next(error); }
  };

  deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ownerId = req.user!.userId;
      await this.stockService.deleteProduct(req.params.id as string, ownerId);
      res.status(200).json({ success: true, message: 'Product deleted' });
    } catch (error) { next(error); }
  };

  // --- Transactions ---
  getTransactions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ownerId = req.user!.userId;
      const type = req.query.type as TransactionType;
      const transactions = await this.stockService.getTransactions(ownerId, type);
      res.status(200).json({ success: true, data: transactions });
    } catch (error) { next(error); }
  };

  processInbound = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ownerId = req.user!.userId;
      const parsed = transactionSchema.safeParse(req.body);
      if (!parsed.success) throw new BadRequestError((parsed.error as any).errors[0].message);
      const result = await this.stockService.processInbound(ownerId, parsed.data);
      res.status(201).json({ success: true, data: result });
    } catch (error) { next(error); }
  };

  processOutbound = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ownerId = req.user!.userId;
      const parsed = transactionSchema.safeParse(req.body);
      if (!parsed.success) throw new BadRequestError((parsed.error as any).errors[0].message);
      const result = await this.stockService.processOutbound(ownerId, parsed.data);
      res.status(201).json({ success: true, data: result });
    } catch (error) { next(error); }
  };

  // --- Dashboard ---
  getDashboardOverview = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ownerId = req.user!.userId;
      const data = await this.stockService.getDashboardOverview(ownerId);
      res.status(200).json({ success: true, data });
    } catch (error) { next(error); }
  };

  // --- Central Only ---
  getBranchesOverview = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Must be central (protected by middleware route)
      const data = await this.stockService.getBranchesOverview();
      res.status(200).json({ success: true, data });
    } catch (error) { next(error); }
  };

  getBranchStock = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const branchId = req.params.branchId; // user id of the branch
      const categoryId = req.query.categoryId as string;
      const products = await this.stockService.getProducts(branchId as string, categoryId);
      res.status(200).json({ success: true, data: products });
    } catch (error) { next(error); }
  };
  
  getBranchTransactions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const branchId = req.params.branchId;
      const type = req.query.type as TransactionType;
      const transactions = await this.stockService.getTransactions(branchId as string, type);
      res.status(200).json({ success: true, data: transactions });
    } catch (error) { next(error); }
  };
}
