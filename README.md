# AuditEMS

AI-assisted **Audit Evidence Management System** for financial PDF documents. Upload statements, run automated inconsistency checks and LLM-powered summaries, then collaborate via reviewer flags and admin workflows.

## Features

- **PDF upload & extraction** — text and table extraction from financial PDFs (`pdfplumber`)
- **Automated audit checks** — balance-sheet / ratio / inconsistency analysis (`auditing/`)
- **RAG + local LLM** — ChromaDB + Sentence Transformers with Ollama (e.g. Llama 3) for grounded audit analysis
- **Role-based web app** — Auditor, Reviewer, and Admin flows (Next.js + NextAuth + Prisma)
- **Flags & reviews** — annotate findings, assign reviewers, track document/flag review status
- **Optional Redis cache** — skip re-analysis for identical uploads

## Tech stack

| Layer | Stack |
|--------|--------|
| Frontend | Next.js 15, React 19, Tailwind, NextAuth, Prisma |
| Database | PostgreSQL (via Prisma) |
| Audit API | Flask (`app.py`) |
| AI / RAG | Ollama, ChromaDB, sentence-transformers |
| Extras | Redis (optional caching), pdfplumber, pandas |

## Project structure

```
AuditEMS/
├── app.py                 # Flask audit API (upload + analysis)
├── rag_system.py          # Financial RAG + Ollama integration
├── auditing/              # Inconsistency / audit logic
├── extraction/            # PDF / Excel extractors
├── llama/                 # LLM summary generation
├── frontend/dfrontend/    # Next.js app (dashboard, reviewer, admin)
├── requirements.txt       # Python dependencies
└── templates/             # HTML templates (legacy / utility)
```

## Prerequisites

- Python 3.10+
- Node.js 18+
- PostgreSQL
- [Ollama](https://ollama.com/) with a model such as `llama3:8b`
- Redis (optional)

## Setup

### 1. Python audit API

```bash
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS / Linux
source .venv/bin/activate

pip install -r requirements.txt
# Install ollama Python client if needed: pip install ollama redis
ollama pull llama3:8b
python app.py
```

API defaults to CORS for `http://localhost:3000`. Upload endpoint: `POST /upload` (PDF).

### 2. Frontend

```bash
cd frontend/dfrontend
npm install
```

Create `.env` / `.env.local` with at least:

```env
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=http://localhost:3000
# plus any storage / API URLs your deployment uses
```

```bash
npx prisma migrate deploy
# or: npx prisma db push
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Roles (high level)

- **Auditor** — upload PDFs, view analysis, raise flags
- **Reviewer** — review assigned documents and flags
- **Admin** — users, reports, oversight

## Notes

- Do not commit secrets (`.env`, `.env.local`). Keep them local or in your host’s secret store.
- Local LLM quality depends on the Ollama model and document formatting.
- Redis is optional; if unavailable, caching is disabled automatically.

## License

Private / unpublished — add a license if you open-source this repo.
