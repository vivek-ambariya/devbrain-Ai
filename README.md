# DevBrain AI — Enterprise Engineering Assistant

Full-stack SaaS for AI-powered codebase analysis.

## Project structure

```
├── frontend/     React + Vite UI
├── backend/      Django REST API
└── docker-compose.yml   MySQL (optional)
```

## Quick start

### 1. Backend

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
python manage.py runserver 127.0.0.1:8000
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env   # VITE_USE_MOCK=false
npm run dev
```

Open http://localhost:5173 — register a new account to use the real API.

### 3. AI (optional but recommended)

```bash
ollama pull llama3.2
ollama pull nomic-embed-text
```

Upload a project ZIP in the UI, wait for indexing, then use Copilot.

## Tech stack

| Layer | Technology |
|-------|------------|
| Frontend | React, Vite, Tailwind, Framer Motion |
| Backend | Django REST Framework, JWT |
| Database | SQLite (dev) / MySQL (prod) |
| Vector DB | ChromaDB |
| AI | Ollama / Grok API |

## Repository

https://github.com/vivek-ambariya/devbrain-Ai
