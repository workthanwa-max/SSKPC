import { prisma } from '../../../infrastructure/database/prisma';
import { NotFoundError } from '../../../shared/exceptions/app-error';

export class AnalyticsService {
  /**
   * Helper to calculate realistic daily burn rate based on category
   */
  private static calculateDailyBurnRate(categoryName: string, population: number): number {
    let baseRate = 1;
    
    if (categoryName.includes('น้ำดื่ม')) {
      baseRate = 3; // 3 bottles per person per day
    } else if (categoryName.includes('อาหาร')) {
      baseRate = 3; // 3 meals per person per day
    } else if (categoryName.includes('ยา')) {
      baseRate = 0.1; // 10% of population might need it per day
    } else if (categoryName.includes('เครื่องนุ่งห่ม') || categoryName.includes('เสื้อ')) {
      baseRate = 0.01; // 1% replacement/loss rate per day
    }

    return Math.ceil(population * baseRate * 1.1); // Add 10% buffer for waste
  }

  /**
   * Helper to get standard unit for critical categories
   */
  private static getStandardUnit(categoryName: string, originalUnit: string): string {
    if (categoryName.includes('น้ำดื่ม')) return 'ขวด';
    if (categoryName.includes('อาหาร')) return 'มื้อ';
    if (categoryName.includes('ยา')) return 'ชุด';
    if (categoryName.includes('เครื่องนุ่งห่ม') || categoryName.includes('เสื้อ')) return 'ตัว';
    return originalUnit;
  }

  /**
   * Calculates the survival analytics for a specific branch.
   */
  static async getBranchSurvivalAnalytics(userId: string) {
    const location = await prisma.branchLocation.findUnique({
      where: { userId },
      include: {
        _count: {
          select: { evacuees: { where: { status: 'IN_SHELTER' } } }
        }
      }
    });

    if (!location) throw new NotFoundError('Branch location not found');

    const currentOccupancy = location._count.evacuees;
    
    // Fallback if no one is in shelter, set to 1 to avoid division by zero
    const calculationPopulation = currentOccupancy > 0 ? currentOccupancy : 1;

    const criticalCategories = await prisma.stockCategory.findMany({
      where: { ownerId: userId, isCritical: true }
    });

    const criticalProducts = await prisma.stockProduct.findMany({
      where: { ownerId: userId, category: { isCritical: true } },
      include: { category: true }
    });

    let overallTtd = Infinity;
    const categoriesWithProducts = new Set();
    const burnRates = criticalProducts.map((product: any) => {
      categoriesWithProducts.add(product.categoryId);
      const dailyBurnRate = this.calculateDailyBurnRate(product.category.name, calculationPopulation);
      const ttd = product.quantity > 0 ? Number((product.quantity / dailyBurnRate).toFixed(1)) : 0;
      
      if (ttd < overallTtd) overallTtd = ttd;

      return {
        id: product.id,
        name: product.name,
        category: product.category.name,
        quantity: product.quantity,
        unit: this.getStandardUnit(product.category.name, product.unit),
        dailyConsumptionRate: product.dailyConsumptionRate || 1,
        dailyBurnRate,
        ttd,
        status: ttd <= 3 ? 'CRITICAL' : ttd <= 7 ? 'WARNING' : 'HEALTHY'
      };
    });

    // Add missing categories (where no products are added yet)
    criticalCategories.forEach(category => {
      if (!categoriesWithProducts.has(category.id)) {
        overallTtd = 0; // Immediate critical state
        burnRates.push({
          id: category.id, // Using category id as placeholder
          name: `ขาดแคลน${category.name}`,
          category: category.name,
          quantity: 0,
          unit: this.getStandardUnit(category.name, 'หน่วย'),
          dailyConsumptionRate: 1,
          dailyBurnRate: this.calculateDailyBurnRate(category.name, calculationPopulation),
          ttd: 0,
          status: 'CRITICAL'
        });
      }
    });

    burnRates.sort((a: any, b: any) => a.ttd - b.ttd);

    return {
      currentOccupancy,
      capacity: location.capacity || 0,
      survivalDays: overallTtd === Infinity ? 0 : overallTtd,
      metrics: burnRates
    };
  }

  /**
   * Calculates the survival analytics for all branches (Central Overview).
   */
  static async getCentralSurvivalAnalytics() {
    const locations = await prisma.branchLocation.findMany({
      include: {
        _count: {
          select: { evacuees: { where: { status: 'IN_SHELTER' } } }
        },
        user: {
          select: { id: true, name: true }
        }
      }
    });

    const branchesAnalytics = await Promise.all(
      locations.map(async (loc: any) => {
        const currentOccupancy = loc._count.evacuees;
        const calculationPopulation = currentOccupancy > 0 ? currentOccupancy : 1;

        const criticalCategories = await prisma.stockCategory.findMany({
          where: { ownerId: loc.user.id, isCritical: true }
        });

        const criticalProducts = await prisma.stockProduct.findMany({
          where: { ownerId: loc.user.id, category: { isCritical: true } },
          include: { category: true } // Need category to get categoryId and name
        });

        let overallTtd = Infinity;
        let criticalItemsCount = 0;
        const criticalItemsList: any[] = [];
        const categoriesWithProducts = new Set();

        criticalProducts.forEach((product: any) => {
          categoriesWithProducts.add(product.categoryId);
          
          const dailyBurnRate = this.calculateDailyBurnRate(product.category.name, calculationPopulation);
          const ttd = product.quantity > 0 ? product.quantity / dailyBurnRate : 0;
          
          if (ttd < overallTtd) overallTtd = ttd;
          
          if (ttd <= 3) {
            criticalItemsCount++;
            criticalItemsList.push({
              id: product.id,
              name: product.name,
              quantity: product.quantity,
              unit: this.getStandardUnit(product.category.name, product.unit),
              ttd: Number(ttd.toFixed(1))
            });
          }
        });

        // Add missing categories as critical items
        criticalCategories.forEach((category: any) => {
          if (!categoriesWithProducts.has(category.id)) {
            overallTtd = 0;
            criticalItemsCount++;
            criticalItemsList.push({
              id: category.id, // Placeholder ID
              name: `ขาดแคลน${category.name}`,
              quantity: 0,
              unit: this.getStandardUnit(category.name, 'หน่วย'),
              ttd: 0
            });
          }
        });

        return {
          branchId: loc.id,
          branchName: loc.name,
          officerName: loc.user.name,
          currentOccupancy,
          capacity: loc.capacity,
          survivalDays: overallTtd === Infinity ? 0 : Number(overallTtd.toFixed(1)),
          criticalItemsCount,
          criticalItemsList
        };
      })
    );

    // Sort by survival days ascending (who needs help first)
    branchesAnalytics.sort((a: any, b: any) => a.survivalDays - b.survivalDays);

    return branchesAnalytics;
  }

  // ---------------------------------------------------------
  // NEW REPORTS (Analytics Module Expansion)
  // ---------------------------------------------------------

  static async getCentralStockReport() {
    const branchUsers = await prisma.user.findMany({ where: { role: 'BRANCH' } });
    const ownerIds = branchUsers.map(u => u.id);
    
    const products = await prisma.stockProduct.findMany({
      where: { ownerId: { in: ownerIds } },
      include: { category: true }
    });

    const categorySummary: Record<string, { categoryName: string; totalQuantity: number; unit: string; isCritical: boolean }> = {};
    let totalItems = 0;
    let lowStockItems = 0;

    products.forEach(p => {
       const catName = p.category.name;
       if (!categorySummary[catName]) {
         categorySummary[catName] = { 
           categoryName: catName, 
           totalQuantity: 0, 
           unit: this.getStandardUnit(catName, p.unit), 
           isCritical: p.category.isCritical 
         };
       }
       categorySummary[catName].totalQuantity += p.quantity;
       totalItems += p.quantity;
       if (p.quantity < 10) lowStockItems++;
    });

    return {
      totalItems,
      lowStockItems,
      categories: Object.values(categorySummary).sort((a, b) => b.totalQuantity - a.totalQuantity)
    };
  }

  static async getCentralEvacueeStats() {
    const locations = await prisma.branchLocation.findMany({
      include: {
        _count: {
          select: { evacuees: { where: { status: 'IN_SHELTER' } } }
        }
      }
    });

    let totalCapacity = 0;
    let currentOccupancy = 0;
    const branchData = locations.map(loc => {
      totalCapacity += (loc.capacity || 0);
      currentOccupancy += loc._count.evacuees;
      return {
        branchName: loc.name,
        capacity: loc.capacity || 0,
        occupancy: loc._count.evacuees,
        utilization: loc.capacity ? Number((loc._count.evacuees / loc.capacity * 100).toFixed(1)) : 0
      };
    });

    return {
      totalCapacity,
      currentOccupancy,
      utilization: totalCapacity ? Number((currentOccupancy / totalCapacity * 100).toFixed(1)) : 0,
      branches: branchData.sort((a, b) => b.utilization - a.utilization)
    };
  }

  static async getBranchStockReport(userId: string) {
    const products = await prisma.stockProduct.findMany({
      where: { ownerId: userId },
      include: { category: true },
      orderBy: { quantity: 'asc' }
    });

    let totalQuantity = 0;
    let lowStockCount = 0;
    products.forEach(p => {
      totalQuantity += p.quantity;
      if (p.quantity < 10) lowStockCount++;
    });

    return { 
      totalQuantity,
      lowStockCount,
      products: products.map(p => ({
        id: p.id,
        name: p.name,
        category: p.category.name,
        quantity: p.quantity,
        unit: p.unit,
        isCritical: p.category.isCritical
      }))
    };
  }

  static async getBranchEvacueeStats(userId: string) {
    const location = await prisma.branchLocation.findUnique({ where: { userId } });
    if (!location) throw new NotFoundError('Location not found');

    const evacuees = await prisma.evacuee.findMany({
      where: { branchLocationId: location.id, status: 'IN_SHELTER' }
    });

    const demographics = {
      gender: { MALE: 0, FEMALE: 0, OTHER: 0 },
      type: { CHILD: 0, ADULT: 0, ELDERLY: 0, PREGNANT: 0, VULNERABLE: 0, UNKNOWN: 0 }
    };

    evacuees.forEach(e => {
      if (e.gender === 'MALE') demographics.gender.MALE++;
      else if (e.gender === 'FEMALE') demographics.gender.FEMALE++;
      else demographics.gender.OTHER++;

      if (e.type === 'CHILD') demographics.type.CHILD++;
      else if (e.type === 'ADULT') demographics.type.ADULT++;
      else if (e.type === 'ELDERLY') demographics.type.ELDERLY++;
      else if (e.type === 'PREGNANT') demographics.type.PREGNANT++;
      else if (e.type === 'VULNERABLE') demographics.type.VULNERABLE++;
      else demographics.type.UNKNOWN++;
    });

    return {
      totalInShelter: evacuees.length,
      capacity: location.capacity || 0,
      demographics
    };
  }
}
