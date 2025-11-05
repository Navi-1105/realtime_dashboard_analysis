import express from 'express';
import { getDB } from '../config/database.js';

const router = express.Router();

// Simple JSON metrics for observability
router.get('/', async (_req, res) => {
  try {
    const db = getDB();
    const eventsCount = await db.collection('events').countDocuments({});
    const aggCount = await db.collection('aggregates').countDocuments({});
    res.json({
      uptimeSec: Math.round(process.uptime()),
      memory: process.memoryUsage(),
      eventsCount,
      aggregatesCount: aggCount,
      timestamp: new Date().toISOString()
    });
  } catch (e) {
    res.status(500).json({ error: 'metrics_error', message: e.message });
  }
});

export default router;


