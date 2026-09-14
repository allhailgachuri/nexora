"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = require("../db/database");
const incidentManager_1 = require("../security/incidentManager");
const playbookEngine_1 = require("../security/playbookEngine");
const modelRegistry_1 = require("../ml/modelRegistry");
const router = (0, express_1.Router)();
// Get all incidents
router.get('/', (req, res) => {
    const { status, severity, siteId } = req.query;
    let list = database_1.db.getAllIncidents();
    if (status)
        list = list.filter(i => i.status === status);
    if (severity)
        list = list.filter(i => i.severity === severity);
    if (siteId)
        list = list.filter(i => i.siteId === siteId);
    res.json({ success: true, count: list.length, incidents: list });
});
// Get single incident details
router.get('/:id', (req, res) => {
    const incident = database_1.db.getIncidentById(req.params.id);
    if (!incident)
        return res.status(404).json({ success: false, error: 'Incident not found' });
    const device = incident.deviceId ? database_1.db.getDeviceById(incident.deviceId) : undefined;
    const securityEvents = incident.securityEventIds.map(id => database_1.db.securityEvents.get(id)).filter(Boolean);
    const anomalyEvents = incident.anomalyEventIds.map(id => database_1.db.anomalyEvents.get(id)).filter(Boolean);
    res.json({
        success: true,
        incident,
        device,
        securityEvents,
        anomalyEvents
    });
});
// Create manual incident
router.post('/', (req, res) => {
    const { title, description, severity, deviceId, siteId, actorEmail } = req.body;
    if (!title || !severity) {
        return res.status(400).json({ success: false, error: 'Missing title or severity' });
    }
    const incident = incidentManager_1.IncidentManager.createIncident({
        orgId: 'org-nexora-prod',
        siteId,
        deviceId,
        title,
        description: description || '',
        severity,
        actorEmail
    });
    res.json({ success: true, incident });
});
// Update incident status
router.put('/:id/status', (req, res) => {
    const { status, rootCauseAnalysis, actorEmail } = req.body;
    try {
        const updated = incidentManager_1.IncidentManager.updateStatus(req.params.id, status, actorEmail || 'analyst@nexora.io', rootCauseAnalysis);
        res.json({ success: true, incident: updated });
    }
    catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});
// Assign analyst to incident
router.put('/:id/assign', (req, res) => {
    const { analystId, actorEmail } = req.body;
    try {
        const updated = incidentManager_1.IncidentManager.assignAnalyst(req.params.id, analystId, actorEmail || 'admin@nexora.io');
        res.json({ success: true, incident: updated });
    }
    catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});
// Add comment to incident
router.post('/:id/comments', (req, res) => {
    const { comment, userId, userName } = req.body;
    if (!comment)
        return res.status(400).json({ success: false, error: 'Missing comment text' });
    try {
        const commentObj = incidentManager_1.IncidentManager.addComment(req.params.id, userId || 'user-analyst', userName || 'Marcus Vance (Security Analyst)', comment);
        res.json({ success: true, comment: commentObj });
    }
    catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});
// Execute response playbook action
router.post('/:id/actions', (req, res) => {
    const { actionType, actorId, actorEmail, actorRole, forceApproval } = req.body;
    if (!actionType)
        return res.status(400).json({ success: false, error: 'Missing actionType' });
    try {
        const result = playbookEngine_1.PlaybookEngine.executeAction({
            incidentId: req.params.id,
            actionType,
            actorId: actorId || 'user-analyst',
            actorEmail: actorEmail || 'analyst@nexora.io',
            actorRole: actorRole || 'SECURITY_ANALYST',
            forceApproval: Boolean(forceApproval)
        });
        res.json({
            success: true,
            action: result.action,
            requiresHumanApproval: result.requiresHumanApproval
        });
    }
    catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});
// Human Approval Gate: Approve safety-gated action
router.post('/:id/actions/:actionId/approve', (req, res) => {
    const { approverId, approverEmail, approverRole } = req.body;
    const result = playbookEngine_1.PlaybookEngine.approveGatedAction({
        incidentId: req.params.id,
        actionId: req.params.actionId,
        approverId: approverId || 'user-admin',
        approverEmail: approverEmail || 'admin@nexora.io',
        approverRole: approverRole || 'SUPER_ADMIN'
    });
    if (!result.success) {
        return res.status(400).json(result);
    }
    res.json(result);
});
// Record analyst feedback on ML anomaly
router.post('/anomalies/:id/disposition', (req, res) => {
    const { disposition } = req.body; // 'CONFIRMED_THREAT' | 'FALSE_POSITIVE'
    const anom = database_1.db.anomalyEvents.get(req.params.id);
    if (!anom)
        return res.status(404).json({ success: false, error: 'Anomaly event not found' });
    anom.status = disposition;
    modelRegistry_1.modelRegistry.recordAnalystFeedback(anom.modelId, disposition);
    res.json({ success: true, anomaly: anom });
});
// Get security events list
router.get('/events/security', (req, res) => {
    const list = Array.from(database_1.db.securityEvents.values()).reverse().slice(0, 100);
    res.json({ success: true, count: list.length, events: list });
});
// Get anomaly events list (with SHAP values)
router.get('/events/anomalies', (req, res) => {
    const list = Array.from(database_1.db.anomalyEvents.values()).reverse().slice(0, 100);
    res.json({ success: true, count: list.length, events: list });
});
exports.default = router;
