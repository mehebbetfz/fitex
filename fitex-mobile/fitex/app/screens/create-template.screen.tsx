import { ExerciseSelectionModal } from '@/app/modals/exercise-selection.modal'
import type { AppColors } from '@/constants/app-theme'
import { useLanguage } from '@/contexts/language-context'
import { useAppTheme } from '@/contexts/theme-context'
import { translateExerciseName, translateGroupName } from '@/constants/exercise-i18n'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import React, { useMemo, useState } from 'react'
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
import { useDatabase } from '../contexts/database-context'

interface ExerciseItem {
	id: string
	name: string
	muscle_group: string
	sets: number
	reps: number
	weight: number
}

export default function AddTemplateScreen() {
	const router = useRouter()
	const { createWorkoutTemplate } = useDatabase()
	const { t, language } = useLanguage()
	const { colors: C } = useAppTheme()
	const s = useMemo(() => makeStyles(C), [C])

	const [name, setName] = useState('')
	const [description, setDescription] = useState('')
	const [duration, setDuration] = useState('60')
	const [selectedMuscleGroups, setSelectedMuscleGroups] = useState<string[]>([])
	const [exercises, setExercises] = useState<ExerciseItem[]>([])
	const [showExercisePicker, setShowExercisePicker] = useState(false)

	const handleAddExercise = (exName: string, muscleGroup: string) => {
		const newExercise: ExerciseItem = {
			id: Date.now().toString() + Math.random(),
			name: exName,
			muscle_group: muscleGroup,
			sets: 3,
			reps: 10,
			weight: 0,
		}
		setExercises(prev => [...prev, newExercise])

		if (muscleGroup && !selectedMuscleGroups.includes(muscleGroup)) {
			setSelectedMuscleGroups(prev => [...prev, muscleGroup])
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

	const handleSave = async () => {
		if (!name.trim()) {
			Alert.alert(t('common', 'error'), t('templates', 'nameRequired'))
			return
		}
		if (exercises.length === 0) {
			Alert.alert(t('common', 'error'), t('templates', 'exerciseRequired'))
			return
		}

		try {
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

			await createWorkoutTemplate(templateData, templateExercises)
			router.back()
		} catch (error) {
			console.error('Error saving template:', error)
			Alert.alert(t('common', 'error'), t('common', 'error'))
		}
	}

	return (
		<SafeAreaView style={s.container}>
			{/* Заголовок */}
			<View style={s.header}>
				<TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
					<Ionicons name='arrow-back' size={22} color={C.text} />
				</TouchableOpacity>
				<Text style={s.headerTitle}>{t('templates', 'newTemplate')}</Text>
				<View style={{ width: 30 }} />
			</View>

			<ScrollView
				contentContainerStyle={s.content}
				showsVerticalScrollIndicator={false}
			>
			{/* Название */}
			<Text style={s.label}>{t('templates', 'nameLabel')} *</Text>
			<TextInput
				style={s.input}
				value={name}
				onChangeText={setName}
				placeholder={t('templates', 'namePlaceholder')}
				placeholderTextColor={C.textSecondary}
			/>

			{/* Описание */}
			<Text style={s.label}>
				{t('templates', 'descLabel')} <Text style={s.optional}>{t('templates', 'optionalSuffix')}</Text>
			</Text>
			<TextInput
				style={[s.input, s.notesInput]}
				value={description}
				onChangeText={setDescription}
				placeholder={t('templates', 'descPlaceholder')}
				placeholderTextColor={C.textSecondary}
				multiline
				numberOfLines={3}
				textAlignVertical='top'
			/>

			{/* Длительность */}
			<Text style={s.label}>
				{t('templates', 'durationLabel')} <Text style={s.optional}>{t('templates', 'optionalSuffix')}</Text>
			</Text>
			<TextInput
				style={[s.input, s.durationInput]}
				value={duration}
				onChangeText={v => setDuration(v.replace(/[^0-9]/g, ''))}
				placeholder='60'
				placeholderTextColor={C.textSecondary}
				keyboardType='number-pad'
				maxLength={3}
			/>

			{/* Упражнения */}
			<View style={s.exercisesHeader}>
				<Text style={s.label}>
					{t('templates', 'exercisesLabel')} {exercises.length > 0 && `(${exercises.length})`}
				</Text>
					<TouchableOpacity
						style={s.addExerciseBtn}
						onPress={() => setShowExercisePicker(true)}
					>
						<Ionicons name='add-circle' size={22} color={C.primary} />
						<Text style={s.addExerciseBtnText}>{t('workout', 'addExercise')}</Text>
					</TouchableOpacity>
				</View>

				{exercises.length === 0 ? (
					<View style={s.emptyExercises}>
						<Ionicons name='barbell-outline' size={40} color={C.border} />
						<Text style={s.emptyExercisesText}>
							{t('templates', 'selectExercise')}
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
									<Text style={s.exerciseName}>{translateExerciseName(ex.name, language ?? 'ru')}</Text>
									<Text style={s.exerciseMuscle}>{translateGroupName(ex.muscle_group, language ?? 'ru')}</Text>
								</View>
								<TouchableOpacity
									onPress={() => handleRemoveExercise(ex.id)}
									style={s.removeBtn}
								>
									<Ionicons
										name='close-circle'
										size={20}
										color={C.error}
									/>
								</TouchableOpacity>
							</View>

							<View style={s.exerciseParams}>
								<View style={s.paramItem}>
									<Text style={s.paramLabel}>{t('workout', 'sets')}</Text>
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
											<Ionicons name='remove' size={16} color={C.text} />
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
											<Ionicons name='add' size={16} color={C.text} />
										</TouchableOpacity>
									</View>
								</View>

								<View style={s.paramItem}>
									<Text style={s.paramLabel}>{t('workout', 'reps')}</Text>
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
											<Ionicons name='remove' size={16} color={C.text} />
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
											<Ionicons name='add' size={16} color={C.text} />
										</TouchableOpacity>
									</View>
								</View>

								<View style={s.paramItem}>
									<Text style={s.paramLabel}>{t('workout', 'weight')} ({t('workout', 'kg')})</Text>
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

				<TouchableOpacity style={s.saveBtn} onPress={handleSave}>
					<Text style={s.saveBtnText}>{t('templates', 'saveTemplate')}</Text>
				</TouchableOpacity>
			</ScrollView>

			{/* Модал выбора упражнений — тот же UI, что при старте тренировки */}
			<ExerciseSelectionModal
				visible={showExercisePicker}
				onClose={() => setShowExercisePicker(false)}
				onSelectExercise={({ name: exName, muscleGroup }) => {
					handleAddExercise(exName, muscleGroup)
				}}
			/>
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
			color: C.primary,
		},
		emptyExercises: {
			alignItems: 'center',
			justifyContent: 'center',
			backgroundColor: C.card,
			borderRadius: 12,
			padding: 24,
			borderWidth: 1,
			borderColor: C.cardLight,
			borderStyle: 'dashed',
			gap: 8,
		},
		emptyExercisesText: {
			fontSize: 13,
			color: C.textSecondary,
			textAlign: 'center',
		},
		exerciseCard: {
			backgroundColor: C.card,
			borderRadius: 12,
			padding: 12,
			marginBottom: 8,
			borderWidth: 1,
			borderColor: C.cardLight,
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
			backgroundColor: C.cardLight,
			alignItems: 'center',
			justifyContent: 'center',
			marginRight: 10,
		},
		exerciseNumberText: {
			fontSize: 12,
			fontWeight: '600',
			color: C.text,
		},
		exerciseInfo: { flex: 1 },
		exerciseName: {
			fontSize: 14,
			fontWeight: '600',
			color: C.text,
			marginBottom: 2,
		},
		exerciseMuscle: {
			fontSize: 11,
			color: C.textSecondary,
		},
		removeBtn: { padding: 4 },
		exerciseParams: {
			flexDirection: 'row',
			gap: 12,
		},
		paramItem: { alignItems: 'center', flex: 1 },
		paramLabel: {
			fontSize: 10,
			color: C.textSecondary,
			marginBottom: 4,
		},
		stepper: {
			flexDirection: 'row',
			alignItems: 'center',
			backgroundColor: C.cardLight,
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
			color: C.text,
			minWidth: 30,
			textAlign: 'center',
		},
		weightInput: {
			backgroundColor: C.cardLight,
			borderRadius: 8,
			paddingHorizontal: 8,
			paddingVertical: 4,
			fontSize: 13,
			fontWeight: '600',
			color: C.text,
			width: 60,
			textAlign: 'center',
			height: 28,
		},
		saveBtn: {
			backgroundColor: C.primary,
			borderRadius: 12,
			paddingVertical: 16,
			alignItems: 'center',
			marginTop: 32,
		},
		saveBtnText: { fontSize: 16, fontWeight: '700', color: C.text },

		// Picker styles
		pickerOverlay: {
			position: 'absolute',
			top: 0,
			left: 0,
			right: 0,
			bottom: 0,
			backgroundColor: C.overlay,
			justifyContent: 'flex-end',
		},
		pickerContent: {
			backgroundColor: C.card,
			borderTopLeftRadius: 20,
			borderTopRightRadius: 20,
			height: '60%',
		},
		pickerHeader: {
			flexDirection: 'row',
			justifyContent: 'space-between',
			alignItems: 'center',
			paddingHorizontal: 16,
			paddingVertical: 14,
			borderBottomWidth: 1,
			borderBottomColor: C.cardLight,
		},
		pickerTitle: { fontSize: 16, fontWeight: '600', color: C.text },
		searchContainer: {
			flexDirection: 'row',
			alignItems: 'center',
			backgroundColor: C.cardLight,
			borderRadius: 10,
			paddingHorizontal: 12,
			paddingVertical: 8,
			margin: 16,
			gap: 8,
		},
		searchInput: { flex: 1, fontSize: 14, color: C.text },
		exercisesList: { paddingHorizontal: 16, height: '100%' },
		exercisePickerItem: {
			flexDirection: 'row',
			alignItems: 'center',
			gap: 12,
			paddingVertical: 12,
			borderBottomWidth: 1,
			borderBottomColor: C.cardLight,
		},
		exercisePickerDot: {
			width: 8,
			height: 8,
			borderRadius: 4,
			backgroundColor: C.primary,
		},
		exercisePickerName: { fontSize: 14, fontWeight: '500', color: C.text },
		exercisePickerGroup: { fontSize: 11, color: C.textSecondary, marginTop: 2 },
	})
}
