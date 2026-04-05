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

const MEASUREMENT_TYPES = [
	{ name: 'Вес', unit: 'кг', icon: 'scale' },
	{ name: 'Грудь', unit: 'см', icon: 'body' },
	{ name: 'Талия', unit: 'см', icon: 'body' },
	{ name: 'Бедра', unit: 'см', icon: 'body' },
	{ name: 'Бицепс', unit: 'см', icon: 'fitness' },
	{ name: 'Шея', unit: 'см', icon: 'body' },
	{ name: 'Икры', unit: 'см', icon: 'body' },
	{ name: 'Плечо', unit: 'см', icon: 'body' },
	{ name: 'Жир', unit: '%', icon: 'water' },
	{ name: 'Мышцы', unit: 'кг', icon: 'fitness' },
]

export default function AddMeasurementScreen() {
	const router = useRouter()
	const [selectedType, setSelectedType] = useState(MEASUREMENT_TYPES[0])
	const [value, setValue] = useState('')
	const [date, setDate] = useState(new Date().toISOString().split('T')[0])
	const [goal, setGoal] = useState('')

	const handleSave = async () => {
		if (!value.trim()) {
			Alert.alert('Ошибка', 'Введите значение измерения')
			return
		}
		try {
			const previousMeasurements = await db.getBodyMeasurements()
			const previousForType = previousMeasurements
				.filter(m => m.name === selectedType.name)
				.sort(
					(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
				)[0]

			let trend: 'up' | 'down' | 'stable' = 'stable'
			if (previousForType) {
				const cur = parseFloat(value)
				if (cur > previousForType.value) trend = 'up'
				else if (cur < previousForType.value) trend = 'down'
			}

			await db.addBodyMeasurement({
				name: selectedType.name,
				value: parseFloat(value),
				unit: selectedType.unit,
				date,
				trend,
				goal: goal ? parseFloat(goal) : undefined,
			})

			Alert.alert('Успех', 'Замер сохранен!', [
				{ text: 'OK', onPress: () => router.back() },
			])
		} catch (error) {
			Alert.alert('Ошибка', 'Не удалось сохранить замер')
		}
	}

	return (
		<SafeAreaView style={s.container}>
			<View style={s.header}>
				<TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
					<Ionicons name='arrow-back' size={22} color='#FFF' />
				</TouchableOpacity>
				<Text style={s.headerTitle}>Добавить замер</Text>
				<View style={{ width: 30 }} />
			</View>

			<ScrollView
				contentContainerStyle={s.content}
				showsVerticalScrollIndicator={false}
			>
				{/* Тип замера */}
				<Text style={s.label}>Тип замера</Text>
				<ScrollView
					horizontal
					showsHorizontalScrollIndicator={false}
					style={s.hScroll}
				>
					<View style={s.hRow}>
						{MEASUREMENT_TYPES.map((type, i) => {
							const active = selectedType.name === type.name
							return (
								<TouchableOpacity
									key={i}
									style={[s.typeCard, active && s.typeCardActive]}
									onPress={() => setSelectedType(type)}
								>
									<Ionicons
										name={type.icon as any}
										size={20}
										color={active ? '#34C759' : '#8E8E93'}
									/>
									<Text style={[s.typeName, active && s.typeNameActive]}>
										{type.name}
									</Text>
									<Text style={s.typeUnit}>{type.unit}</Text>
								</TouchableOpacity>
							)
						})}
					</View>
				</ScrollView>

				{/* Значение */}
				<Text style={s.label}>Значение</Text>
				<View style={s.inputRow}>
					<TextInput
						style={s.bigInput}
						value={value}
						onChangeText={setValue}
						placeholder='0'
						placeholderTextColor='#3A3A3C'
						keyboardType='numeric'
						autoFocus
					/>
					<Text style={s.unitLabel}>{selectedType.unit}</Text>
				</View>

				{/* Дата */}
				<Text style={s.label}>Дата</Text>
				<TextInput
					style={s.input}
					value={date}
					onChangeText={setDate}
					placeholder='ГГГГ-ММ-ДД'
					placeholderTextColor='#8E8E93'
				/>

				{/* Цель */}
				<Text style={s.label}>
					Цель <Text style={s.optional}>(опционально)</Text>
				</Text>
				<View style={s.inputRow}>
					<TextInput
						style={s.bigInput}
						value={goal}
						onChangeText={setGoal}
						placeholder='0'
						placeholderTextColor='#3A3A3C'
						keyboardType='numeric'
					/>
					<Text style={s.unitLabel}>{selectedType.unit}</Text>
				</View>

				<TouchableOpacity style={s.saveBtn} onPress={handleSave}>
					<Text style={s.saveBtnText}>Сохранить замер</Text>
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
	hScroll: { marginHorizontal: -16 },
	hRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8 },
	typeCard: {
		alignItems: 'center',
		backgroundColor: '#1C1C1E',
		borderRadius: 12,
		paddingVertical: 12,
		paddingHorizontal: 14,
		gap: 4,
		borderWidth: 1,
		borderColor: '#2C2C2E',
		minWidth: 80,
	},
	typeCardActive: {
		borderColor: '#34C759',
		backgroundColor: 'rgba(52,199,89,0.08)',
	},
	typeName: { fontSize: 13, fontWeight: '500', color: '#8E8E93' },
	typeNameActive: { color: '#FFF' },
	typeUnit: { fontSize: 11, color: '#8E8E93' },
	inputRow: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#1C1C1E',
		borderRadius: 12,
		paddingHorizontal: 16,
		borderWidth: 1,
		borderColor: '#2C2C2E',
	},
	bigInput: {
		flex: 1,
		fontSize: 28,
		fontWeight: '700',
		color: '#FFF',
		paddingVertical: 14,
	},
	unitLabel: { fontSize: 18, color: '#8E8E93', marginLeft: 8 },
	input: {
		backgroundColor: '#1C1C1E',
		borderRadius: 12,
		padding: 14,
		fontSize: 15,
		color: '#FFF',
		borderWidth: 1,
		borderColor: '#2C2C2E',
	},
	saveBtn: {
		backgroundColor: '#34C759',
		borderRadius: 12,
		paddingVertical: 16,
		alignItems: 'center',
		marginTop: 32,
	},
	saveBtnText: { fontSize: 16, fontWeight: '700', color: '#FFF' },
})
