# Run Commands - Minimal Guide

## 1. Start MongoDB
```bash
brew services start mongodb/brew/mongodb-community@7.0
```

## 2. Start Backend
```bash
cd backend
npm run dev
```

## 3. Start Frontend (new terminal)
```bash
cd frontend
npm run dev
```

## 4. Generate Traffic (new terminal)

**Option A: Automated Continuous Traffic**
```bash
cd backend
TOKEN=$(node -e "console.log(require('jsonwebtoken').sign({userId:'demo-user'}, 'your-super-secret-jwt-key-change-in-production'))")
JWT_TOKEN=$TOKEN npm run auto-traffic
```
*Runs continuously until you press Ctrl+C*

**Option B: One-time Traffic Burst**
```bash
cd backend
TOKEN=$(node -e "console.log(require('jsonwebtoken').sign({userId:'demo-user'}, 'your-super-secret-jwt-key-change-in-production'))")
npm run load -- --token=$TOKEN
```

---

## Access
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3000

---

## One-Time Setup (if not done)
```bash
# Install dependencies
cd backend && npm install && cd ../frontend && npm install

# Setup database
cd backend && npm run db:setup
```

