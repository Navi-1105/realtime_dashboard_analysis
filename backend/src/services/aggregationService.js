import { getDB } from '../config/database.js';

export class AggregationService {
  constructor() {
    this.collection = null;
    this.windowAggregates = new Map();
    this.initialized = false;
  }

  async getCollection() {
    if (!this.collection) {
      const db = getDB();
      this.collection = db.collection('aggregates');
    }
    return this.collection;
  }

  async initialize() {
    if (this.initialized) return;
    this.initialized = true;
    // Load recent aggregates from DB to restore state after restart
    // Note: uniqueUsers/uniqueSessions are stored as counts in DB, so we restore
    // with empty Sets and accept that exact uniqueness tracking resets for current window
    const collection = await this.getCollection();
    const windows = [1000, 5000, 60000];
    const now = Date.now();
    
    for (const window of windows) {
      const windowStart = Math.floor(now / window) * window;
      const key = `${window}-${windowStart}`;
      const existing = await collection.findOne({ 
        window, 
        windowStart: new Date(windowStart) 
      });
      
      if (existing) {
        // Restore in-memory state from DB
        // Sets start empty - we can't restore exact user/session IDs, but counts are preserved
        this.windowAggregates.set(key, {
          window: existing.window,
          windowStart: existing.windowStart,
          timestamp: existing.timestamp || new Date(),
          totalEvents: existing.totalEvents || 0,
          uniqueUsers: new Set(), // Start fresh - exact tracking resets on restart
          uniqueSessions: new Set(), // Start fresh - exact tracking resets on restart
          routes: existing.routes || {},
          actions: existing.actions || {},
          errors: existing.errors || 0
        });
      }
    }
  }

  async processEvent(event) {
    await this.initialize();
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
      if (existing) {
        // Convert DB document (with number counts) to in-memory format (with Sets)
        this.windowAggregates.set(key, {
          window: existing.window,
          windowStart: existing.windowStart,
          timestamp: existing.timestamp || new Date(),
          totalEvents: existing.totalEvents || 0,
          uniqueUsers: new Set(), // Start fresh - can't restore exact IDs from count
          uniqueSessions: new Set(), // Start fresh - can't restore exact IDs from count
          routes: existing.routes || {},
          actions: existing.actions || {},
          errors: existing.errors || 0
        });
      } else {
        this.windowAggregates.set(key, {
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
      window: agg.window,
      windowStart: agg.windowStart,
      timestamp: new Date(),
      totalEvents: agg.totalEvents || 0,
      uniqueUsers: Array.from(agg.uniqueUsers || []).length,
      uniqueSessions: Array.from(agg.uniqueSessions || []).length,
      routes: agg.routes || {},
      actions: agg.actions || {},
      errors: agg.errors || 0
    };
    await collection.updateOne(
      { window: agg.window, windowStart: agg.windowStart },
      { $set: doc },
      { upsert: true }
    );
  }

  async getLatestAggregates() {
    await this.initialize();
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

  // Flush all pending aggregates to DB (for graceful shutdown)
  async flushAll() {
    const promises = [];
    for (const [key, agg] of this.windowAggregates.entries()) {
      if (agg._saveTimer) {
        clearTimeout(agg._saveTimer);
        agg._saveTimer = null;
      }
      promises.push(this.persistAggregate(agg));
    }
    await Promise.all(promises);
    console.log(`Flushed ${promises.length} aggregates to database`);
  }
}


