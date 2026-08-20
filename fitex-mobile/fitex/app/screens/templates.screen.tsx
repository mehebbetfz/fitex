import { useLanguage } from '@/contexts/language-context'
import { WorkoutTemplate } from '@/scripts/database'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { useFocusEffect, useRouter } from 'expo-router'
import React, { useCallback, useState } from 'react'
import {
	ActivityIndicator,
	FlatList,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useDatabase } from '../contexts/database-context'

const COLORS = {
	primary: '#34C759',
	background: '#0A0A0A',
	card: '#1C1C1E',
	border: 'rgba(255,255,255,0.08)',
	text: '#FFFFFF',
	textSecondary: '#8E8E93',
	blue: '#5AC8FA',
} as const

function accentFor(groups: string | undefined) {
	const g = (groups || '').toLowerCase()
	if (g.includes('chest') || g.includes('грудь') || g.includes('sinə')) return '#FF6B6B'
	if (g.includes('back') || g.includes('спина') || g.includes('bel')) return '#4ECDC4'
	if (g.includes('leg') || g.includes('ног') || g.includes('ayaq')) return '#FFEAA7'
	if (g.includes('shoulder') || g.includes('плеч') || g.includes('çiyin')) return '#DDA0DD'
	if (g.includes('arm') || g.includes('биц') || g.includes('триц') || g.includes('əl'))
		return '#45B7D1'
	return COLORS.primary
}

export default function TemplatesScreen() {
	const router = useRouter()
	const { templates, refreshTemplates, getWorkoutTemplate } = useDatabase()
	const { t } = useLanguage()
	const [booting, setBooting] = useState(true)
	const [startingId, setStartingId] = useState<number | null>(null)

	useFocusEffect(
		useCallback(() => {
			let alive = true
			;(async () => {
				await refreshTemplates()
				if (alive) setBooting(false)
			})()
			return () => {
				alive = false
			}
		}, [refreshTemplates]),
	)

	const startFromTemplate = useCallback(
		async (template: WorkoutTemplate) => {
			if (!template.id || startingId != null) return
			Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
			setStartingId(template.id)
			try {
				const data = await getWorkoutTemplate(template.id)
				if (!data) return
				router.replace({
					pathname: '/workout/create',
					params: {
						templateId: String(data.template.id),
						templateName: data.template.name,
						templateExercises: JSON.stringify(data.exercises),
					},
				})
			} finally {
				setStartingId(null)
			}
		},
		[getWorkoutTemplate, router, startingId],
	)

	const renderItem = ({ item }: { item: WorkoutTemplate }) => {
		const busy = startingId === item.id
		return (
			<TouchableOpacity
				style={styles.card}
				onPress={() => startFromTemplate(item)}
				activeOpacity={0.75}
				disabled={startingId != null}
			>
				<View style={[styles.accent, { backgroundColor: accentFor(item.muscle_groups) }]} />
				<View style={styles.cardBody}>
					<Text style={styles.name} numberOfLines={1}>
						{item.name}
					</Text>
					<View style={styles.meta}>
						<Ionicons name='barbell-outline' size={12} color={COLORS.textSecondary} />
						<Text style={styles.metaText}>
							{item.exercises_count} {t('templates', 'exercisesShort')}
						</Text>
						<View style={styles.dot} />
						<Ionicons name='time-outline' size={12} color={COLORS.textSecondary} />
						<Text style={styles.metaText}>
							{item.estimated_duration || 60} {t('templates', 'minShort')}
						</Text>
					</View>
					{item.description ? (
						<Text style={styles.desc} numberOfLines={1}>
							{item.description}
						</Text>
					) : null}
				</View>
				<TouchableOpacity
					style={styles.editBtn}
					onPress={() =>
						router.push({ pathname: `/(routes)/edit-template/${item.id}` })
					}
					hitSlop={10}
				>
					<Ionicons name='create-outline' size={18} color={COLORS.blue} />
				</TouchableOpacity>
				<View style={styles.playWrap}>
					{busy ? (
						<ActivityIndicator size='small' color={COLORS.primary} />
					) : (
						<Ionicons name='play' size={16} color='#06140A' />
					)}
				</View>
			</TouchableOpacity>
		)
	}

	return (
		<SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
			<View style={styles.header}>
				<TouchableOpacity onPress={() => router.back()} style={styles.iconBtn} hitSlop={8}>
					<Ionicons name='arrow-back' size={22} color={COLORS.text} />
				</TouchableOpacity>
				<View style={styles.headerCenter}>
					<Text style={styles.headerTitle}>{t('templates', 'title')}</Text>
					<Text style={styles.headerSub}>
						{templates.length} · {t('templates', 'tapToStart')}
					</Text>
				</View>
				<TouchableOpacity
					style={styles.addButton}
					onPress={() => router.push('/(routes)/add-template')}
					hitSlop={8}
				>
					<Ionicons name='add' size={24} color={COLORS.primary} />
				</TouchableOpacity>
			</View>

			{booting ? (
				<View style={styles.center}>
					<ActivityIndicator color={COLORS.primary} />
				</View>
			) : (
				<FlatList
					data={templates}
					renderItem={renderItem}
					keyExtractor={item => String(item.id)}
					contentContainerStyle={
						templates.length === 0 ? styles.emptyList : styles.list
					}
					showsVerticalScrollIndicator={false}
					ListEmptyComponent={
						<View style={styles.emptyWrap}>
							<View style={styles.emptyIcon}>
								<Ionicons name='copy-outline' size={36} color={COLORS.primary} />
							</View>
							<Text style={styles.emptyTitle}>{t('templates', 'noTemplates')}</Text>
							<Text style={styles.emptyText}>{t('templates', 'emptyHint')}</Text>
							<TouchableOpacity
								style={styles.emptyButton}
								onPress={() => router.push('/(routes)/add-template')}
								activeOpacity={0.85}
							>
								<Ionicons name='add' size={18} color='#06140A' />
								<Text style={styles.emptyButtonText}>
									{t('templates', 'createTemplate')}
								</Text>
							</TouchableOpacity>
						</View>
					}
				/>
			)}
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: COLORS.background },
	center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 12,
		paddingVertical: 12,
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderBottomColor: COLORS.border,
	},
	iconBtn: { padding: 4, width: 36 },
	headerCenter: { flex: 1, alignItems: 'center' },
	headerTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text, letterSpacing: -0.3 },
	headerSub: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
	addButton: { padding: 4, width: 36, alignItems: 'flex-end' },
	list: { padding: 16, paddingBottom: 40, gap: 10 },
	emptyList: { flexGrow: 1, justifyContent: 'center', padding: 24 },
	card: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: COLORS.card,
		borderRadius: 16,
		overflow: 'hidden',
		borderWidth: 1,
		borderColor: COLORS.border,
		marginBottom: 10,
		paddingRight: 10,
	},
	accent: { width: 4, alignSelf: 'stretch' },
	cardBody: { flex: 1, paddingVertical: 14, paddingHorizontal: 12 },
	name: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
	meta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
	metaText: { fontSize: 12, color: COLORS.textSecondary },
	dot: {
		width: 3,
		height: 3,
		borderRadius: 1.5,
		backgroundColor: COLORS.textSecondary,
		marginHorizontal: 4,
	},
	desc: { fontSize: 12, color: COLORS.textSecondary, marginTop: 4 },
	editBtn: {
		width: 36,
		height: 36,
		borderRadius: 10,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: 'rgba(90,200,250,0.12)',
		marginRight: 8,
	},
	playWrap: {
		width: 36,
		height: 36,
		borderRadius: 18,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: COLORS.primary,
	},
	emptyWrap: { alignItems: 'center', paddingHorizontal: 16 },
	emptyIcon: {
		width: 72,
		height: 72,
		borderRadius: 36,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: 'rgba(52,199,89,0.12)',
		marginBottom: 16,
	},
	emptyTitle: {
		fontSize: 20,
		fontWeight: '800',
		color: COLORS.text,
		marginBottom: 8,
	},
	emptyText: {
		fontSize: 14,
		color: COLORS.textSecondary,
		textAlign: 'center',
		lineHeight: 20,
		marginBottom: 20,
	},
	emptyButton: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
		backgroundColor: COLORS.primary,
		paddingHorizontal: 20,
		paddingVertical: 12,
		borderRadius: 14,
	},
	emptyButtonText: { color: '#06140A', fontWeight: '800', fontSize: 15 },
})
