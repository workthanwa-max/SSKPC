import { StockRepository } from '../repositories/stock.repository';
import { BadRequestError, NotFoundError } from '../../../shared/exceptions/app-error';
import { TransactionType } from '@prisma/client';

export class StockService {
  private repository: StockRepository;

  constructor() {
    this.repository = new StockRepository();
  }

  // Categories
  async getCategories(ownerId: string) {
    return this.repository.getCategories(ownerId);
  }

  async createCategory(ownerId: string, data: { name: string; description?: string }) {
    return this.repository.createCategory({ ...data, ownerId });
  }

  async updateCategory(id: string, ownerId: string, data: any) {
    return this.repository.updateCategory(id, ownerId, data);
  }

  async deleteCategory(id: string, ownerId: string) {
    const category = await this.repository.getCategoryById(id, ownerId);
    if (!category) {
      throw new NotFoundError('Category not found');
    }
    if (category.isSystem) {
      throw new BadRequestError('Cannot delete a system fundamental category');
    }
    return this.repository.deleteCategory(id, ownerId);
  }

  // Products
  async getProducts(ownerId: string, categoryId?: string) {
    return this.repository.getProducts(ownerId, categoryId);
  }

  async createProduct(ownerId: string, data: { name: string; sku?: string; description?: string; unit: string; categoryId: string }) {
    return this.repository.createProduct({ ...data, ownerId });
  }

  async updateProduct(id: string, ownerId: string, data: any) {
    return this.repository.updateProduct(id, ownerId, data);
  }

  async deleteProduct(id: string, ownerId: string) {
    return this.repository.deleteProduct(id, ownerId);
  }

  // Transactions
  async getTransactions(ownerId: string, type?: TransactionType) {
    return this.repository.getTransactions(ownerId, type);
  }

  async processInbound(ownerId: string, data: { productId: string; quantity: number; note?: string }) {
    const product = await this.repository.getProductById(data.productId, ownerId);
    if (!product) {
      throw new NotFoundError('Product not found or access denied');
    }
    return this.repository.performInbound(data.productId, ownerId, data.quantity, data.note);
  }

  async processOutbound(ownerId: string, data: { productId: string; quantity: number; note?: string }) {
    const product = await this.repository.getProductById(data.productId, ownerId);
    if (!product) {
      throw new NotFoundError('Product not found or access denied');
    }
    if (product.quantity < data.quantity) {
      throw new BadRequestError(`Insufficient stock. Available: ${product.quantity}`);
    }
    try {
      return await this.repository.performOutbound(data.productId, ownerId, data.quantity, data.note);
    } catch (error: any) {
      throw new BadRequestError(error.message || 'Error processing outbound transaction');
    }
  }

  // Dashboard & Central
  async getDashboardOverview(ownerId: string) {
    return this.repository.getDashboardOverview(ownerId);
  }

  async getBranchesOverview() {
    const branches = await this.repository.getAllBranches();
    return branches.map(b => {
      const totalItems = b.stockProducts.reduce((sum, p) => sum + p.quantity, 0);
      return {
        id: b.id,
        name: b.name,
        email: b.email,
        location: b.location,
        totalItems
      };
    });
  }
}
