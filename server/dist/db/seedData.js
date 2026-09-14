"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedNexoraDatabase = seedNexoraDatabase;
const database_1 = require("./database");
const certManager_1 = require("../pki/certManager");
function seedNexoraDatabase() {
    console.log('[SEED] Initializing Nexora Fleet & Multi-Tenant Registry...');
    // 1. Organization
    const org = {
        id: 'org-nexora-prod',
        name: 'Nexora Enterprise IoT & Defense',
        slug: 'nexora-corp',
        createdAt: new Date(Date.now() - 90 * 86400000).toISOString()
    };
    database_1.db.organizations.set(org.id, org);
    // 2. Sites (3 distinct geographical zones)
    const sites = [
        {
            id: 'site-farm-zone-a',
            orgId: org.id,
            name: 'Farm Zone A (Salinas Valley Agritech)',
            code: 'AGRI-01',
            latitude: 36.6777,
            longitude: -121.6555,
            locationName: 'Salinas Valley, CA',
            timezone: 'America/Los_Angeles'
        },
        {
            id: 'site-water-cluster-b',
            orgId: org.id,
            name: 'Water Point Cluster B (Aqueduct Station 4)',
            code: 'WATR-04',
            latitude: 34.0522,
            longitude: -118.2437,
            locationName: 'Mojave Conduit System, CA',
            timezone: 'America/Los_Angeles'
        },
        {
            id: 'site-smart-meter-c',
            orgId: org.id,
            name: 'Smart Meter District C (Metro Grid Sector 9)',
            code: 'GRID-09',
            latitude: 37.7749,
            longitude: -122.4194,
            locationName: 'San Francisco Bay Grid, CA',
            timezone: 'America/Los_Angeles'
        }
    ];
    sites.forEach(s => database_1.db.sites.set(s.id, s));
    // 3. Device Groups
    const groups = [
        {
            id: 'group-soil-sector-1',
            siteId: 'site-farm-zone-a',
            orgId: org.id,
            name: 'North Orchard Soil Monitors',
            description: 'Distributed moisture and soil conductivity array'
        },
        {
            id: 'group-soil-sector-2',
            siteId: 'site-farm-zone-a',
            orgId: org.id,
            name: 'Greenhouse Hydroponics Nodes',
            description: 'Precision environmental soil sensors'
        },
        {
            id: 'group-aqueduct-valves',
            siteId: 'site-water-cluster-b',
            orgId: org.id,
            name: 'Main Canal Flow Gate Regulators',
            description: 'High-pressure valve actuators and ultrasonic flowmeters'
        },
        {
            id: 'group-substation-meters',
            siteId: 'site-smart-meter-c',
            orgId: org.id,
            name: 'Downtown Commercial Substation Meters',
            description: 'Three-phase industrial smart power meters'
        }
    ];
    groups.forEach(g => database_1.db.deviceGroups.set(g.id, g));
    // 4. Device Types with Dynamic Schemas
    const typeSoil = {
        id: 'dtype-soil-sensor-v2',
        name: 'Agritech Multi-Depth Soil Probe',
        code: 'SOIL-PROBE-V2',
        category: 'AGRICULTURE',
        description: 'Capacitive moisture, EC, and soil temperature telemetry unit',
        isActuatorOrCritical: false,
        currentFirmwareVersion: 'v2.4.1',
        telemetrySchema: {
            id: 'schema-soil-v2',
            deviceTypeId: 'dtype-soil-sensor-v2',
            version: '2.1.0',
            heartbeatIntervalSec: 60,
            maxHeartbeatToleranceSec: 180,
            fields: [
                {
                    name: 'soil_moisture_pct',
                    displayName: 'Soil Volumetric Moisture',
                    type: 'number',
                    unit: '%',
                    min: 5,
                    max: 85,
                    maxRateOfChange: 15,
                    required: true
                },
                {
                    name: 'soil_temp_celsius',
                    displayName: 'Soil Temperature',
                    type: 'number',
                    unit: '°C',
                    min: -5,
                    max: 50,
                    maxRateOfChange: 8,
                    required: true
                },
                {
                    name: 'soil_conductivity_us_cm',
                    displayName: 'Electrical Conductivity',
                    type: 'number',
                    unit: 'µS/cm',
                    min: 50,
                    max: 2500,
                    maxRateOfChange: 400,
                    required: false
                },
                {
                    name: 'battery_pct',
                    displayName: 'Battery State of Charge',
                    type: 'number',
                    unit: '%',
                    min: 10,
                    max: 100,
                    maxRateOfChange: 10,
                    required: true
                }
            ]
        }
    };
    const typeWater = {
        id: 'dtype-water-valve-actuator',
        name: 'Ultrasonic Flowmeter & Valve Actuator',
        code: 'HYDRO-VALVE-500',
        category: 'WATER',
        description: 'Critical municipal water distribution flow and motorized gate controller',
        isActuatorOrCritical: true, // Requires human approval before destructive actions!
        currentFirmwareVersion: 'v3.1.0',
        telemetrySchema: {
            id: 'schema-water-v3',
            deviceTypeId: 'dtype-water-valve-actuator',
            version: '3.0.0',
            heartbeatIntervalSec: 30,
            maxHeartbeatToleranceSec: 90,
            fields: [
                {
                    name: 'flow_rate_liters_min',
                    displayName: 'Flow Rate',
                    type: 'number',
                    unit: 'L/min',
                    min: 0,
                    max: 600,
                    maxRateOfChange: 120,
                    required: true
                },
                {
                    name: 'line_pressure_psi',
                    displayName: 'Line Hydraulic Pressure',
                    type: 'number',
                    unit: 'PSI',
                    min: 20,
                    max: 160,
                    maxRateOfChange: 35,
                    isCritical: true,
                    required: true
                },
                {
                    name: 'valve_aperture_pct',
                    displayName: 'Valve Aperture Position',
                    type: 'number',
                    unit: '%',
                    min: 0,
                    max: 100,
                    maxRateOfChange: 30,
                    isCritical: true,
                    required: true
                },
                {
                    name: 'water_temp_c',
                    displayName: 'Water Temperature',
                    type: 'number',
                    unit: '°C',
                    min: 2,
                    max: 45,
                    maxRateOfChange: 5,
                    required: false
                }
            ]
        }
    };
    const typeMeter = {
        id: 'dtype-smart-meter-3p',
        name: 'Industrial Three-Phase Smart Energy Meter',
        code: 'GRID-METER-3P',
        category: 'ENERGY',
        description: 'High-speed active/reactive power analyzer and tamper detection meter',
        isActuatorOrCritical: false,
        currentFirmwareVersion: 'v4.0.2',
        telemetrySchema: {
            id: 'schema-meter-v4',
            deviceTypeId: 'dtype-smart-meter-3p',
            version: '4.0.0',
            heartbeatIntervalSec: 30,
            maxHeartbeatToleranceSec: 90,
            fields: [
                {
                    name: 'active_power_kw',
                    displayName: 'Active Load Power',
                    type: 'number',
                    unit: 'kW',
                    min: 0.5,
                    max: 180,
                    maxRateOfChange: 50,
                    required: true
                },
                {
                    name: 'grid_voltage_v',
                    displayName: 'RMS Line Voltage',
                    type: 'number',
                    unit: 'V',
                    min: 200,
                    max: 250,
                    maxRateOfChange: 15,
                    required: true
                },
                {
                    name: 'current_amp',
                    displayName: 'Phase Current',
                    type: 'number',
                    unit: 'A',
                    min: 1,
                    max: 400,
                    maxRateOfChange: 80,
                    required: true
                },
                {
                    name: 'power_factor',
                    displayName: 'Power Factor',
                    type: 'number',
                    unit: 'cosφ',
                    min: 0.70,
                    max: 1.00,
                    maxRateOfChange: 0.20,
                    required: true
                },
                {
                    name: 'frequency_hz',
                    displayName: 'Grid Frequency',
                    type: 'number',
                    unit: 'Hz',
                    min: 59.4,
                    max: 60.6,
                    maxRateOfChange: 0.5,
                    required: true
                }
            ]
        }
    };
    [typeSoil, typeWater, typeMeter].forEach(dt => database_1.db.deviceTypes.set(dt.id, dt));
    // 5. Firmware Catalog
    const firmwares = [
        {
            id: 'fw-soil-241',
            deviceTypeId: typeSoil.id,
            version: 'v2.4.1',
            releaseDate: '2026-06-10T00:00:00Z',
            binaryHashSha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
            signature: 'MEYCIQDxP5k3A89gR2Y9xLqB81jT0r...',
            signerCommonName: 'Nexora Firmware Signing Authority G2',
            fileSizeBytes: 1048576,
            releaseNotes: 'Fixed low-temperature sleep wake bug; enhanced mTLS handshake caching',
            isRevoked: false,
            hasKnownCve: false,
            minHardwareVersion: 'HW-REV-2.0'
        },
        {
            id: 'fw-soil-190-cve',
            deviceTypeId: typeSoil.id,
            version: 'v1.9.0',
            releaseDate: '2024-03-15T00:00:00Z',
            binaryHashSha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
            signature: 'MEYCIQCt7W...',
            signerCommonName: 'Legacy Signing Root',
            fileSizeBytes: 890124,
            releaseNotes: 'Legacy release with buffer vulnerability in MQTT frame decompression',
            isRevoked: true,
            hasKnownCve: true,
            cveIdentifiers: ['CVE-2025-41982', 'CVE-2024-8891'],
            minHardwareVersion: 'HW-REV-1.0'
        },
        {
            id: 'fw-water-310',
            deviceTypeId: typeWater.id,
            version: 'v3.1.0',
            releaseDate: '2026-07-20T00:00:00Z',
            binaryHashSha256: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
            signature: 'MEQCID1vA89xLqB81jT0rP5k3A89gR2Y9xLqB...',
            signerCommonName: 'Nexora Firmware Signing Authority G2',
            fileSizeBytes: 2097152,
            releaseNotes: 'Emergency shut-off failsafe calibration; upgraded to TLS 1.3 crypto suite',
            isRevoked: false,
            hasKnownCve: false,
            minHardwareVersion: 'ACTUATOR-MK3'
        },
        {
            id: 'fw-meter-402',
            deviceTypeId: typeMeter.id,
            version: 'v4.0.2',
            releaseDate: '2026-08-01T00:00:00Z',
            binaryHashSha256: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
            signature: 'MEYCIQD0rP5k3A89gR2Y9xLqB81jT0rP5k3...',
            signerCommonName: 'Nexora Firmware Signing Authority G2',
            fileSizeBytes: 1572864,
            releaseNotes: 'Enhanced sub-cycle harmonics Fourier analysis; tamper switch debouncing',
            isRevoked: false,
            hasKnownCve: false,
            minHardwareVersion: 'METER-3P-B'
        }
    ];
    firmwares.forEach(fw => database_1.db.firmwareVersions.set(fw.id, fw));
    // 6. Registered Users
    const seedUsers = [
        {
            id: 'user-admin',
            email: 'admin@nexora.io',
            name: 'Elena Rostova (SOC Lead)',
            role: 'SUPER_ADMIN',
            orgId: org.id,
            createdAt: new Date().toISOString()
        },
        {
            id: 'user-analyst',
            email: 'analyst@nexora.io',
            name: 'Marcus Vance (Security Analyst)',
            role: 'SECURITY_ANALYST',
            orgId: org.id,
            createdAt: new Date().toISOString()
        },
        {
            id: 'user-fleet-mgr',
            email: 'fleet.manager@nexora.io',
            name: 'Sarah Chen (Fleet Ops Manager)',
            role: 'FLEET_ADMIN',
            orgId: org.id,
            createdAt: new Date().toISOString()
        },
        {
            id: 'user-tech-field',
            email: 'tech.field@nexora.io',
            name: 'Carlos Mendez (Field Engineer)',
            role: 'FIELD_TECHNICIAN',
            orgId: org.id,
            assignedSiteIds: ['site-farm-zone-a', 'site-water-cluster-b'],
            createdAt: new Date().toISOString()
        }
    ];
    seedUsers.forEach(u => database_1.db.users.set(u.id, u));
    // 7. Anomaly ML Models
    const anomalyModels = [
        {
            id: 'model-soil-iforest-v2',
            name: 'Agritech Seasonal Autoencoder + Isolation Forest',
            deviceTypeId: typeSoil.id,
            version: 'v2.2.0-iforest',
            algorithm: 'ISOLATION_FOREST',
            trainingTimestamp: '2026-08-15T00:00:00Z',
            featureNames: ['soil_moisture_pct', 'soil_temp_celsius', 'soil_conductivity_us_cm', 'rate_of_change_moisture'],
            baselineMetrics: {
                f1Score: 0.942,
                precision: 0.961,
                recall: 0.925,
                trainingSampleSize: 85000
            },
            driftScore: 0.04,
            activeStatus: 'ACTIVE'
        },
        {
            id: 'model-water-multivariate-v3',
            name: 'Aqueduct Pressure & Flow Mahalanobis Ensemble',
            deviceTypeId: typeWater.id,
            version: 'v3.1.0-mahalanobis',
            algorithm: 'MAHALANOBIS',
            trainingTimestamp: '2026-08-20T00:00:00Z',
            featureNames: ['flow_rate_liters_min', 'line_pressure_psi', 'valve_aperture_pct', 'flow_to_pressure_ratio'],
            baselineMetrics: {
                f1Score: 0.978,
                precision: 0.985,
                recall: 0.971,
                trainingSampleSize: 142000
            },
            driftScore: 0.02,
            activeStatus: 'ACTIVE'
        },
        {
            id: 'model-meter-outlier-v4',
            name: 'Smart Meter Dynamic Load Isolation Forest',
            deviceTypeId: typeMeter.id,
            version: 'v4.0.1-iforest',
            algorithm: 'ISOLATION_FOREST',
            trainingTimestamp: '2026-08-25T00:00:00Z',
            featureNames: ['active_power_kw', 'grid_voltage_v', 'current_amp', 'power_factor', 'frequency_hz'],
            baselineMetrics: {
                f1Score: 0.953,
                precision: 0.970,
                recall: 0.938,
                trainingSampleSize: 210000
            },
            driftScore: 0.03,
            activeStatus: 'ACTIVE'
        }
    ];
    anomalyModels.forEach(m => database_1.db.anomalyModels.set(m.id, m));
    // 8. Provision ~200 Devices across the 3 Sites & Fleets
    const deviceConfigs = [
        { count: 70, type: typeSoil, site: sites[0], group: groups[0], prefix: 'SOIL-N', fw: 'v2.4.1' },
        { count: 30, type: typeSoil, site: sites[0], group: groups[1], prefix: 'SOIL-GH', fw: 'v2.4.1' },
        { count: 40, type: typeWater, site: sites[1], group: groups[2], prefix: 'WATR-V', fw: 'v3.1.0' },
        { count: 60, type: typeMeter, site: sites[2], group: groups[3], prefix: 'MTR-IND', fw: 'v4.0.2' }
    ];
    let deviceIndex = 1001;
    for (const cfg of deviceConfigs) {
        for (let i = 1; i <= cfg.count; i++) {
            const serialNumber = `${cfg.prefix}-${String(i).padStart(3, '0')}`;
            const deviceId = `dev-${deviceIndex++}`;
            // Issue real X.509 Certificate via PKI Authority
            const cert = certManager_1.certManager.issueCertificateForDevice({
                deviceId,
                serialNumber,
                orgSlug: org.slug,
                siteCode: cfg.site.code
            });
            // Special cases for demonstration:
            let lifecycleState = 'ACTIVE';
            let fwVersion = cfg.fw;
            let isQuarantined = false;
            let quarantineReason = undefined;
            // Device 1012: Suspicious device with outdated vulnerable firmware
            if (serialNumber === 'SOIL-N-012') {
                fwVersion = 'v1.9.0';
                lifecycleState = 'SUSPECTED';
            }
            // Device 1025: Quarantined device (tampering detected)
            if (serialNumber === 'SOIL-N-025') {
                lifecycleState = 'QUARANTINED';
                isQuarantined = true;
                quarantineReason = 'Automated Quarantine: Severe RF Signal Drift and Telemetry Spoofing';
            }
            // Device 1115: Water valve flagged for high pressure anomaly
            if (serialNumber === 'WATR-V-005') {
                lifecycleState = 'SUSPECTED';
            }
            const device = {
                id: deviceId,
                serialNumber,
                orgId: org.id,
                siteId: cfg.site.id,
                groupId: cfg.group.id,
                deviceTypeId: cfg.type.id,
                name: `${cfg.type.name} #${i}`,
                lifecycleState,
                connectivityType: cfg.type.category === 'AGRICULTURE' ? 'LORAWAN_BRIDGE' : (cfg.type.category === 'WATER' ? 'CELLULAR_DIRECT' : 'MQTT_TLS'),
                ipAddress: `10.${cfg.site.code.includes('AGRI') ? '14' : (cfg.site.code.includes('WATR') ? '22' : '38')}.${Math.floor(i / 254) + 1}.${(i % 254) + 1}`,
                macAddress: `00:E0:4C:${(i % 90 + 10).toString(16).toUpperCase()}:${Math.floor(Math.random() * 256).toString(16).padStart(2, '0').toUpperCase()}:${Math.floor(Math.random() * 256).toString(16).padStart(2, '0').toUpperCase()}`,
                firmwareVersion: fwVersion,
                consecutiveAuthFailures: 0,
                certificateId: cert.id,
                isQuarantined,
                quarantineReason,
                lastSeenAt: new Date(Date.now() - Math.floor(Math.random() * 60000)).toISOString(),
                lastHeartbeatAt: new Date(Date.now() - Math.floor(Math.random() * 30000)).toISOString(),
                createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
                updatedAt: new Date().toISOString()
            };
            database_1.db.saveDevice(device);
            // Generate seed telemetry history (past 20 readings per device)
            generateInitialTelemetryHistory(device, cfg.type);
        }
    }
    // 9. Initial Audit Log
    database_1.db.appendAuditLog({
        orgId: org.id,
        actorId: 'system-bootstrap',
        actorEmail: 'system@nexora.internal',
        actorRole: 'SUPER_ADMIN',
        action: 'INITIALIZE_FLEET_REGISTRY',
        resourceType: 'POLICY',
        resourceId: 'fleet-core',
        details: {
            totalDevices: database_1.db.devices.size,
            totalSites: database_1.db.sites.size,
            rootCaFingerprint: certManager_1.certManager.getCRL().length
        }
    });
    console.log(`[SEED] Successfully provisioned ${database_1.db.devices.size} devices across ${database_1.db.sites.size} sites with X.509 PKI credentials.`);
}
function generateInitialTelemetryHistory(device, deviceType) {
    const count = 20;
    const now = Date.now();
    const interval = deviceType.telemetrySchema.heartbeatIntervalSec * 1000;
    for (let i = count; i >= 0; i--) {
        const timestamp = new Date(now - i * interval).toISOString();
        const values = {};
        if (deviceType.category === 'AGRICULTURE') {
            const baseMoisture = 42 + Math.sin(i * 0.3) * 6;
            values['soil_moisture_pct'] = parseFloat((baseMoisture + (Math.random() * 2 - 1)).toFixed(1));
            values['soil_temp_celsius'] = parseFloat((22 + Math.sin(i * 0.1) * 4 + (Math.random() * 1 - 0.5)).toFixed(1));
            values['soil_conductivity_us_cm'] = Math.round(720 + Math.random() * 40);
            values['battery_pct'] = parseFloat((95 - i * 0.05).toFixed(1));
        }
        else if (deviceType.category === 'WATER') {
            const baseFlow = 280 + Math.sin(i * 0.5) * 40;
            values['flow_rate_liters_min'] = parseFloat((baseFlow + (Math.random() * 10 - 5)).toFixed(1));
            values['line_pressure_psi'] = parseFloat((65 + Math.random() * 4 - 2).toFixed(1));
            values['valve_aperture_pct'] = 75;
            values['water_temp_c'] = parseFloat((16.5 + Math.random() * 1).toFixed(1));
        }
        else {
            const baseKw = 45 + Math.sin(i * 0.4) * 15;
            values['active_power_kw'] = parseFloat((baseKw + (Math.random() * 3 - 1.5)).toFixed(2));
            values['grid_voltage_v'] = parseFloat((230 + Math.random() * 2 - 1).toFixed(1));
            values['current_amp'] = parseFloat((values['active_power_kw'] * 4.3).toFixed(1));
            values['power_factor'] = parseFloat((0.96 + Math.random() * 0.02 - 0.01).toFixed(3));
            values['frequency_hz'] = parseFloat((60.0 + (Math.random() * 0.06 - 0.03)).toFixed(2));
        }
        database_1.db.recordTelemetry({
            id: `tel-${device.id}-${count - i}`,
            deviceId: device.id,
            orgId: device.orgId,
            siteId: device.siteId,
            deviceTypeId: device.deviceTypeId,
            timestamp,
            values,
            rawPayloadSize: JSON.stringify(values).length,
            tier1Status: 'NORMAL',
            tier1Violations: []
        });
    }
}
