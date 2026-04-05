export type Language = 'ru' | 'en' | 'az'

export interface Translations {
  splash: {
    getStarted: string
    hasAccount: string
    signIn: string
  }
  workout: {
    myWorkout: string
    finish: string
    discard: string
    discardTitle: string
    discardMsg: string
    continueBtn: string
    finishTitle: string
    saving: string
    saveError: string
    exercises: string
    noExercises: string
    noExercisesSubtitle: string
    addExercise: string
    notes: string
    notesPlaceholder: string
    sets: string
    time: string
    volume: string
    addSet: string
    deleteSet: string
    deleteSetMsg: string
    deleteExercise: string
    deleteExerciseMsg: string
    delete: string
    weight: string
    reps: string
    kg: string
    noNameError: string
    noExercisesError: string
    saveTemplateError: string
    saveAsTemplate: string
    title: string
    namePlaceholder: string
    pause: string
    start: string
    confirmExercise: string
    exercisesFor: string
    selectedExercise: string
  }
  exercises: {
    title: string
    searchPlaceholder: string
    selectMuscle: string
    notFound: string
    addToWorkout: string
    difficulty: string
    equipment: string
    primaryMuscles: string
    secondaryMuscles: string
    technique: string
    workingMuscles: string
    noHistory: string
    noHistorySubtitle: string
    lastTime: string
    now: string
    currentWorkout: string
    workoutHistory: string
    prevVolume: string
    currVolume: string
    today: string
    yesterday: string
    diffBeginner: string
    diffIntermediate: string
    diffAdvanced: string
    muscleChest: string
    muscleAbs: string
    muscleArms: string
    muscleShoulders: string
    muscleLegs: string
    muscleBack: string
    muscleGlutes: string
    muscleTriceps: string
    muscleTraps: string
    muscleForearms: string
    muscleBiceps: string
    muscleDeltoids: string
    videoUnavailable: string
  }
  templates: {
    title: string
    newTemplate: string
    editTemplate: string
    saveTemplate: string
    updateTemplate: string
    saving: string
    deleteTemplate: string
    confirmDelete: string
    useTemplate: string
    editBtn: string
    duration: string
    noDescription: string
    recentTemplates: string
    allTemplates: string
    showAll: string
    createTemplate: string
    startWorkout: string
    namePlaceholder: string
    descPlaceholder: string
    durationPlaceholder: string
    selectExercise: string
    noTemplates: string
    loading: string
    exercisesShort: string
    minShort: string
    deleteConfirmTitle: string
    deleteConfirmMsg: string
    nameRequired: string
    exerciseRequired: string
    addExerciseHint: string
    exercisesLabel: string
    sets: string
    reps: string
    weight: string
    deleteTitle: string
    deleteMsg: string
  }
  measurements: {
    title: string
    loading: string
    current: string
    history: string
    change: string
    weightChange: string
    bodyChange: string
    daysAgo: string
    value: string
    date: string
    edit: string
    delete: string
    confirmDelete: string
    confirmDeleteMsg: string
    saveBtn: string
    emptyTitle: string
    emptyHistory: string
    emptySubtitle: string
    weightLabel: string
    chestLabel: string
    waistLabel: string
    hipsLabel: string
    bicepsLabel: string
    thighLabel: string
    neckLabel: string
    calfLabel: string
    bodyFatLabel: string
    progress: string
    goal: string
    total: string
  }
  records: {
    title: string
    autoUpdate: string
    loading: string
    all: string
    strength: string
    cardio: string
    endurance: string
    noRecords: string
    empty: string
    emptyHint: string
    record: string
    previous: string
    progress: string
    auto: string
    addRecord: string
    editRecord: string
    saveRecord: string
    exerciseName: string
    exercisePlaceholder: string
    category: string
    confirmDelete: string
    confirmDeleteMsg: string
    oneRepMax: string
    volume: string
    totalSets: string
    kg: string
    reps: string
    min: string
    total: string
    improved: string
    catAll: string
    catStrength: string
    catCardio: string
    catEndurance: string
  }
  subscription: {
    title: string
    monthlyTitle: string
    yearlyTitle: string
    monthlyDesc: string
    yearlyDesc: string
    bestValue: string
    year: string
    month: string
    restore: string
    loading: string
    purchaseError: string
    restoreSuccess: string
    restoreEmpty: string
    alreadyPremium: string
    feature1: string
    feature2: string
    feature3: string
    feature4: string
    feature5: string
    cancelAnytime: string
  }
  sync: {
    connecting: string
    uploading: string
    downloading: string
    done: string
    error: string
    connectingToServer: string
    sendingChanges: string
    premiumRequired: string
    syncTitle: string
    offlineMsg: string
  }
  notifications: {
    workoutReminder: string
  }
  export: {
    dialogTitle: string
    dateHeader: string
    typeHeader: string
    exercisesHeader: string
    setsHeader: string
    durationHeader: string
    volumeHeader: string
    notesHeader: string
    nameHeader: string
    valueHeader: string
    unitHeader: string
    exerciseHeader: string
    maxWeightHeader: string
    maxRepsHeader: string
    oneRepMaxHeader: string
  }
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
    success: string
    optional: string
    unknownError: string
    delete: string
    edit: string
    add: string
    confirm: string
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
    totalVolume: string
    muscleGrowth: string
    massDecrease: string
    noChange: string
    noStrengthRecords: string
    improved: string
    decreased: string
    stable: string
    enduranceGrowth: string
    enduranceDecrease: string
    enduranceStable: string
    avgDuration: string
    noWorkouts: string
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
    workout1: string
    workout2: string
    workout5: string
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
    reminderTime: string
    hours: string
    minutes: string
    defaultUser: string
  }
  trial: {
    badge: string
    heroTitle: string
    heroSubtitle: string
    days: string
    freeLabel: string
    featuresTitle: string
    choosePlan: string
    monthly: string
    yearly: string
    monthlyDesc: string
    yearlySave: string
    cta: string
    ctaSub: string
    legal: string
    skipLink: string
    skipTitle: string
    skipBody: string
    skipConfirm: string
    noReceipt: string
  }
}

export const ru: Translations = {
  splash: {
    getStarted: 'Начать',
    hasAccount: 'Уже есть аккаунт?',
    signIn: 'Войти',
  },
  workout: {
    myWorkout: 'Моя тренировка',
    finish: 'Завершить',
    discard: 'Отменить',
    discardTitle: 'Отменить тренировку?',
    discardMsg: 'Все данные будут удалены без сохранения',
    continueBtn: 'Продолжить',
    finishTitle: 'Завершить тренировку?',
    saving: 'Сохранение тренировки...',
    saveError: 'Не удалось сохранить тренировку',
    exercises: 'Упражнения',
    noExercises: 'Нет упражнений',
    noExercisesSubtitle: 'Добавьте первое упражнение, чтобы начать тренировку',
    addExercise: 'Добавить упражнение',
    notes: 'Заметки',
    notesPlaceholder: 'Добавьте заметки к тренировке...',
    sets: 'Подходы',
    time: 'Время',
    volume: 'Объем',
    addSet: 'Добавить подход',
    deleteSet: 'Удалить подход?',
    deleteSetMsg: 'Это действие нельзя отменить',
    deleteExercise: 'Удалить упражнение?',
    deleteExerciseMsg: 'Все подходы также будут удалены',
    delete: 'Удалить',
    weight: 'Вес',
    reps: 'Повт.',
    kg: 'кг',
    noNameError: 'Введите название тренировки',
    noExercisesError: 'Добавьте хотя бы одно упражнение',
    saveTemplateError: 'Добавьте хотя бы одно упражнение для создания шаблона',
    saveAsTemplate: 'Сохранить как шаблон',
    title: 'Тренировка',
    namePlaceholder: 'Название тренировки',
    pause: 'Пауза',
    start: 'Старт',
    confirmExercise: 'Подтверждение',
    exercisesFor: 'Упражнения для',
    selectedExercise: 'Выбрано',
  },
  exercises: {
    title: 'Выберите упражнение',
    searchPlaceholder: 'Поиск упражнений...',
    selectMuscle: 'Выберите группу мышц',
    notFound: 'Ничего не найдено',
    addToWorkout: 'Добавить в тренировку',
    difficulty: 'Сложность',
    equipment: 'Оборудование',
    primaryMuscles: 'Основные:',
    secondaryMuscles: 'Вспомогательные:',
    technique: 'Техника выполнения',
    workingMuscles: 'Работающие мышцы',
    noHistory: 'Нет истории',
    noHistorySubtitle: 'Данные появятся после первой тренировки',
    lastTime: 'Прошлый раз',
    now: 'Сейчас',
    currentWorkout: 'Текущая тренировка',
    workoutHistory: 'История тренировок',
    prevVolume: 'Прошлый объём',
    currVolume: 'Текущий объём',
    today: 'Сегодня',
    yesterday: 'Вчера',
    diffBeginner: 'Начинающий',
    diffIntermediate: 'Средний',
    diffAdvanced: 'Продвинутый',
    muscleChest: 'Грудь',
    muscleAbs: 'Пресс',
    muscleArms: 'Руки',
    muscleShoulders: 'Плечи',
    muscleLegs: 'Ноги',
    muscleBack: 'Спина',
    muscleGlutes: 'Ягодицы',
    muscleTriceps: 'Трицепс',
    muscleTraps: 'Трапеции',
    muscleForearms: 'Предплечья',
    muscleBiceps: 'Бицепс',
    muscleDeltoids: 'Дельты',
    videoUnavailable: 'Видео недоступно',
  },
  templates: {
    title: 'Шаблоны',
    newTemplate: 'Новый шаблон',
    editTemplate: 'Редактировать шаблон',
    saveTemplate: 'Сохранить шаблон',
    updateTemplate: 'Обновить шаблон',
    saving: 'Сохранение...',
    deleteTemplate: 'Удалить шаблон',
    confirmDelete: 'Вы уверены?',
    useTemplate: 'Использовать',
    editBtn: 'Редактировать',
    duration: 'Длительность',
    noDescription: 'Нет описания',
    recentTemplates: 'Последние шаблоны',
    allTemplates: 'Все шаблоны',
    showAll: 'Показать все шаблоны',
    createTemplate: 'Создать шаблон',
    startWorkout: 'Начать тренировку',
    namePlaceholder: 'Название шаблона',
    descPlaceholder: 'Описание (необязательно)',
    durationPlaceholder: 'Примерная длительность',
    selectExercise: 'Выбрать упражнение',
    noTemplates: 'Нет шаблонов',
    loading: 'Загрузка шаблонов...',
    exercisesShort: 'упр.',
    minShort: 'мин.',
    deleteConfirmTitle: 'Удалить шаблон?',
    deleteConfirmMsg: 'Это действие нельзя отменить',
    nameRequired: 'Введите название шаблона',
    exerciseRequired: 'Добавьте хотя бы одно упражнение',
    addExerciseHint: 'Нажмите "Добавить", чтобы выбрать упражнения',
    exercisesLabel: 'Упражнения',
    sets: 'Подходы',
    reps: 'Повторения',
    weight: 'Вес (кг)',
    deleteTitle: 'Удалить шаблон?',
    deleteMsg: 'Это действие нельзя отменить',
  },
  measurements: {
    title: 'Замеры тела',
    loading: 'Загрузка истории...',
    current: 'Текущие',
    history: 'История',
    change: 'Изменение',
    weightChange: 'Изм. веса',
    bodyChange: 'Параметров',
    daysAgo: 'Дней назад',
    value: 'Значение',
    date: 'Дата',
    edit: 'Изменить',
    delete: 'Удалить',
    confirmDelete: 'Удалить замер?',
    confirmDeleteMsg: 'Это действие нельзя отменить',
    saveBtn: 'Сохранить замер',
    emptyTitle: 'Нет замеров',
    emptyHistory: 'Нет истории',
    emptySubtitle: 'Добавьте первый замер для отслеживания прогресса',
    total: 'Замеров',
    weightLabel: 'Вес',
    chestLabel: 'Грудь',
    waistLabel: 'Талия',
    hipsLabel: 'Бёдра',
    bicepsLabel: 'Бицепс',
    thighLabel: 'Бедро',
    neckLabel: 'Шея',
    calfLabel: 'Голень',
    bodyFatLabel: 'Жир',
    progress: 'Прогресс',
    goal: 'Цель',
  },
  records: {
    title: 'Личные рекорды',
    autoUpdate: 'Обновляются автоматически',
    loading: 'Загрузка рекордов...',
    all: 'Все',
    strength: 'Сила',
    cardio: 'Кардио',
    endurance: 'Выносливость',
    noRecords: 'Нет рекордов',
    empty: 'Нет рекордов',
    emptyHint: 'Рекорды появятся автоматически после завершения тренировки',
    total: 'Рекордов',
    improved: 'Улучшено',
    catAll: 'Все',
    catStrength: 'Сила',
    catCardio: 'Кардио',
    catEndurance: 'Выносливость',
    record: 'Рекорд',
    previous: 'Предыдущий',
    progress: 'Прогресс',
    auto: 'Авто',
    addRecord: 'Добавить рекорд',
    editRecord: 'Редактировать рекорд',
    saveRecord: 'Сохранить рекорд',
    exerciseName: 'Упражнение',
    exercisePlaceholder: 'Название упражнения',
    category: 'Категория',
    confirmDelete: 'Удалить рекорд?',
    confirmDeleteMsg: 'Это действие нельзя отменить',
    oneRepMax: '1ПМ',
    volume: 'Объём',
    totalSets: 'Подходов',
    kg: 'кг',
    reps: 'повт.',
    min: 'мин',
  },
  subscription: {
    title: 'Купить Premium',
    monthlyTitle: 'Месячная подписка',
    yearlyTitle: 'Годовая подписка',
    monthlyDesc: 'Все преимущества Premium на месяц',
    yearlyDesc: 'Все преимущества Premium на год (скидка 20%)',
    bestValue: 'Хит',
    year: 'год',
    month: 'мес',
    restore: 'Восстановить покупки',
    loading: 'Загрузка подписок...',
    purchaseError: 'Ошибка при покупке',
    restoreSuccess: 'Покупки восстановлены',
    restoreEmpty: 'Активных покупок не найдено',
    alreadyPremium: 'У вас уже есть Premium',
    feature1: 'Система рейтинга и достижений',
    feature2: 'Синхронизация с облаком',
    feature3: 'Расширенная аналитика',
    feature4: 'Маркетплейс тренеров',
    feature5: 'FitEx Pass — абонемент в залы',
    cancelAnytime: 'Отмена в любое время',
  },
  sync: {
    connecting: 'Подключение...',
    uploading: 'Загрузка данных...',
    downloading: 'Получение данных...',
    done: 'Синхронизировано',
    error: 'Ошибка синхронизации',
    connectingToServer: 'Подключение к серверу...',
    sendingChanges: 'Отправка изменений...',
    premiumRequired: 'Синхронизация доступна только в Premium',
    syncTitle: 'Синхронизация',
    offlineMsg: 'Нет подключения к интернету',
  },
  notifications: {
    workoutReminder: 'Не забудь про сегодняшнюю тренировку — ты уже так далеко зашёл(ла)!',
  },
  export: {
    dialogTitle: 'Экспорт данных Fitex',
    dateHeader: 'Дата',
    typeHeader: 'Тип',
    exercisesHeader: 'Упражнений',
    setsHeader: 'Подходов',
    durationHeader: 'Длительность (мин)',
    volumeHeader: 'Объем (кг)',
    notesHeader: 'Заметки',
    nameHeader: 'Название',
    valueHeader: 'Значение',
    unitHeader: 'Ед. изм.',
    exerciseHeader: 'Упражнение',
    maxWeightHeader: 'Макс. вес (кг)',
    maxRepsHeader: 'Макс. повт.',
    oneRepMaxHeader: '1ПМ (кг)',
  },
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
    success: 'Успех',
    optional: 'опционально',
    unknownError: 'Что-то пошло не так',
    delete: 'Удалить',
    edit: 'Изменить',
    add: 'Добавить',
    confirm: 'Подтвердить',
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
    totalVolume: 'Общий вес',
    muscleGrowth: 'Рост мышечной массы',
    massDecrease: 'Снижение массы',
    noChange: 'Без изменений',
    noStrengthRecords: 'Нет силовых рекордов',
    improved: 'Улучшение',
    decreased: 'Ухудшение',
    stable: 'Стабильно',
    enduranceGrowth: 'Рост выносливости',
    enduranceDecrease: 'Снижение выносливости',
    enduranceStable: 'Стабильная выносливость',
    avgDuration: 'Средняя длительность',
    noWorkouts: 'Нет тренировок',
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
    workout1: 'тренировка',
    workout2: 'тренировки',
    workout5: 'тренировок',
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
    reminderTime: 'Время напоминания',
    hours: 'Часы',
    minutes: 'Минуты',
    defaultUser: 'Пользователь',
  },
  trial: {
    badge: 'Бесплатный период',
    heroTitle: '30 дней бесплатно',
    heroSubtitle: 'Весь Premium без ограничений.\nКарта нужна, но списание — через 30 дней.',
    days: 'дней',
    freeLabel: 'Бесплатно',
    featuresTitle: 'Что входит в Premium',
    choosePlan: 'Выберите план',
    monthly: 'Месячная подписка',
    yearly: 'Годовая подписка',
    monthlyDesc: 'После окончания пробного периода',
    yearlySave: 'Скидка 20% — выгоднее',
    cta: 'Начать бесплатный период',
    ctaSub: 'Списание через 30 дней · Отмена в любой момент',
    legal: 'Подписка автоматически продлевается. Вы можете отменить её в настройках App Store / Google Play в любое время до окончания пробного периода.',
    skipLink: 'Попробовать без карты (ограниченный доступ)',
    skipTitle: 'Ограниченный доступ',
    skipBody: 'Без привязки карты будут доступны только базовые функции. Рейтинг, синхронизация и аналитика — только с подпиской.',
    skipConfirm: 'Продолжить без карты',
    noReceipt: 'Квитанция о покупке не найдена',
  },
}

export const en: Translations = {
  splash: {
    getStarted: 'Get Started',
    hasAccount: 'Already have an account?',
    signIn: 'Sign In',
  },
  workout: {
    myWorkout: 'My Workout',
    finish: 'Finish',
    discard: 'Discard',
    discardTitle: 'Discard Workout?',
    discardMsg: 'All data will be lost without saving',
    continueBtn: 'Continue',
    finishTitle: 'Finish Workout?',
    saving: 'Saving workout...',
    saveError: 'Failed to save workout',
    exercises: 'Exercises',
    noExercises: 'No exercises',
    noExercisesSubtitle: 'Add your first exercise to start the workout',
    addExercise: 'Add Exercise',
    notes: 'Notes',
    notesPlaceholder: 'Add notes to your workout...',
    sets: 'Sets',
    time: 'Time',
    volume: 'Volume',
    addSet: 'Add Set',
    deleteSet: 'Delete Set?',
    deleteSetMsg: 'This cannot be undone',
    deleteExercise: 'Delete Exercise?',
    deleteExerciseMsg: 'All sets will also be removed',
    delete: 'Delete',
    weight: 'Weight',
    reps: 'Reps',
    kg: 'kg',
    noNameError: 'Enter workout name',
    noExercisesError: 'Add at least one exercise',
    saveTemplateError: 'Add exercises to create a template',
    saveAsTemplate: 'Save as Template',
    title: 'Workout',
    namePlaceholder: 'Workout name',
    pause: 'Pause',
    start: 'Start',
    confirmExercise: 'Confirm',
    exercisesFor: 'Exercises for',
    selectedExercise: 'Selected',
  },
  exercises: {
    title: 'Select Exercise',
    searchPlaceholder: 'Search exercises...',
    selectMuscle: 'Select muscle group',
    notFound: 'Nothing found',
    addToWorkout: 'Add to Workout',
    difficulty: 'Difficulty',
    equipment: 'Equipment',
    primaryMuscles: 'Primary:',
    secondaryMuscles: 'Secondary:',
    technique: 'Technique',
    workingMuscles: 'Working Muscles',
    noHistory: 'No history',
    noHistorySubtitle: 'Data will appear after your first workout',
    lastTime: 'Last time',
    now: 'Now',
    currentWorkout: 'Current Workout',
    workoutHistory: 'Workout History',
    prevVolume: 'Previous Volume',
    currVolume: 'Current Volume',
    today: 'Today',
    yesterday: 'Yesterday',
    diffBeginner: 'Beginner',
    diffIntermediate: 'Intermediate',
    diffAdvanced: 'Advanced',
    muscleChest: 'Chest',
    muscleAbs: 'Abs',
    muscleArms: 'Arms',
    muscleShoulders: 'Shoulders',
    muscleLegs: 'Legs',
    muscleBack: 'Back',
    muscleGlutes: 'Glutes',
    muscleTriceps: 'Triceps',
    muscleTraps: 'Traps',
    muscleForearms: 'Forearms',
    muscleBiceps: 'Biceps',
    muscleDeltoids: 'Deltoids',
    videoUnavailable: 'Video unavailable',
  },
  templates: {
    title: 'Templates',
    newTemplate: 'New Template',
    editTemplate: 'Edit Template',
    saveTemplate: 'Save Template',
    updateTemplate: 'Update Template',
    saving: 'Saving...',
    deleteTemplate: 'Delete Template',
    confirmDelete: 'Are you sure?',
    useTemplate: 'Use',
    editBtn: 'Edit',
    duration: 'Duration',
    noDescription: 'No description',
    recentTemplates: 'Recent Templates',
    allTemplates: 'All Templates',
    showAll: 'Show all templates',
    createTemplate: 'Create Template',
    startWorkout: 'Start Workout',
    namePlaceholder: 'Template name',
    descPlaceholder: 'Description (optional)',
    durationPlaceholder: 'Estimated duration',
    selectExercise: 'Select Exercise',
    noTemplates: 'No templates',
    loading: 'Loading templates...',
    exercisesShort: 'ex.',
    minShort: 'min.',
    deleteConfirmTitle: 'Delete Template?',
    deleteConfirmMsg: 'This cannot be undone',
    nameRequired: 'Enter template name',
    exerciseRequired: 'Add at least one exercise',
    addExerciseHint: 'Press "Add" to select exercises',
    exercisesLabel: 'Exercises',
    sets: 'Sets',
    reps: 'Reps',
    weight: 'Weight (kg)',
    deleteTitle: 'Delete Template?',
    deleteMsg: 'This cannot be undone',
  },
  measurements: {
    title: 'Body Measurements',
    loading: 'Loading history...',
    current: 'Current',
    history: 'History',
    change: 'Change',
    weightChange: 'Weight change',
    bodyChange: 'Body changes',
    daysAgo: 'Days ago',
    value: 'Value',
    date: 'Date',
    edit: 'Edit',
    delete: 'Delete',
    confirmDelete: 'Delete measurement?',
    confirmDeleteMsg: 'This cannot be undone',
    saveBtn: 'Save Measurement',
    emptyTitle: 'No measurements',
    emptyHistory: 'No history',
    emptySubtitle: 'Add your first measurement to track progress',
    total: 'Measurements',
    weightLabel: 'Weight',
    chestLabel: 'Chest',
    waistLabel: 'Waist',
    hipsLabel: 'Hips',
    bicepsLabel: 'Biceps',
    thighLabel: 'Thigh',
    neckLabel: 'Neck',
    calfLabel: 'Calf',
    bodyFatLabel: 'Body Fat',
    progress: 'Progress',
    goal: 'Goal',
  },
  records: {
    title: 'Personal Records',
    autoUpdate: 'Auto-updated',
    loading: 'Loading records...',
    all: 'All',
    strength: 'Strength',
    cardio: 'Cardio',
    endurance: 'Endurance',
    noRecords: 'No records',
    empty: 'No records',
    emptyHint: 'Records are set automatically after completing a workout',
    total: 'Records',
    improved: 'Improved',
    catAll: 'All',
    catStrength: 'Strength',
    catCardio: 'Cardio',
    catEndurance: 'Endurance',
    record: 'Record',
    previous: 'Previous',
    progress: 'Progress',
    auto: 'Auto',
    addRecord: 'Add Record',
    editRecord: 'Edit Record',
    saveRecord: 'Save Record',
    exerciseName: 'Exercise',
    exercisePlaceholder: 'Exercise name',
    category: 'Category',
    confirmDelete: 'Delete record?',
    confirmDeleteMsg: 'This cannot be undone',
    oneRepMax: '1RM',
    volume: 'Volume',
    totalSets: 'Sets',
    kg: 'kg',
    reps: 'reps',
    min: 'min',
  },
  subscription: {
    title: 'Get Premium',
    monthlyTitle: 'Monthly Subscription',
    yearlyTitle: 'Annual Subscription',
    monthlyDesc: 'All Premium benefits for a month',
    yearlyDesc: 'All Premium benefits for a year (20% off)',
    bestValue: 'Best Value',
    year: 'year',
    month: 'mo',
    restore: 'Restore Purchases',
    loading: 'Loading subscriptions...',
    purchaseError: 'Purchase Error',
    restoreSuccess: 'Purchases Restored',
    restoreEmpty: 'No active purchases found',
    alreadyPremium: 'You already have Premium',
    feature1: 'Rating system & achievements',
    feature2: 'Cloud sync',
    feature3: 'Advanced analytics',
    feature4: 'Trainer marketplace',
    feature5: 'FitEx Pass — gym membership',
    cancelAnytime: 'Cancel anytime',
  },
  sync: {
    connecting: 'Connecting...',
    uploading: 'Uploading data...',
    downloading: 'Downloading data...',
    done: 'Synced',
    error: 'Sync Error',
    connectingToServer: 'Connecting to server...',
    sendingChanges: 'Sending changes...',
    premiumRequired: 'Sync is a Premium feature',
    syncTitle: 'Sync',
    offlineMsg: 'No internet connection',
  },
  notifications: {
    workoutReminder: "Don't forget today's workout — you've come so far!",
  },
  export: {
    dialogTitle: 'Export Fitex Data',
    dateHeader: 'Date',
    typeHeader: 'Type',
    exercisesHeader: 'Exercises',
    setsHeader: 'Sets',
    durationHeader: 'Duration (min)',
    volumeHeader: 'Volume (kg)',
    notesHeader: 'Notes',
    nameHeader: 'Name',
    valueHeader: 'Value',
    unitHeader: 'Unit',
    exerciseHeader: 'Exercise',
    maxWeightHeader: 'Max Weight (kg)',
    maxRepsHeader: 'Max Reps',
    oneRepMaxHeader: '1RM (kg)',
  },
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
    success: 'Success',
    optional: 'optional',
    unknownError: 'Something went wrong',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    confirm: 'Confirm',
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
    totalVolume: 'Total Weight',
    muscleGrowth: 'Muscle growth',
    massDecrease: 'Mass decrease',
    noChange: 'No change',
    noStrengthRecords: 'No strength records',
    improved: 'Improved',
    decreased: 'Decreased',
    stable: 'Stable',
    enduranceGrowth: 'Endurance growth',
    enduranceDecrease: 'Endurance decrease',
    enduranceStable: 'Stable endurance',
    avgDuration: 'Average duration',
    noWorkouts: 'No workouts',
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
    workout1: 'workout',
    workout2: 'workouts',
    workout5: 'workouts',
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
    reminderTime: 'Reminder time',
    hours: 'Hours',
    minutes: 'Minutes',
    defaultUser: 'User',
  },
  trial: {
    badge: 'Free Trial',
    heroTitle: '30 Days Free',
    heroSubtitle: 'Full Premium access — no charge for 30 days.\nA payment method is required to start.',
    days: 'days',
    freeLabel: 'Free',
    featuresTitle: "What's included in Premium",
    choosePlan: 'Choose your plan',
    monthly: 'Monthly',
    yearly: 'Yearly',
    monthlyDesc: 'Billed after your free trial ends',
    yearlySave: 'Save 20% — best value',
    cta: 'Start Free Trial',
    ctaSub: 'Charged after 30 days · Cancel anytime',
    legal: 'Subscription renews automatically. You can cancel at any time via App Store / Google Play settings before the trial ends.',
    skipLink: 'Continue without payment (limited access)',
    skipTitle: 'Limited Access',
    skipBody: 'Without a payment method, only basic features are available. Rating, sync, and advanced analytics require a subscription.',
    skipConfirm: 'Continue without card',
    noReceipt: 'No purchase receipt found',
  },
}

export const az: Translations = {
  splash: {
    getStarted: 'Başlayın',
    hasAccount: 'Artıq hesabınız var?',
    signIn: 'Daxil olun',
  },
  workout: {
    myWorkout: 'Mənim məşqim',
    finish: 'Bitir',
    discard: 'Ləğv et',
    discardTitle: 'Məşqi ləğv et?',
    discardMsg: 'Bütün məlumatlar saxlanılmadan silinəcək',
    continueBtn: 'Davam et',
    finishTitle: 'Məşqi bitir?',
    saving: 'Məşq saxlanılır...',
    saveError: 'Məşqi saxlamaq mümkün olmadı',
    exercises: 'Məşqlər',
    noExercises: 'Məşq yoxdur',
    noExercisesSubtitle: 'Məşqə başlamaq üçün ilk hərəkəti əlavə edin',
    addExercise: 'Məşq əlavə et',
    notes: 'Qeydlər',
    notesPlaceholder: 'Məşqə qeyd əlavə edin...',
    sets: 'Yanaşmalar',
    time: 'Vaxt',
    volume: 'Həcm',
    addSet: 'Yanaşma əlavə et',
    deleteSet: 'Yanaşmanı sil?',
    deleteSetMsg: 'Bu əməliyyat geri alına bilməz',
    deleteExercise: 'Məşqi sil?',
    deleteExerciseMsg: 'Bütün yanaşmalar da silinəcək',
    delete: 'Sil',
    weight: 'Çəki',
    reps: 'Təkrar',
    kg: 'kq',
    noNameError: 'Məşq adını daxil edin',
    noExercisesError: 'Ən az bir hərəkət əlavə edin',
    saveTemplateError: 'Şablon yaratmaq üçün hərəkət əlavə edin',
    saveAsTemplate: 'Şablon kimi saxla',
    title: 'Məşq',
    namePlaceholder: 'Məşq adı',
    pause: 'Fasilə',
    start: 'Başlat',
    confirmExercise: 'Təsdiqlə',
    exercisesFor: 'Hərəkətlər:',
    selectedExercise: 'Seçildi',
  },
  exercises: {
    title: 'Hərəkət seçin',
    searchPlaceholder: 'Hərəkət axtar...',
    selectMuscle: 'Əzələ qrupu seçin',
    notFound: 'Heç nə tapılmadı',
    addToWorkout: 'Məşqə əlavə et',
    difficulty: 'Çətinlik',
    equipment: 'Avadanlıq',
    primaryMuscles: 'Əsas:',
    secondaryMuscles: 'Köməkçi:',
    technique: 'Texnika',
    workingMuscles: 'İşləyən əzələlər',
    noHistory: 'Tarixçə yoxdur',
    noHistorySubtitle: 'Məlumat ilk məşqdən sonra görünəcək',
    lastTime: 'Keçən dəfə',
    now: 'İndi',
    currentWorkout: 'Cari məşq',
    workoutHistory: 'Məşq tarixçəsi',
    prevVolume: 'Əvvəlki həcm',
    currVolume: 'Cari həcm',
    today: 'Bu gün',
    yesterday: 'Dünən',
    diffBeginner: 'Yeni başlayan',
    diffIntermediate: 'Orta',
    diffAdvanced: 'İrəliləmiş',
    muscleChest: 'Döş',
    muscleAbs: 'Qarın',
    muscleArms: 'Qollar',
    muscleShoulders: 'Çiynlər',
    muscleLegs: 'Bacaqlar',
    muscleBack: 'Arxa',
    muscleGlutes: 'Kalçalar',
    muscleTriceps: 'Triseps',
    muscleTraps: 'Trapesiya',
    muscleForearms: 'Bilək',
    muscleBiceps: 'Biseps',
    muscleDeltoids: 'Deltoid',
    videoUnavailable: 'Video mövcud deyil',
  },
  templates: {
    title: 'Şablonlar',
    newTemplate: 'Yeni şablon',
    editTemplate: 'Şablonu düzənlə',
    saveTemplate: 'Şablonu saxla',
    updateTemplate: 'Şablonu yenilə',
    saving: 'Saxlanılır...',
    deleteTemplate: 'Şablonu sil',
    confirmDelete: 'Əminsiniz?',
    useTemplate: 'İstifadə et',
    editBtn: 'Düzənlə',
    duration: 'Müddət',
    noDescription: 'Təsvir yoxdur',
    recentTemplates: 'Son şablonlar',
    allTemplates: 'Bütün şablonlar',
    showAll: 'Bütün şablonları göstər',
    createTemplate: 'Şablon yarat',
    startWorkout: 'Məşqə başla',
    namePlaceholder: 'Şablon adı',
    descPlaceholder: 'Təsvir (istəyə görə)',
    durationPlaceholder: 'Təxmini müddət',
    selectExercise: 'Hərəkət seçin',
    noTemplates: 'Şablon yoxdur',
    loading: 'Şablonlar yüklənir...',
    exercisesShort: 'hər.',
    minShort: 'dəq.',
    deleteConfirmTitle: 'Şablonu sil?',
    deleteConfirmMsg: 'Bu əməliyyat geri alına bilməz',
    nameRequired: 'Şablon adını daxil edin',
    exerciseRequired: 'Ən az bir hərəkət əlavə edin',
    addExerciseHint: 'Hərəkət seçmək üçün "Əlavə et" düyməsini basın',
    exercisesLabel: 'Hərəkətlər',
    sets: 'Yanaşmalar',
    reps: 'Təkrarlar',
    weight: 'Çəki (kq)',
    deleteTitle: 'Şablonu sil?',
    deleteMsg: 'Bu əməliyyat geri alına bilməz',
  },
  measurements: {
    title: 'Bədən ölçüləri',
    loading: 'Tarixçə yüklənir...',
    current: 'Cari',
    history: 'Tarixçə',
    change: 'Dəyişim',
    weightChange: 'Çəki dəyişimi',
    bodyChange: 'Bədən dəyişimi',
    daysAgo: 'Gün əvvəl',
    value: 'Dəyər',
    date: 'Tarix',
    edit: 'Düzənlə',
    delete: 'Sil',
    confirmDelete: 'Ölçünü sil?',
    confirmDeleteMsg: 'Bu əməliyyat geri alına bilməz',
    saveBtn: 'Ölçü saxla',
    emptyTitle: 'Ölçü yoxdur',
    emptyHistory: 'Tarixçə yoxdur',
    emptySubtitle: 'Tərəqqini izləmək üçün ilk ölçü əlavə edin',
    total: 'Ölçülər',
    weightLabel: 'Çəki',
    chestLabel: 'Döş',
    waistLabel: 'Bel',
    hipsLabel: 'Kalça',
    bicepsLabel: 'Biseps',
    thighLabel: 'Uylüq',
    neckLabel: 'Boyun',
    calfLabel: 'Baldır',
    bodyFatLabel: 'Yağ',
    progress: 'Tərəqqi',
    goal: 'Hədəf',
  },
  records: {
    title: 'Fərdi rekordlar',
    autoUpdate: 'Avtomatik yenilənir',
    loading: 'Rekordlar yüklənir...',
    all: 'Hamısı',
    strength: 'Güc',
    cardio: 'Kardio',
    endurance: 'Dözümlülük',
    noRecords: 'Rekord yoxdur',
    empty: 'Rekord yoxdur',
    emptyHint: 'Məşq tamamlandıqdan sonra rekordlar avtomatik əlavə olunur',
    total: 'Rekordlar',
    improved: 'Yaxşılaşdı',
    catAll: 'Hamısı',
    catStrength: 'Güc',
    catCardio: 'Kardio',
    catEndurance: 'Dözümlülük',
    record: 'Rekord',
    previous: 'Əvvəlki',
    progress: 'Tərəqqi',
    auto: 'Avto',
    addRecord: 'Rekord əlavə et',
    editRecord: 'Rekordu düzənlə',
    saveRecord: 'Rekordu saxla',
    exerciseName: 'Hərəkət',
    exercisePlaceholder: 'Hərəkətin adı',
    category: 'Kateqoriya',
    confirmDelete: 'Rekordu sil?',
    confirmDeleteMsg: 'Bu əməliyyat geri alına bilməz',
    oneRepMax: '1TM',
    volume: 'Həcm',
    totalSets: 'Yanaşmalar',
    kg: 'kq',
    reps: 'təkrar',
    min: 'dəq',
  },
  subscription: {
    title: 'Premium al',
    monthlyTitle: 'Aylıq abunə',
    yearlyTitle: 'İllik abunə',
    monthlyDesc: 'Bir aylıq bütün Premium üstünlüklər',
    yearlyDesc: 'İl üçün bütün Premium üstünlüklər (20% endirim)',
    bestValue: 'Ən yaxşı',
    year: 'il',
    month: 'ay',
    restore: 'Alışları bərpa et',
    loading: 'Abunələr yüklənir...',
    purchaseError: 'Alış xətası',
    restoreSuccess: 'Alışlar bərpa edildi',
    restoreEmpty: 'Aktiv alış tapılmadı',
    alreadyPremium: 'Artıq Premiuminiz var',
    feature1: 'Reytinq sistemi və nailiyyətlər',
    feature2: 'Bulud sinxronizasiyası',
    feature3: 'Ətraflı analitika',
    feature4: 'Məşqçi bazarı',
    feature5: 'FitEx Pass — zal abunəsi',
    cancelAnytime: 'İstənilən vaxt ləğv edin',
  },
  sync: {
    connecting: 'Qoşulur...',
    uploading: 'Məlumatlar yüklənir...',
    downloading: 'Məlumatlar alınır...',
    done: 'Sinxronlaşdırıldı',
    error: 'Sinxronizasiya xətası',
    connectingToServer: 'Serverə qoşulur...',
    sendingChanges: 'Dəyişikliklər göndərilir...',
    premiumRequired: 'Sinxronizasiya yalnız Premium üçündür',
    syncTitle: 'Sinxronizasiya',
    offlineMsg: 'İnternet bağlantısı yoxdur',
  },
  notifications: {
    workoutReminder: 'Bu günkü məşqi unutma — çox irəliləmisən!',
  },
  export: {
    dialogTitle: 'Fitex məlumatlarını ixrac et',
    dateHeader: 'Tarix',
    typeHeader: 'Növ',
    exercisesHeader: 'Hərəkətlər',
    setsHeader: 'Yanaşmalar',
    durationHeader: 'Müddət (dəq)',
    volumeHeader: 'Həcm (kq)',
    notesHeader: 'Qeydlər',
    nameHeader: 'Ad',
    valueHeader: 'Dəyər',
    unitHeader: 'Vahid',
    exerciseHeader: 'Hərəkət',
    maxWeightHeader: 'Maks. çəki (kq)',
    maxRepsHeader: 'Maks. təkrar',
    oneRepMaxHeader: '1TM (kq)',
  },
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
    success: 'Uğur',
    optional: 'isteğe bağlı',
    unknownError: 'Bir şeylər səhv getdi',
    delete: 'Sil',
    edit: 'Düzənlə',
    add: 'Əlavə et',
    confirm: 'Təsdiqlə',
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
    totalVolume: 'Ümumi çəki',
    muscleGrowth: 'Əzələ kütləsi artımı',
    massDecrease: 'Kütlə azalması',
    noChange: 'Dəyişiklik yoxdur',
    noStrengthRecords: 'Güc rekordu yoxdur',
    improved: 'Yaxşılaşma',
    decreased: 'Pisləşmə',
    stable: 'Sabit',
    enduranceGrowth: 'Dözümlülük artımı',
    enduranceDecrease: 'Dözümlülük azalması',
    enduranceStable: 'Sabit dözümlülük',
    avgDuration: 'Orta müddət',
    noWorkouts: 'Məşq yoxdur',
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
    workout1: 'məşq',
    workout2: 'məşq',
    workout5: 'məşq',
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
    reminderTime: 'Xatırlatma vaxtı',
    hours: 'Saatlar',
    minutes: 'Dəqiqələr',
    defaultUser: 'İstifadəçi',
  },
  trial: {
    badge: 'Pulsuz Sınaq',
    heroTitle: '30 Gün Pulsuz',
    heroSubtitle: 'Premium imkanlar tam açıq — 30 gün ödəniş yoxdur.\nBaşlamaq üçün ödəniş metodu tələb olunur.',
    days: 'gün',
    freeLabel: 'Pulsuz',
    featuresTitle: "Premium-a nə daxildir",
    choosePlan: 'Plan seçin',
    monthly: 'Aylıq abunəlik',
    yearly: 'İllik abunəlik',
    monthlyDesc: 'Sınaq müddəti bitdikdən sonra ödənilir',
    yearlySave: '20% endirim — daha sərfəli',
    cta: 'Pulsuz sınaqa başla',
    ctaSub: '30 gündən sonra tutulur · İstənilən vaxt ləğv edin',
    legal: 'Abunəlik avtomatik yenilənir. Sınaq müddəti başa çatmadan App Store / Google Play parametrlərindən ləğv edə bilərsiniz.',
    skipLink: 'Ödənişsiz davam et (məhdud giriş)',
    skipTitle: 'Məhdud Giriş',
    skipBody: 'Ödəniş metodu olmadan yalnız əsas funksiyalar mövcuddur. Reytinq, sinxronizasiya və analitika üçün abunəlik tələb olunur.',
    skipConfirm: 'Kartsız davam et',
    noReceipt: 'Alış qəbzi tapılmadı',
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
