import { prisma } from '../../../infrastructure/database/prisma';

export class DashboardService {
  /**
   * Admin Dashboard: System-wide Overview
   */
  async getAdminOverview() {
    const [
      totalUsers,
      activeUsers,
      centralUsers,
      branchUsers,
      totalShelters
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: 'ACTIVE' } }),
      prisma.user.count({ where: { role: 'CENTRAL' } }),
      prisma.user.count({ where: { role: 'BRANCH' } }),
      prisma.branchLocation.count()
    ]);

    return {
      users: {
        total: totalUsers,
        active: activeUsers,
        central: centralUsers,
        branch: branchUsers,
      },
      shelters: {
        total: totalShelters
      }
    };
  }

  /**
   * Central Dashboard: Network-wide Operations
   */
  async getCentralOverview() {
    // Total Shelters
    const totalShelters = await prisma.branchLocation.count();

    // Capacity & Occupancy
    const branches = await prisma.branchLocation.findMany({
      select: { capacity: true, isReady: true }
    });
    const totalCapacity = branches.reduce((sum, b) => sum + (b.capacity || 0), 0);
    const readyShelters = branches.filter(b => b.isReady).length;
    const notReadyShelters = branches.filter(b => !b.isReady).length;

    const totalInShelter = await prisma.evacuee.count({
      where: { status: 'IN_SHELTER' }
    });

    // Network Utilization
    const networkUtilization = totalCapacity > 0 ? Math.round((totalInShelter / totalCapacity) * 100) : 0;

    // Critical Supply Status
    const criticalProducts = await prisma.stockProduct.findMany({
      where: { category: { isCritical: true } },
      select: { quantity: true, ownerId: true }
    });

    const totalCriticalItems = criticalProducts.reduce((sum, p) => sum + p.quantity, 0);
    const lowStockCount = criticalProducts.filter(p => p.quantity < 10).length;

    return {
      network: {
        totalShelters,
        readyShelters,
        notReadyShelters,
        totalCapacity,
        currentOccupancy: totalInShelter,
        utilization: networkUtilization
      },
      supplies: {
        totalCriticalItems,
        lowStockAlerts: lowStockCount
      }
    };
  }

  /**
   * Branch Dashboard: Local Shelter Operations
   */
  async getBranchOverview(userId: string) {
    const location = await prisma.branchLocation.findUnique({
      where: { userId }
    });

    if (!location) {
      throw new Error("Branch location not found for this user");
    }

    // Occupancy
    const currentOccupancy = await prisma.evacuee.count({
      where: { branchLocationId: location.id, status: 'IN_SHELTER' }
    });

    const capacity = location.capacity || 0;
    const utilization = capacity > 0 ? Math.round((currentOccupancy / capacity) * 100) : 0;

    // Demographics Summary
    const evacuees = await prisma.evacuee.findMany({
      where: { branchLocationId: location.id, status: 'IN_SHELTER' },
      select: { gender: true, type: true }
    });

    const demographics = {
      gender: {
        MALE: evacuees.filter(e => e.gender === 'MALE').length,
        FEMALE: evacuees.filter(e => e.gender === 'FEMALE').length,
      },
      type: {
        CHILD: evacuees.filter(e => e.type === 'CHILD').length,
        ELDERLY: evacuees.filter(e => e.type === 'ELDERLY').length,
        VULNERABLE: evacuees.filter(e => e.type === 'VULNERABLE' || e.type === 'PREGNANT').length,
      }
    };

    // Recent Check-ins
    const recentCheckIns = await prisma.evacuee.findMany({
      where: { branchLocationId: location.id },
      orderBy: { checkInAt: 'desc' },
      take: 5,
      select: { name: true, registrationCode: true, checkInAt: true, status: true, type: true }
    });

    // Stock Status
    const products = await prisma.stockProduct.findMany({
      where: { ownerId: userId },
      select: { quantity: true }
    });
    const lowStockCount = products.filter(p => p.quantity < 10).length;

    // Recent Transactions
    const recentTransactions = await prisma.stockTransaction.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { product: { select: { name: true } } }
    });

    return {
      shelter: {
        name: location.name,
        capacity,
        currentOccupancy,
        utilization,
        isReady: location.isReady
      },
      demographics,
      recentCheckIns,
      supplies: {
        totalItems: products.length,
        lowStockAlerts: lowStockCount
      },
      recentTransactions: recentTransactions.map(t => ({
        id: t.id,
        type: t.type,
        quantity: t.quantity,
        productName: t.product.name,
        createdAt: t.createdAt
      }))
    };
  }
}
