// app/modals/exercise-history-modal.tsx
import { useDatabase } from '@/app/contexts/database-context'
import { useLanguage } from '@/contexts/language-context'
import { Ionicons } from '@expo/vector-icons'
import React, { useEffect, useRef, useState } from 'react'
import {
	Animated,
	Dimensions,
	Modal,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native'

const { height: SCREEN_HEIGHT } = Dimensions.get('window')

const C = {
	bg: '#121212',
	card: '#1C1C1E',
	cardLight: '#2C2C2E',
	border: '#3A3A3C',
	text: '#FFFFFF',
	textSec: '#8E8E93',
	primary: '#34C759',
	warning: '#FF9500',
	error: '#FF3B30',
	info: '#5AC8FA',
} as const

// ─── Shimmer ─────────────────────────────────────────────────────────────────

const useShimmer = () => {
	const a = useRef(new Animated.Value(0)).current
	useEffect(() => {
		const loop = Animated.loop(
			Animated.sequence([
				Animated.timing(a, {
					toValue: 1,
					duration: 750,
					useNativeDriver: true,
				}),
				Animated.timing(a, {
					toValue: 0,
					duration: 750,
					useNativeDriver: true,
				}),
			]),
		)
		loop.start()
		return () => loop.stop()
	}, [])
	return a.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.7] })
}

const Shimmer = ({ style }: { style: any }) => {
	const opacity = useShimmer()
	return <Animated.View style={[style, { opacity }]} />
}

const SkeletonContent = () => (
	<View style={{ gap: 14 }}>
		{/* comparison skeleton */}
		<View style={sk.section}>
			<Shimmer
				style={[sk.line, { width: 140, height: 14, marginBottom: 14 }]}
			/>
			{[1, 2, 3].map(i => (
				<View key={i} style={sk.compRow}>
					<Shimmer style={sk.circle} />
					<View style={{ flex: 1, gap: 8 }}>
						<Shimmer style={[sk.line, { width: '70%', height: 12 }]} />
						<Shimmer style={[sk.line, { width: '50%', height: 12 }]} />
					</View>
					<Shimmer
						style={[sk.line, { width: 60, height: 22, borderRadius: 8 }]}
					/>
				</View>
			))}
		</View>
		{/* history skeleton */}
		<View style={sk.section}>
			<Shimmer
				style={[sk.line, { width: 120, height: 14, marginBottom: 14 }]}
			/>
			{[1, 2].map(i => (
				<View key={i} style={[sk.section, { marginBottom: 10 }]}>
					<View
						style={{
							flexDirection: 'row',
							justifyContent: 'space-between',
							marginBottom: 10,
						}}
					>
						<Shimmer style={[sk.line, { width: 80, height: 13 }]} />
						<Shimmer style={[sk.line, { width: 50, height: 13 }]} />
					</View>
					{[1, 2, 3].map(j => (
						<View key={j} style={sk.setRow}>
							<Shimmer style={[sk.line, { width: 20, height: 11 }]} />
							<Shimmer style={[sk.line, { width: 70, height: 11 }]} />
							<Shimmer style={[sk.line, { width: 50, height: 11 }]} />
						</View>
					))}
				</View>
			))}
		</View>
	</View>
)

const sk = StyleSheet.create({
	section: {
		backgroundColor: C.card,
		borderRadius: 14,
		padding: 14,
		borderWidth: 1,
		borderColor: C.border,
	},
	line: { borderRadius: 4, backgroundColor: C.cardLight },
	circle: {
		width: 30,
		height: 30,
		borderRadius: 15,
		backgroundColor: C.cardLight,
		marginRight: 12,
	},
	compRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
	setRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		paddingVertical: 3,
	},
})

// ─── Types ────────────────────────────────────────────────────────────────────

interface CurrentSet {
	setNumber: number
	weight: number
	reps: number
	completed: boolean
}

interface Props {
	visible: boolean
	onClose: () => void
	exerciseName: string
	currentSets: CurrentSet[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const LOCALE_MAP: Record<string, string> = { ru: 'ru-RU', en: 'en-US', az: 'az-AZ' }

const fmtDate = (d: string, todayStr: string, yesterdayStr: string, lang = 'ru') => {
	try {
		const date = new Date(d)
		const today = new Date()
		const yesterday = new Date(today)
		yesterday.setDate(today.getDate() - 1)
		if (date.toDateString() === today.toDateString()) return todayStr
		if (date.toDateString() === yesterday.toDateString()) return yesterdayStr
		return date.toLocaleDateString(LOCALE_MAP[lang] ?? 'ru-RU', { day: 'numeric', month: 'short' })
	} catch {
		return d
	}
}

// ─── Diff pill ────────────────────────────────────────────────────────────────

const DiffPill = ({ value, unit = 'кг' }: { value: number; unit?: string }) => {
	if (value === 0) return null
	const up = value > 0
	return (
		<View
			style={[
				dp.pill,
				{
					backgroundColor: (up ? C.primary : C.error) + '22',
					borderColor: (up ? C.primary : C.error) + '55',
				},
			]}
		>
			<Ionicons
				name={up ? 'arrow-up' : 'arrow-down'}
				size={10}
				color={up ? C.primary : C.error}
			/>
			<Text style={[dp.text, { color: up ? C.primary : C.error }]}>
				{Math.abs(value)}
				{unit}
			</Text>
		</View>
	)
}
const dp = StyleSheet.create({
	pill: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 3,
		paddingHorizontal: 7,
		paddingVertical: 3,
		borderRadius: 7,
		borderWidth: 1,
	},
	text: { fontSize: 11, fontWeight: '700' },
})

// ─── Set comparison row ───────────────────────────────────────────────────────

const SetCompareRow = ({
	index,
	current,
	previous,
}: {
	index: number
	current: CurrentSet
	previous: { weight: number; reps: number } | null
}) => {
	const { t } = useLanguage()
	const wDiff = previous ? current.weight - previous.weight : null
	const rDiff = previous ? current.reps - previous.reps : null
	const vDiff = previous
		? current.weight * current.reps - previous.weight * previous.reps
		: null

	return (
		<View
			style={[
				cmp.row,
				index > 0 && { borderTopWidth: 1, borderTopColor: C.border + '88' },
			]}
		>
			{/* Set number badge */}
			<View
				style={[
					cmp.badge,
					{ backgroundColor: current.completed ? C.primary : C.cardLight },
				]}
			>
				<Text
					style={[
						cmp.badgeText,
						{ color: current.completed ? C.bg : C.textSec },
					]}
				>
					{index + 1}
				</Text>
			</View>

			{/* Values */}
			<View style={cmp.vals}>
			{previous ? (
				<>
					<View style={cmp.valLine}>
						<Text style={cmp.label}>{t('exercises', 'lastTime')}</Text>
						<Text style={cmp.prev}>
							{previous.weight} {t('workout', 'kg')} × {previous.reps}
						</Text>
					</View>
					<View style={cmp.valLine}>
						<Text style={cmp.label}>{t('exercises', 'now')}</Text>
						<Text style={cmp.curr}>
							{current.weight} {t('workout', 'kg')} × {current.reps}
						</Text>
					</View>
				</>
			) : (
				<View style={cmp.valLine}>
					<Text style={cmp.label}>{t('exercises', 'now')}</Text>
					<Text style={cmp.curr}>
						{current.weight} {t('workout', 'kg')} × {current.reps}
					</Text>
				</View>
			)}
			</View>

		{/* Diff pills */}
		{previous && (
			<View style={cmp.pills}>
				{wDiff !== null && <DiffPill value={wDiff} unit={t('workout', 'kg')} />}
				{rDiff !== null && <DiffPill value={rDiff} unit={` ${t('exercises', 'repsShort')}`} />}
				{vDiff !== null && vDiff !== 0 && (
					<View
						style={[
							dp.pill,
							{
								backgroundColor: (vDiff > 0 ? C.primary : C.error) + '22',
								borderColor: (vDiff > 0 ? C.primary : C.error) + '55',
							},
						]}
					>
						<Text
							style={[dp.text, { color: vDiff > 0 ? C.primary : C.error }]}
						>
							{vDiff > 0 ? '+' : ''}
							{vDiff}{t('workout', 'kg')} {t('exercises', 'volumeLabel')}
						</Text>
					</View>
				)}
			</View>
		)}
		</View>
	)
}

const cmp = StyleSheet.create({
	row: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		paddingVertical: 12,
		gap: 10,
	},
	badge: {
		width: 30,
		height: 30,
		borderRadius: 15,
		alignItems: 'center',
		justifyContent: 'center',
		flexShrink: 0,
		marginTop: 2,
	},
	badgeText: { fontSize: 13, fontWeight: '700' },
	vals: { flex: 1, gap: 5 },
	valLine: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	label: { fontSize: 12, color: C.textSec },
	prev: { fontSize: 12, color: C.textSec },
	curr: { fontSize: 13, fontWeight: '600', color: C.text },
	pills: { gap: 4, alignItems: 'flex-end', flexShrink: 0 },
})

// ─── History card ─────────────────────────────────────────────────────────────

const HistoryCard = ({
	entry,
	isLatest,
}: {
	entry: any
	isLatest: boolean
}) => {
	const { t, language } = useLanguage()
	const lang = language ?? 'ru'
	const sets: Array<{ weight: number; reps: number; set_number?: number }> =
		entry.sets ?? []
	const maxW = sets.length ? Math.max(...sets.map(s => s.weight)) : 0
	const vol = sets.reduce((sum, s) => sum + s.weight * s.reps, 0)

	return (
		<View style={[hc.card, isLatest && { borderColor: C.warning + '55' }]}>
			<View style={hc.header}>
				<View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
					{isLatest && (
						<View style={[hc.dot, { backgroundColor: C.warning }]} />
					)}
					<Text style={hc.date}>{fmtDate(entry.date, t('exercises', 'today'), t('exercises', 'yesterday'), lang)}</Text>
					{entry.time ? <Text style={hc.time}>{entry.time}</Text> : null}
				</View>
			<View style={{ flexDirection: 'row', gap: 8 }}>
				<View style={hc.pill}>
					<Ionicons name='barbell-outline' size={11} color={C.textSec} />
					<Text style={hc.pillTxt}>{maxW} {t('workout', 'kg')} {t('exercises', 'maxLabel')}</Text>
				</View>
				<View style={hc.pill}>
					<Ionicons name='layers-outline' size={11} color={C.textSec} />
					<Text style={hc.pillTxt}>{vol.toFixed(0)} {t('workout', 'kg')}</Text>
				</View>
			</View>
			</View>
			{/* Sets as chips */}
			<View style={hc.chips}>
				{sets.map((s, i) => (
					<View key={i} style={hc.chip}>
						<Text style={hc.chipNum}>{s.set_number ?? i + 1}</Text>
				<Text style={hc.chipVal}>
					{s.weight} {t('workout', 'kg')} × {s.reps}
				</Text>
						<Text style={hc.chipVol}>{(s.weight * s.reps).toFixed(0)}</Text>
					</View>
				))}
			</View>
		</View>
	)
}

const hc = StyleSheet.create({
	card: {
		backgroundColor: C.card,
		borderRadius: 14,
		padding: 14,
		borderWidth: 1,
		borderColor: C.border,
		marginBottom: 10,
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 12,
	},
	dot: { width: 7, height: 7, borderRadius: 3.5 },
	date: { fontSize: 14, fontWeight: '600', color: C.text },
	time: { fontSize: 12, color: C.textSec },
	pill: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
		backgroundColor: C.cardLight,
		borderRadius: 8,
		paddingHorizontal: 8,
		paddingVertical: 4,
	},
	pillTxt: { fontSize: 11, color: C.textSec, fontWeight: '500' },
	chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
	chip: {
		backgroundColor: C.cardLight,
		borderRadius: 8,
		paddingHorizontal: 10,
		paddingVertical: 7,
		alignItems: 'center',
		minWidth: 70,
	},
	chipNum: { fontSize: 10, color: C.textSec, marginBottom: 2 },
	chipVal: { fontSize: 12, fontWeight: '600', color: C.text },
	chipVol: { fontSize: 10, color: C.primary, marginTop: 1 },
})

// ─── Section label ────────────────────────────────────────────────────────────

const SectionLabel = ({ label }: { label: string }) => (
	<View style={sl.row}>
		<View style={sl.line} />
		<Text style={sl.text}>{label}</Text>
		<View style={sl.line} />
	</View>
)
const sl = StyleSheet.create({
	row: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 10,
		marginBottom: 12,
		marginTop: 4,
	},
	line: { flex: 1, height: 1, backgroundColor: C.border },
	text: {
		fontSize: 11,
		color: C.textSec,
		fontWeight: '700',
		letterSpacing: 1,
		textTransform: 'uppercase',
	},
})

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function ExerciseHistoryModal({
	visible,
	onClose,
	exerciseName,
	currentSets,
}: Props) {
	const { fetchExerciseHistory, getExerciseRecords } = useDatabase()
	const { t, language } = useLanguage()
	const lang = language ?? 'ru'

	const [history, setHistory] = useState<any[]>([])
	const [records, setRecords] = useState<any>(null)
	const [loading, setLoading] = useState(false)

	const slideY = useRef(new Animated.Value(SCREEN_HEIGHT)).current
	const [mounted, setMounted] = useState(false)

	useEffect(() => {
		if (visible) {
			setMounted(true)
			// Load everything at once — no staggered rendering
			setLoading(true)
			Promise.all([
				fetchExerciseHistory(exerciseName),
				getExerciseRecords(exerciseName),
			])
				.then(([h, r]) => {
					setHistory(h)
					setRecords(r)
				})
				.catch(() => {
					setHistory([])
					setRecords(null)
				})
				.finally(() => setLoading(false))

			Animated.spring(slideY, {
				toValue: 0,
				useNativeDriver: true,
				tension: 65,
				friction: 11,
			}).start()
		} else {
			Animated.timing(slideY, {
				toValue: SCREEN_HEIGHT,
				duration: 260,
				useNativeDriver: true,
			}).start(() => setMounted(false))
		}
	}, [visible, exerciseName])

	if (!mounted) return null

	// Last workout sets for comparison
	const lastSets: Array<{ set_number: number; weight: number; reps: number }> =
		records?.lastWorkout?.sets ?? []

	// Volume totals
	const currentVol = currentSets.reduce((s, x) => s + x.weight * x.reps, 0)
	const lastVol = records?.lastWorkout?.totalVolume ?? 0
	const volDiff = lastVol > 0 ? currentVol - lastVol : null

	// Best set
	const bestSet = records?.bestSet

	return (
		<Modal
			transparent
			visible={mounted}
			animationType='none'
			onRequestClose={onClose}
		>
			<TouchableOpacity
				style={ms.backdrop}
				activeOpacity={1}
				onPress={onClose}
			/>

			<Animated.View
				style={[ms.sheet, { transform: [{ translateY: slideY }] }]}
			>
				{/* Handle */}
				<View style={ms.handle} />

				{/* Header */}
				<View style={ms.header}>
					<View style={ms.headerIcon}>
						<Ionicons name='barbell' size={18} color={C.primary} />
					</View>
					<Text style={ms.title} numberOfLines={1}>
						{exerciseName}
					</Text>

					{/* Volume diff badge in header */}
					{!loading && volDiff !== null && (
						<View
							style={[
								ms.volBadge,
								{
									backgroundColor: (volDiff >= 0 ? C.primary : C.error) + '22',
									borderColor: (volDiff >= 0 ? C.primary : C.error) + '44',
								},
							]}
						>
							<Ionicons
								name={volDiff >= 0 ? 'trending-up' : 'trending-down'}
								size={13}
								color={volDiff >= 0 ? C.primary : C.error}
							/>
							<Text
								style={[
									ms.volBadgeTxt,
									{ color: volDiff >= 0 ? C.primary : C.error },
								]}
							>
						{volDiff >= 0 ? '+' : ''}
						{volDiff.toFixed(0)} {t('workout', 'kg')} {t('exercises', 'volumeLabel')}
							</Text>
						</View>
					)}

					<TouchableOpacity
						style={ms.closeBtn}
						onPress={onClose}
						activeOpacity={0.7}
					>
						<Ionicons name='close' size={22} color={C.textSec} />
					</TouchableOpacity>
				</View>

				<ScrollView
					style={{ flex: 1 }}
					contentContainerStyle={ms.scroll}
					showsVerticalScrollIndicator={false}
				>
					{loading ? (
						<SkeletonContent />
					) : (
						<>
							{/* ── Best set ──────────────────────────────────── */}
							{bestSet?.weight > 0 && (
								<View style={ms.bestCard}>
									<Ionicons name='star' size={16} color={C.warning} />
									<Text style={ms.bestTxt}>
										{t('exercises', 'lastTime')}:{' '}
										<Text style={{ color: C.text, fontWeight: '700' }}>
											{bestSet.weight} {t('workout', 'kg')} × {bestSet.reps}
										</Text>
									</Text>
									<Text style={ms.bestDate}>{fmtDate(bestSet.date, t('exercises', 'today'), t('exercises', 'yesterday'), lang)}</Text>
								</View>
							)}

							{/* ── Set-by-set comparison ─────────────────────── */}
							{currentSets.length > 0 && lastSets.length > 0 && (
								<>
							<SectionLabel
									label={fmtDate(records.lastWorkout.date, t('exercises', 'today'), t('exercises', 'yesterday'), lang)}
								/>
									<View style={ms.card}>
										{currentSets.map((cur, i) => {
											const prev =
												lastSets.find(s => s.set_number === i + 1) ?? null
											return (
												<SetCompareRow
													key={i}
													index={i}
													current={cur}
													previous={prev}
												/>
											)
										})}

										{/* Volume summary row */}
										{lastVol > 0 && (
											<View style={ms.volRow}>
												<View style={ms.volLine}>
													<Text style={ms.volLabel}>{t('exercises', 'prevVolume')}</Text>
													<Text style={ms.volVal}>{lastVol} {t('workout', 'kg')}</Text>
												</View>
												<View style={ms.volLine}>
													<Text style={ms.volLabel}>{t('exercises', 'currVolume')}</Text>
													<View
														style={{
															flexDirection: 'row',
															alignItems: 'center',
															gap: 8,
														}}
													>
														<Text style={[ms.volVal, { color: C.primary }]}>
															{currentVol} {t('workout', 'kg')}
														</Text>
						{volDiff !== null && (
							<DiffPill value={volDiff} unit={` ${t('workout', 'kg')}`} />
														)}
													</View>
												</View>
											</View>
										)}
									</View>
								</>
							)}

							{/* Current sets shown alone when no comparison */}
							{currentSets.length > 0 && lastSets.length === 0 && (
								<>
									<SectionLabel label={t('exercises', 'currentWorkout')} />
									<View style={ms.card}>
										{currentSets.map((cur, i) => (
											<SetCompareRow
												key={i}
												index={i}
												current={cur}
												previous={null}
											/>
										))}
									</View>
								</>
							)}

							{/* ── History ───────────────────────────────────── */}
							{history.length > 0 && (
								<>
									<SectionLabel label={t('exercises', 'workoutHistory')} />
									{history.map((entry, i) => (
										<HistoryCard
											key={`${entry.date}-${i}`}
											entry={entry}
											isLatest={i === 0}
										/>
									))}
								</>
							)}

							{history.length === 0 && currentSets.length === 0 && (
								<View style={ms.empty}>
									<Ionicons name='time-outline' size={44} color={C.textSec} />
								<Text style={ms.emptyTitle}>{t('exercises', 'noHistory')}</Text>
								<Text style={ms.emptyTxt}>
										{t('exercises', 'noHistorySubtitle')}
									</Text>
								</View>
							)}
						</>
					)}
				</ScrollView>
			</Animated.View>
		</Modal>
	)
}

// ─── Sheet styles ─────────────────────────────────────────────────────────────

const ms = StyleSheet.create({
	backdrop: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: 'rgba(0,0,0,0.55)',
	},
	sheet: {
		position: 'absolute',
		bottom: 0,
		left: 0,
		right: 0,
		maxHeight: SCREEN_HEIGHT * 0.85,
		backgroundColor: C.bg,
		borderTopLeftRadius: 24,
		borderTopRightRadius: 24,
		borderTopWidth: 1,
		borderTopColor: C.border,
		overflow: 'hidden',
	},
	handle: {
		width: 40,
		height: 4,
		borderRadius: 2,
		backgroundColor: C.border,
		alignSelf: 'center',
		marginTop: 12,
		marginBottom: 4,
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 10,
		paddingHorizontal: 16,
		paddingVertical: 14,
		borderBottomWidth: 1,
		borderBottomColor: C.border,
	},
	headerIcon: {
		width: 34,
		height: 34,
		borderRadius: 17,
		backgroundColor: C.primary + '22',
		alignItems: 'center',
		justifyContent: 'center',
	},
	title: { flex: 1, fontSize: 17, fontWeight: '700', color: C.text },
	volBadge: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
		borderWidth: 1,
		borderRadius: 10,
		paddingHorizontal: 9,
		paddingVertical: 5,
	},
	volBadgeTxt: { fontSize: 12, fontWeight: '700' },
	closeBtn: { padding: 4 },
	scroll: { paddingHorizontal: 16, paddingBottom: 36, paddingTop: 14, gap: 0 },

	bestCard: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
		backgroundColor: C.warning + '18',
		borderRadius: 12,
		padding: 12,
		borderWidth: 1,
		borderColor: C.warning + '44',
		marginBottom: 14,
	},
	bestTxt: { flex: 1, fontSize: 13, color: C.textSec },
	bestDate: { fontSize: 12, color: C.textSec },

	card: {
		backgroundColor: C.card,
		borderRadius: 14,
		paddingHorizontal: 14,
		borderWidth: 1,
		borderColor: C.border,
		marginBottom: 14,
	},

	volRow: {
		borderTopWidth: 1,
		borderTopColor: C.border,
		paddingTop: 12,
		paddingBottom: 4,
		gap: 8,
	},
	volLine: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	volLabel: { fontSize: 13, color: C.textSec },
	volVal: { fontSize: 14, fontWeight: '600', color: C.text },

	empty: { alignItems: 'center', paddingVertical: 48, gap: 10 },
	emptyTitle: { fontSize: 16, fontWeight: '600', color: C.text },
	emptyTxt: { fontSize: 13, color: C.textSec, textAlign: 'center' },
})
