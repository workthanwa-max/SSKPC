import { prisma } from '../../infrastructure/database/prisma';
import { logger } from '../../infrastructure/logger/logger';

// List of keys that contain PII or sensitive data to be masked before saving to DB
const PII_KEYS = ['password', 'creditCard', 'nationalId', 'token', 'accessToken', 'refreshToken', 'email', 'phone'];

export class AuditLogService {
  /**
   * Log an action to the immutable AuditLog table.
   * @param action The action being performed (e.g. LOGIN_FAILED, EVACUEE_ADD)
   * @param metadata Contextual data (will be redacted of PII)
   * @param userId The ID of the user performing the action (optional)
   * @param ipAddress The IP address of the request (optional)
   */
  static async log(action: string, metadata?: any, userId?: string, ipAddress?: string) {
    try {
      const scrubbedMetadata = this.redactPII(metadata);
      
      await prisma.auditLog.create({
        data: {
          action,
          userId,
          ipAddress,
          metadata: scrubbedMetadata ? (scrubbedMetadata as any) : undefined,
        },
      });
    } catch (error) {
      // We don't want audit log failures to crash the main request, but we must log it
      logger.error(error, `Failed to save AuditLog for action: ${action}`);
    }
  }

  /**
   * Recursively scrub sensitive keys from an object
   */
  private static redactPII(obj: any): any {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.redactPII(item));
    }

    const scrubbed: any = {};
    for (const key of Object.keys(obj)) {
      if (PII_KEYS.some(piiKey => key.toLowerCase().includes(piiKey.toLowerCase()))) {
        scrubbed[key] = '[REDACTED]';
      } else {
        scrubbed[key] = this.redactPII(obj[key]);
      }
    }
    return scrubbed;
  }
}
