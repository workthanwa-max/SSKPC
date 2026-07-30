import { z } from 'zod';

export const LocationSchema = z.object({
  name: z.string().min(1, 'กรุณาระบุชื่อสาขา'),
  description: z.string().optional(),
  latitude: z.number().min(-90, 'ละติจูดไม่ถูกต้อง').max(90, 'ละติจูดไม่ถูกต้อง'),
  longitude: z.number().min(-180, 'ลองจิจูดไม่ถูกต้อง').max(180, 'ลองจิจูดไม่ถูกต้อง'),
});

export type LocationDto = z.infer<typeof LocationSchema>;
