# Real-Time Analytics Dashboard

A full-stack real-time analytics dashboard with a Ramotion-style glassmorphism UI. Backend: Node.js, Express, Socket.IO, MongoDB. Frontend: React (Vite), Chart.js.

## Run Commands

**📋 See [RUN.md](./RUN.md) for minimal command list**

### Quick Run
```bash
# 1. MongoDB
brew services start mongodb/brew/mongodb-community@7.0

# 2. Backend (Terminal 1)
cd backend && npm run dev

# 3. Frontend (Terminal 2)
cd frontend && npm run dev

# 4. Traffic (Terminal 3)
cd backend
TOKEN=$(node -e "console.log(require('jsonwebtoken').sign({userId:'demo-user'}, 'your-super-secret-jwt-key-change-in-production'))")
npm run load -- --token=$TOKEN
```

**Access:** http://localhost:5173 | http://localhost:3000

## Notes
- WebSocket auth expects `VITE_JWT_TOKEN`/`JWT_SECRET` (defaults allow demo).
- Use the "Generate Demo Data" button to stream synthetic events.

## Feature Checklist (Nimbus requirements)

- Event ingestion & schema: Joi-validated JSON (timestamp, userId/sessionId, route, action, metadata); rejects malformed payloads.
- Transport options: primary WebSocket ingestion; REST fallback at `POST /api/events`.
- Rolling aggregates: server-side windows 1s/5s/60s with counts, uniques, error rate; debounced persistence.
- Real-time broadcast: room-based Socket.IO with interval emissions; reconnect request provides replay (`reconnect-request`).
- Charts & UI (React + Chart.js): live line/bar charts with smooth gradients; time-range controls; empty states.
- Persistence strategy: MongoDB collections for raw events and materialized aggregates; optional 7‑day TTL on raw events.
- Accuracy & ordering: idempotent `clientEventId`; server timestamps `serverReceivedAt` to mitigate clock skew.
- Performance & throttling: API rate limit; per-socket token‑bucket (50 evt/s) and payload size checks; debounced DB writes.
- Security: JWT-protected REST/WS; CORS; schema validation.
- Observability: `/metrics` JSON (uptime, memory, counts); `/health` and `/health/ready` endpoints; structured console logs.
- Testing & demo: WebSocket load generator (`npm run load`) to simulate traffic; UI button for demo events.
- Dev & ops: Docker Compose, env-based config, Makefile scripts for install/build/dev.


