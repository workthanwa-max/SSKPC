import { PrismaClient, BranchLocation } from '@prisma/client';
import { LocationDto } from '../dtos/locations.dto';

export class LocationsRepository {
  constructor(private prisma: PrismaClient) {}

  async create(userId: string, data: LocationDto): Promise<BranchLocation> {
    return this.prisma.branchLocation.create({
      data: {
        userId,
        name: data.name,
        description: data.description,
        latitude: data.latitude,
        longitude: data.longitude,
      },
    });
  }

  async update(userId: string, data: LocationDto): Promise<BranchLocation> {
    return this.prisma.branchLocation.update({
      where: { userId },
      data: {
        name: data.name,
        description: data.description,
        latitude: data.latitude,
        longitude: data.longitude,
      },
    });
  }

  async updateStatus(userId: string, isReady: boolean): Promise<BranchLocation> {
    return this.prisma.branchLocation.update({
      where: { userId },
      data: { isReady },
    });
  }

  async findByUserId(userId: string): Promise<BranchLocation | null> {
    return this.prisma.branchLocation.findUnique({
      where: { userId },
    });
  }

  async findAll(): Promise<BranchLocation[]> {
    return this.prisma.branchLocation.findMany({
      include: {
        user: { select: { name: true, email: true, role: true, status: true } },
      },
      orderBy: { createdAt: 'desc' }
    });
  }
}
