# Quick Start Guide - Commands to Run

## Prerequisites
- Node.js 18+ installed
- MongoDB running (via Homebrew or Docker)
- Terminal access

---

## Option 1: Complete Setup (First Time)

### Step 1: Install Dependencies
```bash
cd /Users/navneetkaur/Documents/fullstk_project

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

cd ..
```

### Step 2: Start MongoDB

**Option A: Using Homebrew (if installed)**
```bash
# Check if MongoDB is running
brew services list | grep mongodb

# If not running, start it
brew services start mongodb/brew/mongodb-community@7.0

# Verify it's running
lsof -i :27017
```

**Option B: Using Docker**
```bash
docker run -d -p 27017:27017 --name mongodb mongo:7
```

### Step 3: Setup Database Indexes
```bash
cd backend
npm run db:setup
```

### Step 4: Configure Environment Variables

**Backend (.env file)**
```bash
cd backend
cat > .env << EOF
PORT=3000
MONGODB_URI=mongodb://localhost:27017
DB_NAME=analytics
JWT_SECRET=your-super-secret-jwt-key-change-in-production
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
EOF
```

**Frontend (.env.local file)**
```bash
cd ../frontend

# Generate JWT token first
TOKEN=$(cd ../backend && node -e "console.log(require('jsonwebtoken').sign({userId:'demo-user'}, 'your-super-secret-jwt-key-change-in-production'))")

# Create frontend env file
cat > .env.local << EOF
VITE_BACKEND_URL=http://localhost:3000
VITE_JWT_TOKEN=$TOKEN
EOF

cd ..
```

### Step 5: Start Backend Server
```bash
cd backend
npm run dev
```
**Keep this terminal open!** Backend will run on `http://localhost:3000`

### Step 6: Start Frontend Server (New Terminal)
```bash
cd /Users/navneetkaur/Documents/fullstk_project/frontend
npm run dev
```
**Keep this terminal open!** Frontend will run on `http://localhost:5173`

### Step 7: Generate Traffic (Optional - New Terminal)
```bash
cd /Users/navneetkaur/Documents/fullstk_project/backend

# Generate JWT token
TOKEN=$(node -e "console.log(require('jsonwebtoken').sign({userId:'demo-user'}, 'your-super-secret-jwt-key-change-in-production'))")

# Run load generator
npm run load -- --token=$TOKEN

# Or with custom parameters
node scripts/load_generator.js --rps=150 --duration=60 --users=40 --token=$TOKEN
```

---

## Option 2: Using Makefile (Simpler)

```bash
cd /Users/navneetkaur/Documents/fullstk_project

# Install all dependencies
make install

# Setup backend .env (if not exists)
cd backend && [ ! -f .env ] && cat > .env << EOF
PORT=3000
MONGODB_URI=mongodb://localhost:27017
DB_NAME=analytics
JWT_SECRET=your-super-secret-jwt-key-change-in-production
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
EOF && cd ..

# Setup database indexes
cd backend && npm run db:setup && cd ..

# Start backend (Terminal 1)
make backend-dev

# Start frontend (Terminal 2)
make frontend-dev
```

---

## Option 3: Using Docker Compose (All-in-One)

```bash
cd /Users/navneetkaur/Documents/fullstk_project

# Build and start all services
docker-compose up --build

# Or in detached mode
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop everything
docker-compose down
```

---

## Quick Reference Commands

### Backend Commands
```bash
cd backend

# Start dev server
npm run dev

# Run database setup
npm run db:setup

# Generate traffic
npm run load

# Custom load generation
node scripts/load_generator.js --rps=200 --duration=30 --users=50 --token=YOUR_TOKEN
```

### Frontend Commands
```bash
cd frontend

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Database Commands
```bash
# Connect to MongoDB shell
mongosh

# Or using mongo client
mongo

# In MongoDB shell:
use analytics
db.events.countDocuments()
db.aggregates.countDocuments()
```

### Health Check Commands
```bash
# Check backend health
curl http://localhost:3000/health

# Check backend metrics
curl http://localhost:3000/metrics

# Check backend readiness
curl http://localhost:3000/health/ready
```

---

## Troubleshooting

### MongoDB Not Running
```bash
# Check if MongoDB is running
lsof -i :27017

# Start MongoDB (Homebrew)
brew services start mongodb/brew/mongodb-community@7.0

# Start MongoDB (Docker)
docker start mongodb
# Or create new container
docker run -d -p 27017:27017 --name mongodb mongo:7
```

### Port Already in Use
```bash
# Kill process on port 3000 (backend)
lsof -ti:3000 | xargs kill -9

# Kill process on port 5173 (frontend)
lsof -ti:5173 | xargs kill -9

# Kill process on port 27017 (MongoDB)
lsof -ti:27017 | xargs kill -9
```

### Reset Everything
```bash
cd /Users/navneetkaur/Documents/fullstk_project

# Stop all services
pkill -f "node.*server.js"
pkill -f "vite"

# Reset MongoDB (WARNING: Deletes all data)
mongosh --eval "use analytics; db.dropDatabase()"

# Re-run setup
cd backend && npm run db:setup && cd ..
```

### Generate New JWT Token
```bash
cd backend
node -e "console.log(require('jsonwebtoken').sign({userId:'demo-user'}, 'your-super-secret-jwt-key-change-in-production'))"
```

---

## Access Points

Once running:
- **Frontend Dashboard**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Health Check**: http://localhost:3000/health
- **Metrics**: http://localhost:3000/metrics
- **MongoDB**: localhost:27017

---

## Typical Workflow

1. **Start MongoDB** (if not already running)
   ```bash
   brew services start mongodb/brew/mongodb-community@7.0
   ```

2. **Start Backend** (Terminal 1)
   ```bash
   cd backend && npm run dev
   ```

3. **Start Frontend** (Terminal 2)
   ```bash
   cd frontend && npm run dev
   ```

4. **Open Browser**
   - Navigate to http://localhost:5173
   - Click "Generate Demo Data" button
   - Or run load generator in Terminal 3

5. **Generate Traffic** (Terminal 3 - Optional)
   ```bash
   cd backend
   TOKEN=$(node -e "console.log(require('jsonwebtoken').sign({userId:'demo-user'}, 'your-super-secret-jwt-key-change-in-production'))")
   npm run load -- --token=$TOKEN
   ```

---

## Environment Variables Reference

### Backend (.env)
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017
DB_NAME=analytics
JWT_SECRET=your-super-secret-jwt-key-change-in-production
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

### Frontend (.env.local)
```env
VITE_BACKEND_URL=http://localhost:3000
VITE_JWT_TOKEN=your-generated-jwt-token-here
```

---

**Need Help?** Check `ARCHITECTURE.md` for system design details.

