# DevBrain AI — Backend

Django REST Framework API for DevBrain AI.

## Stack

- Django 5 + Django REST Framework
- JWT auth (`djangorestframework-simplejwt`)
- SQLite (default) or MySQL
- ChromaDB for code embeddings / RAG
- Ollama (primary) or Grok API (optional) for chat

## Setup

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
python manage.py runserver 127.0.0.1:8000
```

## MySQL (optional)

```bash
# .env
DB_ENGINE=mysql
DB_NAME=devbrain
DB_USER=root
DB_PASSWORD=yourpassword
DB_HOST=127.0.0.1
DB_PORT=3306
```

Or use Docker:

```bash
docker compose up -d mysql
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register/` | Register user |
| POST | `/api/auth/login/` | Login |
| POST | `/api/auth/refresh/` | Refresh JWT |
| GET/PATCH | `/api/auth/profile/` | User profile |
| GET/POST | `/api/projects/` | List/create projects |
| POST | `/api/projects/{id}/upload/` | Upload ZIP/Swagger/docs |
| GET | `/api/projects/{id}/architecture/` | File tree |
| GET | `/api/projects/{id}/architecture/map/` | System map |
| GET | `/api/projects/{id}/architecture/graph/` | Dependency graph |
| GET | `/api/dashboard/stats/` | Dashboard stats |
| GET | `/api/chat/conversations/` | List conversations |
| POST | `/api/chat/conversations/{id}/stream/` | Stream AI response |

## AI / Indexing

1. Upload a ZIP via `POST /api/projects/{id}/upload/` with `type=zip`
2. Backend extracts, parses structure, embeds code into ChromaDB
3. Chat uses RAG over embeddings via Ollama

Install [Ollama](https://ollama.com) and pull models:

```bash
ollama pull llama3.2
ollama pull nomic-embed-text
```

Optional Grok: set `GROK_API_KEY` in `.env`.
