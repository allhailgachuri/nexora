import { pkiAuthority } from './ca';
import { DeviceCertificate } from '../types';
import { CONFIG } from '../config';

export interface RevocationRecord {
  serialNumber: string;
  fingerprintSha256: string;
  deviceId: string;
  revokedAt: string;
  reason: 'KEY_COMPROMISE' | 'SUSPECTED_CLONING' | 'DECOMMISSIONED' | 'ANOMALY_QUARANTINE' | 'SUPERSEDED_ROTATION';
  revokedBy: string;
}

class CertificateManager {
  private static instance: CertificateManager;
  private certificates: Map<string, DeviceCertificate> = new Map(); // id -> cert
  private serialToId: Map<string, string> = new Map(); // serialNumber -> certId
  private fingerprintToId: Map<string, string> = new Map(); // fingerprint -> certId
  private revocationList: Map<string, RevocationRecord> = new Map(); // serialNumber -> record

  private constructor() {}

  public static getInstance(): CertificateManager {
    if (!CertificateManager.instance) {
      CertificateManager.instance = new CertificateManager();
    }
    return CertificateManager.instance;
  }

  public registerIssuedCertificate(cert: DeviceCertificate): void {
    this.certificates.set(cert.id, cert);
    this.serialToId.set(cert.serialNumber, cert.id);
    this.fingerprintToId.set(cert.fingerprintSha256, cert.id);
  }

  public getCertificateById(id: string): DeviceCertificate | undefined {
    return this.certificates.get(id);
  }

  public getCertificateByFingerprint(fingerprint: string): DeviceCertificate | undefined {
    const id = this.fingerprintToId.get(fingerprint);
    if (!id) return undefined;
    return this.certificates.get(id);
  }

  public getCertificateBySerial(serialNumber: string): DeviceCertificate | undefined {
    const id = this.serialToId.get(serialNumber);
    if (!id) return undefined;
    return this.certificates.get(id);
  }

  public getAllCertificates(): DeviceCertificate[] {
    return Array.from(this.certificates.values());
  }

  public getCRL(): RevocationRecord[] {
    return Array.from(this.revocationList.values());
  }

  /**
   * Issues a brand new X.509 certificate for a registered device
   */
  public issueCertificateForDevice(params: {
    deviceId: string;
    serialNumber: string;
    orgSlug: string;
    siteCode: string;
    validityDays?: number;
  }): DeviceCertificate {
    const certData = pkiAuthority.issueDeviceCertificate(params);

    const deviceCert: DeviceCertificate = {
      id: `cert-${params.deviceId}-${Date.now()}`,
      deviceId: params.deviceId,
      serialNumber: certData.serialNumber,
      fingerprintSha256: certData.fingerprintSha256,
      subjectCommonName: certData.subjectCommonName,
      subjectAltNames: certData.subjectAltNames,
      pem: certData.certificatePem,
      publicKeyPem: certData.publicKeyPem,
      issuedAt: certData.validFrom.toISOString(),
      expiresAt: certData.validTo.toISOString(),
      status: 'ACTIVE'
    };

    this.registerIssuedCertificate(deviceCert);
    return deviceCert;
  }

  /**
   * Revokes a certificate, adding it to the strict CRL list.
   * Connection attempts with revoked certs are rejected at handshake.
   */
  public revokeCertificate(params: {
    serialNumberOrFingerprint: string;
    reason: RevocationRecord['reason'];
    revokedBy: string;
  }): { success: boolean; certificate?: DeviceCertificate; error?: string } {
    let cert = this.getCertificateBySerial(params.serialNumberOrFingerprint) ||
               this.getCertificateByFingerprint(params.serialNumberOrFingerprint);

    if (!cert) {
      return { success: false, error: 'Certificate not found in PKI registry' };
    }

    cert.status = 'REVOKED';
    cert.revokedAt = new Date().toISOString();
    cert.revocationReason = params.reason;

    const record: RevocationRecord = {
      serialNumber: cert.serialNumber,
      fingerprintSha256: cert.fingerprintSha256,
      deviceId: cert.deviceId,
      revokedAt: cert.revokedAt,
      reason: params.reason,
      revokedBy: params.revokedBy
    };

    this.revocationList.set(cert.serialNumber, record);
    return { success: true, certificate: cert };
  }

  /**
   * Rotates a device certificate (issues new, revokes old as SUPERSEDED_ROTATION)
   */
  public rotateDeviceCertificate(params: {
    deviceId: string;
    serialNumber: string;
    orgSlug: string;
    siteCode: string;
    actor: string;
  }): { newCert: DeviceCertificate; oldCertRevoked?: boolean } {
    // Find previous active cert for device
    const existingCerts = Array.from(this.certificates.values()).filter(
      c => c.deviceId === params.deviceId && c.status === 'ACTIVE'
    );

    for (const oldCert of existingCerts) {
      this.revokeCertificate({
        serialNumberOrFingerprint: oldCert.serialNumber,
        reason: 'SUPERSEDED_ROTATION',
        revokedBy: params.actor
      });
    }

    const newCert = this.issueCertificateForDevice({
      deviceId: params.deviceId,
      serialNumber: params.serialNumber,
      orgSlug: params.orgSlug,
      siteCode: params.siteCode
    });

    return { newCert, oldCertRevoked: existingCerts.length > 0 };
  }

  /**
   * Full cryptographic and lifecycle validation of a client certificate
   */
  public validateClientCertificate(certPem: string): {
    isValid: boolean;
    deviceCert?: DeviceCertificate;
    isRevoked?: boolean;
    isExpired?: boolean;
    rejectionReason?: string;
  } {
    // Verify signature against Root CA
    const sigCheck = pkiAuthority.verifyCertificateSignature(certPem);
    if (!sigCheck.isValid) {
      return { isValid: false, rejectionReason: sigCheck.reason };
    }

    // Match in database
    const certs = Array.from(this.certificates.values());
    const matched = certs.find(c => c.pem.trim() === certPem.trim());

    if (!matched) {
      return { isValid: false, rejectionReason: 'Certificate signature valid but not registered in PKI ledger' };
    }

    // Check CRL
    if (matched.status === 'REVOKED' || this.revocationList.has(matched.serialNumber)) {
      return {
        isValid: false,
        deviceCert: matched,
        isRevoked: true,
        rejectionReason: `Certificate revoked: ${matched.revocationReason || 'CRL entry present'}`
      };
    }

    // Check Expiration
    const now = new Date();
    const expiresAt = new Date(matched.expiresAt);
    if (now > expiresAt) {
      matched.status = 'EXPIRED';
      return {
        isValid: false,
        deviceCert: matched,
        isExpired: true,
        rejectionReason: 'Certificate validity period has expired'
      };
    }

    return { isValid: true, deviceCert: matched };
  }

  public getExpiringCertificatesCount(withinDays: number = CONFIG.ROTATION_WINDOW_DAYS): number {
    const now = new Date();
    const threshold = new Date();
    threshold.setDate(threshold.getDate() + withinDays);

    return Array.from(this.certificates.values()).filter(c => {
      if (c.status !== 'ACTIVE') return false;
      const exp = new Date(c.expiresAt);
      return exp > now && exp <= threshold;
    }).length;
  }
}

export const certManager = CertificateManager.getInstance();
