import { PrismaClient, BranchLocation } from '@prisma/client';
import { LocationDto } from '../dtos/locations.dto';

export class LocationsRepository {
  constructor(private prisma: PrismaClient) {}

  async create(userId: string, data: LocationDto): Promise<BranchLocation> {
    const location = await this.prisma.branchLocation.create({
      data: {
        userId,
        name: data.name,
        description: data.description,
        latitude: data.latitude,
        longitude: data.longitude,
      },
    });
    
    await this.updateGeometry(location.id, data.longitude, data.latitude);
    return location;
  }

  async update(userId: string, data: LocationDto): Promise<BranchLocation> {
    const location = await this.prisma.branchLocation.update({
      where: { userId },
      data: {
        name: data.name,
        description: data.description,
        latitude: data.latitude,
        longitude: data.longitude,
      },
    });
    
    await this.updateGeometry(location.id, data.longitude, data.latitude);
    return location;
  }

  async updateStatus(userId: string, isReady: boolean): Promise<BranchLocation> {
    return this.prisma.branchLocation.update({
      where: { userId },
      data: { isReady },
    });
  }
  
  private async updateGeometry(id: string, lng: number, lat: number) {
    await this.prisma.$executeRaw`
      UPDATE "BranchLocation"
      SET geom = ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)
      WHERE id = ${id}
    `;
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
