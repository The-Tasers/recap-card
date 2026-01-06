'use client';

// GA4 Analytics utility for custom event tracking

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

const isDev = process.env.NODE_ENV === 'development';

// Helper to check if gtag is available
// In development: logs to console instead of sending to GA4
function gtag(...args: unknown[]) {
  if (isDev) {
    console.log('📊 Analytics:', ...args);
    return;
  }
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag(...args);
  }
}

// ============================================================================
// Screen/Page View Events
// ============================================================================

export function trackScreenView(screenName: string, screenClass?: string) {
  gtag('event', 'screen_view', {
    screen_name: screenName,
    screen_class: screenClass || screenName,
  });
}

// ============================================================================
// Modal Events
// ============================================================================

export function trackModalOpen(modalName: string) {
  gtag('event', 'modal_open', {
    modal_name: modalName,
  });
}

export function trackModalClose(modalName: string, action?: string) {
  gtag('event', 'modal_close', {
    modal_name: modalName,
    close_action: action || 'dismiss',
  });
}

// ============================================================================
// Check-in / Moment Events
// ============================================================================

export function trackMomentStart() {
  gtag('event', 'moment_start', {
    event_category: 'engagement',
  });
}

export function trackMomentComplete(data: {
  stateId: string;
  stateCategory: string;
  contextId: string;
  hasPerson: boolean;
  isFirstMoment: boolean;
}) {
  gtag('event', 'moment_complete', {
    event_category: 'engagement',
    state_id: data.stateId,
    state_category: data.stateCategory,
    context_id: data.contextId,
    has_person: data.hasPerson,
    is_first_moment: data.isFirstMoment,
  });
}

export function trackMomentCancel(hasChanges: boolean) {
  gtag('event', 'moment_cancel', {
    event_category: 'engagement',
    had_changes: hasChanges,
  });
}

export function trackStateSelect(stateId: string, category: string) {
  gtag('event', 'state_select', {
    event_category: 'moment_flow',
    state_id: stateId,
    state_category: category,
  });
}

export function trackContextSelect(contextId: string, isCustom: boolean) {
  gtag('event', 'context_select', {
    event_category: 'moment_flow',
    context_id: contextId,
    is_custom: isCustom,
  });
}

export function trackPersonSelect(
  personId: string | undefined,
  isCustom: boolean
) {
  gtag('event', 'person_select', {
    event_category: 'moment_flow',
    person_id: personId || 'none',
    is_custom: isCustom,
    skipped: !personId,
  });
}

// ============================================================================
// Onboarding Events
// ============================================================================

export function trackOnboardingStart() {
  gtag('event', 'onboarding_start', {
    event_category: 'onboarding',
  });
}

export function trackOnboardingComplete(openedCheckIn: boolean) {
  gtag('event', 'onboarding_complete', {
    event_category: 'onboarding',
    opened_checkin: openedCheckIn,
  });
}

export function trackOnboardingLanguageChange(language: string) {
  gtag('event', 'onboarding_language_change', {
    event_category: 'onboarding',
    language,
  });
}

export function trackOnboardingThemeChange(theme: string) {
  gtag('event', 'onboarding_theme_change', {
    event_category: 'onboarding',
    theme,
  });
}

// ============================================================================
// Navigation Events
// ============================================================================

export function trackDateNavigation(direction: 'prev' | 'next' | 'calendar') {
  gtag('event', 'date_navigation', {
    event_category: 'navigation',
    direction,
  });
}

export function trackDateSelect(daysFromToday: number) {
  gtag('event', 'date_select', {
    event_category: 'navigation',
    days_from_today: daysFromToday,
  });
}

// ============================================================================
// Insights Events
// ============================================================================

export function trackInsightsOpen() {
  gtag('event', 'insights_open', {
    event_category: 'engagement',
  });
}

export function trackInsightsClose() {
  gtag('event', 'insights_close', {
    event_category: 'engagement',
  });
}

// ============================================================================
// Day Recap Events
// ============================================================================

export function trackDayRecapOpen(momentCount: number) {
  gtag('event', 'day_recap_open', {
    event_category: 'engagement',
    moment_count: momentCount,
  });
}

export function trackDayRecapClose() {
  gtag('event', 'day_recap_close', {
    event_category: 'engagement',
  });
}

// ============================================================================
// Orb Interaction Events
// ============================================================================

export function trackOrbTap() {
  gtag('event', 'orb_tap', {
    event_category: 'engagement',
  });
}

export function trackMergedOrbExpand() {
  gtag('event', 'merged_orb_expand', {
    event_category: 'engagement',
  });
}

export function trackMergedOrbCollapse() {
  gtag('event', 'merged_orb_collapse', {
    event_category: 'engagement',
  });
}

export function trackMomentSelectFromGroup() {
  gtag('event', 'moment_select_from_group', {
    event_category: 'engagement',
  });
}

// ============================================================================
// Settings Events
// ============================================================================

export function trackSettingsOpen() {
  gtag('event', 'settings_open', {
    event_category: 'settings',
  });
}

export function trackSettingsChange(setting: string, value: string) {
  gtag('event', 'settings_change', {
    event_category: 'settings',
    setting_name: setting,
    setting_value: value,
  });
}

export function trackLanguageChange(language: string) {
  gtag('event', 'language_change', {
    event_category: 'settings',
    language,
  });
}

export function trackThemeChange(theme: string) {
  gtag('event', 'theme_change', {
    event_category: 'settings',
    theme,
  });
}

// ============================================================================
// Data Events
// ============================================================================

export function trackDataExport() {
  gtag('event', 'data_export', {
    event_category: 'data',
  });
}

export function trackDataClear() {
  gtag('event', 'data_clear', {
    event_category: 'data',
  });
}

export function trackContactClick() {
  gtag('event', 'contact_click', {
    event_category: 'settings',
  });
}

// ============================================================================
// Error Events
// ============================================================================

export function trackError(errorType: string, errorMessage: string) {
  gtag('event', 'error', {
    event_category: 'error',
    error_type: errorType,
    error_message: errorMessage,
  });
}
