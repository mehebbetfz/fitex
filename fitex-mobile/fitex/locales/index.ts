export type Language = 'ru' | 'en' | 'az'

export interface Translations {
  marketplace: {
    title: string
    trainers: string
    plans: string
    searchPlaceholder: string
    loading: string
    noTrainers: string
    noPlans: string
    becomeTrainer: string
    viewProfile: string
    from: string
    verified: string
    experience: string
    years: string
    students: string
    experience_label: string
    difficulty_beginner: string
    difficulty_intermediate: string
    difficulty_advanced: string
    type_workout: string
    type_nutrition: string
    type_combo: string
    duration: string
    weeks: string
    details: string
    myPlans: string
    noMyPlans: string
    filter_all: string
    filter_strength: string
    filter_cardio: string
    filter_nutrition: string
  }
  gymPass: {
    title: string
    myPass: string
    noMembership: string
    noMembershipSubtitle: string
    browseGyms: string
    validUntil: string
    visitsTotal: string
    daysLeft: string
    visitHistory: string
    noVisits: string
    accessCode: string
    scanHint: string
    plan_day: string
    plan_month: string
    plan_quarter: string
    plan_year: string
    plan_all_access: string
    gymsTitle: string
    open: string
    closed: string
    noGyms: string
    comingSoon: string
    buyMembership: string
    choosePlan: string
    allGyms: string
    membershipExpired: string
    day: string
  }
  rating: {
    title: string
    myRating: string
    ratingSubtitle: string
    totalScore: string
    progressTo: string
    pointsLeft: string
    maxLevel: string
    scoreBreakdown: string
    workoutPts: string
    setPts: string
    volumePts: string
    streakPts: string
    prPts: string
    durationBonus: string
    categories: string
    catVolume: string
    catWorkouts: string
    catStreak: string
    catSets: string
    catDuration: string
    catRecords: string
    achievements: string
    earned: string
    locked: string
    tierBeginner: string
    tierBronze: string
    tierSilver: string
    tierGold: string
    tierPlatinum: string
    tierElite: string
    ach_first_workout_title: string
    ach_first_workout_desc: string
    ach_workouts_5_title: string
    ach_workouts_5_desc: string
    ach_workouts_30_title: string
    ach_workouts_30_desc: string
    ach_workouts_100_title: string
    ach_workouts_100_desc: string
    ach_workouts_365_title: string
    ach_workouts_365_desc: string
    ach_streak_7_title: string
    ach_streak_7_desc: string
    ach_streak_30_title: string
    ach_streak_30_desc: string
    ach_streak_90_title: string
    ach_streak_90_desc: string
    ach_volume_1t_title: string
    ach_volume_1t_desc: string
    ach_volume_10t_title: string
    ach_volume_10t_desc: string
    ach_volume_100t_title: string
    ach_volume_100t_desc: string
    ach_sets_100_title: string
    ach_sets_100_desc: string
    ach_sets_1000_title: string
    ach_sets_1000_desc: string
    ach_sets_10000_title: string
    ach_sets_10000_desc: string
    ach_pr_first_title: string
    ach_pr_first_desc: string
    ach_pr_10_title: string
    ach_pr_10_desc: string
    ach_pr_50_title: string
    ach_pr_50_desc: string
    pts: string
    kg: string
    days: string
    min: string
    premiumGateTitle: string
    premiumGateSubtitle: string
    premiumGateBtn: string
  }
  common: {
    error: string
    cancel: string
    save: string
    skip: string
    loading: string
    noData: string
    ok: string
    yes: string
    no: string
    done: string
    history: string
    all: string
    records: string
  }
  languageSelect: {
    title: string
    subtitle: string
    continue: string
  }
  login: {
    subtitle: string
    signInGoogle: string
    terms: string
  }
  tabs: {
    progress: string
    body: string
    history: string
    profile: string
  }
  progress: {
    title: string
    subtitle: string
    analytics: string
    bodyMeasurements: string
    personalRecords: string
    noDataChart: string
    addMeasurementsFor: string
    allRecords: string
    noMeasurements: string
    noRecords: string
    noChartData: string
    weeklyReminder: string
    weeklyReminderSubtitle: string
    enterValue: string
    savedSuccess: string
    saveError: string
  }
  recovery: {
    title: string
    subtitle: string
    ready: string
    recovering: string
    rest: string
    muscleStatus: string
    frontMuscles: string
    backMuscles: string
    showAll: string
    lastTrained: string
    noData: string
    legendRecovered: string
    legendRecovering: string
    legendRest: string
  }
  history: {
    title: string
    filterByMuscle: string
    allMuscles: string
    exercises: string
    sets: string
    min: string
    kg: string
    noWorkouts: string
    startFirst: string
    noWorkoutsFilter: string
    workoutsLoading: string
  }
  profile: {
    title: string
    subtitle: string
    ratingEntry: string
    ratingEntrySubtitle: string
    marketplaceEntry: string
    marketplaceSubtitle: string
    gymPassEntry: string
    gymPassSubtitle: string
    premium: string
    basic: string
    premiumStatus: string
    premiumActive: string
    freePlan: string
    buyPremium: string
    cloud: string
    syncData: string
    syncSubtitle: string
    notifications: string
    reminder: string
    notifDisabled: string
    notifTimeLabel: string
    reminderSchedule: string
    export: string
    exportAll: string
    exportAllSubtitle: string
    exportWorkouts: string
    exportWorkoutsSubtitle: string
    language: string
    changeLanguage: string
    signOutSection: string
    signOut: string
    signOutSubtitle: string
    signOutConfirm: string
    signOutTitle: string
    syncError: string
    exportError: string
    notifError: string
    notifPermission: string
    permissionsTitle: string
    syncDone: string
    recordsLabel: string
  }
}

export const ru: Translations = {
  marketplace: {
    title: 'Маркетплейс',
    trainers: 'Тренеры',
    plans: 'Планы',
    searchPlaceholder: 'Поиск тренеров и планов...',
    loading: 'Загрузка...',
    noTrainers: 'Тренеров пока нет',
    noPlans: 'Планов пока нет',
    becomeTrainer: 'Стать тренером',
    viewProfile: 'Открыть',
    from: 'от',
    verified: 'Верифицирован',
    experience: 'лет опыта',
    years: 'лет',
    students: 'учеников',
    experience_label: 'Опыт',
    difficulty_beginner: 'Новичок',
    difficulty_intermediate: 'Средний',
    difficulty_advanced: 'Продвинутый',
    type_workout: 'Тренировки',
    type_nutrition: 'Питание',
    type_combo: 'Комбо',
    duration: 'Длительность',
    weeks: 'нед.',
    details: 'Подробнее',
    myPlans: 'Мои планы',
    noMyPlans: 'Купленных планов нет',
    filter_all: 'Все',
    filter_strength: 'Силовые',
    filter_cardio: 'Кардио',
    filter_nutrition: 'Питание',
  },
  gymPass: {
    title: 'FitEx Pass',
    myPass: 'Мой пропуск',
    noMembership: 'Нет активного абонемента',
    noMembershipSubtitle: 'Купите абонемент для доступа в партнёрские залы',
    browseGyms: 'Найти залы',
    validUntil: 'Действителен до',
    visitsTotal: 'Всего визитов',
    daysLeft: 'дней осталось',
    visitHistory: 'История посещений',
    noVisits: 'Визитов пока нет',
    accessCode: 'Код доступа',
    scanHint: 'Поднесите к NFC-терминалу или покажите QR',
    plan_day: 'Дневной',
    plan_month: 'Месячный',
    plan_quarter: 'Квартальный',
    plan_year: 'Годовой',
    plan_all_access: 'Мульти-пропуск',
    gymsTitle: 'Партнёрские залы',
    open: 'Открыт',
    closed: 'Закрыт',
    noGyms: 'Партнёрских залов пока нет',
    comingSoon: 'Скоро здесь появятся партнёрские залы',
    buyMembership: 'Купить абонемент',
    choosePlan: 'Выберите тариф',
    allGyms: 'Все залы',
    membershipExpired: 'Абонемент истёк',
    day: 'дн.',
  },
  rating: {
    title: 'Рейтинг',
    myRating: 'Мой рейтинг',
    ratingSubtitle: 'Личные достижения и уровень',
    totalScore: 'Общий счёт',
    progressTo: 'До',
    pointsLeft: 'очков',
    maxLevel: 'Максимальный уровень достигнут!',
    scoreBreakdown: 'Из чего складывается рейтинг',
    workoutPts: 'Тренировки',
    setPts: 'Подходы',
    volumePts: 'Объём',
    streakPts: 'Серия',
    prPts: 'Рекорды',
    durationBonus: 'Бонус длительности',
    categories: 'Категории',
    catVolume: 'Объём',
    catWorkouts: 'Тренировки',
    catStreak: 'Серия',
    catSets: 'Подходы',
    catDuration: 'Время',
    catRecords: 'Рекорды',
    achievements: 'Достижения',
    earned: 'получено',
    locked: 'заблок.',
    tierBeginner: 'Новичок',
    tierBronze: 'Бронза',
    tierSilver: 'Серебро',
    tierGold: 'Золото',
    tierPlatinum: 'Платина',
    tierElite: 'Элита',
    ach_first_workout_title: 'Первый шаг',
    ach_first_workout_desc: 'Выполни первую тренировку',
    ach_workouts_5_title: 'В форме',
    ach_workouts_5_desc: '5 тренировок выполнено',
    ach_workouts_30_title: 'Ритм найден',
    ach_workouts_30_desc: '30 тренировок',
    ach_workouts_100_title: 'Сотня',
    ach_workouts_100_desc: '100 тренировок выполнено',
    ach_workouts_365_title: 'Год силы',
    ach_workouts_365_desc: '365 тренировок',
    ach_streak_7_title: 'Неделя огня',
    ach_streak_7_desc: '7 дней подряд',
    ach_streak_30_title: 'Месяц молнии',
    ach_streak_30_desc: '30 дней подряд',
    ach_streak_90_title: 'Легенда серии',
    ach_streak_90_desc: '90 дней подряд',
    ach_volume_1t_title: 'Первая тонна',
    ach_volume_1t_desc: 'Суммарный объём 1 000 кг',
    ach_volume_10t_title: '10 тонн',
    ach_volume_10t_desc: 'Суммарный объём 10 000 кг',
    ach_volume_100t_title: 'Железный человек',
    ach_volume_100t_desc: 'Суммарный объём 100 000 кг',
    ach_sets_100_title: 'Сотня подходов',
    ach_sets_100_desc: '100 подходов выполнено',
    ach_sets_1000_title: 'Тысяча подходов',
    ach_sets_1000_desc: '1 000 подходов',
    ach_sets_10000_title: 'Мастер подходов',
    ach_sets_10000_desc: '10 000 подходов',
    ach_pr_first_title: 'Первый рекорд',
    ach_pr_first_desc: 'Установи личный рекорд',
    ach_pr_10_title: 'Рекордсмен',
    ach_pr_10_desc: '10 личных рекордов',
    ach_pr_50_title: 'Чемпион',
    ach_pr_50_desc: '50 личных рекордов',
    pts: 'оч.',
    kg: 'кг',
    days: 'дн.',
    min: 'мин',
    premiumGateTitle: 'Рейтинг — только для Premium',
    premiumGateSubtitle: 'Отслеживайте уровень, достижения и разбивку очков с Premium-доступом',
    premiumGateBtn: 'Получить Premium',
  },
  common: {
    error: 'Ошибка',
    cancel: 'Отмена',
    save: 'Сохранить',
    skip: 'Пропустить',
    loading: 'Загрузка...',
    noData: 'Нет данных',
    ok: 'OK',
    yes: 'Да',
    no: 'Нет',
    done: 'Готово',
    history: 'История',
    all: 'Все',
    records: 'записей',
  },
  languageSelect: {
    title: 'Выберите язык',
    subtitle: 'Выберите язык для работы с приложением',
    continue: 'Продолжить',
  },
  login: {
    subtitle: 'Войди, чтобы сохранять прогресс',
    signInGoogle: 'Войти через Google',
    terms: 'Продолжая, вы соглашаетесь с Условиями использования и Политикой конфиденциальности',
  },
  tabs: {
    progress: 'Прогресс',
    body: 'Тело',
    history: 'История',
    profile: 'Профиль',
  },
  progress: {
    title: 'Статистика прогресса',
    subtitle: 'Вся информация о ваших результатах',
    analytics: 'Аналитика',
    bodyMeasurements: 'Замеры тела',
    personalRecords: 'Личные рекорды',
    noDataChart: 'Нет данных',
    addMeasurementsFor: 'Добавьте замеры для',
    allRecords: 'Все рекорды',
    noMeasurements: 'Нет замеров',
    noRecords: 'Нет рекордов',
    noChartData: 'Нет данных замеров',
    weeklyReminder: 'Еженедельные замеры',
    weeklyReminderSubtitle: 'Пришло время для еженедельных замеров тела',
    enterValue: 'Введите значение',
    savedSuccess: 'Замеры сохранены!',
    saveError: 'Не удалось сохранить замеры',
  },
  recovery: {
    title: 'Восстановление',
    subtitle: 'Отслеживайте состояние мышц',
    ready: 'Готовы',
    recovering: 'Восст.',
    rest: 'Отдых',
    muscleStatus: 'Статус мышц',
    frontMuscles: 'Передние мышцы',
    backMuscles: 'Задние мышцы',
    showAll: 'Показать все мышцы',
    lastTrained: 'Последняя:',
    noData: 'Нет данных',
    legendRecovered: 'Восстановлено',
    legendRecovering: 'Восстанавливается',
    legendRest: 'Отдых',
  },
  history: {
    title: 'Вся история',
    filterByMuscle: 'Фильтровать по мышцам',
    allMuscles: 'Все мышцы',
    exercises: 'упр.',
    sets: 'подх.',
    min: 'мин',
    kg: 'кг',
    noWorkouts: 'Нет тренировок',
    startFirst: 'Начните свою первую тренировку!',
    noWorkoutsFilter: 'По выбранному фильтру тренировки не найдены',
    workoutsLoading: 'Загрузка тренировок...',
  },
  profile: {
    title: 'Профиль',
    subtitle: 'Управляйте аккаунтом',
    ratingEntry: 'Мой рейтинг',
    ratingEntrySubtitle: 'Уровень, достижения и очки',
    marketplaceEntry: 'Маркетплейс',
    marketplaceSubtitle: 'Тренеры и планы тренировок',
    gymPassEntry: 'FitEx Pass',
    gymPassSubtitle: 'Абонемент в партнёрские залы',
    premium: 'Премиум',
    basic: 'Базовый',
    premiumStatus: 'Премиум статус',
    premiumActive: 'Ваш Премиум аккаунт активен',
    freePlan: 'Бесплатный аккаунт с ограниченным функционалом',
    buyPremium: 'Купить Премиум',
    cloud: 'Облако',
    syncData: 'Синхронизировать данные',
    syncSubtitle: 'Обновить данные на сервере',
    notifications: 'Уведомления',
    reminder: 'Напоминания о тренировке',
    notifDisabled: 'Выключено',
    notifTimeLabel: 'Время напоминания',
    reminderSchedule: 'Пн–Пт в',
    export: 'Экспорт данных',
    exportAll: 'Экспортировать всё',
    exportAllSubtitle: 'Тренировки, замеры, рекорды в CSV',
    exportWorkouts: 'Только тренировки',
    exportWorkoutsSubtitle: 'записей',
    language: 'Язык',
    changeLanguage: 'Язык приложения',
    signOutSection: 'Выход',
    signOut: 'Выйти из аккаунта',
    signOutSubtitle: 'Завершить текущую сессию',
    signOutConfirm: 'Вы действительно хотите выйти из аккаунта?',
    signOutTitle: 'Выход',
    syncError: 'Не удалось синхронизировать данные: ',
    exportError: 'Не удалось экспортировать данные',
    notifError: 'Не удалось изменить настройки уведомлений',
    notifPermission: 'Для напоминаний о тренировках нужно разрешить уведомления в настройках устройства.',
    permissionsTitle: 'Разрешения',
    syncDone: 'Синхронизация завершена',
    recordsLabel: 'записей',
  },
}

export const en: Translations = {
  marketplace: {
    title: 'Marketplace',
    trainers: 'Trainers',
    plans: 'Plans',
    searchPlaceholder: 'Search trainers and plans...',
    loading: 'Loading...',
    noTrainers: 'No trainers yet',
    noPlans: 'No plans yet',
    becomeTrainer: 'Become a trainer',
    viewProfile: 'Open',
    from: 'from',
    verified: 'Verified',
    experience: 'years exp.',
    years: 'yrs',
    students: 'students',
    experience_label: 'Experience',
    difficulty_beginner: 'Beginner',
    difficulty_intermediate: 'Intermediate',
    difficulty_advanced: 'Advanced',
    type_workout: 'Workout',
    type_nutrition: 'Nutrition',
    type_combo: 'Combo',
    duration: 'Duration',
    weeks: 'wks',
    details: 'Details',
    myPlans: 'My Plans',
    noMyPlans: 'No purchased plans',
    filter_all: 'All',
    filter_strength: 'Strength',
    filter_cardio: 'Cardio',
    filter_nutrition: 'Nutrition',
  },
  gymPass: {
    title: 'FitEx Pass',
    myPass: 'My Pass',
    noMembership: 'No active membership',
    noMembershipSubtitle: 'Buy a membership to access partner gyms',
    browseGyms: 'Find gyms',
    validUntil: 'Valid until',
    visitsTotal: 'Total visits',
    daysLeft: 'days left',
    visitHistory: 'Visit history',
    noVisits: 'No visits yet',
    accessCode: 'Access code',
    scanHint: 'Hold near NFC terminal or show QR code',
    plan_day: 'Day pass',
    plan_month: 'Monthly',
    plan_quarter: 'Quarterly',
    plan_year: 'Annual',
    plan_all_access: 'Multi-pass',
    gymsTitle: 'Partner Gyms',
    open: 'Open',
    closed: 'Closed',
    noGyms: 'No partner gyms yet',
    comingSoon: 'Partner gyms coming soon',
    buyMembership: 'Buy Membership',
    choosePlan: 'Choose plan',
    allGyms: 'All gyms',
    membershipExpired: 'Membership expired',
    day: 'day',
  },
  rating: {
    title: 'Rating',
    myRating: 'My Rating',
    ratingSubtitle: 'Personal achievements & level',
    totalScore: 'Total Score',
    progressTo: 'To',
    pointsLeft: 'points',
    maxLevel: 'Maximum level reached!',
    scoreBreakdown: 'How your rating is calculated',
    workoutPts: 'Workouts',
    setPts: 'Sets',
    volumePts: 'Volume',
    streakPts: 'Streak',
    prPts: 'Records',
    durationBonus: 'Duration bonus',
    categories: 'Categories',
    catVolume: 'Volume',
    catWorkouts: 'Workouts',
    catStreak: 'Streak',
    catSets: 'Sets',
    catDuration: 'Duration',
    catRecords: 'Records',
    achievements: 'Achievements',
    earned: 'earned',
    locked: 'locked',
    tierBeginner: 'Beginner',
    tierBronze: 'Bronze',
    tierSilver: 'Silver',
    tierGold: 'Gold',
    tierPlatinum: 'Platinum',
    tierElite: 'Elite',
    ach_first_workout_title: 'First Step',
    ach_first_workout_desc: 'Complete your first workout',
    ach_workouts_5_title: 'Getting Fit',
    ach_workouts_5_desc: '5 workouts completed',
    ach_workouts_30_title: 'Finding the Rhythm',
    ach_workouts_30_desc: '30 workouts',
    ach_workouts_100_title: 'Century',
    ach_workouts_100_desc: '100 workouts completed',
    ach_workouts_365_title: 'Year of Strength',
    ach_workouts_365_desc: '365 workouts',
    ach_streak_7_title: 'Week on Fire',
    ach_streak_7_desc: '7 days in a row',
    ach_streak_30_title: 'Lightning Month',
    ach_streak_30_desc: '30 days in a row',
    ach_streak_90_title: 'Streak Legend',
    ach_streak_90_desc: '90 days in a row',
    ach_volume_1t_title: 'First Ton',
    ach_volume_1t_desc: 'Total volume 1,000 kg',
    ach_volume_10t_title: '10 Tons',
    ach_volume_10t_desc: 'Total volume 10,000 kg',
    ach_volume_100t_title: 'Iron Man',
    ach_volume_100t_desc: 'Total volume 100,000 kg',
    ach_sets_100_title: 'Hundred Sets',
    ach_sets_100_desc: '100 sets completed',
    ach_sets_1000_title: 'Thousand Sets',
    ach_sets_1000_desc: '1,000 sets',
    ach_sets_10000_title: 'Sets Master',
    ach_sets_10000_desc: '10,000 sets',
    ach_pr_first_title: 'First Record',
    ach_pr_first_desc: 'Set a personal record',
    ach_pr_10_title: 'Record Setter',
    ach_pr_10_desc: '10 personal records',
    ach_pr_50_title: 'Champion',
    ach_pr_50_desc: '50 personal records',
    pts: 'pts',
    kg: 'kg',
    days: 'days',
    min: 'min',
    premiumGateTitle: 'Rating is Premium only',
    premiumGateSubtitle: 'Track your level, achievements and score breakdown with Premium access',
    premiumGateBtn: 'Get Premium',
  },
  common: {
    error: 'Error',
    cancel: 'Cancel',
    save: 'Save',
    skip: 'Skip',
    loading: 'Loading...',
    noData: 'No data',
    ok: 'OK',
    yes: 'Yes',
    no: 'No',
    done: 'Done',
    history: 'History',
    all: 'All',
    records: 'records',
  },
  languageSelect: {
    title: 'Choose Language',
    subtitle: 'Select the language you want to use in the app',
    continue: 'Continue',
  },
  login: {
    subtitle: 'Sign in to save your progress',
    signInGoogle: 'Sign in with Google',
    terms: 'By continuing, you agree to our Terms of Service and Privacy Policy',
  },
  tabs: {
    progress: 'Progress',
    body: 'Body',
    history: 'History',
    profile: 'Profile',
  },
  progress: {
    title: 'Progress Statistics',
    subtitle: 'All your fitness results in one place',
    analytics: 'Analytics',
    bodyMeasurements: 'Body Measurements',
    personalRecords: 'Personal Records',
    noDataChart: 'No data',
    addMeasurementsFor: 'Add measurements for',
    allRecords: 'All records',
    noMeasurements: 'No measurements',
    noRecords: 'No records',
    noChartData: 'No measurement data',
    weeklyReminder: 'Weekly Measurements',
    weeklyReminderSubtitle: "It's time for your weekly body measurements",
    enterValue: 'Enter value',
    savedSuccess: 'Measurements saved!',
    saveError: 'Failed to save measurements',
  },
  recovery: {
    title: 'Recovery',
    subtitle: 'Track your muscle status',
    ready: 'Ready',
    recovering: 'Recov.',
    rest: 'Rest',
    muscleStatus: 'Muscle Status',
    frontMuscles: 'Front muscles',
    backMuscles: 'Back muscles',
    showAll: 'Show all muscles',
    lastTrained: 'Last:',
    noData: 'No data',
    legendRecovered: 'Recovered',
    legendRecovering: 'Recovering',
    legendRest: 'Rest',
  },
  history: {
    title: 'Full History',
    filterByMuscle: 'Filter by muscles',
    allMuscles: 'All muscles',
    exercises: 'exercises',
    sets: 'sets',
    min: 'min',
    kg: 'kg',
    noWorkouts: 'No workouts',
    startFirst: 'Start your first workout!',
    noWorkoutsFilter: 'No workouts found for selected filter',
    workoutsLoading: 'Loading workouts...',
  },
  profile: {
    title: 'Profile',
    subtitle: 'Manage your account',
    ratingEntry: 'My Rating',
    ratingEntrySubtitle: 'Level, achievements & score',
    marketplaceEntry: 'Marketplace',
    marketplaceSubtitle: 'Trainers and workout plans',
    gymPassEntry: 'FitEx Pass',
    gymPassSubtitle: 'Gym membership for partner clubs',
    premium: 'Premium',
    basic: 'Basic',
    premiumStatus: 'Premium Status',
    premiumActive: 'Your Premium account is active',
    freePlan: 'Free account with limited features',
    buyPremium: 'Get Premium',
    cloud: 'Cloud',
    syncData: 'Sync Data',
    syncSubtitle: 'Update data on server',
    notifications: 'Notifications',
    reminder: 'Workout Reminders',
    notifDisabled: 'Disabled',
    notifTimeLabel: 'Reminder time',
    reminderSchedule: 'Mon–Fri at',
    export: 'Export Data',
    exportAll: 'Export Everything',
    exportAllSubtitle: 'Workouts, measurements, records to CSV',
    exportWorkouts: 'Workouts only',
    exportWorkoutsSubtitle: 'records',
    language: 'Language',
    changeLanguage: 'App Language',
    signOutSection: 'Sign Out',
    signOut: 'Sign Out',
    signOutSubtitle: 'End current session',
    signOutConfirm: 'Do you really want to sign out?',
    signOutTitle: 'Sign Out',
    syncError: 'Failed to sync data: ',
    exportError: 'Failed to export data',
    notifError: 'Failed to change notification settings',
    notifPermission: 'Please allow notifications in device settings to enable workout reminders.',
    permissionsTitle: 'Permissions',
    syncDone: 'Sync completed',
    recordsLabel: 'records',
  },
}

export const az: Translations = {
  marketplace: {
    title: 'Bazar',
    trainers: 'Məşqçilər',
    plans: 'Planlar',
    searchPlaceholder: 'Məşqçi və plan axtar...',
    loading: 'Yüklənir...',
    noTrainers: 'Hələ məşqçi yoxdur',
    noPlans: 'Hələ plan yoxdur',
    becomeTrainer: 'Məşqçi ol',
    viewProfile: 'Aç',
    from: 'dan',
    verified: 'Təsdiqlənib',
    experience: 'il təcrübə',
    years: 'il',
    students: 'tələbə',
    experience_label: 'Təcrübə',
    difficulty_beginner: 'Yeni başlayan',
    difficulty_intermediate: 'Orta',
    difficulty_advanced: 'İrəliləmiş',
    type_workout: 'Məşq',
    type_nutrition: 'Qidalanma',
    type_combo: 'Kombo',
    duration: 'Müddət',
    weeks: 'həft.',
    details: 'Ətraflı',
    myPlans: 'Planlarım',
    noMyPlans: 'Alınmış plan yoxdur',
    filter_all: 'Hamısı',
    filter_strength: 'Güclü',
    filter_cardio: 'Kardio',
    filter_nutrition: 'Qidalanma',
  },
  gymPass: {
    title: 'FitEx Pass',
    myPass: 'Mənim pasım',
    noMembership: 'Aktiv abunə yoxdur',
    noMembershipSubtitle: 'Tərəfdaş zallara giriş üçün abunə alın',
    browseGyms: 'Zal tap',
    validUntil: 'Etibarlılıq müddəti',
    visitsTotal: 'Ümumi ziyarət',
    daysLeft: 'gün qaldı',
    visitHistory: 'Ziyarət tarixi',
    noVisits: 'Hələ ziyarət yoxdur',
    accessCode: 'Giriş kodu',
    scanHint: 'NFC terminalına tutun və ya QR kodu göstərin',
    plan_day: 'Günlük',
    plan_month: 'Aylıq',
    plan_quarter: 'Rüblük',
    plan_year: 'İllik',
    plan_all_access: 'Multi-pas',
    gymsTitle: 'Tərəfdaş zallar',
    open: 'Açıq',
    closed: 'Bağlı',
    noGyms: 'Hələ tərəfdaş zal yoxdur',
    comingSoon: 'Tərəfdaş zallar tezliklə əlavə ediləcək',
    buyMembership: 'Abunə al',
    choosePlan: 'Tarif seçin',
    allGyms: 'Bütün zallar',
    membershipExpired: 'Abunə müddəti bitib',
    day: 'gün',
  },
  rating: {
    title: 'Reytinq',
    myRating: 'Mənim reytinqim',
    ratingSubtitle: 'Şəxsi nailiyyətlər və səviyyə',
    totalScore: 'Ümumi bal',
    progressTo: 'Qədər',
    pointsLeft: 'bal',
    maxLevel: 'Maksimum səviyyəyə çatıldı!',
    scoreBreakdown: 'Reytinq necə hesablanır',
    workoutPts: 'Məşqlər',
    setPts: 'Yanaşmalar',
    volumePts: 'Həcm',
    streakPts: 'Seriya',
    prPts: 'Rekordlar',
    durationBonus: 'Müddət bonusu',
    categories: 'Kateqoriyalar',
    catVolume: 'Həcm',
    catWorkouts: 'Məşqlər',
    catStreak: 'Seriya',
    catSets: 'Yanaşmalar',
    catDuration: 'Vaxt',
    catRecords: 'Rekordlar',
    achievements: 'Nailiyyətlər',
    earned: 'qazanılıb',
    locked: 'kilidli',
    tierBeginner: 'Yeni başlayan',
    tierBronze: 'Bürünc',
    tierSilver: 'Gümüş',
    tierGold: 'Qızıl',
    tierPlatinum: 'Platinium',
    tierElite: 'Elit',
    ach_first_workout_title: 'İlk addım',
    ach_first_workout_desc: 'İlk məşqini tamamla',
    ach_workouts_5_title: 'Formada',
    ach_workouts_5_desc: '5 məşq tamamlandı',
    ach_workouts_30_title: 'Ritm tapıldı',
    ach_workouts_30_desc: '30 məşq',
    ach_workouts_100_title: 'Yüzlük',
    ach_workouts_100_desc: '100 məşq tamamlandı',
    ach_workouts_365_title: 'Güc ili',
    ach_workouts_365_desc: '365 məşq',
    ach_streak_7_title: 'Od həftəsi',
    ach_streak_7_desc: 'Ardıcıl 7 gün',
    ach_streak_30_title: 'İldırım ayı',
    ach_streak_30_desc: 'Ardıcıl 30 gün',
    ach_streak_90_title: 'Seriya əfsanəsi',
    ach_streak_90_desc: 'Ardıcıl 90 gün',
    ach_volume_1t_title: 'İlk ton',
    ach_volume_1t_desc: 'Ümumi həcm 1 000 kq',
    ach_volume_10t_title: '10 ton',
    ach_volume_10t_desc: 'Ümumi həcm 10 000 kq',
    ach_volume_100t_title: 'Dəmir insan',
    ach_volume_100t_desc: 'Ümumi həcm 100 000 kq',
    ach_sets_100_title: 'Yüz yanaşma',
    ach_sets_100_desc: '100 yanaşma tamamlandı',
    ach_sets_1000_title: 'Min yanaşma',
    ach_sets_1000_desc: '1 000 yanaşma',
    ach_sets_10000_title: 'Yanaşma ustası',
    ach_sets_10000_desc: '10 000 yanaşma',
    ach_pr_first_title: 'İlk rekord',
    ach_pr_first_desc: 'Şəxsi rekord qur',
    ach_pr_10_title: 'Rekordçu',
    ach_pr_10_desc: '10 şəxsi rekord',
    ach_pr_50_title: 'Çempion',
    ach_pr_50_desc: '50 şəxsi rekord',
    pts: 'bal',
    kg: 'kq',
    days: 'gün',
    min: 'dəq',
    premiumGateTitle: 'Reytinq — yalnız Premium üçün',
    premiumGateSubtitle: 'Premium girişlə səviyyənizi, nailiyyətlərinizi və xal bölgüsünü izləyin',
    premiumGateBtn: 'Premium al',
  },
  common: {
    error: 'Xəta',
    cancel: 'Ləğv et',
    save: 'Saxla',
    skip: 'Keç',
    loading: 'Yüklənir...',
    noData: 'Məlumat yoxdur',
    ok: 'OK',
    yes: 'Bəli',
    no: 'Xeyr',
    done: 'Hazır',
    history: 'Tarixçə',
    all: 'Hamısı',
    records: 'qeyd',
  },
  languageSelect: {
    title: 'Dil seçin',
    subtitle: 'Tətbiqdə istifadə etmək istədiyiniz dili seçin',
    continue: 'Davam et',
  },
  login: {
    subtitle: 'İrəliləyişinizi saxlamaq üçün daxil olun',
    signInGoogle: 'Google ilə daxil ol',
    terms: 'Davam edərək İstifadə Şərtləri və Məxfilik Siyasətini qəbul edirsiniz',
  },
  tabs: {
    progress: 'Tərəqqi',
    body: 'Bədən',
    history: 'Tarixçə',
    profile: 'Profil',
  },
  progress: {
    title: 'Tərəqqi statistikası',
    subtitle: 'Nəticələriniz haqqında bütün məlumat',
    analytics: 'Analitika',
    bodyMeasurements: 'Bədən ölçüləri',
    personalRecords: 'Fərdi rekordlar',
    noDataChart: 'Məlumat yoxdur',
    addMeasurementsFor: 'Ölçü əlavə edin:',
    allRecords: 'Bütün rekordlar',
    noMeasurements: 'Ölçü yoxdur',
    noRecords: 'Rekord yoxdur',
    noChartData: 'Ölçü məlumatı yoxdur',
    weeklyReminder: 'Həftəlik ölçülər',
    weeklyReminderSubtitle: 'Həftəlik bədən ölçülərinin vaxtı gəldi',
    enterValue: 'Dəyər daxil edin',
    savedSuccess: 'Ölçülər saxlanıldı!',
    saveError: 'Ölçüləri saxlamaq mümkün olmadı',
  },
  recovery: {
    title: 'Bərpa',
    subtitle: 'Əzələ vəziyyətinizi izləyin',
    ready: 'Hazır',
    recovering: 'Bərpa',
    rest: 'İstirahət',
    muscleStatus: 'Əzələ vəziyyəti',
    frontMuscles: 'Ön əzələlər',
    backMuscles: 'Arxa əzələlər',
    showAll: 'Bütün əzələləri göstər',
    lastTrained: 'Son:',
    noData: 'Məlumat yoxdur',
    legendRecovered: 'Bərpa edilib',
    legendRecovering: 'Bərpa olunur',
    legendRest: 'İstirahət',
  },
  history: {
    title: 'Tam tarixçə',
    filterByMuscle: 'Əzələyə görə filtrləyin',
    allMuscles: 'Bütün əzələlər',
    exercises: 'məşq',
    sets: 'yanaş.',
    min: 'dəq',
    kg: 'kq',
    noWorkouts: 'Məşq yoxdur',
    startFirst: 'İlk məşqinizə başlayın!',
    noWorkoutsFilter: 'Seçilmiş filtrlə məşq tapılmadı',
    workoutsLoading: 'Məşqlər yüklənir...',
  },
  profile: {
    title: 'Profil',
    subtitle: 'Hesabınızı idarə edin',
    ratingEntry: 'Mənim reytinqim',
    ratingEntrySubtitle: 'Səviyyə, nailiyyətlər və bal',
    marketplaceEntry: 'Bazar',
    marketplaceSubtitle: 'Məşqçilər və məşq planları',
    gymPassEntry: 'FitEx Pass',
    gymPassSubtitle: 'Tərəfdaş zallara abunə',
    premium: 'Premium',
    basic: 'Əsas',
    premiumStatus: 'Premium status',
    premiumActive: 'Premium hesabınız aktivdir',
    freePlan: 'Məhdud funksionallıqlı pulsuz hesab',
    buyPremium: 'Premium al',
    cloud: 'Bulud',
    syncData: 'Məlumatları sinxronlaşdır',
    syncSubtitle: 'Serverdəki məlumatları yenilə',
    notifications: 'Bildirişlər',
    reminder: 'Məşq xatırlatmaları',
    notifDisabled: 'Söndürülüb',
    notifTimeLabel: 'Xatırlatma vaxtı',
    reminderSchedule: 'B.e–C. saat',
    export: 'Məlumat ixracı',
    exportAll: 'Hamısını ixrac et',
    exportAllSubtitle: 'Məşqlər, ölçülər, rekordlar CSV-yə',
    exportWorkouts: 'Yalnız məşqlər',
    exportWorkoutsSubtitle: 'qeyd',
    language: 'Dil',
    changeLanguage: 'Tətbiq dili',
    signOutSection: 'Çıxış',
    signOut: 'Hesabdan çıx',
    signOutSubtitle: 'Mövcud sessiyanı bitir',
    signOutConfirm: 'Hesabdan çıxmaq istədiyinizə əminsiniz?',
    signOutTitle: 'Çıxış',
    syncError: 'Məlumatları sinxronlaşdırmaq mümkün olmadı: ',
    exportError: 'Məlumatları ixrac etmək mümkün olmadı',
    notifError: 'Bildiriş ayarlarını dəyişmək mümkün olmadı',
    notifPermission: 'Məşq xatırlatmalarını aktivləşdirmək üçün cihaz ayarlarında bildirişlərə icazə verin.',
    permissionsTitle: 'İcazələr',
    syncDone: 'Sinxronizasiya tamamlandı',
    recordsLabel: 'qeyd',
  },
}

export const translations: Record<Language, Translations> = { ru, en, az }

export const LANGUAGE_NAMES: Record<Language, string> = {
  ru: 'Русский',
  en: 'English',
  az: 'Azərbaycanca',
}

export const LANGUAGE_FLAGS: Record<Language, string> = {
  ru: '🇷🇺',
  en: '🇬🇧',
  az: '🇦🇿',
}
