/*
  DB setup: indexes, TTL, and schema validation for events/aggregates.
  Usage: node scripts/setup_indexes.js
  Uses .env (DB_NAME, MONGODB_URI)
*/
import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

dotenv.config();

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = process.env.DB_NAME || 'analytics';

async function main() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);
  const events = db.collection('events');
  const aggregates = db.collection('aggregates');

  console.log(`Applying indexes/validators on db=${dbName} at ${uri}`);

  // 1) EVENTS indexes
  async function safeIndex(col, keys, options) {
    try { await col.createIndex(keys, options); }
    catch (e) {
      if (![68, 85].includes(e?.code)) throw e; // 68: already exists, 85: options conflict
    }
  }

  await safeIndex(events, { clientEventId: 1 }, { unique: true, partialFilterExpression: { clientEventId: { $exists: true } }, name: 'uniq_clientEventId_partial' });
  await safeIndex(events, { storedAt: 1 }, { expireAfterSeconds: 7 * 24 * 3600, name: 'ttl_storedAt_7d' });
  await safeIndex(events, { route: 1, timestamp: -1 }, { name: 'route_ts_idx' });
  await safeIndex(events, { userId: 1, timestamp: -1 }, { name: 'user_ts_idx' });
  await safeIndex(events, { sessionId: 1, timestamp: -1 }, { name: 'session_ts_idx' });

  // 2) AGGREGATES indexes
  await safeIndex(aggregates, { window: 1, route: 1, windowStart: -1 }, { name: 'agg_window_route_windowStart_idx' });
  await safeIndex(aggregates, { window: 1, timestamp: -1 }, { name: 'agg_window_timestamp_idx' });

  // 3) JSON Schema validator on events
  await db.command({
    collMod: 'events',
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['timestamp', 'storedAt'],
        properties: {
          _id: { bsonType: 'string' },
          clientEventId: { bsonType: ['string', 'null'] },
          timestamp: { bsonType: 'date' },
          storedAt: { bsonType: 'date' },
          userId: { bsonType: ['string', 'null'] },
          sessionId: { bsonType: ['string', 'null'] },
          route: { bsonType: ['string', 'null'] },
          action: { bsonType: ['string', 'null'] },
          metadata: { bsonType: ['object', 'null'] }
        }
      }
    },
    validationLevel: 'moderate',
    validationAction: 'warn'
  });

  const idx = await events.indexes();
  console.log('events indexes:', idx.map(i => i.name));
  const aggIdx = await aggregates.indexes();
  console.log('aggregates indexes:', aggIdx.map(i => i.name));

  await client.close();
  console.log('DB setup complete.');
}

main().catch(err => {
  console.error('DB setup failed:', err);
  process.exit(1);
});


