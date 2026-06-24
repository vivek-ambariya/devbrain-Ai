# DevBrain AI - Enterprise Engineering Assistant

A production-quality SaaS frontend for AI-powered engineering project analysis.

## Tech Stack

- **React 19** + **Vite 8**
- **Tailwind CSS 4** — dark-first enterprise theme
- **React Router 7** — client-side routing
- **Axios** — HTTP client with JWT interceptors
- **Framer Motion** — animations and transitions
- **Context API** — auth, theme, notifications

## Getting Started

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### Demo Mode

The app runs in mock mode by default (`VITE_USE_MOCK=true`). Use any credentials on the login page to access the dashboard.

To connect to a Django backend:

```bash
# .env
VITE_USE_MOCK=false
```

API requests proxy to `http://localhost:8000/api` via Vite dev server.

## Features

| Module | Description |
|--------|-------------|
| **Authentication** | JWT login/register with validation |
| **Dashboard** | Stats, recent projects, AI conversations |
| **Projects** | Create projects, drag-and-drop file uploads |
| **AI Assistant** | ChatGPT-like interface with streaming responses |
| **Architecture** | Interactive tree view with search |
| **Onboarding** | AI-guided learning paths |
| **Settings** | Profile, API keys, theme, preferences |

## Project Structure

```
src/
├── api/           # Axios API modules
├── components/    # Reusable UI components
│   ├── auth/
│   ├── chat/
│   ├── dashboard/
│   ├── layout/
│   ├── onboarding/
│   ├── projects/
│   └── ui/
├── context/       # React Context providers
├── hooks/         # Custom hooks
├── pages/         # Route pages
└── utils/         # Helpers, validators, mock data
```

## Build

```bash
npm run build
npm run preview
```
