import { useLanguage } from '@/contexts/language-context'
import { translateExerciseName, translateGroupName, translateWorkoutType } from '@/constants/exercise-i18n'
import { useDatabase } from '@/app/contexts/database-context'
import { Ionicons } from '@expo/vector-icons'
import { router, useLocalSearchParams } from 'expo-router'
import { useEffect, useState } from 'react'
import {
	Alert,
	Dimensions,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
	ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Exercise, ExerciseSet, Workout } from '@/scripts/database'

const C = {
	bg: '#0A0A0A',
	card: '#1C1C1E',
	cardLight: '#2C2C2E',
	border: '#2C2C2E',
	primary: '#34C759',
	text: '#FFFFFF',
	subtext: '#8E8E93',
	error: '#FF3B30',
	gold: '#FFD60A',
	info: '#5AC8FA',
} as const

const { width: SW } = Dimensions.get('window')

type FullExercise = Exercise & { sets: ExerciseSet[] }

export default function WorkoutDetailScreen() {
	const { t, language } = useLanguage()
	const { id } = useLocalSearchParams<{ id: string }>()
	const { getWorkoutDetails, deleteWorkout } = useDatabase()

	const [workout, setWorkout] = useState<Workout | null>(null)
	const [exercises, setExercises] = useState<FullExercise[]>([])
	const [selectedExIdx, setSelectedExIdx] = useState(0)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		if (!id) return
		const load = async () => {
			try {
				setLoading(true)
				const data = await getWorkoutDetails(Number(id))
				setWorkout(data.workout)
				setExercises(data.exercises)
				setSelectedExIdx(0)
			} catch {
				// do nothing — show not-found state
			} finally {
				setLoading(false)
			}
		}
		load()
	}, [id])

	const handleDelete = () => {
		Alert.alert(
			t('workout', 'deleteExercise'),
			t('workout', 'deleteSetMsg'),
			[
				{ text: t('common', 'cancel'), style: 'cancel' },
				{
					text: t('common', 'delete'),
					style: 'destructive',
					onPress: async () => {
						if (workout?.id) {
							await deleteWorkout(workout.id)
						}
						router.back()
					},
				},
			],
		)
	}

	const formatDate = (dateStr: string) => {
		try {
			const localeMap: Record<string, string> = { ru: 'ru-RU', en: 'en-US', az: 'az-AZ' }
			const locale = localeMap[language] ?? 'ru-RU'
			const d = new Date(dateStr)
			return d.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })
		} catch {
			return dateStr
		}
	}

	if (loading) {
		return (
			<SafeAreaView style={s.container}>
				<View style={s.center}>
					<ActivityIndicator size='large' color={C.primary} />
				</View>
			</SafeAreaView>
		)
	}

	if (!workout) {
		return (
			<SafeAreaView style={s.container}>
				<View style={s.center}>
					<Ionicons name='barbell-outline' size={64} color={C.subtext} />
					<Text style={s.notFoundText}>{t('history', 'noWorkouts')}</Text>
					<TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
						<Text style={s.backBtnText}>{t('common', 'cancel')}</Text>
					</TouchableOpacity>
				</View>
			</SafeAreaView>
		)
	}

	const muscleGroupsList = workout.muscle_groups
		?.split(',')
		.map(g => g.trim())
		.filter(Boolean) ?? []

	const selectedEx = exercises[selectedExIdx] ?? null

	const totalVolume = exercises.reduce(
		(sum, ex) => sum + ex.sets.reduce((s, set) => s + set.weight * set.reps, 0),
		0,
	)

	return (
		<SafeAreaView style={s.container}>
			{/* ── Header ── */}
			<View style={s.header}>
				<TouchableOpacity onPress={() => router.back()} style={s.headerBack}>
					<Ionicons name='arrow-back' size={22} color={C.text} />
				</TouchableOpacity>
				<View style={s.headerCenter}>
					<Text style={s.headerTitle} numberOfLines={1}>
						{translateWorkoutType(workout.type, language)}
					</Text>
					<Text style={s.headerSub}>{formatDate(workout.date)}</Text>
				</View>
				<TouchableOpacity onPress={handleDelete} style={s.headerDelete}>
					<Ionicons name='trash-outline' size={20} color={C.error} />
				</TouchableOpacity>
			</View>

			<ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
				{/* ── Overview stats ── */}
				<View style={s.statsRow}>
					<StatBox
						value={String(workout.exercises_count)}
						label={t('workout', 'exercises')}
						icon='barbell'
					/>
					<StatBox
						value={String(workout.sets_count)}
						label={t('workout', 'sets')}
						icon='repeat'
					/>
					<StatBox
						value={`${workout.duration}`}
						label={t('history', 'min')}
						icon='time'
					/>
					<StatBox
						value={totalVolume > 0 ? `${Math.round(totalVolume / 1000 * 10) / 10}k` : `${workout.volume}`}
						label={t('workout', 'kg')}
						icon='trending-up'
					/>
				</View>

				{/* ── Muscle groups ── */}
				{muscleGroupsList.length > 0 && (
					<View style={s.tagRow}>
						{muscleGroupsList.map((g, i) => (
							<View key={i} style={s.muscleTag}>
								<Text style={s.muscleTagText}>{translateGroupName(g, language)}</Text>
							</View>
						))}
					</View>
				)}

				{/* ── Notes ── */}
				{!!workout.notes && (
					<View style={s.notesCard}>
						<Ionicons name='document-text-outline' size={16} color={C.subtext} />
						<Text style={s.notesText}>{workout.notes}</Text>
					</View>
				)}

				{/* ── Exercises ── */}
				{exercises.length > 0 && (
					<View style={s.section}>
						<Text style={s.sectionTitle}>
							{t('workout', 'exercises')} ({exercises.length})
						</Text>
						{exercises.map((ex, i) => (
							<TouchableOpacity
								key={ex.id ?? i}
								style={[s.exCard, i === selectedExIdx && s.exCardActive]}
								onPress={() => setSelectedExIdx(i)}
								activeOpacity={0.7}
							>
								<View style={s.exCardLeft}>
									<View style={[s.exIdx, i === selectedExIdx && { backgroundColor: C.primary }]}>
										<Text style={s.exIdxText}>{i + 1}</Text>
									</View>
									<View style={s.exInfo}>
										<Text style={s.exName} numberOfLines={1}>
											{translateExerciseName(ex.name, language)}
										</Text>
										<Text style={s.exMuscle}>
											{translateGroupName(ex.muscle_group, language)}
										</Text>
									</View>
								</View>
								<View style={s.exStats}>
									<Text style={s.exVolume}>
										{ex.sets.reduce((sum, st) => sum + st.weight * st.reps, 0)} {t('workout', 'kg')}
									</Text>
									<Text style={s.exSets}>
										{ex.sets.length} {t('workout', 'sets')}
									</Text>
								</View>
							</TouchableOpacity>
						))}
					</View>
				)}

				{/* ── Selected exercise sets table ── */}
				{selectedEx && selectedEx.sets.length > 0 && (
					<View style={s.section}>
						<Text style={s.sectionTitle}>
							{translateExerciseName(selectedEx.name, language)}
						</Text>

						{/* Table header */}
						<View style={s.tableWrap}>
							<View style={s.tableHeader}>
								<Text style={[s.tableHead, s.colSet]}>{t('workout', 'sets')}</Text>
								<Text style={[s.tableHead, s.colWeight]}>{t('workout', 'weight')}</Text>
								<Text style={[s.tableHead, s.colReps]}>{t('workout', 'reps')}</Text>
								<Text style={[s.tableHead, s.colVol]}>{t('workout', 'volume')}</Text>
							</View>

							{selectedEx.sets.map((set, idx) => {
								const vol = set.weight * set.reps
								return (
									<View
										key={set.id ?? idx}
										style={[s.tableRow, idx % 2 === 0 && s.tableRowAlt]}
									>
										<Text style={[s.tableCell, s.colSet, s.cellNum]}>{set.set_number}</Text>
										<Text style={[s.tableCell, s.colWeight]}>
											{set.weight} {t('workout', 'kg')}
										</Text>
										<Text style={[s.tableCell, s.colReps]}>{set.reps}</Text>
										<Text style={[s.tableCell, s.colVol, { color: C.primary }]}>
											{vol}
										</Text>
									</View>
								)
							})}

							{/* Totals row */}
							<View style={s.tableTotals}>
								<Text style={[s.tableTotalText, s.colSet]}>Σ</Text>
								<Text style={[s.tableTotalText, s.colWeight]}>
									{selectedEx.sets.reduce((sum, st) => sum + st.weight, 0)} {t('workout', 'kg')}
								</Text>
								<Text style={[s.tableTotalText, s.colReps]}>
									{selectedEx.sets.reduce((sum, st) => sum + st.reps, 0)}
								</Text>
								<Text style={[s.tableTotalText, s.colVol, { color: C.primary }]}>
									{selectedEx.sets.reduce((sum, st) => sum + st.weight * st.reps, 0)}
								</Text>
							</View>
						</View>

						{/* 1RM */}
						{(selectedEx.one_rep_max ?? 0) > 0 && (
							<View style={s.oneRepRow}>
								<Ionicons name='trophy-outline' size={16} color={C.gold} />
								<Text style={s.oneRepText}>
									1RM: {selectedEx.one_rep_max} {t('workout', 'kg')}
								</Text>
							</View>
						)}

						{/* Exercise notes */}
						{!!selectedEx.notes && (
							<View style={s.exNotesCard}>
								<Ionicons name='information-circle-outline' size={14} color={C.subtext} />
								<Text style={s.exNotesText}>{selectedEx.notes}</Text>
							</View>
						)}
					</View>
				)}
			</ScrollView>
		</SafeAreaView>
	)
}

// ─── Helper component ─────────────────────────────────────────────────────────

const StatBox = ({
	value,
	label,
	icon,
}: {
	value: string
	label: string
	icon: string
}) => (
	<View style={s.statBox}>
		<Ionicons name={icon as any} size={18} color={C.primary} style={{ marginBottom: 4 }} />
		<Text style={s.statValue}>{value}</Text>
		<Text style={s.statLabel}>{label}</Text>
	</View>
)

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
	container: { flex: 1, backgroundColor: C.bg },
	center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
	notFoundText: { fontSize: 17, color: C.text, marginTop: 16, marginBottom: 24, textAlign: 'center' },
	backBtn: {
		backgroundColor: C.cardLight,
		paddingHorizontal: 20,
		paddingVertical: 10,
		borderRadius: 12,
	},
	backBtnText: { color: C.text, fontSize: 15, fontWeight: '600' },

	// Header
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 16,
		paddingTop: 8,
		paddingBottom: 12,
		borderBottomWidth: 1,
		borderBottomColor: C.border,
	},
	headerBack: { padding: 4, marginRight: 10 },
	headerCenter: { flex: 1 },
	headerTitle: { fontSize: 18, fontWeight: '700', color: C.text },
	headerSub: { fontSize: 13, color: C.subtext, marginTop: 2 },
	headerDelete: { padding: 8 },

	// Stats row
	statsRow: {
		flexDirection: 'row',
		marginHorizontal: 16,
		marginTop: 16,
		gap: 8,
	},
	statBox: {
		flex: 1,
		backgroundColor: C.card,
		borderRadius: 14,
		paddingVertical: 14,
		paddingHorizontal: 8,
		alignItems: 'center',
		borderWidth: 1,
		borderColor: C.border,
	},
	statValue: { fontSize: 17, fontWeight: '700', color: C.text, marginBottom: 2 },
	statLabel: { fontSize: 10, color: C.subtext, textAlign: 'center' },

	// Tags
	tagRow: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		marginHorizontal: 16,
		marginTop: 12,
		gap: 6,
	},
	muscleTag: {
		backgroundColor: 'rgba(52, 199, 89, 0.12)',
		borderWidth: 1,
		borderColor: 'rgba(52, 199, 89, 0.3)',
		paddingHorizontal: 10,
		paddingVertical: 4,
		borderRadius: 10,
	},
	muscleTagText: { fontSize: 12, color: C.primary, fontWeight: '500' },

	// Notes
	notesCard: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		backgroundColor: C.card,
		marginHorizontal: 16,
		marginTop: 12,
		borderRadius: 12,
		padding: 12,
		gap: 8,
		borderWidth: 1,
		borderColor: C.border,
	},
	notesText: { flex: 1, fontSize: 13, color: C.subtext, lineHeight: 18 },

	// Section
	section: { marginHorizontal: 16, marginTop: 20 },
	sectionTitle: {
		fontSize: 16,
		fontWeight: '700',
		color: C.text,
		marginBottom: 10,
		letterSpacing: 0.2,
	},

	// Exercise cards
	exCard: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: C.card,
		borderRadius: 14,
		padding: 12,
		marginBottom: 8,
		borderWidth: 1,
		borderColor: C.border,
	},
	exCardActive: {
		borderColor: C.primary,
		backgroundColor: 'rgba(52, 199, 89, 0.05)',
	},
	exCardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 10 },
	exIdx: {
		width: 28,
		height: 28,
		borderRadius: 14,
		backgroundColor: C.cardLight,
		alignItems: 'center',
		justifyContent: 'center',
	},
	exIdxText: { fontSize: 13, fontWeight: '700', color: C.text },
	exInfo: { flex: 1 },
	exName: { fontSize: 14, fontWeight: '600', color: C.text, marginBottom: 2 },
	exMuscle: { fontSize: 12, color: C.primary },
	exStats: { alignItems: 'flex-end' },
	exVolume: { fontSize: 14, fontWeight: '700', color: C.text },
	exSets: { fontSize: 12, color: C.subtext, marginTop: 2 },

	// Sets table
	tableWrap: {
		backgroundColor: C.card,
		borderRadius: 14,
		overflow: 'hidden',
		borderWidth: 1,
		borderColor: C.border,
	},
	tableHeader: {
		flexDirection: 'row',
		backgroundColor: C.cardLight,
		paddingVertical: 10,
		paddingHorizontal: 12,
	},
	tableHead: {
		fontSize: 12,
		fontWeight: '600',
		color: C.subtext,
		textAlign: 'center',
	},
	tableRow: {
		flexDirection: 'row',
		paddingVertical: 11,
		paddingHorizontal: 12,
		borderBottomWidth: 1,
		borderBottomColor: 'rgba(44,44,46,0.6)',
	},
	tableRowAlt: { backgroundColor: 'rgba(28,28,30,0.4)' },
	tableCell: { fontSize: 14, color: C.text, textAlign: 'center' },
	cellNum: { fontWeight: '700', color: C.subtext },
	tableTotals: {
		flexDirection: 'row',
		backgroundColor: C.cardLight,
		paddingVertical: 10,
		paddingHorizontal: 12,
	},
	tableTotalText: {
		fontSize: 13,
		fontWeight: '700',
		color: C.text,
		textAlign: 'center',
	},
	// Column widths
	colSet: { flex: 0.6 },
	colWeight: { flex: 1.2 },
	colReps: { flex: 0.9 },
	colVol: { flex: 1.1 },

	// 1RM
	oneRepRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
		marginTop: 10,
		backgroundColor: 'rgba(255, 214, 10, 0.08)',
		borderRadius: 10,
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderWidth: 1,
		borderColor: 'rgba(255, 214, 10, 0.2)',
	},
	oneRepText: { fontSize: 14, fontWeight: '600', color: C.gold },

	// Exercise notes
	exNotesCard: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		gap: 6,
		marginTop: 8,
		backgroundColor: C.card,
		borderRadius: 10,
		padding: 10,
		borderWidth: 1,
		borderColor: C.border,
	},
	exNotesText: { flex: 1, fontSize: 13, color: C.subtext, lineHeight: 18 },
})
