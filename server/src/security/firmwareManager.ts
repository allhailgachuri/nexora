import { db } from '../db/database';
import { FirmwareVersion, Device } from '../types';
import { AuditLogService } from './auditLog';

export class FirmwareManager {
  public static getAllFirmware(): FirmwareVersion[] {
    return Array.from(db.firmwareVersions.values());
  }

  public static getFirmwareById(id: string): FirmwareVersion | undefined {
    return db.firmwareVersions.get(id);
  }

  public static getFleetComplianceSummary(): {
    totalDevices: number;
    upToDateCount: number;
    vulnerableCveCount: number;
    outdatedCount: number;
    compliancePercentage: number;
  } {
    const devices = db.getAllDevices();
    let upToDate = 0;
    let vulnerable = 0;
    let outdated = 0;

    for (const dev of devices) {
      const type = db.deviceTypes.get(dev.deviceTypeId);
      if (!type) continue;

      const isCurrent = dev.firmwareVersion === type.currentFirmwareVersion;
      if (isCurrent) {
        upToDate++;
      } else {
        // Check if firmware has CVE
        const matchedFw = Array.from(db.firmwareVersions.values()).find(
          f => f.deviceTypeId === dev.deviceTypeId && f.version === dev.firmwareVersion
        );
        if (matchedFw && matchedFw.hasKnownCve) {
          vulnerable++;
        } else {
          outdated++;
        }
      }
    }

    const total = devices.length || 1;
    const compliancePercentage = parseFloat(((upToDate / total) * 100).toFixed(1));

    return {
      totalDevices: devices.length,
      upToDateCount: upToDate,
      vulnerableCveCount: vulnerable,
      outdatedCount: outdated,
      compliancePercentage
    };
  }

  /**
   * Initiates an OTA deployment campaign for a device or fleet
   */
  public static triggerOtaUpdate(params: {
    deviceId: string;
    targetVersion: string;
    actorEmail: string;
  }): { success: boolean; device?: Device; error?: string } {
    const device = db.getDeviceById(params.deviceId);
    if (!device) return { success: false, error: 'Device not found' };

    const targetFw = Array.from(db.firmwareVersions.values()).find(
      f => f.deviceTypeId === device.deviceTypeId && f.version === params.targetVersion
    );

    if (!targetFw) {
      return { success: false, error: `Firmware version ${params.targetVersion} not found in signed catalog` };
    }

    if (targetFw.isRevoked) {
      return { success: false, error: `Target firmware ${params.targetVersion} is revoked and cannot be deployed` };
    }

    device.targetFirmwareVersion = params.targetVersion;
    device.otaStatus = 'APPLYING';
    db.saveDevice(device);

    // Simulate asynchronous OTA completion
    setTimeout(() => {
      const d = db.getDeviceById(params.deviceId);
      if (d) {
        d.firmwareVersion = params.targetVersion;
        d.targetFirmwareVersion = undefined;
        d.otaStatus = 'SUCCESS';
        if (d.lifecycleState === 'SUSPECTED' && !d.isQuarantined) {
          d.lifecycleState = 'ACTIVE';
        }
        db.saveDevice(d);
      }
    }, 4000);

    AuditLogService.logAction({
      orgId: device.orgId,
      actorId: 'user',
      actorEmail: params.actorEmail,
      actorRole: 'FLEET_ADMIN',
      action: 'TRIGGER_OTA_UPDATE',
      resourceType: 'FIRMWARE',
      resourceId: device.id,
      details: {
        previousVersion: device.firmwareVersion,
        targetVersion: params.targetVersion,
        binaryHash: targetFw.binaryHashSha256
      }
    });

    return { success: true, device };
  }
}
