import { useLanguage } from '@/contexts/language-context'
import {
	translateExerciseName,
	translateUnit,
} from '@/constants/exercise-i18n'
import * as db from '@/scripts/database'
import type { BodyMeasurement, PersonalRecord } from '@/scripts/database'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect, useRouter } from 'expo-router'
import { useCallback, useState } from 'react'
import {
	ActivityIndicator,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native'

const COLORS = {
	primary: '#34C759',
	card: '#1C1C1E',
	border: '#2C2C2E',
	text: '#FFFFFF',
	textSecondary: '#8E8E93',
	up: '#34C759',
	down: '#FF3B30',
	stable: '#8E8E93',
} as const

const MEASUREMENT_LABEL_KEY: Record<string, string> = {
	Вес: 'weightLabel',
	Грудь: 'chestLabel',
	Талия: 'waistLabel',
	Бедра: 'hipsLabel',
	Бицепс: 'bicepsLabel',
	Шея: 'neckLabel',
	Икры: 'calfLabel',
	Плечо: 'bicepsLabel',
	Жир: 'bodyFatLabel',
	Мышцы: 'thighLabel',
}

type MeasurementRow = {
	name: string
	current: number
	previous: number | null
	unit: string
	trend: 'up' | 'down' | 'stable'
	id?: number
}

function trendColor(trend: string) {
	if (trend === 'up') return COLORS.up
	if (trend === 'down') return COLORS.down
	return COLORS.stable
}

function trendIcon(trend: string): keyof typeof Ionicons.glyphMap {
	if (trend === 'up') return 'trending-up'
	if (trend === 'down') return 'trending-down'
	return 'remove'
}

function buildMeasurementRows(all: BodyMeasurement[]): MeasurementRow[] {
	const byName = new Map<string, BodyMeasurement[]>()
	for (const m of all) {
		const list = byName.get(m.name) || []
		list.push(m)
		byName.set(m.name, list)
	}
	const rows: MeasurementRow[] = []
	for (const [name, list] of byName) {
		list.sort(
			(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
		)
		const latest = list[0]
		const prev = list[1]
		let trend: 'up' | 'down' | 'stable' = latest.trend || 'stable'
		if (prev) {
			if (latest.value > prev.value) trend = 'up'
			else if (latest.value < prev.value) trend = 'down'
			else trend = 'stable'
		}
		rows.push({
			name,
			current: latest.value,
			previous: prev ? prev.value : null,
			unit: latest.unit,
			trend,
			id: latest.id,
		})
	}
	return rows.sort((a, b) => a.name.localeCompare(b.name, 'ru'))
}

export default function ProfileStatsSections() {
	const { t, language } = useLanguage()
	const router = useRouter()
	const [loading, setLoading] = useState(true)
	const [measurements, setMeasurements] = useState<MeasurementRow[]>([])
	const [records, setRecords] = useState<PersonalRecord[]>([])

	const load = useCallback(async () => {
		try {
			const [allM, allR] = await Promise.all([
				db.getBodyMeasurements(),
				db.getPersonalRecords(),
			])
			setMeasurements(buildMeasurementRows(allM))
			setRecords(
				[...allR].sort(
					(a, b) =>
						new Date(b.date).getTime() - new Date(a.date).getTime(),
				),
			)
		} catch (e) {
			console.error('profile stats load', e)
		} finally {
			setLoading(false)
		}
	}, [])

	useFocusEffect(
		useCallback(() => {
			void load()
		}, [load]),
	)

	const displayName = (name: string) => {
		const key = MEASUREMENT_LABEL_KEY[name]
		if (key) return t('measurements', key as 'weightLabel')
		return name
	}

	const formatDate = (dateString: string) => {
		try {
			const locale =
				language === 'en' ? 'en-US' : language === 'az' ? 'az-AZ' : 'ru-RU'
			return new Date(dateString).toLocaleDateString(locale, {
				day: 'numeric',
				month: 'short',
			})
		} catch {
			return dateString
		}
	}

	const shownRecords = records.slice(0, 5)

	return (
		<>
			{/* Body measurements */}
			<View style={styles.section}>
				<View style={styles.sectionHead}>
					<Text style={styles.sectionTitle}>
						{t('progress', 'bodyMeasurements')}
					</Text>
					<View style={styles.headActions}>
						<TouchableOpacity
							onPress={() =>
								router.push('/(auth)/(routes)/quick-measurements')
							}
							hitSlop={8}
						>
							<Ionicons name='add-circle-outline' size={22} color={COLORS.primary} />
						</TouchableOpacity>
						<TouchableOpacity
							onPress={() =>
								router.push('/(auth)/(routes)/measurements-history')
							}
							hitSlop={8}
						>
							<Text style={styles.link}>{t('measurements', 'history')}</Text>
						</TouchableOpacity>
					</View>
				</View>

				<View style={styles.card}>
					{loading ? (
						<ActivityIndicator color={COLORS.primary} style={{ marginVertical: 16 }} />
					) : measurements.length === 0 ? (
						<TouchableOpacity
							style={styles.empty}
							onPress={() =>
								router.push('/(auth)/(routes)/quick-measurements')
							}
						>
							<Ionicons name='body-outline' size={28} color={COLORS.textSecondary} />
							<Text style={styles.emptyTitle}>
								{t('progress', 'noMeasurements')}
							</Text>
							<Text style={styles.emptyHint}>
								{t('measurements', 'emptySubtitle')}
							</Text>
						</TouchableOpacity>
					) : (
						measurements.map(row => {
							const delta =
								row.previous != null
									? Math.round((row.current - row.previous) * 10) / 10
									: null
							const unit = translateUnit(row.unit, language || 'ru')
							return (
								<TouchableOpacity
									key={row.name}
									style={styles.row}
									activeOpacity={0.7}
									onPress={() => {
										if (row.id != null) {
											router.push(`/(auth)/(routes)/edit-measurement/${row.id}`)
										} else {
											router.push('/(auth)/(routes)/measurements-history')
										}
									}}
								>
									<View style={styles.rowIcon}>
										<Ionicons name='resize-outline' size={18} color={COLORS.primary} />
									</View>
									<View style={styles.rowMeta}>
										<Text style={styles.rowTitle}>{displayName(row.name)}</Text>
										{delta != null ? (
											<Text style={[styles.rowSub, { color: trendColor(row.trend) }]}>
												{delta > 0 ? '+' : ''}
												{delta} {unit}
											</Text>
										) : (
											<Text style={styles.rowSub}>—</Text>
										)}
									</View>
									<Text style={styles.rowValue}>
										{row.current} {unit}
									</Text>
									<Ionicons
										name={trendIcon(row.trend)}
										size={18}
										color={trendColor(row.trend)}
										style={{ marginLeft: 8 }}
									/>
								</TouchableOpacity>
							)
						})
					)}
				</View>
			</View>

			{/* Personal records */}
			<View style={styles.section}>
				<View style={styles.sectionHead}>
					<Text style={styles.sectionTitle}>
						{t('progress', 'personalRecords')}
					</Text>
					<View style={styles.headActions}>
						<TouchableOpacity
							onPress={() => router.push('/(auth)/(routes)/add-record')}
							hitSlop={8}
						>
							<Ionicons name='add-circle-outline' size={22} color={COLORS.primary} />
						</TouchableOpacity>
						<TouchableOpacity
							onPress={() => router.push('/(auth)/(routes)/records-history')}
							hitSlop={8}
						>
							<Text style={styles.link}>{t('progress', 'allRecords')}</Text>
						</TouchableOpacity>
					</View>
				</View>

				<View style={styles.card}>
					{loading ? (
						<ActivityIndicator color={COLORS.primary} style={{ marginVertical: 16 }} />
					) : shownRecords.length === 0 ? (
						<TouchableOpacity
							style={styles.empty}
							onPress={() => router.push('/(auth)/(routes)/add-record')}
						>
							<Ionicons name='trophy-outline' size={28} color={COLORS.textSecondary} />
							<Text style={styles.emptyTitle}>{t('progress', 'noRecords')}</Text>
							<Text style={styles.emptyHint}>{t('records', 'autoUpdate')}</Text>
						</TouchableOpacity>
					) : (
						shownRecords.map(rec => (
							<TouchableOpacity
								key={String(rec.id ?? `${rec.exercise}-${rec.date}`)}
								style={styles.row}
								activeOpacity={0.7}
								onPress={() => {
									if (rec.id != null) {
										router.push(`/(auth)/(routes)/edit-record/${rec.id}`)
									} else {
										router.push('/(auth)/(routes)/records-history')
									}
								}}
							>
								<View style={[styles.rowIcon, { backgroundColor: 'rgba(255,149,0,0.12)' }]}>
									<Ionicons name='trophy' size={16} color='#FF9500' />
								</View>
								<View style={styles.rowMeta}>
									<Text style={styles.rowTitle} numberOfLines={1}>
										{translateExerciseName(rec.exercise, language || 'ru')}
									</Text>
									<Text style={styles.rowSub}>{formatDate(rec.date)}</Text>
								</View>
								<Text style={styles.rowValue}>{rec.weight}</Text>
								<Ionicons
									name={trendIcon(rec.trend)}
									size={18}
									color={trendColor(rec.trend)}
									style={{ marginLeft: 8 }}
								/>
							</TouchableOpacity>
						))
					)}
				</View>
			</View>
		</>
	)
}

const styles = StyleSheet.create({
	section: {
		marginHorizontal: 10,
		marginBottom: 16,
	},
	sectionHead: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: 10,
		paddingHorizontal: 4,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: '600',
		color: COLORS.text,
	},
	headActions: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 14,
	},
	link: {
		fontSize: 13,
		fontWeight: '600',
		color: COLORS.primary,
	},
	card: {
		backgroundColor: COLORS.card,
		borderRadius: 20,
		borderWidth: 1,
		borderColor: COLORS.border,
		paddingVertical: 4,
		overflow: 'hidden',
	},
	row: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 14,
		paddingVertical: 12,
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderBottomColor: COLORS.border,
	},
	rowIcon: {
		width: 34,
		height: 34,
		borderRadius: 10,
		backgroundColor: 'rgba(52,199,89,0.12)',
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: 12,
	},
	rowMeta: { flex: 1, marginRight: 8 },
	rowTitle: { fontSize: 15, fontWeight: '600', color: COLORS.text },
	rowSub: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
	rowValue: { fontSize: 15, fontWeight: '700', color: COLORS.text },
	empty: {
		alignItems: 'center',
		paddingVertical: 28,
		paddingHorizontal: 20,
		gap: 6,
	},
	emptyTitle: {
		fontSize: 15,
		fontWeight: '600',
		color: COLORS.text,
		marginTop: 6,
	},
	emptyHint: {
		fontSize: 13,
		color: COLORS.textSecondary,
		textAlign: 'center',
		lineHeight: 18,
	},
})
