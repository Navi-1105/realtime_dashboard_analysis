import express from 'express';
import { EventService } from '../services/eventService.js';
import { AggregationService } from '../services/aggregationService.js';
import { validateEvent } from '../middleware/validation.js';

const router = express.Router();
const eventService = new EventService();
const aggregationService = new AggregationService();

router.post('/', validateEvent, async (req, res) => {
  try {
    const event = {
      ...req.validatedEvent,
      timestamp: new Date(req.validatedEvent.timestamp || Date.now()),
      serverReceivedAt: new Date()
    };
    await eventService.storeEvent(event);
    await aggregationService.processEvent(event);
    res.status(201).json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to store event' });
  }
});

router.get('/recent', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const events = await eventService.getRecentEvents(limit);
    res.json({ events });
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

export default router;


