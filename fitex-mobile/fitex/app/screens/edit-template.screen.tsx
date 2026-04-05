import { useLanguage } from '@/contexts/language-context'
import { muscle_groups } from '@/constants/muscle-groups'
import { Ionicons } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import {
	ActivityIndicator,
	Alert,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useDatabase } from '../contexts/database-context'

const COLORS = {
	primary: '#34C759',
	background: '#121212',
	card: '#1C1C1E',
	cardLight: '#2C2C2E',
	border: '#3A3A3C',
	text: '#FFFFFF',
	textSecondary: '#8E8E93',
	error: '#FF3B30',
	blue: '#0A84FF',
}

// Все упражнения для выбора
const ALL_EXERCISES = muscle_groups.flatMap(group =>
	group.subgroups.flatMap(sub =>
		sub.exercises.map(ex => ({
			name: ex.name,
			muscle_group: sub.name,
		})),
	),
)

interface ExerciseItem {
	id: string
	dbId?: number
	name: string
	muscle_group: string
	sets: number
	reps: number
	weight: number
}

export default function EditTemplateScreen() {
	const router = useRouter()
	const { t } = useLanguage()
	const { id } = useLocalSearchParams<{ id: string }>()
	const { getWorkoutTemplate, editWorkoutTemplate, removeTemplate } =
		useDatabase()

	const [name, setName] = useState('')
	const [description, setDescription] = useState('')
	const [duration, setDuration] = useState('60')
	const [selectedMuscleGroups, setSelectedMuscleGroups] = useState<string[]>([])
	const [exercises, setExercises] = useState<ExerciseItem[]>([])
	const [showExercisePicker, setShowExercisePicker] = useState(false)
	const [searchQuery, setSearchQuery] = useState('')
	const [loading, setLoading] = useState(true)
	const [saving, setSaving] = useState(false)

	useEffect(() => {
		if (id) {
			loadTemplateData()
		}
	}, [id])

	const loadTemplateData = async () => {
		try {
			setLoading(true)
			const templateId = parseInt(id)
			const data = await getWorkoutTemplate(templateId)

			if (data) {
				setName(data.template.name)
				setDescription(data.template.description || '')
				setDuration(String(data.template.estimated_duration || 60))

				const groups =
					data.template.muscle_groups?.split(',').filter(Boolean) || []
				setSelectedMuscleGroups(groups)

				setExercises(
					data.exercises.map((ex, i) => ({
						id: `edit-${ex.id}-${i}`,
						dbId: ex.id,
						name: ex.name,
						muscle_group: ex.muscle_group,
						sets: ex.default_sets,
						reps: ex.default_reps,
						weight: ex.default_weight,
					})),
				)
			}
		} catch (error) {
			console.error('Error loading template:', error)
			Alert.alert(t('common', 'error'), t('common', 'unknownError'))
		} finally {
			setLoading(false)
		}
	}

	const filteredExercises = searchQuery
		? ALL_EXERCISES.filter(
				e =>
					e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
					e.muscle_group.toLowerCase().includes(searchQuery.toLowerCase()),
			)
		: ALL_EXERCISES

	const handleAddExercise = (exName: string, muscleGroup: string) => {
		const newExercise: ExerciseItem = {
			id: Date.now().toString() + Math.random(),
			name: exName,
			muscle_group: muscleGroup,
			sets: 3,
			reps: 10,
			weight: 0,
		}
		setExercises([...exercises, newExercise])

		if (!selectedMuscleGroups.includes(muscleGroup)) {
			setSelectedMuscleGroups([...selectedMuscleGroups, muscleGroup])
		}
	}

	const handleRemoveExercise = (id: string) => {
		setExercises(exercises.filter(ex => ex.id !== id))
	}

	const handleUpdateExercise = (
		id: string,
		field: keyof ExerciseItem,
		value: any,
	) => {
		setExercises(
			exercises.map(ex => (ex.id === id ? { ...ex, [field]: value } : ex)),
		)
	}

	const handleUpdate = async () => {
	if (!name.trim()) {
		Alert.alert(t('common', 'error'), t('templates', 'nameRequired'))
		return
	}
	if (exercises.length === 0) {
		Alert.alert(t('common', 'error'), t('templates', 'exerciseRequired'))
		return
	}

		setSaving(true)
		try {
			const templateId = parseInt(id)

			const templateData = {
				name: name.trim(),
				description: description.trim() || undefined,
				estimated_duration: parseInt(duration) || 60,
				muscle_groups: selectedMuscleGroups.join(','),
				exercises_count: exercises.length,
			}

			const templateExercises = exercises.map((ex, i) => ({
				name: ex.name,
				muscle_group: ex.muscle_group,
				order_index: i,
				default_sets: ex.sets,
				default_reps: ex.reps,
				default_weight: ex.weight,
			}))

			await editWorkoutTemplate(templateId, templateData, templateExercises)

		Alert.alert(t('common', 'success'), t('templates', 'updateTemplate'), [
			{ text: t('common', 'ok'), onPress: () => router.back() },
		])
	} catch (error) {
		console.error('Error updating template:', error)
		Alert.alert(t('common', 'error'), t('common', 'unknownError'))
	} finally {
			setSaving(false)
		}
	}

	const handleDelete = async () => {
	Alert.alert(t('templates', 'deleteConfirmTitle'), t('templates', 'deleteConfirmMsg'), [
		{ text: t('common', 'cancel'), style: 'cancel' },
		{
			text: t('common', 'delete'),
			style: 'destructive',
			onPress: async () => {
				try {
					const templateId = parseInt(id)
					await removeTemplate(templateId)

					Alert.alert(t('common', 'success'), t('templates', 'deleteTemplate'), [
						{ text: t('common', 'ok'), onPress: () => router.back() },
					])
				} catch (error) {
					console.error('Error deleting template:', error)
					Alert.alert(t('common', 'error'), t('common', 'unknownError'))
				}
			},
		},
	])
	}

	if (loading) {
		return (
			<SafeAreaView style={s.container}>
				<View style={s.loadingContainer}>
					<ActivityIndicator size='large' color={COLORS.primary} />
					<Text style={s.loadingText}>{t('common', 'loading')}</Text>
				</View>
			</SafeAreaView>
		)
	}

	return (
		<SafeAreaView style={s.container}>
			{/* Заголовок */}
			<View style={s.header}>
				<TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
					<Ionicons name='arrow-back' size={22} color='#FFF' />
				</TouchableOpacity>
				<Text style={s.headerTitle}>{t('templates', 'editBtn')}</Text>
				<View style={{ width: 30 }} />
			</View>

			<ScrollView
				contentContainerStyle={s.content}
				showsVerticalScrollIndicator={false}
			>
				{/* Название */}
			<Text style={s.label}>{t('templates', 'namePlaceholder')} *</Text>
			<TextInput
				style={s.input}
				value={name}
				onChangeText={setName}
				placeholder={t('templates', 'durationPlaceholder')}
				placeholderTextColor='#8E8E93'
			/>

				{/* Описание */}
			<Text style={s.label}>
				{t('templates', 'descPlaceholder')} <Text style={s.optional}>({t('common', 'optional')})</Text>
			</Text>
			<TextInput
				style={[s.input, s.notesInput]}
				value={description}
				onChangeText={setDescription}
				placeholder={t('templates', 'descPlaceholder')}
				placeholderTextColor='#8E8E93'
				multiline
				numberOfLines={3}
				textAlignVertical='top'
			/>

			{/* Duration */}
			<Text style={s.label}>
				{t('templates', 'duration')} <Text style={s.optional}>({t('common', 'optional')})</Text>
			</Text>
				<TextInput
					style={[s.input, s.durationInput]}
					value={duration}
					onChangeText={v => setDuration(v.replace(/[^0-9]/g, ''))}
					placeholder='60'
					placeholderTextColor='#8E8E93'
					keyboardType='number-pad'
					maxLength={3}
				/>

				{/* Упражнения */}
				<View style={s.exercisesHeader}>
				<Text style={s.label}>
					{t('templates', 'exercisesLabel' as any)} {exercises.length > 0 && `(${exercises.length})`}
				</Text>
				<TouchableOpacity
					style={s.addExerciseBtn}
					onPress={() => setShowExercisePicker(true)}
				>
					<Ionicons name='add-circle' size={22} color={COLORS.primary} />
					<Text style={s.addExerciseBtnText}>{t('common', 'add')}</Text>
				</TouchableOpacity>
				</View>

				{exercises.length === 0 ? (
					<View style={s.emptyExercises}>
						<Ionicons name='barbell-outline' size={40} color='#3A3A3C' />
					<Text style={s.emptyExercisesText}>
						{t('templates', 'addExerciseHint' as any)}
					</Text>
					</View>
				) : (
					exercises.map((ex, index) => (
						<View key={ex.id} style={s.exerciseCard}>
							<View style={s.exerciseHeader}>
								<View style={s.exerciseNumber}>
									<Text style={s.exerciseNumberText}>{index + 1}</Text>
								</View>
								<View style={s.exerciseInfo}>
									<Text style={s.exerciseName}>{ex.name}</Text>
									<Text style={s.exerciseMuscle}>{ex.muscle_group}</Text>
								</View>
								<TouchableOpacity
									onPress={() => handleRemoveExercise(ex.id)}
									style={s.removeBtn}
								>
									<Ionicons
										name='close-circle'
										size={20}
										color={COLORS.error}
									/>
								</TouchableOpacity>
							</View>

							<View style={s.exerciseParams}>
								<View style={s.paramItem}>
									<Text style={s.paramLabel}>{t('templates', 'sets' as any)}</Text>
									<View style={s.stepper}>
										<TouchableOpacity
											style={s.stepperBtn}
											onPress={() =>
												handleUpdateExercise(
													ex.id,
													'sets',
													Math.max(1, ex.sets - 1),
												)
											}
										>
											<Ionicons name='remove' size={16} color='#FFF' />
										</TouchableOpacity>
										<Text style={s.stepperValue}>{ex.sets}</Text>
										<TouchableOpacity
											style={s.stepperBtn}
											onPress={() =>
												handleUpdateExercise(
													ex.id,
													'sets',
													Math.min(20, ex.sets + 1),
												)
											}
										>
											<Ionicons name='add' size={16} color='#FFF' />
										</TouchableOpacity>
									</View>
								</View>

								<View style={s.paramItem}>
									<Text style={s.paramLabel}>{t('templates', 'reps' as any)}</Text>
									<View style={s.stepper}>
										<TouchableOpacity
											style={s.stepperBtn}
											onPress={() =>
												handleUpdateExercise(
													ex.id,
													'reps',
													Math.max(1, ex.reps - 1),
												)
											}
										>
											<Ionicons name='remove' size={16} color='#FFF' />
										</TouchableOpacity>
										<Text style={s.stepperValue}>{ex.reps}</Text>
										<TouchableOpacity
											style={s.stepperBtn}
											onPress={() =>
												handleUpdateExercise(
													ex.id,
													'reps',
													Math.min(100, ex.reps + 1),
												)
											}
										>
											<Ionicons name='add' size={16} color='#FFF' />
										</TouchableOpacity>
									</View>
								</View>

								<View style={s.paramItem}>
									<Text style={s.paramLabel}>{t('templates', 'weight' as any)}</Text>
									<TextInput
										style={s.weightInput}
										value={ex.weight.toString()}
										onChangeText={v => {
											const num = parseFloat(v) || 0
											handleUpdateExercise(ex.id, 'weight', num)
										}}
										keyboardType='decimal-pad'
										selectTextOnFocus
									/>
								</View>
							</View>
						</View>
					))
				)}

				{/* Кнопки */}
				<View style={s.buttonsContainer}>
					<TouchableOpacity
						style={[s.updateButton, saving && s.buttonDisabled]}
						onPress={handleUpdate}
						disabled={saving}
					>
					<Text style={s.updateButtonText}>
						{saving ? t('templates', 'saving') : t('templates', 'updateTemplate')}
					</Text>
					</TouchableOpacity>

					<TouchableOpacity style={s.deleteButton} onPress={handleDelete}>
						<Ionicons name='trash' size={20} color={COLORS.error} />
						<Text style={s.deleteButtonText}>{t('templates', 'deleteTemplate')}</Text>
					</TouchableOpacity>
				</View>
			</ScrollView>

			{/* Модал выбора упражнений */}
			{showExercisePicker && (
				<View style={s.pickerOverlay}>
					<View style={s.pickerContent}>
						<View style={s.pickerHeader}>
							<Text style={s.pickerTitle}>{t('exercises', 'selectExercise')}</Text>
							<TouchableOpacity onPress={() => setShowExercisePicker(false)}>
								<Ionicons name='close' size={24} color='#8E8E93' />
							</TouchableOpacity>
						</View>

						<View style={s.searchContainer}>
							<Ionicons name='search' size={18} color='#8E8E93' />
							<TextInput
								style={s.searchInput}
								placeholder={t('exercises', 'searchPlaceholder')}
								placeholderTextColor='#8E8E93'
								value={searchQuery}
								onChangeText={setSearchQuery}
								autoFocus
							/>
							{searchQuery.length > 0 && (
								<TouchableOpacity onPress={() => setSearchQuery('')}>
									<Ionicons name='close-circle' size={18} color='#8E8E93' />
								</TouchableOpacity>
							)}
						</View>

						<ScrollView style={s.exercisesList}>
							{filteredExercises.map((ex, i) => (
								<TouchableOpacity
									key={i}
									style={s.exercisePickerItem}
									onPress={() => {
										handleAddExercise(ex.name, ex.muscle_group)
										setShowExercisePicker(false)
										setSearchQuery('')
									}}
								>
									<View style={s.exercisePickerDot} />
									<View>
										<Text style={s.exercisePickerName}>{ex.name}</Text>
										<Text style={s.exercisePickerGroup}>{ex.muscle_group}</Text>
									</View>
								</TouchableOpacity>
							))}
						</ScrollView>
					</View>
				</View>
			)}
		</SafeAreaView>
	)
}

const s = StyleSheet.create({
	container: { flex: 1, backgroundColor: '#121212' },
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	loadingText: {
		marginTop: 12,
		color: '#FFFFFF',
		fontSize: 16,
	},
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
	durationInput: { width: 100 },
	exercisesHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: 12,
	},
	addExerciseBtn: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
	},
	addExerciseBtnText: {
		fontSize: 14,
		fontWeight: '600',
		color: COLORS.primary,
	},
	emptyExercises: {
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#1C1C1E',
		borderRadius: 12,
		padding: 24,
		borderWidth: 1,
		borderColor: '#2C2C2E',
		borderStyle: 'dashed',
		gap: 8,
	},
	emptyExercisesText: {
		fontSize: 13,
		color: '#8E8E93',
		textAlign: 'center',
	},
	exerciseCard: {
		backgroundColor: '#1C1C1E',
		borderRadius: 12,
		padding: 12,
		marginBottom: 8,
		borderWidth: 1,
		borderColor: '#2C2C2E',
	},
	exerciseHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 12,
	},
	exerciseNumber: {
		width: 24,
		height: 24,
		borderRadius: 12,
		backgroundColor: '#2C2C2E',
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: 10,
	},
	exerciseNumberText: {
		fontSize: 12,
		fontWeight: '600',
		color: '#FFF',
	},
	exerciseInfo: { flex: 1 },
	exerciseName: {
		fontSize: 14,
		fontWeight: '600',
		color: '#FFF',
		marginBottom: 2,
	},
	exerciseMuscle: {
		fontSize: 11,
		color: '#8E8E93',
	},
	removeBtn: { padding: 4 },
	exerciseParams: {
		flexDirection: 'row',
		gap: 12,
	},
	paramItem: { alignItems: 'center', flex: 1 },
	paramLabel: {
		fontSize: 10,
		color: '#8E8E93',
		marginBottom: 4,
	},
	stepper: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#2C2C2E',
		borderRadius: 8,
		overflow: 'hidden',
	},
	stepperBtn: {
		width: 28,
		height: 28,
		alignItems: 'center',
		justifyContent: 'center',
	},
	stepperValue: {
		fontSize: 13,
		fontWeight: '600',
		color: '#FFF',
		minWidth: 30,
		textAlign: 'center',
	},
	weightInput: {
		backgroundColor: '#2C2C2E',
		borderRadius: 8,
		paddingHorizontal: 8,
		paddingVertical: 4,
		fontSize: 13,
		fontWeight: '600',
		color: '#FFF',
		width: 60,
		textAlign: 'center',
		height: 28,
	},
	buttonsContainer: {
		marginTop: 32,
		gap: 12,
	},
	updateButton: {
		backgroundColor: COLORS.primary,
		borderRadius: 12,
		paddingVertical: 16,
		alignItems: 'center',
	},
	updateButtonText: { fontSize: 16, fontWeight: '700', color: '#FFF' },
	buttonDisabled: { opacity: 0.5 },
	deleteButton: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: 'transparent',
		borderWidth: 1,
		borderColor: COLORS.error,
		borderRadius: 12,
		paddingVertical: 16,
		gap: 8,
	},
	deleteButtonText: {
		fontSize: 16,
		fontWeight: '600',
		color: COLORS.error,
	},
	// Picker styles
	pickerOverlay: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: 'rgba(0,0,0,0.6)',
		justifyContent: 'flex-end',
	},
	pickerContent: {
		backgroundColor: '#1C1C1E',
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		maxHeight: '80%',
	},
	pickerHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 16,
		paddingVertical: 14,
		borderBottomWidth: 1,
		borderBottomColor: '#2C2C2E',
	},
	pickerTitle: { fontSize: 16, fontWeight: '600', color: '#FFF' },
	searchContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#2C2C2E',
		borderRadius: 10,
		paddingHorizontal: 12,
		paddingVertical: 8,
		margin: 16,
		gap: 8,
	},
	searchInput: { flex: 1, fontSize: 14, color: '#FFF' },
	exercisesList: { paddingHorizontal: 16, maxHeight: 400 },
	exercisePickerItem: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
		paddingVertical: 12,
		borderBottomWidth: 1,
		borderBottomColor: '#2C2C2E',
	},
	exercisePickerDot: {
		width: 8,
		height: 8,
		borderRadius: 4,
		backgroundColor: COLORS.primary,
	},
	exercisePickerName: { fontSize: 14, fontWeight: '500', color: '#FFF' },
	exercisePickerGroup: { fontSize: 11, color: '#8E8E93', marginTop: 2 },
})
