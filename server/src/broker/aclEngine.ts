export interface TopicParseResult {
  isValidStructure: boolean;
  orgId?: string;
  siteId?: string;
  deviceId?: string;
  channel?: 'telemetry' | 'reported' | 'events' | 'desired' | 'ota' | 'commands';
  rawTopic: string;
}

export class TopicAclEngine {
  /**
   * Parses topic strings in the format: org/{orgId}/site/{siteId}/device/{deviceId}/{channel}
   */
  public static parseTopic(topic: string): TopicParseResult {
    const parts = topic.split('/');
    if (parts.length >= 6 && parts[0] === 'org' && parts[2] === 'site' && parts[4] === 'device') {
      const orgId = parts[1];
      const siteId = parts[3];
      const deviceId = parts[5];
      const channel = parts.slice(6).join('/') as any;
      return {
        isValidStructure: true,
        orgId,
        siteId,
        deviceId,
        channel: channel || 'telemetry',
        rawTopic: topic
      };
    }
    return {
      isValidStructure: false,
      rawTopic: topic
    };
  }

  /**
   * Authorizes whether an authenticated device is permitted to PUBLISH to a given topic
   */
  public static canDevicePublish(authenticatedDeviceId: string, authenticatedOrgId: string, topic: string): {
    allowed: boolean;
    reason?: string;
    isSpoofAttempt?: boolean;
    targetDeviceId?: string;
  } {
    // Wildcard publishing is strictly prohibited
    if (topic.includes('#') || topic.includes('+')) {
      return { allowed: false, reason: 'Wildcard publish prohibited by IoT Security Policy' };
    }

    const parsed = this.parseTopic(topic);
    if (!parsed.isValidStructure || !parsed.deviceId || !parsed.orgId) {
      return { allowed: false, reason: 'Malformed topic namespace. Must match org/{orgId}/site/{siteId}/device/{deviceId}/...' };
    }

    // Tenant mismatch
    if (parsed.orgId !== authenticatedOrgId) {
      return {
        allowed: false,
        reason: `Cross-tenant publish forbidden: Device in org ${authenticatedOrgId} tried to publish to ${parsed.orgId}`,
        isSpoofAttempt: true,
        targetDeviceId: parsed.deviceId
      };
    }

    // Cross-device topic spoofing attempt
    if (parsed.deviceId !== authenticatedDeviceId) {
      return {
        allowed: false,
        reason: `Rogue Topic Spoofing: Device ${authenticatedDeviceId} attempted to impersonate ${parsed.deviceId}`,
        isSpoofAttempt: true,
        targetDeviceId: parsed.deviceId
      };
    }

    // Allowed publish channels
    const allowedChannels = ['telemetry', 'state/reported', 'events', 'heartbeat'];
    if (!allowedChannels.some(c => parsed.rawTopic.endsWith(c) || parsed.channel === c)) {
      return { allowed: false, reason: `Unauthorized publish channel: ${parsed.channel}` };
    }

    return { allowed: true };
  }

  /**
   * Authorizes whether a device can SUBSCRIBE to a topic
   */
  public static canDeviceSubscribe(authenticatedDeviceId: string, authenticatedOrgId: string, topic: string): {
    allowed: boolean;
    reason?: string;
  } {
    if (topic.includes('#') || topic.includes('+')) {
      return { allowed: false, reason: 'Wildcard subscription prohibited for field devices' };
    }

    const parsed = this.parseTopic(topic);
    if (!parsed.isValidStructure || parsed.deviceId !== authenticatedDeviceId || parsed.orgId !== authenticatedOrgId) {
      return { allowed: false, reason: 'Device can only subscribe to its own device namespace' };
    }

    return { allowed: true };
  }
}
