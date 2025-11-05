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


