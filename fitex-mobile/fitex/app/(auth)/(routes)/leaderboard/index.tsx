import { hasActivePremium, useAuth } from '@/app/contexts/auth-context'
import PremiumGate from '@/app/components/premium-gate'
import { LeaderboardSkeleton } from '@/components/ui/skeleton'
import type { AppColors } from '@/constants/app-theme'
import { presetAvatarSource } from '@/constants/preset-avatars'
import { useLanguage } from '@/contexts/language-context'
import { useAppTheme } from '@/contexts/theme-context'
import { TierName } from '@/services/rating'
import { api } from '@/services/api'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
	Animated,
	FlatList,
	Image,
	Pressable,
	RefreshControl,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

// ─── Types ────────────────────────────────────────────────────────────────────

interface LeaderboardEntry {
	rank: number
	userId: string
	firstName: string
	lastName: string
	avatarUrl?: string | null
	avatarPreset?: string | null
	totalScore: number
	totalWorkouts: number
	totalVolume: number
	streakDays: number
	tierName: TierName
	isPremium: boolean
	isCurrentUser: boolean
}

const TIER_MAP: Record<TierName, { color: string; icon: string }> = {
	beginner: { color: '#8E8E93', icon: 'leaf-outline' },
	bronze: { color: '#CD7F32', icon: 'medal-outline' },
	silver: { color: '#C0C0C0', icon: 'medal-outline' },
	gold: { color: '#FFD700', icon: 'ribbon-outline' },
	platinum: { color: '#5AC8FA', icon: 'diamond-outline' },
	elite: { color: '#FF9500', icon: 'trophy' },
}

const RANK_COLORS: Record<number, string> = {
	1: '#FFD700',
	2: '#C0C0C0',
	3: '#CD7F32',
}

/** Бриллиант в кружке — только иконка, сверху справа на аватаре */
const PremiumDiamondBadge = ({ diameter = 18 }: { diameter?: number }) => {
	const { colors } = useAppTheme()
	return (
		<LinearGradient
			colors={['#FFE566', '#FFD700', '#E6A800']}
			start={{ x: 0, y: 0 }}
			end={{ x: 1, y: 1 }}
			style={{
				position: 'absolute',
				top: -2,
				right: -2,
				width: diameter,
				height: diameter,
				borderRadius: diameter / 2,
				alignItems: 'center',
				justifyContent: 'center',
				borderWidth: 2,
				borderColor: colors.background,
				zIndex: 6,
			}}
		>
			<Ionicons name='diamond' size={Math.max(8, diameter * 0.48)} color='#1a1a1a' />
		</LinearGradient>
	)
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

const Avatar = ({
	uri,
	preset,
	name,
	size = 44,
	isCurrentUser,
	isPremium,
}: {
	uri?: string | null
	preset?: string | null
	name: string
	size?: number
	isCurrentUser?: boolean
	isPremium?: boolean
}) => {
	const { colors } = useAppTheme()
	const initials = name.trim().slice(0, 2).toUpperCase() || '?'
	const ringW = isCurrentUser ? 2.5 : 0
	const badgeD = Math.max(16, Math.round(size * 0.4))
	const presetSrc = presetAvatarSource(preset)

	const inner = presetSrc ? (
		<Image
			source={presetSrc}
			style={{ width: size, height: size, borderRadius: size / 2 }}
			resizeMode='cover'
		/>
	) : uri ? (
		<Image
			source={{ uri }}
			style={{ width: size, height: size, borderRadius: size / 2 }}
			resizeMode='cover'
		/>
	) : (
		<View
			style={{
				width: size,
				height: size,
				borderRadius: size / 2,
				backgroundColor: colors.cardLight,
				alignItems: 'center',
				justifyContent: 'center',
			}}
		>
			<Text style={{ color: colors.text, fontWeight: '700', fontSize: size * 0.36 }}>{initials}</Text>
		</View>
	)

	const core = (
		<View
			style={{
				width: size,
				height: size,
				borderRadius: size / 2,
				overflow: 'hidden',
				backgroundColor: colors.card,
			}}
		>
			{inner}
		</View>
	)

	const body =
		ringW > 0 ? (
			<View
				style={{
					width: size + ringW * 2,
					height: size + ringW * 2,
					borderRadius: (size + ringW * 2) / 2,
					borderWidth: ringW,
					borderColor: colors.primary,
					alignItems: 'center',
					justifyContent: 'center',
					overflow: 'hidden',
					backgroundColor: colors.card,
				}}
			>
				{core}
			</View>
		) : (
			core
		)

	return (
		<View
			style={{
				position: 'relative',
				width: ringW ? size + ringW * 2 : size,
				height: ringW ? size + ringW * 2 : size,
			}}
		>
			{body}
			{isPremium ? <PremiumDiamondBadge diameter={badgeD} /> : null}
		</View>
	)
}

// ─── Podium (top 3) — same layout as LeaderboardSkeleton ─────────────────────

const PodiumItem = ({
	entry,
	scale = 1,
	onOpenProfile,
}: {
	entry: LeaderboardEntry | null
	scale?: number
	onOpenProfile?: (userId: string) => void
}) => {
	const { colors } = useAppTheme()
	const tier = entry ? TIER_MAP[entry.tierName] : TIER_MAP.beginner
	const rankColor = entry ? (RANK_COLORS[entry.rank] ?? colors.textSecondary) : colors.textSecondary
	const name = entry ? `${entry.firstName}` : '—'
	const score = entry
		? entry.totalScore >= 1000
			? `${(entry.totalScore / 1000).toFixed(1)}k`
			: String(entry.totalScore)
		: '—'

	return (
		<Pressable
			disabled={!entry}
			onPress={() => entry && onOpenProfile?.(entry.userId)}
			style={({ pressed }) => [
				pStyles.col,
				{ transform: [{ scale }] },
				pressed && entry && { opacity: 0.85 },
			]}
		>
			<View style={pStyles.avatarWrap}>
				{entry ? (
					<Avatar
						uri={entry.avatarUrl}
						preset={entry.avatarPreset}
						name={name}
						size={56}
						isCurrentUser={entry.isCurrentUser}
						isPremium={entry.isPremium}
					/>
				) : (
					<View style={[pStyles.avatarPlaceholder, { backgroundColor: colors.skeleton }]} />
				)}
				{entry && entry.rank <= 3 ? (
					<View style={[pStyles.rankBadge, { backgroundColor: rankColor }]}>
						<Text style={pStyles.rankBadgeText}>{entry.rank}</Text>
					</View>
				) : null}
			</View>
			<Text style={[pStyles.name, { color: colors.text }]} numberOfLines={1}>
				{name}
			</Text>
			<Text style={[pStyles.score, { color: entry ? tier.color : colors.textSecondary }]}>
				{score}
			</Text>
		</Pressable>
	)
}

const pStyles = StyleSheet.create({
	col: {
		alignItems: 'center',
		width: 96,
	},
	avatarWrap: {
		width: 56,
		height: 56,
		marginBottom: 10,
		alignItems: 'center',
		justifyContent: 'center',
	},
	avatarPlaceholder: {
		width: 56,
		height: 56,
		borderRadius: 28,
	},
	rankBadge: {
		position: 'absolute',
		bottom: -2,
		right: -4,
		width: 20,
		height: 20,
		borderRadius: 10,
		alignItems: 'center',
		justifyContent: 'center',
		zIndex: 8,
	},
	rankBadgeText: {
		fontSize: 11,
		fontWeight: '800',
		color: '#1a1a1a',
	},
	name: {
		fontSize: 12,
		fontWeight: '600',
		marginBottom: 6,
		maxWidth: 88,
		textAlign: 'center',
	},
	score: {
		fontSize: 11,
		fontWeight: '700',
	},
})

// ─── Row item — same card layout as PageListSkeleton ─────────────────────────

const RowItem = ({
	entry,
	t,
	onOpenProfile,
}: {
	entry: LeaderboardEntry
	t: ReturnType<typeof useLanguage>['t']
	onOpenProfile: (userId: string) => void
}) => {
	const { colors } = useAppTheme()
	const r = useMemo(() => makeRowStyles(colors), [colors])
	const tier = TIER_MAP[entry.tierName]
	const rankC = RANK_COLORS[entry.rank] ?? colors.textSecondary
	const fullName = [entry.firstName, entry.lastName].filter(Boolean).join(' ') || '—'

	return (
		<Pressable
			onPress={() => onOpenProfile(entry.userId)}
			style={({ pressed }) => [
				r.row,
				entry.isCurrentUser && r.rowYou,
				pressed && { opacity: 0.88 },
			]}
		>
			<View style={r.rankWrap}>
				{entry.rank <= 3 ? (
					<Text style={[r.rankNum, { color: rankC }]}>#{entry.rank}</Text>
				) : (
					<Text
						style={[
							r.rankNum,
							{ color: entry.rank <= 10 ? colors.primary : colors.textSecondary },
						]}
					>
						#{entry.rank}
					</Text>
				)}
			</View>

			<Avatar
				uri={entry.avatarUrl}
				preset={entry.avatarPreset}
				name={entry.firstName || '?'}
				size={44}
				isCurrentUser={entry.isCurrentUser}
				isPremium={entry.isPremium}
			/>

			<View style={r.info}>
				<View style={r.nameRow}>
					<Text style={[r.name, entry.isCurrentUser && r.nameHighlight]} numberOfLines={1}>
						{fullName}
					</Text>
					{entry.isCurrentUser && (
						<View style={r.youBadge}>
							<Text style={r.youText}>{t('leaderboard', 'you')}</Text>
						</View>
					)}
				</View>
				<View style={r.statsRow}>
					<Ionicons name={tier.icon as any} size={11} color={tier.color} />
					<Text style={[r.tierLabel, { color: tier.color }]}>
						{entry.tierName.charAt(0).toUpperCase() + entry.tierName.slice(1)}
					</Text>
					<Text style={r.dot}>·</Text>
					<Text style={r.stat}>
						{entry.totalWorkouts} {t('leaderboard', 'workouts')}
					</Text>
				</View>
			</View>

			<View style={r.scoreWrap}>
				<Text style={[r.score, { color: tier.color }]}>
					{entry.totalScore >= 1000
						? `${(entry.totalScore / 1000).toFixed(1)}k`
						: String(entry.totalScore)}
				</Text>
			</View>
		</Pressable>
	)
}

function makeRowStyles(C: AppColors) {
	return StyleSheet.create({
		row: {
			flexDirection: 'row',
			alignItems: 'center',
			gap: 12,
			paddingVertical: 14,
			paddingHorizontal: 14,
			backgroundColor: C.card,
			borderRadius: 16,
			borderWidth: StyleSheet.hairlineWidth,
			borderColor: C.border,
			minHeight: 72,
		},
		rowYou: {
			borderColor: C.primary,
			backgroundColor: `${C.primary}10`,
		},
		rankWrap: { width: 28, alignItems: 'center' },
		rankNum: { fontSize: 13, fontWeight: '700' },
		info: { flex: 1, gap: 8 },
		nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
		name: { fontSize: 14, fontWeight: '600', color: C.text, flexShrink: 1 },
		nameHighlight: { color: C.primary },
		youBadge: {
			backgroundColor: `${C.primary}22`,
			borderRadius: 8,
			paddingHorizontal: 6,
			paddingVertical: 2,
		},
		youText: { fontSize: 10, fontWeight: '700', color: C.primary },
		statsRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
		tierLabel: { fontSize: 12, fontWeight: '600' },
		dot: { color: C.textSecondary, fontSize: 11 },
		stat: { fontSize: 12, color: C.textSecondary },
		scoreWrap: { alignItems: 'flex-end', minWidth: 40 },
		score: { fontSize: 15, fontWeight: '700' },
	})
}

// ─── My rank — compact row matching list cards ───────────────────────────────

const MyRankCard = ({
	entry,
	t,
	onOpenProfile,
}: {
	entry: LeaderboardEntry
	t: ReturnType<typeof useLanguage>['t']
	onOpenProfile: (userId: string) => void
}) => {
	const { colors } = useAppTheme()
	const m = useMemo(() => makeMyRankStyles(colors), [colors])
	const tier = TIER_MAP[entry.tierName]
	const fullName = [entry.firstName, entry.lastName].filter(Boolean).join(' ') || '—'

	return (
		<Pressable
			onPress={() => onOpenProfile(entry.userId)}
			style={({ pressed }) => [m.card, pressed && { opacity: 0.92 }]}
		>
			<Text style={m.label}>{t('leaderboard', 'myRank')}</Text>
			<View style={m.row}>
				<Text style={[m.rank, { color: tier.color }]}>#{entry.rank}</Text>
				<Avatar
					uri={entry.avatarUrl}
					preset={entry.avatarPreset}
					name={entry.firstName || '?'}
					size={44}
					isCurrentUser
					isPremium={entry.isPremium}
				/>
				<View style={m.info}>
					<Text style={m.name} numberOfLines={1}>
						{fullName}
					</Text>
					<Text style={[m.sub, { color: tier.color }]}>
						{entry.tierName.charAt(0).toUpperCase() + entry.tierName.slice(1)}
						{' · '}
						{entry.totalWorkouts} {t('leaderboard', 'workouts')}
					</Text>
				</View>
				<Text style={[m.score, { color: tier.color }]}>
					{entry.totalScore >= 1000
						? `${(entry.totalScore / 1000).toFixed(1)}k`
						: String(entry.totalScore)}
				</Text>
			</View>
		</Pressable>
	)
}

function makeMyRankStyles(C: AppColors) {
	return StyleSheet.create({
		card: {
			marginBottom: 12,
			backgroundColor: C.card,
			borderRadius: 16,
			padding: 14,
			borderWidth: StyleSheet.hairlineWidth,
			borderColor: C.primary,
			gap: 10,
		},
		label: {
			fontSize: 12,
			fontWeight: '600',
			color: C.textSecondary,
			textTransform: 'uppercase',
			letterSpacing: 0.4,
		},
		row: {
			flexDirection: 'row',
			alignItems: 'center',
			gap: 12,
		},
		rank: { width: 36, fontSize: 14, fontWeight: '800' },
		info: { flex: 1, gap: 4 },
		name: { fontSize: 14, fontWeight: '600', color: C.text },
		sub: { fontSize: 12, fontWeight: '600' },
		score: { fontSize: 15, fontWeight: '700', minWidth: 40, textAlign: 'right' },
	})
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function LeaderboardScreen() {
	const { t } = useLanguage()
	const { colors } = useAppTheme()
	const s = useMemo(() => makeScreenStyles(colors), [colors])
	const { user } = useAuth()
	const premium = hasActivePremium(user)
	const [entries, setEntries] = useState<LeaderboardEntry[]>([])
	const [myRank, setMyRank] = useState<LeaderboardEntry | null>(null)
	const [loading, setLoading] = useState(true)
	const [refreshing, setRefreshing] = useState(false)

	const fadeAnim = useRef(new Animated.Value(0)).current

	const load = useCallback(async (silent = false) => {
		if (!silent) setLoading(true)
		try {
			const { data } = await api.get('/leaderboard')
			setEntries(data.entries ?? [])
			setMyRank(data.myRank ?? null)
			Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }).start()
		} catch {
			// network error — keep old data
		} finally {
			setLoading(false)
			setRefreshing(false)
		}
	}, [fadeAnim])

	useEffect(() => {
		load()
	}, [load])

	if (!premium) return <PremiumGate featureIcon='podium-outline' featureColor='#FF9500' />

	const onRefresh = () => {
		setRefreshing(true)
		load(true)
	}

	const top3 = [entries[1] ?? null, entries[0] ?? null, entries[2] ?? null]

	const openAthlete = useCallback((userId: string) => {
		if (!userId) return
		router.push(`/(auth)/(routes)/leaderboard/profile/${encodeURIComponent(userId)}` as const)
	}, [])

	return (
		<SafeAreaView style={s.safe} edges={['top', 'left', 'right']}>
			<View style={s.header}>
				<TouchableOpacity onPress={() => router.back()} style={s.backBtn} hitSlop={12}>
					<Ionicons name='chevron-back' size={26} color={colors.text} />
				</TouchableOpacity>
				<Text style={s.title}>{t('leaderboard', 'title')}</Text>
				<TouchableOpacity
					style={s.headerAction}
					onPress={() => router.push('/(auth)/(routes)/rating')}
					hitSlop={8}
				>
					<Ionicons name='trophy-outline' size={22} color={colors.primary} />
				</TouchableOpacity>
			</View>

			{loading ? (
				<LeaderboardSkeleton color={colors.skeleton} />
			) : (
				<Animated.View style={{ flex: 1, opacity: fadeAnim }}>
					<FlatList
						data={entries}
						keyExtractor={item => item.userId}
						showsVerticalScrollIndicator={false}
						contentContainerStyle={s.listContent}
						refreshControl={
							<RefreshControl
								refreshing={refreshing}
								onRefresh={onRefresh}
								tintColor={colors.primary}
							/>
						}
						ListHeaderComponent={
							<>
								{myRank && <MyRankCard entry={myRank} t={t} onOpenProfile={openAthlete} />}

								{entries.length >= 1 && (
									<View style={s.podiumWrap}>
										<PodiumItem
											entry={top3[0]}
											scale={0.72}
											onOpenProfile={openAthlete}
										/>
										<PodiumItem
											entry={top3[1]}
											scale={1}
											onOpenProfile={openAthlete}
										/>
										<PodiumItem
											entry={top3[2]}
											scale={0.72}
											onOpenProfile={openAthlete}
										/>
									</View>
								)}

								<Text style={s.sectionTitle}>
									{t('leaderboard', 'topPlayers')} ({entries.length})
								</Text>
							</>
						}
						renderItem={({ item }) => <RowItem entry={item} t={t} onOpenProfile={openAthlete} />}
						ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
						ListEmptyComponent={
							<View style={s.empty}>
								<View style={s.emptyIconCircle}>
									<Ionicons name='people-outline' size={36} color={colors.primary} />
								</View>
								<Text style={s.emptyTitle}>{t('leaderboard', 'noData')}</Text>
								<Text style={s.emptySub}>{t('leaderboard', 'noDataSub')}</Text>
							</View>
						}
					/>
				</Animated.View>
			)}
		</SafeAreaView>
	)
}

function makeScreenStyles(C: AppColors) {
	return StyleSheet.create({
		safe: { flex: 1, backgroundColor: C.background },

		header: {
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'space-between',
			paddingHorizontal: 10,
			paddingTop: 12,
			paddingBottom: 8,
		},
		backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
		headerAction: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
		title: { fontSize: 22, fontWeight: '700', color: C.text },

		sectionTitle: {
			fontSize: 18,
			fontWeight: '600',
			color: C.text,
			marginBottom: 12,
			marginLeft: 4,
			marginTop: 4,
		},

		podiumWrap: {
			flexDirection: 'row',
			alignItems: 'flex-end',
			justifyContent: 'center',
			gap: 16,
			paddingVertical: 24,
			marginBottom: 8,
		},

		listContent: { paddingBottom: 40, paddingHorizontal: 10 },

		empty: { alignItems: 'center', gap: 10, paddingTop: 48, paddingHorizontal: 28 },
		emptyIconCircle: {
			width: 72,
			height: 72,
			borderRadius: 36,
			backgroundColor: `${C.primary}18`,
			alignItems: 'center',
			justifyContent: 'center',
			marginBottom: 4,
		},
		emptyTitle: { fontSize: 17, fontWeight: '600', color: C.text },
		emptySub: { fontSize: 14, color: C.textSecondary, textAlign: 'center', lineHeight: 20 },
	})
}
