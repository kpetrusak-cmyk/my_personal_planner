# My 2026 Planner

A full-featured digital planner built with React, Vite, Tailwind CSS, TypeScript, and Supabase.

## Setup

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd <your-repo>
npm install
```

### 2. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. In the **SQL Editor**, run the contents of `schema.sql` to create all tables, RLS policies, triggers, and storage buckets

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_public_key
VITE_SUPABASE_PROJECT_ID=YOUR_PROJECT_REF
```

Find these values in your Supabase dashboard under **Settings → API**:
- **Project URL** → `VITE_SUPABASE_URL`
- **anon/public key** → `VITE_SUPABASE_PUBLISHABLE_KEY`
- **Reference ID** (Settings → General) → `VITE_SUPABASE_PROJECT_ID`

### 4. Configure Google OAuth (optional)

1. In Google Cloud Console, create OAuth 2.0 credentials
2. Set the redirect URI to: `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
3. In Supabase dashboard, go to **Authentication → Providers → Google** and enter your Client ID and Secret

### 5. Run Locally

```bash
npm run dev
```

The app runs at `http://localhost:8080`.

### 6. Deploy

Build for production:

```bash
npm run build
```

Deploy the `dist/` folder to any static host (Vercel, Netlify, Cloudflare Pages, etc.). Set the same environment variables in your hosting provider's settings.

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (Auth, Database, Storage)
- **PWA**: Installable as a Progressive Web App

## Features

Daily/Weekly/Monthly planners, mood tracker, habit tracker, sleep tracker, exercise tracker, budget tracker, savings tracker, meal planner, vision board, goal setting, gratitude journal, therapy notes, book/movie trackers, skincare/self-care routines, recipe cards, cleaning schedule, and more — all with cloud sync.
