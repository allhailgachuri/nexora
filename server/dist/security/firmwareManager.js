"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirmwareManager = void 0;
const database_1 = require("../db/database");
const auditLog_1 = require("./auditLog");
class FirmwareManager {
    static getAllFirmware() {
        return Array.from(database_1.db.firmwareVersions.values());
    }
    static getFirmwareById(id) {
        return database_1.db.firmwareVersions.get(id);
    }
    static getFleetComplianceSummary() {
        const devices = database_1.db.getAllDevices();
        let upToDate = 0;
        let vulnerable = 0;
        let outdated = 0;
        for (const dev of devices) {
            const type = database_1.db.deviceTypes.get(dev.deviceTypeId);
            if (!type)
                continue;
            const isCurrent = dev.firmwareVersion === type.currentFirmwareVersion;
            if (isCurrent) {
                upToDate++;
            }
            else {
                // Check if firmware has CVE
                const matchedFw = Array.from(database_1.db.firmwareVersions.values()).find(f => f.deviceTypeId === dev.deviceTypeId && f.version === dev.firmwareVersion);
                if (matchedFw && matchedFw.hasKnownCve) {
                    vulnerable++;
                }
                else {
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
    static triggerOtaUpdate(params) {
        const device = database_1.db.getDeviceById(params.deviceId);
        if (!device)
            return { success: false, error: 'Device not found' };
        const targetFw = Array.from(database_1.db.firmwareVersions.values()).find(f => f.deviceTypeId === device.deviceTypeId && f.version === params.targetVersion);
        if (!targetFw) {
            return { success: false, error: `Firmware version ${params.targetVersion} not found in signed catalog` };
        }
        if (targetFw.isRevoked) {
            return { success: false, error: `Target firmware ${params.targetVersion} is revoked and cannot be deployed` };
        }
        device.targetFirmwareVersion = params.targetVersion;
        device.otaStatus = 'APPLYING';
        database_1.db.saveDevice(device);
        // Simulate asynchronous OTA completion
        setTimeout(() => {
            const d = database_1.db.getDeviceById(params.deviceId);
            if (d) {
                d.firmwareVersion = params.targetVersion;
                d.targetFirmwareVersion = undefined;
                d.otaStatus = 'SUCCESS';
                if (d.lifecycleState === 'SUSPECTED' && !d.isQuarantined) {
                    d.lifecycleState = 'ACTIVE';
                }
                database_1.db.saveDevice(d);
            }
        }, 4000);
        auditLog_1.AuditLogService.logAction({
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
exports.FirmwareManager = FirmwareManager;
