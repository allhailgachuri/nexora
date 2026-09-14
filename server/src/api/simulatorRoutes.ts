import { Router } from 'express';
import { fleetSimulator } from '../simulator/fleetSimulator';

const router = Router();

router.get('/status', (req, res) => {
  res.json({ success: true, status: fleetSimulator.getStatus() });
});

router.post('/start', (req, res) => {
  fleetSimulator.start();
  res.json({ success: true, status: fleetSimulator.getStatus() });
});

router.post('/stop', (req, res) => {
  fleetSimulator.stop();
  res.json({ success: true, status: fleetSimulator.getStatus() });
});

router.post('/inject/drift', (req, res) => {
  const { deviceId, field, rate } = req.body;
  if (!deviceId || !field) {
    return res.status(400).json({ success: false, error: 'Missing deviceId or field' });
  }
  const result = fleetSimulator.injectDrift(deviceId, field, rate ? Number(rate) : 2.5);
  res.json(result);
});

router.post('/inject/spike', (req, res) => {
  const { deviceId, field, spikeValue } = req.body;
  if (!deviceId || !field || spikeValue === undefined) {
    return res.status(400).json({ success: false, error: 'Missing deviceId, field, or spikeValue' });
  }
  const result = fleetSimulator.injectSpike(deviceId, field, Number(spikeValue));
  res.json(result);
});

router.post('/inject/freeze', (req, res) => {
  const { deviceId } = req.body;
  if (!deviceId) return res.status(400).json({ success: false, error: 'Missing deviceId' });
  const result = fleetSimulator.injectFrozenSensor(deviceId);
  res.json(result);
});

router.post('/attack/cloned-cert', (req, res) => {
  const { deviceId } = req.body;
  if (!deviceId) return res.status(400).json({ success: false, error: 'Missing deviceId' });
  const result = fleetSimulator.simulateClonedCertAttack(deviceId);
  res.json(result);
});

router.post('/attack/rogue-topic', (req, res) => {
  const { sourceDeviceId, targetDeviceId } = req.body;
  if (!sourceDeviceId || !targetDeviceId) {
    return res.status(400).json({ success: false, error: 'Missing sourceDeviceId or targetDeviceId' });
  }
  const result = fleetSimulator.simulateRogueTopicSpoof(sourceDeviceId, targetDeviceId);
  res.json(result);
});

router.post('/clear', (req, res) => {
  const { deviceId } = req.body;
  const result = fleetSimulator.clearAnomalies(deviceId);
  res.json(result);
});

export default router;
