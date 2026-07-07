# PANOPTICON Quick Start Guide

Complete setup guide to get PANOPTICON running locally with all services integrated.

---

## Prerequisites

Before starting, ensure you have:

- Python 3.9+ (for backend and AI services)
- Node.js 18+ (for frontend)
- Git
- PostgreSQL (or use Supabase)
- Redis (for Celery/caching)

---

## Step 1: Clone and Setup Repository

```bash
# Clone repository
git clone https://github.com/Sreejith-nair511/PANOPTICON-GMAX-.git
cd PANOPTICON-GMAX-

# Create virtual environment (backend)
python -m venv backend/venv
source backend/venv/bin/activate  # On Windows: backend\venv\Scripts\activate
```

---

## Step 2: Get Credentials

### Create Supabase Project

1. Visit [supabase.com](https://supabase.com)
2. Sign up/Log in
3. Create new project
4. Go to Settings → API Keys
5. Note down:
   - Project URL
   - Anon public key
   - Service role secret key
   - JWT Secret (in Settings)

### Create Groq Account & API Key

1. Visit [console.groq.com](https://console.groq.com)
2. Sign up/Log in
3. Create API key
4. Copy the key (starts with `gsk_`)

### Setup Clerk Authentication

1. Visit [clerk.com](https://clerk.com)
2. Sign up/Log in
3. Create new application
4. Go to API Keys section
5. Note down:
   - Publishable Key (pk_test_...)
   - Secret Key (sk_test_...)

---

## Step 3: Configure Environment Variables

### Backend Configuration

Create `backend/.env`:

```bash
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SECRET_KEY=your-secret-key-here
SUPABASE_JWT_SECRET=your-jwt-secret-here

# Groq AI
GROQ_API_KEY=gsk_your-api-key-here

# Application
ENVIRONMENT=development
DEBUG=True
SECRET_KEY=panopticon-dev-secret
CORS_ORIGINS=http://localhost:3000,http://localhost:8000

# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/panopticon

# AI Services
ENABLE_AI_INFERENCE=True
AI_DEVICE=cpu
AI_BATCH_SIZE=16

# Cache & Queue
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/1

# Tokens
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
```

### Frontend Configuration

Create `frontend/.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your-key
CLERK_SECRET_KEY=sk_test_your-key

# Groq
NEXT_PUBLIC_GROQ_API_KEY=gsk_your-api-key-here

# API
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_AI_API_URL=http://localhost:8000/ai
```

---

## Step 4: Deploy Database Schema

### Via Supabase SQL Editor (Recommended)

1. Log in to Supabase Dashboard
2. Go to SQL Editor
3. Create new query
4. Copy content from `database/supabase_schema.sql`
5. Run query
6. Wait for schema to complete

### Verify Schema

```bash
# Connect to your Supabase database
psql postgresql://postgres:password@db.supabase.co:5432/postgres

# List tables
\dt
```

Expected tables:
- users
- cases
- evidence
- suspects
- timeline_events
- processing_jobs
- investigation_reports
- audit_logs
- suspect_matches

---

## Step 5: Install Dependencies

### Backend

```bash
cd backend

# Activate virtual environment
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### Frontend

```bash
cd frontend

# Install Node dependencies
npm install
```

### AI Services (Optional)

```bash
cd ai

# Install AI dependencies
pip install -r requirements.txt
```

---

## Step 6: Start Services

Open 3 terminal windows:

### Terminal 1: Backend API

```bash
cd backend
source venv/bin/activate
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Expected output:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete
```

### Terminal 2: Frontend

```bash
cd frontend
npm run dev
```

Expected output:
```
▲ Next.js 14.0.0
- Local:        http://localhost:3000
- Environments: .env.local
```

### Terminal 3 (Optional): AI Services

```bash
cd ai
python startup.py
```

---

## Step 7: Verify Setup

### Check Backend API

```bash
curl http://localhost:8000/docs
```

Should open Swagger UI documentation

### Check Frontend

Visit http://localhost:3000

You should see:
- PANOPTICON login page
- Clerk authentication UI
- Dark theme interface

### Test Clerk Login

1. Click "Sign In"
2. Enter email/password or use social login
3. Should redirect to dashboard

### Test Groq AI Integration

1. Go to Evidence section
2. Upload an image
3. Click "Analyze with AI"
4. Wait for Groq analysis
5. Should see forensic insights

---

## Step 8: Run Initial Tests

### Backend Tests

```bash
cd backend
pytest tests/
```

### Frontend Build Test

```bash
cd frontend
npm run build
```

---

## Common Setup Issues

### Issue: "Groq API key not found"

**Solution:**
1. Verify `GROQ_API_KEY` in `backend/.env`
2. Ensure it starts with `gsk_`
3. Restart backend: `python -m uvicorn app.main:app --reload`

### Issue: Clerk sign-in not working

**Solution:**
1. Verify `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` in `frontend/.env.local`
2. Verify `CLERK_SECRET_KEY` is set
3. Check Clerk Dashboard for social login configuration
4. Restart frontend: `npm run dev`

### Issue: Supabase connection failed

**Solution:**
1. Verify `SUPABASE_URL` is correct
2. Verify `SUPABASE_ANON_KEY` and `SUPABASE_SECRET_KEY`
3. Check network connectivity to Supabase
4. Verify database schema deployed
5. Check RLS policies in Supabase Dashboard

### Issue: Redis connection failed

**Solution:**
1. Start Redis: `redis-server` (or `redis-cli ping`)
2. Verify Redis URL in `.env`
3. Check if port 6379 is open

### Issue: Database tables not found

**Solution:**
1. Go to Supabase SQL Editor
2. Run schema from `database/supabase_schema.sql`
3. Wait for all queries to complete
4. Refresh Supabase dashboard to verify

---

## Next Steps

### 1. Upload Evidence

1. Log in to dashboard
2. Create new case
3. Go to Evidence section
4. Upload video or image
5. System will process with YOLOv8 detector, ByteTrack tracker, FastReID re-ID

### 2. Use AI Copilot

1. In Evidence section, click "Analyze with AI"
2. Select analysis type (forensic, suspect, weapon, scene, evidence)
3. Groq AI provides investigation insights

### 3. Generate Reports

1. Add findings to case
2. Click "Generate Report"
3. AI generates professional investigation report
4. Download PDF or export

### 4. Track Suspects

1. Upload multiple camera feeds
2. System tracks suspects across cameras
3. Uses FastReID for cross-camera matching
4. Generates multi-camera timeline

---

## Development Workflow

### Making Code Changes

1. Edit files in your IDE
2. Backend auto-reloads with `--reload` flag
3. Frontend auto-reloads with Webpack HMR
4. Check console for errors

### Testing Changes

```bash
# Backend tests
cd backend
pytest tests/ -v

# Frontend tests
cd frontend
npm run test
```

### Committing Changes

```bash
# Stage changes
git add .

# Commit with message
git commit -m "feat: Add new feature"

# Push to repository
git push origin main
```

**Important:** Never commit `.env` files (they're in .gitignore)

---

## Production Deployment

Before deploying to production:

1. Change `ENVIRONMENT=production` in backend `.env`
2. Set `DEBUG=False`
3. Use production Clerk keys (not test)
4. Use production Supabase project
5. Generate strong `SECRET_KEY`
6. Enable HTTPS in `CORS_ORIGINS`
7. Use production API keys for Groq
8. Update database URLs to production

See `DEPLOYMENT_SUMMARY.md` for full production checklist.

---

## Documentation

- **Full Setup Guide:** `ENVIRONMENT_CONFIGURATION.md`
- **Deployment Guide:** `DEPLOYMENT_SUMMARY.md`
- **Groq AI Integration:** `GROQ_AI_INTEGRATION_GUIDE.md`
- **Clerk Authentication:** `CLERK_SETUP_GUIDE.md`
- **Supabase Database:** `SUPABASE_SETUP_GUIDE.md`
- **API Models:** `AI_MODELS_DETAILED.md`
- **Forensic Models:** `FORENSIC_MODELS_COMPLETE.md`

---

## Support & Troubleshooting

1. Check error messages in terminal/console
2. Review relevant documentation file above
3. Verify environment variables are set
4. Restart services after configuration changes
5. Check GitHub Issues for similar problems
6. Create new issue with error details

---

## Architecture Overview

```
PANOPTICON System Architecture
├── Frontend (Next.js 14)
│   ├── Clerk Authentication
│   ├── Supabase Integration
│   └── Groq AI Copilot Hook
├── Backend (FastAPI)
│   ├── API Routes (Cases, Evidence, AI Copilot)
│   ├── Groq AI Service
│   ├── Supabase Service
│   └── Celery Task Queue
├── AI/ML Services
│   ├── YOLOv8 Detector
│   ├── ByteTrack Tracker
│   ├── FastReID Re-ID
│   └── SAM2 Segmentor
└── Infrastructure
    ├── Supabase (Database + Auth)
    ├── Groq API (AI Models)
    └── Clerk (User Management)
```

---

## Key Features

- Real-time video analysis with YOLOv8
- Multi-object tracking with ByteTrack
- Cross-camera suspect tracking with FastReID
- Instance segmentation with SAM2
- AI-powered investigation with Groq
- Professional report generation
- Secure evidence storage
- Role-based access control
- Audit logging
- Real-time dashboard analytics

---

**Status:** Ready to use

**Last Updated:** July 7, 2026

**Version:** 1.0.0

