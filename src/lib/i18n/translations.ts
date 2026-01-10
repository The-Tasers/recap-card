export type Language = 'en' | 'es' | 'fr' | 'de' | 'zh' | 'ja' | 'ko' | 'ru';

export const LANGUAGES: { value: Language; label: string; flag: string }[] = [
  { value: 'en', label: 'English', flag: '🇺🇸' },
  { value: 'es', label: 'Español', flag: '🇪🇸' },
  { value: 'fr', label: 'Français', flag: '🇫🇷' },
  { value: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { value: 'zh', label: '中文', flag: '🇨🇳' },
  { value: 'ja', label: '日本語', flag: '🇯🇵' },
  { value: 'ko', label: '한국어', flag: '🇰🇷' },
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
      'We do not collect any personal information. Your moments, feelings, and emotional data stay completely private on your device.',
    'privacy.dataSecurity': 'Data Sharing',
    'privacy.dataSecurityText':
      'Your personal emotional data never leaves your device. We do not share any of your data with third parties.',
    'privacy.yourRights': 'Your Control',
    'privacy.yourRightsText':
      'You can delete all your local data at any time from the Settings.',
    'privacy.contact': 'Contact',
    'privacy.contactText':
      'If you have questions about this privacy policy, please contact us at',

    // Mobile Privacy page
    'privacy.mobile.title': 'Privacy Policy',
    'privacy.mobile.lastUpdated': 'Last Updated: January 2026',
    'privacy.mobile.introduction': 'Introduction',
    'privacy.mobile.introText':
      'RECAPZ ("we," "our," or "the app") is committed to protecting your privacy. This Privacy Policy explains how we handle your information when you use our iOS mobile application.',
    'privacy.mobile.commitment':
      'Your data stays on your device. Period.',
    'privacy.mobile.dontCollect': 'Information We Don\'t Collect',
    'privacy.mobile.dontCollectIntro': 'We do not collect:',
    'privacy.mobile.dontCollect1':
      'Personal information (name, email, phone number)',
    'privacy.mobile.dontCollect2':
      'Usage analytics or behavior tracking',
    'privacy.mobile.dontCollect3':
      'Device identifiers or advertising IDs',
    'privacy.mobile.dontCollect4': 'Location data',
    'privacy.mobile.dontCollect5':
      'Any data whatsoever from your use of the app',
    'privacy.mobile.youCreate': 'Information You Create',
    'privacy.mobile.youCreateIntro':
      'When using RECAPZ, you create and store the following data locally on your device:',
    'privacy.mobile.emotionalCheckins': 'Emotional Check-ins',
    'privacy.mobile.checkin1':
      'Your selected emotional states (energy, feeling, focus)',
    'privacy.mobile.checkin2': 'Timestamps of when you recorded each moment',
    'privacy.mobile.checkin3':
      'Context information (activities, locations you manually enter)',
    'privacy.mobile.checkin4':
      'People you were with (if you choose to add this information)',
    'privacy.mobile.appPreferences': 'App Preferences',
    'privacy.mobile.pref1': 'Theme selection (color scheme)',
    'privacy.mobile.pref2': 'Language preference',
    'privacy.mobile.pref3': 'Notification settings and reminder times',
    'privacy.mobile.pref4': 'Onboarding completion status',
    'privacy.mobile.allDataStays':
      'All this data is stored exclusively on your iPhone, never transmitted to any external server, never shared with any third party, and can be completely deleted at any time through the app\'s settings.',
    'privacy.mobile.dataSecurity': 'Data Security',
    'privacy.mobile.dataSecurityText':
      'Your data is protected by Apple\'s built-in iOS security mechanisms, local device encryption (if you have device encryption enabled), and no network transmission (because we never send your data anywhere).',
    'privacy.mobile.icloudBackup': 'iCloud Backup',
    'privacy.mobile.icloudBackupText':
      'If you have iCloud Backup enabled on your device, your RECAPZ data may be included in your encrypted iCloud backup along with your other app data. This is controlled by Apple\'s iOS settings, not by RECAPZ. We recommend keeping iCloud Backup enabled for data recovery purposes.',
    'privacy.mobile.noThirdParty': 'No Third-Party Services',
    'privacy.mobile.noThirdPartyIntro': 'RECAPZ does not use:',
    'privacy.mobile.noThirdParty1':
      'Analytics services (no Google Analytics, Firebase, Mixpanel, etc.)',
    'privacy.mobile.noThirdParty2': 'Advertising networks',
    'privacy.mobile.noThirdParty3': 'Crash reporting services',
    'privacy.mobile.noThirdParty4': 'Social media integrations',
    'privacy.mobile.noThirdParty5':
      'Any third-party SDKs that collect data',
    'privacy.mobile.notifications': 'Notifications',
    'privacy.mobile.notificationsText':
      'If you enable notifications, all notifications are generated and scheduled locally on your device. No push notification servers are used, and no external services are notified when you receive a reminder.',
    'privacy.mobile.dataControl': 'Data Deletion',
    'privacy.mobile.dataControlIntro': 'You have complete control over your data:',
    'privacy.mobile.deleteAll': 'Delete All Data',
    'privacy.mobile.deleteAllText':
      'Go to Settings → History → "Clear all data" to permanently delete all your check-ins, preferences, and app data from your device.',
    'privacy.mobile.deleteApp': 'Delete the App',
    'privacy.mobile.deleteAppText':
      'Uninstalling RECAPZ from your iPhone will permanently remove all app data from your device.',
    'privacy.mobile.noRecovery': 'No Recovery',
    'privacy.mobile.noRecoveryText':
      'Once you delete your data, it cannot be recovered because we don\'t have copies of it anywhere.',
    'privacy.mobile.yourRights': 'Your Rights',
    'privacy.mobile.yourRightsText':
      'Because all your data stays on your device: You can view all your data within the app, delete all data instantly through app settings, and you have complete control at all times.',
    'privacy.mobile.changes': 'Changes to This Privacy Policy',
    'privacy.mobile.changesText':
      'We may update this Privacy Policy from time to time. We will notify you by updating the "Last Updated" date and posting the new policy in the app. Continued use after changes constitutes acceptance of the updated policy.',
    'privacy.mobile.summary': 'Summary',
    'privacy.mobile.summaryText':
      'RECAPZ doesn\'t collect any data from you. Everything you record stays on your iPhone. We can\'t see it, we can\'t access it, and we don\'t want it. Your emotional journey is yours and yours alone. That\'s our promise.',

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

    // Mobile Terms page
    'terms.mobile.title': 'Terms of Service',
    'terms.mobile.lastUpdated': 'Last Updated: January 2026',
    'terms.mobile.agreement': 'Agreement to Terms',
    'terms.mobile.agreementText':
      'By downloading, installing, or using RECAPZ ("the app," "our app," or "the service"), you agree to be bound by these Terms of Service. If you do not agree to these Terms, please do not use the app.',
    'terms.mobile.description': 'Description of Service',
    'terms.mobile.descriptionIntro':
      'RECAPZ is a personal emotional awareness and reflection app for iOS devices. The app allows you to:',
    'terms.mobile.desc1': 'Record emotional check-ins throughout your day',
    'terms.mobile.desc2': 'Track patterns in your emotional states',
    'terms.mobile.desc3': 'Visualize your emotional journey',
    'terms.mobile.desc4': 'Set reminders for self-reflection',
    'terms.mobile.desc5': 'Customize your experience with themes and languages',
    'terms.mobile.notMedical':
      'All data is stored locally on your device. RECAPZ does not provide medical, therapeutic, or professional mental health services.',
    'terms.mobile.eligibility': 'Eligibility',
    'terms.mobile.eligibilityText':
      'RECAPZ is available to users of all ages. If you are under 13 years old, please have a parent or guardian review these Terms with you.',
    'terms.mobile.license': 'License to Use',
    'terms.mobile.licenseGrant':
      'We grant you a limited, non-exclusive, non-transferable, revocable license to use RECAPZ for personal, non-commercial purposes, subject to these Terms.',
    'terms.mobile.restrictions': 'You may not:',
    'terms.mobile.restrict1':
      'Modify, reverse engineer, decompile, or disassemble the app',
    'terms.mobile.restrict2': 'Remove any copyright or proprietary notices',
    'terms.mobile.restrict3': 'Use the app for any illegal or unauthorized purpose',
    'terms.mobile.restrict4':
      'Attempt to gain unauthorized access to any part of the app',
    'terms.mobile.restrict5':
      'Copy, distribute, or create derivative works from the app',
    'terms.mobile.userContent': 'User-Generated Content',
    'terms.mobile.yourData':
      'All content you create in RECAPZ (check-ins, notes, preferences) remains your property. You retain all rights to your data.',
    'terms.mobile.localStorage':
      'Your data is stored exclusively on your device. We do not have access to, cannot view, and do not collect your content.',
    'terms.mobile.yourResponsibility': 'You are solely responsible for:',
    'terms.mobile.resp1': 'The accuracy of information you record',
    'terms.mobile.resp2': 'Maintaining the security of your device',
    'terms.mobile.resp3':
      'Backing up your data (via iCloud or other methods)',
    'terms.mobile.intellectualProperty': 'Intellectual Property',
    'terms.mobile.intellectualPropertyText':
      'RECAPZ, including its design, features, graphics, user interface, code, and all related materials, is owned by us and protected by copyright, trademark, and other intellectual property laws.',
    'terms.mobile.noMedicalAdvice': 'No Medical Advice',
    'terms.mobile.notSubstitute': 'Not a Substitute for Professional Care',
    'terms.mobile.notSubstituteText':
      'RECAPZ is a self-reflection tool, not a medical device or mental health treatment. The app does not provide medical advice, diagnosis, or treatment and should not be used in emergency situations.',
    'terms.mobile.emergency': 'Emergency Situations',
    'terms.mobile.emergencyText':
      'If you are experiencing a mental health emergency: United States: Call 988 (Suicide & Crisis Lifeline) or 911. International: Contact your local emergency services. RECAPZ is not designed for crisis situations.',
    'terms.mobile.disclaimers': 'Disclaimers',
    'terms.mobile.disclaimersAsIs':
      'RECAPZ is provided "as is" and "as available" without warranties of any kind, either express or implied.',
    'terms.mobile.disclaimersNoGuarantee':
      'We do not guarantee that the app will be uninterrupted, timely, secure, or error-free, or that your data will be preserved (you should maintain backups).',
    'terms.mobile.limitation': 'Limitation of Liability',
    'terms.mobile.limitationText':
      'To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of data, loss of profits, emotional distress, or personal injury.',
    'terms.mobile.updates': 'App Updates and Changes',
    'terms.mobile.updatesText':
      'We reserve the right to modify or discontinue the app, add or remove features, and update these Terms at any time. Continued use after changes constitutes acceptance of the updated Terms.',
    'terms.mobile.appStore': 'Apple App Store',
    'terms.mobile.appStoreText':
      'Your use of RECAPZ is also subject to Apple\'s App Store Terms of Service. In case of conflict between these Terms and Apple\'s terms, Apple\'s terms shall prevail for issues related to the App Store.',
    'terms.mobile.privacyRef': 'Privacy',
    'terms.mobile.privacyRefText':
      'Please review our Privacy Policy to understand how we handle your information (we don\'t collect it). The Privacy Policy is incorporated into these Terms by reference.',
    'terms.mobile.termination': 'Termination',
    'terms.mobile.terminationText':
      'You may stop using RECAPZ at any time by deleting the app from your device. Upon termination, your license to use the app ends and you must delete the app from your devices.',
    'terms.mobile.contact': 'Contact Information',
    'terms.mobile.contactText':
      'If you have questions about these Terms, please contact us at',
    'terms.mobile.summary': 'Summary',
    'terms.mobile.summaryText':
      'Use RECAPZ for personal reflection and self-awareness. Don\'t use it as a substitute for professional mental health care. Your data stays on your device and is your responsibility to back up. Be kind, use the app responsibly, and take care of yourself. If you\'re in crisis, please reach out for professional help.',

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
    'insights.title': 'Your Story',
    'insights.empty': "A few more moments and you'll start to see yourself",
    'insights.emptyNoDays': 'Start tracking moments to learn about yourself',
    'insights.emptyNeedDays':
      '{count} more {count, plural, one {day} other {days}} with moments needed',
    'insights.emptyNeedMoments': 'A few more moments needed for insights',
    'insights.moreToUnlock': 'More moments, more to discover',
    'insights.momentCount':
      '{count} {count, plural, one {moment} other {moments}}',
    'insights.toNext': '+{count} to next insight',
    'insights.discovering': 'Something is taking shape...',
    'insights.teaserPlaceholder': 'Your pattern will appear here',
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

    // Landing page
    'landing.appStore': 'Download on App Store',
    'landing.heroTitle': 'Notice how you feel',
    'landing.heroSubtitle': 'A gentle way to notice how you feel throughout the day. Capture moments, see your emotional colors blend together, and discover what lifts you up.',
    'landing.description': 'RECAPZ is a quiet companion for your inner world — a space to pause, notice how you feel, and watch your emotional colors unfold.',
    'landing.breatheTitle': 'A moment to breathe',
    'landing.breatheText1': 'Life moves fast. RECAPZ invites you to slow down, just for a breath. When you check in, you simply notice: How am I feeling right now? Where am I? Who am I with?',
    'landing.breatheText2': 'Each moment you capture adds a new color to your day - soft greens for gratitude, warm oranges for uncertainty, cool purples for focus. No judgment, no scores. Just awareness.',
    'landing.visualizedTitle': 'Your day, visualized',
    'landing.visualizedText1': 'At the heart of RECAPZ is a glowing orb that holds your day. As you add moments, watch your colors blend and shift together, creating something uniquely yours. It\'s a gentle mirror reflecting your emotional landscape.',
    'landing.visualizedText2': 'Tap into your day to see each moment scattered like colorful stones - each one a small piece of your story.',
    'landing.patternsTitle': 'Patterns that reveal themselves',
    'landing.patternsText1': 'Over time, RECAPZ quietly notices what you might not see yourself. Maybe mornings bring you more energy. Perhaps certain places or people shift how you feel. These insights emerge naturally, like stars appearing at dusk.',
    'landing.patternsText2': 'No pressure to capture everything. No streaks to maintain. Just show up when it feels right.',
    'landing.about1Title': 'Pause & Reflect',
    'landing.about1Desc': 'Take a moment to check in with yourself. Choose how you feel and add a quick note about your day.',
    'landing.about2Title': 'Watch It Come Alive',
    'landing.about2Desc': 'Your emotions blend into a beautiful, ever-changing orb. Each color tells part of your story.',
    'landing.about3Title': 'Completely Private',
    'landing.about3Desc': 'No accounts. No cloud. All data stays on your device. Just you and your moments.',
    'landing.screenshotsTitle': 'See it in action',
    'landing.screenshotsSubtitle': 'Explore the app through beautiful screenshots',
    'landing.featuresTitle': 'Thoughtfully designed',
    'landing.feature1Title': 'Living orb',
    'landing.feature1Desc': 'A breathing orb that reflects your emotional colors throughout the day.',
    'landing.feature2Title': 'Light & dark themes',
    'landing.feature2Desc': 'Beautiful themes that feel natural in any lighting.',
    'landing.feature3Title': 'Gentle reminders',
    'landing.feature3Desc': 'Optional notifications when you want them.',
    'landing.feature4Title': 'Your history',
    'landing.feature4Desc': 'Your last 30 days, always there to revisit.',
    'landing.feature5Title': 'Multiple languages',
    'landing.feature5Desc': 'Available in 8 languages for a global audience.',
    'landing.feature6Title': 'Private by design',
    'landing.feature6Desc': 'Everything stays on your device. No accounts, no cloud.',
    'landing.privacyTitle': 'Private by design',
    'landing.privacyText': 'Your emotional world stays yours. Everything lives on your device. No accounts, no cloud, no data leaving your phone. This is your space alone.',
    'landing.closingText': 'RECAPZ is for anyone who wants to understand themselves a little better - not through analysis, but through gentle noticing.',
    'landing.closingTagline': 'One moment at a time.',
    'landing.faqTitle': 'Frequently Asked Questions',
    'landing.faq1Q': 'Is my data private?',
    'landing.faq1A': 'Yes, completely. All your data stays on your device. We don\'t have servers, accounts, or any way to access your information. Your emotional journey is yours alone.',
    'landing.faq2Q': 'How does the color system work?',
    'landing.faq2A': 'Each emotional state has its own color. When you check in, your feelings blend together in the orb, creating a unique visual representation of your day. Over time, you\'ll start to recognize your patterns.',
    'landing.faq3Q': 'Do I need to check in multiple times a day?',
    'landing.faq3A': 'Not at all. Check in when it feels right - once a day, several times, or whenever you want to pause and notice. There are no streaks or pressure.',
    'landing.faq4Q': 'What happens to my data if I delete the app?',
    'landing.faq4A': 'Since all data is stored locally on your device, deleting the app will permanently remove all your check-ins. We have no backups because we never had access to your data.',
    'landing.faq5Q': 'Is RECAPZ a replacement for therapy?',
    'landing.faq5A': 'No. RECAPZ is a self-reflection tool, not a medical device or mental health treatment. If you\'re struggling, please reach out to a mental health professional.',
    'landing.contactTitle': 'Contact Us',
    'landing.contactText': 'Have questions or feedback? We\'d love to hear from you.',
    'landing.ctaText': 'Start noticing your moments today.',
    'landing.copyright': '© 2026 Sponom Dev. All rights reserved.',
    'header.otherProducts': 'Other Products',
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
      'Мы не собираем никакой личной информации. Твои моменты, чувства и эмоциональные данные остаются полностью приватными на твоём устройстве.',
    'privacy.dataSecurity': 'Передача данных',
    'privacy.dataSecurityText':
      'Твои личные эмоциональные данные никогда не покидают твоё устройство. Мы не передаём никакие твои данные третьим лицам.',
    'privacy.yourRights': 'Твой контроль',
    'privacy.yourRightsText':
      'Ты можешь удалить все локальные данные в любой момент через настройки.',
    'privacy.contact': 'Связь',
    'privacy.contactText':
      'Если есть вопросы по политике конфиденциальности, напиши на',

    // Mobile Privacy page (Russian)
    'privacy.mobile.title': 'Конфиденциальность',
    'privacy.mobile.lastUpdated': 'Обновлено: Январь 2026',
    'privacy.mobile.introduction': 'Введение',
    'privacy.mobile.introText':
      'RECAPZ ("мы", "наше" или "приложение") заботится о защите твоей конфиденциальности. Эта Политика конфиденциальности объясняет, как мы обрабатываем твои данные в нашем iOS приложении.',
    'privacy.mobile.commitment':
      'Твои данные остаются на твоём устройстве. Точка.',
    'privacy.mobile.dontCollect': 'Что мы НЕ собираем',
    'privacy.mobile.dontCollectIntro': 'Мы НЕ собираем:',
    'privacy.mobile.dontCollect1':
      'Личную информацию (имя, email, телефон)',
    'privacy.mobile.dontCollect2':
      'Аналитику использования или отслеживание поведения',
    'privacy.mobile.dontCollect3':
      'Идентификаторы устройства или рекламные ID',
    'privacy.mobile.dontCollect4': 'Данные о местоположении',
    'privacy.mobile.dontCollect5':
      'Вообще любые данные об использовании приложения',
    'privacy.mobile.youCreate': 'Информация, которую создаёшь ты',
    'privacy.mobile.youCreateIntro':
      'Используя RECAPZ, ты создаёшь и сохраняешь следующие данные локально на своём устройстве:',
    'privacy.mobile.emotionalCheckins': 'Эмоциональные записи',
    'privacy.mobile.checkin1':
      'Твои выбранные эмоциональные состояния (энергия, чувства, фокус)',
    'privacy.mobile.checkin2': 'Метки времени, когда ты записал каждый момент',
    'privacy.mobile.checkin3':
      'Контекстную информацию (активности, места, которые ты вводишь вручную)',
    'privacy.mobile.checkin4':
      'Людей, с которыми ты был (если решишь добавить эту информацию)',
    'privacy.mobile.appPreferences': 'Настройки приложения',
    'privacy.mobile.pref1': 'Выбранная тема (цветовая схема)',
    'privacy.mobile.pref2': 'Предпочитаемый язык',
    'privacy.mobile.pref3': 'Настройки уведомлений и время напоминаний',
    'privacy.mobile.pref4': 'Статус прохождения онбординга',
    'privacy.mobile.allDataStays':
      'Все эти данные хранятся исключительно на твоём iPhone, никогда не передаются на внешние серверы, никогда не передаются третьим лицам и могут быть полностью удалены в любое время через настройки приложения.',
    'privacy.mobile.dataSecurity': 'Безопасность данных',
    'privacy.mobile.dataSecurityText':
      'Твои данные защищены встроенными механизмами безопасности iOS от Apple, локальным шифрованием устройства (если у тебя включено шифрование) и отсутствием сетевой передачи (потому что мы никогда не отправляем твои данные куда-либо).',
    'privacy.mobile.icloudBackup': 'Резервное копирование iCloud',
    'privacy.mobile.icloudBackupText':
      'Если у тебя включено резервное копирование iCloud на устройстве, твои данные RECAPZ могут быть включены в зашифрованную резервную копию iCloud вместе с другими данными приложений. Это контролируется настройками iOS от Apple, а не RECAPZ. Мы рекомендуем держать резервное копирование iCloud включенным для восстановления данных.',
    'privacy.mobile.noThirdParty': 'Нет сторонних сервисов',
    'privacy.mobile.noThirdPartyIntro': 'RECAPZ НЕ использует:',
    'privacy.mobile.noThirdParty1':
      'Сервисы аналитики (никакого Google Analytics, Firebase, Mixpanel и т.д.)',
    'privacy.mobile.noThirdParty2': 'Рекламные сети',
    'privacy.mobile.noThirdParty3': 'Сервисы отчётов об ошибках',
    'privacy.mobile.noThirdParty4': 'Интеграции с социальными сетями',
    'privacy.mobile.noThirdParty5':
      'Любые сторонние SDK, которые собирают данные',
    'privacy.mobile.notifications': 'Уведомления',
    'privacy.mobile.notificationsText':
      'Если ты включишь уведомления, все уведомления генерируются и планируются локально на твоём устройстве. Никакие серверы push-уведомлений не используются, и никакие внешние сервисы не уведомляются, когда ты получаешь напоминание.',
    'privacy.mobile.dataControl': 'Удаление данных',
    'privacy.mobile.dataControlIntro': 'У тебя полный контроль над твоими данными:',
    'privacy.mobile.deleteAll': 'Удалить все данные',
    'privacy.mobile.deleteAllText':
      'Перейди в Настройки → История → "Удалить все данные", чтобы навсегда удалить все твои записи, настройки и данные приложения с устройства.',
    'privacy.mobile.deleteApp': 'Удалить приложение',
    'privacy.mobile.deleteAppText':
      'Удаление RECAPZ с твоего iPhone навсегда удалит все данные приложения с устройства.',
    'privacy.mobile.noRecovery': 'Без восстановления',
    'privacy.mobile.noRecoveryText':
      'Как только ты удалишь свои данные, их невозможно будет восстановить, потому что у нас нет их копий где-либо.',
    'privacy.mobile.yourRights': 'Твои права',
    'privacy.mobile.yourRightsText':
      'Поскольку все твои данные остаются на твоём устройстве: Ты можешь просматривать все данные в приложении, мгновенно удалять все данные через настройки приложения, и у тебя всегда полный контроль.',
    'privacy.mobile.changes': 'Изменения этой Политики',
    'privacy.mobile.changesText':
      'Мы можем время от времени обновлять эту Политику конфиденциальности. Мы уведомим тебя, обновив дату "Обновлено" и опубликовав новую политику в приложении. Продолжение использования после изменений означает принятие обновлённой политики.',
    'privacy.mobile.summary': 'Итого',
    'privacy.mobile.summaryText':
      'RECAPZ не собирает никакие данные от тебя. Всё, что ты записываешь, остаётся на твоём iPhone. Мы не можем это видеть, не можем получить к этому доступ, и нам это не нужно. Твоё эмоциональное путешествие принадлежит только тебе. Это наше обещание.',

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

    // Mobile Terms page (Russian)
    'terms.mobile.title': 'Условия использования',
    'terms.mobile.lastUpdated': 'Обновлено: Январь 2026',
    'terms.mobile.agreement': 'Согласие с условиями',
    'terms.mobile.agreementText':
      'Скачивая, устанавливая или используя RECAPZ ("приложение", "наше приложение" или "сервис"), ты соглашаешься с этими Условиями использования. Если ты не согласен с этими Условиями, пожалуйста, не используй приложение.',
    'terms.mobile.description': 'Описание сервиса',
    'terms.mobile.descriptionIntro':
      'RECAPZ — это приложение для личного эмоционального осознания и рефлексии для iOS устройств. Приложение позволяет тебе:',
    'terms.mobile.desc1': 'Записывать эмоциональные чек-ины в течение дня',
    'terms.mobile.desc2': 'Отслеживать паттерны в твоих эмоциональных состояниях',
    'terms.mobile.desc3': 'Визуализировать твоё эмоциональное путешествие',
    'terms.mobile.desc4': 'Устанавливать напоминания для саморефлексии',
    'terms.mobile.desc5': 'Настраивать опыт с помощью тем и языков',
    'terms.mobile.notMedical':
      'Все данные хранятся локально на твоём устройстве. RECAPZ не предоставляет медицинские, терапевтические или профессиональные услуги в области психического здоровья.',
    'terms.mobile.eligibility': 'Право использования',
    'terms.mobile.eligibilityText':
      'RECAPZ доступен пользователям всех возрастов. Если тебе меньше 13 лет, пожалуйста, попроси родителя или опекуна ознакомиться с этими Условиями вместе с тобой.',
    'terms.mobile.license': 'Лицензия на использование',
    'terms.mobile.licenseGrant':
      'Мы предоставляем тебе ограниченную, неисключительную, непередаваемую, отзывную лицензию на использование RECAPZ для личных, некоммерческих целей в соответствии с этими Условиями.',
    'terms.mobile.restrictions': 'Тебе запрещено:',
    'terms.mobile.restrict1':
      'Модифицировать, проводить обратную разработку, декомпилировать или дизассемблировать приложение',
    'terms.mobile.restrict2': 'Удалять любые уведомления об авторских правах',
    'terms.mobile.restrict3':
      'Использовать приложение для любых незаконных или несанкционированных целей',
    'terms.mobile.restrict4':
      'Пытаться получить несанкционированный доступ к любой части приложения',
    'terms.mobile.restrict5':
      'Копировать, распространять или создавать производные работы от приложения',
    'terms.mobile.userContent': 'Пользовательский контент',
    'terms.mobile.yourData':
      'Весь контент, который ты создаёшь в RECAPZ (чек-ины, заметки, настройки), остаётся твоей собственностью. Ты сохраняешь все права на свои данные.',
    'terms.mobile.localStorage':
      'Твои данные хранятся исключительно на твоём устройстве. Мы не имеем доступа, не можем просматривать и не собираем твой контент.',
    'terms.mobile.yourResponsibility': 'Ты несёшь полную ответственность за:',
    'terms.mobile.resp1': 'Точность информации, которую ты записываешь',
    'terms.mobile.resp2': 'Поддержание безопасности твоего устройства',
    'terms.mobile.resp3':
      'Резервное копирование твоих данных (через iCloud или другими способами)',
    'terms.mobile.intellectualProperty': 'Интеллектуальная собственность',
    'terms.mobile.intellectualPropertyText':
      'RECAPZ, включая его дизайн, функции, графику, пользовательский интерфейс, код и все связанные материалы, принадлежат нам и защищены законами об авторском праве, товарных знаках и другой интеллектуальной собственности.',
    'terms.mobile.noMedicalAdvice': 'Не медицинская консультация',
    'terms.mobile.notSubstitute': 'Не замена профессиональной помощи',
    'terms.mobile.notSubstituteText':
      'RECAPZ — это инструмент для саморефлексии, а не медицинское устройство или лечение психического здоровья. Приложение не предоставляет медицинские консультации, диагностику или лечение и не должно использоваться в экстренных ситуациях.',
    'terms.mobile.emergency': 'Экстренные ситуации',
    'terms.mobile.emergencyText':
      'Если у тебя экстренная ситуация с психическим здоровьем: США: Звони 988 (Линия помощи в кризисных ситуациях) или 911. Международные: Свяжись с местными экстренными службами. RECAPZ не предназначен для кризисных ситуаций.',
    'terms.mobile.disclaimers': 'Отказ от гарантий',
    'terms.mobile.disclaimersAsIs':
      'RECAPZ предоставляется "как есть" и "как доступно" без каких-либо гарантий, явных или подразумеваемых.',
    'terms.mobile.disclaimersNoGuarantee':
      'Мы не гарантируем, что приложение будет работать без перерывов, своевременно, безопасно или без ошибок, или что твои данные будут сохранены (ты должен вести резервные копии).',
    'terms.mobile.limitation': 'Ограничение ответственности',
    'terms.mobile.limitationText':
      'В максимальной степени, разрешённой законом, мы не несём ответственности за любые косвенные, случайные, особые, последующие или штрафные убытки, включая потерю данных, потерю прибыли, эмоциональный стресс или телесные повреждения.',
    'terms.mobile.updates': 'Обновления и изменения приложения',
    'terms.mobile.updatesText':
      'Мы оставляем за собой право изменять или прекращать работу приложения, добавлять или удалять функции и обновлять эти Условия в любое время. Продолжение использования после изменений означает принятие обновлённых Условий.',
    'terms.mobile.appStore': 'Apple App Store',
    'terms.mobile.appStoreText':
      'Твоё использование RECAPZ также регулируется Условиями использования Apple App Store. В случае конфликта между этими Условиями и условиями Apple, условия Apple имеют преимущество для вопросов, связанных с App Store.',
    'terms.mobile.privacyRef': 'Конфиденциальность',
    'terms.mobile.privacyRefText':
      'Пожалуйста, ознакомься с нашей Политикой конфиденциальности, чтобы понять, как мы обрабатываем твою информацию (мы её не собираем). Политика конфиденциальности включена в эти Условия по ссылке.',
    'terms.mobile.termination': 'Прекращение использования',
    'terms.mobile.terminationText':
      'Ты можешь прекратить использование RECAPZ в любое время, удалив приложение со своего устройства. После прекращения твоя лицензия на использование приложения заканчивается, и ты должен удалить приложение со своих устройств.',
    'terms.mobile.contact': 'Контактная информация',
    'terms.mobile.contactText':
      'Если у тебя есть вопросы об этих Условиях, пожалуйста, свяжись с нами по адресу',
    'terms.mobile.summary': 'Итого',
    'terms.mobile.summaryText':
      'Используй RECAPZ для личной рефлексии и самосознания. Не используй его как замену профессиональной помощи в области психического здоровья. Твои данные остаются на твоём устройстве, и ты несёшь ответственность за их резервное копирование. Будь добр, используй приложение ответственно и заботься о себе. Если у тебя кризис, пожалуйста, обратись за профессиональной помощью.',

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
    'insights.empty': 'Ещё пара моментов — и начнёшь замечать интересные вещи',
    'insights.emptyNoDays': 'Отмечай моменты, чтобы узнать себя лучше',
    'insights.emptyNeedDays':
      'Нужно ещё {count} {count, plural, one {день} few {дня} other {дней}} с моментами',
    'insights.emptyNeedMoments': 'Нужно ещё несколько моментов',
    'insights.moreToUnlock': 'Чем больше моментов, тем больше открытий',
    'insights.momentCount':
      '{count} {count, plural, one {момент} few {момента} other {моментов}}',
    'insights.toNext': '+{count} до нового открытия',
    'insights.discovering': 'Кое-что вырисовывается...',
    'insights.teaserPlaceholder': 'Здесь появится твой паттерн',
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

    // Landing page
    'landing.appStore': 'Скачать в App Store',
    'landing.heroTitle': 'Замечай, что чувствуешь',
    'landing.heroSubtitle': 'Мягкий способ замечать свои чувства в течение дня. Фиксируй моменты, наблюдай, как смешиваются твои эмоциональные цвета, и открывай, что поднимает тебе настроение.',
    'landing.description': 'RECAPZ — тихий спутник твоего внутреннего мира. Пространство, чтобы остановиться, заметить, что чувствуешь, и наблюдать, как разворачиваются твои эмоциональные цвета.',
    'landing.breatheTitle': 'Момент, чтобы выдохнуть',
    'landing.breatheText1': 'Жизнь несётся быстро. RECAPZ приглашает замедлиться — хотя бы на вдох. Когда отмечаешь момент, просто замечаешь: Как я себя сейчас чувствую? Где я? С кем я?',
    'landing.breatheText2': 'Каждый момент добавляет новый цвет в твой день — мягкие зелёные для благодарности, тёплые оранжевые для неуверенности, прохладные фиолетовые для фокуса. Без оценок, без баллов. Только осознанность.',
    'landing.visualizedTitle': 'Твой день наглядно',
    'landing.visualizedText1': 'В сердце RECAPZ — светящаяся сфера, которая хранит твой день. Добавляя моменты, наблюдай, как твои цвета смешиваются и перетекают друг в друга, создавая нечто уникальное. Это мягкое зеркало, отражающее твой эмоциональный ландшафт.',
    'landing.visualizedText2': 'Нажми на свой день, чтобы увидеть каждый момент как разноцветные камешки — каждый из них маленькая часть твоей истории.',
    'landing.patternsTitle': 'Паттерны, которые проявляются сами',
    'landing.patternsText1': 'Со временем RECAPZ тихо замечает то, что ты можешь не видеть сам. Может, утром у тебя больше энергии. Может, определённые места или люди меняют твоё состояние. Эти инсайты появляются естественно, как звёзды на закате.',
    'landing.patternsText2': 'Никакого давления фиксировать всё. Никаких серий для поддержания. Просто заходи, когда чувствуешь, что это нужно.',
    'landing.about1Title': 'Остановись и задумайся',
    'landing.about1Desc': 'Удели момент себе. Выбери своё настроение и добавь короткую заметку о дне.',
    'landing.about2Title': 'Смотри, как оживает',
    'landing.about2Desc': 'Твои эмоции смешиваются в красивую, постоянно меняющуюся сферу. Каждый цвет — часть твоей истории.',
    'landing.about3Title': 'Полная приватность',
    'landing.about3Desc': 'Без аккаунтов. Без облака. Все данные остаются на устройстве. Только ты и твои моменты.',
    'landing.screenshotsTitle': 'Посмотрите в действии',
    'landing.screenshotsSubtitle': 'Исследуйте приложение через красивые скриншоты',
    'landing.featuresTitle': 'Продуманный дизайн',
    'landing.feature1Title': 'Живая сфера',
    'landing.feature1Desc': 'Дышащая сфера, отражающая твои эмоциональные цвета в течение дня.',
    'landing.feature2Title': 'Светлая и тёмная темы',
    'landing.feature2Desc': 'Красивые темы, которые естественно смотрятся при любом освещении.',
    'landing.feature3Title': 'Мягкие напоминания',
    'landing.feature3Desc': 'Необязательные уведомления, когда тебе это нужно.',
    'landing.feature4Title': 'Твоя история',
    'landing.feature4Desc': 'Последние 30 дней всегда доступны для просмотра.',
    'landing.feature5Title': 'Много языков',
    'landing.feature5Desc': 'Доступно на 8 языках для пользователей по всему миру.',
    'landing.feature6Title': 'Приватность по дизайну',
    'landing.feature6Desc': 'Всё остаётся на твоём устройстве. Без аккаунтов, без облака.',
    'landing.privacyTitle': 'Приватность по дизайну',
    'landing.privacyText': 'Твой эмоциональный мир остаётся твоим. Всё хранится на твоём устройстве. Без аккаунтов, без облака, данные не покидают твой телефон. Это только твоё пространство.',
    'landing.closingText': 'RECAPZ для тех, кто хочет понять себя чуть лучше — не через анализ, а через мягкое наблюдение.',
    'landing.closingTagline': 'Один момент за раз.',
    'landing.faqTitle': 'Частые вопросы',
    'landing.faq1Q': 'Мои данные приватны?',
    'landing.faq1A': 'Да, полностью. Все данные остаются на твоём устройстве. У нас нет серверов, аккаунтов или способов получить доступ к твоей информации. Твоё эмоциональное путешествие принадлежит только тебе.',
    'landing.faq2Q': 'Как работает система цветов?',
    'landing.faq2A': 'Каждое эмоциональное состояние имеет свой цвет. Когда ты отмечаешь момент, твои чувства смешиваются в сфере, создавая уникальное визуальное представление твоего дня. Со временем ты начнёшь узнавать свои паттерны.',
    'landing.faq3Q': 'Нужно ли отмечаться несколько раз в день?',
    'landing.faq3A': 'Вовсе нет. Отмечайся, когда чувствуешь потребность — раз в день, несколько раз или когда хочешь остановиться и заметить. Никаких серий или давления.',
    'landing.faq4Q': 'Что произойдёт с данными, если удалить приложение?',
    'landing.faq4A': 'Поскольку все данные хранятся локально на твоём устройстве, удаление приложения навсегда удалит все твои записи. У нас нет резервных копий, потому что мы никогда не имели доступа к твоим данным.',
    'landing.faq5Q': 'RECAPZ заменяет терапию?',
    'landing.faq5A': 'Нет. RECAPZ — инструмент для саморефлексии, а не медицинское устройство или лечение психического здоровья. Если тебе тяжело, обратись к специалисту по психическому здоровью.',
    'landing.contactTitle': 'Связаться с нами',
    'landing.contactText': 'Есть вопросы или отзывы? Мы будем рады услышать от тебя.',
    'landing.ctaText': 'Начни замечать свои моменты уже сегодня.',
    'landing.copyright': '© 2026 Sponom Dev. Все права защищены.',
    'header.otherProducts': 'Другие продукты',
  },

  // Spanish
  es: {
    'meta.title': 'RECAPZ - Reflexión Diaria',
    'meta.description': 'Un lugar tranquilo para tus días',
    'footer.privacy': 'Privacidad',
    'footer.terms': 'Términos',
    'settings.language': 'Idioma',
    'landing.appStore': 'Descargar en App Store',
    'landing.heroTitle': 'Nota cómo te sientes',
    'landing.heroSubtitle': 'Una forma suave de notar cómo te sientes durante el día. Captura momentos, observa cómo se mezclan tus colores emocionales y descubre qué te eleva.',
    'landing.description': 'RECAPZ es un compañero silencioso para tu mundo interior — un espacio para pausar, notar cómo te sientes y observar cómo se despliegan tus colores emocionales.',
    'landing.breatheTitle': 'Un momento para respirar',
    'landing.breatheText1': 'La vida va rápido. RECAPZ te invita a desacelerar, solo por un respiro. Cuando haces check-in, simplemente notas: ¿Cómo me siento ahora? ¿Dónde estoy? ¿Con quién estoy?',
    'landing.breatheText2': 'Cada momento que capturas añade un nuevo color a tu día - verdes suaves para la gratitud, naranjas cálidos para la incertidumbre, púrpuras frescos para el enfoque. Sin juicios, sin puntuaciones. Solo consciencia.',
    'landing.visualizedTitle': 'Tu día, visualizado',
    'landing.visualizedText1': 'En el corazón de RECAPZ hay un orbe brillante que contiene tu día. Al añadir momentos, observa cómo tus colores se mezclan y cambian juntos, creando algo únicamente tuyo. Es un espejo suave que refleja tu paisaje emocional.',
    'landing.visualizedText2': 'Toca tu día para ver cada momento esparcido como piedras coloridas - cada una una pequeña pieza de tu historia.',
    'landing.patternsTitle': 'Patrones que se revelan',
    'landing.patternsText1': 'Con el tiempo, RECAPZ nota silenciosamente lo que tú podrías no ver. Quizás las mañanas te traen más energía. Quizás ciertos lugares o personas cambian cómo te sientes. Estas ideas emergen naturalmente, como estrellas apareciendo al atardecer.',
    'landing.patternsText2': 'Sin presión para capturarlo todo. Sin rachas que mantener. Solo aparece cuando se sienta bien.',
    'landing.about1Title': 'Pausa y reflexiona',
    'landing.about1Desc': 'Tómate un momento para conectar contigo. Elige cómo te sientes y añade una nota rápida.',
    'landing.about2Title': 'Míralo cobrar vida',
    'landing.about2Desc': 'Tus emociones se mezclan en un hermoso orbe en constante cambio. Cada color cuenta parte de tu historia.',
    'landing.about3Title': 'Completamente privado',
    'landing.about3Desc': 'Sin cuentas. Sin nube. Todos los datos quedan en tu dispositivo. Solo tú y tus momentos.',
    'landing.screenshotsTitle': 'Míralo en acción',
    'landing.screenshotsSubtitle': 'Explora la app a través de hermosas capturas',
    'landing.featuresTitle': 'Diseñado con cuidado',
    'landing.feature1Title': 'Orbe viviente',
    'landing.feature1Desc': 'Un orbe que respira y refleja tus colores emocionales durante el día.',
    'landing.feature2Title': 'Temas claro y oscuro',
    'landing.feature2Desc': 'Hermosos temas que se sienten naturales en cualquier iluminación.',
    'landing.feature3Title': 'Recordatorios suaves',
    'landing.feature3Desc': 'Notificaciones opcionales cuando las quieras.',
    'landing.feature4Title': 'Tu historial',
    'landing.feature4Desc': 'Tus últimos 30 días, siempre ahí para revisitar.',
    'landing.feature5Title': 'Múltiples idiomas',
    'landing.feature5Desc': 'Disponible en 8 idiomas para una audiencia global.',
    'landing.feature6Title': 'Privado por diseño',
    'landing.feature6Desc': 'Todo permanece en tu dispositivo. Sin cuentas, sin nube.',
    'landing.privacyTitle': 'Privado por diseño',
    'landing.privacyText': 'Tu mundo emocional permanece tuyo. Todo vive en tu dispositivo. Sin cuentas, sin nube, sin datos saliendo de tu teléfono. Este es tu espacio solo.',
    'landing.closingText': 'RECAPZ es para cualquiera que quiera entenderse un poco mejor - no a través del análisis, sino a través de la observación suave.',
    'landing.closingTagline': 'Un momento a la vez.',
    'landing.faqTitle': 'Preguntas Frecuentes',
    'landing.faq1Q': '¿Mis datos son privados?',
    'landing.faq1A': 'Sí, completamente. Todos tus datos permanecen en tu dispositivo. No tenemos servidores, cuentas ni forma de acceder a tu información. Tu viaje emocional es solo tuyo.',
    'landing.faq2Q': '¿Cómo funciona el sistema de colores?',
    'landing.faq2A': 'Cada estado emocional tiene su propio color. Cuando haces check-in, tus sentimientos se mezclan en el orbe, creando una representación visual única de tu día. Con el tiempo, empezarás a reconocer tus patrones.',
    'landing.faq3Q': '¿Necesito hacer check-in varias veces al día?',
    'landing.faq3A': 'Para nada. Haz check-in cuando se sienta bien - una vez al día, varias veces, o cuando quieras pausar y notar. No hay rachas ni presión.',
    'landing.faq4Q': '¿Qué pasa con mis datos si elimino la app?',
    'landing.faq4A': 'Como todos los datos se almacenan localmente en tu dispositivo, eliminar la app eliminará permanentemente todos tus check-ins. No tenemos copias de seguridad porque nunca tuvimos acceso a tus datos.',
    'landing.faq5Q': '¿RECAPZ reemplaza la terapia?',
    'landing.faq5A': 'No. RECAPZ es una herramienta de auto-reflexión, no un dispositivo médico ni tratamiento de salud mental. Si estás pasándola mal, por favor busca un profesional de salud mental.',
    'landing.contactTitle': 'Contáctanos',
    'landing.contactText': '¿Tienes preguntas o comentarios? Nos encantaría saber de ti.',
    'landing.ctaText': 'Empieza a notar tus momentos hoy.',
    'landing.copyright': '© 2026 Sponom Dev. Todos los derechos reservados.',
    'header.otherProducts': 'Otros Productos',
  },

  // French
  fr: {
    'meta.title': 'RECAPZ - Réflexion Quotidienne',
    'meta.description': 'Un endroit calme pour vos journées',
    'footer.privacy': 'Confidentialité',
    'footer.terms': 'Conditions',
    'settings.language': 'Langue',
    'landing.appStore': 'Télécharger sur l\'App Store',
    'landing.heroTitle': 'Remarquez comment vous vous sentez',
    'landing.heroSubtitle': 'Une façon douce de remarquer comment vous vous sentez tout au long de la journée. Capturez des moments, observez vos couleurs émotionnelles se mélanger et découvrez ce qui vous élève.',
    'landing.description': 'RECAPZ est un compagnon silencieux pour votre monde intérieur — un espace pour faire une pause, remarquer comment vous vous sentez et regarder vos couleurs émotionnelles se déployer.',
    'landing.breatheTitle': 'Un moment pour respirer',
    'landing.breatheText1': 'La vie va vite. RECAPZ vous invite à ralentir, juste le temps d\'une respiration. Quand vous faites un check-in, vous remarquez simplement : Comment je me sens maintenant ? Où suis-je ? Avec qui suis-je ?',
    'landing.breatheText2': 'Chaque moment que vous capturez ajoute une nouvelle couleur à votre journée - des verts doux pour la gratitude, des oranges chauds pour l\'incertitude, des violets frais pour la concentration. Pas de jugement, pas de scores. Juste la conscience.',
    'landing.visualizedTitle': 'Votre journée, visualisée',
    'landing.visualizedText1': 'Au cœur de RECAPZ se trouve un orbe lumineux qui contient votre journée. En ajoutant des moments, regardez vos couleurs se mélanger et changer ensemble, créant quelque chose d\'uniquement vôtre. C\'est un miroir doux reflétant votre paysage émotionnel.',
    'landing.visualizedText2': 'Touchez votre journée pour voir chaque moment dispersé comme des pierres colorées - chacune une petite pièce de votre histoire.',
    'landing.patternsTitle': 'Des motifs qui se révèlent',
    'landing.patternsText1': 'Avec le temps, RECAPZ remarque silencieusement ce que vous pourriez ne pas voir vous-même. Peut-être que les matins vous apportent plus d\'énergie. Peut-être que certains endroits ou personnes changent comment vous vous sentez. Ces insights émergent naturellement, comme des étoiles apparaissant au crépuscule.',
    'landing.patternsText2': 'Pas de pression pour tout capturer. Pas de séries à maintenir. Venez juste quand ça vous semble juste.',
    'landing.about1Title': 'Pause et réflexion',
    'landing.about1Desc': 'Prenez un moment pour vous. Choisissez comment vous vous sentez et ajoutez une note rapide.',
    'landing.about2Title': 'Regardez-le prendre vie',
    'landing.about2Desc': 'Vos émotions se mélangent en un bel orbe en constante évolution. Chaque couleur raconte votre histoire.',
    'landing.about3Title': 'Totalement privé',
    'landing.about3Desc': 'Pas de compte. Pas de cloud. Toutes les données restent sur votre appareil. Juste vous et vos moments.',
    'landing.screenshotsTitle': 'Voyez-le en action',
    'landing.screenshotsSubtitle': 'Explorez l\'app à travers de belles captures d\'écran',
    'landing.featuresTitle': 'Conçu avec soin',
    'landing.feature1Title': 'Orbe vivant',
    'landing.feature1Desc': 'Un orbe qui respire et reflète vos couleurs émotionnelles tout au long de la journée.',
    'landing.feature2Title': 'Thèmes clair et sombre',
    'landing.feature2Desc': 'De beaux thèmes qui semblent naturels dans toutes les conditions d\'éclairage.',
    'landing.feature3Title': 'Rappels doux',
    'landing.feature3Desc': 'Notifications optionnelles quand vous les voulez.',
    'landing.feature4Title': 'Votre historique',
    'landing.feature4Desc': 'Vos 30 derniers jours, toujours là pour y revenir.',
    'landing.feature5Title': 'Plusieurs langues',
    'landing.feature5Desc': 'Disponible en 8 langues pour un public mondial.',
    'landing.feature6Title': 'Privé par conception',
    'landing.feature6Desc': 'Tout reste sur votre appareil. Pas de comptes, pas de cloud.',
    'landing.privacyTitle': 'Privé par conception',
    'landing.privacyText': 'Votre monde émotionnel reste le vôtre. Tout vit sur votre appareil. Pas de comptes, pas de cloud, pas de données quittant votre téléphone. C\'est votre espace seul.',
    'landing.closingText': 'RECAPZ est pour quiconque veut se comprendre un peu mieux - pas par l\'analyse, mais par l\'observation douce.',
    'landing.closingTagline': 'Un moment à la fois.',
    'landing.faqTitle': 'Questions Fréquentes',
    'landing.faq1Q': 'Mes données sont-elles privées ?',
    'landing.faq1A': 'Oui, complètement. Toutes vos données restent sur votre appareil. Nous n\'avons pas de serveurs, de comptes ou de moyen d\'accéder à vos informations. Votre voyage émotionnel est le vôtre seul.',
    'landing.faq2Q': 'Comment fonctionne le système de couleurs ?',
    'landing.faq2A': 'Chaque état émotionnel a sa propre couleur. Quand vous faites un check-in, vos sentiments se mélangent dans l\'orbe, créant une représentation visuelle unique de votre journée. Avec le temps, vous commencerez à reconnaître vos motifs.',
    'landing.faq3Q': 'Dois-je faire un check-in plusieurs fois par jour ?',
    'landing.faq3A': 'Pas du tout. Faites un check-in quand ça vous semble juste - une fois par jour, plusieurs fois, ou quand vous voulez faire une pause et remarquer. Pas de séries ni de pression.',
    'landing.faq4Q': 'Que se passe-t-il avec mes données si je supprime l\'app ?',
    'landing.faq4A': 'Comme toutes les données sont stockées localement sur votre appareil, supprimer l\'app supprimera définitivement tous vos check-ins. Nous n\'avons pas de sauvegardes car nous n\'avons jamais eu accès à vos données.',
    'landing.faq5Q': 'RECAPZ remplace-t-il la thérapie ?',
    'landing.faq5A': 'Non. RECAPZ est un outil d\'auto-réflexion, pas un dispositif médical ni un traitement de santé mentale. Si vous avez du mal, veuillez consulter un professionnel de santé mentale.',
    'landing.contactTitle': 'Contactez-nous',
    'landing.contactText': 'Vous avez des questions ou des commentaires ? Nous serions ravis d\'avoir de vos nouvelles.',
    'landing.ctaText': 'Commencez à remarquer vos moments aujourd\'hui.',
    'landing.copyright': '© 2026 Sponom Dev. Tous droits réservés.',
    'header.otherProducts': 'Autres Produits',
  },

  // German
  de: {
    'meta.title': 'RECAPZ - Tägliche Reflexion',
    'meta.description': 'Ein ruhiger Ort für deine Tage',
    'footer.privacy': 'Datenschutz',
    'footer.terms': 'Nutzungsbedingungen',
    'settings.language': 'Sprache',
    'landing.appStore': 'Im App Store laden',
    'landing.heroTitle': 'Bemerke, wie du dich fühlst',
    'landing.heroSubtitle': 'Eine sanfte Art zu bemerken, wie du dich den ganzen Tag über fühlst. Erfasse Momente, beobachte wie deine emotionalen Farben ineinander fließen und entdecke, was dich aufheitert.',
    'landing.description': 'RECAPZ ist ein stiller Begleiter für deine innere Welt — ein Raum zum Innehalten, um zu bemerken wie du dich fühlst und zuzusehen wie sich deine emotionalen Farben entfalten.',
    'landing.breatheTitle': 'Ein Moment zum Atmen',
    'landing.breatheText1': 'Das Leben ist schnell. RECAPZ lädt dich ein, langsamer zu werden, nur für einen Atemzug. Beim Check-in bemerkst du einfach: Wie fühle ich mich gerade? Wo bin ich? Mit wem bin ich zusammen?',
    'landing.breatheText2': 'Jeder Moment, den du erfasst, fügt eine neue Farbe zu deinem Tag hinzu - sanfte Grüntöne für Dankbarkeit, warme Orangetöne für Unsicherheit, kühle Violetttöne für Fokus. Kein Urteilen, keine Bewertungen. Nur Bewusstsein.',
    'landing.visualizedTitle': 'Dein Tag, visualisiert',
    'landing.visualizedText1': 'Im Herzen von RECAPZ befindet sich eine leuchtende Kugel, die deinen Tag enthält. Während du Momente hinzufügst, beobachte wie deine Farben sich vermischen und gemeinsam verändern und etwas einzigartig Eigenes erschaffen. Es ist ein sanfter Spiegel, der deine emotionale Landschaft widerspiegelt.',
    'landing.visualizedText2': 'Tippe auf deinen Tag, um jeden Moment wie bunte Steine verstreut zu sehen - jeder ein kleines Stück deiner Geschichte.',
    'landing.patternsTitle': 'Muster, die sich zeigen',
    'landing.patternsText1': 'Mit der Zeit bemerkt RECAPZ still, was du selbst vielleicht nicht siehst. Vielleicht bringen dir Morgenstunden mehr Energie. Vielleicht verändern bestimmte Orte oder Menschen dein Gefühl. Diese Erkenntnisse entstehen natürlich, wie Sterne in der Dämmerung.',
    'landing.patternsText2': 'Kein Druck, alles zu erfassen. Keine Serien zu pflegen. Komm einfach, wenn es sich richtig anfühlt.',
    'landing.about1Title': 'Innehalten & Reflektieren',
    'landing.about1Desc': 'Nimm dir einen Moment für dich. Wähle wie du dich fühlst und füge eine kurze Notiz hinzu.',
    'landing.about2Title': 'Sieh zu, wie es lebendig wird',
    'landing.about2Desc': 'Deine Emotionen verschmelzen zu einer wunderschönen, sich ständig verändernden Kugel. Jede Farbe erzählt deine Geschichte.',
    'landing.about3Title': 'Vollständig privat',
    'landing.about3Desc': 'Kein Konto. Keine Cloud. Alle Daten bleiben auf deinem Gerät. Nur du und deine Momente.',
    'landing.screenshotsTitle': 'Erlebe es in Aktion',
    'landing.screenshotsSubtitle': 'Erkunde die App durch wunderschöne Screenshots',
    'landing.featuresTitle': 'Durchdacht gestaltet',
    'landing.feature1Title': 'Lebende Kugel',
    'landing.feature1Desc': 'Eine atmende Kugel, die deine emotionalen Farben den ganzen Tag über widerspiegelt.',
    'landing.feature2Title': 'Helle & dunkle Themes',
    'landing.feature2Desc': 'Schöne Themes, die sich bei jeder Beleuchtung natürlich anfühlen.',
    'landing.feature3Title': 'Sanfte Erinnerungen',
    'landing.feature3Desc': 'Optionale Benachrichtigungen, wenn du sie möchtest.',
    'landing.feature4Title': 'Deine Geschichte',
    'landing.feature4Desc': 'Deine letzten 30 Tage, immer da zum Wiederbesuchen.',
    'landing.feature5Title': 'Mehrere Sprachen',
    'landing.feature5Desc': 'Verfügbar in 8 Sprachen für ein globales Publikum.',
    'landing.feature6Title': 'Privat durch Design',
    'landing.feature6Desc': 'Alles bleibt auf deinem Gerät. Keine Konten, keine Cloud.',
    'landing.privacyTitle': 'Privat durch Design',
    'landing.privacyText': 'Deine emotionale Welt bleibt deine. Alles lebt auf deinem Gerät. Keine Konten, keine Cloud, keine Daten verlassen dein Telefon. Dies ist nur dein Raum.',
    'landing.closingText': 'RECAPZ ist für jeden, der sich selbst ein bisschen besser verstehen möchte - nicht durch Analyse, sondern durch sanftes Bemerken.',
    'landing.closingTagline': 'Ein Moment nach dem anderen.',
    'landing.faqTitle': 'Häufig gestellte Fragen',
    'landing.faq1Q': 'Sind meine Daten privat?',
    'landing.faq1A': 'Ja, vollständig. Alle deine Daten bleiben auf deinem Gerät. Wir haben keine Server, Konten oder Möglichkeit, auf deine Informationen zuzugreifen. Deine emotionale Reise gehört dir allein.',
    'landing.faq2Q': 'Wie funktioniert das Farbsystem?',
    'landing.faq2A': 'Jeder emotionale Zustand hat seine eigene Farbe. Beim Check-in vermischen sich deine Gefühle in der Kugel und erschaffen eine einzigartige visuelle Darstellung deines Tages. Mit der Zeit wirst du deine Muster erkennen.',
    'landing.faq3Q': 'Muss ich mehrmals am Tag einchecken?',
    'landing.faq3A': 'Überhaupt nicht. Checke ein, wenn es sich richtig anfühlt - einmal am Tag, mehrmals oder wann immer du innehalten und bemerken möchtest. Keine Serien oder Druck.',
    'landing.faq4Q': 'Was passiert mit meinen Daten, wenn ich die App lösche?',
    'landing.faq4A': 'Da alle Daten lokal auf deinem Gerät gespeichert sind, werden beim Löschen der App alle deine Check-ins dauerhaft gelöscht. Wir haben keine Backups, da wir nie Zugang zu deinen Daten hatten.',
    'landing.faq5Q': 'Ersetzt RECAPZ eine Therapie?',
    'landing.faq5A': 'Nein. RECAPZ ist ein Selbstreflexions-Tool, kein medizinisches Gerät oder eine Behandlung für psychische Gesundheit. Wenn du Schwierigkeiten hast, wende dich bitte an einen Fachmann für psychische Gesundheit.',
    'landing.contactTitle': 'Kontaktiere uns',
    'landing.contactText': 'Hast du Fragen oder Feedback? Wir würden gerne von dir hören.',
    'landing.ctaText': 'Beginne heute damit, deine Momente zu bemerken.',
    'landing.copyright': '© 2026 Sponom Dev. Alle Rechte vorbehalten.',
    'header.otherProducts': 'Andere Produkte',
  },

  // Chinese
  zh: {
    'meta.title': 'RECAPZ - 每日反思',
    'meta.description': '你的日子的安静之地',
    'footer.privacy': '隐私',
    'footer.terms': '条款',
    'settings.language': '语言',
    'landing.appStore': '在 App Store 下载',
    'landing.heroTitle': '觉察你的感受',
    'landing.heroSubtitle': '一种温和的方式来觉察你一天中的感受。捕捉时刻，看着你的情绪色彩融合在一起，发现什么能让你振奋。',
    'landing.description': 'RECAPZ 是你内心世界的安静伴侣——一个让你暂停、觉察感受、观看情绪色彩展开的空间。',
    'landing.breatheTitle': '呼吸的片刻',
    'landing.breatheText1': '生活节奏很快。RECAPZ 邀请你放慢脚步，哪怕只是一次呼吸。当你记录时，你只是觉察：我现在感觉如何？我在哪里？我和谁在一起？',
    'landing.breatheText2': '你捕捉的每一个时刻都为你的一天添加一种新颜色——感恩的柔和绿色、不确定的温暖橙色、专注的清凉紫色。没有评判，没有分数。只有觉察。',
    'landing.visualizedTitle': '你的一天，可视化',
    'landing.visualizedText1': 'RECAPZ 的核心是一个发光的球体，承载着你的一天。当你添加时刻时，看着你的颜色融合和变化，创造出独属于你的东西。它是一面温柔的镜子，反映你的情绪景观。',
    'landing.visualizedText2': '点击你的一天，看到每个时刻像彩色石子一样散落——每一个都是你故事的一小块。',
    'landing.patternsTitle': '自然显现的模式',
    'landing.patternsText1': '随着时间推移，RECAPZ 会悄悄注意到你可能看不到的东西。也许早晨给你更多能量。也许某些地方或人会改变你的感受。这些洞察自然出现，就像黄昏时出现的星星。',
    'landing.patternsText2': '没有压力要记录一切。没有需要保持的连续天数。只在感觉对的时候来。',
    'landing.about1Title': '暂停与反思',
    'landing.about1Desc': '花一点时间关注自己。选择你的感受并添加一条简短的笔记。',
    'landing.about2Title': '看它活过来',
    'landing.about2Desc': '你的情绪融合成一个美丽的、不断变化的球体。每种颜色都讲述你故事的一部分。',
    'landing.about3Title': '完全私密',
    'landing.about3Desc': '无需账户。无需云端。所有数据都保留在你的设备上。只有你和你的时刻。',
    'landing.screenshotsTitle': '看看实际效果',
    'landing.screenshotsSubtitle': '通过精美截图探索应用',
    'landing.featuresTitle': '精心设计',
    'landing.feature1Title': '活动球体',
    'landing.feature1Desc': '一个会呼吸的球体，全天反映你的情绪色彩。',
    'landing.feature2Title': '浅色和深色主题',
    'landing.feature2Desc': '在任何光线下都感觉自然的美丽主题。',
    'landing.feature3Title': '温和提醒',
    'landing.feature3Desc': '当你需要时的可选通知。',
    'landing.feature4Title': '你的历史',
    'landing.feature4Desc': '你最近30天的记录，随时可以回顾。',
    'landing.feature5Title': '多种语言',
    'landing.feature5Desc': '支持8种语言，服务全球用户。',
    'landing.feature6Title': '隐私设计',
    'landing.feature6Desc': '一切都在你的设备上。没有账户，没有云端。',
    'landing.privacyTitle': '隐私设计',
    'landing.privacyText': '你的情绪世界属于你。一切都在你的设备上。没有账户，没有云端，没有数据离开你的手机。这是只属于你的空间。',
    'landing.closingText': 'RECAPZ 适合任何想要更好地了解自己的人——不是通过分析，而是通过温和的觉察。',
    'landing.closingTagline': '一次一个时刻。',
    'landing.faqTitle': '常见问题',
    'landing.faq1Q': '我的数据是私密的吗？',
    'landing.faq1A': '是的，完全私密。你所有的数据都在你的设备上。我们没有服务器、账户或任何方式访问你的信息。你的情绪旅程只属于你。',
    'landing.faq2Q': '颜色系统是如何工作的？',
    'landing.faq2A': '每种情绪状态都有自己的颜色。当你记录时，你的感受在球体中混合，创造出你一天的独特视觉表现。随着时间推移，你会开始认出你的模式。',
    'landing.faq3Q': '我需要一天多次记录吗？',
    'landing.faq3A': '完全不需要。在感觉对的时候记录——一天一次、多次，或者每当你想暂停和觉察时。没有连续天数或压力。',
    'landing.faq4Q': '如果我删除应用，我的数据会怎样？',
    'landing.faq4A': '由于所有数据都本地存储在你的设备上，删除应用将永久删除你所有的记录。我们没有备份，因为我们从未访问过你的数据。',
    'landing.faq5Q': 'RECAPZ 能替代治疗吗？',
    'landing.faq5A': '不能。RECAPZ 是一个自我反思工具，不是医疗设备或心理健康治疗。如果你正在挣扎，请寻求心理健康专业人士的帮助。',
    'landing.contactTitle': '联系我们',
    'landing.contactText': '有问题或反馈？我们很想听到你的声音。',
    'landing.ctaText': '今天开始觉察你的时刻。',
    'landing.copyright': '© 2026 Sponom Dev. 保留所有权利。',
    'header.otherProducts': '其他产品',
  },

  // Japanese
  ja: {
    'meta.title': 'RECAPZ - 毎日の振り返り',
    'meta.description': 'あなたの日々のための静かな場所',
    'footer.privacy': 'プライバシー',
    'footer.terms': '利用規約',
    'settings.language': '言語',
    'landing.appStore': 'App Storeでダウンロード',
    'landing.heroTitle': '自分の気持ちに気づく',
    'landing.heroSubtitle': '一日を通して自分の気持ちに気づくための優しい方法。瞬間を捉え、感情の色が混ざり合うのを見て、何があなたを高めるかを発見しましょう。',
    'landing.description': 'RECAPZはあなたの内なる世界の静かな伴侶です。立ち止まり、自分の気持ちに気づき、感情の色が広がるのを見守る空間。',
    'landing.breatheTitle': '呼吸する瞬間',
    'landing.breatheText1': '人生は速く過ぎていきます。RECAPZは、ほんの一呼吸だけ、ゆっくりするよう誘います。チェックインするとき、ただ気づくだけです：今、どう感じている？どこにいる？誰といる？',
    'landing.breatheText2': '捉えた各瞬間があなたの一日に新しい色を加えます。感謝の柔らかな緑、不確かさの温かいオレンジ、集中の涼しい紫。判断なし、スコアなし。ただ気づきだけ。',
    'landing.visualizedTitle': 'あなたの一日を可視化',
    'landing.visualizedText1': 'RECAPZの中心には、あなたの一日を包み込む輝く球体があります。瞬間を追加すると、あなたの色が混ざり合い、変化し、あなただけのものを作り出します。それはあなたの感情の風景を映す優しい鏡です。',
    'landing.visualizedText2': '一日をタップすると、各瞬間がカラフルな石のように散らばっているのが見えます。それぞれがあなたの物語の小さな一片です。',
    'landing.patternsTitle': '自然に現れるパターン',
    'landing.patternsText1': '時間とともに、RECAPZはあなたが自分では見えないかもしれないことに静かに気づきます。朝の方がエネルギーがあるかもしれません。特定の場所や人があなたの気分を変えるかもしれません。これらの洞察は、夕暮れに星が現れるように自然に生まれます。',
    'landing.patternsText2': 'すべてを記録するプレッシャーはありません。維持するストリークもありません。気が向いたときにだけ来てください。',
    'landing.about1Title': '立ち止まって振り返る',
    'landing.about1Desc': '自分自身と向き合う時間を。気分を選んで、簡単なメモを追加しましょう。',
    'landing.about2Title': '生き生きと動き出す',
    'landing.about2Desc': 'あなたの感情が美しく変化し続ける球体に溶け込みます。それぞれの色があなたの物語を語ります。',
    'landing.about3Title': '完全にプライベート',
    'landing.about3Desc': 'アカウント不要。クラウド不要。すべてのデータはデバイスに保存。あなたとあなたの瞬間だけ。',
    'landing.screenshotsTitle': '実際に見てみましょう',
    'landing.screenshotsSubtitle': '美しいスクリーンショットでアプリを探索',
    'landing.featuresTitle': '思慮深くデザイン',
    'landing.feature1Title': '生きている球体',
    'landing.feature1Desc': '一日を通してあなたの感情の色を反映する呼吸する球体。',
    'landing.feature2Title': 'ライト＆ダークテーマ',
    'landing.feature2Desc': 'どんな照明でも自然に感じる美しいテーマ。',
    'landing.feature3Title': '優しいリマインダー',
    'landing.feature3Desc': '必要なときのオプションの通知。',
    'landing.feature4Title': 'あなたの履歴',
    'landing.feature4Desc': '過去30日間、いつでも振り返ることができます。',
    'landing.feature5Title': '複数の言語',
    'landing.feature5Desc': 'グローバルなユーザーのために8言語で利用可能。',
    'landing.feature6Title': 'プライバシー重視の設計',
    'landing.feature6Desc': 'すべてがあなたのデバイスに残ります。アカウントなし、クラウドなし。',
    'landing.privacyTitle': 'プライバシー重視の設計',
    'landing.privacyText': 'あなたの感情の世界はあなたのものです。すべてがあなたのデバイスに存在します。アカウントなし、クラウドなし、データが電話から出ることはありません。これはあなただけの空間です。',
    'landing.closingText': 'RECAPZは、自分自身をもう少しよく理解したいすべての人のためのものです。分析ではなく、優しい気づきを通して。',
    'landing.closingTagline': '一瞬一瞬を大切に。',
    'landing.faqTitle': 'よくある質問',
    'landing.faq1Q': '私のデータはプライベートですか？',
    'landing.faq1A': 'はい、完全にプライベートです。すべてのデータはあなたのデバイスに残ります。サーバー、アカウント、あなたの情報にアクセスする方法はありません。あなたの感情の旅はあなただけのものです。',
    'landing.faq2Q': 'カラーシステムはどのように機能しますか？',
    'landing.faq2A': '各感情状態には独自の色があります。チェックインすると、あなたの感情が球体の中で混ざり合い、一日のユニークな視覚的表現を作り出します。時間が経つにつれて、自分のパターンを認識し始めるでしょう。',
    'landing.faq3Q': '一日に何度もチェックインする必要がありますか？',
    'landing.faq3A': 'まったくありません。気が向いたときにチェックインしてください。一日一回、数回、または立ち止まって気づきたいときいつでも。ストリークやプレッシャーはありません。',
    'landing.faq4Q': 'アプリを削除したら、データはどうなりますか？',
    'landing.faq4A': 'すべてのデータはデバイスにローカルに保存されているため、アプリを削除するとすべてのチェックインが永久に削除されます。私たちはあなたのデータにアクセスしたことがないため、バックアップはありません。',
    'landing.faq5Q': 'RECAPZはセラピーの代わりになりますか？',
    'landing.faq5A': 'いいえ。RECAPZは自己省察ツールであり、医療機器やメンタルヘルス治療ではありません。困っている場合は、メンタルヘルスの専門家に相談してください。',
    'landing.contactTitle': 'お問い合わせ',
    'landing.contactText': 'ご質問やフィードバックがありますか？ぜひお聞かせください。',
    'landing.ctaText': '今日から自分の瞬間に気づき始めましょう。',
    'landing.copyright': '© 2026 Sponom Dev. All rights reserved.',
    'header.otherProducts': '他の製品',
  },

  // Korean
  ko: {
    'meta.title': 'RECAPZ - 일일 성찰',
    'meta.description': '당신의 하루를 위한 고요한 공간',
    'footer.privacy': '개인정보',
    'footer.terms': '이용약관',
    'settings.language': '언어',
    'landing.appStore': 'App Store에서 다운로드',
    'landing.heroTitle': '당신의 감정을 알아차리세요',
    'landing.heroSubtitle': '하루 종일 자신의 감정을 부드럽게 알아차리는 방법. 순간을 포착하고, 감정의 색이 섞이는 것을 보고, 무엇이 당신을 고양시키는지 발견하세요.',
    'landing.description': 'RECAPZ는 당신의 내면 세계를 위한 조용한 동반자입니다. 멈추고, 자신의 감정을 알아차리고, 감정의 색이 펼쳐지는 것을 지켜보는 공간.',
    'landing.breatheTitle': '숨 쉴 수 있는 순간',
    'landing.breatheText1': '삶은 빠르게 지나갑니다. RECAPZ는 한 번의 호흡만이라도 천천히 하도록 초대합니다. 체크인할 때, 단순히 알아차립니다: 지금 기분이 어떻지? 어디에 있지? 누구와 함께 있지?',
    'landing.breatheText2': '포착한 각 순간은 당신의 하루에 새로운 색을 더합니다. 감사함의 부드러운 초록색, 불확실함의 따뜻한 주황색, 집중의 시원한 보라색. 판단 없이, 점수 없이. 오직 인식만.',
    'landing.visualizedTitle': '당신의 하루, 시각화',
    'landing.visualizedText1': 'RECAPZ의 중심에는 당신의 하루를 담고 있는 빛나는 구체가 있습니다. 순간을 추가하면서 색이 섞이고 변하는 것을 지켜보세요. 오직 당신만의 것을 만들어냅니다. 당신의 감정 풍경을 반영하는 부드러운 거울입니다.',
    'landing.visualizedText2': '하루를 탭하면 각 순간이 다채로운 돌처럼 흩어져 있는 것을 볼 수 있습니다. 각각이 당신 이야기의 작은 조각입니다.',
    'landing.patternsTitle': '스스로 드러나는 패턴',
    'landing.patternsText1': '시간이 지나면서 RECAPZ는 당신이 스스로 보지 못할 수도 있는 것을 조용히 알아차립니다. 아침에 더 에너지가 있을 수도 있습니다. 특정 장소나 사람이 당신의 기분을 바꿀 수도 있습니다. 이러한 통찰은 황혼에 별이 나타나듯 자연스럽게 나타납니다.',
    'landing.patternsText2': '모든 것을 포착해야 한다는 압박은 없습니다. 유지해야 할 연속 기록도 없습니다. 느낌이 맞을 때만 오세요.',
    'landing.about1Title': '멈추고 되돌아보기',
    'landing.about1Desc': '잠시 자신에게 집중하세요. 기분을 선택하고 간단한 메모를 추가하세요.',
    'landing.about2Title': '살아 움직이는 것을 보세요',
    'landing.about2Desc': '당신의 감정이 아름답고 끊임없이 변하는 구체로 섞입니다. 각 색상이 당신의 이야기를 들려줍니다.',
    'landing.about3Title': '완전히 비공개',
    'landing.about3Desc': '계정 없음. 클라우드 없음. 모든 데이터는 기기에 보관됩니다. 오직 당신과 당신의 순간만.',
    'landing.screenshotsTitle': '직접 확인하세요',
    'landing.screenshotsSubtitle': '아름다운 스크린샷으로 앱 탐색하기',
    'landing.featuresTitle': '세심하게 디자인됨',
    'landing.feature1Title': '살아있는 구체',
    'landing.feature1Desc': '하루 종일 당신의 감정 색을 반영하는 숨 쉬는 구체.',
    'landing.feature2Title': '라이트 & 다크 테마',
    'landing.feature2Desc': '어떤 조명에서도 자연스럽게 느껴지는 아름다운 테마.',
    'landing.feature3Title': '부드러운 알림',
    'landing.feature3Desc': '원할 때 받는 선택적 알림.',
    'landing.feature4Title': '당신의 기록',
    'landing.feature4Desc': '최근 30일, 언제든 돌아볼 수 있습니다.',
    'landing.feature5Title': '다국어 지원',
    'landing.feature5Desc': '전 세계 사용자를 위해 8개 언어로 제공.',
    'landing.feature6Title': '개인정보 보호 설계',
    'landing.feature6Desc': '모든 것이 당신의 기기에 남습니다. 계정 없음, 클라우드 없음.',
    'landing.privacyTitle': '개인정보 보호 설계',
    'landing.privacyText': '당신의 감정 세계는 당신의 것입니다. 모든 것이 당신의 기기에 있습니다. 계정 없음, 클라우드 없음, 전화에서 나가는 데이터 없음. 이것은 오직 당신만의 공간입니다.',
    'landing.closingText': 'RECAPZ는 자신을 조금 더 이해하고 싶은 모든 사람을 위한 것입니다. 분석이 아닌 부드러운 알아차림을 통해.',
    'landing.closingTagline': '한 순간씩.',
    'landing.faqTitle': '자주 묻는 질문',
    'landing.faq1Q': '제 데이터는 비공개인가요?',
    'landing.faq1A': '네, 완전히 비공개입니다. 모든 데이터는 당신의 기기에 남습니다. 서버, 계정, 정보에 접근할 방법이 없습니다. 당신의 감정 여정은 오직 당신의 것입니다.',
    'landing.faq2Q': '색상 시스템은 어떻게 작동하나요?',
    'landing.faq2A': '각 감정 상태에는 고유한 색이 있습니다. 체크인하면 감정이 구체 안에서 섞여 하루의 독특한 시각적 표현을 만들어냅니다. 시간이 지나면서 자신의 패턴을 인식하기 시작할 것입니다.',
    'landing.faq3Q': '하루에 여러 번 체크인해야 하나요?',
    'landing.faq3A': '전혀 그렇지 않습니다. 느낌이 맞을 때 체크인하세요. 하루에 한 번, 여러 번, 또는 멈추고 알아차리고 싶을 때 언제든지. 연속 기록이나 압박은 없습니다.',
    'landing.faq4Q': '앱을 삭제하면 데이터는 어떻게 되나요?',
    'landing.faq4A': '모든 데이터가 기기에 로컬로 저장되어 있으므로 앱을 삭제하면 모든 체크인이 영구적으로 삭제됩니다. 우리는 당신의 데이터에 접근한 적이 없으므로 백업이 없습니다.',
    'landing.faq5Q': 'RECAPZ가 치료를 대체할 수 있나요?',
    'landing.faq5A': '아니요. RECAPZ는 자기 성찰 도구이지 의료 기기나 정신 건강 치료가 아닙니다. 힘들다면 정신 건강 전문가에게 연락해 주세요.',
    'landing.contactTitle': '문의하기',
    'landing.contactText': '질문이나 피드백이 있으신가요? 연락 주세요.',
    'landing.ctaText': '오늘부터 당신의 순간을 알아차리기 시작하세요.',
    'landing.copyright': '© 2026 Sponom Dev. All rights reserved.',
    'header.otherProducts': '다른 제품',
  },
} as const;
