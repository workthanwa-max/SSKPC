import { Router } from 'express';
import { StockController } from './controllers/stock.controller';
import { authenticate } from '../../shared/middlewares/auth.middleware';
import { requireRole } from '../../shared/middlewares/role.middleware';
import { Role } from '@prisma/client';

export const stockRouter = Router();
const controller = new StockController();

// All routes require authentication
stockRouter.use(authenticate);

// Allow CENTRAL and BRANCH to manage their own stock
const manageStockRoles = [Role.CENTRAL, Role.BRANCH];

// --- Dashboard ---
stockRouter.get('/dashboard/overview', requireRole(manageStockRoles), controller.getDashboardOverview);

// --- Categories ---
stockRouter.get('/categories', requireRole(manageStockRoles), controller.getCategories);
stockRouter.post('/categories', requireRole(manageStockRoles), controller.createCategory);
stockRouter.put('/categories/:id', requireRole(manageStockRoles), controller.updateCategory);
stockRouter.delete('/categories/:id', requireRole(manageStockRoles), controller.deleteCategory);

// --- Products ---
stockRouter.get('/products', requireRole(manageStockRoles), controller.getProducts);
stockRouter.post('/products', requireRole(manageStockRoles), controller.createProduct);
stockRouter.put('/products/:id', requireRole(manageStockRoles), controller.updateProduct);
stockRouter.delete('/products/:id', requireRole(manageStockRoles), controller.deleteProduct);

// --- Transactions ---
stockRouter.get('/transactions', requireRole(manageStockRoles), controller.getTransactions);
stockRouter.post('/transactions/inbound', requireRole(manageStockRoles), controller.processInbound);
stockRouter.post('/transactions/outbound', requireRole(manageStockRoles), controller.processOutbound);

// --- Central Only Endpoints ---
const centralOnly = [Role.CENTRAL];
stockRouter.get('/central/branches', requireRole(centralOnly), controller.getBranchesOverview);
stockRouter.get('/central/branches/:branchId/products', requireRole(centralOnly), controller.getBranchStock);
stockRouter.get('/central/branches/:branchId/transactions', requireRole(centralOnly), controller.getBranchTransactions);
