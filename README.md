# Real-Time Analytics Dashboard

A full-stack real-time analytics dashboard with a Ramotion-style glassmorphism UI. Backend: Node.js, Express, Socket.IO, MongoDB. Frontend: React (Vite), Chart.js.

## Run locally

1. Install deps

```
make install
```

2. Start MongoDB via Docker (or use docker-compose):

```
docker run -d -p 27017:27017 --name mongodb mongo:7
```

3. Backend env

```
cp backend/.env.example backend/.env
```

4. Start dev servers

```
make backend-dev
make frontend-dev
```

Or start everything with Docker:

```
make dev
```

Frontend: http://localhost:5173
Backend: http://localhost:3000

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


