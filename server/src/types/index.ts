export type DeviceLifecycleState =
  | 'REGISTERED'
  | 'PROVISIONED'
  | 'ACTIVE'
  | 'SUSPECTED'
  | 'QUARANTINED'
  | 'REVOKED'
  | 'DECOMMISSIONED';

export type UserRole =
  | 'SUPER_ADMIN'
  | 'FLEET_ADMIN'
  | 'SECURITY_ANALYST'
  | 'FIELD_TECHNICIAN'
  | 'AUDITOR';

export type SeverityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type SecurityEventType =
  | 'AUTH_FAILURE'
  | 'CERT_REUSE'
  | 'ROGUE_TOPIC_ATTEMPT'
  | 'REPLAY_ATTACK'
  | 'REVOKED_CERT_USAGE'
  | 'EXPIRED_CERT_USAGE'
  | 'INVALID_SIGNATURE'
  | 'RATE_LIMIT_BREACH';

export type IncidentStatus =
  | 'OPEN'
  | 'TRIAGED'
  | 'INVESTIGATING'
  | 'RESOLVED'
  | 'CLOSED';

export type ActionType =
  | 'QUARANTINE_DEVICE'
  | 'REVOKE_CERTIFICATE'
  | 'ROTATE_CERTIFICATE'
  | 'FORCE_OTA_UPDATE'
  | 'BLOCK_TOPIC'
  | 'DISPATCH_TECHNICIAN'
  | 'REINSTATE_DEVICE'
  | 'ACKNOWLEDGE';

export type ActionStatus = 'PENDING_APPROVAL' | 'EXECUTED' | 'REJECTED' | 'FAILED';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  orgId: string;
  assignedSiteIds?: string[];
  createdAt: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
}

export interface Site {
  id: string;
  orgId: string;
  name: string;
  code: string;
  latitude: number;
  longitude: number;
  locationName: string;
  timezone: string;
}

export interface DeviceGroup {
  id: string;
  siteId: string;
  orgId: string;
  name: string;
  description: string;
}

export interface TelemetryFieldSchema {
  name: string;
  displayName: string;
  type: 'number' | 'boolean' | 'string';
  unit?: string;
  min?: number;
  max?: number;
  maxRateOfChange?: number; // max delta per minute
  isCritical?: boolean; // triggers human-approval if actuator or high impact
  required?: boolean;
}

export interface TelemetrySchema {
  id: string;
  deviceTypeId: string;
  version: string;
  fields: TelemetryFieldSchema[];
  heartbeatIntervalSec: number;
  maxHeartbeatToleranceSec: number;
}

export interface DeviceType {
  id: string;
  name: string;
  code: string;
  category: 'AGRICULTURE' | 'WATER' | 'ENERGY' | 'INDUSTRIAL' | 'GATEWAY' | 'CUSTOM';
  description: string;
  isActuatorOrCritical: boolean;
  telemetrySchema: TelemetrySchema;
  currentFirmwareVersion: string;
}

export interface DeviceCertificate {
  id: string;
  deviceId: string;
  serialNumber: string;
  fingerprintSha256: string;
  subjectCommonName: string;
  subjectAltNames: string[];
  pem: string;
  publicKeyPem: string;
  issuedAt: string;
  expiresAt: string;
  status: 'ACTIVE' | 'REVOKED' | 'EXPIRED';
  revokedAt?: string;
  revocationReason?: string;
}

export interface Device {
  id: string;
  serialNumber: string;
  orgId: string;
  siteId: string;
  groupId: string;
  deviceTypeId: string;
  name: string;
  lifecycleState: DeviceLifecycleState;
  connectivityType: 'MQTT_TLS' | 'LORAWAN_BRIDGE' | 'CELLULAR_DIRECT' | 'WIRED';
  ipAddress?: string;
  macAddress?: string;
  firmwareVersion: string;
  targetFirmwareVersion?: string;
  otaStatus?: 'IDLE' | 'DOWNLOADING' | 'VERIFYING' | 'APPLYING' | 'FAILED' | 'SUCCESS';
  lastSeenAt?: string;
  lastHeartbeatAt?: string;
  consecutiveAuthFailures: number;
  certificateId?: string;
  bootstrapToken?: string;
  bootstrapTokenExpiresAt?: string;
  isQuarantined: boolean;
  quarantineReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DeviceShadow {
  deviceId: string;
  version: number;
  desiredState: Record<string, any>;
  reportedState: Record<string, any>;
  delta: Record<string, any>;
  lastReportedAt: string;
  lastDesiredAt: string;
}

export interface TelemetryReading {
  id: string;
  deviceId: string;
  orgId: string;
  siteId: string;
  deviceTypeId: string;
  timestamp: string;
  values: Record<string, any>;
  rawPayloadSize: number;
  tier1Status: 'NORMAL' | 'ANOMALOUS';
  tier1Violations: string[];
}

export interface ShapValue {
  feature: string;
  value: number;
  baseline: number;
  shapScore: number;
  contributionPercent: number;
  isMajorDriver: boolean;
}

export interface AnomalyEvent {
  id: string;
  deviceId: string;
  orgId: string;
  siteId: string;
  deviceTypeId: string;
  timestamp: string;
  anomalyScore: number; // 0.0 to 1.0 (higher = more anomalous)
  anomalyType:
    | 'OUTLIER_DEVIATION'
    | 'SUDDEN_SPIKE'
    | 'SENSOR_DRIFT'
    | 'FROZEN_STUCK_SENSOR'
    | 'CADENCE_ANOMALY'
    | 'PEER_FLEET_DIVERGENCE'
    | 'RECONSTRUCTION_ERROR';
  modelId: string;
  modelVersion: string;
  contributingFeatures: string[];
  shapValues: ShapValue[];
  severity: SeverityLevel;
  status: 'UNREVIEWED' | 'CONFIRMED_THREAT' | 'FALSE_POSITIVE' | 'BENIGN_ANOMALY';
  readingSnapshot: Record<string, any>;
}

export interface SecurityEvent {
  id: string;
  deviceId?: string;
  deviceSerialNumber?: string;
  orgId: string;
  siteId?: string;
  timestamp: string;
  eventType: SecurityEventType;
  severity: SeverityLevel;
  clientIp?: string;
  attemptedTopic?: string;
  certificateFingerprint?: string;
  details: string;
  rawTelemetrySnippet?: string;
  status: 'NEW' | 'TRIAGED' | 'DISMISSED';
}

export interface IncidentAction {
  id: string;
  incidentId: string;
  actionType: ActionType;
  description: string;
  isAutomated: boolean;
  requiresApproval: boolean;
  status: ActionStatus;
  executedBy?: string;
  approvedBy?: string;
  executedAt?: string;
  resultDetails?: string;
}

export interface IncidentComment {
  id: string;
  incidentId: string;
  userId: string;
  userName: string;
  comment: string;
  createdAt: string;
}

export interface Incident {
  id: string;
  orgId: string;
  siteId?: string;
  deviceId?: string;
  title: string;
  description: string;
  severity: SeverityLevel;
  status: IncidentStatus;
  assignedTo?: string; // userId
  securityEventIds: string[];
  anomalyEventIds: string[];
  actions: IncidentAction[];
  comments: IncidentComment[];
  rootCauseAnalysis?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface FirmwareVersion {
  id: string;
  deviceTypeId: string;
  version: string;
  releaseDate: string;
  binaryHashSha256: string;
  signature: string;
  signerCommonName: string;
  fileSizeBytes: number;
  releaseNotes: string;
  isRevoked: boolean;
  hasKnownCve: boolean;
  cveIdentifiers?: string[];
  minHardwareVersion: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  orgId: string;
  actorId: string;
  actorEmail: string;
  actorRole: UserRole;
  action: string;
  resourceType:
    | 'DEVICE'
    | 'CERTIFICATE'
    | 'INCIDENT'
    | 'PLAYBOOK'
    | 'FIRMWARE'
    | 'SCHEMA'
    | 'AUTH'
    | 'POLICY';
  resourceId: string;
  details: Record<string, any>;
  ipAddress?: string;
  prevHash: string;
  hash: string;
}

export interface AnomalyModelInfo {
  id: string;
  name: string;
  deviceTypeId: string;
  version: string;
  algorithm: 'ISOLATION_FOREST' | 'AUTOENCODER' | 'ONE_CLASS_SVM' | 'MAHALANOBIS';
  trainingTimestamp: string;
  featureNames: string[];
  baselineMetrics: {
    f1Score: number;
    precision: number;
    recall: number;
    trainingSampleSize: number;
  };
  driftScore: number; // 0.0 - 1.0
  activeStatus: 'ACTIVE' | 'CANARY' | 'RETIRED';
}
