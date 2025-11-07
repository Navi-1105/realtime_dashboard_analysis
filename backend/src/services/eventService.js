import { getDB } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

export class EventService {
  constructor() {
    this.collection = null;
  }

  async getCollection() {
    if (!this.collection) {
      const db = getDB();
      this.collection = db.collection('events');
    }
    return this.collection;
  }

  async storeEvent(event) {
    const collection = await this.getCollection();

    if (event.clientEventId) {
      const existing = await collection.findOne({ clientEventId: event.clientEventId });
      if (existing) return existing;
    }

    const doc = { _id: uuidv4(), ...event, storedAt: new Date() };
    try {
      await collection.insertOne(doc);
      return doc;
    } catch (err) {
      // Handle duplicate key error (race condition with unique index)
      if (err.code === 11000 || err.codeName === 'DuplicateKey') {
        // Return existing document if duplicate
        const existing = await collection.findOne({ clientEventId: event.clientEventId });
        if (existing) return existing;
      }
      throw err;
    }
  }

  async getRecentEvents(limit = 100) {
    const collection = await this.getCollection();
    return collection.find({}).sort({ timestamp: -1 }).limit(limit).toArray();
  }
}


