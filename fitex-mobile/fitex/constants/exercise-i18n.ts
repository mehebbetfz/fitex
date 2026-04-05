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
}

// ─── Difficulty labels ────────────────────────────────────────────────────────

const DIFFICULTY_LABELS: Record<string, Record<Language, string>> = {
  'Начинающий':  { ru: 'Начинающий', en: 'Beginner',     az: 'Başlanğıc' },
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
