# AI Day Recap - Copilot Instructions

## Project Overview

A minimalist daily journaling PWA where users create shareable "daily cards" summarizing their day. Users write a short note, select a mood, optionally attach a photo, and the system generates a clean, shareable card. Cards are browsed in a timeline.

**Design philosophy:** Simple, calm, visually refined, frictionless.

## Tech Stack

- **Framework:** Next.js 16 (App Router) + TypeScript
- **UI:** Tailwind CSS + shadcn/ui + lucide-react icons
- **State:** Zustand with localStorage persistence
- **PWA:** next-pwa plugin
- **Image Export:** html-to-image
- **Hosting:** Vercel

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Timeline view (scrollable cards, mood filters)
│   ├── create/page.tsx       # Create new card form
│   ├── card/[id]/page.tsx    # Card detail view with export
│   ├── card/[id]/edit/page.tsx # Edit existing card
│   ├── settings/page.tsx     # Settings and data management
│   ├── layout.tsx            # Root layout with BottomNav
│   └── globals.css           # Global styles + PWA safe areas
├── components/
│   ├── ui/                   # shadcn/ui components (button, card, dialog, etc.)
│   ├── daily-card-view.tsx   # Main card display component (exportable)
│   ├── mood-selector.tsx     # 5-mood emoji selector + MoodBadge
│   ├── mood-filter.tsx       # Timeline filter by mood
│   ├── photo-uploader.tsx    # Drag/drop photo upload
│   ├── date-badge.tsx        # Formatted date pill
│   ├── bottom-nav.tsx        # Mobile navigation
│   └── empty-state.tsx       # Empty timeline state
├── lib/
│   ├── types.ts              # DailyCard type, Mood type, MOODS constant
│   ├── store.ts              # Zustand store with localStorage persistence
│   ├── export.ts             # Image export, download, share utilities
│   └── utils.ts              # cn() helper from shadcn
└── public/
    ├── manifest.json         # PWA manifest
    └── icons/                # PWA icons (72-512px)
```

## Data Model

```typescript
type Mood = 'great' | 'good' | 'neutral' | 'bad' | 'terrible';

interface DailyCard {
  id: string;
  text: string;           // max 500 chars
  mood: Mood;
  photoUrl?: string;      // base64 data URL
  createdAt: string;      // ISO timestamp
}
```

## Design System

### Card Style
- **Corners:** `rounded-3xl`
- **Padding:** `p-6`
- **Backgrounds:** Gradient `from-amber-50/80 via-white to-violet-50/80`
- **Typography:** Body `text-base leading-relaxed`
- **Accents:** Emoji mood icon, date badge (pill style, muted)

### General UI
- Minimalistic, calm aesthetic
- Light mode only (MVP)
- Large touchable controls (`h-12` buttons)
- Use shadcn: Card, Button, Sheet, Dialog, Textarea components

## Key Patterns

### State Management (Zustand)
```typescript
// src/lib/store.ts - includes hydration handling for Next.js
const useCardStore = create(persist((set, get) => ({
  cards: [],
  hydrated: false,
  addCard: (card) => set((s) => ({ cards: [card, ...s.cards] })),
  updateCard: (id, updates) => set((s) => ({
    cards: s.cards.map((c) => c.id === id ? { ...c, ...updates } : c)
  })),
  deleteCard: (id) => set((s) => ({ cards: s.cards.filter((c) => c.id !== id) })),
  getById: (id) => get().cards.find((c) => c.id === id),
  getCardByDate: (date) => get().cards.find((c) => 
    new Date(c.createdAt).toDateString() === new Date(date).toDateString()
  ),
}), { name: 'recap-cards' }));
```

### Image Export
```typescript
// src/lib/export.ts
import { toPng } from 'html-to-image';
export const exportCardImage = async (el: HTMLElement) => 
  toPng(el, { quality: 0.95, pixelRatio: 2, backgroundColor: '#ffffff' });
```

### Component Pattern: DailyCardView
Use `forwardRef` for the card component to enable image export via ref:
```typescript
export const DailyCardView = forwardRef<HTMLDivElement, Props>(({ card }, ref) => (
  <div ref={ref} className="rounded-3xl p-6 bg-gradient-to-br ...">
    {/* Card content */}
  </div>
));
```

## Development Commands
```bash
npm run dev      # Start dev server (Turbopack)
npm run build    # Production build
npm run start    # Run production build
npm run lint     # ESLint check
```

## Constraints
- No AI features in MVP
- No backend/auth (localStorage only)
- Max 500 chars for card text
- 5 mood options only
- Light mode only
- App must run fully offline and install as PWA
