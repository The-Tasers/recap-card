# Reflection App Refactoring Plan

## Implementation Status: COMPLETE

**Last Updated**: 2024-12-30

### What Was Built

| Component | Status | File(s) |
|-----------|--------|---------|
| Data Models | Done | `src/lib/types.ts` |
| Supabase Schema | Done | `supabase/migrations/20251230000000_add_checkin_system.sql` |
| Supabase Types | Done | `src/lib/supabase/types.ts` |
| Check-in Store (local-first) | Done | `src/lib/checkin-store.ts` |
| Dynamic Summary Utils | Done | `src/lib/recap-utils.ts` |
| State Selector | Done | `src/components/state-selector.tsx` |
| Context Selector | Done | `src/components/context-selector.tsx` |
| Person Selector | Done | `src/components/person-selector.tsx` |
| Check-in Flow | Done | `src/components/checkin-flow.tsx` |
| Morning Expectation | Done | `src/components/morning-expectation.tsx` |
| Day Recap | Done | `src/components/day-recap.tsx` |
| Check-in Home | Done | `src/components/checkin-home.tsx` |
| Translations (EN/RU) | Done | `src/lib/i18n/translations.ts` |
| Home Page Integration | Done | `src/app/page.tsx` |

### Key Design Decisions

1. **No persisted insights** - All summaries computed dynamically from check-ins
2. **Insights screen removed** - Out of scope for MVP, future feature
3. **Observational copy only** - No advice, no scores, no productivity language

### Next Steps (Post-MVP)

1. **Cloud Sync**: Integrate check-in data with Supabase sync (similar to existing recap sync)
2. **Settings UI**: Add context/people management to settings page
3. **Data Migration**: Optional migration of legacy recaps to check-ins

---

## Executive Summary

This plan transforms the current "daily recap" app into a "reflection/check-in" app focused on **observing state changes throughout the day** rather than logging daily summaries.

**Key Principle**: This is not a journal, not productivity, not mental health, not goal tracking. It's about **observation without judgment**.

---

## Phase 1: Data Model Extension

### 1.1 New TypeScript Types

Add to `src/lib/types.ts`:

```typescript
// ============================================================================
// NEW: Check-in & Reflection System
// ============================================================================

// State categories for check-ins
export type StateCategory = 'energy' | 'emotion' | 'tension';

// Predefined states (controlled vocabulary)
export interface State {
  id: string;
  label: string;
  category: StateCategory;
  isDefault: boolean;
}

// Contexts (where/what activity)
export interface Context {
  id: string;
  label: string;
  isDefault: boolean;
}

// People (who was involved)
export interface Person {
  id: string;
  userId: string;
  label: string;
}

// Morning expectation tone
export type ExpectationTone =
  | 'calm'
  | 'excited'
  | 'anxious'
  | 'uncertain'
  | 'energized'
  | 'heavy';

// Day entity (replaces conceptual "Recap")
export interface Day {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD format
  morningExpectationTone?: ExpectationTone;
  createdAt: string;
}

// Check-in entity (replaces "Moment")
export interface CheckIn {
  id: string;
  userId: string;
  dayId: string;
  timestamp: string;
  stateId: string;
  contextId: string;
  personId?: string;
  note?: string; // Optional short note, max 200 chars
}

// Future: Insights (placeholder)
export interface Insight {
  id: string;
  userId: string;
  text: string;
  confidenceLevel: number; // 0-100
  createdAt: string;
}
```

### 1.2 Default States (Controlled Vocabulary)

```typescript
export const DEFAULT_STATES: State[] = [
  // Energy states
  { id: 'energized', label: 'Energized', category: 'energy', isDefault: true },
  { id: 'calm', label: 'Calm', category: 'energy', isDefault: true },
  { id: 'tired', label: 'Tired', category: 'energy', isDefault: true },
  { id: 'drained', label: 'Drained', category: 'energy', isDefault: true },

  // Emotion states
  { id: 'content', label: 'Content', category: 'emotion', isDefault: true },
  { id: 'anxious', label: 'Anxious', category: 'emotion', isDefault: true },
  { id: 'frustrated', label: 'Frustrated', category: 'emotion', isDefault: true },
  { id: 'grateful', label: 'Grateful', category: 'emotion', isDefault: true },
  { id: 'uncertain', label: 'Uncertain', category: 'emotion', isDefault: true },

  // Tension states
  { id: 'focused', label: 'Focused', category: 'tension', isDefault: true },
  { id: 'scattered', label: 'Scattered', category: 'tension', isDefault: true },
  { id: 'present', label: 'Present', category: 'tension', isDefault: true },
  { id: 'distracted', label: 'Distracted', category: 'tension', isDefault: true },
];

export const DEFAULT_CONTEXTS: Context[] = [
  { id: 'work', label: 'Work', isDefault: true },
  { id: 'home', label: 'Home', isDefault: true },
  { id: 'commute', label: 'Commute', isDefault: true },
  { id: 'social', label: 'Social', isDefault: true },
  { id: 'alone', label: 'Alone time', isDefault: true },
  { id: 'exercise', label: 'Exercise', isDefault: true },
  { id: 'errands', label: 'Errands', isDefault: true },
  { id: 'rest', label: 'Rest', isDefault: true },
];

export const EXPECTATION_TONES: { value: ExpectationTone; label: string }[] = [
  { value: 'calm', label: 'Calm' },
  { value: 'excited', label: 'Excited' },
  { value: 'anxious', label: 'Anxious' },
  { value: 'uncertain', label: 'Uncertain' },
  { value: 'energized', label: 'Energized' },
  { value: 'heavy', label: 'Heavy' },
];
```

### 1.3 Supabase Schema Updates

Create migration file `supabase/migrations/xxx_add_reflection_tables.sql`:

```sql
-- ============================================================================
-- States table (controlled vocabulary)
-- ============================================================================
CREATE TABLE public.states (
  id text PRIMARY KEY,
  label text NOT NULL,
  category text NOT NULL CHECK (category IN ('energy', 'emotion', 'tension')),
  is_default boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Insert default states
INSERT INTO public.states (id, label, category, is_default) VALUES
  ('energized', 'Energized', 'energy', true),
  ('calm', 'Calm', 'energy', true),
  ('tired', 'Tired', 'energy', true),
  ('drained', 'Drained', 'energy', true),
  ('content', 'Content', 'emotion', true),
  ('anxious', 'Anxious', 'emotion', true),
  ('frustrated', 'Frustrated', 'emotion', true),
  ('grateful', 'Grateful', 'emotion', true),
  ('uncertain', 'Uncertain', 'emotion', true),
  ('focused', 'Focused', 'tension', true),
  ('scattered', 'Scattered', 'tension', true),
  ('present', 'Present', 'tension', true),
  ('distracted', 'Distracted', 'tension', true);

-- ============================================================================
-- Contexts table (controlled vocabulary + user custom)
-- ============================================================================
CREATE TABLE public.contexts (
  id text PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  label text NOT NULL,
  is_default boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Insert default contexts (user_id NULL = system defaults)
INSERT INTO public.contexts (id, label, is_default) VALUES
  ('work', 'Work', true),
  ('home', 'Home', true),
  ('commute', 'Commute', true),
  ('social', 'Social', true),
  ('alone', 'Alone time', true),
  ('exercise', 'Exercise', true),
  ('errands', 'Errands', true),
  ('rest', 'Rest', true);

-- ============================================================================
-- People table (user-specific)
-- ============================================================================
CREATE TABLE public.people (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- ============================================================================
-- Days table (replaces conceptual "recap as form")
-- ============================================================================
CREATE TABLE public.days (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL,
  morning_expectation_tone text CHECK (morning_expectation_tone IN
    ('calm', 'excited', 'anxious', 'uncertain', 'energized', 'heavy')),
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, date)
);

-- ============================================================================
-- Check-ins table (replaces "moments")
-- ============================================================================
CREATE TABLE public.checkins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_id uuid NOT NULL REFERENCES public.days(id) ON DELETE CASCADE,
  timestamp timestamp with time zone NOT NULL DEFAULT now(),
  state_id text NOT NULL REFERENCES public.states(id),
  context_id text NOT NULL,
  person_id uuid REFERENCES public.people(id) ON DELETE SET NULL,
  note text CHECK (char_length(note) <= 200),
  created_at timestamp with time zone DEFAULT now()
);

-- ============================================================================
-- Insights table (placeholder for future)
-- ============================================================================
CREATE TABLE public.insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  text text NOT NULL,
  confidence_level smallint DEFAULT 50 CHECK (confidence_level BETWEEN 0 AND 100),
  created_at timestamp with time zone DEFAULT now()
);

-- ============================================================================
-- Row Level Security
-- ============================================================================

-- States: readable by all (public vocabulary)
ALTER TABLE public.states ENABLE ROW LEVEL SECURITY;
CREATE POLICY "States are viewable by everyone" ON public.states
  FOR SELECT USING (true);

-- Contexts: defaults visible to all, custom only to owner
ALTER TABLE public.contexts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Default contexts viewable by everyone" ON public.contexts
  FOR SELECT USING (is_default = true OR user_id = auth.uid());
CREATE POLICY "Users can insert own contexts" ON public.contexts
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own contexts" ON public.contexts
  FOR DELETE USING (auth.uid() = user_id AND is_default = false);

-- People: only owner
ALTER TABLE public.people ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own people" ON public.people
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own people" ON public.people
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own people" ON public.people
  FOR DELETE USING (auth.uid() = user_id);

-- Days: only owner
ALTER TABLE public.days ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own days" ON public.days
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own days" ON public.days
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own days" ON public.days
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own days" ON public.days
  FOR DELETE USING (auth.uid() = user_id);

-- Check-ins: only owner
ALTER TABLE public.checkins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own checkins" ON public.checkins
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own checkins" ON public.checkins
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own checkins" ON public.checkins
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own checkins" ON public.checkins
  FOR DELETE USING (auth.uid() = user_id);

-- Insights: only owner
ALTER TABLE public.insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own insights" ON public.insights
  FOR SELECT USING (auth.uid() = user_id);
```

---

## Phase 2: Store Updates

### 2.1 New Check-in Store

Create `src/lib/checkin-store.ts`:

```typescript
interface CheckInStore {
  // Today's day
  today: Day | null;

  // Today's check-ins
  checkIns: CheckIn[];

  // User's custom people
  people: Person[];

  // User's custom contexts (merged with defaults)
  contexts: Context[];

  // Loading states
  hydrated: boolean;

  // Actions
  setToday: (day: Day | null) => void;
  setCheckIns: (checkIns: CheckIn[]) => void;
  addCheckIn: (checkIn: CheckIn) => void;
  setMorningExpectation: (tone: ExpectationTone) => void;
  addPerson: (label: string) => Person;
  addContext: (label: string) => Context;

  // Selectors
  getCheckInsForDay: (dayId: string) => CheckIn[];
  getTodayCheckIns: () => CheckIn[];
}
```

### 2.2 Keep Existing Store for Migration

The existing `useCardStore` will remain during transition to support:
- Viewing old recaps as "legacy entries"
- Data migration path
- Gradual rollout

---

## Phase 3: UI Components

### 3.1 Home Screen Refactor

**Current**: "How was today?" -> mood selection -> form

**New**: "Add a check-in" -> state selection flow

File: `src/app/page.tsx` (refactor)

```
Home Screen States:
1. NO CHECK-INS TODAY
   - Show date
   - "Add a check-in" button
   - Subtle copy: "Add moments as they happen. You'll see a recap later."
   - Past days timeline (collapsed)

2. HAS CHECK-INS TODAY
   - Show date
   - List of today's check-ins (minimal display)
   - "Add another" button
   - "View day recap" button (evening only, after 6pm)

3. MORNING (before first check-in, 6am-11am)
   - Optional morning expectation prompt
   - "How does today feel right now?"
```

### 3.2 Morning Expectation Screen (New)

File: `src/components/morning-expectation.tsx`

```
UI Flow:
1. Single question: "How does today feel right now?"
2. 6 tone options (visual chips, no text input)
3. Skip option (implicit - just tap "Add check-in" instead)
4. Never shown again after first check-in of the day
5. Value stored on Day entity, never shown during the day
```

### 3.3 Check-In Flow (New)

File: `src/components/checkin-flow.tsx`

```
3-Step Flow (<10 seconds total):

Step 1: State Selection
- Grid of state chips grouped by category
- Single tap to select
- Auto-advance to step 2

Step 2: Context Selection
- Grid of context chips
- "+" to add custom context inline
- Single tap to select
- Auto-advance to step 3

Step 3: Person (Optional)
- "Who's around?" (skip button prominent)
- List of saved people
- "+" to add new person inline
- Optional note field (max 200 chars)
- "Done" button

UX Constraints:
- No validation errors shown
- No required fields except State + Context
- No reflection questions
- No confirmation dialogs
```

### 3.4 Evening Recap Screen (Core Value)

File: `src/components/evening-recap.tsx`

```
Sections:
1. Overall Day Tone
   - Derived from check-ins (algorithm TBD)
   - Single word or phrase: "A calm day" / "Mixed moments"

2. Morning vs Reality (if morning expectation exists)
   - Neutral comparison
   - "Morning felt anxious. The day turned out calmer."

3. Context Distribution
   - Text-based, not charts
   - "Most moments were at work (5) and home (3)."
   - "Social appeared twice."

4. People Mentioned
   - If any: "Time with Alex and Sam today."
   - If none: omitted

5. Closing Line
   - Observational, no advice
   - Examples:
     - "Today had balanced moments across contexts."
     - "Energy shifted from tired to focused by evening."
     - "A day with more calm than tension."
```

### 3.5 Insights Screen (Placeholder)

File: `src/app/insights/page.tsx`

```
UI:
- Route: /insights
- Locked state with copy:
  "Insights appear once patterns start repeating."
  "Keep adding check-ins. We'll notice what you might miss."
- No actual insight generation yet
- Visual placeholder (subtle animation or illustration)
```

### 3.6 Settings Updates

File: `src/app/settings/page.tsx`

Add sections:
- **Contexts**: View/add/delete custom contexts (not defaults)
- **People**: View/add/delete saved people
- **Data**: Migration status for old recaps

---

## Phase 4: Copy & Tone Changes

### 4.1 Translation Updates

Add to `src/lib/i18n/translations.ts`:

```typescript
// Check-in flow
'checkin.title': 'Add a check-in',
'checkin.hint': 'Add moments as they happen. You\'ll see a recap later.',
'checkin.addAnother': 'Add another',
'checkin.viewRecap': 'View day recap',

// Morning expectation
'morning.question': 'How does today feel right now?',
'morning.skip': 'Skip for now',

// State selection
'state.title': 'How are you feeling?',
'state.energy': 'Energy',
'state.emotion': 'Emotion',
'state.tension': 'Focus',

// Context selection
'context.title': 'What\'s happening?',
'context.addCustom': 'Add context',

// Person selection
'person.title': 'Who\'s around?',
'person.skip': 'No one / Skip',
'person.addNew': 'Add person',

// Note
'note.placeholder': 'Quick note (optional)',

// Evening recap
'recap.title': 'Your day',
'recap.morning': 'Morning expectation',
'recap.contexts': 'Where you were',
'recap.people': 'Who you saw',

// Insights
'insights.locked.title': 'Insights coming soon',
'insights.locked.description': 'Insights appear once patterns start repeating.',
'insights.locked.hint': 'Keep adding check-ins. We\'ll notice what you might miss.',
```

### 4.2 Tone Guidelines (Code Comments)

```typescript
/**
 * COPY GUIDELINES:
 *
 * DO:
 * - Use observational language ("appeared", "shifted", "mostly")
 * - Stay neutral ("mixed", "varied", "balanced")
 * - Compare without judging ("calmer than expected", "more than yesterday")
 *
 * DON'T:
 * - Use "you should"
 * - Include scores or ratings
 * - Use productivity language ("productive", "efficient", "achieved")
 * - Give advice or suggestions
 * - Use evaluative words ("good day", "bad day", "successful")
 */
```

---

## Phase 5: Migration Strategy

### 5.1 Preserve Existing Data

- Keep `recaps` table as-is
- Display old recaps in a "Past Recaps" section (read-only)
- No automatic migration to check-ins (data structures incompatible)

### 5.2 Feature Flags

```typescript
// src/lib/feature-flags.ts
export const FEATURES = {
  // Show new check-in flow vs old recap form
  NEW_CHECKIN_FLOW: true,

  // Show morning expectation prompt
  MORNING_EXPECTATION: true,

  // Show evening recap screen
  EVENING_RECAP: true,

  // Show insights placeholder
  INSIGHTS_PLACEHOLDER: true,

  // Show legacy recaps in timeline
  SHOW_LEGACY_RECAPS: true,
};
```

### 5.3 URL Preservation

Keep existing routes working:
- `/` - Home (check-in or legacy view based on feature flag)
- `/settings` - Settings
- `/login`, `/signup` - Auth

Add new routes:
- `/insights` - Insights placeholder
- `/recap` - Evening recap (optional, could be modal)

---

## Phase 6: Implementation Order

### Sprint 1: Foundation
1. Add new types to `types.ts`
2. Create Supabase migration
3. Update `supabase/types.ts` (regenerate)
4. Create `checkin-store.ts`

### Sprint 2: Check-In Flow
1. Create `StateSelector` component
2. Create `ContextSelector` component
3. Create `PersonSelector` component
4. Build `CheckInFlow` component
5. Integrate into home page

### Sprint 3: Morning & Evening
1. Create `MorningExpectation` component
2. Create `EveningRecap` component
3. Add recap generation logic
4. Wire up to home page flow

### Sprint 4: Polish & Settings
1. Create Insights placeholder page
2. Update Settings with context/people management
3. Add translations (EN + RU)
4. QA and bug fixes

### Sprint 5: Migration & Cleanup
1. Add legacy recap display
2. Test with existing users
3. Gradual rollout via feature flags
4. Remove old code paths once stable

---

## File Changes Summary

### New Files
- `src/lib/checkin-store.ts`
- `src/lib/feature-flags.ts`
- `src/components/checkin-flow.tsx`
- `src/components/state-selector.tsx`
- `src/components/context-selector.tsx`
- `src/components/person-selector.tsx`
- `src/components/morning-expectation.tsx`
- `src/components/evening-recap.tsx`
- `src/app/insights/page.tsx`
- `supabase/migrations/xxx_add_reflection_tables.sql`

### Modified Files
- `src/lib/types.ts` - Add new types
- `src/lib/supabase/types.ts` - Regenerate from schema
- `src/lib/i18n/translations.ts` - Add new copy
- `src/app/page.tsx` - Refactor home flow
- `src/app/settings/page.tsx` - Add context/people management

### Preserved Files (No Changes)
- `src/lib/store.ts` - Keep for legacy
- `src/components/recap-form.tsx` - Keep for legacy
- `src/components/mood-select-view.tsx` - Keep for legacy
- Auth components - No changes needed

---

## Success Metrics

1. **Check-in completion time** < 10 seconds
2. **Morning expectation usage** > 30% of users
3. **Multiple check-ins per day** average > 2
4. **Evening recap engagement** > 50% of users with 3+ check-ins
5. **No increase in user confusion** (feedback/support requests)

---

## Open Questions

1. Should legacy recaps be migrated to check-ins, or kept separate forever?
2. How many check-ins needed before evening recap is useful?
3. Should evening recap be time-gated (only after 6pm) or always available?
4. What's the minimum data needed for insights to unlock?
5. Should people/contexts be shared across devices, or local-only for anonymous users?
