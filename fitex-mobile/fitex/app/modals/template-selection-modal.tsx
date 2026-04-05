// ─────────────────────────────────────────────
// app/modals/template-selection-modal.tsx
// Модал выбора шаблона при старте тренировки
// ─────────────────────────────────────────────
import { useDatabase } from '@/app/contexts/database-context'
import { useLanguage } from '@/contexts/language-context'
import { WorkoutTemplate } from '@/scripts/database'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { router } from 'expo-router'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
	Animated,
	Dimensions,
	FlatList,
	Modal,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native'

const { height: SCREEN_HEIGHT } = Dimensions.get('window')

const COLORS = {
	primary: '#34C759',
	background: '#121212',
	card: '#1C1C1E',
	cardLight: '#2C2C2E',
	border: '#3A3A3C',
	text: '#FFFFFF',
	textSecondary: '#8E8E93',
	error: '#FF3B30',
	warning: '#FF9500',
} as const

interface TemplateSelectionModalProps {
	visible: boolean
	onClose: () => void
	onSelectTemplate: (template: WorkoutTemplate, exercises: any[]) => void
	onStartEmpty: () => void
}

// ── Shimmer animation hook (как в основном компоненте) ──
const useShimmer = () => {
	const anim = useRef(new Animated.Value(0)).current
	useEffect(() => {
		const loop = Animated.loop(
			Animated.sequence([
				Animated.timing(anim, {
					toValue: 1,
					duration: 750,
					useNativeDriver: true,
				}),
				Animated.timing(anim, {
					toValue: 0,
					duration: 750,
					useNativeDriver: true,
				}),
			]),
		)
		loop.start()
		return () => loop.stop()
	}, [])
	return anim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.7] })
}

const ShimmerBlock = ({ style }: { style: any }) => {
	const opacity = useShimmer()
	return <Animated.View style={[style, { opacity }]} />
}

// ── Скелетон одной карточки шаблона с shimmer ──
const TemplateCardSkeleton = () => (
	<View style={styles.templateCard}>
		<ShimmerBlock
			style={[styles.templateAccent, { backgroundColor: COLORS.cardLight }]}
		/>
		<View style={styles.templateContent}>
			<ShimmerBlock style={styles.skeletonName} />
			<ShimmerBlock style={styles.skeletonDesc} />
			<View style={styles.templateMeta}>
				<ShimmerBlock style={styles.skeletonMeta} />
				<ShimmerBlock style={styles.skeletonMeta} />
				<ShimmerBlock style={[styles.skeletonMeta, { width: 80 }]} />
			</View>
		</View>
		<ShimmerBlock
			style={{
				width: 20,
				height: 20,
				borderRadius: 10,
				backgroundColor: COLORS.cardLight,
				marginRight: 14,
			}}
		/>
	</View>
)

// ── FadeIn компонент для плавного появления ──
const FadeIn = ({
	show,
	children,
}: {
	show: boolean
	children: React.ReactNode
}) => {
	const anim = useRef(new Animated.Value(0)).current
	useEffect(() => {
		if (show) {
			Animated.timing(anim, {
				toValue: 1,
				duration: 300,
				useNativeDriver: true,
			}).start()
		}
	}, [show])
	return <Animated.View style={{ opacity: anim }}>{children}</Animated.View>
}

export default function TemplateSelectionModal({
	visible,
	onClose,
	onSelectTemplate,
	onStartEmpty,
}: TemplateSelectionModalProps) {
	const { templates, refreshTemplates, getWorkoutTemplate } = useDatabase()
	const { t } = useLanguage()
	const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current
	const [modalVisible, setModalVisible] = useState(false)
	const [loading, setLoading] = useState(false)
	const [templatesLoading, setTemplatesLoading] = useState(false)

	useEffect(() => {
		if (visible) {
			setModalVisible(true)
			setTemplatesLoading(true)
			refreshTemplates().finally(() => setTemplatesLoading(false))
			Animated.spring(slideAnim, {
				toValue: 0,
				useNativeDriver: true,
				tension: 65,
				friction: 11,
			}).start()
		} else {
			Animated.timing(slideAnim, {
				toValue: SCREEN_HEIGHT,
				duration: 250,
				useNativeDriver: true,
			}).start(() => setModalVisible(false))
		}
	}, [visible])

	const handleSelectTemplate = useCallback(
		async (template: WorkoutTemplate) => {
			Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
			if (!template.id) return
			setLoading(true)
			try {
				const data = await getWorkoutTemplate(template.id)
				if (data) {
					onSelectTemplate(data.template, data.exercises)
				}
			} finally {
				setLoading(false)
			}
		},
		[getWorkoutTemplate, onSelectTemplate],
	)

	const getMuscleGroupColor = (groups: string) => {
		if (groups.includes('Ноги')) return '#FFEAA7'
		if (groups.includes('Грудь')) return '#FF6B6B'
		if (groups.includes('Спина')) return '#96CEB4'
		if (groups.includes('Руки')) return '#45B7D1'
		if (groups.includes('Дельты')) return '#DDA0DD'
		return COLORS.primary
	}

	const handleRedirectToTemplates = () => {
		onClose()
		router.push({ pathname: '/templates' })
	}

	const recentTemplates = templates.slice(0, 3)
	const hasMoreTemplates = templates.length > 3

	if (!modalVisible) return null

	return (
		<Modal
			transparent
			visible={modalVisible}
			animationType='none'
			onRequestClose={onClose}
		>
			<View style={styles.overlay}>
				<TouchableOpacity
					style={styles.backdrop}
					activeOpacity={1}
					onPress={onClose}
				/>
				<Animated.View
					style={[styles.container, { transform: [{ translateY: slideAnim }] }]}
				>
					{/* Header */}
					<View style={styles.header}>
						<TouchableOpacity
							style={styles.closeBtn}
							onPress={onClose}
							activeOpacity={0.7}
						>
							<Ionicons name='close' size={24} color={COLORS.text} />
						</TouchableOpacity>
						<Text style={styles.headerTitle}>{t('templates', 'startWorkout')}</Text>
						<View style={{ width: 40 }} />
					</View>

					{/* Empty workout button */}
					<TouchableOpacity
						style={styles.emptyWorkoutBtn}
						onPress={() => {
							Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
							onStartEmpty()
						}}
						activeOpacity={0.7}
					>
						<View style={styles.emptyWorkoutIcon}>
							<Ionicons name='add' size={28} color={COLORS.primary} />
						</View>
						<View style={styles.emptyWorkoutText}>
						<Text style={styles.emptyWorkoutTitle}>{t('workout', 'noExercises')}</Text>
						<Text style={styles.emptyWorkoutSub}>
								{t('workout', 'noExercisesSubtitle')}
							</Text>
						</View>
						<Ionicons
							name='chevron-forward'
							size={20}
							color={COLORS.textSecondary}
						/>
					</TouchableOpacity>

					{/* Templates section */}
					<View style={styles.sectionHeader}>
					<Text style={styles.sectionTitle}>{t('templates', 'recentTemplates')}</Text>
					{!templatesLoading && (
						<TouchableOpacity onPress={handleRedirectToTemplates}>
							<Text style={styles.seeAll}>
								{t('templates', 'allTemplates')} ({templates.length})
							</Text>
						</TouchableOpacity>
					)}
					</View>

					{/* ── Скелетон / пусто / список с FadeIn ── */}
					{templatesLoading ? (
						<View style={styles.skeletonList}>
							<TemplateCardSkeleton />
							<TemplateCardSkeleton />
							<TemplateCardSkeleton />
						</View>
					) : templates.length === 0 ? (
						<FadeIn show={!templatesLoading}>
							<View style={styles.emptyState}>
								<Ionicons
									name='copy-outline'
									size={48}
									color={COLORS.textSecondary}
								/>
								<Text style={styles.emptyStateTitle}>{t('templates', 'noTemplates')}</Text>
								<Text style={styles.emptyStateSub}>
									Создай шаблон после тренировки, чтобы быстро повторять её в
									будущем
								</Text>
								<TouchableOpacity
									style={styles.createFirstButton}
									onPress={handleRedirectToTemplates}
								>
									<Text style={styles.createFirstButtonText}>
										{t('templates', 'createTemplate')}
									</Text>
								</TouchableOpacity>
							</View>
						</FadeIn>
					) : (
						<FadeIn show={!templatesLoading}>
							<FlatList
								data={recentTemplates}
								keyExtractor={item => String(item.id)}
								contentContainerStyle={{
									paddingHorizontal: 16,
									paddingBottom: hasMoreTemplates ? 16 : 32,
								}}
								showsVerticalScrollIndicator={false}
								renderItem={({ item }) => (
									<TouchableOpacity
										style={styles.templateCard}
										onPress={() => handleSelectTemplate(item)}
										activeOpacity={0.7}
										disabled={loading}
									>
										<View
											style={[
												styles.templateAccent,
												{
													backgroundColor: getMuscleGroupColor(
														item.muscle_groups,
													),
												},
											]}
										/>
										<View style={styles.templateContent}>
											<Text style={styles.templateName} numberOfLines={1}>
												{item.name}
											</Text>
											{item.description ? (
												<Text style={styles.templateDesc} numberOfLines={1}>
													{item.description}
												</Text>
											) : (
												<Text style={styles.templateDesc} numberOfLines={1}>
													{t('templates', 'noDescription')}
												</Text>
											)}
											<View style={styles.templateMeta}>
												<View style={styles.metaItem}>
													<Ionicons
														name='barbell-outline'
														size={13}
														color={COLORS.textSecondary}
													/>
													<Text style={styles.metaText}>
														{item.exercises_count} {t('templates', 'exercisesShort')}
													</Text>
												</View>
												<View style={styles.metaItem}>
													<Ionicons
														name='time-outline'
														size={13}
														color={COLORS.textSecondary}
													/>
													<Text style={styles.metaText}>
														{item.estimated_duration} {t('templates', 'minShort')}
													</Text>
												</View>
												{item.muscle_groups ? (
													<View style={styles.metaItem}>
														<Ionicons
															name='body-outline'
															size={13}
															color={COLORS.textSecondary}
														/>
														<Text style={styles.metaText} numberOfLines={1}>
															{item.muscle_groups
																.split(',')
																.slice(0, 2)
																.join(', ')}
														</Text>
													</View>
												) : null}
											</View>
										</View>
										<Ionicons
											name='chevron-forward'
											size={20}
											style={{ marginRight: 5 }}
											color={COLORS.textSecondary}
										/>
									</TouchableOpacity>
								)}
							/>
						</FadeIn>
					)}

					{/* Кнопка "Все шаблоны" внизу списка */}
					{!templatesLoading && hasMoreTemplates && (
						<FadeIn show={!templatesLoading}>
							<TouchableOpacity
								style={styles.viewAllButton}
								onPress={handleRedirectToTemplates}
							>
								<Text style={styles.viewAllButtonText}>
									{t('templates', 'showAll')} ({templates.length})
								</Text>
								<Ionicons
									name='arrow-forward'
									size={18}
									color={COLORS.primary}
								/>
							</TouchableOpacity>
						</FadeIn>
					)}
				</Animated.View>
			</View>
		</Modal>
	)
}

const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		backgroundColor: 'rgba(0,0,0,0.6)',
		justifyContent: 'flex-end',
	},
	backdrop: { ...StyleSheet.absoluteFillObject },
	container: {
		backgroundColor: '#121212',
		borderTopLeftRadius: 24,
		borderTopRightRadius: 24,
		maxHeight: SCREEN_HEIGHT * 0.88,
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 16,
		paddingVertical: 14,
		borderBottomWidth: 1,
		borderBottomColor: '#2C2C2E',
	},
	closeBtn: { padding: 6 },
	headerTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
	emptyWorkoutBtn: {
		flexDirection: 'row',
		alignItems: 'center',
		margin: 16,
		padding: 16,
		backgroundColor: '#1C1C1E',
		borderRadius: 16,
		borderWidth: 1,
		borderColor: 'rgba(52,199,89,0.3)',
	},
	emptyWorkoutIcon: {
		width: 44,
		height: 44,
		borderRadius: 22,
		backgroundColor: 'rgba(52,199,89,0.1)',
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: 12,
	},
	emptyWorkoutText: { flex: 1 },
	emptyWorkoutTitle: {
		fontSize: 16,
		fontWeight: '600',
		color: '#fff',
		marginBottom: 2,
	},
	emptyWorkoutSub: { fontSize: 13, color: '#8E8E93' },
	sectionHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 16,
		marginBottom: 10,
	},
	sectionTitle: { fontSize: 16, fontWeight: '700', color: '#fff', flex: 1 },
	seeAll: {
		fontSize: 14,
		color: '#34C759',
		fontWeight: '600',
	},
	// ── Скелетон с shimmer ──
	skeletonList: {
		paddingHorizontal: 16,
		paddingBottom: 16,
	},
	skeletonName: {
		height: 16,
		width: '55%',
		backgroundColor: COLORS.cardLight,
		borderRadius: 6,
		marginBottom: 8,
	},
	skeletonDesc: {
		height: 13,
		width: '75%',
		backgroundColor: COLORS.cardLight,
		borderRadius: 4,
		marginBottom: 10,
	},
	skeletonMeta: {
		height: 12,
		width: 50,
		backgroundColor: COLORS.cardLight,
		borderRadius: 4,
	},
	// ── Empty state ──
	emptyState: {
		alignItems: 'center',
		paddingVertical: 40,
		paddingHorizontal: 32,
	},
	emptyStateTitle: {
		fontSize: 17,
		fontWeight: '600',
		color: '#fff',
		marginTop: 14,
		marginBottom: 8,
	},
	emptyStateSub: {
		fontSize: 14,
		color: '#8E8E93',
		textAlign: 'center',
		lineHeight: 20,
		marginBottom: 20,
	},
	createFirstButton: {
		backgroundColor: COLORS.primary,
		paddingHorizontal: 20,
		paddingVertical: 12,
		borderRadius: 10,
	},
	createFirstButtonText: {
		fontSize: 14,
		fontWeight: '600',
		color: '#000',
	},
	// ── Template card ──
	templateCard: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#1C1C1E',
		borderRadius: 14,
		marginBottom: 10,
		borderWidth: 1,
		borderColor: '#3A3A3C',
		overflow: 'hidden',
	},
	templateAccent: { width: 4, alignSelf: 'stretch' },
	templateContent: { flex: 1, padding: 14 },
	templateName: {
		fontSize: 16,
		fontWeight: '600',
		color: '#fff',
		marginBottom: 3,
	},
	templateDesc: { fontSize: 13, color: '#8E8E93', marginBottom: 8 },
	templateMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
	metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
	metaText: { fontSize: 12, color: '#8E8E93' },
	viewAllButton: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 8,
		backgroundColor: '#1C1C1E',
		marginHorizontal: 16,
		marginTop: 8,
		marginBottom: 16,
		paddingVertical: 14,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: COLORS.primary,
	},
	viewAllButtonText: {
		fontSize: 15,
		fontWeight: '600',
		color: COLORS.primary,
	},
})
