# ConnectPhone

> The dating app where the number is the destination. Request, accept, connect.

ConnectPhone is a modern dating application built with **Next.js 16**, featuring a double-consent phone number sharing system, a ConnectCoin credit economy, TikTok-style profile discovery, real-time chat, and push notifications.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16, React 19, TypeScript, Tailwind CSS 4, shadcn/ui, Framer Motion |
| **State** | Zustand, React Query |
| **Backend** | Next.js API Routes, Supabase (Auth + Postgres + Edge Functions) |
| **Database** | Supabase PostgreSQL (primary) + Prisma/SQLite (ConnectCoin local) |
| **Auth** | Supabase Auth |
| **Storage** | ImgBB (image uploads) |
| **Notifications** | Web Push (VAPID) |
| **i18n** | French / English |

---

## Project Structure

```
connectphone/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # Root layout (fonts, providers)
│   │   ├── page.tsx            # Main app (login, discover, requests, chat, profile)
│   │   ├── globals.css         # Global styles + Tailwind
│   │   └── api/                # API routes
│   │       ├── auth/           # login, register, sync-user
│   │       ├── connections/    # Connection management
│   │       ├── credits/        # balance, spend, purchase, daily-free, streak, level, etc.
│   │       ├── cron/           # daily-reset
│   │       ├── currency/       # rates, detect
│   │       ├── likes/          # Like/unlike
│   │       ├── messages/       # Chat messages
│   │       ├── moments/        # Stories/moments
│   │       ├── notifications/  # push notifications, campaigns, preferences
│   │       ├── photos/         # Photo upload (ImgBB)
│   │       ├── profile/        # Profile visits
│   │       ├── profiles/       # Profile discovery
│   │       ├── requests/       # Number request flow
│   │       └── user/           # User info & profile
│   ├── components/             # UI components
│   │   ├── ui/                 # shadcn/ui primitives (45+ components)
│   │   ├── AdminDashboard.tsx  # Admin panel
│   │   ├── BottomNav.tsx       # Mobile bottom navigation
│   │   ├── ChatView.tsx        # Chat interface
│   │   ├── CreditStore.tsx     # ConnectCoin shop
│   │   ├── FilterSheet.tsx     # Discovery filters
│   │   ├── OnboardingFlow.tsx  # New user onboarding
│   │   ├── ProfileCard.tsx     # Swipe-style profile card
│   │   ├── ProfileDetail.tsx   # Full profile detail dialog
│   │   ├── TikTokViewer.tsx    # TikTok-style fullscreen viewer
│   │   └── ...                 # 30+ more components
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Utilities, stores, configs
│   │   ├── store.ts            # Main Zustand store
│   │   ├── supabase.ts         # Supabase client
│   │   ├── connectcoin-store.ts # ConnectCoin Zustand store
│   │   ├── imgbb.ts            # ImgBB upload utility
│   │   ├── i18n/               # Internationalization
│   │   └── translations/       # FR/EN translation files
│   └── ...
├── supabase/
│   ├── migrations/             # 12 SQL migrations (001-015)
│   └── functions/              # 5 Edge Functions
│       ├── currency-detect/    # Detect user currency
│       ├── currency-rates/     # Exchange rates
│       ├── imgbb-upload/       # Image upload proxy
│       ├── daily-reset/        # Daily credit reset (cron)
│       └── push-notification/  # Push notification sender
├── prisma/
│   └── schema.prisma           # Prisma schema (ConnectCoin tables)
├── firebase/                   # Firebase config (optional migration)
├── public/                     # Static assets
├── .env.example                # Environment variable template
├── Dockerfile                  # Docker deployment
├── docker-compose.yml          # Docker Compose setup
└── next.config.ts              # Next.js configuration
```

---

## Quick Start

### Prerequisites

- **Node.js** 20+ (or Bun 1.0+)
- **Supabase** account & project
- **ImgBB** API key

### 1. Clone & Install

```bash
git clone <your-repo-url> connectphone
cd connectphone
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local` with your values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-vapid-public-key
IMGBB_API_KEY=your-imgbb-key
CRON_SECRET=your-cron-secret
DATABASE_URL=file:./db/connectphone.db
```

### 3. Setup Database

**Supabase (primary):** Run migrations in the Supabase SQL Editor, in order:

```bash
# Apply each migration file in supabase/migrations/ in order:
# 001_credit_tables.sql → 015_fix_push_rpc.sql
```

**Prisma (local ConnectCoin):**

```bash
npx prisma generate
npx prisma db push
```

### 4. Deploy Edge Functions

```bash
# Install Supabase CLI if not already
npx supabase login

# Deploy each function
npx supabase functions deploy currency-detect --project-ref your-project-ref
npx supabase functions deploy currency-rates --project-ref your-project-ref
npx supabase functions deploy imgbb-upload --project-ref your-project-ref
npx supabase functions deploy daily-reset --project-ref your-project-ref
npx supabase functions deploy push-notification --project-ref your-project-ref
```

### 5. Seed Demo Data (Optional)

```bash
curl -X POST http://localhost:3000/api/seed
```

### 6. Run

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

Open [http://localhost:3000](http://localhost:3000).

**Demo credentials:** `moi@connectphone.fr` / `demo123`

---

## Deployment

### Option A: Vercel (Recommended)

1. Push your code to GitHub
2. Import the repo on [vercel.com](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy — Vercel auto-detects Next.js

### Option B: Docker

```bash
# Build and run
docker compose up -d

# Or build manually
docker build -t connectphone .
docker run -p 3000:3000 --env-file .env.local connectphone
```

### Option C: VPS / Self-hosted

```bash
npm run build
NODE_ENV=production node .next/standalone/server.js
```

Set up a reverse proxy (Nginx/Caddy) pointing to port 3000.

---

## Key Features

### Double-Consent Phone Sharing
- User A requests User B's number
- User B must explicitly accept
- Both numbers revealed only upon mutual consent

### ConnectCoin Credit System
- Free daily credits with streak bonuses
- Credit packs for purchase
- Premium actions (Super Request, Boost, cosmetics)
- Level progression (Bronze → Silver → Gold → Platinum → Diamond)
- Daily challenges with rewards

### TikTok-Style Discovery
- Fullscreen vertical scrolling
- Swipe gestures (up = next, left = pass, right = like)
- Double-tap to like with heart burst animation
- Photo carousel with horizontal swipe

### Real-Time Chat
- Message threads between matched users
- Read receipts and typing indicators
- Media sharing

### Push Notifications
- Web Push (VAPID) support
- New match, message, and request notifications
- Admin notification campaigns
- User preference management

### Admin Dashboard
- User management
- Credit analytics
- Notification campaign manager
- System health monitoring

### Internationalization
- French (default) and English
- Automatic language detection
- Persistent language preference

---

## ConnectCoin System

| Action | Cost |
|--------|------|
| Request phone number | 5 coins |
| Super Request (priority) | 15 coins |
| Boost profile | 10 coins |
| Cosmetic item | 1-50 coins |
| Daily free credits | 3 coins |
| Streak bonus (7 days) | +5 coins |
| Streak bonus (30 days) | +20 coins |

**Levels:**
- Bronze (0-99 XP) → Silver (100-499) → Gold (500-1499) → Platinum (1500-4999) → Diamond (5000+)

---

## API Reference

### Authentication
- `POST /api/auth/login` — Login with email/password
- `POST /api/auth/register` — Register new user
- `POST /api/auth/sync-user` — Sync user to local DB

### Credits
- `GET /api/credits/balance` — Get credit balance
- `POST /api/credits/spend` — Spend credits
- `POST /api/credits/purchase` — Purchase credit pack
- `POST /api/credits/daily-free` — Claim daily free credits
- `GET /api/credits/streak` — Get streak info
- `GET /api/credits/level` — Get level info
- `GET /api/credits/history` — Transaction history
- `GET /api/credits/challenges` — Active challenges
- `GET /api/credits/cosmetics` — Available cosmetics
- `GET /api/credits/promos` — Active promotions

### Social
- `POST /api/likes` — Like a profile
- `GET /api/profiles` — Discover profiles
- `POST /api/requests` — Request phone number
- `PUT /api/requests` — Accept/decline request
- `GET /api/connections` — List connections

### Messaging
- `GET /api/messages` — Get conversation messages
- `POST /api/messages` — Send a message

### Notifications
- `POST /api/notifications/subscribe` — Subscribe to push
- `POST /api/notifications/unsubscribe` — Unsubscribe
- `GET /api/notifications/preferences` — Get preferences
- `PUT /api/notifications/preferences` — Update preferences
- `POST /api/notifications/send` — Send notification (admin)
- `GET /api/notifications/campaigns` — List campaigns
- `POST /api/notifications/campaigns` — Create campaign

### System
- `POST /api/cron/daily-reset` — Daily credit reset (cron)
- `GET /api/currency/detect` — Detect user currency
- `GET /api/currency/rates` — Get exchange rates
- `POST /api/photos` — Upload photo to ImgBB

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (port 3000) |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npx prisma generate` | Generate Prisma client |
| `npx prisma db push` | Push schema to database |
| `npx prisma studio` | Open Prisma database browser |

---

## Environment Variables

See [.env.example](./.env.example) for the complete list.

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key (server only) |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Yes* | VAPID public key for push notifications |
| `IMGBB_API_KEY` | Yes | ImgBB API key for photo uploads |
| `CRON_SECRET` | Yes | Secret for daily-reset cron endpoint |
| `DATABASE_URL` | No | Prisma database URL (default: SQLite) |

*\* Push notifications won't work without VAPID keys but the app runs fine without them.*

---

## License

Private / Proprietary. All rights reserved.
