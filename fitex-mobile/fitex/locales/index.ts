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
    repsShort: string
    volumeLabel: string
    maxLabel: string
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
    nameLabel: string
    descLabel: string
    durationLabel: string
    optionalSuffix: string
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
    // Stats page
    statsTitle: string
    lastSync: string
    neverSynced: string
    statusSuccess: string
    statusError: string
    statusNever: string
    syncedData: string
    pendingData: string
    workouts: string
    measurements: string
    records: string
    synced: string
    pending: string
    syncNow: string
    history: string
    historyEmpty: string
    dataBreakdown: string
    total: string
    inSync: string
    notSynced: string
    cloudInfo: string
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
    levelLabel: string
    premiumGateTitle: string
    premiumGateSubtitle: string
    premiumGateBtn: string
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
    achPageTitle: string
    viewAll: string
    earned: string
    locked: string
    progress: string
    catAll: string
    catIntensity: string
    catTime: string
    catScore: string
    catTier: string
    catSpecial: string
    tierBeginner: string
    tierBronze: string
    tierSilver: string
    tierGold: string
    tierPlatinum: string
    tierElite: string
    pts: string
    kg: string
    days: string
    min: string
    premiumGateTitle: string
    premiumGateSubtitle: string
    premiumGateBtn: string
    // workouts
    ach_workouts_1_title: string;     ach_workouts_1_desc: string
    ach_workouts_5_title: string;     ach_workouts_5_desc: string
    ach_workouts_10_title: string;    ach_workouts_10_desc: string
    ach_workouts_25_title: string;    ach_workouts_25_desc: string
    ach_workouts_50_title: string;    ach_workouts_50_desc: string
    ach_workouts_75_title: string;    ach_workouts_75_desc: string
    ach_workouts_100_title: string;   ach_workouts_100_desc: string
    ach_workouts_200_title: string;   ach_workouts_200_desc: string
    ach_workouts_300_title: string;   ach_workouts_300_desc: string
    ach_workouts_365_title: string;   ach_workouts_365_desc: string
    ach_workouts_500_title: string;   ach_workouts_500_desc: string
    ach_workouts_750_title: string;   ach_workouts_750_desc: string
    ach_workouts_1000_title: string;  ach_workouts_1000_desc: string
    // streak
    ach_streak_3_title: string;    ach_streak_3_desc: string
    ach_streak_7_title: string;    ach_streak_7_desc: string
    ach_streak_14_title: string;   ach_streak_14_desc: string
    ach_streak_21_title: string;   ach_streak_21_desc: string
    ach_streak_30_title: string;   ach_streak_30_desc: string
    ach_streak_45_title: string;   ach_streak_45_desc: string
    ach_streak_60_title: string;   ach_streak_60_desc: string
    ach_streak_90_title: string;   ach_streak_90_desc: string
    ach_streak_180_title: string;  ach_streak_180_desc: string
    ach_streak_365_title: string;  ach_streak_365_desc: string
    // volume
    ach_volume_500_title: string;   ach_volume_500_desc: string
    ach_volume_1k_title: string;    ach_volume_1k_desc: string
    ach_volume_2500_title: string;  ach_volume_2500_desc: string
    ach_volume_5k_title: string;    ach_volume_5k_desc: string
    ach_volume_10k_title: string;   ach_volume_10k_desc: string
    ach_volume_25k_title: string;   ach_volume_25k_desc: string
    ach_volume_50k_title: string;   ach_volume_50k_desc: string
    ach_volume_100k_title: string;  ach_volume_100k_desc: string
    ach_volume_250k_title: string;  ach_volume_250k_desc: string
    ach_volume_500k_title: string;  ach_volume_500k_desc: string
    // sets
    ach_sets_25_title: string;     ach_sets_25_desc: string
    ach_sets_50_title: string;     ach_sets_50_desc: string
    ach_sets_100_title: string;    ach_sets_100_desc: string
    ach_sets_250_title: string;    ach_sets_250_desc: string
    ach_sets_500_title: string;    ach_sets_500_desc: string
    ach_sets_1000_title: string;   ach_sets_1000_desc: string
    ach_sets_2500_title: string;   ach_sets_2500_desc: string
    ach_sets_5000_title: string;   ach_sets_5000_desc: string
    ach_sets_10000_title: string;  ach_sets_10000_desc: string
    // records
    ach_pr_1_title: string;    ach_pr_1_desc: string
    ach_pr_5_title: string;    ach_pr_5_desc: string
    ach_pr_10_title: string;   ach_pr_10_desc: string
    ach_pr_20_title: string;   ach_pr_20_desc: string
    ach_pr_30_title: string;   ach_pr_30_desc: string
    ach_pr_50_title: string;   ach_pr_50_desc: string
    ach_pr_75_title: string;   ach_pr_75_desc: string
    ach_pr_100_title: string;  ach_pr_100_desc: string
    // duration
    ach_duration_20_title: string;   ach_duration_20_desc: string
    ach_duration_30_title: string;   ach_duration_30_desc: string
    ach_duration_45_title: string;   ach_duration_45_desc: string
    ach_duration_60_title: string;   ach_duration_60_desc: string
    ach_duration_75_title: string;   ach_duration_75_desc: string
    ach_duration_90_title: string;   ach_duration_90_desc: string
    ach_duration_120_title: string;  ach_duration_120_desc: string
    // time
    ach_time_5h_title: string;    ach_time_5h_desc: string
    ach_time_10h_title: string;   ach_time_10h_desc: string
    ach_time_25h_title: string;   ach_time_25h_desc: string
    ach_time_50h_title: string;   ach_time_50h_desc: string
    ach_time_100h_title: string;  ach_time_100h_desc: string
    ach_time_200h_title: string;  ach_time_200h_desc: string
    ach_time_500h_title: string;  ach_time_500h_desc: string
    // score
    ach_score_100_title: string;   ach_score_100_desc: string
    ach_score_500_title: string;   ach_score_500_desc: string
    ach_score_1k_title: string;    ach_score_1k_desc: string
    ach_score_2500_title: string;  ach_score_2500_desc: string
    ach_score_5k_title: string;    ach_score_5k_desc: string
    ach_score_10k_title: string;   ach_score_10k_desc: string
    ach_score_25k_title: string;   ach_score_25k_desc: string
    ach_score_50k_title: string;   ach_score_50k_desc: string
    // tier
    ach_tier_bronze_title: string;    ach_tier_bronze_desc: string
    ach_tier_silver_title: string;    ach_tier_silver_desc: string
    ach_tier_gold_title: string;      ach_tier_gold_desc: string
    ach_tier_platinum_title: string;  ach_tier_platinum_desc: string
    ach_tier_elite_title: string;     ach_tier_elite_desc: string
    // intensity
    ach_avg_vol_500_title: string;  ach_avg_vol_500_desc: string
    ach_avg_vol_1k_title: string;   ach_avg_vol_1k_desc: string
    ach_avg_vol_2k_title: string;   ach_avg_vol_2k_desc: string
    ach_avg_sets_8_title: string;   ach_avg_sets_8_desc: string
    ach_avg_sets_15_title: string;  ach_avg_sets_15_desc: string
    ach_avg_sets_25_title: string;  ach_avg_sets_25_desc: string
    // special
    ach_devoted_title: string;       ach_devoted_desc: string
    ach_iron_man_title: string;      ach_iron_man_desc: string
    ach_powerhouse_title: string;    ach_powerhouse_desc: string
    ach_champion_title: string;      ach_champion_desc: string
    ach_legend_title: string;        ach_legend_desc: string
    ach_all_rounder_title: string;   ach_all_rounder_desc: string
    ach_pr_hunter_title: string;     ach_pr_hunter_desc: string
    ach_consistent_title: string;    ach_consistent_desc: string
    ach_volume_king_title: string;   ach_volume_king_desc: string
    ach_marathon_man_title: string;  ach_marathon_man_desc: string
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
    unitCm: string
  }
  upsell: {
    title: string
    titleTrial: string
    subtitle: string
    featureSync: string
    featureAnalytics: string
    featureRecovery: string
    featureRating: string
    featureLeaderboard: string
    cta: string
    later: string
  }
  leaderboard: {
    title: string
    subtitle: string
    myRank: string
    rank: string
    score: string
    workouts: string
    volume: string
    streak: string
    you: string
    noData: string
    noDataSub: string
    premium: string
    topPlayers: string
    syncHint: string
  }
  languageSelect: {
    title: string
    subtitle: string
    continue: string
  }
  login: {
    subtitle: string
    signInGoogle: string
    signInEmail: string
    terms: string
  }
  register: {
    title: string
    subtitle: string
    firstName: string
    lastName: string
    email: string
    password: string
    confirmPassword: string
    submit: string
    haveAccount: string
    signIn: string
    passwordMismatch: string
    passwordTooShort: string
    successTitle: string
    successMessage: string
  }
  verify: {
    title: string
    subtitle: string
    codeSent: string
    code: string
    submit: string
    resend: string
    resendIn: string
    wrongEmail: string
  }
  emailLogin: {
    title: string
    subtitle: string
    email: string
    password: string
    submit: string
    noAccount: string
    register: string
    forgotPassword: string
    resetTitle: string
    resetSubtitle: string
    resetCode: string
    newPassword: string
    resetSubmit: string
    backToLogin: string
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
    fullyRecovered: string
    timeLeft: string
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
    ctaNew: string
    ctaNewSub: string
    legal: string
    skipLink: string
    skipLimited: string
    termsLink: string
    privacyLink: string
    skipTitle: string
    skipBody: string
    skipConfirm: string
    noReceipt: string
    timelineCard: string
    timelineCardDesc: string
    timelineDays: string
    timelineFree: string
    timelineCharge: string
    timelineChargeDesc: string
    noChargeToday: string
    trialFreeLabel: string
    thenPay: string
    free: string
    yearShort: string
    monthShort: string
    storeUnavailable: string
    androidOfferMissing: string
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
    repsShort: 'пов',
    volumeLabel: 'объём',
    maxLabel: 'макс',
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
    nameLabel: 'Название',
    descLabel: 'Описание',
    durationLabel: 'Длительность (мин)',
    optionalSuffix: '(опционально)',
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
    feature1: 'Рейтинг, уровни и 100+ достижений',
    feature2: 'Синхронизация с облаком',
    feature3: 'Расширенная аналитика и графики',
    feature4: 'Таблица лидеров — сравни себя с другими',
    feature5: 'Отслеживание восстановления мышц',
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
    statsTitle: 'Синхронизация',
    lastSync: 'Последняя синхронизация',
    neverSynced: 'Ещё не синхронизировано',
    statusSuccess: 'Успешно',
    statusError: 'Ошибка',
    statusNever: 'Никогда',
    syncedData: 'Синхронизированные данные',
    pendingData: 'Ожидают синхронизации',
    workouts: 'Тренировки',
    measurements: 'Замеры тела',
    records: 'Личные рекорды',
    synced: 'Синхр.',
    pending: 'Ожидают',
    syncNow: 'Синхронизировать сейчас',
    history: 'История синхронизаций',
    historyEmpty: 'История пуста',
    dataBreakdown: 'Статус данных',
    total: 'Всего',
    inSync: 'В облаке',
    notSynced: 'Не синхр.',
    cloudInfo: 'Данные хранятся на сервере FitEx и доступны со всех ваших устройств',
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
    levelLabel: 'Уровень',
    premiumGateTitle: 'Доступно только Premium',
    premiumGateSubtitle: 'Рейтинги, уровни, достижения, лидерборд и синхронизация — всё в одной подписке.',
    premiumGateBtn: 'Открыть Premium',
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
    achPageTitle: 'Все достижения',
    viewAll: 'Смотреть все',
    earned: 'получено',
    locked: 'заблок.',
    progress: 'Прогресс',
    catAll: 'Все',
    catIntensity: 'Интенсивность',
    catTime: 'Время',
    catScore: 'Очки',
    catTier: 'Ранг',
    catSpecial: 'Особые',
    tierBeginner: 'Новичок',
    tierBronze: 'Бронза',
    tierSilver: 'Серебро',
    tierGold: 'Золото',
    tierPlatinum: 'Платина',
    tierElite: 'Элита',
    pts: 'оч.',
    kg: 'кг',
    days: 'дн.',
    min: 'мин',
    premiumGateTitle: 'Рейтинг — только для Premium',
    premiumGateSubtitle: 'Отслеживайте уровень, достижения и разбивку очков с Premium-доступом',
    premiumGateBtn: 'Получить Premium',
    ach_workouts_1_title: 'Первый шаг',            ach_workouts_1_desc: 'Выполни первую тренировку',
    ach_workouts_5_title: 'В форме',               ach_workouts_5_desc: '5 тренировок выполнено',
    ach_workouts_10_title: 'Начало пути',          ach_workouts_10_desc: '10 тренировок выполнено',
    ach_workouts_25_title: 'Стабильность',         ach_workouts_25_desc: '25 тренировок выполнено',
    ach_workouts_50_title: 'Полвека',              ach_workouts_50_desc: '50 тренировок выполнено',
    ach_workouts_75_title: 'Неустрашимый',         ach_workouts_75_desc: '75 тренировок выполнено',
    ach_workouts_100_title: 'Центурия',            ach_workouts_100_desc: '100 тренировок выполнено',
    ach_workouts_200_title: 'Двойная сотня',       ach_workouts_200_desc: '200 тренировок выполнено',
    ach_workouts_300_title: 'Железная дисциплина', ach_workouts_300_desc: '300 тренировок выполнено',
    ach_workouts_365_title: 'Год силы',            ach_workouts_365_desc: '365 тренировок — настоящий атлет',
    ach_workouts_500_title: 'Пятьсот',             ach_workouts_500_desc: '500 тренировок выполнено',
    ach_workouts_750_title: 'Элитный спортсмен',   ach_workouts_750_desc: '750 тренировок выполнено',
    ach_workouts_1000_title: 'Легенда',            ach_workouts_1000_desc: '1000 тренировок — ты легенда',
    ach_streak_3_title: 'Горячий старт',       ach_streak_3_desc: '3 дня тренировок подряд',
    ach_streak_7_title: 'Неделя огня',         ach_streak_7_desc: '7 дней подряд',
    ach_streak_14_title: 'Две недели',         ach_streak_14_desc: '14 дней подряд',
    ach_streak_21_title: 'Привычка',           ach_streak_21_desc: '21 день — привычка сформирована',
    ach_streak_30_title: 'Месяц молнии',       ach_streak_30_desc: '30 дней подряд',
    ach_streak_45_title: 'Неудержимый',        ach_streak_45_desc: '45 дней подряд',
    ach_streak_60_title: 'Два месяца',         ach_streak_60_desc: '60 дней подряд',
    ach_streak_90_title: 'Непреодолимый',      ach_streak_90_desc: '90 дней подряд',
    ach_streak_180_title: 'Полгода в деле',    ach_streak_180_desc: '180 дней подряд',
    ach_streak_365_title: 'Год без остановок', ach_streak_365_desc: '365 дней подряд — ты непобедим',
    ach_volume_500_title: 'Тяжёлый подъём',    ach_volume_500_desc: 'Суммарный объём 500 кг',
    ach_volume_1k_title: 'Тонный рубеж',       ach_volume_1k_desc: 'Суммарный объём 1 000 кг',
    ach_volume_2500_title: 'Сильное тело',     ach_volume_2500_desc: 'Суммарный объём 2 500 кг',
    ach_volume_5k_title: 'Мощный',             ach_volume_5k_desc: 'Суммарный объём 5 000 кг',
    ach_volume_10k_title: 'Железная воля',     ach_volume_10k_desc: 'Суммарный объём 10 000 кг',
    ach_volume_25k_title: 'Титан',             ach_volume_25k_desc: 'Суммарный объём 25 000 кг',
    ach_volume_50k_title: 'Атлант',            ach_volume_50k_desc: 'Суммарный объём 50 000 кг',
    ach_volume_100k_title: 'Геркулес',         ach_volume_100k_desc: 'Суммарный объём 100 000 кг',
    ach_volume_250k_title: 'Колосс',           ach_volume_250k_desc: 'Суммарный объём 250 000 кг',
    ach_volume_500k_title: 'Бог силы',         ach_volume_500k_desc: 'Суммарный объём 500 000 кг',
    ach_sets_25_title: 'Стартовый набор',      ach_sets_25_desc: '25 подходов выполнено',
    ach_sets_50_title: 'Пятьдесят',            ach_sets_50_desc: '50 подходов выполнено',
    ach_sets_100_title: 'Сотня подходов',      ach_sets_100_desc: '100 подходов выполнено',
    ach_sets_250_title: 'Упорный',             ach_sets_250_desc: '250 подходов выполнено',
    ach_sets_500_title: 'Пятьсот подходов',    ach_sets_500_desc: '500 подходов выполнено',
    ach_sets_1000_title: 'Тысячный рубеж',     ach_sets_1000_desc: '1 000 подходов выполнено',
    ach_sets_2500_title: 'Машина',             ach_sets_2500_desc: '2 500 подходов выполнено',
    ach_sets_5000_title: 'Неудержимый',        ach_sets_5000_desc: '5 000 подходов выполнено',
    ach_sets_10000_title: 'Клуб 10 000',       ach_sets_10000_desc: '10 000 подходов выполнено',
    ach_pr_1_title: 'Первый рекорд',           ach_pr_1_desc: 'Установи первый личный рекорд',
    ach_pr_5_title: 'Охотник за рекордами',    ach_pr_5_desc: '5 личных рекордов',
    ach_pr_10_title: 'Рекордсмен',             ach_pr_10_desc: '10 личных рекордов',
    ach_pr_20_title: 'Разрушитель пределов',   ach_pr_20_desc: '20 личных рекордов',
    ach_pr_30_title: 'Атлет высшего класса',   ach_pr_30_desc: '30 личных рекордов',
    ach_pr_50_title: 'Элитный результат',      ach_pr_50_desc: '50 личных рекордов',
    ach_pr_75_title: 'Легенда рекордов',       ach_pr_75_desc: '75 личных рекордов',
    ach_pr_100_title: 'Вечные рекорды',        ach_pr_100_desc: '100 личных рекордов',
    ach_duration_20_title: 'Активный старт',       ach_duration_20_desc: 'Средняя тренировка 20+ мин',
    ach_duration_30_title: '30-минутный атлет',    ach_duration_30_desc: 'Средняя тренировка 30+ мин',
    ach_duration_45_title: 'Серьёзный тренинг',    ach_duration_45_desc: 'Средняя тренировка 45+ мин',
    ach_duration_60_title: 'Час силы',             ach_duration_60_desc: 'Средняя тренировка 60+ мин',
    ach_duration_75_title: 'Расширенный сеанс',    ach_duration_75_desc: 'Средняя тренировка 75+ мин',
    ach_duration_90_title: 'Мастер полутора часов',ach_duration_90_desc: 'Средняя тренировка 90+ мин',
    ach_duration_120_title: 'Двухчасовой марафон', ach_duration_120_desc: 'Средняя тренировка 2+ часа',
    ach_time_5h_title: 'Инвестор времени',    ach_time_5h_desc: 'Суммарно 5 часов тренировок',
    ach_time_10h_title: 'Преданный делу',     ach_time_10h_desc: 'Суммарно 10 часов тренировок',
    ach_time_25h_title: 'Четверть сотни',     ach_time_25h_desc: 'Суммарно 25 часов тренировок',
    ach_time_50h_title: 'Пятьдесят часов',   ach_time_50h_desc: 'Суммарно 50 часов тренировок',
    ach_time_100h_title: 'Сотня часов',      ach_time_100h_desc: 'Суммарно 100 часов тренировок',
    ach_time_200h_title: 'Двести часов',     ach_time_200h_desc: 'Суммарно 200 часов тренировок',
    ach_time_500h_title: 'Пятьсот часов',   ach_time_500h_desc: 'Суммарно 500 часов тренировок',
    ach_score_100_title: 'Первые очки',        ach_score_100_desc: '100 очков рейтинга',
    ach_score_500_title: 'Охотник за очками',  ach_score_500_desc: '500 очков рейтинга',
    ach_score_1k_title: 'Тысяча очков',       ach_score_1k_desc: '1 000 очков рейтинга',
    ach_score_2500_title: 'Восходящая звезда', ach_score_2500_desc: '2 500 очков рейтинга',
    ach_score_5k_title: 'Высококлассный',      ach_score_5k_desc: '5 000 очков рейтинга',
    ach_score_10k_title: 'Мастер очков',       ach_score_10k_desc: '10 000 очков рейтинга',
    ach_score_25k_title: 'Элитный рейтинг',    ach_score_25k_desc: '25 000 очков рейтинга',
    ach_score_50k_title: 'Легендарный рейтинг',ach_score_50k_desc: '50 000 очков рейтинга',
    ach_tier_bronze_title: 'Бронзовый воин',   ach_tier_bronze_desc: 'Достигнут уровень Бронза',
    ach_tier_silver_title: 'Серебряный атлет', ach_tier_silver_desc: 'Достигнут уровень Серебро',
    ach_tier_gold_title: 'Золотой чемпион',    ach_tier_gold_desc: 'Достигнут уровень Золото',
    ach_tier_platinum_title: 'Платиновый',     ach_tier_platinum_desc: 'Достигнут уровень Платина',
    ach_tier_elite_title: 'Легенда элиты',     ach_tier_elite_desc: 'Достигнут уровень Элита',
    ach_avg_vol_500_title: 'Твёрдая основа',   ach_avg_vol_500_desc: 'Среднее 500+ кг за тренировку',
    ach_avg_vol_1k_title: 'Силовой работяга',  ach_avg_vol_1k_desc: 'Среднее 1 000+ кг за тренировку',
    ach_avg_vol_2k_title: 'Сила природы',      ach_avg_vol_2k_desc: 'Среднее 2 000+ кг за тренировку',
    ach_avg_sets_8_title: 'Структурный тренинг',ach_avg_sets_8_desc: 'Среднее 8+ подходов за тренировку',
    ach_avg_sets_15_title: 'Высокий объём',    ach_avg_sets_15_desc: 'Среднее 15+ подходов за тренировку',
    ach_avg_sets_25_title: 'Мастер объёма',    ach_avg_sets_25_desc: 'Среднее 25+ подходов за тренировку',
    ach_devoted_title: 'Преданный атлет',         ach_devoted_desc: '50+ тренировок и серия 30+ дней',
    ach_iron_man_title: 'Железный человек',        ach_iron_man_desc: '200+ тренировок и 60+ мин в среднем',
    ach_powerhouse_title: 'Силовая станция',       ach_powerhouse_desc: '50 000+ кг объёма и 2 500+ подходов',
    ach_champion_title: 'Чемпион',                 ach_champion_desc: '10 000+ очков и 25+ рекордов',
    ach_legend_title: 'Легенда',                   ach_legend_desc: '365+ тренировок и серия 180+ дней',
    ach_all_rounder_title: 'Универсальный атлет',  ach_all_rounder_desc: 'Топ по всем показателям',
    ach_pr_hunter_title: 'Охотник за рекордами',   ach_pr_hunter_desc: '25+ рекордов и 50+ тренировок',
    ach_consistent_title: 'Последовательный',      ach_consistent_desc: '100+ тренировок и 45+ мин в среднем',
    ach_volume_king_title: 'Король объёма',        ach_volume_king_desc: '100 000+ кг и 200+ тренировок',
    ach_marathon_man_title: 'Марафонец',           ach_marathon_man_desc: '50 тренировок и 50+ суммарных часов',
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
    unitCm: 'см',
  },
  upsell: {
    title: 'Разблокируй FitEx Premium',
    titleTrial: 'дн. осталось в пробном периоде',
    subtitle: 'Рейтинг, достижения, лидерборд, синхронизация и многое другое.',
    featureSync: 'Синхронизация',
    featureAnalytics: 'Аналитика',
    featureRecovery: 'Восстановление',
    featureRating: 'Рейтинг',
    featureLeaderboard: 'Лидерборд',
    cta: 'Получить Premium →',
    later: 'Позже',
  },
  leaderboard: {
    title: 'Таблица лидеров',
    subtitle: 'Топ спортсменов FitEx',
    myRank: 'Мой ранг',
    rank: 'Ранг',
    score: 'Очки',
    workouts: 'Трен.',
    volume: 'Объём',
    streak: 'Серия',
    you: 'Вы',
    noData: 'Нет данных',
    noDataSub: 'Синхронизируйте тренировки чтобы попасть в рейтинг',
    premium: 'Premium',
    topPlayers: 'Топ игроков',
    syncHint: 'Синхронизируйте данные чтобы обновить рейтинг',
  },
  languageSelect: {
    title: 'Выберите язык',
    subtitle: 'Выберите язык для работы с приложением',
    continue: 'Продолжить',
  },
  login: {
    subtitle: 'Войди, чтобы сохранять прогресс',
    signInGoogle: 'Войти через Google',
    signInEmail: 'Войти по Email',
    terms: 'Продолжая, вы соглашаетесь с Условиями использования и Политикой конфиденциальности',
  },
  register: {
    title: 'Создать аккаунт',
    subtitle: 'Начни свой фитнес путь',
    firstName: 'Имя',
    lastName: 'Фамилия (необязательно)',
    email: 'Email',
    password: 'Пароль',
    confirmPassword: 'Подтвердите пароль',
    submit: 'Создать аккаунт',
    haveAccount: 'Уже есть аккаунт?',
    signIn: 'Войти',
    passwordMismatch: 'Пароли не совпадают',
    passwordTooShort: 'Пароль должен быть минимум 6 символов',
    successTitle: 'Проверьте почту',
    successMessage: 'Мы отправили код подтверждения на',
  },
  verify: {
    title: 'Подтверждение Email',
    subtitle: 'Введите 6-значный код из письма',
    codeSent: 'Код отправлен на',
    code: 'Код подтверждения',
    submit: 'Подтвердить',
    resend: 'Отправить заново',
    resendIn: 'Повтор через',
    wrongEmail: 'Неверный email?',
  },
  emailLogin: {
    title: 'Войти',
    subtitle: 'Введите данные аккаунта',
    email: 'Email',
    password: 'Пароль',
    submit: 'Войти',
    noAccount: 'Нет аккаунта?',
    register: 'Зарегистрироваться',
    forgotPassword: 'Забыли пароль?',
    resetTitle: 'Сбросить пароль',
    resetSubtitle: 'Введите код из письма и новый пароль',
    resetCode: 'Код из письма',
    newPassword: 'Новый пароль',
    resetSubmit: 'Сбросить пароль',
    backToLogin: 'Вернуться ко входу',
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
    fullyRecovered: 'Восстановлен',
    timeLeft: 'Осталось',
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
    ctaNew: 'Привязать карту · 30 дней бесплатно',
    ctaNewSub: 'Первое списание только через 30 дней',
    legal: 'Подписка автоматически продлевается. Вы можете отменить её в настройках App Store / Google Play в любое время до окончания пробного периода.',
    skipLink: 'Попробовать без карты (ограниченный доступ)',
    skipLimited: 'Продолжить с ограниченным доступом',
    termsLink: 'Условия использования',
    privacyLink: 'Политика конфиденциальности',
    timelineCard: 'Сегодня',
    timelineCardDesc: 'Привязываешь карту',
    timelineDays: 'дней',
    timelineFree: 'Полный Premium бесплатно',
    timelineCharge: 'День 31',
    timelineChargeDesc: 'Первое списание',
    noChargeToday: 'Сегодня с карты ничего не снимается',
    trialFreeLabel: '30 дней бесплатно',
    thenPay: 'Затем',
    free: 'FREE',
    yearShort: 'год',
    monthShort: 'мес',
    storeUnavailable:
      'Подписки не загрузились из App Store. Проверьте интернет, соглашения Paid Apps в App Store Connect и на устройстве: Настройки → App Store → Sandbox (для TestFlight).',
    androidOfferMissing: 'Не найден offer token для подписки в Google Play. Проверьте базовый план в консоли.',
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
    repsShort: 'reps',
    volumeLabel: 'vol',
    maxLabel: 'max',
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
    nameLabel: 'Name',
    descLabel: 'Description',
    durationLabel: 'Duration (min)',
    optionalSuffix: '(optional)',
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
    feature1: 'Ratings, levels & 100+ achievements',
    feature2: 'Cloud sync across devices',
    feature3: 'Advanced analytics & charts',
    feature4: 'Leaderboard — compete with others',
    feature5: 'Muscle recovery tracking',
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
    statsTitle: 'Sync',
    lastSync: 'Last Sync',
    neverSynced: 'Never synced',
    statusSuccess: 'Success',
    statusError: 'Error',
    statusNever: 'Never',
    syncedData: 'Synced Data',
    pendingData: 'Pending',
    workouts: 'Workouts',
    measurements: 'Body Measurements',
    records: 'Personal Records',
    synced: 'Synced',
    pending: 'Pending',
    syncNow: 'Sync Now',
    history: 'Sync History',
    historyEmpty: 'No history yet',
    dataBreakdown: 'Data Status',
    total: 'Total',
    inSync: 'In Cloud',
    notSynced: 'Not Synced',
    cloudInfo: 'Your data is stored on FitEx servers and available across all your devices',
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
    levelLabel: 'Level',
    premiumGateTitle: 'Premium Only',
    premiumGateSubtitle: 'Ratings, levels, achievements, leaderboard and cloud sync — all in one subscription.',
    premiumGateBtn: 'Unlock Premium',
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
    achPageTitle: 'All Achievements',
    viewAll: 'View all',
    earned: 'earned',
    locked: 'locked',
    progress: 'Progress',
    catAll: 'All',
    catIntensity: 'Intensity',
    catTime: 'Time',
    catScore: 'Score',
    catTier: 'Tier',
    catSpecial: 'Special',
    tierBeginner: 'Beginner',
    tierBronze: 'Bronze',
    tierSilver: 'Silver',
    tierGold: 'Gold',
    tierPlatinum: 'Platinum',
    tierElite: 'Elite',
    pts: 'pts',
    kg: 'kg',
    days: 'days',
    min: 'min',
    premiumGateTitle: 'Rating is Premium only',
    premiumGateSubtitle: 'Track your level, achievements and score breakdown with Premium access',
    premiumGateBtn: 'Get Premium',
    ach_workouts_1_title: 'First Step',              ach_workouts_1_desc: 'Complete your first workout',
    ach_workouts_5_title: 'Getting Fit',             ach_workouts_5_desc: '5 workouts completed',
    ach_workouts_10_title: 'Getting Started',        ach_workouts_10_desc: '10 workouts completed',
    ach_workouts_25_title: 'Consistent',             ach_workouts_25_desc: '25 workouts completed',
    ach_workouts_50_title: 'Half-Century',           ach_workouts_50_desc: '50 workouts completed',
    ach_workouts_75_title: 'Relentless',             ach_workouts_75_desc: '75 workouts completed',
    ach_workouts_100_title: 'Century',               ach_workouts_100_desc: '100 workouts completed',
    ach_workouts_200_title: 'Double Century',        ach_workouts_200_desc: '200 workouts completed',
    ach_workouts_300_title: 'Iron Discipline',       ach_workouts_300_desc: '300 workouts completed',
    ach_workouts_365_title: 'Year-Round Athlete',    ach_workouts_365_desc: '365 workouts — a true athlete',
    ach_workouts_500_title: 'Five Hundred',          ach_workouts_500_desc: '500 workouts completed',
    ach_workouts_750_title: 'Elite Athlete',         ach_workouts_750_desc: '750 workouts completed',
    ach_workouts_1000_title: 'Legend',               ach_workouts_1000_desc: '1000 workouts — you are a legend',
    ach_streak_3_title: 'Hot Start',             ach_streak_3_desc: '3 consecutive training days',
    ach_streak_7_title: 'Week on Fire',          ach_streak_7_desc: '7 days in a row',
    ach_streak_14_title: 'Two Weeks Strong',     ach_streak_14_desc: '14 days in a row',
    ach_streak_21_title: 'Habit Builder',        ach_streak_21_desc: '21 days — habit formed',
    ach_streak_30_title: 'Lightning Month',      ach_streak_30_desc: '30 days in a row',
    ach_streak_45_title: 'Unstoppable',          ach_streak_45_desc: '45 days in a row',
    ach_streak_60_title: 'Two Month Streak',     ach_streak_60_desc: '60 days in a row',
    ach_streak_90_title: 'Unstoppable Force',    ach_streak_90_desc: '90 days in a row',
    ach_streak_180_title: 'Half Year Grind',     ach_streak_180_desc: '180 days in a row',
    ach_streak_365_title: 'Full Year Streak',    ach_streak_365_desc: '365 days in a row — unbeatable',
    ach_volume_500_title: 'Heavy Lifter',        ach_volume_500_desc: 'Total volume 500 kg',
    ach_volume_1k_title: 'Ton Milestone',        ach_volume_1k_desc: 'Total volume 1,000 kg',
    ach_volume_2500_title: 'Strong Body',        ach_volume_2500_desc: 'Total volume 2,500 kg',
    ach_volume_5k_title: 'Power House',          ach_volume_5k_desc: 'Total volume 5,000 kg',
    ach_volume_10k_title: 'Iron Will',           ach_volume_10k_desc: 'Total volume 10,000 kg',
    ach_volume_25k_title: 'Titan',               ach_volume_25k_desc: 'Total volume 25,000 kg',
    ach_volume_50k_title: 'Atlas',               ach_volume_50k_desc: 'Total volume 50,000 kg',
    ach_volume_100k_title: 'Herculean',          ach_volume_100k_desc: 'Total volume 100,000 kg',
    ach_volume_250k_title: 'Colossus',           ach_volume_250k_desc: 'Total volume 250,000 kg',
    ach_volume_500k_title: 'God of Strength',    ach_volume_500k_desc: 'Total volume 500,000 kg',
    ach_sets_25_title: 'Starter Pack',           ach_sets_25_desc: '25 sets completed',
    ach_sets_50_title: 'Fifty Moves',            ach_sets_50_desc: '50 sets completed',
    ach_sets_100_title: 'Century Set',           ach_sets_100_desc: '100 sets completed',
    ach_sets_250_title: 'Grinder',               ach_sets_250_desc: '250 sets completed',
    ach_sets_500_title: 'Five Hundred Sets',     ach_sets_500_desc: '500 sets completed',
    ach_sets_1000_title: 'Milestone',            ach_sets_1000_desc: '1,000 sets completed',
    ach_sets_2500_title: 'Machine',              ach_sets_2500_desc: '2,500 sets completed',
    ach_sets_5000_title: 'Powerhouse',           ach_sets_5000_desc: '5,000 sets completed',
    ach_sets_10000_title: 'Ten Thousand Club',   ach_sets_10000_desc: '10,000 sets completed',
    ach_pr_1_title: 'First Record',              ach_pr_1_desc: 'Set your first personal record',
    ach_pr_5_title: 'Record Seeker',             ach_pr_5_desc: '5 personal records',
    ach_pr_10_title: 'Record Maker',             ach_pr_10_desc: '10 personal records',
    ach_pr_20_title: 'Breaking Limits',          ach_pr_20_desc: '20 personal records',
    ach_pr_30_title: 'Performance Beast',        ach_pr_30_desc: '30 personal records',
    ach_pr_50_title: 'Elite Performer',          ach_pr_50_desc: '50 personal records',
    ach_pr_75_title: 'Record Legend',            ach_pr_75_desc: '75 personal records',
    ach_pr_100_title: 'Immortal Records',        ach_pr_100_desc: '100 personal records',
    ach_duration_20_title: 'Active Starter',        ach_duration_20_desc: 'Average workout 20+ min',
    ach_duration_30_title: 'Thirty-Minute Athlete', ach_duration_30_desc: 'Average workout 30+ min',
    ach_duration_45_title: 'Serious Training',      ach_duration_45_desc: 'Average workout 45+ min',
    ach_duration_60_title: 'Hour Strong',           ach_duration_60_desc: 'Average workout 60+ min',
    ach_duration_75_title: 'Extended Session',      ach_duration_75_desc: 'Average workout 75+ min',
    ach_duration_90_title: 'Ninety-Min Master',     ach_duration_90_desc: 'Average workout 90+ min',
    ach_duration_120_title: 'Two-Hour Grind',       ach_duration_120_desc: 'Average workout 2+ hours',
    ach_time_5h_title: 'Time Investor',      ach_time_5h_desc: '5 total hours of training',
    ach_time_10h_title: 'Dedicated',         ach_time_10h_desc: '10 total hours of training',
    ach_time_25h_title: 'Quarter Hundred',   ach_time_25h_desc: '25 total hours of training',
    ach_time_50h_title: 'Fifty Hours',       ach_time_50h_desc: '50 total hours of training',
    ach_time_100h_title: 'Century of Hours', ach_time_100h_desc: '100 total hours of training',
    ach_time_200h_title: 'Two Hundred Hours',ach_time_200h_desc: '200 total hours of training',
    ach_time_500h_title: 'Five Hundred Hours',ach_time_500h_desc: '500 total hours of training',
    ach_score_100_title: 'First Points',        ach_score_100_desc: '100 rating points',
    ach_score_500_title: 'Point Collector',     ach_score_500_desc: '500 rating points',
    ach_score_1k_title: 'Thousand Points',      ach_score_1k_desc: '1,000 rating points',
    ach_score_2500_title: 'Rising Star',        ach_score_2500_desc: '2,500 rating points',
    ach_score_5k_title: 'High Scorer',          ach_score_5k_desc: '5,000 rating points',
    ach_score_10k_title: 'Points Master',       ach_score_10k_desc: '10,000 rating points',
    ach_score_25k_title: 'Elite Scorer',        ach_score_25k_desc: '25,000 rating points',
    ach_score_50k_title: 'Legendary Score',     ach_score_50k_desc: '50,000 rating points',
    ach_tier_bronze_title: 'Bronze Warrior',    ach_tier_bronze_desc: 'Reached Bronze tier',
    ach_tier_silver_title: 'Silver Athlete',    ach_tier_silver_desc: 'Reached Silver tier',
    ach_tier_gold_title: 'Gold Champion',       ach_tier_gold_desc: 'Reached Gold tier',
    ach_tier_platinum_title: 'Platinum Elite',  ach_tier_platinum_desc: 'Reached Platinum tier',
    ach_tier_elite_title: 'Elite Legend',       ach_tier_elite_desc: 'Reached Elite tier',
    ach_avg_vol_500_title: 'Solid Foundation',   ach_avg_vol_500_desc: 'Average 500+ kg per workout',
    ach_avg_vol_1k_title: 'Power Worker',        ach_avg_vol_1k_desc: 'Average 1,000+ kg per workout',
    ach_avg_vol_2k_title: 'Force of Nature',     ach_avg_vol_2k_desc: 'Average 2,000+ kg per workout',
    ach_avg_sets_8_title: 'Set Builder',         ach_avg_sets_8_desc: 'Average 8+ sets per workout',
    ach_avg_sets_15_title: 'High Volume',        ach_avg_sets_15_desc: 'Average 15+ sets per workout',
    ach_avg_sets_25_title: 'Volume Master',      ach_avg_sets_25_desc: 'Average 25+ sets per workout',
    ach_devoted_title: 'Devoted Athlete',          ach_devoted_desc: '50+ workouts and 30+ day streak',
    ach_iron_man_title: 'Iron Man',                ach_iron_man_desc: '200+ workouts and 60+ min avg',
    ach_powerhouse_title: 'Powerhouse',            ach_powerhouse_desc: '50,000+ kg volume and 2,500+ sets',
    ach_champion_title: 'Champion',                ach_champion_desc: '10,000+ points and 25+ records',
    ach_legend_title: 'Legend',                    ach_legend_desc: '365+ workouts and 180+ day streak',
    ach_all_rounder_title: 'All-Rounder',          ach_all_rounder_desc: 'Top performance across all metrics',
    ach_pr_hunter_title: 'PR Hunter',              ach_pr_hunter_desc: '25+ records and 50+ workouts',
    ach_consistent_title: 'Consistent',            ach_consistent_desc: '100+ workouts and 45+ min avg',
    ach_volume_king_title: 'Volume King',          ach_volume_king_desc: '100,000+ kg and 200+ workouts',
    ach_marathon_man_title: 'Marathon Man',        ach_marathon_man_desc: '50 workouts and 50+ total hours',
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
    unitCm: 'cm',
  },
  upsell: {
    title: 'Unlock FitEx Premium',
    titleTrial: 'days left in trial',
    subtitle: 'Ratings, achievements, leaderboard, cloud sync and more.',
    featureSync: 'Cloud Sync',
    featureAnalytics: 'Analytics',
    featureRecovery: 'Recovery',
    featureRating: 'Rating',
    featureLeaderboard: 'Leaderboard',
    cta: 'Get Premium →',
    later: 'Maybe later',
  },
  leaderboard: {
    title: 'Leaderboard',
    subtitle: 'Top FitEx Athletes',
    myRank: 'My Rank',
    rank: 'Rank',
    score: 'Score',
    workouts: 'Wrkts',
    volume: 'Volume',
    streak: 'Streak',
    you: 'You',
    noData: 'No data',
    noDataSub: 'Sync your workouts to appear on the leaderboard',
    premium: 'Premium',
    topPlayers: 'Top Players',
    syncHint: 'Sync your data to update the leaderboard',
  },
  languageSelect: {
    title: 'Choose Language',
    subtitle: 'Select the language you want to use in the app',
    continue: 'Continue',
  },
  login: {
    subtitle: 'Sign in to save your progress',
    signInGoogle: 'Sign in with Google',
    signInEmail: 'Sign in with Email',
    terms: 'By continuing, you agree to our Terms of Service and Privacy Policy',
  },
  register: {
    title: 'Create Account',
    subtitle: 'Start your fitness journey',
    firstName: 'First Name',
    lastName: 'Last Name (optional)',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    submit: 'Create Account',
    haveAccount: 'Already have an account?',
    signIn: 'Sign In',
    passwordMismatch: 'Passwords do not match',
    passwordTooShort: 'Password must be at least 6 characters',
    successTitle: 'Check your email',
    successMessage: 'We sent a verification code to',
  },
  verify: {
    title: 'Verify Email',
    subtitle: 'Enter the 6-digit code from the email',
    codeSent: 'Code sent to',
    code: 'Verification Code',
    submit: 'Verify',
    resend: 'Resend Code',
    resendIn: 'Resend in',
    wrongEmail: 'Wrong email?',
  },
  emailLogin: {
    title: 'Sign In',
    subtitle: 'Enter your account details',
    email: 'Email',
    password: 'Password',
    submit: 'Sign In',
    noAccount: 'No account?',
    register: 'Register',
    forgotPassword: 'Forgot Password?',
    resetTitle: 'Reset Password',
    resetSubtitle: 'Enter the code from the email and new password',
    resetCode: 'Reset Code',
    newPassword: 'New Password',
    resetSubmit: 'Reset Password',
    backToLogin: 'Back to Sign In',
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
    fullyRecovered: 'Recovered',
    timeLeft: 'Left',
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
    ctaNew: 'Link Card · 30 Days Free',
    ctaNewSub: 'First charge only after 30 days',
    legal: 'Subscription renews automatically. You can cancel at any time via App Store / Google Play settings before the trial ends.',
    skipLink: 'Continue without payment (limited access)',
    skipLimited: 'Continue with limited access',
    termsLink: 'Terms of Use',
    privacyLink: 'Privacy Policy',
    timelineCard: 'Today',
    timelineCardDesc: 'Link your card',
    timelineDays: 'days',
    timelineFree: 'Full Premium free',
    timelineCharge: 'Day 31',
    timelineChargeDesc: 'First charge',
    noChargeToday: 'No charge today',
    trialFreeLabel: '30 days free',
    thenPay: 'Then',
    free: 'FREE',
    yearShort: 'yr',
    monthShort: 'mo',
    storeUnavailable:
      'Subscriptions did not load from the store. Check your connection, Paid Apps agreements in App Store Connect, and on device: Settings → App Store → Sandbox (for TestFlight).',
    androidOfferMissing: 'No subscription offer token from Google Play. Check the base plan in Play Console.',
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
    repsShort: 'dəfə',
    volumeLabel: 'həcm',
    maxLabel: 'maks',
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
    nameLabel: 'Ad',
    descLabel: 'Açıqlama',
    durationLabel: 'Müddət (dəq)',
    optionalSuffix: '(istəyə görə)',
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
    feature1: 'Reytinq, səviyyələr və 100+ nailiyyət',
    feature2: 'Cihazlar arası bulud sinxronizasiyası',
    feature3: 'Ətraflı analitika və qrafiklər',
    feature4: 'Liderlik cədvəli — başqalarıyla rəqabət',
    feature5: 'Əzələ bərpasının izlənməsi',
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
    statsTitle: 'Sinxronizasiya',
    lastSync: 'Son sinxronizasiya',
    neverSynced: 'Heç sinxronlaşdırılmayıb',
    statusSuccess: 'Uğurlu',
    statusError: 'Xəta',
    statusNever: 'Heç vaxt',
    syncedData: 'Sinxronlaşdırılmış məlumatlar',
    pendingData: 'Gözləyir',
    workouts: 'Məşqlər',
    measurements: 'Bədən ölçüləri',
    records: 'Şəxsi rekordlar',
    synced: 'Sinxr.',
    pending: 'Gözləyir',
    syncNow: 'İndi sinxronlaşdır',
    history: 'Sinxronizasiya tarixi',
    historyEmpty: 'Tarix yoxdur',
    dataBreakdown: 'Məlumat statusu',
    total: 'Cəmi',
    inSync: 'Bulutda',
    notSynced: 'Sinxr. deyil',
    cloudInfo: 'Məlumatlarınız FitEx serverlərində saxlanılır və bütün cihazlarınızda əlçatandır',
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
    levelLabel: 'Səviyyə',
    premiumGateTitle: 'Yalnız Premium üçün',
    premiumGateSubtitle: 'Reytinq, səviyyələr, nailiyyətlər, liderlik cədvəli və sinxronizasiya — bir abunədə hər şey.',
    premiumGateBtn: 'Premium-u açın',
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
    achPageTitle: 'Bütün nailiyyətlər',
    viewAll: 'Hamısına bax',
    earned: 'qazanılıb',
    locked: 'kilidli',
    progress: 'İrəliləyiş',
    catAll: 'Hamısı',
    catIntensity: 'İntensivlik',
    catTime: 'Vaxt',
    catScore: 'Xal',
    catTier: 'Dərəcə',
    catSpecial: 'Xüsusi',
    tierBeginner: 'Yeni başlayan',
    tierBronze: 'Bürünc',
    tierSilver: 'Gümüş',
    tierGold: 'Qızıl',
    tierPlatinum: 'Platinium',
    tierElite: 'Elit',
    pts: 'bal',
    kg: 'kq',
    days: 'gün',
    min: 'dəq',
    premiumGateTitle: 'Reytinq — yalnız Premium üçün',
    premiumGateSubtitle: 'Premium girişlə səviyyənizi, nailiyyətlərinizi və xal bölgüsünü izləyin',
    premiumGateBtn: 'Premium al',
    ach_workouts_1_title: 'İlk addım',              ach_workouts_1_desc: 'İlk məşqini tamamla',
    ach_workouts_5_title: 'Formada',                ach_workouts_5_desc: '5 məşq tamamlandı',
    ach_workouts_10_title: 'Başlanğıc',             ach_workouts_10_desc: '10 məşq tamamlandı',
    ach_workouts_25_title: 'Sabitlik',              ach_workouts_25_desc: '25 məşq tamamlandı',
    ach_workouts_50_title: 'Yarım əsr',             ach_workouts_50_desc: '50 məşq tamamlandı',
    ach_workouts_75_title: 'Yorulmaz',              ach_workouts_75_desc: '75 məşq tamamlandı',
    ach_workouts_100_title: 'Yüzlük',              ach_workouts_100_desc: '100 məşq tamamlandı',
    ach_workouts_200_title: 'İkiqat yüzlük',       ach_workouts_200_desc: '200 məşq tamamlandı',
    ach_workouts_300_title: 'Dəmir intizam',        ach_workouts_300_desc: '300 məşq tamamlandı',
    ach_workouts_365_title: 'İlin atleti',          ach_workouts_365_desc: '365 məşq — həqiqi atlet',
    ach_workouts_500_title: 'Beş yüz',              ach_workouts_500_desc: '500 məşq tamamlandı',
    ach_workouts_750_title: 'Elit atlet',           ach_workouts_750_desc: '750 məşq tamamlandı',
    ach_workouts_1000_title: 'Əfsanə',              ach_workouts_1000_desc: '1000 məşq — sən əfsanəsən',
    ach_streak_3_title: 'İsti start',           ach_streak_3_desc: 'Ardıcıl 3 gün məşq',
    ach_streak_7_title: 'Od həftəsi',           ach_streak_7_desc: 'Ardıcıl 7 gün',
    ach_streak_14_title: 'İki həftə güclü',     ach_streak_14_desc: 'Ardıcıl 14 gün',
    ach_streak_21_title: 'Vərdiş qurucu',       ach_streak_21_desc: '21 gün — vərdiş formalaşıb',
    ach_streak_30_title: 'İldırım ayı',         ach_streak_30_desc: 'Ardıcıl 30 gün',
    ach_streak_45_title: 'Dayandırılmaz',       ach_streak_45_desc: 'Ardıcıl 45 gün',
    ach_streak_60_title: 'İki aylıq seriya',    ach_streak_60_desc: 'Ardıcıl 60 gün',
    ach_streak_90_title: 'Durdurulamaz',        ach_streak_90_desc: 'Ardıcıl 90 gün',
    ach_streak_180_title: 'Yarım il',           ach_streak_180_desc: 'Ardıcıl 180 gün',
    ach_streak_365_title: 'İl seriası',         ach_streak_365_desc: 'Ardıcıl 365 gün — məğlubedilməz',
    ach_volume_500_title: 'Ağır qaldırma',      ach_volume_500_desc: 'Ümumi həcm 500 kq',
    ach_volume_1k_title: 'Ton mərhələsi',       ach_volume_1k_desc: 'Ümumi həcm 1 000 kq',
    ach_volume_2500_title: 'Güclü bədən',       ach_volume_2500_desc: 'Ümumi həcm 2 500 kq',
    ach_volume_5k_title: 'Güc evi',             ach_volume_5k_desc: 'Ümumi həcm 5 000 kq',
    ach_volume_10k_title: 'Dəmir iradə',        ach_volume_10k_desc: 'Ümumi həcm 10 000 kq',
    ach_volume_25k_title: 'Titan',              ach_volume_25k_desc: 'Ümumi həcm 25 000 kq',
    ach_volume_50k_title: 'Atlas',              ach_volume_50k_desc: 'Ümumi həcm 50 000 kq',
    ach_volume_100k_title: 'Herkules',          ach_volume_100k_desc: 'Ümumi həcm 100 000 kq',
    ach_volume_250k_title: 'Koloss',            ach_volume_250k_desc: 'Ümumi həcm 250 000 kq',
    ach_volume_500k_title: 'Güc tanrısı',       ach_volume_500k_desc: 'Ümumi həcm 500 000 kq',
    ach_sets_25_title: 'Başlanğıc dəsti',       ach_sets_25_desc: '25 yanaşma tamamlandı',
    ach_sets_50_title: 'Əlli hərəkət',          ach_sets_50_desc: '50 yanaşma tamamlandı',
    ach_sets_100_title: 'Yüz yanaşma',          ach_sets_100_desc: '100 yanaşma tamamlandı',
    ach_sets_250_title: 'İnadkar',              ach_sets_250_desc: '250 yanaşma tamamlandı',
    ach_sets_500_title: 'Beş yüz yanaşma',      ach_sets_500_desc: '500 yanaşma tamamlandı',
    ach_sets_1000_title: 'Mərhələ',             ach_sets_1000_desc: '1 000 yanaşma tamamlandı',
    ach_sets_2500_title: 'Maşın',               ach_sets_2500_desc: '2 500 yanaşma tamamlandı',
    ach_sets_5000_title: 'Durdurulamaz',        ach_sets_5000_desc: '5 000 yanaşma tamamlandı',
    ach_sets_10000_title: 'On min klub',        ach_sets_10000_desc: '10 000 yanaşma tamamlandı',
    ach_pr_1_title: 'İlk rekord',               ach_pr_1_desc: 'İlk şəxsi rekordunu qur',
    ach_pr_5_title: 'Rekord axtarıcı',          ach_pr_5_desc: '5 şəxsi rekord',
    ach_pr_10_title: 'Rekordçu',                ach_pr_10_desc: '10 şəxsi rekord',
    ach_pr_20_title: 'Hədd qıran',              ach_pr_20_desc: '20 şəxsi rekord',
    ach_pr_30_title: 'Yüksək performanslı',     ach_pr_30_desc: '30 şəxsi rekord',
    ach_pr_50_title: 'Elit performans',         ach_pr_50_desc: '50 şəxsi rekord',
    ach_pr_75_title: 'Rekord əfsanəsi',         ach_pr_75_desc: '75 şəxsi rekord',
    ach_pr_100_title: 'Ölümsüz rekordlar',      ach_pr_100_desc: '100 şəxsi rekord',
    ach_duration_20_title: 'Aktiv başlanğıc',       ach_duration_20_desc: 'Orta məşq 20+ dəq',
    ach_duration_30_title: '30 dəqiqəlik atlet',    ach_duration_30_desc: 'Orta məşq 30+ dəq',
    ach_duration_45_title: 'Ciddi antrenman',        ach_duration_45_desc: 'Orta məşq 45+ dəq',
    ach_duration_60_title: 'Güclü saat',            ach_duration_60_desc: 'Orta məşq 60+ dəq',
    ach_duration_75_title: 'Uzadılmış sessiya',      ach_duration_75_desc: 'Orta məşq 75+ dəq',
    ach_duration_90_title: 'Doxsan dəq ustası',     ach_duration_90_desc: 'Orta məşq 90+ dəq',
    ach_duration_120_title: 'İki saatlıq marafon',  ach_duration_120_desc: 'Orta məşq 2+ saat',
    ach_time_5h_title: 'Vaxt investoru',     ach_time_5h_desc: 'Cəmi 5 saat məşq',
    ach_time_10h_title: 'Sadiq',             ach_time_10h_desc: 'Cəmi 10 saat məşq',
    ach_time_25h_title: 'İyirmi beş saat',   ach_time_25h_desc: 'Cəmi 25 saat məşq',
    ach_time_50h_title: 'Əlli saat',         ach_time_50h_desc: 'Cəmi 50 saat məşq',
    ach_time_100h_title: 'Yüz saat',         ach_time_100h_desc: 'Cəmi 100 saat məşq',
    ach_time_200h_title: 'İki yüz saat',     ach_time_200h_desc: 'Cəmi 200 saat məşq',
    ach_time_500h_title: 'Beş yüz saat',     ach_time_500h_desc: 'Cəmi 500 saat məşq',
    ach_score_100_title: 'İlk xallar',          ach_score_100_desc: '100 reytinq xalı',
    ach_score_500_title: 'Xal toplayıcı',       ach_score_500_desc: '500 reytinq xalı',
    ach_score_1k_title: 'Min xal',              ach_score_1k_desc: '1 000 reytinq xalı',
    ach_score_2500_title: 'Yüksələn ulduz',     ach_score_2500_desc: '2 500 reytinq xalı',
    ach_score_5k_title: 'Yüksək nəticəli',      ach_score_5k_desc: '5 000 reytinq xalı',
    ach_score_10k_title: 'Xal ustası',          ach_score_10k_desc: '10 000 reytinq xalı',
    ach_score_25k_title: 'Elit reytinq',        ach_score_25k_desc: '25 000 reytinq xalı',
    ach_score_50k_title: 'Əfsanəvi reytinq',    ach_score_50k_desc: '50 000 reytinq xalı',
    ach_tier_bronze_title: 'Tunc döyüşçü',      ach_tier_bronze_desc: 'Bürünc dərəcəsinə çatıldı',
    ach_tier_silver_title: 'Gümüş atlet',       ach_tier_silver_desc: 'Gümüş dərəcəsinə çatıldı',
    ach_tier_gold_title: 'Qızıl çempion',       ach_tier_gold_desc: 'Qızıl dərəcəsinə çatıldı',
    ach_tier_platinum_title: 'Platin elit',     ach_tier_platinum_desc: 'Platinium dərəcəsinə çatıldı',
    ach_tier_elite_title: 'Elit əfsanə',        ach_tier_elite_desc: 'Elit dərəcəsinə çatıldı',
    ach_avg_vol_500_title: 'Möhkəm əsas',        ach_avg_vol_500_desc: 'Orta 500+ kq hər məşqdə',
    ach_avg_vol_1k_title: 'Güclü işçi',          ach_avg_vol_1k_desc: 'Orta 1 000+ kq hər məşqdə',
    ach_avg_vol_2k_title: 'Təbiətin gücü',       ach_avg_vol_2k_desc: 'Orta 2 000+ kq hər məşqdə',
    ach_avg_sets_8_title: 'Dəst qurucu',         ach_avg_sets_8_desc: 'Orta 8+ yanaşma hər məşqdə',
    ach_avg_sets_15_title: 'Yüksək həcm',        ach_avg_sets_15_desc: 'Orta 15+ yanaşma hər məşqdə',
    ach_avg_sets_25_title: 'Həcm ustası',        ach_avg_sets_25_desc: 'Orta 25+ yanaşma hər məşqdə',
    ach_devoted_title: 'Sadiq atlet',              ach_devoted_desc: '50+ məşq və 30+ günlük seriya',
    ach_iron_man_title: 'Dəmir insan',             ach_iron_man_desc: '200+ məşq və orta 60+ dəq',
    ach_powerhouse_title: 'Güc stansiyası',        ach_powerhouse_desc: '50 000+ kq həcm və 2 500+ yanaşma',
    ach_champion_title: 'Çempion',                 ach_champion_desc: '10 000+ xal və 25+ rekord',
    ach_legend_title: 'Əfsanə',                    ach_legend_desc: '365+ məşq və 180+ günlük seriya',
    ach_all_rounder_title: 'Hərtərəfli atlet',     ach_all_rounder_desc: 'Bütün göstəricilər üzrə zirvə',
    ach_pr_hunter_title: 'Rekord ovçusu',          ach_pr_hunter_desc: '25+ rekord və 50+ məşq',
    ach_consistent_title: 'Ardıcıl',               ach_consistent_desc: '100+ məşq və orta 45+ dəq',
    ach_volume_king_title: 'Həcm kralı',           ach_volume_king_desc: '100 000+ kq və 200+ məşq',
    ach_marathon_man_title: 'Marafon adamı',       ach_marathon_man_desc: '50 məşq və 50+ cəmi saat',
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
    unitCm: 'sm',
  },
  upsell: {
    title: 'FitEx Premium-u açın',
    titleTrial: 'sınaq müddəti qalıb',
    subtitle: 'Reytinq, nailiyyətlər, liderlik cədvəli, sinxronizasiya və daha çox.',
    featureSync: 'Sinxronizasiya',
    featureAnalytics: 'Analitika',
    featureRecovery: 'Bərpa',
    featureRating: 'Reytinq',
    featureLeaderboard: 'Liderlik',
    cta: 'Premium al →',
    later: 'Sonra',
  },
  leaderboard: {
    title: 'Liderlik cədvəli',
    subtitle: 'Ən yaxşı FitEx idmançıları',
    myRank: 'Mənim reytinqim',
    rank: 'Yer',
    score: 'Xal',
    workouts: 'Məşq',
    volume: 'Həcm',
    streak: 'Seriya',
    you: 'Siz',
    noData: 'Məlumat yoxdur',
    noDataSub: 'Liderlik cədvəlinə girmək üçün məşqləri sinxronizasiya edin',
    premium: 'Premium',
    topPlayers: 'Ən yaxşılar',
    syncHint: 'Reytinqi yeniləmək üçün məlumatları sinxronizasiya edin',
  },
  languageSelect: {
    title: 'Dil seçin',
    subtitle: 'Tətbiqdə istifadə etmək istədiyiniz dili seçin',
    continue: 'Davam et',
  },
  login: {
    subtitle: 'İrəliləyişinizi saxlamaq üçün daxil olun',
    signInGoogle: 'Google ilə daxil ol',
    signInEmail: 'Email ilə daxil ol',
    terms: 'Davam edərək İstifadə Şərtləri və Məxfilik Siyasətini qəbul edirsiniz',
  },
  register: {
    title: 'Hesab yarat',
    subtitle: 'Fitness səyahətinə başla',
    firstName: 'Ad',
    lastName: 'Soyad (isteğe bağlı)',
    email: 'E-poçt',
    password: 'Şifrə',
    confirmPassword: 'Şifrəni təsdiqlə',
    submit: 'Hesab yarat',
    haveAccount: 'Artıq hesabınız var?',
    signIn: 'Daxil ol',
    passwordMismatch: 'Şifrələr uyğun gəlmir',
    passwordTooShort: 'Şifrə ən az 6 simvol olmalıdır',
    successTitle: 'Poçtunuzu yoxlayın',
    successMessage: 'Doğrulama kodu göndərildi',
  },
  verify: {
    title: 'E-poçtu doğrula',
    subtitle: 'E-poçtdan 6 rəqəmli kodu daxil edin',
    codeSent: 'Kod göndərildi:',
    code: 'Doğrulama kodu',
    submit: 'Doğrula',
    resend: 'Yenidən göndər',
    resendIn: 'Yenidən göndərmə',
    wrongEmail: 'Yanlış e-poçt?',
  },
  emailLogin: {
    title: 'Daxil ol',
    subtitle: 'Hesab məlumatlarınızı daxil edin',
    email: 'E-poçt',
    password: 'Şifrə',
    submit: 'Daxil ol',
    noAccount: 'Hesabınız yoxdur?',
    register: 'Qeydiyyat',
    forgotPassword: 'Şifrəni unutdunuz?',
    resetTitle: 'Şifrəni sıfırla',
    resetSubtitle: 'E-poçtdan kodu və yeni şifrəni daxil edin',
    resetCode: 'Sıfırlama kodu',
    newPassword: 'Yeni şifrə',
    resetSubmit: 'Şifrəni sıfırla',
    backToLogin: 'Girişə qayıt',
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
    fullyRecovered: 'Bərpa edilib',
    timeLeft: 'Qaldı',
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
    ctaNew: 'Kartı bağla · 30 gün pulsuz',
    ctaNewSub: 'İlk ödəniş yalnız 30 gündən sonra',
    legal: 'Abunəlik avtomatik yenilənir. Sınaq müddəti başa çatmadan App Store / Google Play parametrlərindən ləğv edə bilərsiniz.',
    skipLink: 'Ödənişsiz davam et (məhdud giriş)',
    skipLimited: 'Məhdud girişlə davam et',
    termsLink: 'İstifadə Şərtləri',
    privacyLink: 'Məxfilik Siyasəti',
    skipTitle: 'Məhdud Giriş',
    skipBody: 'Ödəniş metodu olmadan yalnız əsas funksiyalar mövcuddur. Reytinq, sinxronizasiya və analitika üçün abunəlik tələb olunur.',
    skipConfirm: 'Kartsız davam et',
    noReceipt: 'Alış qəbzi tapılmadı',
    timelineCard: 'Bu gün',
    timelineCardDesc: 'Kartı bağlayırsın',
    timelineDays: 'gün',
    timelineFree: 'Tam Premium pulsuz',
    timelineCharge: '31-ci gün',
    timelineChargeDesc: 'İlk ödəniş',
    noChargeToday: 'Bu gün kartdan heç nə tutulmur',
    trialFreeLabel: '30 gün pulsuz',
    thenPay: 'Sonra',
    free: 'PULSUZ',
    yearShort: 'il',
    monthShort: 'ay',
    storeUnavailable:
      'Abunəliklər mağazadan yüklənmədi. İnternet, App Store Connect-də Paid Apps müqaviləsi və cihazda: Parametrlər → App Store → Sandbox (TestFlight) yoxlayın.',
    androidOfferMissing: 'Google Play-də abunəlik offer token tapılmadı. Play Console-da əsas planı yoxlayın.',
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
