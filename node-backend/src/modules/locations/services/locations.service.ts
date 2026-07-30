import { BranchLocation } from '@prisma/client';
import { LocationsRepository } from '../repositories/locations.repository';
import { LocationDto } from '../dtos/locations.dto';
import { AppError, BadRequestError, NotFoundError } from '../../../shared/exceptions/app-error';

export class LocationsService {
  constructor(private locationsRepository: LocationsRepository) {}

  async createLocation(userId: string, data: LocationDto): Promise<BranchLocation> {
    const existing = await this.locationsRepository.findByUserId(userId);
    if (existing) {
      throw new BadRequestError('สาขานี้ได้ทำการตั้งค่าพิกัดไปแล้ว');
    }
    return this.locationsRepository.create(userId, data);
  }

  async updateLocation(userId: string, data: LocationDto): Promise<BranchLocation> {
    const existing = await this.locationsRepository.findByUserId(userId);
    if (!existing) {
      throw new NotFoundError('ไม่พบข้อมูลพิกัดของสาขานี้');
    }
    return this.locationsRepository.update(userId, data);
  }

  async updateStatus(userId: string, isReady: boolean): Promise<BranchLocation> {
    const existing = await this.locationsRepository.findByUserId(userId);
    if (!existing) {
      throw new NotFoundError('ไม่พบข้อมูลพิกัดของสาขานี้');
    }
    return this.locationsRepository.updateStatus(userId, isReady);
  }

  async getMySection(userId: string): Promise<BranchLocation> {
    const location = await this.locationsRepository.findByUserId(userId);
    if (!location) {
      throw new NotFoundError('ไม่พบข้อมูลพิกัด');
    }
    return location;
  }

  async getAllLocations(): Promise<BranchLocation[]> {
    return this.locationsRepository.findAll();
  }
}
