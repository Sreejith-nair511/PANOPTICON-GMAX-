# PANOPTICON – AI Forensic Intelligence Platform

> Transform fragmented visual evidence into structured, explainable forensic intelligence.

PANOPTICON is an enterprise-grade forensic investigation platform powered by AI. It enables law enforcement and forensic analysts to reconstruct crime scenes, track suspects across camera networks, generate AI-powered timelines, and produce professional forensic reports.

---

## Architecture

```
panopticon/
├── frontend/          # Next.js 14 · TypeScript · Tailwind CSS
├── backend/           # FastAPI · Python 3.11
├── ai/
│   ├── models/        # YOLOv8, FastReID, ByteTrack weights
│   └── services/      # Computer vision pipeline, LLM service
├── database/          # PostgreSQL schema + migrations
├── docker/            # Docker Compose stack
└── docs/              # Architecture docs
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion, Zustand |
| Backend | FastAPI, Python 3.11, SQLAlchemy, AsyncPG |
| Database | PostgreSQL 16 |
| Cache | Redis 7 |
| Vector DB | ChromaDB |
| AI Vision | YOLOv8, ByteTrack, FastReID, SAM2, OpenCV |
| AI Language | Gemini Pro, Qwen, Llama |
| Embeddings | BGE-M3 |
| Auth | JWT (HS256) |

---

## Quick Start

### Prerequisites
- Node.js 20+
- Python 3.11+
- Docker + Docker Compose (for infrastructure)
- Git

### 1. Start infrastructure

```bash
cd docker
docker-compose up -d postgres redis chromadb
```

### 2. Backend

```bash
cd backend
python -m venv venv
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
# Edit .env as needed

uvicorn app.main:app --reload --port 8000
```

API docs: http://localhost:8000/api/docs

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

App: http://localhost:3000

### Demo Login
- Email: `analyst@panopticon.gov`
- Password: `demo1234`

---

## Modules

| Module | Route | Description |
|---|---|---|
| Dashboard | `/dashboard` | Ops overview, stats, activity feed |
| Cases | `/cases` | Case management, creation, filtering |
| Case Detail | `/cases/[id]` | Evidence, suspects, timeline, reports |
| Evidence | `/evidence` | Upload, browse, AI analysis results |
| Investigation | `/investigation` | Multi-camera viewer, timeline scrubber |
| AI Copilot | `/ai-assistant` | Natural language forensic Q&A |
| Live Tracking | `/tracking` | Real-time suspect tracking across cameras |
| Reports | `/reports` | AI-generated forensic report viewer |
| Settings | `/settings` | Users, models, storage, system |

---

## AI Pipeline

```
Video Upload
    │
    ▼
Frame Extraction (OpenCV)
    │
    ▼
Object Detection (YOLOv8)
    │
    ▼
Multi-Person Tracking (ByteTrack)
    │
    ▼
Appearance Embedding (FastReID / BGE-M3)
    │
    ▼
Cross-Camera Re-ID (ChromaDB similarity search)
    │
    ▼
Event Detection + Timeline Generation
    │
    ▼
LLM Synthesis (Gemini Pro)
    │
    ▼
Structured Forensic Output
```

---

## Environment Variables

See `backend/.env.example` for the full list.

Key variables:
- `GEMINI_API_KEY` — Gemini Pro API key for LLM features
- `DATABASE_URL` — PostgreSQL connection string
- `SECRET_KEY` — JWT signing key (change in production)
- `GPU_ENABLED` — Enable CUDA acceleration

---

## Production Notes

- Replace `SECRET_KEY` with a cryptographically secure value
- Configure S3 storage (`STORAGE_BACKEND=s3`)
- Set `GPU_ENABLED=true` for AI processing performance
- Enable Redis persistence and PostgreSQL backups
- Configure TLS/SSL at the reverse proxy layer (nginx/Caddy)
- Set `DEBUG=false` and `ENVIRONMENT=production`

---

## License

Restricted — Law Enforcement Use Only  
© 2026 PANOPTICON Intelligence Systems
