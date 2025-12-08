# AI Day Recap - Copilot Instructions

## Project Overview
A minimalist daily journaling PWA where users create shareable "daily cards" with text, mood, and optional photos. Focus: calm, modern UI with offline-first architecture.

## Tech Stack
- **Framework:** Next.js 15 (App Router) + TypeScript
- **UI:** Tailwind CSS + shadcn/ui + lucide-react icons
- **State:** Zustand with localStorage persistence
- **PWA:** next-pwa plugin
- **Image Export:** html-to-image or dom-to-image-more
- **Hosting:** Vercel

## Project Structure
```
/app
  /(home)/page.tsx      # Timeline view
  /create/page.tsx      # Create new card
  /card/[id]/page.tsx   # Card detail view
  /settings/page.tsx    # Settings
/components             # Reusable UI components
/hooks                  # Custom React hooks
/lib                    # Utilities, store, types
/styles                 # Global styles
/public                 # Static assets, PWA icons
```

## Data Model
```typescript
interface DailyCard {
  id: string;
  text: string;           // max 500 chars
  mood: 'great' | 'good' | 'neutral' | 'bad' | 'terrible';
  photoUrl?: string;      // base64 or blob URL
  createdAt: string;      // ISO timestamp
}
```

## Design System
- **Card styling:** `rounded-3xl p-6` with soft beige/lavender gradients
- **Typography:** Title `text-2xl font-semibold`, body `text-base leading-relaxed`
- **Components:** Date badge as muted pill, mood as line-style icon
- **Theme:** Light mode only (MVP), large touch targets, smooth animations
- **Use shadcn:** Card, Button, Sheet components

## Key Patterns

### State Management (Zustand)
Store cards in Zustand with localStorage sync:
```typescript
// lib/store.ts
const useCardStore = create(persist((set, get) => ({
  cards: [],
  addCard: (card) => set((state) => ({ cards: [...state.cards, card] })),
}), { name: 'recap-cards' }));
```

### Image Export
Use `html-to-image` to convert card component to shareable PNG:
```typescript
import { toPng } from 'html-to-image';
const exportCard = async (element: HTMLElement) => toPng(element);
```

### PWA Configuration
Configure `next-pwa` in `next.config.js` with offline support for card creation and viewing.

## Implementation Priorities
1. Project setup: Next.js + Tailwind + shadcn/ui + Zustand + PWA
2. Core data model and Zustand store with localStorage
3. Create card form (text, mood selector, photo upload)
4. Card UI component (shareable, exportable)
5. Timeline view with mood filters
6. Card detail page with image export
7. PWA manifest, icons, offline support
8. Mobile polish: iOS Safari, overscroll, empty states

## Constraints
- No AI features in MVP
- No backend/auth in Phase 1 (localStorage only)
- Max 500 chars for card text
- 5 mood options only
- Light mode only for MVP
