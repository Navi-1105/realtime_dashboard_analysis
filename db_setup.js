// === CAPSTONE PROJECT: REALTIME DASHBOARD ANALYSIS ===
// This script ensures correct indexes, TTL, and schema validation
// Run inside MongoDB shell or from Node using db.eval / db.runCommand

// 1️⃣ EVENTS COLLECTION SETUP
use analytics;

// Create safer unique index for clientEventId
db.events.createIndex(
  { clientEventId: 1 },
  {
    unique: true,
    partialFilterExpression: { clientEventId: { $exists: true, $ne: null } },
    name: "uniq_clientEventId_partial"
  }
);

// TTL index on storedAt (auto-delete after 7 days)
db.events.createIndex(
  { storedAt: 1 },
  { expireAfterSeconds: 7 * 24 * 3600, name: "ttl_storedAt_7d" }
);

// Indexes for performance
db.events.createIndex({ route: 1, timestamp: -1 }, { name: "route_ts_idx" });
db.events.createIndex({ userId: 1, timestamp: -1 }, { name: "user_ts_idx" });
db.events.createIndex({ sessionId: 1, timestamp: -1 }, { name: "session_ts_idx" });

// Optional: TTL cleanup confirmation
db.events.getIndexes();

// 2️⃣ AGGREGATES COLLECTION SETUP
db.aggregates.createIndex(
  { window: 1, route: 1, windowStart: -1 },
  { name: "agg_window_route_windowStart_idx" }
);
db.aggregates.createIndex(
  { window: 1, timestamp: -1 },
  { name: "agg_window_timestamp_idx" }
);

// 3️⃣ JSON SCHEMA VALIDATOR FOR EVENTS
db.runCommand({
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

// Confirm applied validator
db.getCollectionInfos({ name: "events" });

// === END OF BLACKBOX COMMAND ===
