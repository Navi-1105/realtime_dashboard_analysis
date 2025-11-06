import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'analytics';

async function setupDatabase() {
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    const db = client.db(DB_NAME);

    console.log('Setting up indexes and validation for events collection...');

    // Drop all existing indexes except _id to ensure clean setup
    try {
      await db.collection('events').dropIndexes();
      console.log('Dropped all existing indexes on events collection.');
    } catch (e) {
      console.log('No indexes to drop or error dropping:', e.message);
    }

    try {
      await db.collection('aggregates').dropIndexes();
      console.log('Dropped all existing indexes on aggregates collection.');
    } catch (e) {
      console.log('No indexes to drop or error dropping:', e.message);
    }

    // Create safer unique index for clientEventId
    try {
      await db.collection('events').createIndex(
        { clientEventId: 1 },
        {
          unique: true,
          sparse: true,
          name: "uniq_clientEventId_sparse"
        }
      );
      console.log('Created unique index on clientEventId.');
    } catch (e) {
      if (e.code === 85) {
        console.log('Index on clientEventId already exists.');
      } else {
        throw e;
      }
    }

    // TTL index on storedAt (auto-delete after 7 days)
    try {
      await db.collection('events').createIndex(
        { storedAt: 1 },
        { expireAfterSeconds: 7 * 24 * 3600, name: "ttl_storedAt_7d" }
      );
      console.log('Created TTL index on storedAt.');
    } catch (e) {
      if (e.code === 85) {
        console.log('TTL index on storedAt already exists.');
      } else {
        throw e;
      }
    }

    // Indexes for performance
    try {
      await db.collection('events').createIndex({ route: 1, timestamp: -1 }, { name: "route_ts_idx" });
      console.log('Created index on route and timestamp.');
    } catch (e) {
      if (e.code === 85) {
        console.log('Index on route and timestamp already exists.');
      } else {
        throw e;
      }
    }

    try {
      await db.collection('events').createIndex({ userId: 1, timestamp: -1 }, { name: "user_ts_idx" });
      console.log('Created index on userId and timestamp.');
    } catch (e) {
      if (e.code === 85) {
        console.log('Index on userId and timestamp already exists.');
      } else {
        throw e;
      }
    }

    try {
      await db.collection('events').createIndex({ sessionId: 1, timestamp: -1 }, { name: "session_ts_idx" });
      console.log('Created index on sessionId and timestamp.');
    } catch (e) {
      if (e.code === 85) {
        console.log('Index on sessionId and timestamp already exists.');
      } else {
        throw e;
      }
    }

    console.log('Events indexes created.');

    // Aggregates indexes
    try {
      await db.collection('aggregates').createIndex(
        { window: 1, route: 1, windowStart: -1 },
        { name: "agg_window_route_windowStart_idx" }
      );
      console.log('Created index on aggregates for window, route, windowStart.');
    } catch (e) {
      if (e.code === 85) {
        console.log('Index on aggregates for window, route, windowStart already exists.');
      } else {
        throw e;
      }
    }

    try {
      await db.collection('aggregates').createIndex(
        { window: 1, timestamp: -1 },
        { name: "agg_window_timestamp_idx" }
      );
      console.log('Created index on aggregates for window and timestamp.');
    } catch (e) {
      if (e.code === 85) {
        console.log('Index on aggregates for window and timestamp already exists.');
      } else {
        throw e;
      }
    }

    console.log('Aggregates indexes created.');

    // JSON Schema Validator for events
    try {
      await db.command({
        collMod: "events",
        validator: {
          $jsonSchema: {
            bsonType: "object",
            required: ["timestamp", "storedAt"],
            properties: {
              _id: { bsonType: "string" },
              clientEventId: { bsonType: ["string", "null"] },
              timestamp: { bsonType: "date" },
              storedAt: { bsonType: "date" },
              userId: { bsonType: ["string", "null"] },
              sessionId: { bsonType: ["string", "null"] },
              route: { bsonType: ["string", "null"] },
              action: { bsonType: ["string", "null"] },
              metadata: { bsonType: ["object", "null"] }
            }
          }
        },
        validationLevel: "moderate",
        validationAction: "warn"
      });
      console.log('Schema validation applied to events collection.');
    } catch (e) {
      console.log('Schema validation already applied or error:', e.message);
    }

    // Confirm indexes
    const indexes = await db.collection('events').indexes();
    console.log('Events indexes:', indexes);

    console.log('Database setup complete.');
  } catch (error) {
    console.error('Error setting up database:', error);
  } finally {
    await client.close();
  }
}

setupDatabase();
