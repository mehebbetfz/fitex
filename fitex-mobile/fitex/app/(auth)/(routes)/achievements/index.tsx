import { hasActivePremium, useAuth } from '@/app/contexts/auth-context'
import PremiumGate from '@/app/components/premium-gate'
import { AchievementsSkeleton } from '@/components/ui/skeleton'
import type { AppColors } from '@/constants/app-theme'
import { useLanguage } from '@/contexts/language-context'
import { useAppTheme } from '@/contexts/theme-context'
import SheetModalHeader from '@/components/ui/sheet-modal-header'
import { getMilestoneAchievementCopy } from '@/services/achievement-milestones-extra'
import { Achievement, computeRating } from '@/services/rating'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
	Animated,
	FlatList,
	Modal,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

// ─── Single achievement card ──────────────────────────────────────────────────

const AchCard = ({
	item,
	onPress,
}: {
	item: Achievement
	onPress: (a: Achievement) => void
}) => {
	const { t, language } = useLanguage()
	const { colors: C } = useAppTheme()
	const s = useMemo(() => makeStyles(C), [C])
	const scale = useRef(new Animated.Value(1)).current

	const handlePress = () => {
		Animated.sequence([
			Animated.timing(scale, { toValue: 0.93, duration: 70, useNativeDriver: true }),
			Animated.timing(scale, { toValue: 1, duration: 70, useNativeDriver: true }),
		]).start(() => onPress(item))
	}

	const titleKey = `ach_${item.id}_title` as Parameters<typeof t>[1]
	const descKey = `ach_${item.id}_desc` as Parameters<typeof t>[1]
	const milestone = getMilestoneAchievementCopy(item.id, language ?? 'ru')
	const title = milestone?.title ?? t('rating', titleKey)
	const desc = milestone?.desc ?? t('rating', descKey)

	return (
		<TouchableOpacity onPress={handlePress} activeOpacity={0.85}>
			<Animated.View
				style={[
					s.achCard,
					item.earned ? s.achCardEarned : s.achCardLocked,
					{ transform: [{ scale }] },
				]}
			>
				<View
					style={[
						s.iconWrap,
						{
							backgroundColor: item.earned ? `${item.iconColor}20` : C.cardLight,
							borderColor: item.earned ? `${item.iconColor}50` : C.border,
						},
					]}
				>
					<Ionicons
						name={item.icon as any}
						size={26}
						color={item.earned ? item.iconColor : C.textTertiary}
					/>
					{item.earned && (
						<View style={s.checkBadge}>
							<Ionicons name='checkmark' size={8} color='#fff' />
						</View>
					)}
				</View>

				<View style={s.achInfo}>
					<Text style={[s.achTitle, !item.earned && s.achTitleLocked]} numberOfLines={1}>
						{title}
					</Text>
					<Text style={s.achDesc} numberOfLines={2}>
						{desc}
					</Text>

					{!item.earned && (
						<View style={s.progressWrap}>
							<View style={s.progressBg}>
								<View
									style={[
										s.progressFill,
										{
											width: `${item.progressPercent}%` as any,
											backgroundColor: item.iconColor,
										},
									]}
								/>
							</View>
							<Text style={s.progressPct}>{item.progressPercent}%</Text>
						</View>
					)}
					{item.earned && item.earnedAt && (
						<Text style={[s.earnedDate, { color: item.iconColor }]}>
							✓ {new Date(item.earnedAt).toLocaleDateString()}
						</Text>
					)}
				</View>
			</Animated.View>
		</TouchableOpacity>
	)
}

// ─── Detail modal ─────────────────────────────────────────────────────────────

const DetailModal = ({
	item,
	visible,
	onClose,
}: {
	item: Achievement | null
	visible: boolean
	onClose: () => void
}) => {
	const { t, language } = useLanguage()
	const { colors: C } = useAppTheme()
	const s = useMemo(() => makeStyles(C), [C])
	if (!item) return null

	const titleKey = `ach_${item.id}_title` as Parameters<typeof t>[1]
	const descKey = `ach_${item.id}_desc` as Parameters<typeof t>[1]
	const milestone = getMilestoneAchievementCopy(item.id, language ?? 'ru')
	const title = milestone?.title ?? t('rating', titleKey)
	const desc = milestone?.desc ?? t('rating', descKey)

	return (
		<Modal visible={visible} transparent animationType='slide' onRequestClose={onClose}>
			<View style={s.sheetBackdrop}>
				<TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />
				<View style={s.sheet}>
					<SheetModalHeader title={title} onClose={onClose} />
					<View
						style={[
							s.modalIconWrap,
							{
								backgroundColor: item.earned ? `${item.iconColor}20` : C.cardLight,
								borderColor: item.earned ? `${item.iconColor}50` : C.border,
							},
						]}
					>
						<Ionicons
							name={item.icon as any}
							size={52}
							color={item.earned ? item.iconColor : C.textTertiary}
						/>
					</View>

					<Text style={s.modalDesc}>{desc}</Text>

					{item.earned ? (
						<View style={[s.earnedTag, { backgroundColor: `${C.primary}15` }]}>
							<Ionicons name='checkmark-circle' size={16} color={C.primary} />
							<Text style={[s.earnedTagText, { color: C.primary }]}>
								{t('rating', 'earned')}
								{item.earnedAt ? ` • ${new Date(item.earnedAt).toLocaleDateString()}` : ''}
							</Text>
						</View>
					) : (
						<View style={s.modalProgress}>
							<View style={s.modalProgressRow}>
								<Text style={s.modalProgressLabel}>{t('rating', 'progress')}</Text>
								<Text style={[s.modalProgressPct, { color: item.iconColor }]}>
									{item.progressCurrent.toLocaleString()} / {item.progressTarget.toLocaleString()}
								</Text>
							</View>
							<View style={s.modalProgressBg}>
								<View
									style={[
										s.modalProgressFill,
										{
											width: `${item.progressPercent}%` as any,
											backgroundColor: item.iconColor,
										},
									]}
								/>
							</View>
							<Text style={s.modalProgressPctSmall}>{item.progressPercent}%</Text>
						</View>
					)}
				</View>
			</View>
		</Modal>
	)
}

// ─── Stats row ────────────────────────────────────────────────────────────────

const StatsBar = ({
	total,
	earned,
	pct,
}: {
	total: number
	earned: number
	pct: number
}) => {
	const { t } = useLanguage()
	const { colors: C } = useAppTheme()
	const s = useMemo(() => makeStyles(C), [C])
	const anim = useRef(new Animated.Value(0)).current

	useEffect(() => {
		Animated.timing(anim, { toValue: pct / 100, duration: 800, useNativeDriver: false }).start()
	}, [anim, pct])

	const width = anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] })

	return (
		<View style={s.statsBar}>
			<View style={s.statsLeft}>
				<Text style={s.statsEarned}>{earned}</Text>
				<Text style={s.statsSep}>/</Text>
				<Text style={s.statsTotal}>{total}</Text>
				<Text style={s.statsLabel}> {t('rating', 'earned')}</Text>
			</View>
			<View style={s.statsRight}>
				<Text style={[s.statsPct, { color: C.primary }]}>{pct}%</Text>
			</View>
			<View style={s.statsBarOuter}>
				<Animated.View style={[s.statsBarInner, { width }]} />
			</View>
		</View>
	)
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function AchievementsScreen() {
	const { t } = useLanguage()
	const { colors: C } = useAppTheme()
	const s = useMemo(() => makeStyles(C), [C])
	const { user } = useAuth()
	const premium = hasActivePremium(user)
	const [achievements, setAchievements] = useState<Achievement[]>([])
	const [loading, setLoading] = useState(true)
	const [selectedAch, setSelectedAch] = useState<Achievement | null>(null)
	const [showModal, setShowModal] = useState(false)

	const fadeAnim = useRef(new Animated.Value(0)).current

	const load = useCallback(async () => {
		setLoading(true)
		const data = await computeRating()
		setAchievements(data.achievements)
		setLoading(false)
		Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }).start()
	}, [fadeAnim])

	useEffect(() => {
		load()
	}, [load])

	if (!premium) return <PremiumGate featureIcon='ribbon-outline' featureColor='#FFD700' />

	const earnedAll = achievements.filter(a => a.earned).length
	const earnedPct = achievements.length > 0 ? Math.round((earnedAll / achievements.length) * 100) : 0

	const handlePress = (a: Achievement) => {
		setSelectedAch(a)
		setShowModal(true)
	}

	return (
		<SafeAreaView style={s.safe} edges={['top', 'left', 'right']}>
			<View style={s.header}>
				<TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
					<Ionicons name='chevron-back' size={26} color={C.text} />
				</TouchableOpacity>
				<Text style={s.headerTitle}>{t('rating', 'achPageTitle')}</Text>
				<View style={{ width: 40 }} />
			</View>

			{loading ? (
				<AchievementsSkeleton />
			) : (
				<Animated.View style={{ flex: 1, opacity: fadeAnim }}>
					<View style={s.statsWrap}>
						<StatsBar total={achievements.length} earned={earnedAll} pct={earnedPct} />
					</View>

					<FlatList
						data={achievements}
						keyExtractor={item => item.id}
						contentContainerStyle={s.listContent}
						showsVerticalScrollIndicator={false}
						renderItem={({ item }) => <AchCard item={item} onPress={handlePress} />}
						ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
						ListEmptyComponent={
							<View style={s.emptyWrap}>
								<Ionicons name='ribbon-outline' size={36} color={C.textSecondary} />
								<Text style={s.emptyText}>{t('common', 'noData')}</Text>
							</View>
						}
					/>
				</Animated.View>
			)}

			<DetailModal
				item={selectedAch}
				visible={showModal}
				onClose={() => setShowModal(false)}
			/>
		</SafeAreaView>
	)
}

// ─── Styles ───────────────────────────────────────────────────────────────────

function makeStyles(C: AppColors) {
	return StyleSheet.create({
		safe: { flex: 1, backgroundColor: C.background },
		header: {
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'space-between',
			paddingHorizontal: 16,
			paddingVertical: 12,
		},
		backBtn: {
			width: 40,
			height: 40,
			alignItems: 'center',
			justifyContent: 'center',
		},
		headerTitle: { fontSize: 18, fontWeight: '700', color: C.text },

		statsWrap: {
			marginHorizontal: 16,
			backgroundColor: C.card,
			borderRadius: 14,
			padding: 16,
			marginBottom: 12,
		},
		statsBar: { gap: 8 },
		statsLeft: { flexDirection: 'row', alignItems: 'baseline' },
		statsRight: { position: 'absolute', right: 0, top: 0 },
		statsEarned: { fontSize: 28, fontWeight: '800', color: C.primary },
		statsSep: { fontSize: 18, color: C.textSecondary, marginHorizontal: 4 },
		statsTotal: { fontSize: 18, fontWeight: '700', color: C.text },
		statsLabel: { fontSize: 13, color: C.textSecondary },
		statsPct: { fontSize: 16, fontWeight: '700' },
		statsBarOuter: {
			height: 6,
			backgroundColor: C.cardLight,
			borderRadius: 3,
			overflow: 'hidden',
			marginTop: 4,
		},
		statsBarInner: {
			height: 6,
			backgroundColor: C.primary,
			borderRadius: 3,
		},

		listContent: { paddingHorizontal: 16, paddingBottom: 32 },

		achCard: {
			flexDirection: 'row',
			alignItems: 'center',
			gap: 14,
			padding: 14,
			borderRadius: 14,
			borderWidth: 1,
		},
		achCardEarned: {
			backgroundColor: `${C.primary}14`,
			borderColor: `${C.primary}40`,
		},
		achCardLocked: {
			backgroundColor: C.card,
			borderColor: C.border,
		},

		iconWrap: {
			width: 54,
			height: 54,
			borderRadius: 14,
			alignItems: 'center',
			justifyContent: 'center',
			borderWidth: 1.5,
		},
		checkBadge: {
			position: 'absolute',
			top: -3,
			right: -3,
			width: 16,
			height: 16,
			borderRadius: 8,
			backgroundColor: C.primary,
			alignItems: 'center',
			justifyContent: 'center',
			borderWidth: 1.5,
			borderColor: C.background,
		},

		achInfo: { flex: 1, gap: 3 },
		achTitle: { fontSize: 14, fontWeight: '700', color: C.text },
		achTitleLocked: { color: C.textSecondary },
		achDesc: { fontSize: 12, color: C.textSecondary, lineHeight: 16 },

		progressWrap: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
		progressBg: {
			flex: 1,
			height: 4,
			backgroundColor: C.cardLight,
			borderRadius: 2,
			overflow: 'hidden',
		},
		progressFill: { height: 4, borderRadius: 2 },
		progressPct: {
			fontSize: 10,
			color: C.textSecondary,
			fontWeight: '600',
			width: 28,
			textAlign: 'right',
		},

		earnedDate: { fontSize: 11, marginTop: 2 },

		emptyWrap: {
			flex: 1,
			alignItems: 'center',
			justifyContent: 'center',
			gap: 8,
			paddingTop: 60,
		},
		emptyText: { color: C.textSecondary, fontSize: 14 },

		sheetBackdrop: {
			flex: 1,
			backgroundColor: C.overlay,
			justifyContent: 'flex-end',
		},
		sheet: {
			backgroundColor: C.modalSurface,
			borderTopLeftRadius: 20,
			borderTopRightRadius: 20,
			padding: 22,
			paddingBottom: 36,
			alignItems: 'center',
		},
		sheetHandle: {
			alignSelf: 'center',
			width: 36,
			height: 4,
			borderRadius: 2,
			backgroundColor: C.border,
			marginBottom: 14,
		},
		modalIconWrap: {
			width: 88,
			height: 88,
			borderRadius: 22,
			alignItems: 'center',
			justifyContent: 'center',
			borderWidth: 2,
			marginBottom: 16,
		},
		modalTitle: {
			fontSize: 20,
			fontWeight: '800',
			color: C.text,
			textAlign: 'center',
			marginBottom: 8,
		},
		modalDesc: {
			fontSize: 14,
			color: C.textSecondary,
			textAlign: 'center',
			lineHeight: 20,
			marginBottom: 16,
		},

		earnedTag: {
			flexDirection: 'row',
			alignItems: 'center',
			gap: 6,
			paddingHorizontal: 14,
			paddingVertical: 8,
			borderRadius: 12,
		},
		earnedTagText: { fontSize: 13, fontWeight: '700' },

		modalProgress: { width: '100%', gap: 6 },
		modalProgressRow: {
			flexDirection: 'row',
			justifyContent: 'space-between',
			alignItems: 'center',
		},
		modalProgressLabel: { fontSize: 13, color: C.textSecondary },
		modalProgressPct: { fontSize: 13, fontWeight: '700' },
		modalProgressBg: {
			height: 6,
			backgroundColor: C.cardLight,
			borderRadius: 3,
			overflow: 'hidden',
		},
		modalProgressFill: { height: 6, borderRadius: 3 },
		modalProgressPctSmall: { fontSize: 11, color: C.textSecondary, textAlign: 'right' },
	})
}
