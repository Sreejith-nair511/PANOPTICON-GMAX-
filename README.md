# PANOPTICON — AI-Powered Forensic Intelligence Platform

PANOPTICON transforms fragmented visual evidence into structured, explainable forensic intelligence for law enforcement. It provides case management, multi-camera investigation, AI-assisted forensic analysis, timeline generation, report generation, and interactive 3D crime scene reconstruction.

## Architecture

```
PANOPTICON/
├── frontend/        # Next.js 14 + TypeScript + Tailwind + Zustand
├── backend/         # FastAPI + Python 3.11 + SQLAlchemy
├── ai/services/     # YOLOv8 + ByteTrack + FastReID + Gemini
├── docker/          # Docker Compose orchestration
└── database/        # PostgreSQL schema
```

### Tech Stack

| Layer       | Technologies                                                    |
|-------------|-----------------------------------------------------------------|
| Frontend    | Next.js 14, TypeScript, Tailwind CSS, Zustand, React Query, Framer Motion, Three.js, React Three Fiber |
| Backend     | FastAPI, Python 3.11, SQLAlchemy, PostgreSQL, Redis, ChromaDB  |
| AI Pipeline | YOLOv8, ByteTrack, FastReID, OpenCV, Gemini                    |
| Infra       | Docker, Celery, Redis (broker), Nginx (planned)                |

## Quick Start

### Prerequisites

- Docker & Docker Compose
- (Optional) Node.js 18+ and Python 3.11 for local development

### Docker Setup

```bash
cd docker
cp .env.example .env   # Edit values for production
docker compose up -d
```

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api/docs
- **Health check**: http://localhost:8000/health

### Local Development

**Backend:**

```bash
cd backend
python -m venv .venv && source .venv/bin/activate  # or .venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
```

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

**Celery Worker (optional):**

```bash
cd backend
celery -A app.celery_app worker --loglevel=info --concurrency=2
```

### Authentication

Default credentials (demo mode):

- Email: `analyst@panopticon.gov`
- Password: `demo1234`

## Features

- **Case Management** — Create, track, and manage forensic investigations
- **Evidence Management** — Upload, hash, and track video/image evidence
- **Multi-Camera Investigation** — Synchronized multi-camera viewing with timeline scrubbing
- **3D Crime Scene Reconstruction** — Interactive Three.js scene with dynamic evidence markers
- **AI-Assisted Analysis** — YOLOv8 object detection, ByteTrack person tracking, FastReID cross-camera re-identification
- **Timeline Generation** — AI-generated event timelines with confidence scores
- **AI Copilot** — Gemini-powered forensic Q&A with evidence-referenced answers
- **Report Generation** — Automated forensic intelligence reports
- **Live Tracking** — Real-time suspect tracking dashboard

## AI Pipeline

1. **Frame Extraction** — OpenCV extracts frames at configurable intervals
2. **Object Detection** — YOLOv8n detects persons, objects, and weapons (auto-downloads on first run)
3. **Person Tracking** — ByteTrack assigns consistent track IDs across frames
4. **Cross-Camera Re-ID** — FastReID matches persons across different camera feeds
5. **3D Scene Mapping** — Detection bboxes are projected to approximate 3D world coordinates
6. **LLM Synthesis** — Gemini generates forensic summaries and answers investigative queries

## API Endpoints

| Method | Endpoint                            | Description                    |
|--------|-------------------------------------|--------------------------------|
| GET    | `/api/v1/cases`                     | List cases                     |
| POST   | `/api/v1/cases`                     | Create case                    |
| GET    | `/api/v1/evidence`                  | List evidence                  |
| POST   | `/api/v1/evidence/upload`           | Upload evidence file           |
| GET    | `/api/v1/evidence/{id}/detections`  | Get AI detection results      |
| POST   | `/api/v1/evidence/{id}/process`     | Trigger AI processing         |
| POST   | `/api/v1/ai/chat`                   | AI copilot query               |
| POST   | `/api/v1/ai/process/{id}`           | Start AI processing job       |
| POST   | `/api/v1/ai/report/generate`        | Generate forensic report       |
| GET    | `/api/v1/dashboard/stats`           | Dashboard statistics           |
| GET    | `/health`                           | Service health check           |

## Environment Variables

See `backend/.env.example` and `docker/.env.example` for all configurable variables.

Key variables:

| Variable               | Description                    | Default                              |
|------------------------|--------------------------------|--------------------------------------|
| `DATABASE_URL`         | PostgreSQL connection string   | `postgresql+asyncpg://...`           |
| `SECRET_KEY`           | JWT signing key                | Must change in production            |
| `GEMINI_API_KEY`       | Google Gemini API key          | Optional, mock fallback available    |
| `YOLO_MODEL_PATH`      | Path to YOLOv8 weights         | `./ai/models/yolov8n.pt`            |
| `GPU_ENABLED`          | Enable GPU acceleration        | `false`                              |

## Roadmap

- [ ] Real camera calibration for accurate 3D mapping
- [ ] Alembic migration management
- [ ] WebSocket support for real-time updates
- [ ] S3 storage backend
- [ ] Nginx reverse proxy with SSL
- [ ] Kubernetes deployment manifests
- [ ] Automated testing suite
- [ ] Custom YOLOv8 model training pipeline

## License

Proprietary — Law Enforcement Use Only
# PANOPTICON – AI Forensic Intelligence Platform

> Transform fragmented visual evidence into structured, explainable forensic intelligence.

PANOPTICON is an enterprise-grade forensic investigation platform powered by AI. It enables law enforcement and forensic analysts to reconstruct crime scenes, track suspects across camera networks, generate AI-powered timelines, and produce professional forensic reports.

---

# Architecture

```text
panopticon/
├── frontend/
│   ├── src/
│   │   └── components/
│   │       └── scene3d/         # 3D crime scene visualization
│   └── ...
├── backend/                     # FastAPI · Python 3.11
├── ai/
│   ├── models/                  # YOLOv8, FastReID, ByteTrack weights
│   └── services/                # Computer vision pipeline, LLM service
├── database/                    # PostgreSQL schema + migrations
├── docker/                      # Docker Compose stack
└── docs/                        # Architecture docs & screenshots
```

---

# Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion, Zustand, Three.js, React Three Fiber |
| Backend | FastAPI, Python 3.11, SQLAlchemy, AsyncPG |
| Database | PostgreSQL 16 |
| Cache | Redis 7 |
| Vector DB | ChromaDB |
| AI Vision | YOLOv8, ByteTrack, FastReID, SAM2, OpenCV |
| AI Language | Gemini Pro, Qwen, Llama |
| Embeddings | BGE-M3 |
| Auth | JWT (HS256) |

---

# Quick Start

## Prerequisites

- Node.js 20+
- Python 3.11+
- Docker + Docker Compose
- Git

---

## 1. Start Infrastructure

```bash
cd docker
docker compose up -d postgres redis chromadb
```

---

## 2. Backend

```bash
cd backend

python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS/Linux
source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env

# Edit .env as needed

python -m uvicorn app.main:app --reload
```

API Docs:

```text
http://localhost:8000/api/docs
```

---

## 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Application:

```text
http://localhost:3000
```

---

# Demo Login

**Email**

```text
analyst@panopticon.gov
```

**Password**

```text
demo1234
```

---

# Modules

| Module | Route | Description |
|---|---|---|
| Dashboard | `/dashboard` | Operations overview, system stats, activity feed |
| Cases | `/cases` | Case management, creation and filtering |
| Case Detail | `/cases/[id]` | Evidence, suspects, timeline and reports |
| Evidence | `/evidence` | Upload, browse and AI analysis |
| Investigation | `/investigation` | Multi-camera viewer, timeline scrubber and interactive 3D crime scene mode |
| AI Copilot | `/ai-assistant` | Natural language forensic Q&A |
| Live Tracking | `/tracking` | Real-time suspect tracking |
| Reports | `/reports` | AI-generated forensic report viewer |
| Settings | `/settings` | Users, models, storage and system configuration |

---

# Features

## Investigation Platform

- Multi-camera investigation workspace
- Interactive 3D crime scene reconstruction
- Timeline-based event analysis
- Evidence marker visualization
- AI-assisted forensic analysis
- Cross-camera suspect tracking
- Automated report generation

---

## AI Capabilities

- Object detection using YOLOv8
- Multi-object tracking using ByteTrack
- Cross-camera re-identification
- Event timeline generation
- Natural language forensic querying
- Explainable AI-assisted reporting

---

# Investigation Workflow

```text
Video Evidence
      ↓
AI Detection Pipeline
      ↓
Timeline Generation
      ↓
Multi-Camera Investigation
      ↓
3D Crime Scene Reconstruction
      ↓
Evidence Correlation
      ↓
Forensic Report Generation
```

---

# AI Pipeline

```text
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

# Screenshots

Create:

```text
docs/
└── screenshots/
    ├── dashboard.png
    ├── investigation.png
    └── crime-scene-3d.png
```

---

# Environment Variables

See:

```text
backend/.env.example
```

Important variables:

- `GEMINI_API_KEY`
- `DATABASE_URL`
- `SECRET_KEY`
- `GPU_ENABLED`
- `STORAGE_BACKEND`
- `CHROMA_HOST`
- `CHROMA_PORT`

---

# Production Notes

- Replace `SECRET_KEY` with a secure value.
- Configure S3 storage.
- Set `GPU_ENABLED=true` for accelerated inference.
- Enable Redis persistence and PostgreSQL backups.
- Configure TLS/SSL using Nginx or Caddy.
- Set:

```env
DEBUG=false
ENVIRONMENT=production
```

---

# Roadmap

## Completed

- [x] Multi-camera investigation workspace
- [x] Interactive 3D crime scene visualization
- [x] Timeline generation
- [x] AI copilot
- [x] Report generation

---

## In Progress

- [ ] Real-time YOLO integration
- [ ] Evidence placement from detections
- [ ] Camera synchronization
- [ ] Cross-camera suspect reconstruction
- [ ] Automated scene reconstruction
- [ ] Scene timeline playback
- [ ] Real-time evidence metadata panel

---

# Recent Updates (v1.1)

- Added interactive 3D crime scene visualization mode.
- Added React Three Fiber and Three.js integration.
- Added evidence markers and metadata support.
- Improved Docker compatibility.
- Added modular 3D scene architecture.

---

# License

**Restricted — Law Enforcement Use Only**

© 2026 PANOPTICON Intelligence Systems
