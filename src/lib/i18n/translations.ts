export type Language = 'en' | 'ru';

export const LANGUAGES: { value: Language; label: string; flag: string }[] = [
  { value: 'en', label: 'English', flag: '🇺🇸' },
  { value: 'ru', label: 'Русский', flag: '🇷🇺' },
];

export type TranslationKey = keyof typeof translations.en;

export const translations = {
  en: {
    // Onboarding
    'onboarding.title': 'A quiet place for your days',
    'onboarding.description':
      'Each day leaves a trace. Capture what stood out, and watch your story unfold over time.',
    'onboarding.button': 'Begin today',

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
    'settings.account': 'Account',
    'settings.appearance': 'Appearance',
    'settings.data': 'Data',
    'settings.language': 'Language',
    'settings.syncing': 'Syncing',
    'settings.signedOut': 'Signed out',
    'settings.signInPrompt': 'Sign in to sync across devices',
    'settings.signIn': 'Sign in',
    'settings.signUp': 'Sign up',
    'settings.changePassword': 'Change password',
    'settings.deleteAccount': 'Delete account',
    'settings.deleteAccountConfirm': 'Delete your account and all data?',
    'settings.cancel': 'Cancel',
    'settings.yesDelete': 'Yes, delete',
    'settings.deleting': 'Deleting...',
    'settings.newPassword': 'New password',
    'settings.confirmPassword': 'Confirm new password',
    'settings.save': 'Save',
    'settings.saving': 'Saving...',
    'settings.passwordMismatch': 'Passwords do not match',
    'settings.passwordTooShort': 'Password must be at least 6 characters',
    'settings.passwordUpdated': 'Password updated',
    'settings.daysCaptured':
      '{count} {count, plural, one {day} other {days}} captured',
    'settings.clearData': 'Clear all data',
    'settings.clearDataConfirm':
      'This will permanently delete {count} {count, plural, one {day} other {days}}.',
    'settings.keepData': 'Keep My Data',
    'settings.deleteAll': 'Delete All',

    // Auth
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.confirmPassword': 'Confirm password',
    'auth.signIn': 'Sign in',
    'auth.signUp': 'Create account',
    'auth.signingIn': 'Signing in...',
    'auth.creatingAccount': 'Creating account...',
    'auth.forgotPassword': 'Forgot password?',
    'auth.noAccount': "Don't have an account?",
    'auth.haveAccount': 'Already have an account?',
    'auth.signUpLink': 'Sign up',
    'auth.signInLink': 'Sign in',
    'auth.welcomeBack': 'Welcome back',
    'auth.createAccount': 'Create an account',
    'auth.forgotPasswordTitle': 'Forgot password?',
    'auth.forgotPasswordDescription':
      "Enter your email and we'll send you a reset link.",
    'auth.sendResetLink': 'Send reset link',
    'auth.backToLogin': 'Back to login',
    'auth.rememberPassword': 'Remember your password?',
    'auth.checkEmail': 'Check your email',
    'auth.resetLinkSent': 'We sent a password reset link to',
    'auth.clickLinkToReset': 'Click the link to reset your password.',
    'auth.confirmationSent': 'We sent a confirmation link to',
    'auth.clickLinkToActivate': 'Click the link to activate your account.',
    'auth.invalidEmail': 'Please enter a valid email address',
    'auth.passwordMismatch': 'Passwords do not match',
    'auth.passwordTooShort': 'Password must be at least 6 characters',

    // Settings - appearance
    'settings.theme': 'Theme',
    'settings.selectTheme': 'Select theme',
    'settings.selectLanguage': 'Select language',

    // Footer
    'footer.privacy': 'Privacy',
    'footer.terms': 'Terms',

    // Privacy page
    'privacy.title': 'Privacy Policy',
    'privacy.yourData': 'Your Data',
    'privacy.yourDataText':
      'Recapz stores your journal entries locally on your device. If you create an account, your data syncs to our secure cloud servers to enable access across devices.',
    'privacy.whatWeCollect': 'What We Collect',
    'privacy.whatWeCollectText':
      "We collect only what you provide: your email (for accounts), journal entries, mood selections, and any photos you add. We don't track your behavior or sell your data.",
    'privacy.dataSecurity': 'Data Security',
    'privacy.dataSecurityText':
      'Your data is encrypted in transit and at rest. We use Supabase for secure cloud storage with industry-standard security practices.',
    'privacy.yourRights': 'Your Rights',
    'privacy.yourRightsText':
      'You can delete all your data at any time from the app settings. Deleting your account removes all data from our servers permanently.',
    'privacy.contact': 'Contact',
    'privacy.contactText': 'Questions? Reach out at',

    // Terms page
    'terms.title': 'Terms of Service',
    'terms.using': 'Using Recapz',
    'terms.usingText':
      'Recapz is a personal journaling app. By using it, you agree to use it responsibly and not for any illegal purposes.',
    'terms.yourContent': 'Your Content',
    'terms.yourContentText':
      "You own everything you create in Recapz. We don't claim any rights to your journal entries, photos, or other content. You're responsible for what you write.",
    'terms.account': 'Account',
    'terms.accountText':
      "Keep your login credentials secure. You're responsible for activity on your account. We may suspend accounts that violate these terms.",
    'terms.service': 'Service',
    'terms.serviceText':
      "We provide Recapz as-is. While we strive for reliability, we can't guarantee uninterrupted service. We may update or modify the app at any time.",
    'terms.contact': 'Contact',
    'terms.contactText': 'Questions? Reach out at',

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

    // Sync notifications
    'sync.synced': 'Synced {count} {count, plural, one {recap} other {recaps}}',
    'sync.syncedStatus': 'Synced',
    'sync.localStatus': 'Local',
    'sync.failed': 'Sync failed',
    'sync.loadFailed': 'Failed to load recaps',
    'sync.uploadFailed': 'Failed to upload',
    'sync.limitReached': 'Limit reached. Remove an older day first.',

    // Toasts
    'toast.allDataCleared': 'All data cleared',
    'toast.failedToClearData': 'Failed to clear data',
    'toast.failedToDeleteCloudData': 'Failed to delete cloud data',
    'toast.accountDeleted': 'Account deleted',
    'toast.failedToDeleteAccount': 'Failed to delete account',
    'toast.noDataToExport': 'No data to export',
  },

  ru: {
    // Onboarding
    'onboarding.title': 'Место для твоих дней',
    'onboarding.description':
      'Каждый день оставляет след. Записывай главное — и наблюдай, как складывается твоя история.',
    'onboarding.button': 'Начать',

    // Mood select view
    'mood.title': 'Как прошёл день?',
    'mood.firstRecapHint': 'Начни с настроения.',
    'mood.backToToday': 'К сегодня',
    'mood.daysRemembered':
      '{count} {count, plural, one {запись} few {записи} other {записей}}',

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
    'settings.account': 'Аккаунт',
    'settings.appearance': 'Оформление',
    'settings.data': 'Данные',
    'settings.language': 'Язык',
    'settings.syncing': 'Синхронизация',
    'settings.signedOut': 'Выход выполнен',
    'settings.signInPrompt': 'Войди, чтобы синхронизировать данные',
    'settings.signIn': 'Войти',
    'settings.signUp': 'Создать аккаунт',
    'settings.changePassword': 'Сменить пароль',
    'settings.deleteAccount': 'Удалить аккаунт',
    'settings.deleteAccountConfirm': 'Удалить аккаунт и все данные?',
    'settings.cancel': 'Отмена',
    'settings.yesDelete': 'Да, удалить',
    'settings.deleting': 'Удаляю...',
    'settings.newPassword': 'Новый пароль',
    'settings.confirmPassword': 'Повтори пароль',
    'settings.save': 'Сохранить',
    'settings.saving': 'Сохраняю...',
    'settings.passwordMismatch': 'Пароли не совпадают',
    'settings.passwordTooShort': 'Минимум 6 символов',
    'settings.passwordUpdated': 'Пароль изменён',
    'settings.daysCaptured':
      '{count} {count, plural, one {запись} few {записи} other {записей}}',
    'settings.clearData': 'Удалить все данные',
    'settings.clearDataConfirm':
      '{count, plural, one {Будет удалена {count} запись} few {Будут удалены {count} записи} other {Будет удалено {count} записей}}. Навсегда.',
    'settings.keepData': 'Оставить',
    'settings.deleteAll': 'Удалить всё',

    // Auth
    'auth.email': 'Email',
    'auth.password': 'Пароль',
    'auth.confirmPassword': 'Подтверди пароль',
    'auth.signIn': 'Войти',
    'auth.signUp': 'Создать аккаунт',
    'auth.signingIn': 'Вхожу...',
    'auth.creatingAccount': 'Создаю...',
    'auth.forgotPassword': 'Не помнишь пароль?',
    'auth.noAccount': 'Нет аккаунта?',
    'auth.haveAccount': 'Уже есть аккаунт?',
    'auth.signUpLink': 'Создать',
    'auth.signInLink': 'Войти',
    'auth.welcomeBack': 'С возвращением',
    'auth.createAccount': 'Создать аккаунт',
    'auth.forgotPasswordTitle': 'Восстановление пароля',
    'auth.forgotPasswordDescription':
      'Укажи email — отправим ссылку для сброса.',
    'auth.sendResetLink': 'Отправить',
    'auth.backToLogin': 'Назад',
    'auth.rememberPassword': 'Помнишь пароль?',
    'auth.checkEmail': 'Проверь почту',
    'auth.resetLinkSent': 'Ссылка для сброса отправлена на',
    'auth.clickLinkToReset': 'Перейди по ней, чтобы задать новый пароль.',
    'auth.confirmationSent': 'Ссылка для подтверждения отправлена на',
    'auth.clickLinkToActivate': 'Перейди по ней, чтобы активировать аккаунт.',
    'auth.invalidEmail': 'Некорректный email',
    'auth.passwordMismatch': 'Пароли не совпадают',
    'auth.passwordTooShort': 'Минимум 6 символов',

    // Settings - appearance
    'settings.theme': 'Тема',
    'settings.selectTheme': 'Выбери тему',
    'settings.selectLanguage': 'Выбери язык',

    // Footer
    'footer.privacy': 'Приватность',
    'footer.terms': 'Условия',

    // Privacy page
    'privacy.title': 'Конфиденциальность',
    'privacy.yourData': 'Твои данные',
    'privacy.yourDataText':
      'Recapz хранит записи на твоём устройстве. Если создашь аккаунт — они синхронизируются с нашими серверами для доступа с других устройств.',
    'privacy.whatWeCollect': 'Что мы собираем',
    'privacy.whatWeCollectText':
      'Только то, что ты сам добавляешь: email, записи, настроение и фото. Мы не следим за тобой и не продаём данные.',
    'privacy.dataSecurity': 'Безопасность',
    'privacy.dataSecurityText':
      'Данные шифруются при передаче и хранении. Мы используем Supabase — надёжное облачное хранилище.',
    'privacy.yourRights': 'Твои права',
    'privacy.yourRightsText':
      'Ты можешь удалить все данные в любой момент через настройки. При удалении аккаунта всё стирается с серверов навсегда.',
    'privacy.contact': 'Связь',
    'privacy.contactText': 'Вопросы? Пиши на',

    // Terms page
    'terms.title': 'Условия',
    'terms.using': 'Использование',
    'terms.usingText':
      'Recapz — приложение для личного дневника. Используя его, ты соглашаешься вести себя ответственно и не нарушать закон.',
    'terms.yourContent': 'Твой контент',
    'terms.yourContentText':
      'Всё, что ты создаёшь в Recapz, принадлежит тебе. Мы не претендуем на твои записи, фото или другой контент. Ты сам отвечаешь за то, что пишешь.',
    'terms.account': 'Аккаунт',
    'terms.accountText':
      'Береги свои данные для входа. Ты отвечаешь за всё, что происходит в твоём аккаунте. Мы можем заблокировать нарушителей.',
    'terms.service': 'Сервис',
    'terms.serviceText':
      'Recapz предоставляется «как есть». Мы стараемся работать стабильно, но не можем гарантировать бесперебойность. Приложение может обновляться.',
    'terms.contact': 'Связь',
    'terms.contactText': 'Вопросы? Пиши на',

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

    // Sync notifications
    'sync.synced': 'Синхронизировано: {count}',
    'sync.syncedStatus': 'Синхр.',
    'sync.localStatus': 'Локально',
    'sync.failed': 'Ошибка синхронизации',
    'sync.loadFailed': 'Не удалось загрузить',
    'sync.uploadFailed': 'Не удалось отправить',
    'sync.limitReached': 'Лимит. Сначала удали старую запись.',

    // Toasts
    'toast.allDataCleared': 'Данные удалены',
    'toast.failedToClearData': 'Не удалось удалить',
    'toast.failedToDeleteCloudData': 'Ошибка удаления',
    'toast.accountDeleted': 'Аккаунт удалён',
    'toast.failedToDeleteAccount': 'Не удалось удалить аккаунт',
    'toast.noDataToExport': 'Нечего экспортировать',
  },
} as const;
