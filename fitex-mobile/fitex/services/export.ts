import { BodyMeasurement, PersonalRecord, Workout } from '@/scripts/database'
import * as FileSystem from 'expo-file-system'
import * as Sharing from 'expo-sharing'

const escapeCsvCell = (value: string | number | null | undefined): string => {
	const str = String(value ?? '')
	// Экранируем кавычки и оборачиваем ячейку
	return `"${str.replace(/"/g, '""')}"`
}

const buildCsv = (headers: string[], rows: (string | number | null | undefined)[][]): string => {
	const headerRow = headers.map(escapeCsvCell).join(',')
	const dataRows = rows.map(row => row.map(escapeCsvCell).join(','))
	return [headerRow, ...dataRows].join('\n')
}

const writeAndShare = async (filename: string, content: string): Promise<void> => {
	const fileUri = (FileSystem.documentDirectory ?? '') + filename

	await FileSystem.writeAsStringAsync(fileUri, content, {
		encoding: FileSystem.EncodingType.UTF8,
	})

	const available = await Sharing.isAvailableAsync()
	if (!available) {
		throw new Error('Sharing is not available on this device')
	}

	await Sharing.shareAsync(fileUri, {
		mimeType: 'text/csv',
		dialogTitle: 'Экспорт данных Fitex',
		UTI: 'public.comma-separated-values-text',
	})
}

export const exportWorkoutsToCsv = async (workouts: Workout[]): Promise<void> => {
	const headers = [
		'Дата',
		'Тип',
		'Длительность (мин)',
		'Упражнений',
		'Подходов',
		'Объём (кг)',
		'Группы мышц',
		'Оценка',
		'Заметки',
	]

	const rows = workouts.map(w => [
		w.date,
		w.type,
		w.duration,
		w.exercises_count,
		w.sets_count,
		w.volume,
		w.muscle_groups,
		w.rating,
		w.notes,
	])

	const csv = buildCsv(headers, rows)
	const date = new Date().toISOString().split('T')[0]
	await writeAndShare(`fitex_workouts_${date}.csv`, csv)
}

export const exportMeasurementsToCsv = async (measurements: BodyMeasurement[]): Promise<void> => {
	const headers = ['Дата', 'Параметр', 'Значение', 'Единица', 'Тренд', 'Цель']

	const rows = measurements.map(m => [m.date, m.name, m.value, m.unit, m.trend, m.goal])

	const csv = buildCsv(headers, rows)
	const date = new Date().toISOString().split('T')[0]
	await writeAndShare(`fitex_measurements_${date}.csv`, csv)
}

export const exportRecordsToCsv = async (records: PersonalRecord[]): Promise<void> => {
	const headers = ['Дата', 'Упражнение', 'Вес', 'Категория', 'Тренд', 'Предыдущий рекорд', 'Улучшение', 'Заметки']

	const rows = records.map(r => [
		r.date,
		r.exercise,
		r.weight,
		r.category,
		r.trend,
		r.previous_record,
		r.improvement,
		r.notes,
	])

	const csv = buildCsv(headers, rows)
	const date = new Date().toISOString().split('T')[0]
	await writeAndShare(`fitex_records_${date}.csv`, csv)
}

export const exportAllDataToCsv = async (
	workouts: Workout[],
	measurements: BodyMeasurement[],
	records: PersonalRecord[],
): Promise<void> => {
	const date = new Date().toISOString().split('T')[0]

	const workoutsCsv = buildCsv(
		['Дата', 'Тип', 'Длительность (мин)', 'Упражнений', 'Подходов', 'Объём (кг)', 'Группы мышц', 'Оценка', 'Заметки'],
		workouts.map(w => [w.date, w.type, w.duration, w.exercises_count, w.sets_count, w.volume, w.muscle_groups, w.rating, w.notes]),
	)

	const measurementsCsv = buildCsv(
		['Дата', 'Параметр', 'Значение', 'Единица', 'Тренд', 'Цель'],
		measurements.map(m => [m.date, m.name, m.value, m.unit, m.trend, m.goal]),
	)

	const recordsCsv = buildCsv(
		['Дата', 'Упражнение', 'Вес', 'Категория', 'Тренд', 'Предыдущий рекорд', 'Улучшение', 'Заметки'],
		records.map(r => [r.date, r.exercise, r.weight, r.category, r.trend, r.previous_record, r.improvement, r.notes]),
	)

	const combined = [
		'=== ТРЕНИРОВКИ ===',
		workoutsCsv,
		'',
		'=== ЗАМЕРЫ ТЕЛА ===',
		measurementsCsv,
		'',
		'=== ЛИЧНЫЕ РЕКОРДЫ ===',
		recordsCsv,
	].join('\n')

	await writeAndShare(`fitex_export_${date}.csv`, combined)
}
