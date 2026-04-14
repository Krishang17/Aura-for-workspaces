# Aura — Your Digital Chief of Staff

Aura is a high-performance Executive AI Assistant that synthesizes your email, calendar, and Slack into a single, actionable stream of intelligence.

## Tech Stack

- **Framework**: Next.js 16 (App Router, React 19)
- **Styling**: Tailwind CSS v4 + custom design system
- **UI Components**: shadcn/ui-compatible components (Button, Card, Badge, Avatar)
- **Auth**: NextAuth.js with Google, Microsoft, and Slack OAuth
- **Database**: Firebase Firestore (per-user data store)
- **AI**: Google Gemini API (planned for Phase 1)
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- A Firebase project
- OAuth credentials for Google, Microsoft, and/or Slack

### Setup

1. Clone the repository:

```bash
git clone https://github.com/krishang17/aura-for-workspaces.git
cd aura-for-workspaces
```

2. Install dependencies:

```bash
npm install
```

3. Copy the environment template and fill in your credentials:

```bash
cp .env.example .env.local
```

4. Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see Aura.

## Project Structure

```
src/
├── app/
│   ├── (dashboard)/          # Dashboard route group
│   │   ├── page.tsx          # Main dashboard with briefing
│   │   ├── briefing/         # Full morning briefing page
│   │   ├── inbox/            # Inbox intelligence
│   │   ├── calendar/         # Smart calendar
│   │   ├── integrations/     # Connect Google, Microsoft, Slack
│   │   ├── settings/         # Privacy hub & preferences
│   │   └── layout.tsx        # Dashboard layout with sidebar
│   ├── login/                # Login page with OAuth providers
│   ├── api/auth/             # NextAuth API routes
│   ├── layout.tsx            # Root layout with providers
│   └── globals.css           # Design system & theme
├── components/
│   ├── dashboard/
│   │   └── sidebar.tsx       # Navigation sidebar
│   ├── ui/                   # Reusable UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   └── avatar.tsx
│   └── providers.tsx         # NextAuth SessionProvider
├── lib/
│   ├── auth.ts               # NextAuth config with 3 providers
│   ├── firebase.ts           # Firebase initialization
│   ├── firestore.ts          # Firestore data models & queries
│   └── utils.ts              # cn() utility
└── types/
    └── next-auth.d.ts        # NextAuth type extensions
```

## Development Phases

- **Phase 0** (current): Foundation — project scaffold, auth, dashboard shell
- **Phase 1**: Core integrations — live Gmail, Calendar, Outlook, Slack APIs
- **Phase 2**: AI intelligence — Gemini-powered briefings, urgency tagging, AI drafts
- **Phase 3**: Smart calendar — conflict resolution, auto-scheduling, focus blocks
- **Phase 4**: Privacy & polish — settings persistence, quiet mode, responsive design
