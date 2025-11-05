import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'analytics';

let client = null;
let db = null;

export async function connectDB() {
  if (db) return db;
  client = new MongoClient(MONGODB_URI);
  await client.connect();
  db = client.db(DB_NAME);
  await createIndexes();
  console.log('Connected to MongoDB');
  return db;
}

export function getDB() {
  if (!db) throw new Error('Database not connected');
  return db;
}

async function createIndexes() {
  const events = db.collection('events');
  const aggregates = db.collection('aggregates');
  await events.createIndex({ timestamp: -1 });
  await events.createIndex({ clientEventId: 1 }, { unique: true, sparse: true });
  // Optional TTL for raw events (7 days) – comment out if you need to keep forever
  try {
    await events.createIndex({ storedAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 7 });
  } catch {}
  await aggregates.createIndex({ window: 1, timestamp: -1 });
}


