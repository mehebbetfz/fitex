import { useLanguage } from '@/contexts/language-context'
import * as db from '@/scripts/database'
import { Ionicons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import {
	Alert,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const MEASUREMENT_TYPES = [
	{ name: 'Вес', unit: 'кг', icon: 'scale', labelKey: 'weightLabel' },
	{ name: 'Грудь', unit: 'см', icon: 'body', labelKey: 'chestLabel' },
	{ name: 'Талия', unit: 'см', icon: 'body', labelKey: 'waistLabel' },
	{ name: 'Бедра', unit: 'см', icon: 'body', labelKey: 'hipsLabel' },
	{ name: 'Бицепс', unit: 'см', icon: 'fitness', labelKey: 'bicepsLabel' },
	{ name: 'Шея', unit: 'см', icon: 'body', labelKey: 'neckLabel' },
	{ name: 'Икры', unit: 'см', icon: 'body', labelKey: 'calfLabel' },
	{ name: 'Плечо', unit: 'см', icon: 'body', labelKey: 'bicepsLabel' },
	{ name: 'Жир', unit: '%', icon: 'water', labelKey: 'bodyFatLabel' },
	{ name: 'Мышцы', unit: 'кг', icon: 'fitness', labelKey: 'thighLabel' },
]

export default function QuickMeasurementsScreen() {
	const router = useRouter()
	const { t } = useLanguage()
	const [values, setValues] = useState<Record<string, string>>(
		Object.fromEntries(MEASUREMENT_TYPES.map(m => [m.name, ''])),
	)
	const [saving, setSaving] = useState(false)

	const filledCount = Object.values(values).filter(v => v.trim()).length

	const handleSave = async () => {
	if (filledCount === 0) {
		Alert.alert(t('common', 'noData'), t('measurements', 'emptySubtitle'))
		return
	}

		try {
			setSaving(true)
			const today = new Date().toISOString().split('T')[0]
			const allMeasurements = await db.getBodyMeasurements()

			for (const type of MEASUREMENT_TYPES) {
				const val = values[type.name].trim()
				if (!val) continue

				// Рассчитываем тренд
				const prev = allMeasurements
					.filter(m => m.name === type.name)
					.sort(
						(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
					)[0]

				let trend: 'up' | 'down' | 'stable' = 'stable'
				if (prev) {
					const cur = parseFloat(val)
					if (cur > prev.value) trend = 'up'
					else if (cur < prev.value) trend = 'down'
				}

				await db.addBodyMeasurement({
					name: type.name,
					value: parseFloat(val),
					unit: type.unit,
					date: today,
					trend,
				})
			}

			await AsyncStorage.setItem('lastMeasurementDate', today)
		Alert.alert(t('common', 'success'), `${t('measurements', 'saveBtn')}: ${filledCount}`, [
			{ text: t('common', 'ok'), onPress: () => router.back() },
		])
	} catch (err) {
		console.error(err)
		Alert.alert(t('common', 'error'), t('common', 'unknownError'))
		} finally {
			setSaving(false)
		}
	}

	return (
		<SafeAreaView style={s.container}>
			<View style={s.header}>
				<TouchableOpacity onPress={() => router.back()} style={s.iconBtn}>
					<Ionicons name='arrow-back' size={22} color='#FFF' />
				</TouchableOpacity>
				<View>
				<Text style={s.headerTitle}>{t('measurements', 'title')}</Text>
				<Text style={s.headerSub}>{t('measurements', 'emptySubtitle')}</Text>
				</View>
				{/* Счётчик заполненных */}
				{filledCount > 0 ? (
					<View style={s.filledBadge}>
						<Text style={s.filledBadgeText}>{filledCount}</Text>
					</View>
				) : (
					<View style={{ width: 32 }} />
				)}
			</View>

			<KeyboardAvoidingView
				style={{ flex: 1 }}
				behavior={Platform.OS === 'ios' ? 'padding' : undefined}
			>
				<ScrollView
					contentContainerStyle={s.content}
					showsVerticalScrollIndicator={false}
					keyboardShouldPersistTaps='handled'
				>
					{MEASUREMENT_TYPES.map((type, i) => {
						const val = values[type.name]
						const filled = val.trim().length > 0
						return (
							<View key={i} style={[s.row, filled && s.rowFilled]}>
								<View style={[s.iconWrap, filled && s.iconWrapFilled]}>
									<Ionicons
										name={(ICONS[type.name] ?? 'body') as any}
										size={16}
										color={filled ? '#34C759' : '#8E8E93'}
									/>
								</View>
							<Text style={[s.rowName, filled && s.rowNameFilled]}>
								{t('measurements', type.labelKey as any)}
							</Text>
								<View style={s.inputWrap}>
									<TextInput
										style={s.input}
										value={val}
										onChangeText={text =>
											setValues(prev => ({ ...prev, [type.name]: text }))
										}
										placeholder='—'
										placeholderTextColor='#3A3A3C'
										keyboardType='numeric'
									/>
									<Text style={s.unit}>{type.unit}</Text>
								</View>
							</View>
						)
					})}

					<TouchableOpacity
						style={[s.saveBtn, filledCount === 0 && s.saveBtnDisabled]}
						onPress={handleSave}
						disabled={saving || filledCount === 0}
					>
						<Ionicons name='checkmark-circle' size={20} color='#FFF' />
						<Text style={s.saveBtnText}>
						{saving
							? t('templates', 'saving')
							: `${t('common', 'save')}${filledCount > 0 ? ` (${filledCount})` : ''}`}
						</Text>
					</TouchableOpacity>
				</ScrollView>
			</KeyboardAvoidingView>
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
	iconBtn: { padding: 4 },
	headerTitle: {
		fontSize: 18,
		fontWeight: '700',
		color: '#FFF',
		textAlign: 'center',
	},
	headerSub: { fontSize: 12, color: '#8E8E93', marginTop: 1 },
	filledBadge: {
		width: 28,
		height: 28,
		borderRadius: 14,
		backgroundColor: '#34C759',
		alignItems: 'center',
		justifyContent: 'center',
	},
	filledBadgeText: { fontSize: 13, fontWeight: '700', color: '#FFF' },

	content: { padding: 12, gap: 6, paddingBottom: 40 },

	row: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#1C1C1E',
		borderRadius: 12,
		paddingHorizontal: 12,
		paddingVertical: 10,
		borderWidth: 1,
		borderColor: '#2C2C2E',
		gap: 10,
	},
	rowFilled: { borderColor: 'rgba(52,199,89,0.3)' },
	iconWrap: {
		width: 30,
		height: 30,
		borderRadius: 8,
		backgroundColor: '#2C2C2E',
		alignItems: 'center',
		justifyContent: 'center',
	},
	iconWrapFilled: { backgroundColor: 'rgba(52,199,89,0.12)' },
	rowName: { width: 70, fontSize: 14, fontWeight: '500', color: '#8E8E93' },
	rowNameFilled: { color: '#FFF' },
	inputWrap: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'flex-end',
		gap: 6,
	},
	input: {
		fontSize: 18,
		fontWeight: '700',
		color: '#FFF',
		textAlign: 'right',
		minWidth: 60,
		paddingVertical: 0,
	},
	unit: { fontSize: 13, color: '#8E8E93', width: 26 },

	saveBtn: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#34C759',
		borderRadius: 12,
		paddingVertical: 16,
		gap: 8,
		marginTop: 8,
	},
	saveBtnDisabled: { backgroundColor: '#2C2C2E' },
	saveBtnText: { fontSize: 16, fontWeight: '700', color: '#FFF' },
})
