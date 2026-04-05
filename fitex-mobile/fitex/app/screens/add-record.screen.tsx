import * as db from '@/scripts/database'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useState } from 'react'
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
		name: 'Сила',
		icon: 'barbell',
		exercises: [
			'Жим лежа',
			'Приседания',
			'Становая тяга',
			'Подтягивания',
			'Жим стоя',
			'Тяга в наклоне',
		],
	},
	{
		id: 'cardio',
		name: 'Кардио',
		icon: 'heart',
		exercises: [
			'Бег 5 км',
			'Бег 10 км',
			'Велосипед 20 км',
			'Плавание 100 м',
			'Скакалка',
		],
	},
	{
		id: 'endurance',
		name: 'Выносливость',
		icon: 'time',
		exercises: [
			'Отжимания',
			'Планка',
			'Приседания (время)',
			'Берпи',
			'Скалолазание',
		],
	},
]

export default function AddRecordScreen() {
	const router = useRouter()
	const [selectedCategory, setSelectedCategory] = useState(
		EXERCISE_CATEGORIES[0],
	)
	const [exercise, setExercise] = useState('')
	const [weight, setWeight] = useState('')
	const [date, setDate] = useState(new Date().toISOString().split('T')[0])
	const [notes, setNotes] = useState('')

	const handleSave = async () => {
		if (!exercise.trim()) {
			Alert.alert('Ошибка', 'Введите упражнение')
			return
		}
		if (!weight.trim()) {
			Alert.alert('Ошибка', 'Введите результат')
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
			Alert.alert('Успех', 'Рекорд сохранен!', [
				{ text: 'OK', onPress: () => router.back() },
			])
		} catch {
			Alert.alert('Ошибка', 'Не удалось сохранить рекорд')
		}
	}

	return (
		<SafeAreaView style={s.container}>
			<View style={s.header}>
				<TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
					<Ionicons name='arrow-back' size={22} color='#FFF' />
				</TouchableOpacity>
				<Text style={s.headerTitle}>Добавить рекорд</Text>
				<View style={{ width: 30 }} />
			</View>

			<ScrollView
				contentContainerStyle={s.content}
				showsVerticalScrollIndicator={false}
			>
				{/* Категория */}
				<Text style={s.label}>Категория</Text>
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
									color={active ? '#34C759' : '#8E8E93'}
								/>
								<Text style={[s.categoryName, active && s.categoryNameActive]}>
									{cat.name}
								</Text>
							</TouchableOpacity>
						)
					})}
				</View>

				{/* Упражнение */}
				<Text style={s.label}>Упражнение</Text>
				<TextInput
					style={s.input}
					value={exercise}
					onChangeText={setExercise}
					placeholder='Введите или выберите ниже'
					placeholderTextColor='#8E8E93'
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

				{/* Результат */}
				<Text style={s.label}>Вес / Результат</Text>
				<TextInput
					style={s.input}
					value={weight}
					onChangeText={setWeight}
					placeholder='напр. 100 кг или 22:30'
					placeholderTextColor='#8E8E93'
				/>

				{/* Дата */}
				<Text style={s.label}>Дата</Text>
				<TextInput
					style={s.input}
					value={date}
					onChangeText={setDate}
					placeholder='ГГГГ-ММ-ДД'
					placeholderTextColor='#8E8E93'
				/>

				{/* Заметки */}
				<Text style={s.label}>
					Заметки <Text style={s.optional}>(опционально)</Text>
				</Text>
				<TextInput
					style={[s.input, s.notesInput]}
					value={notes}
					onChangeText={setNotes}
					placeholder='напр. 3×5 повторений'
					placeholderTextColor='#8E8E93'
					multiline
					numberOfLines={3}
					textAlignVertical='top'
				/>

				<TouchableOpacity style={s.saveBtn} onPress={handleSave}>
					<Text style={s.saveBtnText}>Сохранить рекорд</Text>
				</TouchableOpacity>
			</ScrollView>
		</SafeAreaView>
	)
}

const s = StyleSheet.create({
	container: { flex: 1, backgroundColor: '#121212' },
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 12,
		paddingVertical: 12,
		borderBottomWidth: 1,
		borderBottomColor: '#2C2C2E',
	},
	backBtn: { padding: 4 },
	headerTitle: { fontSize: 18, fontWeight: '700', color: '#FFF' },
	content: { padding: 16, paddingBottom: 48 },
	label: {
		fontSize: 13,
		fontWeight: '600',
		color: '#8E8E93',
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
		backgroundColor: '#1C1C1E',
		borderRadius: 12,
		borderWidth: 1,
		borderColor: '#2C2C2E',
	},
	categoryCardActive: {
		borderColor: '#34C759',
		backgroundColor: 'rgba(52,199,89,0.08)',
	},
	categoryName: { fontSize: 13, fontWeight: '500', color: '#8E8E93' },
	categoryNameActive: { color: '#FFF' },
	input: {
		backgroundColor: '#1C1C1E',
		borderRadius: 12,
		padding: 14,
		fontSize: 15,
		color: '#FFF',
		borderWidth: 1,
		borderColor: '#2C2C2E',
	},
	notesInput: { minHeight: 80 },
	hScroll: { marginHorizontal: -16, marginTop: 8 },
	hRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8 },
	chip: {
		paddingHorizontal: 12,
		paddingVertical: 7,
		borderRadius: 20,
		backgroundColor: '#1C1C1E',
		borderWidth: 1,
		borderColor: '#2C2C2E',
	},
	chipActive: {
		backgroundColor: 'rgba(52,199,89,0.12)',
		borderColor: '#34C759',
	},
	chipText: { fontSize: 13, color: '#8E8E93' },
	chipTextActive: { color: '#34C759', fontWeight: '600' },
	saveBtn: {
		backgroundColor: '#34C759',
		borderRadius: 12,
		paddingVertical: 16,
		alignItems: 'center',
		marginTop: 32,
	},
	saveBtnText: { fontSize: 16, fontWeight: '700', color: '#FFF' },
})
