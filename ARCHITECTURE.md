# System Architecture: Real-Time Analytics Dashboard

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  React Frontend (Vite)                                   │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │  │
│  │  │  Dashboard   │  │   Charts     │  │  WebSocket   │  │  │
│  │  │  Component   │→ │  (Chart.js)  │  │   Hook       │  │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  │  │
│  │         │                  │                  │          │  │
│  │         └──────────────────┴──────────────────┘          │  │
│  │                           │                              │  │
│  │                    ┌──────▼──────┐                       │  │
│  │                    │  REST API   │                       │  │
│  │                    │  (Axios)    │                       │  │
│  │                    └──────┬──────┘                       │  │
│  └───────────────────────────┼──────────────────────────────┘  │
│                              │                                  │
└──────────────────────────────┼──────────────────────────────────┘
                               │
                    ┌──────────┴──────────┐
                    │                    │
            ┌───────▼──────┐    ┌────────▼────────┐
            │  WebSocket   │    │   REST API       │
            │  (Socket.IO) │    │   (Express)      │
            └───────┬──────┘    └────────┬────────┘
                    │                    │
┌───────────────────┴────────────────────┴───────────────────────┐
│                    APPLICATION LAYER                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Node.js Backend (Express + Socket.IO)                  │  │
│  │                                                            │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │  │
│  │  │  WebSocket   │  │  REST       │  │  Middleware  │   │  │
│  │  │  Handler     │  │  Routes      │  │  (Auth,     │   │  │
│  │  │              │  │  /api/events│  │   RateLimit, │   │  │
│  │  └──────┬───────┘  └──────┬──────┘  │   Validate) │   │  │
│  │         │                 │          └──────┬───────┘   │  │
│  │         └─────────────────┴─────────────────┘          │  │
│  │                         │                               │  │
│  │         ┌───────────────▼───────────────┐              │  │
│  │         │    Event Service              │              │  │
│  │         │  - Store events               │              │  │
│  │         │  - Idempotency check          │              │  │
│  │         └───────────────┬───────────────┘              │  │
│  │                         │                               │  │
│  │         ┌───────────────▼───────────────┐              │  │
│  │         │  Aggregation Service          │              │  │
│  │         │  - Rolling windows (1s/5s/60s)│              │  │
│  │         │  - Real-time calculations     │              │  │
│  │         │  - Debounced persistence      │              │  │
│  │         └───────────────┬───────────────┘              │  │
│  │                         │                               │  │
│  │         ┌───────────────▼───────────────┐              │  │
│  │         │  Broadcast Service            │              │  │
│  │         │  - Room-based channels        │              │  │
│  │         │  - Interval emissions         │              │  │
│  │         └───────────────┬───────────────┘              │  │
│  └─────────────────────────┼───────────────────────────────┘  │
│                             │                                   │
└─────────────────────────────┼───────────────────────────────────┘
                               │
┌─────────────────────────────▼───────────────────────────────────┐
│                         DATA LAYER                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  MongoDB Database                                        │  │
│  │                                                            │  │
│  │  ┌──────────────────┐      ┌──────────────────┐         │  │
│  │  │  events          │      │  aggregates      │         │  │
│  │  │  Collection      │      │  Collection      │         │  │
│  │  │                  │      │                  │         │  │
│  │  │  - Raw events    │      │  - Window data   │         │  │
│  │  │  - TTL: 7 days   │      │  - Metrics      │         │  │
│  │  │  - Indexes:      │      │  - Indexes:     │         │  │
│  │  │    • timestamp   │      │    • window     │         │  │
│  │  │    • clientId    │      │    • timestamp  │         │  │
│  │  │    • route       │      │                  │         │  │
│  │  │    • userId      │      │                  │         │  │
│  │  │    • sessionId   │      │                  │         │  │
│  │  └──────────────────┘      └──────────────────┘         │  │
│  │                                                            │  │
│  │  Schema Validation: JSON Schema (moderate, warn)         │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

### Event Ingestion Flow

```
┌─────────┐
│ Client  │
│ (React) │
└────┬────┘
     │
     │ 1. User interaction / Load generator
     │
     ├─────────────────┐
     │                 │
     ▼                 ▼
┌──────────┐    ┌──────────┐
│ WebSocket│    │ REST API │
│ (Primary)│    │(Fallback)│
└────┬──────┘    └────┬─────┘
     │                │
     └────────┬───────┘
              │
              │ 2. Auth middleware (JWT)
              │
              ▼
     ┌─────────────────┐
     │ Validation      │
     │ (Joi schema)    │
     └────────┬────────┘
              │
              │ 3. Rate limiting (per socket + API)
              │
              ▼
     ┌─────────────────┐
     │ Event Service   │
     │ - Check dupes   │
     │ - Store event   │
     └────────┬────────┘
              │
              │ 4. Process aggregation
              │
              ▼
     ┌─────────────────┐
     │ Aggregation     │
     │ Service         │
     │ - Update windows│
     │ - Calculate     │
     └────────┬────────┘
              │
              ├──────────────┐
              │              │
              ▼              ▼
     ┌─────────────┐  ┌─────────────┐
     │ MongoDB     │  │ Broadcast   │
     │ (Persist)   │  │ (WebSocket) │
     └─────────────┘  └──────┬──────┘
                              │
                              │ 5. Real-time update
                              │
                              ▼
                       ┌─────────────┐
                       │ All Clients │
                       │ (Dashboard) │
                       └─────────────┘
```

### Real-Time Update Flow

```
┌─────────────────────────────────────────────────────────────┐
│  Aggregation Service (In-Memory Cache)                      │
│                                                              │
│  Window Aggregates:                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                   │
│  │ 1s window │  │ 5s window│  │ 60s win│                   │
│  │ - events  │  │ - events │  │ - events│                   │
│  │ - users   │  │ - users  │  │ - users │                   │
│  │ - routes  │  │ - routes │  │ - routes│                   │
│  └─────┬─────┘  └─────┬────┘  └─────┬────┘                  │
│        │              │             │                        │
│        └──────────────┴─────────────┘                        │
│                   │                                           │
│                   │ Interval timers (1s, 5s, 60s)            │
│                   ▼                                           │
│        ┌──────────────────────┐                             │
│        │  Broadcast Service   │                             │
│        │  - Emit deltas        │                             │
│        │  - Room-based         │                             │
│        └──────────┬────────────┘                             │
└───────────────────┼──────────────────────────────────────────┘
                    │
                    │ WebSocket emit
                    │
        ┌───────────▼───────────┐
        │  Connected Clients    │
        │  (Socket.IO rooms)     │
        └───────────┬───────────┘
                    │
        ┌───────────▼───────────┐
        │  React Components     │
        │  - Update state       │
        │  - Re-render charts   │
        └───────────────────────┘
```

## Component Architecture

### Backend Components

```
backend/
├── src/
│   ├── server.js              # Express app + HTTP server
│   ├── websocket.js           # Socket.IO setup + handlers
│   │
│   ├── config/
│   │   └── database.js        # MongoDB connection + indexes
│   │
│   ├── services/
│   │   ├── eventService.js    # Event storage + retrieval
│   │   └── aggregationService.js  # Rolling aggregates
│   │
│   ├── routes/
│   │   ├── events.js          # REST event endpoints
│   │   ├── health.js          # Health checks
│   │   ├── metrics.js         # Observability metrics
│   │   └── aggregates.js      # Aggregate REST endpoint
│   │
│   └── middleware/
│       ├── auth.js            # JWT validation
│       ├── rateLimiter.js     # API rate limiting
│       └── validation.js      # Joi schema validation
│
└── scripts/
    ├── load_generator.js      # Traffic simulation
    └── setup_indexes.js       # DB setup script
```

### Frontend Components

```
frontend/
├── src/
│   ├── App.jsx                # Root component (layout)
│   ├── index.jsx              # Entry point
│   │
│   ├── components/
│   │   ├── Dashboard.jsx     # Main dashboard container
│   │   └── Charts/
│   │       ├── ActiveUsersChart.jsx
│   │       ├── EventsPerSecondChart.jsx
│   │       ├── TopRoutesChart.jsx
│   │       └── ErrorRateChart.jsx
│   │
│   ├── hooks/
│   │   └── useWebSocket.js   # WebSocket connection hook
│   │
│   └── services/
│       ├── api.js             # REST API client
│       └── eventGenerator.js  # Client-side event generator
│
└── index.html
```

## Technology Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool & dev server
- **Chart.js + react-chartjs-2** - Data visualization
- **Socket.IO Client** - WebSocket communication
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime
- **Express** - HTTP server
- **Socket.IO** - WebSocket server
- **MongoDB** - Database
- **JWT (jsonwebtoken)** - Authentication
- **Joi** - Schema validation
- **express-rate-limit** - Rate limiting

### Infrastructure
- **Docker Compose** - Container orchestration
- **MongoDB** - Document database
- **Homebrew** - Local MongoDB (dev)

## Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Security Layers                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Transport Layer                                          │
│     ┌──────────────────────────────────────┐                │
│     │  CORS (Origin validation)            │                │
│     │  - Whitelisted frontend URL           │                │
│     └──────────────────────────────────────┘                │
│                                                              │
│  2. Authentication Layer                                     │
│     ┌──────────────────────────────────────┐                │
│     │  JWT Tokens                           │                │
│     │  - REST: Bearer token in header       │                │
│     │  - WebSocket: auth.token or query     │                │
│     │  - Dev mode: auto-allow (no token)    │                │
│     └──────────────────────────────────────┘                │
│                                                              │
│  3. Validation Layer                                         │
│     ┌──────────────────────────────────────┐                │
│     │  Schema Validation (Joi)            │                │
│     │  - Event structure                   │                │
│     │  - Required fields                   │                │
│     │  - Type checking                     │                │
│     └──────────────────────────────────────┘                │
│                                                              │
│  4. Rate Limiting Layer                                      │
│     ┌──────────────────────────────────────┐                │
│     │  Multi-level Protection               │                │
│     │  - API: 100 req/min per IP            │                │
│     │  - WebSocket: Token bucket (50/s)     │                │
│     │  - Payload size: 16KB max             │                │
│     └──────────────────────────────────────┘                │
│                                                              │
│  5. Database Layer                                           │
│     ┌──────────────────────────────────────┐                │
│     │  MongoDB Schema Validation           │                │
│     │  - JSON Schema (moderate, warn)      │                │
│     │  - Type enforcement                  │                │
│     └──────────────────────────────────────┘                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Performance Optimizations

### Backend
- **In-memory aggregation cache** - Fast window updates
- **Debounced persistence** - Batch DB writes (800ms)
- **Indexed queries** - Fast lookups on timestamp, route, userId
- **Connection pooling** - MongoDB client reuse
- **Token bucket rate limiting** - Per-socket backpressure

### Frontend
- **WebSocket real-time updates** - No polling overhead
- **REST fallback with polling** - Graceful degradation (2s interval)
- **React memoization** - Chart data computed once
- **Debounced UI updates** - Smooth rendering
- **Lazy chart rendering** - Chart.js on-demand

## Deployment Architecture

### Development (Local)
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Frontend  │────▶│   Backend   │────▶│  MongoDB    │
│  :5173     │     │   :3000     │     │  :27017     │
│  (Vite)    │     │  (Express)  │     │  (Local)    │
└─────────────┘     └─────────────┘     └─────────────┘
```

### Production (Docker Compose)
```
┌─────────────────────────────────────────────────────────┐
│                    Docker Network                        │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Frontend    │  │   Backend    │  │  MongoDB    │  │
│  │  Container   │──│  Container   │──│  Container   │  │
│  │  :5173       │  │  :3000       │  │  :27017      │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Observability

### Metrics Endpoints
- `GET /health` - Basic health check
- `GET /health/ready` - Readiness probe
- `GET /metrics` - System metrics (uptime, memory, counts)

### Logging
- Structured console logs
- Error tracking
- Connection events

### Monitoring Points
- Event ingestion rate
- Processing latency
- WebSocket connection count
- Database query performance
- Memory usage

## Scalability Considerations

### Horizontal Scaling
- **Stateless backend** - Can run multiple instances
- **MongoDB replica sets** - Database scaling
- **Load balancer** - Distribute WebSocket connections
- **Redis pub/sub** - Share WebSocket state across instances

### Vertical Scaling
- **Connection pooling** - Efficient resource use
- **Memory management** - Window cache cleanup
- **Index optimization** - Fast queries

## Data Retention

```
┌─────────────────────────────────────────────────────────┐
│                    Data Lifecycle                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Raw Events:                                             │
│  ┌──────────────────────────────────────────────┐       │
│  │  TTL: 7 days                                 │       │
│  │  Auto-deleted after storedAt + 7 days        │       │
│  └──────────────────────────────────────────────┘       │
│                                                          │
│  Aggregates:                                             │
│  ┌──────────────────────────────────────────────┐       │
│  │  Retained: Indefinitely                      │       │
│  │  (Can add TTL if needed)                     │       │
│  └──────────────────────────────────────────────┘       │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

**Last Updated**: 2025-01-09
**Version**: 1.0.0

