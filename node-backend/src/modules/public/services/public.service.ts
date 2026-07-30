import { prisma } from '../../../infrastructure/database/prisma';

export class PublicService {
  static async findNearbyShelters(lat: number, lng: number) {
    // We use PostGIS ST_DistanceSphere to calculate distance in meters
    const shelters = await prisma.$queryRaw`
      SELECT 
        b.id, 
        b.name, 
        b.description,
        b.capacity, 
        b."isReady",
        b.latitude,
        b.longitude,
        COALESCE(
          (SELECT COUNT(*) FROM "Evacuee" e WHERE e."branchLocationId" = b.id AND e.status = 'IN_SHELTER'), 0
        )::int AS "currentOccupancy",
        ST_DistanceSphere(
          geom, 
          ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)
        ) AS "distanceMeters"
      FROM "BranchLocation" b
      ORDER BY "distanceMeters" ASC
      LIMIT 20;
    `;

    return shelters;
  }
}
