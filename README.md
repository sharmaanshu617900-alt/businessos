# AgencyOS / Meeting Intelligence Platform 🧠🎙️

Transform meeting recordings into actionable intelligence — transcribe, analyze, search, and collaborate with AI-powered insights. Built for agencies, by agencies.

## 🌟 Features

| Feature | Description |
|---------|-------------|
| 🎙️ **Smart Transcription** | AI-powered speech-to-text with speaker diarization |
| 🧠 **AI Analysis** | Auto-generate summaries, decisions, action items, topics & risks |
| 🔍 **Company Brain** | Semantic search across all meetings via AI-powered retrieval |
| 💬 **AI Chat** | Ask questions about any meeting — get instant answers |
| 🌐 **Multilingual** | Support for 20+ Indian languages & 50+ global languages |
| 📊 **Agency Dashboard** | Stats, charts, client hub, SOPs, decisions & more |
| 📁 **File Upload** | Drag-drop upload with auto-processing pipeline |
| 🔐 **Auth** | Supabase authentication with login/register |

## 🏗️ Architecture

```
                    ┌─────────────┐
                    │  Next.js 15  │
                    │  App Router  │
                    └──────┬──────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   ┌────▼────┐      ┌─────▼─────┐      ┌─────▼────┐
   │ Landing │      │ Dashboard │      │   API    │
   │  Pages  │      │  Pages    │      │  Routes  │
   └─────────┘      └─────┬─────┘      └────┬─────┘
                          │                 │
                     ┌────▼────┐       ┌────▼────┐
                     │ Supabase │       │AI Service│
                     │  Auth+DB │       │ Gemini   │
                     └─────────┘       │+OpenAI   │
                                        └─────────┘
```

### Processing Pipeline

```
Recording Upload → Transcribe (ASR) → Diarize (Speakers) → Analyze (AI) → Translate → Searchable Brain
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 18
- **npm** or **yarn**
- **Supabase account** (free tier: [supabase.com](https://supabase.com))
- **Google Gemini API key** (free: [aistudio.google.com](https://aistudio.google.com/apikey))

### Setup

```bash
# 1. Clone & install
git clone <your-repo>
cd company-brain
npm install

# 2. Set up Supabase
#    - Create project at https://supabase.com
#    - Open SQL Editor and run all files in supabase/migrations/
#    - Copy your project URL & anon key from Settings → API

# 3. Configure environment
cp .env.local.example .env.local
# Edit .env.local with your keys (see below)

# 4. Start dev server
npm run dev
# → http://localhost:3000
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase service role key |
| `GEMINI_API_KEY` | ✅ | Google Gemini API key (free) |
| `OPENAI_API_KEY` | ❌ | OpenAI fallback (optional) |
| `NEXT_PUBLIC_SITE_URL` | ✅ | Site URL for auth redirects |

> **💡 Mock Mode**: All features work with mock data if env vars are missing — perfect for UI development!

## 🗄️ Database Schema

The Supabase migrations are in `supabase/migrations/`:

| Migration | Description |
|-----------|-------------|
| `001_create_tables.sql` | Core tables: users, meetings, transcripts, decisions, action items |
| `002_create_transcripts.sql` | Transcript storage with segments |
| `003_create_meeting_analyses.sql` | AI analysis results storage |
| `004_add_multilingual_support.sql` | Language & translation support |
| `005_ai_pipeline_notifications.sql` | Real-time pipeline notifications |

## 🧪 Development

```bash
# TypeScript check
npx tsc --noEmit

# Build
npm run build

# Dev server with verbose logging
npm run dev
```

## 📁 Project Structure

```
src/
├── app/
│   ├── components/        # Landing page components (Hero, Navbar, etc.)
│   ├── dashboard/         # Dashboard pages
│   │   ├── brain/        # Company Brain search
│   │   ├── chat/         # AI Chat
│   │   ├── clients/      # Client hub
│   │   ├── decisions/    # Decision log
│   │   ├── meetings/     # Meeting list + detail view
│   │   ├── sops/         # SOPs
│   │   ├── upload/       # File upload
│   │   └── search/       # Search
│   ├── login/            # Auth pages
│   ├── register/
│   ├── admin/            # Admin dashboard
│   ├── api/              # API routes
│   │   ├── chat/         # AI Chat API
│   │   ├── meetings/     # Meetings CRUD + processing
│   │   ├── search/       # Semantic search
│   │   └── ...
│   ├── globals.css        # Tailwind v4 + brand theme
│   ├── layout.tsx
│   └── page.tsx
├── components/            # Shared components
├── lib/                   # Utilities, AI service, Supabase clients
└── middleware.ts          # Auth middleware
```

## 🤖 AI Capabilities

Powered by **Google Gemini** (free tier) with **OpenAI fallback**:

- **Transcription**: Speech-to-text with automatic language detection
- **Speaker Diarization**: Identify who spoke when
- **Meeting Analysis**: Generate summaries, decisions, action items, key discussion points, risks, questions, sentiment, and keywords
- **Company Brain**: Semantic search across all transcribed meetings
- **AI Chat**: Context-aware Q&A about any meeting
- **Translation**: Support for 20+ Indian languages (Hindi, Tamil, Telugu, Bengali, etc.) and 50+ global languages

## 🔐 Security

- Row Level Security (RLS) via Supabase policies
- Auth middleware protects all dashboard routes
- Rate limiting on API endpoints
- Service role key never exposed to client

## 🧰 Tech Stack

| Technology | Purpose |
|------------|---------|
| [Next.js 15](https://nextjs.org) | React framework (App Router) |
| [Tailwind CSS v4](https://tailwindcss.com) | Styling |
| [Supabase](https://supabase.com) | Auth + Database + Storage |
| [Google Gemini](https://deepmind.google/gemini) | AI/ML (free tier) |
| [OpenAI](https://openai.com) | AI fallback |
| [Framer Motion](https://motion.dev) | Animations |
| [Lucide](https://lucide.dev) | Icons |
| [TypeScript](https://typescriptlang.org) | Type safety |

## 📜 License

This project is licensed under the terms found in `LICENSE`.

---

Built with ❤️ by your team.
