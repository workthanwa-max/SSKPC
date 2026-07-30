import { prisma } from '../../../infrastructure/database/prisma';
import { EvacueeStatus } from '@prisma/client';
import crypto from 'crypto';
import { NotFoundError } from '../../../shared/exceptions/app-error';

export class EvacueesService {
  
  // ---------------------------------------------------------
  // BRANCH OPERATIONS
  // ---------------------------------------------------------

  static async updateLocationCapacity(userId: string, capacity: number, specInfo?: string) {
    const location = await prisma.branchLocation.findUnique({ where: { userId } });
    if (!location) throw new NotFoundError('Location not found for this branch user');

    return await prisma.branchLocation.update({
      where: { userId },
      data: { capacity, specInfo },
    });
  }

  static async checkIn(userId: string, data: { name: string, gender?: string, type?: string, basicInfo?: string }) {
    const location = await prisma.branchLocation.findUnique({ where: { userId } });
    if (!location) throw new NotFoundError('Location not found for this branch user');

    const registrationCode = `EV-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    return await prisma.evacuee.create({
      data: {
        registrationCode,
        name: data.name,
        gender: data.gender,
        type: data.type,
        basicInfo: data.basicInfo,
        branchLocationId: location.id,
      },
    });
  }

  static async checkOut(userId: string, identifier: string) {
    const location = await prisma.branchLocation.findUnique({ where: { userId } });
    if (!location) throw new NotFoundError('Location not found for this branch user');

    const evacuee = await prisma.evacuee.findFirst({
      where: {
        branchLocationId: location.id,
        status: 'IN_SHELTER',
        OR: [
          { registrationCode: identifier },
          { name: identifier }
        ]
      }
    });

    if (!evacuee) {
      throw new NotFoundError('Evacuee not found or already checked out');
    }

    return await prisma.evacuee.update({
      where: { id: evacuee.id },
      data: {
        status: 'CHECKED_OUT',
        checkOutAt: new Date(),
      }
    });
  }

  static async getBranchEvacuees(userId: string, status?: EvacueeStatus) {
    const location = await prisma.branchLocation.findUnique({ where: { userId } });
    if (!location) throw new NotFoundError('Location not found for this branch user');

    const whereClause: any = { branchLocationId: location.id };
    if (status) {
      whereClause.status = status;
    }

    return await prisma.evacuee.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    });
  }

  static async getBranchDashboard(userId: string) {
    const location = await prisma.branchLocation.findUnique({ where: { userId } });
    if (!location) throw new NotFoundError('Location not found for this branch user');

    const inShelterCount = await prisma.evacuee.count({
      where: { branchLocationId: location.id, status: 'IN_SHELTER' }
    });

    return {
      capacity: location.capacity || 0,
      currentOccupancy: inShelterCount,
      specInfo: location.specInfo
    };
  }

  // ---------------------------------------------------------
  // CENTRAL OPERATIONS
  // ---------------------------------------------------------

  static async getCentralDashboard() {
    const locations = await prisma.branchLocation.findMany({
      include: {
        _count: {
          select: { evacuees: { where: { status: 'IN_SHELTER' } } }
        }
      }
    });

    let totalCapacity = 0;
    let totalOccupancy = 0;

    locations.forEach(loc => {
      totalCapacity += (loc.capacity || 0);
      totalOccupancy += loc._count.evacuees;
    });

    return { totalCapacity, totalOccupancy };
  }

  static async getCentralBranches() {
    return await prisma.branchLocation.findMany({
      select: {
        id: true,
        name: true,
        capacity: true,
        isReady: true,
        _count: {
          select: { evacuees: { where: { status: 'IN_SHELTER' } } }
        }
      }
    });
  }

  static async getCentralBranchPeople(branchId: string) {
    return await prisma.evacuee.findMany({
      where: {
        branchLocationId: branchId,
      },
      orderBy: { createdAt: 'desc' }
    });
  }
}
