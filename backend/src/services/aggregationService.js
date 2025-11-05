import { getDB } from '../config/database.js';

export class AggregationService {
  constructor() {
    this.collection = null;
    this.windowAggregates = new Map();
  }

  async getCollection() {
    if (!this.collection) {
      const db = getDB();
      this.collection = db.collection('aggregates');
    }
    return this.collection;
  }

  async processEvent(event) {
    const windows = [1000, 5000, 60000];
    for (const window of windows) {
      await this.updateWindowAggregate(window, event);
    }
  }

  async updateWindowAggregate(window, event) {
    const now = Date.now();
    const windowStart = Math.floor(now / window) * window;
    const key = `${window}-${windowStart}`;
    const collection = await this.getCollection();

    if (!this.windowAggregates.has(key)) {
      const existing = await collection.findOne({ window, windowStart: new Date(windowStart) });
      this.windowAggregates.set(key, existing || {
        window,
        windowStart: new Date(windowStart),
        timestamp: new Date(),
        totalEvents: 0,
        uniqueUsers: new Set(),
        uniqueSessions: new Set(),
        routes: {},
        actions: {},
        errors: 0
      });
    }

    const agg = this.windowAggregates.get(key);
    agg.totalEvents += 1;
    if (event.userId) agg.uniqueUsers.add(event.userId);
    if (event.sessionId) agg.uniqueSessions.add(event.sessionId);
    agg.routes[event.route] = (agg.routes[event.route] || 0) + 1;
    agg.actions[event.action] = (agg.actions[event.action] || 0) + 1;
    if (event.action === 'error' || event.metadata?.error) agg.errors += 1;

    clearTimeout(agg._saveTimer);
    agg._saveTimer = setTimeout(async () => {
      await this.persistAggregate(agg);
    }, 800);
  }

  async persistAggregate(agg) {
    const collection = await this.getCollection();
    const doc = {
      ...agg,
      uniqueUsers: Array.from(agg.uniqueUsers).length,
      uniqueSessions: Array.from(agg.uniqueSessions).length,
      timestamp: new Date()
    };
    await collection.updateOne(
      { window: agg.window, windowStart: agg.windowStart },
      { $set: doc },
      { upsert: true }
    );
  }

  async getLatestAggregates() {
    const windows = [1000, 5000, 60000];
    const out = {};
    for (const w of windows) out[w] = await this.getWindowAggregates(w);
    return out;
  }

  async getWindowAggregates(window) {
    const collection = await this.getCollection();
    const latest = await collection.findOne({ window }, { sort: { timestamp: -1 } });
    if (latest) {
      return {
        window: latest.window,
        totalEvents: latest.totalEvents,
        uniqueUsers: latest.uniqueUsers,
        uniqueSessions: latest.uniqueSessions,
        routes: latest.routes,
        actions: latest.actions,
        errors: latest.errors,
        eventsPerSecond: latest.totalEvents / (window / 1000),
        timestamp: latest.timestamp
      };
    }
    return { window, totalEvents: 0, uniqueUsers: 0, uniqueSessions: 0, routes: {}, actions: {}, errors: 0, eventsPerSecond: 0, timestamp: new Date() };
  }
}


