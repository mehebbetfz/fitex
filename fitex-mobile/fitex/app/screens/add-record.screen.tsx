import type { AppColors } from '@/constants/app-theme'
import { useLanguage } from '@/contexts/language-context'
import { useAppTheme } from '@/contexts/theme-context'
import * as db from '@/scripts/database'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useMemo, useState } from 'react'
import {
	Alert,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const EXERCISE_CATEGORIES = [
	{
		id: 'strength',
		nameKey: 'catStrength',
		icon: 'barbell',
		exercises: ['Bench Press', 'Squat', 'Deadlift', 'Pull-up', 'OHP', 'Bent-over Row'],
	},
	{
		id: 'cardio',
		nameKey: 'catCardio',
		icon: 'heart',
		exercises: ['5k Run', '10k Run', '20k Bike', '100m Swim', 'Jump Rope'],
	},
	{
		id: 'endurance',
		nameKey: 'catEndurance',
		icon: 'time',
		exercises: ['Push-ups', 'Plank', 'Squats (timed)', 'Burpees', 'Mountain Climbers'],
	},
]

export default function AddRecordScreen() {
	const router = useRouter()
	const { t } = useLanguage()
	const { colors: C } = useAppTheme()
	const s = useMemo(() => makeStyles(C), [C])
	const [selectedCategory, setSelectedCategory] = useState(
		EXERCISE_CATEGORIES[0],
	)
	const [exercise, setExercise] = useState('')
	const [weight, setWeight] = useState('')
	const [date, setDate] = useState(new Date().toISOString().split('T')[0])
	const [notes, setNotes] = useState('')

	const handleSave = async () => {
		if (!exercise.trim()) {
			Alert.alert(t('common', 'error'), t('records', 'exercisePlaceholder'))
			return
		}
		if (!weight.trim()) {
			Alert.alert(t('common', 'error'), t('records', 'kg'))
			return
		}
		try {
			const previousRecords = await db.getPersonalRecords()
			const prev = previousRecords
				.filter(r => r.exercise === exercise)
				.sort(
					(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
				)[0]

			let trend: 'up' | 'down' | 'stable' = 'stable'
			let improvement = ''
			if (prev) {
				const p = parseFloat(prev.weight),
					c = parseFloat(weight)
				if (c > p) {
					trend = 'up'
					improvement = `+${(c - p).toFixed(1)}`
				} else if (c < p) {
					trend = 'down'
					improvement = `-${(p - c).toFixed(1)}`
				}
			}

			await db.addPersonalRecord({
				exercise,
				weight,
				date,
				trend,
				category: selectedCategory.id as any,
				notes: notes.trim() || undefined,
				previous_record: prev?.weight,
				improvement,
			})
			Alert.alert(t('common', 'success'), t('records', 'saveRecord'), [
				{ text: t('common', 'ok'), onPress: () => router.back() },
			])
		} catch {
			Alert.alert(t('common', 'error'), t('common', 'unknownError'))
		}
	}

	return (
		<SafeAreaView style={s.container}>
			<View style={s.header}>
				<TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
					<Ionicons name='arrow-back' size={22} color={C.text} />
				</TouchableOpacity>
				<Text style={s.headerTitle}>{t('records', 'addRecord')}</Text>
				<View style={{ width: 30 }} />
			</View>

			<ScrollView
				contentContainerStyle={s.content}
				showsVerticalScrollIndicator={false}
			>
				<Text style={s.label}>{t('records', 'category')}</Text>
				<View style={s.categoryRow}>
					{EXERCISE_CATEGORIES.map((cat, i) => {
						const active = selectedCategory.id === cat.id
						return (
							<TouchableOpacity
								key={i}
								style={[s.categoryCard, active && s.categoryCardActive]}
								onPress={() => {
									setSelectedCategory(cat)
									if (!exercise && cat.exercises.length)
										setExercise(cat.exercises[0])
								}}
							>
								<Ionicons
									name={cat.icon as any}
									size={20}
									color={active ? C.primary : C.textSecondary}
								/>
								<Text style={[s.categoryName, active && s.categoryNameActive]}>
									{t('records', cat.nameKey as any)}
								</Text>
							</TouchableOpacity>
						)
					})}
				</View>

				<Text style={s.label}>{t('records', 'exerciseName')}</Text>
				<TextInput
					style={s.input}
					value={exercise}
					onChangeText={setExercise}
					placeholder={t('records', 'exercisePlaceholder')}
					placeholderTextColor={C.textSecondary}
				/>
				<ScrollView
					horizontal
					showsHorizontalScrollIndicator={false}
					style={s.hScroll}
				>
					<View style={s.hRow}>
						{selectedCategory.exercises.map((ex, i) => (
							<TouchableOpacity
								key={i}
								style={[s.chip, exercise === ex && s.chipActive]}
								onPress={() => setExercise(ex)}
							>
								<Text style={[s.chipText, exercise === ex && s.chipTextActive]}>
									{ex}
								</Text>
							</TouchableOpacity>
						))}
					</View>
				</ScrollView>

				<Text style={s.label}>{t('records', 'record')}</Text>
				<TextInput
					style={s.input}
					value={weight}
					onChangeText={setWeight}
					placeholder={`e.g. 100 ${t('records', 'kg')}`}
					placeholderTextColor={C.textSecondary}
				/>

				<Text style={s.label}>{t('measurements', 'date')}</Text>
				<TextInput
					style={s.input}
					value={date}
					onChangeText={setDate}
					placeholder='YYYY-MM-DD'
					placeholderTextColor={C.textSecondary}
				/>

				<Text style={s.label}>
					{t('workout', 'notesPlaceholder')}{' '}
					<Text style={s.optional}>({t('common', 'optional')})</Text>
				</Text>
				<TextInput
					style={[s.input, s.notesInput]}
					value={notes}
					onChangeText={setNotes}
					placeholder={`e.g. 3×5 ${t('records', 'reps')}`}
					placeholderTextColor={C.textSecondary}
					multiline
					numberOfLines={3}
					textAlignVertical='top'
				/>

				<TouchableOpacity style={s.saveBtn} onPress={handleSave}>
					<Text style={s.saveBtnText}>{t('records', 'saveRecord')}</Text>
				</TouchableOpacity>
			</ScrollView>
		</SafeAreaView>
	)
}

function makeStyles(C: AppColors) {
	return StyleSheet.create({
		container: { flex: 1, backgroundColor: C.background },
		header: {
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'space-between',
			paddingHorizontal: 12,
			paddingVertical: 12,
			borderBottomWidth: 1,
			borderBottomColor: C.cardLight,
		},
		backBtn: { padding: 4 },
		headerTitle: { fontSize: 18, fontWeight: '700', color: C.text },
		content: { padding: 16, paddingBottom: 48 },
		label: {
			fontSize: 13,
			fontWeight: '600',
			color: C.textSecondary,
			marginBottom: 8,
			marginTop: 20,
			textTransform: 'uppercase',
			letterSpacing: 0.6,
		},
		optional: { fontWeight: '400', textTransform: 'none', letterSpacing: 0 },
		categoryRow: { flexDirection: 'row', gap: 8 },
		categoryCard: {
			flex: 1,
			alignItems: 'center',
			gap: 6,
			paddingVertical: 12,
			backgroundColor: C.card,
			borderRadius: 12,
			borderWidth: 1,
			borderColor: C.cardLight,
		},
		categoryCardActive: {
			borderColor: C.primary,
			backgroundColor: 'rgba(52,199,89,0.08)',
		},
		categoryName: { fontSize: 13, fontWeight: '500', color: C.textSecondary },
		categoryNameActive: { color: C.text },
		input: {
			backgroundColor: C.card,
			borderRadius: 12,
			padding: 14,
			fontSize: 15,
			color: C.text,
			borderWidth: 1,
			borderColor: C.cardLight,
		},
		notesInput: { minHeight: 80 },
		hScroll: { marginHorizontal: -16, marginTop: 8 },
		hRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8 },
		chip: {
			paddingHorizontal: 12,
			paddingVertical: 7,
			borderRadius: 20,
			backgroundColor: C.card,
			borderWidth: 1,
			borderColor: C.cardLight,
		},
		chipActive: {
			backgroundColor: 'rgba(52,199,89,0.12)',
			borderColor: C.primary,
		},
		chipText: { fontSize: 13, color: C.textSecondary },
		chipTextActive: { color: C.primary, fontWeight: '600' },
		saveBtn: {
			backgroundColor: C.primary,
			borderRadius: 12,
			paddingVertical: 16,
			alignItems: 'center',
			marginTop: 32,
		},
		saveBtnText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
	})
}
