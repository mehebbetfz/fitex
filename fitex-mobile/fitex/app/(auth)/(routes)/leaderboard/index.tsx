import { hasActivePremium, useAuth } from '@/app/contexts/auth-context'
import PremiumGate from '@/app/components/premium-gate'
import { useLanguage } from '@/contexts/language-context'
import { TIERS, TierName } from '@/services/rating'
import { api } from '@/services/api'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
	ActivityIndicator,
	Animated,
	FlatList,
	Image,
	Platform,
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
	totalScore: number
	totalWorkouts: number
	totalVolume: number
	streakDays: number
	tierName: TierName
	isPremium: boolean
	isCurrentUser: boolean
}

// ─── Constants ────────────────────────────────────────────────────────────────

const C = {
	bg:      '#121212',
	card:    '#1C1C1E',
	card2:   '#2C2C2E',
	border:  '#3A3A3C',
	text:    '#FFFFFF',
	sub:     '#8E8E93',
	primary: '#34C759',
	gold:    '#FFD700',
	silver:  '#C0C0C0',
	bronze:  '#CD7F32',
} as const

const TIER_MAP: Record<TierName, { color: string; icon: string }> = {
	beginner: { color: '#8E8E93', icon: 'leaf-outline'    },
	bronze:   { color: '#CD7F32', icon: 'medal-outline'   },
	silver:   { color: '#C0C0C0', icon: 'medal-outline'   },
	gold:     { color: '#FFD700', icon: 'ribbon-outline'  },
	platinum: { color: '#5AC8FA', icon: 'diamond-outline' },
	elite:    { color: '#FF9500', icon: 'trophy'          },
}

const RANK_COLORS: Record<number, string> = {
	1: '#FFD700',
	2: '#C0C0C0',
	3: '#CD7F32',
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

const Avatar = ({
	uri,
	name,
	size = 44,
	isCurrentUser,
}: {
	uri?: string | null
	name: string
	size?: number
	isCurrentUser?: boolean
}) => {
	const initials = name.trim().slice(0, 2).toUpperCase() || '?'
	const borderColor = isCurrentUser ? C.primary : 'transparent'

	return (
		<View
			style={[
				aStyles.wrap,
				{ width: size, height: size, borderRadius: size / 2, borderColor, borderWidth: isCurrentUser ? 2 : 0 },
			]}
		>
			{uri ? (
				<Image
					source={{ uri }}
					style={{ width: size, height: size, borderRadius: size / 2 }}
					resizeMode='cover'
				/>
			) : (
				<View style={[aStyles.placeholder, { width: size, height: size, borderRadius: size / 2 }]}>
					<Text style={[aStyles.initials, { fontSize: size * 0.36 }]}>{initials}</Text>
				</View>
			)}
		</View>
	)
}

const aStyles = StyleSheet.create({
	wrap: { overflow: 'hidden' },
	placeholder: { backgroundColor: '#2C2C2E', alignItems: 'center', justifyContent: 'center' },
	initials: { color: '#fff', fontWeight: '700' },
})

// ─── Podium (top 3) ───────────────────────────────────────────────────────────

const PodiumItem = ({
	entry,
	height,
}: {
	entry: LeaderboardEntry | null
	height: number
}) => {
	const tier = entry ? TIER_MAP[entry.tierName] : TIER_MAP.beginner
	const rankColor = entry ? (RANK_COLORS[entry.rank] ?? C.sub) : C.sub
	const name = entry ? `${entry.firstName}` : '—'

	return (
		<View style={[p.item, { height: height + 80 }]}>
			{entry ? (
				<>
					{entry.rank === 1 && (
						<Ionicons name='ribbon' size={20} color={C.gold} style={p.crown} />
					)}
					<Avatar uri={entry.avatarUrl} name={name} size={48} isCurrentUser={entry.isCurrentUser} />
					<Text style={p.podiumName} numberOfLines={1}>{name}</Text>
					<View style={[p.tierBadge, { backgroundColor: `${tier.color}20` }]}>
						<Ionicons name={tier.icon as any} size={10} color={tier.color} />
					</View>
					<View style={[p.podiumPillar, { height, backgroundColor: rankColor + '22', borderTopColor: rankColor }]}>
						<Text style={[p.rankNum, { color: rankColor }]}>#{entry.rank}</Text>
						<Text style={[p.podiumScore, { color: tier.color }]}>
							{entry.totalScore.toLocaleString()}
						</Text>
					</View>
				</>
			) : (
				<View style={[p.podiumPillar, { height, backgroundColor: C.card2 }]}>
					<Text style={[p.rankNum, { color: C.sub }]}>—</Text>
				</View>
			)}
		</View>
	)
}

const p = StyleSheet.create({
	item: { alignItems: 'center', justifyContent: 'flex-end', width: 100 },
	crown: { position: 'absolute', top: 0, zIndex: 2 },
	podiumName: { fontSize: 12, color: C.text, fontWeight: '600', marginTop: 6, marginBottom: 4, maxWidth: 88, textAlign: 'center' },
	tierBadge: { borderRadius: 8, padding: 3, marginBottom: 6 },
	podiumPillar: {
		width: 86, borderRadius: 10,
		alignItems: 'center', justifyContent: 'center', gap: 4,
		borderTopWidth: 2, borderTopColor: 'transparent',
	},
	rankNum: { fontSize: 18, fontWeight: '800' },
	podiumScore: { fontSize: 11, fontWeight: '700' },
})

// ─── Row item ─────────────────────────────────────────────────────────────────

const RowItem = ({
	entry,
	t,
}: {
	entry: LeaderboardEntry
	t: ReturnType<typeof useLanguage>['t']
}) => {
	const tier  = TIER_MAP[entry.tierName]
	const rankC = RANK_COLORS[entry.rank] ?? C.sub
	const fullName = [entry.firstName, entry.lastName].filter(Boolean).join(' ') || '—'

	return (
		<View
			style={[
				r.row,
				entry.isCurrentUser && r.rowHighlight,
				entry.isCurrentUser && r.rowYou,
			]}
		>
			{/* Rank */}
			<View style={r.rankWrap}>
				{entry.rank <= 3 ? (
					<Ionicons
						name={entry.rank === 1 ? 'trophy' : 'medal-outline'}
						size={20}
						color={rankC}
					/>
				) : (
					<Text style={[r.rankNum, { color: entry.rank <= 10 ? C.primary : C.sub }]}>
						#{entry.rank}
					</Text>
				)}
			</View>

			{/* Avatar */}
			<Avatar uri={entry.avatarUrl} name={entry.firstName || '?'} size={40} isCurrentUser={entry.isCurrentUser} />

			{/* Info */}
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
					{entry.isPremium && (
						<View style={r.premBadge}>
							<Ionicons name='diamond' size={9} color='#000' />
						</View>
					)}
				</View>
				<View style={r.statsRow}>
					<Ionicons name={tier.icon as any} size={11} color={tier.color} />
					<Text style={[r.tierLabel, { color: tier.color }]}>
						{entry.tierName.charAt(0).toUpperCase() + entry.tierName.slice(1)}
					</Text>
					<Text style={r.dot}>·</Text>
					<Text style={r.stat}>{entry.totalWorkouts} {t('leaderboard', 'workouts')}</Text>
					{entry.streakDays > 0 && (
						<>
							<Text style={r.dot}>·</Text>
							<Ionicons name='flame-outline' size={10} color='#FF6B35' />
							<Text style={r.stat}>{entry.streakDays}</Text>
						</>
					)}
				</View>
			</View>

			{/* Score */}
			<View style={r.scoreWrap}>
				<Text style={[r.score, { color: tier.color }]}>
					{entry.totalScore >= 1000
						? `${(entry.totalScore / 1000).toFixed(1)}k`
						: String(entry.totalScore)}
				</Text>
				<Text style={r.scoreLabel}>{t('leaderboard', 'score')}</Text>
			</View>
		</View>
	)
}

const r = StyleSheet.create({
	row: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 10,
		paddingVertical: 12,
		paddingHorizontal: 14,
		backgroundColor: C.card,
		borderRadius: 16,
		borderWidth: 1,
		borderColor: C.border,
		overflow: 'hidden',
		...Platform.select({
			ios: {
				shadowColor: '#000',
				shadowOffset: { width: 0, height: 2 },
				shadowOpacity: 0.18,
				shadowRadius: 8,
			},
			android: { elevation: 3 },
		}),
	},
	rowHighlight: {
		backgroundColor: 'rgba(52, 199, 89, 0.07)',
		borderColor: 'rgba(52, 199, 89, 0.35)',
	},
	rowYou: {
		borderLeftWidth: 3,
		borderLeftColor: C.primary,
	},
	rankWrap: { width: 28, alignItems: 'center' },
	rankNum: { fontSize: 13, fontWeight: '800' },
	info: { flex: 1, gap: 3 },
	nameRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
	name: { fontSize: 14, fontWeight: '700', color: C.text },
	nameHighlight: { color: C.primary },
	youBadge: {
		backgroundColor: `${C.primary}25`, borderRadius: 6,
		paddingHorizontal: 5, paddingVertical: 1,
	},
	youText: { fontSize: 9, fontWeight: '800', color: C.primary },
	premBadge: {
		backgroundColor: '#FFD700', borderRadius: 6, padding: 3,
	},
	statsRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
	tierLabel: { fontSize: 11, fontWeight: '600' },
	dot: { color: C.sub, fontSize: 10 },
	stat: { fontSize: 11, color: C.sub },
	scoreWrap: { alignItems: 'flex-end', minWidth: 44 },
	score: { fontSize: 15, fontWeight: '800' },
	scoreLabel: { fontSize: 10, color: C.sub },
})

// ─── My rank card (sticky) ────────────────────────────────────────────────────

const MyRankCard = ({
	entry,
	t,
}: {
	entry: LeaderboardEntry
	t: ReturnType<typeof useLanguage>['t']
}) => {
	const tier = TIER_MAP[entry.tierName]
	const fullName = [entry.firstName, entry.lastName].filter(Boolean).join(' ') || '—'

	return (
		<View style={m.outer}>
			<LinearGradient
				colors={['rgba(52, 199, 89, 0.55)', 'rgba(52, 199, 89, 0.15)', 'rgba(90, 200, 250, 0.12)']}
				start={{ x: 0, y: 0 }}
				end={{ x: 1, y: 1 }}
				style={m.gradRing}
			>
				<View style={m.cardInner}>
					<View style={m.cardHeader}>
						<View style={m.cardHeaderIcon}>
							<Ionicons name='person' size={15} color={C.primary} />
						</View>
						<Text style={m.cardHeaderLabel}>{t('leaderboard', 'myRank')}</Text>
					</View>
					<View style={m.left}>
						<Avatar uri={entry.avatarUrl} name={entry.firstName || '?'} size={52} isCurrentUser />
						<View style={m.info}>
							<Text style={m.name} numberOfLines={1}>
								{fullName}
							</Text>
							<View style={m.tierRow}>
								<Ionicons name={tier.icon as any} size={12} color={tier.color} />
								<Text style={[m.tierLabel, { color: tier.color }]}>
									{entry.tierName.charAt(0).toUpperCase() + entry.tierName.slice(1)}
								</Text>
							</View>
						</View>
					</View>
					<View style={m.stats}>
						<View style={m.stat}>
							<Text style={[m.statVal, { color: tier.color }]}>#{entry.rank}</Text>
							<Text style={m.statKey}>{t('leaderboard', 'rank')}</Text>
						</View>
						<View style={m.divider} />
						<View style={m.stat}>
							<Text style={[m.statVal, { color: tier.color }]}>
								{entry.totalScore >= 1000
									? `${(entry.totalScore / 1000).toFixed(1)}k`
									: String(entry.totalScore)}
							</Text>
							<Text style={m.statKey}>{t('leaderboard', 'score')}</Text>
						</View>
						<View style={m.divider} />
						<View style={m.stat}>
							<Text style={m.statVal}>{entry.totalWorkouts}</Text>
							<Text style={m.statKey}>{t('leaderboard', 'workouts')}</Text>
						</View>
					</View>
				</View>
			</LinearGradient>
		</View>
	)
}

const m = StyleSheet.create({
	outer: { marginBottom: 18 },
	gradRing: { borderRadius: 20, padding: 1.5 },
	cardInner: {
		backgroundColor: '#151518',
		borderRadius: 18,
		padding: 14,
		gap: 12,
	},
	cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
	cardHeaderIcon: {
		width: 30,
		height: 30,
		borderRadius: 10,
		backgroundColor: 'rgba(52, 199, 89, 0.14)',
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: 1,
		borderColor: 'rgba(52, 199, 89, 0.25)',
	},
	cardHeaderLabel: {
		fontSize: 12,
		fontWeight: '800',
		color: C.sub,
		letterSpacing: 0.6,
		textTransform: 'uppercase',
	},
	left: { flexDirection: 'row', alignItems: 'center', gap: 12 },
	info: { flex: 1, gap: 3 },
	name: { fontSize: 16, fontWeight: '700', color: C.text },
	tierRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
	tierLabel: { fontSize: 12, fontWeight: '600' },
	stats: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
	stat: { alignItems: 'center', flex: 1 },
	statVal: { fontSize: 18, fontWeight: '800', color: C.text },
	statKey: { fontSize: 10, color: C.sub, marginTop: 2 },
	divider: { width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.08)' },
})

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function LeaderboardScreen() {
	const { t } = useLanguage()
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
	}, [])

	useEffect(() => { load() }, [load])

	if (!premium) return <PremiumGate featureIcon='podium-outline' featureColor='#FF9500' />

	const onRefresh = () => {
		setRefreshing(true)
		load(true)
	}

	const top3 = [entries[1] ?? null, entries[0] ?? null, entries[2] ?? null]

	return (
		<SafeAreaView style={s.safe} edges={['top', 'left', 'right']}>
			{/* Header */}
			<View style={s.header}>
				<TouchableOpacity onPress={() => router.back()} style={s.backBtn} hitSlop={12}>
					<Ionicons name='chevron-back' size={26} color={C.text} />
				</TouchableOpacity>
				<View style={s.headerCenter}>
					<Text style={s.title}>{t('leaderboard', 'title')}</Text>
					<Text style={s.subtitle}>{t('leaderboard', 'subtitle')}</Text>
				</View>
				<View style={{ width: 40 }} />
			</View>
			<LinearGradient
				colors={['rgba(52, 199, 89, 0.35)', 'rgba(52, 199, 89, 0)', 'transparent']}
				start={{ x: 0, y: 0 }}
				end={{ x: 1, y: 0 }}
				style={s.headerGradient}
			/>

			{loading ? (
				<View style={s.loader}>
					<ActivityIndicator size='large' color={C.primary} />
					<Ionicons name='podium-outline' size={36} color={C.sub} style={{ marginTop: 16 }} />
					<Text style={s.loaderText}>{t('common', 'loading')}</Text>
				</View>
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
								tintColor={C.primary}
							/>
						}
						ListHeaderComponent={
							<>
								{/* My rank card */}
								{myRank && <MyRankCard entry={myRank} t={t} />}

								{/* Podium */}
								{entries.length >= 3 && (
									<View style={s.podiumCard}>
										<View style={s.podiumCardHeader}>
											<LinearGradient
												colors={['rgba(255, 215, 0, 0.2)', 'rgba(255, 215, 0, 0)']}
												start={{ x: 0, y: 0 }}
												end={{ x: 1, y: 1 }}
												style={s.podiumIconWrap}
											>
												<Ionicons name='podium-outline' size={20} color={C.gold} />
											</LinearGradient>
											<Text style={s.podiumCardTitle}>{t('leaderboard', 'podiumTitle')}</Text>
										</View>
										<View style={s.podiumWrap}>
											<PodiumItem entry={top3[0]} height={90} />
											<PodiumItem entry={top3[1]} height={120} />
											<PodiumItem entry={top3[2]} height={70} />
										</View>
									</View>
								)}

								{/* List header */}
								<View style={s.listHeader}>
									<Text style={s.listHeaderText}>
										{t('leaderboard', 'topPlayers')} ({entries.length})
									</Text>
									<TouchableOpacity
										style={s.syncHintBtn}
										onPress={() => router.push('/(auth)/(routes)/rating')}
									>
										<Ionicons name='star-outline' size={13} color={C.primary} />
										<Text style={s.syncHintText}>{t('rating', 'title')}</Text>
									</TouchableOpacity>
								</View>
							</>
						}
						renderItem={({ item }) => <RowItem entry={item} t={t} />}
						ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
						ListEmptyComponent={
							<View style={s.empty}>
								<View style={s.emptyIconCircle}>
									<Ionicons name='people-outline' size={40} color={C.primary} />
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

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
	safe: { flex: 1, backgroundColor: C.bg },

	header: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 12,
		paddingVertical: 10,
	},
	headerGradient: {
		height: 2,
		marginHorizontal: 20,
		marginBottom: 4,
		borderRadius: 1,
		opacity: 0.9,
	},
	backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
	headerCenter: { flex: 1, alignItems: 'center' },
	title: { fontSize: 19, fontWeight: '800', color: C.text, letterSpacing: -0.3 },
	subtitle: { fontSize: 12, color: C.sub, marginTop: 2 },
	loader: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
	loaderText: { color: C.sub, fontSize: 14, marginTop: 4 },

	podiumCard: {
		marginBottom: 20,
		backgroundColor: C.card,
		borderRadius: 20,
		borderWidth: 1,
		borderColor: 'rgba(255,255,255,0.06)',
		paddingTop: 14,
		paddingBottom: 18,
		...Platform.select({
			ios: {
				shadowColor: '#000',
				shadowOffset: { width: 0, height: 4 },
				shadowOpacity: 0.2,
				shadowRadius: 12,
			},
			android: { elevation: 4 },
		}),
	},
	podiumCardHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 10,
		paddingHorizontal: 16,
		marginBottom: 14,
	},
	podiumIconWrap: {
		width: 36,
		height: 36,
		borderRadius: 12,
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: 1,
		borderColor: 'rgba(255, 215, 0, 0.25)',
	},
	podiumCardTitle: {
		fontSize: 16,
		fontWeight: '800',
		color: C.text,
		letterSpacing: -0.2,
	},
	podiumWrap: {
		flexDirection: 'row',
		alignItems: 'flex-end',
		justifyContent: 'center',
		gap: 6,
		paddingHorizontal: 10,
	},

	listContent: { paddingBottom: 40, paddingHorizontal: 16 },
	listHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: 12,
		marginTop: 4,
	},
	listHeaderText: { fontSize: 16, fontWeight: '800', color: C.text },
	syncHintBtn: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
		backgroundColor: 'rgba(52, 199, 89, 0.12)',
		paddingHorizontal: 10,
		paddingVertical: 6,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: 'rgba(52, 199, 89, 0.25)',
	},
	syncHintText: { fontSize: 12, color: C.primary, fontWeight: '700' },

	empty: { alignItems: 'center', gap: 12, paddingTop: 48, paddingHorizontal: 28 },
	emptyIconCircle: {
		width: 88,
		height: 88,
		borderRadius: 44,
		backgroundColor: 'rgba(52, 199, 89, 0.1)',
		borderWidth: 1,
		borderColor: 'rgba(52, 199, 89, 0.2)',
		alignItems: 'center',
		justifyContent: 'center',
	},
	emptyTitle: { fontSize: 17, fontWeight: '700', color: C.text },
	emptySub: { fontSize: 13, color: C.sub, textAlign: 'center', lineHeight: 20 },
})
