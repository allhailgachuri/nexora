import { Router } from 'express';
import { FirmwareManager } from '../security/firmwareManager';

const router = Router();

router.get('/', (req, res) => {
  const firmwares = FirmwareManager.getAllFirmware();
  res.json({ success: true, firmwares });
});

router.get('/compliance', (req, res) => {
  const summary = FirmwareManager.getFleetComplianceSummary();
  res.json({ success: true, compliance: summary });
});

router.post('/ota', (req, res) => {
  const { deviceId, targetVersion, actorEmail } = req.body;
  if (!deviceId || !targetVersion) {
    return res.status(400).json({ success: false, error: 'Missing deviceId or targetVersion' });
  }

  const result = FirmwareManager.triggerOtaUpdate({
    deviceId,
    targetVersion,
    actorEmail: actorEmail || 'admin@nexora.io'
  });

  if (!result.success) {
    return res.status(400).json(result);
  }

  res.json(result);
});

export default router;
