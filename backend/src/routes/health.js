import express from 'express';
import { getDB } from '../config/database.js';

const router = express.Router();

router.get('/', async (_req, res) => {
  try {
    const db = getDB();
    await db.admin().ping();
    res.json({ status: 'healthy', database: 'connected', timestamp: new Date().toISOString() });
  } catch (e) {
    res.status(503).json({ status: 'unhealthy', database: 'disconnected' });
  }
});

router.get('/ready', async (_req, res) => {
  try {
    const db = getDB();
    await db.admin().ping();
    res.json({ ready: true });
  } catch (e) {
    res.status(503).json({ ready: false });
  }
});

export default router;


