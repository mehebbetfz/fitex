/**
 * Translation lookup for all exercise-related Russian strings.
 * The source data (muscle-groups.ts) stores everything in Russian.
 * This file maps those Russian strings to EN and AZ equivalents.
 * Usage: translateExercise(russianName, language)
 */

import { Language } from '@/locales'

// ─── Muscle group & subgroup names ────────────────────────────────────────────

const GROUP_NAMES: Record<string, Record<Language, string>> = {
  'Грудь':           { ru: 'Грудь',          en: 'Chest',        az: 'Döş' },
  'Руки':            { ru: 'Руки',           en: 'Arms',         az: 'Qollar' },
  'Дельты':          { ru: 'Дельты',         en: 'Shoulders',    az: 'Çiynlər' },
  'Пресс':           { ru: 'Пресс',          en: 'Abs',          az: 'Qarın əzələsi' },
  'Ноги':            { ru: 'Ноги',           en: 'Legs',         az: 'Ayaqlar' },
  'Предплечья':      { ru: 'Предплечья',     en: 'Forearms',     az: 'Bilər' },
  'Ягодицы':         { ru: 'Ягодицы',        en: 'Glutes',       az: 'Kalça' },
  'Спина':           { ru: 'Спина',          en: 'Back',         az: 'Arxa' },
  'Трапеции':        { ru: 'Трапеции',       en: 'Traps',        az: 'Trapezius' },
  'Плечи':           { ru: 'Плечи',          en: 'Shoulders',    az: 'Çiynlər' },
  // Subgroups
  'Верх груди':      { ru: 'Верх груди',     en: 'Upper Chest',  az: 'Üst döş' },
  'Низ груди':       { ru: 'Низ груди',      en: 'Lower Chest',  az: 'Alt döş' },
  'Середина груди':  { ru: 'Середина груди', en: 'Mid Chest',    az: 'Orta döş' },
  'Бицепс':          { ru: 'Бицепс',         en: 'Biceps',       az: 'Biseps' },
  'Трицепс':         { ru: 'Трицепс',        en: 'Triceps',      az: 'Triseps' },
  'Передние дельты': { ru: 'Передние дельты',en: 'Front Delts',  az: 'Ön deltalar' },
  'Средние дельты':  { ru: 'Средние дельты', en: 'Side Delts',   az: 'Yan deltalar' },
  'Задние дельты':   { ru: 'Задние дельты',  en: 'Rear Delts',   az: 'Arxa deltalar' },
  'Верхний пресс':   { ru: 'Верхний пресс',  en: 'Upper Abs',    az: 'Üst qarın' },
  'Нижний пресс':    { ru: 'Нижний пресс',   en: 'Lower Abs',    az: 'Alt qarın' },
  'Косые мышцы':     { ru: 'Косые мышцы',    en: 'Obliques',     az: 'Yan əzələlər' },
  'Косыidе мышцы':   { ru: 'Косые мышцы',    en: 'Obliques',     az: 'Yan əzələlər' },
  'Глубокий кор':    { ru: 'Глубокий кор',   en: 'Deep Core',    az: 'Dərin özək' },
  'Латеральная широкая мышца бедра': { ru: 'Латеральная широкая мышца бедра', en: 'Quads (vastus lateralis)', az: 'Ön budaq (lat. enli əzələ)' },
  'Верх трапеций':   { ru: 'Верх трапеций',  en: 'Upper traps',  az: 'Üst trapezius' },
}

// ─── Primary / secondary muscle names ────────────────────────────────────────

const MUSCLE_NAMES: Record<string, Record<Language, string>> = {
  'Середина груди':    { ru: 'Середина груди',    en: 'Mid Chest',       az: 'Orta döş' },
  'Верх груди':        { ru: 'Верх груди',         en: 'Upper Chest',     az: 'Üst döş' },
  'Низ груди':         { ru: 'Низ груди',           en: 'Lower Chest',     az: 'Alt döş' },
  'Передние дельты':   { ru: 'Передние дельты',    en: 'Front Delts',     az: 'Ön deltalar' },
  'Средние дельты':    { ru: 'Средние дельты',     en: 'Side Delts',      az: 'Yan deltalar' },
  'Задние дельты':     { ru: 'Задние дельты',      en: 'Rear Delts',      az: 'Arxa deltalar' },
  'Трицепс':           { ru: 'Трицепс',            en: 'Triceps',         az: 'Triseps' },
  'Бицепс':            { ru: 'Бицепс',             en: 'Biceps',          az: 'Biseps' },
  'Предплечья':        { ru: 'Предплечья',         en: 'Forearms',        az: 'Bilər' },
  'Грудь':             { ru: 'Грудь',              en: 'Chest',           az: 'Döş' },
  'Спина':             { ru: 'Спина',              en: 'Back',            az: 'Arxa' },
  'Широчайшие':        { ru: 'Широчайшие',         en: 'Lats',            az: 'Enli əzələlər' },
  'Трапеции':          { ru: 'Трапеции',           en: 'Traps',           az: 'Trapezius' },
  'Пресс':             { ru: 'Пресс',              en: 'Abs',             az: 'Qarın' },
  'Косые мышцы':       { ru: 'Косые мышцы',        en: 'Obliques',        az: 'Yan əzələlər' },
  'Ноги':              { ru: 'Ноги',               en: 'Legs',            az: 'Ayaqlar' },
  'Квадрицепс':        { ru: 'Квадрицепс',         en: 'Quads',           az: 'Kvadriseps' },
  'Бицепс бедра':      { ru: 'Бицепс бедра',       en: 'Hamstrings',      az: 'Arxa uylıq əzələsi' },
  'Ягодицы':           { ru: 'Ягодицы',            en: 'Glutes',          az: 'Kalça' },
  'Плечи':             { ru: 'Плечи',              en: 'Shoulders',       az: 'Çiynlər' },
  'Стабилизаторы':     { ru: 'Стабилизаторы',      en: 'Stabilizers',     az: 'Stabilizatorlar' },
  'Икроножные мышцы':  { ru: 'Икроножные мышцы',   en: 'Calves',          az: 'Baldır əzələləri' },
  'Камбаловидная мышца': { ru: 'Камбаловидная мышца', en: 'Soleus',      az: 'Düzənəkvari əzələ' },
  'Ягодичные':         { ru: 'Ягодичные',          en: 'Glutes',          az: 'Kalça əzələləri' },
  'Мышцы спины':       { ru: 'Мышцы спины',        en: 'Back muscles',    az: 'Arxa əzələlər' },
  'Сердечно-сосудистая система': { ru: 'Сердечно-сосудистая система', en: 'Cardiovascular system', az: 'Ürək-damar sistemi' },
  'Большая круглая мышца': { ru: 'Большая круглая мышца', en: 'Teres major', az: 'Böyük dairəvi əzələ' },
  'Задняя дельта':     { ru: 'Задняя дельта',      en: 'Rear deltoid',    az: 'Arxa delta' },
  'Трапеции (нижняя часть)': { ru: 'Трапеции (нижняя часть)', en: 'Lower traps', az: 'Alt trapezius' },
  'Ромбовидные':       { ru: 'Ромбовидные',        en: 'Rhomboids',       az: 'Romboşəkilli əzələlər' },
  'Трапеции (средняя и нижняя части)': { ru: 'Трапеции (средняя и нижняя части)', en: 'Mid & lower traps', az: 'Orta və alt trapezius' },
  'Трапеции (средняя часть)': { ru: 'Трапеции (средняя часть)', en: 'Mid traps', az: 'Orta trapezius' },
  'Разгибатели спины': { ru: 'Разгибатели спины',  en: 'Spinal erectors', az: 'Onurğa dartıcıları' },
  'Брахиалис':         { ru: 'Брахиалис',          en: 'Brachialis',      az: 'Braxialis' },
  // Aliases & catalog strings used in primaryMuscles / secondaryMuscles (muscle-groups.ts)
  'Внешняя часть бедра': { ru: 'Внешняя часть бедра', en: 'Outer thigh', az: 'Budaqın xarici hissəsi' },
  'Зубчатые мышцы (serratus anterior)': {
    ru: 'Зубчатые мышцы (serratus anterior)',
    en: 'Serratus anterior',
    az: 'Ön dişli əzələ (serratus anterior)',
  },
  'Икроножные': { ru: 'Икроножные', en: 'Calves', az: 'Baldır əzələləri' },
  'Квадрицепс (внешняя часть)': {
    ru: 'Квадрицепс (внешняя часть)',
    en: 'Quads (outer / vastus lateralis)',
    az: 'Kvadriseps (xarici / lat. enli baş)',
  },
  'Косые мышцы живота': { ru: 'Косые мышцы живота', en: 'Abdominal obliques', az: 'Qarın yan əzələləri' },
  'Локтевая мышца (anconeus)': { ru: 'Локтевая мышца (anconeus)', en: 'Anconeus', az: 'Ankoneus əzələsi' },
  'Малая круглая мышца': { ru: 'Малая круглая мышца', en: 'Teres minor', az: 'Kiçik dairəvi əzələ (teres minor)' },
  'Мышцы кора (стабилизация)': {
    ru: 'Мышцы кора (стабилизация)',
    en: 'Core (stabilization)',
    az: 'Özək əzələləri (stabilizasiya)',
  },
  'Мышцы поясницы': { ru: 'Мышцы поясницы', en: 'Lower back muscles', az: 'Bel əzələləri' },
  'Мышцы шеи': { ru: 'Мышцы шеи', en: 'Neck muscles', az: 'Boyun əzələləri' },
  'Напрягатель широкой фасции': {
    ru: 'Напрягатель широкой фасции',
    en: 'Tensor fasciae latae (TFL)',
    az: 'Geniş fasciyanın dartıcısı (TFL)',
  },
  'Нижняя часть трапеций': { ru: 'Нижняя часть трапеций', en: 'Lower traps', az: 'Alt trapezius' },
  'Передняя дельта': { ru: 'Передняя дельта', en: 'Anterior deltoid', az: 'Ön delta' },
  'Передняя зубчатая': { ru: 'Передняя зубчатая', en: 'Serratus anterior', az: 'Ön dişli əzələ' },
  'Плечелучевая мышца': { ru: 'Плечелучевая мышца', en: 'Brachioradialis', az: 'Çiyn-radius əzələsi (braxioradialis)' },
  'Подвздошно-поясничная мышца': {
    ru: 'Подвздошно-поясничная мышца',
    en: 'Iliopsoas',
    az: 'İlio-psoa əzələsi',
  },
  'Подостная мышца': { ru: 'Подостная мышца', en: 'Infraspinatus', az: 'İnfraspinat əzələsi' },
  'Предплечья (разгибатели)': { ru: 'Предплечья (разгибатели)', en: 'Forearm extensors', az: 'Bilək dartıcıları' },
  'Предплечья (сгибатели)': { ru: 'Предплечья (сгибатели)', en: 'Forearm flexors', az: 'Bilək bükücüləri' },
  'Приводящие': { ru: 'Приводящие', en: 'Adductors', az: 'Yığıcı əzələlər' },
  'Приводящие мышцы': { ru: 'Приводящие мышцы', en: 'Adductor muscles', az: 'Yığıcı əzələlər' },
  'Приводящие мышцы бедра': { ru: 'Приводящие мышцы бедра', en: 'Hip adductors', az: 'Budaq yığıcıları' },
  'Средняя дельта': { ru: 'Средняя дельта', en: 'Middle deltoid', az: 'Orta delta' },
  'Средняя трапеция': { ru: 'Средняя трапеция', en: 'Mid traps', az: 'Orta trapezius' },
  'Трапециевидные мышцы': { ru: 'Трапециевидные мышцы', en: 'Trapezius', az: 'Trapezius əzələsi' },
  'Ягодичные мышцы': { ru: 'Ягодичные мышцы', en: 'Glutes', az: 'Kalça əzələləri' },
}

// ─── Equipment names ──────────────────────────────────────────────────────────

const EQUIPMENT_NAMES: Record<string, Record<Language, string>> = {
  'Штанга':                              { ru: 'Штанга',                           en: 'Barbell',                az: 'Ştanqa' },
  'Горизонтальная скамья':               { ru: 'Горизонтальная скамья',            en: 'Flat Bench',             az: 'Düz dəzgah' },
  'Наклонная скамья':                    { ru: 'Наклонная скамья',                 en: 'Incline Bench',          az: 'Meyilli dəzgah' },
  'Тренажер «Бабочка»':                  { ru: 'Тренажер «Бабочка»',               en: 'Pec Deck Machine',       az: 'Kəpənək trenajoru' },
  'Рычажный тренажер':                   { ru: 'Рычажный тренажер',                en: 'Lever Machine',          az: 'Qolu trenajor' },
  'Гантели':                             { ru: 'Гантели',                          en: 'Dumbbells',              az: 'Hantellər' },
  'Кроссовер':                           { ru: 'Кроссовер',                        en: 'Cable Crossover',        az: 'Kabel keçidi' },
  'EZ-гриф':                             { ru: 'EZ-гриф',                          en: 'EZ Bar',                 az: 'EZ bar' },
  'Прямая штанга':                       { ru: 'Прямая штанга',                    en: 'Straight Bar',           az: 'Düz bar' },
  'Скамья':                              { ru: 'Скамья',                           en: 'Bench',                  az: 'Dəzgah' },
  'Preacher curl machine':               { ru: 'Preacher curl machine',            en: 'Preacher Curl Machine',  az: 'Preacher curl maşını' },
  'Верхний блок':                        { ru: 'Верхний блок',                     en: 'Cable Machine (high)',   az: 'Yuxarı blok' },
  'EZ-гриф (изогнутая рукоять)':         { ru: 'EZ-гриф (изогнутая рукоять)',      en: 'EZ Bar (curved)',        az: 'EZ bar (əyri)' },
  'Канатная рукоять (rope attachment)':  { ru: 'Канатная рукоять (rope attachment)',en: 'Rope Attachment',        az: 'Kənaf əlavəsi' },
  'Штанга (прямая или EZ-гриф)':         { ru: 'Штанга (прямая или EZ-гриф)',      en: 'Bar (straight or EZ)',   az: 'Bar (düz və ya EZ)' },
  'Скамья Скотта':                       { ru: 'Скамья Скотта',                    en: 'Preacher Bench',         az: 'Skott dəzgahı' },
  'Наклонная скамья (incline bench)':    { ru: 'Наклонная скамья (incline bench)', en: 'Incline Bench',          az: 'Meyilli dəzgah' },
  'Прямая рукоять или EZ-рукоять':       { ru: 'Прямая рукоять или EZ-рукоять',   en: 'Straight or EZ Bar',     az: 'Düz və ya EZ bar' },
  'Нижний блок (low pulley)':            { ru: 'Нижний блок (low pulley)',          en: 'Low Cable',              az: 'Aşağı blok' },
  'Прямая рукоять (straight bar attachment)': { ru: 'Прямая рукоять (straight bar attachment)', en: 'Straight Bar Attachment', az: 'Düz bar əlavəsi' },
  'Тренажер Peck-Deck':                  { ru: 'Тренажер Peck-Deck',               en: 'Pec Deck Machine',       az: 'Pec-deck trenajoru' },
  'Скамья со спинкой':                   { ru: 'Скамья со спинкой',                en: 'Adjustable Bench',       az: 'Söykənəcəkli dəzgah' },
  'Блочная рама':                        { ru: 'Блочная рама',                     en: 'Cable Station',          az: 'Kabel stansiyası' },
  'Разведение в стороны':                { ru: 'Разведение в стороны',             en: 'Lateral Raise Machine',  az: 'Yan aparma maşını' },
  'Наклонная скамья для пресса':         { ru: 'Наклонная скамья для пресса',      en: 'Decline Bench',          az: 'Meyilli dəzgah (qarın üçün)' },
  'Тренажер для пресса':                 { ru: 'Тренажер для пресса',              en: 'Ab Crunch Machine',      az: 'Qarın trenajoru' },
  'Тренажер "Брусья-пресс"':             { ru: 'Тренажер "Брусья-пресс"',          en: 'Captain\'s Chair',       az: 'Kapitan kürsüsü' },
  'Тренажер для сгибания ног':           { ru: 'Тренажер для сгибания ног',        en: 'Lying leg curl machine', az: 'Uzanaraq budaq bükən maşın' },
  'Тренажер для разгибания ног':         { ru: 'Тренажер для разгибания ног',      en: 'Leg extension machine',  az: 'Budaq uzadan maşın' },
  'Тренажер для сведения ног':           { ru: 'Тренажер для сведения ног',        en: 'Hip adduction machine',  az: 'Budaq yığılan maşın' },
  'Тренажер для разведения ног':         { ru: 'Тренажер для разведения ног',      en: 'Hip abduction machine',  az: 'Budaq açılan maşın' },
  'Тренажер для жима ногами':            { ru: 'Тренажер для жима ногами',         en: 'Leg press machine',      az: 'Ayaqla pres maşını' },
  'Стойки для штанги / Силовая рама':    { ru: 'Стойки для штанги / Силовая рама', en: 'Squat rack / power rack', az: 'Ştanqa stendi / güc stansiyası' },
  'Тренажер Смита':                      { ru: 'Тренажер Смита',                   en: 'Smith machine',          az: 'Smith maşını' },
  'Тренажер для ягодиц':                 { ru: 'Тренажер для ягодиц',              en: 'Glute machine',          az: 'Kalça maşını' },
  'Гакк-машина / V-Squat':               { ru: 'Гакк-машина / V-Squat',            en: 'Hack squat / V-squat',   az: 'Hakk squat / V-squat' },
  'Рычажный тренажер для ног':           { ru: 'Рычажный тренажер для ног',        en: 'Lever leg machine',      az: 'Ayaq üçün qolu maşın' },
  'Тренажер для голени сидя':            { ru: 'Тренажер для голени сидя',         en: 'Seated calf machine',    az: 'Oturaraq baldır maşını' },
  'Эллиптический тренажер':              { ru: 'Эллиптический тренажер',           en: 'Elliptical trainer',     az: 'Elliptik trenajor' },
  'Велотренажер':                        { ru: 'Велотренажер',                     en: 'Exercise bike',          az: 'Velotrenajor' },
  'Т-гриф':                              { ru: 'Т-гриф',                           en: 'T-bar',                  az: 'T-bar' },
  'Тренажер Т-гриф с упором':            { ru: 'Тренажер Т-гриф с упором',         en: 'Chest-supported T-bar',  az: 'Döşə söykənən T-bar' },
  'Блочный тренажер':                    { ru: 'Блочный тренажер',                 en: 'Plate-loaded machine',   az: 'Bloklu trenajor' },
  'V-образная рукоять':                  { ru: 'V-образная рукоять',               en: 'V-bar attachment',       az: 'V formalı tutacaq' },
  'Длинная рукоять':                     { ru: 'Длинная рукоять',                  en: 'Long bar attachment',    az: 'Uzun tutacaq' },
  'Дуговой тренажёр':                    { ru: 'Дуговой тренажёр',                 en: 'Diverging pulldown machine', az: 'Qövs formalı trenajor' },
  'Тренажер для гиперэкстензии':         { ru: 'Тренажер для гиперэкстензии',      en: 'Hyperextension bench',   az: 'Hiperextension dəzgahı' },
  'Турник':                              { ru: 'Турник',                           en: 'Pull-up bar',            az: 'Turnik' },
}

// ─── Exercise names ────────────────────────────────────────────────────────────

const EXERCISE_NAMES: Record<string, Record<Language, string>> = {
  'Жим штанги лежа':                                           { ru: 'Жим штанги лежа',                                        en: 'Flat Barbell Bench Press',                  az: 'Düz ştanqa presi' },
  'Жим штанги на наклонной скамье':                            { ru: 'Жим штанги на наклонной скамье',                         en: 'Incline Barbell Bench Press',               az: 'Meyilli ştanqa presi' },
  'Сведение рук в тренажере (Бабочка)':                        { ru: 'Сведение рук в тренажере (Бабочка)',                     en: 'Pec Deck Fly (Butterfly)',                  az: 'Kəpənək trenajoru' },
  'Жим в рычажном тренажере под углом':                        { ru: 'Жим в рычажном тренажере под углом',                    en: 'Incline Lever Chest Press',                 az: 'Meyilli qolu presi' },
  'Жим в рычажном тренажере сидя':                             { ru: 'Жим в рычажном тренажере сидя',                         en: 'Seated Lever Chest Press',                  az: 'Oturaraq qolu döş presi' },
  'Жим в рычажном тренажере под углом (вверх)':                { ru: 'Жим в рычажном тренажере под углом (вверх)',             en: 'High Incline Lever Chest Press',            az: 'Yuxarı meyilli qolu presi' },
  'Жим гантелей на наклонной скамье':                          { ru: 'Жим гантелей на наклонной скамье',                      en: 'Incline Dumbbell Press',                    az: 'Meyilli hantelli pres' },
  'Жим гантелей на горизонтальной скамье':                     { ru: 'Жим гантелей на горизонтальной скамье',                 en: 'Flat Dumbbell Bench Press',                 az: 'Düz hantelli pres' },
  'Разведение гантелей лежа':                                  { ru: 'Разведение гантелей лежа',                               en: 'Dumbbell Flyes',                            az: 'Uzanaraq hantelli açılış' },
  'Сведения в кроссовере сверху вниз':                         { ru: 'Сведения в кроссовере сверху вниз',                     en: 'High-to-Low Cable Fly',                     az: 'Yuxarıdan aşağı kabel açılışı' },
  'Сведение рук в кроссовере стоя':                            { ru: 'Сведение рук в кроссовере стоя',                        en: 'Standing Cable Chest Fly',                  az: 'Dayanaraq kabel döş açılışı' },
  'Сведения в кроссовере с нижних блоков':                     { ru: 'Сведения в кроссовере с нижних блоков',                 en: 'Low-to-High Cable Fly',                     az: 'Aşağıdan yuxarı kabel açılışı' },
  'Французский жим лёжа':                                      { ru: 'Французский жим лёжа',                                   en: 'Lying Tricep Extension (Skull Crusher)',    az: 'Uzanaraq triseps uzanması' },
  'Сгибания рук в тренажере':                                  { ru: 'Сгибания рук в тренажере',                               en: 'Bicep Curl Machine',                        az: 'Trenajorda biseps bükülməsi' },
  'Разгибания на трицепс на верхнем блоке (EZ-гриф)':          { ru: 'Разгибания на трицепс на верхнем блоке (EZ-гриф)',      en: 'Cable Tricep Pushdown (EZ Bar)',            az: 'Kabel triseps iterməsi (EZ bar)' },
  'Разгибания на трицепс с канатом':                           { ru: 'Разгибания на трицепс с канатом',                       en: 'Cable Tricep Rope Pushdown',                az: 'Kabel triseps kənaf iterməsi' },
  'Подъём штанги на бицепс стоя':                              { ru: 'Подъём штанги на бицепс стоя',                          en: 'Standing Barbell Bicep Curl',               az: 'Dayanaraq ştanqa ilə biseps bükülməsi' },
  'Сгибания рук на скамье Скотта':                             { ru: 'Сгибания рук на скамье Скотта',                         en: 'Preacher Curl (Barbell)',                   az: 'Skott dəzgahında biseps bükülməsi' },
  'Сгибания рук со штангой обратным хватом':                   { ru: 'Сгибания рук со штангой обратным хватом',               en: 'Reverse Barbell Curl',                      az: 'Əks tutumla ştanqa bükülməsi' },
  'Поочередные сгибания рук с гантелями':                      { ru: 'Поочередные сгибания рук с гантелями',                  en: 'Alternating Dumbbell Bicep Curl',           az: 'Növbəli hantelli biseps bükülməsi' },
  'Сгибания рук "Молотки"':                                    { ru: 'Сгибания рук "Молотки"',                                 en: 'Dumbbell Hammer Curls',                     az: 'Çəkic bükülmələri' },
  'Сгибания рук на наклонной скамье':                          { ru: 'Сгибания рук на наклонной скамье',                      en: 'Incline Dumbbell Bicep Curl',               az: 'Meyilli dəzgahda biseps bükülməsi' },
  'Разгибание одной руки обратным хватом':                     { ru: 'Разгибание одной руки обратным хватом',                 en: 'Single-Arm Reverse Grip Tricep Pushdown',   az: 'Bir qolla əks tutumlu triseps iterməsi' },
  'Разгибания рук из-за головы на блоке (канат)':              { ru: 'Разгибания рук из-за головы на блоке (канат)',          en: 'Cable Overhead Tricep Extension (Rope)',    az: 'Başın arxasından kabel triseps uzanması' },
  'Сгибания рук на нижнем блоке (прямая рукоять)':             { ru: 'Сгибания рук на нижнем блоке (прямая рукоять)',         en: 'Cable Bicep Curl (Straight Bar)',           az: 'Kabel biseps bükülməsi (düz bar)' },
  'Отжимания на трицепс в тренажере':                          { ru: 'Отжимания на трицепс в тренажере',                      en: 'Machine Seated Dip (Tricep)',               az: 'Oturaraq maşınla triseps itərmə' },
  'Французский жим в тренажере сидя':                          { ru: 'Французский жим в тренажере сидя',                      en: 'Machine Overhead Tricep Extension',         az: 'Maşında oturaraq triseps uzanması' },
  'Обратные разведения в тренажере (Reverse Fly)':             { ru: 'Обратные разведения в тренажере (Reverse Fly)',         en: 'Reverse Fly Machine (Rear Delt)',           az: 'Maşında əks açılış (arxa delta)' },
  'Жим на плечи в рычажном тренажере':                         { ru: 'Жим на плечи в рычажном тренажере',                    en: 'Lever Shoulder Press Machine',             az: 'Qolu maşınında çiyin presi' },
  'Жим гантелей сидя':                                         { ru: 'Жим гантелей сидя',                                     en: 'Seated Dumbbell Shoulder Press',            az: 'Oturaraq hantelli çiyin presi' },
  'Разводка гантелей в стороны':                               { ru: 'Разводка гантелей в стороны',                           en: 'Dumbbell Lateral Raise',                    az: 'Hantelli yan qaldırma' },
  'Подъем гантелей перед собой':                               { ru: 'Подъем гантелей перед собой',                           en: 'Dumbbell Front Raise',                      az: 'Hantelli öndən qaldırma' },
  'Разведение гантелей в наклоне сидя':                        { ru: 'Разведение гантелей в наклоне сидя',                   en: 'Seated Bent-Over Dumbbell Rear Delt Fly',   az: 'Əyilib oturaraq hantelli arxa delta açılışı' },
  'Лицевая тяга на верхнем блоке':                             { ru: 'Лицевая тяга на верхнем блоке',                        en: 'Cable Face Pull',                           az: 'Kabel üz tərəfə çəkiş' },
  'Разведения в тренажере на среднюю дельту':                  { ru: 'Разведения в тренажере на среднюю дельту',             en: 'Lateral Raise Machine (Side Delt)',         az: 'Maşında yan delta açılışı' },
  'Скручивания на наклонной скамье':                           { ru: 'Скручивания на наклонной скамье',                      en: 'Decline Bench Sit-Ups',                     az: 'Meyilli dəzgahda bükülmə' },
  'Скручивания в тренажере':                                   { ru: 'Скручивания в тренажере',                               en: 'Seated Machine Crunch',                     az: 'Maşında oturaraq bükülmə' },
  'Подъем ног в упоре на брусьях':                             { ru: 'Подъем ног в упоре на брусьях',                        en: "Captain's Chair Leg Raise",                 az: 'Kapitan kürsüsündə ayaq qaldırma' },
  // Ноги
  'Сгибания ног лежа':                                         { ru: 'Сгибания ног лежа',                                    en: 'Lying leg curl',                            az: 'Uzanaraq budaq bükülməsi' },
  'Разгибания ног сидя':                                       { ru: 'Разгибания ног сидя',                                  en: 'Seated leg extension',                      az: 'Oturaraq budaq uzanması' },
  'Сведение ног в тренажере сидя':                             { ru: 'Сведение ног в тренажере сидя',                        en: 'Seated hip adduction',                      az: 'Oturaraq budaq yığılması' },
  'Разведение ног в тренажере сидя':                           { ru: 'Разведение ног в тренажере сидя',                      en: 'Seated hip abduction',                      az: 'Oturaraq budaq açılması' },
  'Жим ногами в тренажере':                                    { ru: 'Жим ногами в тренажере',                               en: 'Leg press',                                 az: 'Ayaqla pres' },
  'Приседания со штангой на плечах':                           { ru: 'Приседания со штангой на плечах',                      en: 'Barbell back squat',                        az: 'Çiyində ştanqa ilə squat' },
  'Приседания в Смите (узкая постановка)':                     { ru: 'Приседания в Смите (узкая постановка)',               en: 'Smith squat (narrow stance)',               az: 'Smith squat (dar dayaq)' },
  'Отведения ноги назад в тренажере':                         { ru: 'Отведения ноги назад в тренажере',                     en: 'Cable kickback / hip extension',            az: 'Maşında budaq geri aparma' },
  'Гакк-приседания в тренажере':                               { ru: 'Гакк-приседания в тренажере',                          en: 'Hack squat',                                az: 'Hakk squat' },
  'Разгибания ног в рычажном тренажере':                       { ru: 'Разгибания ног в рычажном тренажере',                  en: 'Lever leg extension',                       az: 'Qolu maşınında budaq uzanması' },
  'Подъем на носки сидя (рычажный)':                           { ru: 'Подъем на носки сидя (рычажный)',                     en: 'Seated calf raise (machine)',               az: 'Oturaraq baldır (maşın)' },
  'Эллиптический тренажер':                                    { ru: 'Эллиптический тренажер',                               en: 'Elliptical trainer',                        az: 'Elliptik trenajor' },
  'Велотренажер (вертикальный)':                               { ru: 'Велотренажер (вертикальный)',                          en: 'Upright exercise bike',                   az: 'Şaquli velotrenajor' },
  // Спина
  'Тяга штанги в наклоне':                                     { ru: 'Тяга штанги в наклоне',                                en: 'Bent-over barbell row',                     az: 'Əyilmiş ştanqa çəkişi' },
  'Становая тяга со штангой':                                  { ru: 'Становая тяга со штангой',                             en: 'Barbell deadlift',                          az: 'Ştanqa ilə deadlift' },
  'Шраги со штангой':                                          { ru: 'Шраги со штангой',                                     en: 'Barbell shrugs',                            az: 'Ştanqa ilə çiyn qaldırma' },
  'Горизонтальная тяга в тренажере (Hammer)':                  { ru: 'Горизонтальная тяга в тренажере (Hammer)',             en: 'Hammer Strength row',                       az: 'Hammer üfüqi çəkiş' },
  'Тяга Т-грифа в наклоне':                                    { ru: 'Тяга Т-грифа в наклоне',                               en: 'T-bar row',                                 az: 'T-bar çəkişi' },
  'Тяга Т-грифа с упором в грудь':                             { ru: 'Тяга Т-грифа с упором в грудь',                        en: 'Chest-supported T-bar row',               az: 'Döşə söykənən T-bar çəkişi' },
  'Рычажная тяга с упором грудью':                             { ru: 'Рычажная тяга с упором грудью',                        en: 'Chest-supported lever row',               az: 'Döşə söykənən qolu çəkiş' },
  'Вертикальная тяга параллельным хватом':                     { ru: 'Вертикальная тяга параллельным хватом',               en: 'Neutral-grip lat pulldown',                 az: 'Neytral tutumlu lat aşağı çəkiş' },
  'Тяга верхнего блока к груди (широкий хват)':                { ru: 'Тяга верхнего блока к груди (широкий хват)',          en: 'Wide-grip lat pulldown',                    az: 'Geniş tutumlu lat çəkişi' },
  'Рычажная тяга параллельным хватом':                         { ru: 'Рычажная тяга параллельным хватом',                    en: 'Seated lever row (neutral grip)',           az: 'Neytral tutumlu qolu çəkiş' },
  'Тяга верхнего блока (дуговой тренажёр)':                    { ru: 'Тяга верхнего блока (дуговой тренажёр)',              en: 'Diverging lat pulldown',                    az: 'Qövs lat aşağı çəkişi' },
  'Гиперэкстензия':                                            { ru: 'Гиперэкстензия',                                       en: 'Back extension (hyperextension)',         az: 'Arxa uzanması (hiperextension)' },
  'Подтягивания широким хватом':                               { ru: 'Подтягивания широким хватом',                          en: 'Wide-grip pull-ups',                        az: 'Geniş tutumlu dartılmalar' },
}

// ─── Difficulty labels ────────────────────────────────────────────────────────

const DIFFICULTY_LABELS: Record<string, Record<Language, string>> = {
  'Начинающий':  { ru: 'Начинающий', en: 'Beginner',     az: 'Başlanğıc' },
  'Новичок':     { ru: 'Новичок',    en: 'Beginner',     az: 'Başlanğıc' },
  'Средний':     { ru: 'Средний',    en: 'Intermediate', az: 'Orta' },
  'Продвинутый': { ru: 'Продвинутый',en: 'Advanced',     az: 'İrəliləmiş' },
  'Базовый':     { ru: 'Базовый',    en: 'Basic',        az: 'Əsas' },
}

// ─── Public helpers ───────────────────────────────────────────────────────────

export function translateGroupName(russianName: string, language: Language): string {
  return GROUP_NAMES[russianName]?.[language] ?? russianName
}

export function translateMuscleName(russianName: string, language: Language): string {
  return MUSCLE_NAMES[russianName]?.[language] ?? GROUP_NAMES[russianName]?.[language] ?? russianName
}

export function translateExerciseName(russianName: string, language: Language): string {
  return EXERCISE_NAMES[russianName]?.[language] ?? russianName
}

export function translateEquipment(russianName: string, language: Language): string {
  return EQUIPMENT_NAMES[russianName]?.[language] ?? russianName
}

export function translateDifficulty(russianName: string, language: Language): string {
  return DIFFICULTY_LABELS[russianName]?.[language] ?? russianName
}

// ─── Exercise descriptions (EN / AZ only; RU falls back to original data) ─────

type LangMap = { en: string; az: string }

const EXERCISE_DESCRIPTIONS: Record<string, LangMap> = {
  'Жим штанги лежа': {
    en: 'The classic compound chest exercise. A wide grip maximally engages the pectoralis major, building both strength and mass.',
    az: 'Klassik mürəkkəb döş əzələsi məşqi. Geniş tutum pectoralis major-u maksimal cəlb edərək güc və kütlə inkişaf etdirir.',
  },
  'Жим штанги на наклонной скамье': {
    en: 'Classic incline barbell press targeting the upper chest (clavicular head of pectoralis major). Best results at a 30–45° angle.',
    az: 'Üst döş əzələsini hədəf alan klassik meyilli ştanqa presi. 30–45° bucaqda ən yaxşı nəticəni verir.',
  },
  'Сведение рук в тренажере (Бабочка)': {
    en: 'Isolation exercise that targets the inner chest with constant tension throughout the range of motion.',
    az: 'Bütün hərəkət boyunca sabit gərginliklə daxili döş əzələsini hədəf alan izolyasiya məşqi.',
  },
  'Жим в рычажном тренажере под углом': {
    en: 'Hammer machine incline press for the upper chest. Fixed trajectory keeps joints safe while you focus on the stretch and contraction.',
    az: 'Üst döş əzələsi üçün hammer maşın meyilli presi. Sabit traektoriya oynaqları qoruyur.',
  },
  'Жим в рычажном тренажере сидя': {
    en: 'Machine chest press targeting the mid and lower chest. The hammer design allows safe heavy loading with minimal stabilizer demand.',
    az: 'Orta və alt döş əzələsini hədəf alan maşın döş presi.',
  },
  'Жим в рычажном тренажере под углом (вверх)': {
    en: 'Incline hammer press with emphasis on the upper chest and front delts. Minimizes lower-back stress.',
    az: 'Üst döş əzələsi və ön deltaya vurğu ilə meyilli hammer presi.',
  },
  'Жим гантелей на наклонной скамье': {
    en: 'Best exercise for upper-chest symmetry and deep stretch. Dumbbells allow greater range of motion and independent arm work.',
    az: 'Üst döş simmetriyası üçün ən yaxşı məşq. Hantellər daha geniş hərəkət diapazonuna icazə verir.',
  },
  'Жим гантелей на горизонтальной скамье': {
    en: 'Fundamental chest builder. Dumbbell pressing provides greater range of motion and challenges stabilizer muscles for balanced development.',
    az: 'Fundamental döş məşqi. Hantelli pres daha geniş hərəkət diapazonu verir.',
  },
  'Разведение гантелей лежа': {
    en: 'Isolation movement that stretches and sculpts the chest without engaging the triceps. Focus on the mid-chest contraction.',
    az: 'Trisepsi cəlb etmədən döş əzələsini uzadan izolyasiya hərəkəti.',
  },
  'Сведения в кроссовере сверху вниз': {
    en: 'Cable fly from high pulleys. The downward arc perfectly follows the sternal chest fibers, providing constant tension and a strong peak contraction.',
    az: 'Yuxarı blokdan kabel açılışı. Aşağıya doğru qövs döş liflərini izləyir.',
  },
  'Сведение рук в кроссовере стоя': {
    en: 'Cable crossover fly providing constant resistance across the full range of motion — impossible to replicate with free weights.',
    az: 'Bütün hərəkət boyunca sabit müqavimət təmin edən kabel keçid açılışı.',
  },
  'Сведения в кроссовере с нижних блоков': {
    en: 'Low-to-high cable fly targeting the upper (clavicular) chest. The upward arc maximally contracts the upper pec fibers.',
    az: 'Üst döş əzələsini hədəf alan aşağıdan yuxarı kabel açılışı.',
  },
  'Французский жим лёжа': {
    en: 'Skull crusher — isolation exercise loading all three tricep heads, especially the long head via deep stretch in the bottom position.',
    az: 'Kəllə əzici — xüsusilə uzun başı hədəf alan, bütün üç triseps başını yükləyən izolyasiya məşqi.',
  },
  'Сгибания рук в тренажере': {
    en: 'Machine preacher curl for maximum bicep and brachialis isolation. Locked elbows eliminate cheating for a peak squeeze at the top.',
    az: 'Maksimum biseps izolyasiyası üçün maşınla preacher curl. Sabit dirsəklər aldatmanı aradan qaldırır.',
  },
  'Разгибания на трицепс на верхнем блоке (EZ-гриф)': {
    en: 'Cable tricep pushdown with EZ bar. Constant cable tension and a wrist-friendly grip let you isolate all three tricep heads.',
    az: 'EZ bar ilə kabel triseps itərmə. Sabit kabel gərginliyi bütün üç triseps başını izolyasiya edir.',
  },
  'Разгибания на трицепс с канатом': {
    en: 'Rope tricep pushdown with extra ROM at the bottom — spreading the rope ends amplifies the peak lateral-head contraction.',
    az: 'Kənaf triseps itərmə. Aşağı nöqtədə kənafı yaymaq lateral başın pik yığılmasını gücləndirir.',
  },
  'Подъём штанги на бицепс стоя': {
    en: 'Fundamental bicep builder with free weights. Engages both heads plus brachialis, requiring strict form to avoid cheating.',
    az: 'Azad çəkilərlə fundamental biseps məşqi. Hər iki başı cəlb edir, aldatmamaq üçün ciddi texnika tələb edir.',
  },
  'Сгибания рук на скамье Скотта': {
    en: 'Preacher curl — the bench locks your arms completely, eliminating cheating for maximum bicep isolation and peak development.',
    az: 'Preacher curl — dəzgah qollarınızı tamamilə sabitləşdirir, maksimum biseps izolyasiyası üçün.',
  },
  'Сгибания рук со штангой обратным хватом': {
    en: 'Reverse curl shifting load to the brachialis and brachioradialis. Builds forearm thickness and grip strength.',
    az: 'Yükü brachialis və brachioradialis-ə yönəldən əks tutumlu curl. Ön qol qalınlığını artırır.',
  },
  'Поочередные сгибания рук с гантелями': {
    en: 'Alternating dumbbell curl with supination for peak bicep contraction. Single-arm focus eliminates imbalances.',
    az: 'Pik biseps yığılması üçün supinasiyalı növbəli hantelli curl. Bir qolla diqqət asimmetriyanı aradan qaldırır.',
  },
  'Сгибания рук "Молотки"': {
    en: 'Hammer curl with neutral grip targeting the brachialis and brachioradialis — builds overall arm thickness and grip strength.',
    az: 'Brachialis-i hədəf alan neytral tutumlu çəkic curl — ümumi qol qalınlığı üçün.',
  },
  'Сгибания рук на наклонной скамье': {
    en: 'Incline bench curl maximizing long-head stretch. The angle creates deep tension at the bottom for superior bicep peak development.',
    az: 'Uzun başın uzanmasını maksimallaşdıran meyilli dəzgahda curl. Pik biseps inkişafı üçün.',
  },
  'Разгибание одной руки обратным хватом': {
    en: 'Single-arm reverse-grip cable pushdown targeting the medial tricep head. Fixes arm imbalances with precise isolation.',
    az: 'Medial triseps başını hədəf alan bir qolla əks tutumlu kabel itərmə.',
  },
  'Разгибания рук из-за головы на блоке (канат)': {
    en: 'Overhead rope extension with maximum long-head stretch. Rope allows wider spread at the top for superior peak contraction.',
    az: 'Maksimum uzun baş uzanması ilə başın arxasından kənaf uzanması.',
  },
  'Сгибания рук на нижнем блоке (прямая рукоять)': {
    en: 'Low cable bicep curl providing constant tension throughout the full range — better pump than free weights due to consistent resistance.',
    az: 'Tam hərəkət boyunca sabit gərginlik verən aşağı kabel biseps curl.',
  },
  'Отжимания на трицепс в тренажере': {
    en: 'Machine seated dip hitting all three tricep heads safely. Fixed track allows heavy loads with full control.',
    az: 'Bütün üç triseps başını güvənli şəkildə hədəf alan maşında oturaraq dip.',
  },
  'Французский жим в тренажере сидя': {
    en: 'Machine overhead tricep extension isolating the long head. Machine stability allows safe deep stretch under load.',
    az: 'Uzun başı izolyasiya edən maşında oturaraq overhead triseps uzanması.',
  },
  'Обратные разведения в тренажере (Reverse Fly)': {
    en: 'Isolation exercise for the rear deltoid. Improves posture and builds the rounded 3D shoulder shape while minimizing upper-back involvement.',
    az: 'Arxa delta üçün izolyasiya məşqi. Duruşu yaxşılaşdırır və yuvarlaq 3D çiyin forması yaradır.',
  },
  'Жим на плечи в рычажном тренажере': {
    en: 'Compound shoulder press in a lever machine. Stable trajectory lets you safely overload the front and mid delts.',
    az: 'Qolu maşınında mürəkkəb çiyin presi. Sabit traektoriya ön və orta deltaları güvənli şəkildə yükləyir.',
  },
  'Жим гантелей сидя': {
    en: 'Seated dumbbell shoulder press with full range of motion. Each arm works independently, correcting muscle imbalances.',
    az: 'Tam hərəkət diapazonu ilə oturaraq hantelli çiyin presi. Hər qol müstəqil işləyir.',
  },
  'Разводка гантелей в стороны': {
    en: 'Lateral raise isolating the middle delt to build shoulder width and definition.',
    az: 'Çiyin enini artırmaq üçün orta deltanı izolyasiya edən yan qaldırma.',
  },
  'Подъем гантелей перед собой': {
    en: 'Front raise isolating the anterior deltoid to define the front line of the shoulder.',
    az: 'Çiyinin ön xəttini müəyyənləşdirmək üçün ön deltanı izolyasiya edən öndən qaldırma.',
  },
  'Разведение гантелей в наклоне сидя': {
    en: 'Seated bent-over fly for the rear delt. Seated position minimizes cheating for maximum isolation of the posterior deltoid.',
    az: 'Arxa delta üçün oturaraq əyilib açılış. Oturaraq mövqe aldatmanı minimuma endirir.',
  },
  'Лицевая тяга на верхнем блоке': {
    en: 'Cable face pull for the rear delt and rotator cuff. Fixes "rounded shoulders" and improves shoulder joint stability.',
    az: 'Arxa delta və rotator manjet üçün kabel üz tərəfə çəkiş. "Yuvarlaq çiynlər" problemini düzəldir.',
  },
  'Разведения в тренажере на среднюю дельту': {
    en: 'Machine lateral raise isolating the middle delt. Machine keeps trap involvement minimal and technique consistent.',
    az: 'Orta deltanı izolyasiya edən maşın yan qaldırması. Trapez iştirakını minimuma endirir.',
  },
  'Скручивания на наклонной скамье': {
    en: 'Decline bench crunch loading the rectus abdominis along its full length. Adjustable angle controls difficulty.',
    az: 'Enli qarın əzələsini bütün uzunluğu boyunca yükləyən meyilli dəzgahda bükülmə.',
  },
  'Скручивания в тренажере': {
    en: 'Machine crunch with added resistance for constant tension across the full ab range. Targets rectus abdominis deeply.',
    az: 'Tam qarın diapazonu boyunca sabit gərginlik üçün əlavə müqavimətli maşın bükülməsi.',
  },
  'Подъем ног в упоре на брусьях': {
    en: "Captain's chair leg raise targeting the lower abs. Forearm support fixes the torso so you isolate the abs without momentum.",
    az: 'Alt qarını hədəf alan kapitan kürsüsündə ayaq qaldırma. Ön qol dayağı gövdəni sabitləşdirir.',
  },
  // Ноги
  'Сгибания ног лежа': {
    en: 'Isolation exercise for the hamstrings. The machine keeps tension constant and lets you train knee flexion safely at different angles.',
    az: 'Arxa budaq əzələləri üçün izolyasiya məşqi. Maşın sabit gərginlik saxlayır və diz bükülməsini müxtəlif bucaqlarda təhlükəsiz yükləyir.',
  },
  'Разгибания ног сидя': {
    en: 'Isolation for the quadriceps. Loads the front of the thigh without involving the lower back or glutes.',
    az: 'Kvadriseps üçün izolyasiya. Budaqın önünü bel və kalçanı cəlb etmədən yükləyir.',
  },
  'Сведение ног в тренажере сидя': {
    en: 'Isolation for the hip adductors. Strengthens inner thighs and improves hip stability, often undertrained in big compound lifts.',
    az: 'Budaq yığıcılar üçün izolyasiya. Budaqın daxili tərəfini möhkəmləndirir və kalça stabilliyini yaxşılaşdırır.',
  },
  'Разведение ног в тренажере сидя': {
    en: 'Isolation for the outer thigh and glutes. Improves hip contour and hip-joint stability.',
    az: 'Budağın xarici tərəfi və kalça üçün izolyasiya. Kalça konturu və oynağın stabilliyini yaxşılaşdırır.',
  },
  'Жим ногами в тренажере': {
    en: 'Compound leg movement for quads, glutes, and hamstrings. Full back support allows heavy loads with less spinal stress than squats.',
    az: 'Kvadriseps, kalça və arxa budaq üçün mürəkkəb ayaq hərəkəti. Tam arxa dəstəyi squatdan daha az onurğa yükü ilə böyük çəki imkanı verir.',
  },
  'Приседания со штангой на плечах': {
    en: 'Foundational squat pattern: quads, glutes, hamstrings, and core stabilizers. Key lift for overall leg strength and mass.',
    az: 'Əsas squat: kvadriseps, kalça, arxa budaq və özək stabilizatorları. Ümumi ayaq gücü və kütləsi üçün əsas məşq.',
  },
  'Приседания в Смите (узкая постановка)': {
    en: 'Smith squat with a narrow stance shifts emphasis to the outer quad while the fixed bar path keeps the movement stable.',
    az: 'Dar dayaqla Smith squat xarici kvadrisepsə vurğu verir, sabit bar traektoriyası hərəkəti stabil saxlayır.',
  },
  'Отведения ноги назад в тренажере': {
    en: 'Isolation for the glutes. The machine fixes the torso and guides hip extension so you load the glute max with minimal lower-back help.',
    az: 'Kalça üçün izolyasiya. Maşın gövdəni sabitləşdirir və kalça uzanmasını yönləndirir, bel köməyini minimuma endirir.',
  },
  'Гакк-приседания в тренажере': {
    en: 'Hack squat mimics a barbell squat with less stabilizer demand and a fixed path for deep quad work.',
    az: 'Hakk squat stabilizator tələbin azaldan, dərin kvadriseps üçün sabit traektoriyalı ştanqa squatına bənzəyir.',
  },
  'Разгибания ног в рычажном тренажере': {
    en: 'Lever leg extension for quads with a natural arc and strong peak contraction at full knee extension.',
    az: 'Təbii qövs və dizin tam uzanmasında güclü pik yığılması ilə qolu maşınında budaq uzanması.',
  },
  'Подъем на носки сидя (рычажный)': {
    en: 'Isolation for the soleus and calves. Plate-loaded levers give smooth resistance and fine load control.',
    az: 'Düzənəkvari və baldır əzələləri üçün izolyasiya. Disk yüklü qollar hamar müqavimət verir.',
  },
  'Эллиптический тренажер': {
    en: 'Low-impact cardio for upper and lower body. Good for fat loss, warm-up, or cool-down with gentle stress on knees and ankles.',
    az: 'Üst və alt bədən üçün aşağı təsirli kardio. Arıqlama, isinmə/soyumə üçün diz və bilək üçün yumşaq yüklə uyğundur.',
  },
  'Велотренажер (вертикальный)': {
    en: 'Upright bike for cardio endurance and heart health. Low joint impact and easy intensity control.',
    az: 'Şaquli velosiped dayanıqlılıq və ürək sağlamlığı üçün. Oynaqlara az təsir, intensivliyi asan tənzimləmə.',
  },
  // Спина
  'Тяга штанги в наклоне': {
    en: 'Heavy compound row for lats, traps, and upper back; spinal erectors work hard to brace the torso.',
    az: 'Enli əzələ, trapezius və üst arxa üçün ağır mürəkkəb çəkiş; gövdəni sabitləmək üçün onurğa dartıcıları işləyir.',
  },
  'Становая тяга со штангой': {
    en: 'Foundational hinge pattern loading the whole posterior chain from calves and hamstrings through glutes, lats, and traps.',
    az: 'Baldırdan və arxa budaqdan kalça, enli və trapeziusa qədər bütün arxa zənciri yükləyən əsas hinge hərəkəti.',
  },
  'Шраги со штангой': {
    en: 'Isolation for the upper traps: vertical shoulder elevation against load for thickness and strength.',
    az: 'Üst trapezius üçün izolyasiya: çiyinləri şaquli qaldırma, qalınlıq və güc üçün.',
  },
  'Горизонтальная тяга в тренажере (Hammer)': {
    en: 'Horizontal row for back thickness. Independent arms reduce side-to-side imbalance and improve contraction.',
    az: 'Arxa qalınlığı üçün üfüqi çəkiş. Müstəqil qollar tərəf asimmetriyasını azaldır, yığılmayı yaxşılaşdırır.',
  },
  'Тяга Т-грифа в наклоне': {
    en: 'Free T-bar row for dense lats, rhomboids, and traps with a natural pulling arc.',
    az: 'Təbii çəkmə qövsü ilə sıx enli, romboid və trapezius üçün sərbəst T-bar çəkişi.',
  },
  'Тяга Т-грифа с упором в грудь': {
    en: 'Chest-supported T-bar row isolates the back, cuts cheating, and reduces axial loading on the spine.',
    az: 'Döşə söykənən T-bar çəkişi arxanı izolyasiya edir, aldatmanı kəsir, onurğa oxial yükünü azaldır.',
  },
  'Рычажная тяга с упором грудью': {
    en: 'Lever row with chest pad for mid-back and lats: strict form and a deep squeeze at the finish.',
    az: 'Orta arxa və enli üçün döş yastıqlı qolu çəkiş: ciddi forma və sonda dərin sıxılma.',
  },
  'Вертикальная тяга параллельным хватом': {
    en: 'Neutral-grip lat pulldown emphasizing lower lats and rhomboids with a comfortable elbow path.',
    az: 'Neytral tutumlu lat aşağı çəkiş alt enli və romboidlərə vurğu verir, dirsək yolu rahatdır.',
  },
  'Тяга верхнего блока к груди (широкий хват)': {
    en: 'Wide-grip pulldown for back width; lats dominate with less biceps involvement than a narrow grip.',
    az: 'Arxa eni üçün geniş tutumlu aşağı çəkiş; dar tutuma nisbətən daha az biseps, əsasən enli.',
  },
  'Рычажная тяга параллельным хватом': {
    en: 'Seated neutral-grip lever row: natural elbow line, strong scapular retraction, and mid-back thickness.',
    az: 'Oturaraq neytral tutumlu qolu çəkiş: təbii dirsək xətti, güclü kürək yığılması, orta arxa qalınlığı.',
  },
  'Тяга верхнего блока (дуговой тренажёр)': {
    en: 'Diverging machine pulldown mimics natural arm paths for a long stretch at the top and a deep lat squeeze at the bottom.',
    az: 'Ayrılan maşın lat çəkişi təbii qol yollarını təqlid edir: yuxarıda uzanma, aşağıda dərin enli sıxılması.',
  },
  'Гиперэкстензия': {
    en: 'Back extension for spinal erectors, glutes, and hamstrings; builds posture and lumbar stability for heavy lifts.',
    az: 'Onurğa dartıcıları, kalça və arxa budaq üçün arxa uzanması; ağır məşqlər üçün duruş və bel stabilliyi.',
  },
  'Подтягивания широким хватом': {
    en: 'Bodyweight staple for lat width; wide grip biases the outer back for a strong V-taper.',
    az: 'Enli arxa üçün bədən çəkisi əsas məşq; geniş tutum xarici arxaya vurğu verir, V formalı siluet yaradır.',
  },
}

// ─── Exercise tips (EN / AZ only) ─────────────────────────────────────────────

const EXERCISE_TIPS: Record<string, { en: string[]; az: string[] }> = {
  'Жим штанги лежа': {
    en: ['Squeeze shoulder blades together for a stable shoulder base', 'Use a grip 1.5× shoulder width', 'Lower the bar to your lower chest', 'Keep feet firmly planted on the floor', "Don't arch your lower back excessively"],
    az: ['Sabit çiyin əsası üçün kürək sümüklərini bir-birinə sıxın', '1.5× çiyin genişliyində tutum istifadə edin', 'Barı alt döşünüzə endirin', 'Ayaqları möhkəm yerə basın', 'Bel bölgəsini həddindən artıq əymək olmaz'],
  },
  'Жим штанги на наклонной скамье': {
    en: ['Set bench angle 30–45° (30° for maximum upper-chest activation)', 'Keep chest open, shoulder blades retracted', 'Lower bar to upper chest, elbows ~45° from torso', "Don't over-arch the lower back"],
    az: ['Dəzgah bucağını 30–45° qurun (30° maksimum üst döş aktivasiyası üçün)', 'Döşü açıq, kürək sümüklərini geri çəkin', 'Barı üst döşə endirin, dirsəklər gövdədən ~45°'],
  },
  'Сведение рук в тренажере (Бабочка)': {
    en: ['Adjust seat so hands and elbows are at mid-chest level', 'Press back and head firmly against the pad', 'Bring arms together smoothly with a strong chest squeeze', "Don't swing arms too far back", 'Keep elbows slightly bent throughout'],
    az: ['Oturacağı əl və dirsəklər orta döş səviyyəsində olacaq şəkildə tənzimləyin', 'Arxa və başı yastığa möhkəm basın', 'Qolları hamar şəkildə bir araya gətirin', 'Qolları çox geriyə aparmayın'],
  },
  'Жим в рычажном тренажере под углом': {
    en: ['Set seat so handles align with your upper chest', 'Keep shoulder blades and hips against pad throughout', 'Lower handles to a deep chest stretch', 'Press up powerfully on exhale without locking elbows', 'Keep elbows slightly down, not raised toward ears'],
    az: ['Tutacaqlar üst döşünüzlə uyğun olacaq şəkildə oturacağı tənzimləyin', 'Kürək sümüklərini və kalçanı bütün məşq boyunca yastığa saxlayın'],
  },
  'Жим в рычажном тренажере сидя': {
    en: ['Set seat so handles align with mid-chest', 'Keep back against pad, natural lumbar curve', 'Press handles forward, focusing on squeezing elbows together', "Don't fully lock elbows at the top", 'Lower smoothly to a comfortable stretch'],
    az: ['Tutacaqlar orta döşlə uyğun olacaq şəkildə oturacağı tənzimləyin', 'Arxanı yastığa söykəyin, natural bel əyrisini qoruyun'],
  },
  'Жим гантелей на наклонной скамье': {
    en: ['Set angle 30–45°', 'Maximum stretch at the bottom (dumbbells just below shoulders)', "Don't bang dumbbells at the top — keep tension", 'Arc the dumbbells together at the top', 'Control the negative 2–3 seconds'],
    az: ['Bucağı 30–45° qurun', 'Aşağıda maksimum uzanma (hantellər çiyinlərin altında)', 'Yuxarıda hantelli vurmayın — gərginliyi qoruyun'],
  },
  'Жим гантелей на горизонтальной скамье': {
    en: ['Start with dumbbells at mid-chest level', 'Lower dumbbells with control, feeling the chest stretch', "At the top, draw dumbbells together but don't bang them", 'Keep elbows 45–60° from torso', 'Feet flat on floor, shoulder blades retracted'],
    az: ['Hantellərə orta döş səviyyəsindən başlayın', 'Döş uzanmasını hiss edərək hantelli nəzarətlə endirin'],
  },
  'Разведение гантелей лежа': {
    en: ['Keep elbows slightly bent ("soft") throughout', 'Lower dumbbells in a wide arc to chest level for a strong stretch', "At the top, don't clang dumbbells — stop just short", 'Smooth, controlled movement — no momentum', 'Keep shoulder blades and hips pressed against bench'],
    az: ['Bütün məşq boyunca dirsəkləri bir az bükülmüş saxlayın', 'Geniş qövsdə hantelli döş səviyyəsinə endirin'],
  },
  'Сведения в кроссовере сверху вниз': {
    en: ['Set pulleys high', 'Hands travel down and inward along an arc, meeting at belly/below-chest level', 'Hold the bottom squeeze 1–2 seconds', 'Slight forward lean for better stretch', 'Movement only at the shoulder joint — no swinging'],
    az: ['Blokaları yuxarı qurun', 'Əllər aşağı və içəriyə qövs boyunca hərəkət edir', 'Aşağı sıxılmanı 1–2 saniyə saxlayın'],
  },
  'Сведение рук в кроссовере стоя': {
    en: ['Step forward for stability, slight forward lean (back straight)', 'Keep elbows slightly bent and fixed throughout', 'Draw hands in front, squeezing chest hard at the meeting point', 'Open arms to shoulder level — feel the stretch', 'Move smoothly, no jerks or body momentum'],
    az: ['Sabitlik üçün irəliyə addım atın, yüngül irəliyə meyl (arxa düz)', 'Dirsəkləri yüngül bükülmüş və sabit saxlayın'],
  },
  'Сведения в кроссовере с нижних блоков': {
    en: ['Set pulleys at lowest position', 'Step one foot forward, torso upright or slightly leaned back', 'Bring handles together at chin/above level', 'Hold 1 second at the top for peak contraction', 'Keep elbows softly bent throughout'],
    az: ['Blokları ən aşağı vəziyyətə qurun', 'Bir ayağı irəliyə qoyun, gövdə dik və ya yüngül geriyə', 'Tutacaqları çənə/yuxarı səviyyəsində bir araya gətirin'],
  },
  'Французский жим лёжа': {
    en: ['Fix elbows in place — they must not flare out or drop toward chest', 'Lower the bar slowly to forehead or just behind head', 'Fully extend arms at the top, avoid hard elbow lock', 'Keep shoulders pressed against the bench', 'Control the negative — this is key for the long head'],
    az: ['Dirsəkləri yerinde sabitləşdirin — onlar açılmamalı və ya döşə düşməməlidir', 'Barı yavaşca alına və ya başın arxasına endirin'],
  },
  'Сгибания рук в тренажере': {
    en: ['Adjust seat so armpits are firmly against the top of the pad, shoulders locked', 'Press triceps and elbows against platform — never lift them', 'Curl smoothly, squeeze at the top for 1 sec', "Don't fully extend at the bottom — keep bicep tension", 'Keep wrists neutral throughout'],
    az: ['Qoltuqaltılar yastığın üst hissəsinə möhkəm dəyəcək şəkildə oturacağı tənzimləyin', 'Trisepsi və dirsəkləri platforma sıxın'],
  },
  'Разгибания на трицепс на верхнем блоке (EZ-гриф)': {
    en: ['Face the cable, take EZ bar overhand, elbows pinned to sides — they stay fixed', 'Fully extend at the bottom, pause 1 sec, maximum tricep squeeze', 'Control the return — resist the weight coming up', "Don't raise the weight above chest/shoulder level", 'Only forearms move — shoulders stay as a hinge'],
    az: ['Kabelə üz tutun, EZ barı yuxarı tutumla alın, dirsəklər yanlarda sabitlənir', 'Aşağıda tam uzadın, 1 san. pauza, maksimum triseps sıxılması'],
  },
  'Разгибания на трицепс с канатом': {
    en: ['Face cable, neutral grip (palms in), elbows pinned to torso and fixed', 'At bottom, spread rope ends outward for max lateral-head squeeze — hold 1 sec', 'Slow controlled return (2–3 sec)', 'Keep torso still — slight forward lean, back straight', 'Only forearms move'],
    az: ['Kabelə üz tutun, neytral tutum, dirsəklər gövdəyə sabitlənir', 'Aşağıda kənafı açın — maksimum sıxılma, 1 san. saxla'],
  },
  'Подъём штанги на бицепс стоя': {
    en: ['Stand tall, feet shoulder-width, elbows pinned to sides — do not let them drift forward', 'Curl smoothly to upper chest, squeeze at the top (1 sec)', 'Lower slowly 2–3 sec, keep slight elbow bend at the bottom', "Don't swing the torso — if you must, reduce weight", 'Exhale on the curl, inhale on the way down'],
    az: ['Düz durun, ayaqlar çiyin genişliyinde, dirsəklər yanlarda sabit', 'Hamar şəkildə üst döşə çekin, yuxarıda sıxın (1 san.)'],
  },
  'Сгибания рук на скамье Скотта': {
    en: ['Sit so armpits are against top of pad and chest rests on the platform', 'Grip shoulder-width (supinated), arms fully extended but not hard-locked', 'Curl smoothly to shoulder level, squeeze bicep at top (1 sec)', 'Lower slowly 2–3 sec, do not fully extend at the bottom', 'Keep wrists neutral throughout'],
    az: ['Qoltuqaltılar yastığın üst hissəsinə dəyəcək şəkildə oturun', 'Çiyin genişliyindəki tutum, qollar tam uzadılmış'],
  },
  'Сгибания рук со штангой обратным хватом': {
    en: ['Overhand (pronated) grip, shoulder-width or slightly narrower for brachioradialis focus', 'Stand tall, elbows pinned, no swinging', 'Curl to shoulder level, squeeze forearms and brachialis at the top (1 sec)', 'Lower slowly 2–3 sec', 'Use EZ bar if wrists are uncomfortable'],
    az: ['Yuxarı tutum (pronated), çiyin genişliyindən bir az dar', 'Düz durun, dirsəklər sabit, sallanmayın'],
  },
  'Поочередные сгибания рук с гантелями': {
    en: ['Stand tall, elbows glued to sides', 'Start with neutral grip, supinate on the way up for peak bicep squeeze', 'Curl to shoulder level, squeeze (1 sec)', 'Lower slowly (2–3 sec), reverse the supination back to neutral', 'Alternate arms — keep torso still'],
    az: ['Düz durun, dirsəklər yanlarda sabit', 'Neytral tutumdan başlayın, qaldırarkən supinasiya edin'],
  },
  'Сгибания рук "Молотки"': {
    en: ['Neutral grip (palms facing each other) throughout — this is key', 'Stand tall, elbows pinned, no swinging', 'Curl to shoulder level, feel the tension in outer arm and forearm at top (1 sec)', 'Lower slowly 2–3 sec — full stretch at bottom', 'Do seated to eliminate body cheating'],
    az: ['Bütün məşq boyunca neytral tutum (ovuclar bir-birini görür)', 'Düz durun, dirsəklər sabit, sallanmayın'],
  },
  'Сгибания рук на наклонной скамье': {
    en: ['Set bench 45–60° — more incline means more long-head stretch', 'Keep back, shoulder blades, and head against pad throughout', 'Start neutral grip, supinate on the way up', 'Elbows locked pointing downward — do not let them swing forward', 'Full stretch at the bottom, controlled negative 2–3 sec'],
    az: ['Dəzgahı 45–60° qurun', 'Arxa, kürək sümükləri və baş bütün məşq boyunca yastıqda'],
  },
  'Разгибание одной руки обратным хватом': {
    en: ['Supinated (underhand) grip — key for medial tricep head', 'Stand side-on to cable, working elbow pinned to torso', 'Fully extend downward, pause 1 sec, squeeze tricep', 'Slow controlled return 2–3 sec', 'Brace with the free hand on the cable frame for stability'],
    az: ['Supinasiyalı (aşağı) tutum — medial triseps başı üçün vacib', 'Kabelə yan durun, çalışan dirsək gövdəyə sabit'],
  },
  'Разгибания рук из-за головы на блоке (канат)': {
    en: ['Stand facing away from cable, one foot forward, slight forward lean', 'Arms overhead, elbows close to head and pointing up', 'Extend fully upward, spread rope ends at top (1 sec)', 'Lower behind head slowly 2–3 sec — feel the long-head stretch', 'Core braced, no lower-back arch'],
    az: ['Kabelə arxa durun, bir ayaq irəlidə, yüngül irəliyə meyl', 'Qollar başın üstündə, dirsəklər başa yaxın'],
  },
  'Сгибания рук на нижнем блоке (прямая рукоять)': {
    en: ['Face low cable, supinated grip shoulder-width, step back slightly for constant tension', 'Elbows pinned to sides, only forearms move', 'Curl to upper chest, squeeze at top (1 sec peak)', "Don't lean back or use body momentum", 'Lower slowly 2–3 sec, keep cable taut at the bottom'],
    az: ['Aşağı kabelə üz tutun, supinasiyalı tutum, sabit gərginlik üçün geri çəkilin', 'Dirsəklər yanlarda sabit'],
  },
  'Отжимания на трицепс в тренажере': {
    en: ['Keep back firmly against the pad', "Don't flare elbows too wide — keep them in for tricep focus", 'Fully extend at the bottom, squeeze tricep, avoid "locking out" the joint', 'Raise handles back to forearms-parallel with controlled movement', "Keep shoulders down — don't shrug"],
    az: ['Arxanı möhkəm yastığa saxlayın', 'Dirsəkləri çox açmayın — triseps üçün yaxın saxlayın'],
  },
  'Французский жим в тренажере сидя': {
    en: ['Keep back flat against the pad, no lower-back arch', 'Keep elbows pointed upward, not flared wide', 'Lower handle behind head to a comfortable stretch', 'Exhale and extend powerfully, full tricep squeeze at top', 'Smooth controlled movement — no jerks'],
    az: ['Arxanı yastığa sabit saxlayın', 'Dirsəkləri yuxarıya yönəldin, geniş açmayın'],
  },
  'Обратные разведения в тренажере (Reverse Fly)': {
    en: ['Adjust seat so arms are parallel to floor', 'Keep elbows slightly bent, leading with them — not straight arms', 'Pull arms back to shoulder level, focus on rear delts', "Don't let weight fully reset — keep tension", 'Press chest against pad, avoid using body'],
    az: ['Qollar yerə paralel olacaq şəkildə oturacağı tənzimləyin', 'Dirsəkləri yüngül bükülmüş saxlayın, dirsəklə aparın'],
  },
  'Жим на плечи в рычажном тренажере': {
    en: ['Adjust seat so handles are at or just above shoulder level at the bottom', 'Keep back and head against pad, no excessive lower-back arch', 'Press up on exhale — do not fully lock elbows at top', 'Control the descent, do not let weight drop', 'Keep elbows angled slightly forward to reduce joint stress'],
    az: ['Aşağıda tutacaqlar çiyin səviyyəsindədir şəkildə tənzimləyin', 'Arxa və baş yastığa saxlayın'],
  },
  'Жим гантелей сидя': {
    en: ['Set bench back to 80–90° for solid support', 'Start with dumbbells at ear level, elbows slightly forward (not straight out)', 'Press up powerfully on exhale, do not clang at the top', "Don't fully lock elbows at the top to keep delt tension", 'Lower with control, feel the stretch'],
    az: ['Dəzgah arxasını 80–90° qurun', 'Hantelli qulaq səviyyəsindən başlayın, dirsəklər yüngül irəlidə'],
  },
  'Разводка гантелей в стороны': {
    en: ['Raise dumbbells only to shoulder level — higher engages traps more', 'Lead with elbows — elbow always slightly above wrist', "Don't use body momentum (cheat)", 'Pinky slightly higher than thumb at the top (pour-the-cup cue)', 'Lower slowly — resist the weight on the way down'],
    az: ['Hantelli yalnız çiyin səviyyəsinə qaldırın', 'Dirsəklərlə aparın — dirsək həmişə biləkdən yuxarı'],
  },
  'Подъем гантелей перед собой': {
    en: ['Raise to eye level or slightly above, control at the top', "Don't swing your torso — if needed, reduce weight", 'Keep elbows slightly bent throughout', 'Lower smoothly — don\'t let dumbbells drop under their own weight', 'Keep chest open, don\'t round shoulders forward'],
    az: ['Göz səviyyəsinə və ya bir az yuxarı qaldırın', 'Gövdəni sallamayın — ağırlığı azaldın'],
  },
  'Разведение гантелей в наклоне сидя': {
    en: ['Lean forward until chest almost touches knees, keep back flat', 'Lead with elbows, do not squeeze shoulder blades too hard at the top', 'Pinky slightly higher than thumb for better rear-delt isolation', 'Eyes toward the floor to avoid neck strain', 'Smooth movement, brief pause at the top'],
    az: ['Döş demək olar ki, dizlərə toxunana qədər əyilin, arxa düz', 'Dirsəklə aparın, yuxarıda kürək sümüklərini çox sıxmayın'],
  },
  'Лицевая тяга на верхнем блоке': {
    en: ['Grip rope ends with thumbs facing you', 'Pull to face level (forehead or nose), spreading rope ends apart', 'At the end position, elbows should point sideways, wrists above elbows (external rotation)', 'Squeeze shoulder blades and hold 1 second', 'Resist the cable on the way back — control the return'],
    az: ['Kənafı baş barmaqlar sizə baxacaq şəkildə tutun', 'Üz səviyyəsinə (alına və ya buruna) çəkin, uçları bir-birindən ayırın'],
  },
  'Разведения в тренажере на среднюю дельту': {
    en: ['Align the machine rotation axis with your shoulder joints', 'Sit tall, chest up, back against pad', 'Drive with elbows (not wrists) against the arm pads', 'Raise to shoulder level with a brief pause at the top', 'Lower slowly without letting weight plates touch — keep tension'],
    az: ['Maşın fırlanma oxunu çiyin oynaqlarınızla uyğunlaşdırın', 'Düz oturun, döşü yuxarı, arxa yastığa'],
  },
  'Скручивания на наклонной скамье': {
    en: ['Adjust decline angle — lower head means harder', "Don't pull on your neck — cross arms on chest or touch temples", 'Rise through spinal flexion (curl), not simply lifting a straight back', 'Squeeze abs hard at the top, slow and controlled descent', "Don't lower shoulder blades completely — keep constant ab tension"],
    az: ['Meyil bucağını tənzimləyin — başı aşağı = daha çətin', 'Boyununuzu çəkməyin — əlləri döşdə çarpazlayın'],
  },
  'Скручивания в тренажере': {
    en: ['Adjust seat so rotation axis aligns with your waist/hip crease', 'Crunch the torso — use abs, not pulling with arms on handles', 'Exhale and curl fully down, bringing ribcage toward hips', 'Hold 1 second at the bottom for peak contraction', 'Return slowly — do not let weight stack fully touch'],
    az: ['Oturacağı bel/omba qırışı ilə uyğun gəlsin şəkildə tənzimləyin', 'Gövdəni bükün — əlləri deyil, qarını istifadə edin'],
  },
  'Подъем ног в упоре на брусьях': {
    en: ['Keep lower back pressed against the back pad throughout', "Don't swing legs — smooth and controlled", 'Raise legs slightly above parallel, tuck the pelvis forward for max lower-ab squeeze', 'Exhale on the way up, slow inhale on the way down', 'If straight legs are too hard, start with bent-knee raises'],
    az: ['Bütün məşq boyunca bel bölgəsini arxa yastığa saxlayın', 'Ayaqları sallamayın — hamar və nəzarətli'],
  },
  'Сгибания ног лежа': {
    en: [
      'Set the pad just above the Achilles so the roller sits on the lower shin',
      'Keep knees aligned with the machine axis',
      'Press hips firmly into the bench to avoid lumbar compensation',
      'Curl up with intent; lower slowly with control',
      'Stop short of full lockout at the bottom to keep tension on the hamstrings',
    ],
    az: [
      'Yastığı aşil üstündə saxlayın, valik aşağı baldıra düşsün',
      'Dizlər maşın oxu ilə bir xəttdə olsun',
      'Bel kompensasiyasının qarşısını almaq üçün kalçanı möhkəm skamyaya basın',
      'Yuxarı bükülməni güclü edin; aşağı yavaş və nəzarətli',
      'Aşağıda tam kilidləmədən dayanın — arxa budaqda gərginlik saxlanılsın',
    ],
  },
  'Разгибания ног сидя': {
    en: [
      'Adjust the back pad so the knee crease sits flush on the seat edge',
      'Place the roller on the lower shin, just above the ankle',
      'Hold side handles so hips cannot lift on the hard reps',
      'Fully extend at the top with a 1-second pause for peak quad squeeze',
      'Lower smoothly without letting the stack slam at the bottom',
    ],
    az: [
      'Diz qırışı oturacaq kənarına düz dəyəcək şəkildə arxa yastığı tənzimləyin',
      'Valiki aşağı baldırda, bilək üstündə yerləşdirin',
      'Çətin təkrarlarda kalça qalxmasın deyə yan tutacaqları tutun',
      'Yuxarıda tam uzadın, kvadriseps üçün 1 san. pauza',
      'Aşağıda yığını vurmadan yavaş endirin',
    ],
  },
  'Сведение ног в тренажере сидя': {
    en: [
      'Set a comfortable starting width — feel a mild stretch, not pain',
      'Keep entire back against the pad for the whole set',
      'Squeeze inward powerfully; pause briefly at peak contraction',
      'Return slowly without letting plates crash',
      'Use side handles to brace the torso',
    ],
    az: [
      'Rahat başlanğıc eni — yüngül uzanma, ağrı yox',
      'Bütün arxanı bütün set boyunca yastığa saxlayın',
      'İçəri güclü sıxın; pikdə qısa pauza',
      'Disklərin toqquşmaması üçün yavaş qaytarın',
      'Gövdəni sabitləmək üçün yan tutacaqlardan istifadə edin',
    ],
  },
  'Разведение ног в тренажере сидя': {
    en: [
      'Sit tall with full back contact; a slight forward lean can bias the glutes more',
      'Open as wide as control allows; pause at max tension',
      'Resist the return — do not let the stack fully rest',
      'Brace with handles to keep the pelvis stable',
      'Move only at the hips — avoid rocking the torso',
    ],
    az: [
      'Düz oturun, arxa tam təmas; yüngül irəliyə meyl kalçaya daha çox vurğu verə bilər',
      'Nəzarət imkan verdiyi qədər geniş açın; maksimum gərginlikdə pauza',
      'Qayıdışı müqavimətlə edin — yığını tam dayandırmayın',
      'Kalçanı sabit saxlamaq üçün tutacaqlardan istifadə edin',
      'Yalnız kalça oynağında hərəkət — gövdəni yelləməyin',
    ],
  },
  'Жим ногами в тренажере': {
    en: [
      'Feet shoulder-width; higher foot placement biases glutes, lower biases quads',
      'Never lock knees hard at the top — keep a soft bend',
      'Keep low back glued to the pad; avoid rolling the hips under at depth',
      'Lower the sled under control to about 90° at the knees',
      'Drive through the whole foot with emphasis on the heels',
    ],
    az: [
      'Ayaqlar çiyin genişliyində; ayaq yüksək — kalça, aşağı — kvadriseps',
      'Yuxarıda dizləri sərt kilidləməyin — yumşaq bükülmə saxlayın',
      'Beli yastığa yapışdırın; dərinlikdə kalçanı içəri çevirməyin',
      'Platformanı dizdə ~90°-ə qədər nəzarətli endirin',
      'Bütün ayaqla, xüsusilə dabanla itin',
    ],
  },
  'Приседания со штангой на плечах': {
    en: [
      'Bar rests on upper traps — not on the neck',
      'Maintain a neutral spine; eyes forward',
      'Break at hips and knees together as if sitting back',
      'Track knees over toes; do not let knees cave inward',
      'Drive feet into the floor evenly; exhale on the ascent',
    ],
    az: [
      'Bar üst trapeziusda — boyunda yox',
      'Neytral onurğa; baxış irəli',
      'Kalça və dizləri birlikdə əyərək arxaya oturmaq kimi başlayın',
      'Dizləri barmaq üstündə aparın; içəri çökməsin',
      'Ayaqları bərabər yerə basın; qalxarkən nəfəs verin',
    ],
  },
  'Приседания в Смите (узкая постановка)': {
    en: [
      'Feet close together and slightly forward of the bar line',
      'Keep back against the bar and slide straight down',
      'Depth to parallel thighs or slightly below if mobility allows',
      'Stay tall in the torso — avoid excessive forward lean',
      'Do not fully lock knees at the top to keep quad tension',
    ],
    az: [
      'Ayaqlar bir-birinə yaxın və bar xəttindən bir az irəlidə',
      'Arxanı bara söykəyib düz aşağı sürüşdürün',
      'Mobillik imkan verərsə budlar yerə paralel və ya bir az aşağı',
      'Gövdəni dik saxlayın — həddindən artıq irəliyə əyməyin',
      'Kvadriseps gərginliyini saxlamaq üçün yuxarıda dizləri tam kilidləməyin',
    ],
  },
  'Отведения ноги назад в тренажере': {
    en: [
      'Brace chest or elbows on the pads to lock the torso',
      'Extend the hip with the glute — not by arching the low back',
      'Pause and squeeze the glute at full extension',
      'Keep abs engaged throughout',
      'Return slowly without letting the weight crash',
    ],
    az: [
      'Gövdəni sabitləmək üçün döş və ya dirsəkləri yastıqlara basın',
      'Beli əymədən kalçanı kalça əzələsi ilə uzadın',
      'Tam uzanmada pauza və kalçanı sıxın',
      'Bütün set boyunca qarını gərgin saxlayın',
      'Çəkin qəfil düşməməsi üçün yavaş qaytarın',
    ],
  },
  'Гакк-приседания в тренажере': {
    en: [
      'Back fully against the pad — no gap at the lower back',
      'Feet shoulder-width; keep heels down on the platform',
      'Depth to ~90° knee angle or slightly more if comfortable',
      'Do not fully lock knees at the top',
      'Keep knees tracking over toes — avoid valgus collapse',
    ],
    az: [
      'Arxa tam yastığa — beldə boşluq olmasın',
      'Ayaqlar çiyin genişliyində; dabanlar platformada qalsın',
      'Rahatdırsa diz bucağı ~90° və ya bir az daha',
      'Yuxarıda dizləri tam kilidləməyin',
      'Dizləri barmaq üstündə aparın — içəri çökməsin',
    ],
  },
  'Разгибания ног в рычажном тренажере': {
    en: [
      'Back tight to the seat; grip side handles for hip stability',
      'Roller on lower shin above the ankle',
      'Extend fully at the top with a pause for peak quad contraction',
      'Lower the levers with control — no dropping',
      'Toes up or slightly out can bias different quad heads',
    ],
    az: [
      'Arxa oturacağa möhkəm; kalça stabilliyi üçün yan tutacaqlar',
      'Valik biləyin üstündə aşağı baldırda',
      'Yuxarıda tam uzadın, kvadriseps üçün pauza',
      'Qolları nəzarətli endirin — buraxmayın',
      'Barmaqlar yuxarı və ya bir az kənar fərqli kvadriseps başlarına vurğu verə bilər',
    ],
  },
  'Подъем на носки сидя (рычажный)': {
    en: [
      'Let heels sink for a deep calf stretch',
      'Rise onto the balls of the feet; hold the top 1–2 seconds',
      'Keep knees pressed into the pads; torso upright',
      'Smooth reps — no bouncing at the bottom',
      'Use handles to anchor the upper body',
    ],
    az: [
      'Dabanları dərin uzanma üçün aşağı buraxın',
      'Ayaq biləyinin üstünə qalxın; yuxarıda 1–2 san. saxlayın',
      'Dizləri yastıqlara basın; gövdə dik',
      'Hamar təkrarlar — aşağıda sıçramayın',
      'Üst bədəni sabitləmək üçün tutacaqlardan istifadə edin',
    ],
  },
  'Эллиптический тренажер': {
    en: [
      'Stand tall — do not lean all your weight on the handles',
      'Keep heels in contact with the pedals when possible',
      'Use moving handles to involve back and arms lightly',
      'Smooth rhythm; steady breathing',
      'Increase resistance or incline for more intensity if available',
    ],
    az: [
      'Dik durun — çəkini tutacaqlara yığmayın',
      'Mümkünsə dabanlar pedalda qalsın',
      'Arxa və qolları yüngül cəlb etmək üçün hərəkətli tutacaqlardan istifadə edin',
      'Hamar ritm; sabit nəfəs',
      'Varsa, intensivlik üçün müqavimət və ya meyili artırın',
    ],
  },
  'Велотренажер (вертикальный)': {
    en: [
      'Seat height: near-full leg extension at the bottom without knee lockout',
      'Neutral spine; light hands on the bars',
      'Smooth circular pedaling — push and pull',
      'Feet level — avoid excessive toe-pointing',
      'Match resistance to target heart rate and breathing',
    ],
    az: [
      'Oturacaq hündürlüyü: aşağıda diz kilidlənmədən demək olar ki, tam ayaq uzanması',
      'Neytral onurğa; barlara yüngül əllər',
      'Hamar dairəvi pedal — itin və çəkin',
      'Ayaqlar üfüqi — barmaqları həddindən artıq aşağı əyməyin',
      'Müqaviməti hədəf ürək dövrü və nəfəsə uyğunlaşdırın',
    ],
  },
  'Тяга штанги в наклоне': {
    en: [
      'Hinge to ~45° with a neutral lumbar curve',
      'Pull to the lower abdomen; elbows skim the ribs',
      'Soft knees for balance and less low-back strain',
      'No torso jerks — reduce weight if form breaks',
      'Lower the bar with control and feel the lats stretch',
    ],
    az: [
      'Bel neytral əyri ilə ~45° əyilmə',
      'Aşağı qarınə çəkin; dirsəklər qabırğalar boyunca',
      'Balans və az bel yükü üçün dizləri yumşaq saxlayın',
      'Gövdə ilə tərpənməyin — forma pozularsa çəki azaldın',
      'Barı nəzarətli endirin, enli uzanmasını hiss edin',
    ],
  },
  'Становая тяга со штангой': {
    en: [
      'Bar over mid-foot at the start',
      'Brace the lats; keep the bar close to the shins',
      'Push the floor away; stand tall at lockout without hyperextending',
      'Lower by pushing hips back until the bar clears the knees',
      'If the back rounds, stop and reduce load',
    ],
    az: [
      'Başlanğıcda bar ayağın ortası üstündə',
      'Enliləri gərgin saxlayın; barı baldıra yaxın tutun',
      'Yeri itin; kilidləmədə həddindən artıq geri əymədən dik durun',
      'Bar dizləri keçənə qədər kalçanı geri itərək endirin',
      'Arxa yuvarlaqlaşarsa dayanın və çəki azaldın',
    ],
  },
  'Шраги со штангой': {
    en: [
      'Grip just outside shoulder width',
      'Shrug straight up toward the ears — no rolling the shoulders',
      'Pause 1 second at the top',
      'Lower under control with a full but controlled stretch',
      'Keep arms long — the traps move the weight, not elbow bend',
    ],
    az: [
      'Tutumu çiyindən bir az kənar',
      'Çiyinləri düz yuxarı, qulaqlara — fırlatmayın',
      'Yuxarıda 1 san. pauza',
      'Tam amma nəzarətli uzanma ilə yavaş endirin',
      'Qolları uzun saxlayın — çəkiyi trapezius hərəkət etdirir, dirsək bükülməsi yox',
    ],
  },
  'Горизонтальная тяга в тренажере (Hammer)': {
    en: [
      'Seat so handles hit around lower chest to upper abdomen',
      'Chest on the pad; neutral spine',
      'Pull elbows back; squeeze shoulder blades at the finish',
      'Exhale on the pull; inhale on the return',
      'Do not let the stack fully unload at the stretch',
    ],
    az: [
      'Tutacaqlar alt döşdən üst qarınə düşəcək oturacaq',
      'Döş yastıqda; neytral onurğa',
      'Dirsəkləri geri çəkin; sonda kürək sümüklərini sıxın',
      'Çəkərkən nəfəs verin; qayıdışda için',
      'Uzanmada yığını tam boşaltmayın',
    ],
  },
  'Тяга Т-грифа в наклоне': {
    en: [
      'Stand over the bar; soft knees; flat back hinge',
      'Pull to the lower belly; elbows back and slightly up',
      'Pause briefly with scapulae retracted',
      'Lower with control — plates need not touch the floor each rep',
      'Brace the core to protect the lumbar spine',
    ],
    az: [
      'Barın üstündə dayanın; yumşaq diz; düz arxa ilə əyilmə',
      'Aşağı qarınə çəkin; dirsəklər geri və yüngül yuxarı',
      'Kürək sümükləri yığılmış qısa pauza',
      'Hər təkrarda disk yerə toxunmasın deyə nəzarətli endirin',
      'Beli qorumaq üçün özəyi gərgin saxlayın',
    ],
  },
  'Тяга Т-грифа с упором в грудь': {
    en: [
      'Pad height: upper chest on the edge of the support',
      'Maintain chest contact for the whole set',
      'Pull to the belly; drive elbows back',
      'Keep neck neutral — do not crane forward',
      'Full arm extension at the bottom for lat stretch',
    ],
    az: [
      'Yastıq hündürlüyü: dəstəyin kənarında üst döş',
      'Bütün set boyunca döş təmasını saxlayın',
      'Qarınə çəkin; dirsəkləri geri aparın',
      'Boyunu neytral saxlayın — irəli uzatmayın',
      'Aşağıda enli uzanması üçün qolu tam uzadın',
    ],
  },
  'Рычажная тяга с упором грудью': {
    en: [
      'Seat so handles align near mid-abs',
      'Chest pinned to the pad',
      'Row with elbows; imagine hooks on the elbows',
      'Squeeze blades hard at the end range',
      'Smooth eccentric — feel the lats lengthen',
    ],
    az: [
      'Tutacaqlar orta qarınə uyğun oturacaq',
      'Döş yastığa sancılı',
      'Dirsəklərlə çəkin; dirsəklərdə çəngəl təsəvvür edin',
      'Son diapazonda kürəkləri güclü sıxın',
      'Hamar eksentrik — enlinin uzandığını hiss edin',
    ],
  },
  'Вертикальная тяга параллельным хватом': {
    en: [
      'Thighs secured under the pad; slight lean back is fine',
      'Pull the handle to upper chest; elbows drive down and in',
      'Brief pause at the bottom contraction',
      'Control the ascent — stretch the lats without relaxing fully',
      'Minimize excessive body English',
    ],
    az: [
      'Budlar yastığın altında; yüngül geri meyl olar',
      'Tutacağı üst döşə çəkin; dirsəklər aşağı və içəri',
      'Aşağı yığılmada qısa pauza',
      'Qalxışı nəzarətli — enliləri tam boşaltmadan uzadın',
      'Gövdə ilə həddindən artıq yelləməyin',
    ],
  },
  'Тяга верхнего блока к груди (широкий хват)': {
    en: [
      'Grip wider than shoulders; pronated',
      'Pull to upper chest; elbows track slightly back',
      'Think elbows, not hands, to reduce biceps takeover',
      'Small controlled lean is OK; avoid huge swings',
      'Let the bar rise with control for a full lat stretch',
    ],
    az: [
      'Tutum çiyindən geniş; pronasiyalı',
      'Üst döşə çəkin; dirsəklər yüngül geri',
      'Bisepsin işi azalsın deyə əlləri deyil, dirsəkləri düşünün',
      'Kiçik nəzarətli meyl olar; böyük yelləmə yox',
      'Tam enli uzanması üçün barı nəzarətli qaldırın',
    ],
  },
  'Рычажная тяга параллельным хватом': {
    en: [
      'Feet braced; sit tall',
      'Neutral parallel handles; elbows tight to the torso',
      'Retract scapulae at the end; pause',
      'Full extension forward with control on each rep',
      'Chest proud; do not shrug the shoulders to the ears',
    ],
    az: [
      'Ayaqlar dayaqda; dik oturun',
      'Neytral paralel tutacaqlar; dirsəklər gövdəyə yaxın',
      'Sonda kürək sümüklərini yığın; pauza',
      'Hər təkrarda qolu nəzarətlə tam irəli uzadın',
      'Döşü yuxarı; çiyinləri qulaqlara qaldırmayın',
    ],
  },
  'Тяга верхнего блока (дуговой тренажёр)': {
    en: [
      'Lock thighs under the pads',
      'Follow the machine arc; elbows out and down',
      'Open the chest and squeeze blades at the bottom',
      'Rise slowly to maximize the stretch at the top',
      'Keep the torso stable — no violent rocking',
    ],
    az: [
      'Budları yastıqların altında kilidləyin',
      'Maşın qövsünü izləyin; dirsəklər kənara və aşağı',
      'Aşağıda döşü açın və kürəkləri sıxın',
      'Yuxarıda uzanmanı maksimum etmək üçün yavaş qalxın',
      'Gövdəni sabit saxlayın — şiddətli yelləmə yox',
    ],
  },
  'Гиперэкстензия': {
    en: [
      'Pad top just below the hip fold',
      'Lower with a flat back until you feel hamstring stretch',
      'Rise to a straight line with the torso — avoid hyperextending the lumbar spine',
      'Hands crossed on chest or behind head without neck pressure',
      'Controlled tempo — no momentum',
    ],
    az: [
      'Yastığın üstü kalça qırışının altında',
      'Arxa düz saxlayaraq arxa budaq uzanana qədər endirin',
      'Gövdə ilə düz xəttə qalxın — beli həddindən artıq uzatmayın',
      'Əllər döşdə çarpaz və ya boyuna təzyiq olmadan başın arxasında',
      'Nəzarətli temp — inersiya yox',
    ],
  },
  'Подтягивания широким хватом': {
    en: [
      'Grip clearly wider than shoulders',
      'Lead with the chest to the bar; drive elbows down',
      'Strict reps — limit kipping unless that is your sport-specific goal',
      'Touch the upper chest to the bar if mobility allows',
      'Lower with control; do not fully relax the shoulders at the bottom',
    ],
    az: [
      'Tutum çiyindən aydın şəkildə geniş',
      'Döşü bara tərəf aparın; dirsəkləri aşağı itin',
      'Ciddi təkrarlar — məqsəd deyilsə kipping məhdudlaşdırın',
      'Mobillik imkan verərsə üst döşü bara toxundurun',
      'Nəzarətli endirin; aşağıda çiyinləri tam boşaltmayın',
    ],
  },
}

// ─── Public helpers for descriptions and tips ─────────────────────────────────

/**
 * Returns translated description for `en`/`az`.
 * Returns null for `ru` so callers can fall back to the original data string.
 */
export function translateDescription(exerciseRussianName: string, language: Language): string | null {
  if (language === 'ru') return null
  return EXERCISE_DESCRIPTIONS[exerciseRussianName]?.[language] ?? null
}

/**
 * Returns translated tips array for `en`/`az`.
 * Returns null for `ru` so callers can fall back to the original data array.
 */
export function translateTips(exerciseRussianName: string, language: Language): string[] | null {
  if (language === 'ru') return null
  return EXERCISE_TIPS[exerciseRussianName]?.[language] ?? null
}

// ─── Workout type translations ────────────────────────────────────────────────

const WORKOUT_TYPES: Record<string, Record<Language, string>> = {
  'Силовая':    { ru: 'Силовая',    en: 'Strength',   az: 'Güc' },
  'Кардио':     { ru: 'Кардио',     en: 'Cardio',     az: 'Kardio' },
  'Верх тела':  { ru: 'Верх тела',  en: 'Upper Body', az: 'Üst bədən' },
  'Ноги':       { ru: 'Ноги',       en: 'Legs',       az: 'Ayaqlar' },
  'Круговая':   { ru: 'Круговая',   en: 'Circuit',    az: 'Dövrəvi' },
  'Грудь':      { ru: 'Грудь',      en: 'Chest',      az: 'Döş' },
  'Спина':      { ru: 'Спина',      en: 'Back',       az: 'Arxa' },
  'Пресс':      { ru: 'Пресс',      en: 'Abs',        az: 'Qarın əzələsi' },
  'Руки':       { ru: 'Руки',       en: 'Arms',       az: 'Qollar' },
  'Плечи':      { ru: 'Плечи',      en: 'Shoulders',  az: 'Çiynlər' },
  'Бицепс':     { ru: 'Бицепс',     en: 'Biceps',     az: 'Biseps' },
  'Трицепс':    { ru: 'Трицепс',    en: 'Triceps',    az: 'Triseps' },
  'Ягодицы':    { ru: 'Ягодицы',    en: 'Glutes',     az: 'Kalça' },
}

export function translateWorkoutType(type: string, language: Language): string {
  return WORKOUT_TYPES[type]?.[language] ?? type
}

// ─── Unit translations ────────────────────────────────────────────────────────

const UNITS: Record<string, Record<Language, string>> = {
  'кг':    { ru: 'кг',    en: 'kg',   az: 'kq' },
  'см':    { ru: 'см',    en: 'cm',   az: 'sm' },
  'кг/м²': { ru: 'кг/м²', en: 'kg/m²', az: 'kq/m²' },
  '%':     { ru: '%',     en: '%',    az: '%' },
}

export function translateUnit(unit: string, language: Language): string {
  return UNITS[unit]?.[language] ?? unit
}
