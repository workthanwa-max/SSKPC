import { PrismaClient, TransactionType } from '@prisma/client';

const prisma = new PrismaClient();

export class StockRepository {
  // Categories
  async getCategories(ownerId: string) {
    return prisma.stockCategory.findMany({
      where: { ownerId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getCategoryById(id: string, ownerId: string) {
    return prisma.stockCategory.findFirst({
      where: { id, ownerId }
    });
  }

  async createCategory(data: { name: string; description?: string; ownerId: string }) {
    return prisma.stockCategory.create({ data });
  }

  async updateCategory(id: string, ownerId: string, data: any) {
    return prisma.stockCategory.update({
      where: { id, ownerId }, // Ensure tenant isolation
      data
    });
  }

  async deleteCategory(id: string, ownerId: string) {
    return prisma.stockCategory.delete({
      where: { id, ownerId }
    });
  }

  // Products
  async getProducts(ownerId: string, categoryId?: string) {
    const where: any = { ownerId };
    if (categoryId) where.categoryId = categoryId;
    return prisma.stockProduct.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  async createProduct(data: { name: string; sku?: string; description?: string; unit: string; categoryId: string; ownerId: string }) {
    return prisma.stockProduct.create({ data });
  }

  async updateProduct(id: string, ownerId: string, data: any) {
    return prisma.stockProduct.update({
      where: { id, ownerId },
      data
    });
  }

  async deleteProduct(id: string, ownerId: string) {
    return prisma.stockProduct.delete({
      where: { id, ownerId }
    });
  }

  // Transactions & Atomic Operations
  async getProductById(id: string, ownerId: string) {
    return prisma.stockProduct.findFirst({
      where: { id, ownerId }
    });
  }

  async performInbound(productId: string, ownerId: string, quantity: number, note?: string) {
    return prisma.$transaction(async (tx) => {
      // 1. Update product quantity
      const product = await tx.stockProduct.update({
        where: { id: productId, ownerId },
        data: { quantity: { increment: quantity } }
      });

      // 2. Record transaction
      const transaction = await tx.stockTransaction.create({
        data: {
          type: TransactionType.INBOUND,
          quantity,
          note,
          productId,
          ownerId
        }
      });

      return { product, transaction };
    });
  }

  async performOutbound(productId: string, ownerId: string, quantity: number, note?: string) {
    return prisma.$transaction(async (tx) => {
      // 1. Find current product to check qty
      const currentProduct = await tx.stockProduct.findFirst({
        where: { id: productId, ownerId }
      });

      if (!currentProduct) {
        throw new Error('Product not found');
      }
      if (currentProduct.quantity < quantity) {
        throw new Error('Insufficient stock');
      }

      // 2. Update product quantity
      const product = await tx.stockProduct.update({
        where: { id: productId },
        data: { quantity: { decrement: quantity } }
      });

      // 3. Record transaction
      const transaction = await tx.stockTransaction.create({
        data: {
          type: TransactionType.OUTBOUND,
          quantity,
          note,
          productId,
          ownerId
        }
      });

      return { product, transaction };
    });
  }

  async getTransactions(ownerId: string, type?: TransactionType) {
    const where: any = { ownerId };
    if (type) where.type = type;
    return prisma.stockTransaction.findMany({
      where,
      include: { product: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  // Dashboard & Central Analysis
  async getDashboardOverview(ownerId: string) {
    const totalProducts = await prisma.stockProduct.count({ where: { ownerId } });
    const lowStockCount = await prisma.stockProduct.count({ where: { ownerId, quantity: { lt: 10 } } });
    const recentTransactions = await prisma.stockTransaction.findMany({
      where: { ownerId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { product: true }
    });
    
    const products = await prisma.stockProduct.findMany({
      where: { ownerId },
      include: { category: true },
      orderBy: { quantity: 'asc' }
    });

    return { totalProducts, lowStockCount, recentTransactions, products };
  }

  async getAllBranches() {
    return prisma.user.findMany({
      where: { role: 'BRANCH' },
      include: {
        location: true,
        stockProducts: {
          select: { quantity: true } // just to aggregate later
        }
      }
    });
  }
}
