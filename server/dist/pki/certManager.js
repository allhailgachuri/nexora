"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.certManager = void 0;
const ca_1 = require("./ca");
const config_1 = require("../config");
class CertificateManager {
    static instance;
    certificates = new Map(); // id -> cert
    serialToId = new Map(); // serialNumber -> certId
    fingerprintToId = new Map(); // fingerprint -> certId
    revocationList = new Map(); // serialNumber -> record
    constructor() { }
    static getInstance() {
        if (!CertificateManager.instance) {
            CertificateManager.instance = new CertificateManager();
        }
        return CertificateManager.instance;
    }
    registerIssuedCertificate(cert) {
        this.certificates.set(cert.id, cert);
        this.serialToId.set(cert.serialNumber, cert.id);
        this.fingerprintToId.set(cert.fingerprintSha256, cert.id);
    }
    getCertificateById(id) {
        return this.certificates.get(id);
    }
    getCertificateByFingerprint(fingerprint) {
        const id = this.fingerprintToId.get(fingerprint);
        if (!id)
            return undefined;
        return this.certificates.get(id);
    }
    getCertificateBySerial(serialNumber) {
        const id = this.serialToId.get(serialNumber);
        if (!id)
            return undefined;
        return this.certificates.get(id);
    }
    getAllCertificates() {
        return Array.from(this.certificates.values());
    }
    getCRL() {
        return Array.from(this.revocationList.values());
    }
    /**
     * Issues a brand new X.509 certificate for a registered device
     */
    issueCertificateForDevice(params) {
        const certData = ca_1.pkiAuthority.issueDeviceCertificate(params);
        const deviceCert = {
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
    revokeCertificate(params) {
        let cert = this.getCertificateBySerial(params.serialNumberOrFingerprint) ||
            this.getCertificateByFingerprint(params.serialNumberOrFingerprint);
        if (!cert) {
            return { success: false, error: 'Certificate not found in PKI registry' };
        }
        cert.status = 'REVOKED';
        cert.revokedAt = new Date().toISOString();
        cert.revocationReason = params.reason;
        const record = {
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
    rotateDeviceCertificate(params) {
        // Find previous active cert for device
        const existingCerts = Array.from(this.certificates.values()).filter(c => c.deviceId === params.deviceId && c.status === 'ACTIVE');
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
    validateClientCertificate(certPem) {
        // Verify signature against Root CA
        const sigCheck = ca_1.pkiAuthority.verifyCertificateSignature(certPem);
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
    getExpiringCertificatesCount(withinDays = config_1.CONFIG.ROTATION_WINDOW_DAYS) {
        const now = new Date();
        const threshold = new Date();
        threshold.setDate(threshold.getDate() + withinDays);
        return Array.from(this.certificates.values()).filter(c => {
            if (c.status !== 'ACTIVE')
                return false;
            const exp = new Date(c.expiresAt);
            return exp > now && exp <= threshold;
        }).length;
    }
}
exports.certManager = CertificateManager.getInstance();
