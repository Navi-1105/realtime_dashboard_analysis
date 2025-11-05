import express from 'express';
import { AggregationService } from '../services/aggregationService.js';

const router = express.Router();
const aggregationService = new AggregationService();

router.get('/latest', async (_req, res) => {
  try {
    const aggregates = await aggregationService.getLatestAggregates();
    res.json({ aggregates });
  } catch (e) {
    res.status(500).json({ error: 'failed_to_get_aggregates' });
  }
});

export default router;


