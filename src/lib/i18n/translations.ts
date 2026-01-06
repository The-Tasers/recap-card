export type Language = 'en' | 'ru';

export const LANGUAGES: { value: Language; label: string; flag: string }[] = [
  { value: 'en', label: 'English', flag: '🇺🇸' },
  { value: 'ru', label: 'Русский', flag: '🇷🇺' },
];

export type TranslationKey = keyof typeof translations.en;

export const translations = {
  en: {
    // App metadata
    'meta.title': 'RECAPZ - Daily Reflection',
    'meta.description': 'A quiet place for your days',

    // Onboarding
    'onboarding.title': 'A day is many moments',
    'onboarding.description':
      'Capture how you feel as it happens. See your day as it really was, not as memory rewrites it.',
    'onboarding.button': 'Try it now',
    'onboarding.successTitle': 'Your first moment',
    'onboarding.successDesc':
      'This is how your day builds up, one moment at a time.',
    'onboarding.continue': 'Got it',
    'onboarding.seeRecap': 'See your recap',

    // Mood select view
    'mood.title': 'How was today?',
    'mood.firstRecapHint': 'Start with how the day felt.',
    'mood.backToToday': 'Back to today',
    'mood.daysRemembered':
      '{count} {count, plural, one {day} other {days}} remembered',

    // Moods
    'mood.great': 'Great',
    'mood.good': 'Good',
    'mood.okay': 'Okay',
    'mood.low': 'Low',
    'mood.rough': 'Rough',

    // Limit reached
    'limit.title': 'Your week is full',
    'limit.description':
      'You have {current} of {max} recaps saved. Remove an older day to make room for today.',

    // Entry editor
    'editor.placeholder': 'What stood out today...',
    'editor.photo.add': 'Add photo',
    'editor.photo.change': 'Change photo',
    'editor.save': 'Save',
    'editor.saving': 'Saving...',
    'editor.cancel': 'Cancel',

    // Timeline entry
    'entry.edit': 'Edit',
    'entry.delete': 'Delete',
    'entry.undo': 'Undo',
    'entry.deleted': 'Day removed',
    'entry.today': 'Today',
    'entry.yesterday': 'Yesterday',

    // Settings
    'settings.title': 'Settings',
    'settings.appearance': 'Appearance',
    'settings.data': 'Data',
    'settings.language': 'Language',
    'settings.cancel': 'Cancel',
    'settings.save': 'Save',
    'settings.saving': 'Saving...',
    'settings.daysCaptured':
      '{count} {count, plural, one {day} other {days}} captured',
    'settings.clearData': 'Clear all data',
    'settings.clearDataConfirm':
      'This will permanently delete {count} {count, plural, one {day} other {days}}.',
    'settings.keepData': 'Keep My Data',
    'settings.deleteAll': 'Delete All',
    'settings.deleting': 'Deleting...',

    // Settings - appearance
    'settings.theme': 'Theme',
    'settings.selectTheme': 'Select theme',
    'settings.selectLanguage': 'Select language',

    // Settings - support
    'settings.about': 'Support',
    'settings.contact': 'Contact',
    'settings.leaveFeedback': 'Feedback',

    // Feedback modal
    'feedback.title': 'Quick feedback',
    'feedback.description': 'How is your experience?',
    'feedback.question': 'How has Recapz felt so far?',
    'feedback.rating.5': 'Love it, feels right',
    'feedback.rating.4': 'Good, it helps',
    'feedback.rating.3': "It's okay",
    'feedback.rating.2': 'Not quite for me',
    'feedback.rating.1': 'Not helpful',
    'feedback.messagePlaceholder': 'What would make it better? (optional)',
    'feedback.submit': 'Send feedback',
    'feedback.thanks': 'Thank you for your feedback!',
    'feedback.error': 'Failed to send feedback',

    // Footer
    'footer.privacy': 'Privacy',
    'footer.terms': 'Terms',

    // Privacy page
    'privacy.title': 'Privacy Policy',
    'privacy.lastUpdated': 'Last updated: January 2026',
    'privacy.yourData': 'Data Storage',
    'privacy.yourDataText':
      'All your moments, feelings, and patterns are stored locally on your device only. We do not have servers that collect or store your personal data.',
    'privacy.whatWeCollect': 'What We Collect',
    'privacy.whatWeCollectText':
      'We do not collect any personal information, usage analytics, or tracking data. Your emotional journey stays completely private.',
    'privacy.dataSecurity': 'Data Sharing',
    'privacy.dataSecurityText':
      'We never share, sell, or transfer your data to third parties. Your information never leaves your device.',
    'privacy.yourRights': 'Your Control',
    'privacy.yourRightsText':
      'You can delete all your data at any time from the Settings.',
    'privacy.contact': 'Contact',
    'privacy.contactText':
      'If you have questions about this privacy policy, please contact us at',

    // Terms page
    'terms.title': 'Terms of Service',
    'terms.lastUpdated': 'Last updated: January 2026',
    'terms.intro':
      'Welcome to RECAPZ. By using this app, you agree to these terms.',
    'terms.acceptance': 'Acceptance of Terms',
    'terms.acceptanceText':
      'By downloading, installing, or using RECAPZ, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the app.',
    'terms.description': 'Description of Service',
    'terms.descriptionText':
      'RECAPZ is a personal journaling and mood tracking application. All data is stored locally on your device. We do not collect, store, or have access to your personal entries.',
    'terms.userResponsibilities': 'User Responsibilities',
    'terms.userResponsibilitiesText':
      'You are responsible for maintaining the security of your device. You agree to use the app only for lawful purposes. You understand that your data exists only on your device.',
    'terms.intellectualProperty': 'Intellectual Property',
    'terms.intellectualPropertyText':
      'The app, including its design, features, and content (excluding your personal entries), is owned by RECAPZ. Your personal entries remain entirely yours.',
    'terms.disclaimer': 'Disclaimer of Warranties',
    'terms.disclaimerText':
      'The app is provided "as is" without warranties of any kind. We do not guarantee uninterrupted or error-free operation.',
    'terms.limitation': 'Limitation of Liability',
    'terms.limitationText':
      'To the maximum extent permitted by law, RECAPZ shall not be liable for any indirect, incidental, or consequential damages arising from your use of the app.',
    'terms.changes': 'Changes to Terms',
    'terms.changesText':
      'We may update these terms from time to time. Continued use of the app after changes constitutes acceptance of the new terms.',
    'terms.termination': 'Termination',
    'terms.terminationText':
      'You may stop using the app at any time by deleting it from your device, which will also delete all your local data.',
    'terms.contact': 'Contact',
    'terms.contactText':
      'If you have questions about these terms, please contact us at',

    // Blocks
    'block.sleep': 'Hours slept',
    'block.weather': 'Weather outside',
    'block.meals': 'Meals eaten',
    'block.selfcare': 'Daily hygiene',
    'block.health': 'Health events',
    'block.exercise': 'Workout done',
    'block.social': 'Social time',
    'block.productivity': 'Productive tasks',
    'block.hobbies': 'Hobbies enjoyed',

    // Weather options
    'weather.sunny': 'sunny',
    'weather.partly-cloudy': 'partly cloudy',
    'weather.cloudy': 'cloudy',
    'weather.rainy': 'rainy',
    'weather.stormy': 'stormy',
    'weather.snowy': 'snowy',
    'weather.foggy': 'foggy',
    'weather.windy': 'windy',

    // Meal options
    'meals.breakfast': 'breakfast',
    'meals.lunch': 'lunch',
    'meals.dinner': 'dinner',
    'meals.night-snack': 'night snack',

    // Selfcare options
    'selfcare.shower': 'shower',
    'selfcare.brush-teeth': 'brush teeth',
    'selfcare.wash-face': 'wash face',
    'selfcare.drink-water': 'drink water',

    // Health options
    'health.sick': 'sick',
    'health.hospital': 'hospital',
    'health.checkup': 'checkup',
    'health.medicine': 'medicine',

    // Exercise options
    'exercise.running': 'running',
    'exercise.walking': 'walking',
    'exercise.cycling': 'cycling',
    'exercise.swimming': 'swimming',
    'exercise.gym': 'gym',
    'exercise.yoga': 'yoga',
    'exercise.stretching': 'stretching',
    'exercise.hiking': 'hiking',
    'exercise.dancing': 'dancing',
    'exercise.sports': 'sports',

    // Social options
    'social.family': 'family time',
    'social.friends': 'friends',
    'social.date': 'date',
    'social.call': 'phone call',
    'social.texting': 'texting',
    'social.videocall': 'video call',
    'social.party': 'party',
    'social.alone': 'alone time',

    // Productivity options
    'productivity.work': 'work',
    'productivity.study': 'study',
    'productivity.writing': 'writing',
    'productivity.tasks': 'tasks done',
    'productivity.goals': 'goal progress',
    'productivity.coding': 'coding',
    'productivity.meeting': 'meetings',
    'productivity.focused': 'deep focus',

    // Hobbies options
    'hobbies.gaming': 'gaming',
    'hobbies.art': 'art',
    'hobbies.photography': 'photography',
    'hobbies.music': 'music',
    'hobbies.reading': 'reading',
    'hobbies.movies': 'movies/TV',
    'hobbies.cooking': 'cooking',
    'hobbies.outdoors': 'outdoors',

    // Form
    'form.placeholder': 'What stood out today...',
    'form.discardChanges': 'Discard changes?',
    'form.discard': 'Discard',
    'form.addDetails': 'Add details',
    'form.photo': 'Photo',
    'form.sleepHours': 'Sleep hours',
    'form.details': 'Details',
    'form.bedtime': 'Bedtime',
    'form.wakeUp': 'Wake up',
    'form.sleep': 'sleep',
    'form.sleepHoursSuffix': 'h',
    'form.sleepMinutesSuffix': 'm',
    'form.clear': 'Clear',
    'form.done': 'Done',

    // Categories
    'category.weather': 'Weather',
    'category.meals': 'Meals',
    'category.selfcare': 'Self Care',
    'category.health': 'Health',
    'category.exercise': 'Exercise',
    'category.social': 'Social',
    'category.productivity': 'Productivity',
    'category.hobbies': 'Hobbies',

    // Card timeline
    'card.edit': 'Edit',
    'card.delete': 'Delete',
    'card.undo': 'Undo',
    'card.more': '+{count} more',
    'card.less': 'Less',
    'card.deleting.0': 'Letting go...',
    'card.deleting.1': 'Making space...',
    'card.deleting.2': 'Released',
    'card.deleting.3': 'Gone gently',
    'card.deleting.4': 'Fading away...',

    // Sync notifications
    'sync.synced': 'Synced {count} {count, plural, one {recap} other {recaps}}',
    'sync.syncedStatus': 'Synced',
    'sync.localStatus': 'Local',
    'sync.failed': 'Sync failed',
    'sync.loadFailed': 'Failed to load recaps',
    'sync.uploadFailed': 'Failed to upload',
    'sync.limitReached': 'Limit reached. Remove an older day first.',
    'sync.restored': 'Recap restored',
    'sync.imageUploadFailed': 'Image upload failed',

    // Toasts
    'toast.allDataCleared': 'All data cleared',
    'toast.failedToClearData': 'Failed to clear data',
    'toast.noDataToExport': 'No data to export',
    'toast.invalidImage': 'Invalid image',
    'toast.failedToProcessImage': 'Failed to process image',
    'toast.trySmallerImage': 'Please try a smaller image.',

    // Image validation errors
    'image.error.notImage': 'Please select an image file.',
    'image.error.unsupportedFormat':
      'Unsupported format. Allowed: JPEG, PNG, GIF, WebP, HEIC.',
    'image.error.tooLarge': 'Image too large ({size}MB). Maximum is 5MB.',

    // Storage errors
    'storage.error.uploadFailed': 'Failed to upload image',
    'storage.error.deleteFailed': 'Failed to delete image',
    'storage.error.fileTooLarge': 'File is too large',
    'storage.error.accessDenied': 'Access denied',
    'storage.error.bucketNotFound': 'Storage not available',
    'storage.error.networkError': 'Network error. Check your connection',
    'storage.error.unknown': 'Something went wrong',

    // Database errors
    'db.error.connectionFailed': 'Connection lost. Please try again',
    'db.error.uniqueViolation': 'This entry already exists',
    'db.error.foreignKeyViolation': 'Related data not found',
    'db.error.notNullViolation': 'Required field is missing',
    'db.error.checkViolation': 'Invalid data',
    'db.error.timeout': 'Request timed out. Please try again',
    'db.error.tooManyRequests': 'Too many requests. Please wait',
    'db.error.unauthorized': 'Please sign in again',
    'db.error.forbidden': 'Access denied',
    'db.error.notFound': 'Data not found',
    'db.error.conflict': 'Data was modified. Please refresh',
    'db.error.serverError': 'Server error. Please try again later',
    'db.error.networkError': 'Network error. Check your connection',
    'db.error.unknown': 'Something went wrong',

    // ============================================================================
    // CHECK-IN FLOW
    // ============================================================================

    // Greetings
    'greeting.morning': 'Good morning',
    'greeting.afternoon': 'Good afternoon',
    'greeting.evening': 'Good evening',
    'greeting.night': 'Good night',

    // Home screen (canvas)
    'home.today': 'Today',
    'home.morningCopy': 'How does today feel so far?',
    'home.afternoonCopy': 'This is how today unfolds',
    'home.eveningCopy': 'Your day, moment by moment',
    'home.nightCopy': 'Today is coming to a close',
    'home.emptyState': 'Nothing marked yet',
    'home.emptyHint': 'You can notice moments as they happen',
    'home.emptyTitle': 'Notice moments',
    'home.emptyExplanation': 'Catch how you feel as the day unfolds',
    'home.seeReflection': 'Day so far',
    'home.seeDayRecap': 'See day recap',
    'home.addMoreMoments':
      'Tap the sun to add more moments throughout your day',
    'home.emptyPast': 'A quiet day',
    'home.momentContext': 'One moment in a larger day.',

    // Rotating button labels for insights (intriguing, curiosity-driven)
    'insights.button.0': 'Your rhythm',
    'insights.button.1': 'What changed?',
    'insights.button.2': "What' next?",

    // Insights panel
    'insights.title': 'Patterns',
    'insights.empty': 'A few more moments and patterns will emerge',
    'insights.emptyNoDays': 'Start tracking moments to see patterns',
    'insights.emptyNeedDays':
      '{count} more {count, plural, one {day} other {days}} with moments needed',
    'insights.emptyNeedMoments': 'A few more moments needed for insights',
    'insights.moreToUnlock': 'More moments reveal deeper patterns',
    'insights.momentCount':
      '{count} {count, plural, one {moment} other {moments}}',
    'insights.toNext': '+{count} to next insight',
    'insights.examplesTitle': 'What you might discover:',
    'insights.example.1': 'You feel drained after work, but energized at home',
    'insights.example.2': 'Time with friends consistently lifts your mood',
    'insights.example.3':
      'Your mornings start calm, but evenings get scattered',
    // Real dynamic insights with actual data
    'insights.contextMakesState': 'You tend to feel {state} at {context}',
    'insights.personMakesState': 'Time with {person} often leaves you {state}',
    'insights.morningVsEvening': 'Mornings feel {comparison} than evenings',
    'insights.eveningVsMorning': 'Evenings feel {comparison} than mornings',
    'insights.weekendBoost': 'Weekends noticeably lift your mood',
    'insights.workDrains': 'Work days tend to drain your energy',
    'insights.betterRecently': 'Things have been looking up lately',
    'insights.harderRecently': 'The last few days have felt heavier',
    'insights.steadyWeek': 'Your energy stayed steady this week',
    'insights.variedWeek': 'This week was a rollercoaster',
    // Comparison words
    'insights.comparison.better': 'better',
    'insights.comparison.calmer': 'calmer',
    'insights.comparison.more_energized': 'more energized',
    // State forms for insights (adjectives that work after "feel" / "leaves you")
    'insights.state.energized': 'energized',
    'insights.state.calm': 'calm',
    'insights.state.tired': 'tired',
    'insights.state.drained': 'drained',
    'insights.state.rested': 'rested',
    'insights.state.content': 'content',
    'insights.state.anxious': 'anxious',
    'insights.state.frustrated': 'frustrated',
    'insights.state.grateful': 'grateful',
    'insights.state.uncertain': 'uncertain',
    'insights.state.focused': 'focused',
    'insights.state.scattered': 'scattered',
    'insights.state.present': 'present',
    'insights.state.distracted': 'distracted',
    'insights.state.overwhelmed': 'overwhelmed',
    'insights.state.neutral': 'neutral',
    // Person forms for insights (same as regular in English, but needed for Russian instrumental case)
    'insights.person.partner': 'Partner',
    'insights.person.family': 'Family',
    'insights.person.friends': 'Friends',
    'insights.person.colleagues': 'Colleagues',
    'insights.person.kids': 'Kids',
    'insights.person.pets': 'Pets',
    'insights.person.strangers': 'Strangers',
    'insights.person.clients': 'Clients',

    // Check-in home
    'checkin.add': 'How are you?',
    'checkin.addAnother': 'Another moment',
    'checkin.hint': "Add moments as they happen. You'll see a recap later.",
    'checkin.viewRecap': 'View day recap',
    'checkin.count': '{count} check-in{count, plural, one {} other {s}} today',
    'checkin.title': 'Check-in',
    // Check-in flow microcopy
    'checkin.stateQuestion': 'What stands out?',
    'checkin.stateHint': "There's no right answer. Just notice.",
    'checkin.contextQuestion': 'Where are you?',
    'checkin.contextHint': 'Activity or place',
    'checkin.personQuestion': 'With anyone?',
    'checkin.personHint': 'Optional',
    'checkin.detailsTitle': 'Add details',
    'checkin.tapToChange': 'Tap to change',
    'checkin.save': 'Save moment',
    'checkin.momentSaved': 'Moment captured',
    'checkin.discardTitle': 'Discard moment?',
    'checkin.discardMessage':
      "You haven't saved this moment yet. Are you sure you want to discard it?",
    'checkin.discardInline': 'Discard unsaved moment?',
    'checkin.keepEditing': 'Keep editing',
    'checkin.discard': 'Discard',

    // Morning expectation
    'morning.question': 'How does today feel ahead?',
    'morning.hint': "This isn't a plan. Just how the day feels right now.",
    'morning.subhint': "Days often unfold differently — that's okay.",
    'morning.skip': 'Skip for now',

    // Expectation tones
    'tone.calm': 'Calm',
    'tone.excited': 'Excited',
    'tone.anxious': 'Anxious',
    'tone.uncertain': 'Uncertain',
    'tone.energized': 'Energized',
    'tone.heavy': 'Heavy',

    // State selection
    'state.neutral': 'Neutral',
    'state.energy': 'Energy',
    'state.emotion': 'Feeling',
    'state.tension': 'Focus',
    'state.more': 'More',
    // Energy states (low to high)
    'state.drained': 'Drained',
    'state.tired': 'Tired',
    'state.calm': 'Calm',
    'state.rested': 'Rested',
    'state.energized': 'Energized',
    // Emotion states (negative to positive)
    'state.frustrated': 'Frustrated',
    'state.anxious': 'Anxious',
    'state.uncertain': 'Uncertain',
    'state.content': 'Content',
    'state.grateful': 'Grateful',
    // Tension states (scattered to present)
    'state.overwhelmed': 'Overwhelmed',
    'state.distracted': 'Distracted',
    'state.scattered': 'Scattered',
    'state.focused': 'Focused',
    'state.present': 'Present',

    // Context selection
    'context.addCustom': 'Add',
    // Default contexts
    'context.work': 'Work',
    'context.home': 'Home',
    'context.commute': 'Commute',
    'context.social': 'Social',
    'context.alone': 'Alone time',
    'context.exercise': 'Exercise',
    'context.errands': 'Errands',
    'context.rest': 'Rest',
    'context.outdoors': 'Outdoors',
    'context.eating': 'Eating',
    'context.learning': 'Learning',
    'context.travel': 'Travel',

    // Person selection (step 3)
    'person.title': 'People',
    'person.subtitle': 'Optional',
    'person.skip': 'No one',
    'person.addNew': 'Add',
    // Default people
    'person.partner': 'Partner',
    'person.family': 'Family',
    'person.friends': 'Friends',
    'person.colleagues': 'Colleagues',
    'person.kids': 'Kids',
    'person.pets': 'Pets',
    'person.strangers': 'Strangers',
    'person.clients': 'Clients',

    // Day recap
    'recap.title': 'Your day',
    'recap.noCheckins': 'A quiet day. Nothing marked.',
    'recap.singleCheckin': 'One moment: {state}.',
    'recap.multipleCheckins':
      '{count} {count, plural, one {moment} other {moments}}.',
    'recap.dominantState': 'Mostly: {state}.',
    'recap.mixedStates': 'Mixed states.',
    'recap.contexts': 'Where',
    'recap.people': 'With',
    'recap.contextSingle': '{context}',
    'recap.contextMultiple': '{first} and {second}',
    'recap.peopleSingle': '{person}',
    'recap.peopleMultiple': '{people}',
    'recap.timeline': 'Moments',
    'recap.timeWith': '{names}',
    'recap.betterThanExpected': 'Morning — {expectation}. Evening — {state}.',
    'recap.differentThanExpected':
      'Morning — {expectation}. Evening — {state}.',
    'recap.asExpected': 'All day — {state}.',
    'recap.closing.1': 'One day of many.',
    'recap.closing.2': 'Recorded.',
    'recap.closing.3': 'Tomorrow is new.',
    'recap.keepNoticing': 'Keep noticing moments as your day unfolds',

    // Energy trends
    'recap.energyRising': 'Energy rose',
    'recap.energyFalling': 'Energy fell',
    'recap.energyStable': 'Energy steady',
    'recap.energyMixed': 'Energy varied',

    // Overall mood
    'recap.mood.great': 'A bright day',
    'recap.mood.good': 'A good day',
    'recap.mood.neutral': 'An even day',
    'recap.mood.low': 'A heavier day',
    'recap.mood.rough': 'A tough day',

    // Form
    'form.back': 'Back',
    'form.next': 'Next',
    'form.add': 'Add',
    'form.cancel': 'Cancel',
    'form.skip': 'Skip',

    // Upgrade prompts (soft, non-blocking)
    'upgrade.customContextLimit':
      'You can add more custom contexts with a paid plan',
    'upgrade.customPersonLimit': 'You can add more people with a paid plan',
    'upgrade.learnMore': 'Learn more',

    // Date picker
    'datePicker.title': 'Go to date',
    'datePicker.endOfTimeline': '30 days of history',
  },

  ru: {
    // App metadata
    'meta.title': 'RECAPZ - Итоги дня',
    'meta.description': 'Тихое место для твоих дней',

    // Onboarding
    'onboarding.title': 'День — это много моментов',
    'onboarding.description':
      'Отмечай как себя чувствуешь прямо сейчас. Увидишь день, каким он был на самом деле',
    'onboarding.button': 'Попробовать',
    'onboarding.successTitle': 'Твой первый момент',
    'onboarding.successDesc':
      'Так день складывается из моментов, один за другим.',
    'onboarding.continue': 'Понятно',
    'onboarding.seeRecap': 'Посмотреть итоги',

    // Mood select view
    'mood.title': 'Как прошёл день?',
    'mood.firstRecapHint': 'Начни с настроения.',
    'mood.backToToday': 'К сегодня',
    'mood.daysRemembered':
      '{count} {count, plural, one {день} few {дня} other {дней}}',

    // Moods
    'mood.great': 'Супер',
    'mood.good': 'Хорошо',
    'mood.okay': 'Норм',
    'mood.low': 'Так себе',
    'mood.rough': 'Тяжко',

    // Limit reached
    'limit.title': 'Неделя заполнена',
    'limit.description':
      'Сохранено {current} из {max} записей. Удали старую, чтобы добавить новую.',

    // Entry editor
    'editor.placeholder': 'Что запомнилось сегодня...',
    'editor.photo.add': 'Добавить фото',
    'editor.photo.change': 'Сменить фото',
    'editor.save': 'Сохранить',
    'editor.saving': 'Сохраняю...',
    'editor.cancel': 'Отмена',

    // Timeline entry
    'entry.edit': 'Изменить',
    'entry.delete': 'Удалить',
    'entry.undo': 'Вернуть',
    'entry.deleted': 'День удалён',
    'entry.today': 'Сегодня',
    'entry.yesterday': 'Вчера',

    // Settings
    'settings.title': 'Настройки',
    'settings.appearance': 'Оформление',
    'settings.data': 'Данные',
    'settings.language': 'Язык',
    'settings.cancel': 'Отмена',
    'settings.save': 'Сохранить',
    'settings.saving': 'Сохраняю...',
    'settings.daysCaptured':
      '{count} {count, plural, one {день} few {дня} other {дней}}',
    'settings.clearData': 'Удалить все данные',
    'settings.clearDataConfirm':
      '{count} {count, plural, one {день} few {дня} other {дней}} {count, plural, one {будет удалён} few {будут удалены} other {будет удалено}}. Навсегда.',
    'settings.keepData': 'Оставить',
    'settings.deleteAll': 'Удалить всё',
    'settings.deleting': 'Удаляю...',

    // Settings - appearance
    'settings.theme': 'Тема',
    'settings.selectTheme': 'Выбери тему',
    'settings.selectLanguage': 'Выбери язык',

    // Settings - support
    'settings.about': 'Поддержка',
    'settings.contact': 'Написать',
    'settings.leaveFeedback': 'Отзыв',

    // Feedback modal
    'feedback.title': 'Быстрый отзыв',
    'feedback.description': 'Как впечатления?',
    'feedback.question': 'Как тебе Recapz?',
    'feedback.rating.5': 'Класс, то что нужно',
    'feedback.rating.4': 'Хорошо, помогает',
    'feedback.rating.3': 'Нормально',
    'feedback.rating.2': 'Не совсем моё',
    'feedback.rating.1': 'Не помогает',
    'feedback.messagePlaceholder': 'Что улучшить? (необязательно)',
    'feedback.submit': 'Отправить',
    'feedback.thanks': 'Спасибо за отзыв!',
    'feedback.error': 'Не удалось отправить',

    // Footer
    'footer.privacy': 'Приватность',
    'footer.terms': 'Условия',

    // Privacy page
    'privacy.title': 'Конфиденциальность',
    'privacy.lastUpdated': 'Обновлено: Январь 2026',
    'privacy.yourData': 'Хранение данных',
    'privacy.yourDataText':
      'Все твои моменты, чувства и паттерны хранятся только локально на твоём устройстве. У нас нет серверов, которые собирают или хранят твои личные данные.',
    'privacy.whatWeCollect': 'Что мы собираем',
    'privacy.whatWeCollectText':
      'Мы не собираем никакой личной информации, аналитики использования или данных отслеживания. Твой эмоциональный путь остаётся полностью приватным.',
    'privacy.dataSecurity': 'Передача данных',
    'privacy.dataSecurityText':
      'Мы никогда не передаём, не продаём и не делимся твоими данными с третьими лицами. Твоя информация никогда не покидает твоё устройство.',
    'privacy.yourRights': 'Твой контроль',
    'privacy.yourRightsText':
      'Ты можешь удалить все данные в любой момент через настройки.',
    'privacy.contact': 'Связь',
    'privacy.contactText':
      'Если есть вопросы по политике конфиденциальности, напиши на',

    // Terms page
    'terms.title': 'Условия использования',
    'terms.lastUpdated': 'Обновлено: Январь 2026',
    'terms.intro':
      'Добро пожаловать в RECAPZ. Используя приложение, вы соглашаетесь с этими условиями.',
    'terms.acceptance': 'Принятие условий',
    'terms.acceptanceText':
      'Скачивая, устанавливая или используя RECAPZ, вы соглашаетесь с этими Условиями использования. Если вы не согласны, пожалуйста, не используйте приложение.',
    'terms.description': 'Описание сервиса',
    'terms.descriptionText':
      'RECAPZ — приложение для личного дневника и отслеживания настроения. Все данные хранятся локально на вашем устройстве. Мы не собираем, не храним и не имеем доступа к вашим записям.',
    'terms.userResponsibilities': 'Ответственность пользователя',
    'terms.userResponsibilitiesText':
      'Вы несёте ответственность за безопасность своего устройства. Вы соглашаетесь использовать приложение только в законных целях. Вы понимаете, что ваши данные существуют только на вашем устройстве.',
    'terms.intellectualProperty': 'Интеллектуальная собственность',
    'terms.intellectualPropertyText':
      'Приложение, включая его дизайн, функции и контент (кроме ваших личных записей), принадлежит RECAPZ. Ваши личные записи полностью принадлежат вам.',
    'terms.disclaimer': 'Отказ от гарантий',
    'terms.disclaimerText':
      'Приложение предоставляется «как есть» без каких-либо гарантий. Мы не гарантируем бесперебойную или безошибочную работу.',
    'terms.limitation': 'Ограничение ответственности',
    'terms.limitationText':
      'В максимальной степени, допускаемой законом, RECAPZ не несёт ответственности за косвенные, случайные или последующие убытки, связанные с использованием приложения.',
    'terms.changes': 'Изменение условий',
    'terms.changesText':
      'Мы можем время от времени обновлять эти условия. Продолжение использования приложения после изменений означает принятие новых условий.',
    'terms.termination': 'Прекращение использования',
    'terms.terminationText':
      'Вы можете прекратить использование приложения в любое время, удалив его с устройства, что также удалит все ваши локальные данные.',
    'terms.contact': 'Связь',
    'terms.contactText':
      'Если у вас есть вопросы об этих условиях, напишите на',

    // Blocks
    'block.sleep': 'Сон',
    'block.weather': 'Погода',
    'block.meals': 'Еда',
    'block.selfcare': 'Уход',
    'block.health': 'Здоровье',
    'block.exercise': 'Спорт',
    'block.social': 'Общение',
    'block.productivity': 'Дела',
    'block.hobbies': 'Хобби',

    // Weather options
    'weather.sunny': 'солнце',
    'weather.partly-cloudy': 'облачно',
    'weather.cloudy': 'пасмурно',
    'weather.rainy': 'дождь',
    'weather.stormy': 'гроза',
    'weather.snowy': 'снег',
    'weather.foggy': 'туман',
    'weather.windy': 'ветер',

    // Meal options
    'meals.breakfast': 'завтрак',
    'meals.lunch': 'обед',
    'meals.dinner': 'ужин',
    'meals.night-snack': 'перекус',

    // Selfcare options
    'selfcare.shower': 'душ',
    'selfcare.brush-teeth': 'зубы',
    'selfcare.wash-face': 'умывание',
    'selfcare.drink-water': 'вода',

    // Health options
    'health.sick': 'болею',
    'health.hospital': 'больница',
    'health.checkup': 'врач',
    'health.medicine': 'лекарства',

    // Exercise options
    'exercise.running': 'бег',
    'exercise.walking': 'прогулка',
    'exercise.cycling': 'велик',
    'exercise.swimming': 'плавание',
    'exercise.gym': 'зал',
    'exercise.yoga': 'йога',
    'exercise.stretching': 'растяжка',
    'exercise.hiking': 'поход',
    'exercise.dancing': 'танцы',
    'exercise.sports': 'спорт',

    // Social options
    'social.family': 'семья',
    'social.friends': 'друзья',
    'social.date': 'свидание',
    'social.call': 'звонок',
    'social.texting': 'переписка',
    'social.videocall': 'видеозвонок',
    'social.party': 'тусовка',
    'social.alone': 'наедине',

    // Productivity options
    'productivity.work': 'работа',
    'productivity.study': 'учёба',
    'productivity.writing': 'письмо',
    'productivity.tasks': 'задачи',
    'productivity.goals': 'цели',
    'productivity.coding': 'код',
    'productivity.meeting': 'встречи',
    'productivity.focused': 'фокус',

    // Hobbies options
    'hobbies.gaming': 'игры',
    'hobbies.art': 'рисование',
    'hobbies.photography': 'фото',
    'hobbies.music': 'музыка',
    'hobbies.reading': 'чтение',
    'hobbies.movies': 'кино',
    'hobbies.cooking': 'готовка',
    'hobbies.outdoors': 'природа',

    // Form
    'form.placeholder': 'Что запомнилось сегодня...',
    'form.discardChanges': 'Сбросить изменения?',
    'form.discard': 'Сбросить',
    'form.addDetails': 'Добавить',
    'form.photo': 'Фото',
    'form.sleepHours': 'Часы сна',
    'form.details': 'Детали',
    'form.bedtime': 'Засыпание',
    'form.wakeUp': 'Пробуждение',
    'form.sleep': 'сна',
    'form.sleepHoursSuffix': 'ч',
    'form.sleepMinutesSuffix': 'м',
    'form.clear': 'Сбросить',
    'form.done': 'Готово',

    // Categories
    'category.weather': 'Погода',
    'category.meals': 'Еда',
    'category.selfcare': 'Уход',
    'category.health': 'Здоровье',
    'category.exercise': 'Спорт',
    'category.social': 'Общение',
    'category.productivity': 'Дела',
    'category.hobbies': 'Хобби',

    // Card timeline
    'card.edit': 'Изменить',
    'card.delete': 'Удалить',
    'card.undo': 'Вернуть',
    'card.more': '+{count} ещё',
    'card.less': 'Меньше',
    'card.deleting.0': 'Удаляется...',
    'card.deleting.1': 'Убираю...',
    'card.deleting.2': 'Готово',
    'card.deleting.3': 'Удалено',
    'card.deleting.4': 'Пока-пока...',

    // Sync notifications
    'sync.synced': 'Синхронизировано: {count}',
    'sync.syncedStatus': 'Синхр.',
    'sync.localStatus': 'Локально',
    'sync.failed': 'Ошибка синхронизации',
    'sync.loadFailed': 'Не удалось загрузить',
    'sync.uploadFailed': 'Не удалось отправить',
    'sync.limitReached': 'Лимит. Сначала удали старую запись.',
    'sync.restored': 'Запись восстановлена',
    'sync.imageUploadFailed': 'Не удалось загрузить фото',

    // Toasts
    'toast.allDataCleared': 'Данные удалены',
    'toast.failedToClearData': 'Не удалось удалить',
    'toast.noDataToExport': 'Нечего экспортировать',
    'toast.invalidImage': 'Неверный формат',
    'toast.failedToProcessImage': 'Не удалось обработать',
    'toast.trySmallerImage': 'Попробуй фото поменьше.',

    // Image validation errors
    'image.error.notImage': 'Выбери файл изображения.',
    'image.error.unsupportedFormat':
      'Неподдерживаемый формат. Можно: JPEG, PNG, GIF, WebP, HEIC.',
    'image.error.tooLarge': 'Слишком большое ({size}МБ). Максимум 5МБ.',

    // Storage errors
    'storage.error.uploadFailed': 'Не удалось загрузить',
    'storage.error.deleteFailed': 'Не удалось удалить',
    'storage.error.fileTooLarge': 'Файл слишком большой',
    'storage.error.accessDenied': 'Доступ запрещён',
    'storage.error.bucketNotFound': 'Хранилище недоступно',
    'storage.error.networkError': 'Ошибка сети. Проверь подключение',
    'storage.error.unknown': 'Что-то пошло не так',

    // Database errors
    'db.error.connectionFailed': 'Соединение потеряно. Попробуй ещё раз',
    'db.error.uniqueViolation': 'Такая запись уже есть',
    'db.error.foreignKeyViolation': 'Связанные данные не найдены',
    'db.error.notNullViolation': 'Обязательное поле не заполнено',
    'db.error.checkViolation': 'Неверные данные',
    'db.error.timeout': 'Время ожидания истекло. Попробуй ещё раз',
    'db.error.tooManyRequests': 'Слишком много запросов. Подожди',
    'db.error.unauthorized': 'Войди заново',
    'db.error.forbidden': 'Доступ запрещён',
    'db.error.notFound': 'Данные не найдены',
    'db.error.conflict': 'Данные изменились. Обнови страницу',
    'db.error.serverError': 'Ошибка сервера. Попробуй позже',
    'db.error.networkError': 'Ошибка сети. Проверь подключение',
    'db.error.unknown': 'Что-то пошло не так',

    // ============================================================================
    // CHECK-IN FLOW
    // ============================================================================

    // Greetings
    'greeting.morning': 'Доброе утро',
    'greeting.afternoon': 'Добрый день',
    'greeting.evening': 'Добрый вечер',
    'greeting.night': 'Доброй ночи',

    // Home screen (canvas)
    'home.today': 'Сегодня',
    'home.morningCopy': 'Как ощущается утро?',
    'home.afternoonCopy': 'Так разворачивается день',
    'home.eveningCopy': 'Твой день, момент за моментом',
    'home.nightCopy': 'День подходит к концу',
    'home.emptyState': 'Пока ничего',
    'home.emptyHint': 'Можешь отмечать моменты по ходу дня',
    'home.emptyTitle': 'Замечай моменты',
    'home.emptyExplanation': 'Лови ощущения по ходу дня',
    'home.seeReflection': 'Обзор дня',
    'home.seeDayRecap': 'Итоги дня',
    'home.addMoreMoments': 'Нажми на солнце, чтобы добавить ещё моменты',
    'home.emptyPast': 'Тихий день',
    'home.momentContext': 'Один момент из многих.',

    // Rotating button labels for insights (intriguing, curiosity-driven)
    'insights.button.0': 'Твой ритм',
    'insights.button.1': 'Что изменилось?',
    'insights.button.2': 'А что дальше?',

    // Insights panel
    'insights.title': 'Твоя история',
    'insights.empty': 'Ещё пара моментов — и появятся паттерны',
    'insights.emptyNoDays': 'Начни отмечать моменты, чтобы увидеть паттерны',
    'insights.emptyNeedDays':
      'Нужно ещё {count} {count, plural, one {день} few {дня} other {дней}} с моментами',
    'insights.emptyNeedMoments': 'Нужно ещё несколько моментов',
    'insights.moreToUnlock': 'Больше моментов — глубже паттерны',
    'insights.momentCount':
      '{count} {count, plural, one {момент} few {момента} other {моментов}}',
    'insights.toNext': '+{count} до нового открытия',
    'insights.examplesTitle': 'Что ты можешь увидеть:',
    'insights.example.1': 'После работы ты выжат, а дома — полон сил',
    'insights.example.2': 'Время с друзьями стабильно поднимает настроение',
    'insights.example.3': 'Утром ты спокоен, но к вечеру рассеян',
    // Real dynamic insights with actual data
    'insights.contextMakesState': '{context} — обычно {state}',
    'insights.personMakesState': 'С {person} часто {state}',
    'insights.morningVsEvening': 'Утром {comparison}, чем вечером',
    'insights.eveningVsMorning': 'Вечером {comparison}, чем утром',
    'insights.weekendBoost': 'На выходных настроение заметно лучше',
    'insights.workDrains': 'Рабочие дни отнимают больше сил',
    'insights.betterRecently': 'Последние дни стало полегче',
    'insights.harderRecently': 'Последние дни были потяжелее',
    'insights.steadyWeek': 'Энергия стабильна всю неделю',
    'insights.variedWeek': 'Неделя была американскими горками',
    // Comparison words
    'insights.comparison.better': 'лучше',
    'insights.comparison.calmer': 'спокойнее',
    'insights.comparison.more_energized': 'больше сил',
    // State forms for insights (nouns that work after "— обычно" / "часто")
    'insights.state.energized': 'энергия',
    'insights.state.calm': 'спокойствие',
    'insights.state.tired': 'усталость',
    'insights.state.drained': 'истощение',
    'insights.state.rested': 'отдых',
    'insights.state.content': 'радость',
    'insights.state.anxious': 'тревога',
    'insights.state.frustrated': 'раздражение',
    'insights.state.grateful': 'удовольствие',
    'insights.state.uncertain': 'неуверенность',
    'insights.state.focused': 'фокус',
    'insights.state.scattered': 'рассеянность',
    'insights.state.present': 'собранность',
    'insights.state.distracted': 'отвлечение',
    'insights.state.overwhelmed': 'перегрузка',
    'insights.state.neutral': 'нейтрально',
    // Person forms for insights (instrumental case - творительный падеж for "С кем?")
    'insights.person.partner': 'партнёром',
    'insights.person.family': 'семьёй',
    'insights.person.friends': 'друзьями',
    'insights.person.colleagues': 'коллегами',
    'insights.person.kids': 'детьми',
    'insights.person.pets': 'питомцами',
    'insights.person.strangers': 'незнакомцами',
    'insights.person.clients': 'клиентами',

    // Check-in home
    'checkin.add': 'Как дела?',
    'checkin.addAnother': 'Ещё момент',
    'checkin.hint': 'Добавляй моменты по ходу дня. Итоги увидишь позже.',
    'checkin.viewRecap': 'Итоги дня',
    'checkin.count':
      '{count} {count, plural, one {момент} few {момента} other {моментов}}',
    'checkin.title': 'Отметка',
    // Check-in flow microcopy
    'checkin.stateQuestion': 'Что чувствуешь?',
    'checkin.stateHint': 'Как есть - так и отметь',
    'checkin.contextQuestion': 'Чем занят?',
    'checkin.contextHint': 'Место или дело',
    'checkin.personQuestion': 'Кто рядом?',
    'checkin.personHint': 'Можно пропустить',
    'checkin.detailsTitle': 'Детали',
    'checkin.tapToChange': 'Нажми, чтобы поменять',
    'checkin.save': 'Сохранить',
    'checkin.momentSaved': 'Момент сохранён',
    'checkin.discardTitle': 'Удалить?',
    'checkin.discardMessage': 'Момент не сохранён. Удалить?',
    'checkin.discardInline': 'Удалить несохранённый момент?',
    'checkin.keepEditing': 'Продолжить',
    'checkin.discard': 'Удалить',

    // Morning expectation
    'morning.question': 'Как ощущается день впереди?',
    'morning.hint': 'Это не план. Просто ощущение прямо сейчас.',
    'morning.subhint': 'Дни часто разворачиваются иначе — это нормально.',
    'morning.skip': 'Пропустить',

    // Expectation tones
    'tone.calm': 'Спокойно',
    'tone.excited': 'Воодушевлённо',
    'tone.anxious': 'Тревожно',
    'tone.uncertain': 'Неясно',
    'tone.energized': 'Энергично',
    'tone.heavy': 'Тяжело',

    // State selection
    'state.neutral': 'Нейтрально',
    'state.energy': 'Силы',
    'state.emotion': 'Настрой',
    'state.tension': 'Фокус',
    'state.more': 'Ещё',
    // Energy states (low to high)
    'state.drained': 'Истощение',
    'state.tired': 'Усталость',
    'state.calm': 'Спокойствие',
    'state.rested': 'Отдых',
    'state.energized': 'Энергия',
    // Emotion states (negative to positive)
    'state.frustrated': 'Раздражение',
    'state.anxious': 'Тревога',
    'state.uncertain': 'Неуверенность',
    'state.content': 'Радость',
    'state.grateful': 'Удовольствие',
    // Tension states (scattered to present)
    'state.overwhelmed': 'Перегрузка',
    'state.distracted': 'Отвлечение',
    'state.scattered': 'Рассеянность',
    'state.focused': 'В фокусе',
    'state.present': 'Собранность',

    // Context selection
    'context.addCustom': 'Добавить',
    // Default contexts
    'context.work': 'Работа',
    'context.home': 'Дома',
    'context.commute': 'В пути',
    'context.social': 'Общение',
    'context.alone': 'Наедине',
    'context.exercise': 'Спорт',
    'context.errands': 'Дела',
    'context.rest': 'Отдыхаю',
    'context.outdoors': 'На улице',
    'context.eating': 'Еда',
    'context.learning': 'Учёба',
    'context.travel': 'Путешествие',

    // Person selection (step 3)
    'person.title': 'Люди',
    'person.subtitle': 'Необязательно',
    'person.skip': 'Никого',
    'person.addNew': 'Добавить',
    // Default people
    'person.partner': 'Партнёр',
    'person.family': 'Семья',
    'person.friends': 'Друзья',
    'person.colleagues': 'Коллеги',
    'person.kids': 'Дети',
    'person.pets': 'Питомцы',
    'person.strangers': 'Незнакомцы',
    'person.clients': 'Клиенты',

    // Day recap
    'recap.title': 'Твой день',
    'recap.noCheckins': 'Тихий день. Ничего не отмечено.',
    'recap.singleCheckin': 'Один момент: {state}.',
    'recap.multipleCheckins':
      '{count} {count, plural, one {момент} few {момента} other {моментов}}.',
    'recap.dominantState': 'Чаще: {state}.',
    'recap.mixedStates': 'Разные состояния.',
    'recap.contexts': 'Где',
    'recap.people': 'С кем',
    'recap.contextSingle': '{context}',
    'recap.contextMultiple': '{first} и {second}',
    'recap.peopleSingle': '{person}',
    'recap.peopleMultiple': '{people}',
    'recap.timeline': 'Моменты',
    'recap.timeWith': '{names}',
    'recap.betterThanExpected': 'Утром — {expectation}. К вечеру — {state}.',
    'recap.differentThanExpected': 'Утром — {expectation}. К вечеру — {state}.',
    'recap.asExpected': 'Весь день — {state}.',
    'recap.closing.1': 'Один день из многих.',
    'recap.closing.2': 'Записано.',
    'recap.closing.3': 'Завтра — новый день.',
    'recap.keepNoticing': 'Продолжай замечать моменты по ходу дня',

    // Energy trends
    'recap.energyRising': 'Энергия росла',
    'recap.energyFalling': 'Энергия падала',
    'recap.energyStable': 'Энергия ровная',
    'recap.energyMixed': 'Энергия скакала',

    // Overall mood
    'recap.mood.great': 'Отличный день',
    'recap.mood.good': 'Хороший день',
    'recap.mood.neutral': 'Ровный день',
    'recap.mood.low': 'Тяжеловатый день',
    'recap.mood.rough': 'Непростой день',

    // Form
    'form.back': 'Назад',
    'form.next': 'Далее',
    'form.add': 'Добавить',
    'form.cancel': 'Отмена',
    'form.skip': 'Пропустить',

    // Upgrade prompts (soft, non-blocking)
    'upgrade.customContextLimit': 'Больше контекстов доступно с платным планом',
    'upgrade.customPersonLimit': 'Больше людей доступно с платным планом',
    'upgrade.learnMore': 'Подробнее',

    // Date picker
    'datePicker.title': 'Перейти к дате',
    'datePicker.endOfTimeline': '30 дней истории',
  },
} as const;
