import { Router } from 'express';
import { db } from '../db/database';

const router = Router();

router.get('/users', (req, res) => {
  const users = Array.from(db.users.values());
  res.json({ success: true, users });
});

router.post('/login', (req, res) => {
  const { email } = req.body;
  const user = Array.from(db.users.values()).find(u => u.email === email) || Array.from(db.users.values())[0];
  
  res.json({
    success: true,
    user,
    token: `jwt-${user.id}-${Date.now()}`
  });
});

export default router;
