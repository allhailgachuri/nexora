import { Router } from 'express';
import { AuditLogService } from '../security/auditLog';

const router = Router();

router.get('/', (req, res) => {
  const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 100;
  const logs = AuditLogService.getLogs(limit);
  res.json({ success: true, count: logs.length, logs });
});

router.get('/verify', (req, res) => {
  const verification = AuditLogService.verifyIntegrity();
  res.json({ success: true, verification });
});

export default router;
