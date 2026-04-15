import { useLanguage } from '@/contexts/language-context'
import { api } from '@/services/api'
import {
	Achievement,
	buildRatingSnapshotFromStats,
	LEVELS,
	RatingData,
	TIERS,
	TierName,
} from '@/services/rating'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { router, useLocalSearchParams } from 'expo-router'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
	ActivityIndicator,
	Alert,
	Animated,
	Dimensions,
	Image,
	Linking,
	Platform,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as db from '@/scripts/database'

const { width: SCREEN_W } = Dimensions.get('window')
const PAD = 16
const CAT_GAP = 10
const CAT_W = (SCREEN_W - PAD * 2 - CAT_GAP) / 2

const C = {
	bg: '#121212',
	card: '#1C1C1E',
	cardLight: '#2C2C2E',
	border: '#2C2C2E',
	text: '#FFFFFF',
	sub: '#8E8E93',
	primary: '#34C759',
} as const

const TIER_ICONS: Record<TierName, { name: string; color: string }> = {
	beginner: { name: 'trophy', color: '#8E8E93' },
	bronze: { name: 'trophy', color: '#CD7F32' },
	silver: { name: 'trophy', color: '#C0C0C0' },
	gold: { name: 'trophy', color: '#FFD700' },
	platinum: { name: 'trophy', color: '#5AC8FA' },
	elite: { name: 'trophy', color: '#FF9500' },
}

function tierIconEntry(name: string): (typeof TIER_ICONS)[TierName] {
	if (name in TIER_ICONS) return TIER_ICONS[name as TierName]
	return TIER_ICONS.beginner
}

/** Только http(s) — иначе нативный <Image> может падать в релизе. */
function safeRemoteAvatarUri(raw: string | null | undefined): string | null {
	if (!raw || typeof raw !== 'string') return null
	const u = raw.trim()
	if (u.length < 8) return null
	return /^https?:\/\//i.test(u) ? u : null
}

const CAT_ICONS: Record<string, { icon: string; color: string }> = {
	volume: { icon: 'barbell-outline', color: '#FF9F0A' },
	workouts: { icon: 'fitness-outline', color: '#34C759' },
	streak: { icon: 'flame-outline', color: '#FF6B35' },
	sets: { icon: 'layers-outline', color: '#5AC8FA' },
	avgDuration: { icon: 'timer-outline', color: '#AF52DE' },
	records: { icon: 'trophy-outline', color: '#FFD700' },
}

const ACH_BADGE = 44

interface AthleteProfile {
	userId: string
	firstName: string
	lastName: string
	avatarUrl?: string | null
	isPremium: boolean
	isViewer: boolean
	monthly: {
		score: number
		workouts: number
		volume: number
		streakDays: number
		tierName: TierName
		rank: number
	}
	lifetime: {
		score: number
		workouts: number
		volume: number
		sets: number
		streakDays: number
		prCount: number
		avgDuration?: number
		tierName: TierName
	}
	social: {
		instagram: string | null
		telegram: string | null
		youtube: string | null
		tiktok: string | null
		strava: string | null
		website: string | null
	}
	podium: { first: number; second: number; third: number }
	topRecords: { exercise: string; weight: string; date: string }[]
}

function toOpenUrl(kind: keyof AthleteProfile['social'], raw: string): string | null {
	const v = raw.trim()
	if (!v) return null
	if (/^https?:\/\//i.test(v)) return v
	switch (kind) {
		case 'instagram': {
			const h = v.replace(/^@/, '').replace(/^(www\.)?instagram\.com\/?/i, '')
			return `https://instagram.com/${h}`
		}
		case 'telegram': {
			if (v.includes('t.me')) return v.startsWith('http') ? v : `https://${v.replace(/^\/\//, '')}`
			const h = v.replace(/^@/, '')
			return `https://t.me/${h}`
		}
		case 'youtube':
			return v.includes('youtube') || v.includes('youtu.be')
				? (v.startsWith('http') ? v : `https://${v}`)
				: `https://youtube.com/@${v.replace(/^@/, '')}`
		case 'tiktok': {
			const h = v.replace(/^@/, '').replace(/^tiktok\.com\/?@?/i, '')
			return `https://www.tiktok.com/@${h}`
		}
		case 'strava':
			return v.includes('strava.com')
				? (v.startsWith('http') ? v : `https://${v}`)
				: `https://www.strava.com/athletes/${v}`
		case 'website':
			return `https://${v.replace(/^https?:\/\//i, '')}`
		default:
			return null
	}
}

const ProgressBar = ({ percent, color, height = 8 }: { percent: number; color: string; height?: number }) => {
	const anim = useRef(new Animated.Value(0)).current
	const safePct = Number.isFinite(percent) ? Math.min(100, Math.max(0, percent)) : 0
	useEffect(() => {
		Animated.timing(anim, {
			toValue: safePct / 100,
			duration: 700,
			useNativeDriver: false,
		}).start()
	}, [safePct, anim])
	const width = anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] })
	return (
		<View style={{ height, backgroundColor: C.cardLight, borderRadius: height / 2, overflow: 'hidden' }}>
			<Animated.View style={{ height, width, backgroundColor: color, borderRadius: height / 2 }} />
		</View>
	)
}

const TierLevelDots = ({ tierName, currentLevel }: { tierName: TierName; currentLevel: number }) => {
	const tier = TIERS.find(t => t.name === tierName) ?? TIERS[0]
	const tierLevels = LEVELS.filter(l => l.tierName === tier.name)
	return (
		<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 10 }}>
			{tierLevels.map(lv => {
				const done = lv.level < currentLevel
				const active = lv.level === currentLevel
				return (
					<View
						key={lv.level}
						style={{
							width: active ? 22 : 7,
							height: 7,
							borderRadius: 4,
							backgroundColor: done || active ? tier.color : '#2C2C2E',
							opacity: active ? 1 : done ? 0.65 : 0.35,
						}}
					/>
				)
			})}
		</View>
	)
}

function normalizeUserIdParam(raw: string | string[] | undefined): string {
	let s = ''
	if (raw == null) return ''
	if (Array.isArray(raw)) s = raw[0] ?? ''
	else s = typeof raw === 'string' ? raw : ''
	try {
		return decodeURIComponent(s)
	} catch {
		return s
	}
}

export default function AthleteProfileScreen() {
	const params = useLocalSearchParams<{ userId: string | string[] }>()
	const userId = normalizeUserIdParam(params.userId)
	const { t } = useLanguage()
	const [data, setData] = useState<AthleteProfile | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(false)

	const tierLabel = useCallback(
		(name: TierName) => {
			const map: Record<TierName, string> = {
				beginner: t('rating', 'tierBeginner'),
				bronze: t('rating', 'tierBronze'),
				silver: t('rating', 'tierSilver'),
				gold: t('rating', 'tierGold'),
				platinum: t('rating', 'tierPlatinum'),
				elite: t('rating', 'tierElite'),
			}
			return map[name] ?? map.beginner
		},
		[t],
	)

	const load = useCallback(async () => {
		if (!userId) {
			setLoading(false)
			setError(true)
			return
		}
		setLoading(true)
		setError(false)
		try {
			const { data: d } = await api.get<AthleteProfile>(`/leaderboard/profile/${userId}`)
			setData(d)
		} catch {
			setError(true)
			setData(null)
		} finally {
			setLoading(false)
		}
	}, [userId])

	useEffect(() => {
		void load()
	}, [load])

	const rating = useMemo((): RatingData | null => {
		if (!data) return null
		try {
			const stats: db.WorkoutStats = {
				total_workouts: Math.max(0, Math.floor(Number(data.lifetime.workouts) || 0)),
				total_sets: Math.max(0, Math.floor(Number(data.lifetime.sets) || 0)),
				total_volume: Math.max(0, Number(data.lifetime.volume) || 0),
				streak_days: Math.max(0, Math.floor(Number(data.lifetime.streakDays) || 0)),
				avg_duration: Math.max(0, Number(data.lifetime.avgDuration) || 0),
			}
			const prCount = Math.max(0, Math.floor(Number(data.lifetime.prCount) || 0))
			return buildRatingSnapshotFromStats(stats, prCount)
		} catch (e) {
			console.warn('[AthleteProfile] buildRatingSnapshotFromStats failed', e)
			return null
		}
	}, [data])

	const social = useMemo(
		() =>
			data?.social ?? {
				instagram: null,
				telegram: null,
				youtube: null,
				tiktok: null,
				strava: null,
				website: null,
			},
		[data],
	)

	const name =
		data ? [data.firstName, data.lastName].filter(Boolean).join(' ') || '—' : ''

	const avatarHttps = useMemo(
		() => (data ? safeRemoteAvatarUri(data.avatarUrl) : null),
		[data],
	)

	const openLink = async (kind: keyof AthleteProfile['social'], raw: string) => {
		const url = toOpenUrl(kind, raw)
		if (!url) return
		try {
			const can = await Linking.canOpenURL(url)
			if (can) await Linking.openURL(url)
			else Alert.alert('', t('leaderboard', 'linkOpenError'))
		} catch {
			Alert.alert('', t('leaderboard', 'linkOpenError'))
		}
	}

	const socialItems: { kind: keyof AthleteProfile['social']; icon: string }[] = [
		{ kind: 'instagram', icon: 'logo-instagram' },
		{ kind: 'telegram', icon: 'paper-plane-outline' },
		{ kind: 'youtube', icon: 'logo-youtube' },
		{ kind: 'tiktok', icon: 'musical-notes' },
		{ kind: 'strava', icon: 'bicycle' },
		{ kind: 'website', icon: 'globe-outline' },
	]

	return (
		<SafeAreaView style={s.safe} edges={['top', 'left', 'right']}>
			<LinearGradient
				colors={['rgba(52, 199, 89, 0.2)', 'transparent']}
				start={{ x: 0.5, y: 0 }}
				end={{ x: 0.5, y: 1 }}
				style={StyleSheet.absoluteFill}
			/>
			<View style={s.header}>
				<TouchableOpacity onPress={() => router.back()} style={s.backBtn} hitSlop={12}>
					<Ionicons name='chevron-back' size={26} color={C.text} />
				</TouchableOpacity>
				<Text style={s.headerTitle} numberOfLines={1}>
					{t('leaderboard', 'athleteProfile')}
				</Text>
				<View style={{ width: 40 }} />
			</View>

			{loading ? (
				<View style={s.centered}>
					<ActivityIndicator size='large' color={C.primary} />
				</View>
			) : error || !data || !rating ? (
				<View style={s.centered}>
					<Ionicons name='alert-circle-outline' size={40} color={C.sub} />
					<Text style={s.errText}>{t('leaderboard', 'profileLoadError')}</Text>
					<TouchableOpacity style={s.retry} onPress={() => void load()}>
						<Text style={s.retryText}>{t('common', 'retry')}</Text>
					</TouchableOpacity>
				</View>
			) : (
				<ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
					{/* Hero */}
					<View style={s.hero}>
						<View
							style={[
								s.avatarRing,
								{ borderColor: `${rating.tier.color}55`, shadowColor: rating.tier.color },
							]}
						>
							<View style={s.avatarWrap}>
								{avatarHttps ? (
									<Image source={{ uri: avatarHttps }} style={s.avatar} />
								) : (
									<View style={[s.avatar, s.avatarPh]}>
										<Text style={s.avatarIn}>{name.slice(0, 2).toUpperCase() || '?'}</Text>
									</View>
								)}
								{data.isPremium && (
									<LinearGradient colors={['#FFE566', '#FFD700', '#E6A800']} style={s.premBadge}>
										<Ionicons name='diamond' size={14} color='#1a1a1a' />
									</LinearGradient>
								)}
							</View>
						</View>
						<Text style={s.name}>{name}</Text>
						{data.isViewer && (
							<View style={s.youTag}>
								<Text style={s.youTagText}>{t('leaderboard', 'you')}</Text>
							</View>
						)}
					</View>

					{/* Social */}
					{socialItems.some(({ kind }) => social[kind]) && (
						<View style={s.socialRow}>
							{socialItems.map(({ kind, icon }) => {
								const raw = social[kind]
								if (!raw) return null
								return (
									<Pressable
										key={kind}
										style={({ pressed }) => [s.socialBtn, pressed && { opacity: 0.85 }]}
										onPress={() => void openLink(kind, raw)}
									>
										<Ionicons name={icon as any} size={22} color={C.text} />
									</Pressable>
								)
							})}
						</View>
					)}

					<Text style={s.hint}>{t('leaderboard', 'monthlyRatingHint')}</Text>

					{/* Level card (как на рейтинге) */}
					<View style={[s.levelCard, { borderColor: `${rating.tier.color}44` }]}>
						<View style={s.levelHeader}>
							<View
								style={[
									s.tierIconWrap,
									{ backgroundColor: `${rating.tier.color}18`, borderColor: `${rating.tier.color}40` },
								]}
							>
								<Ionicons
									name={tierIconEntry(rating.tier.name).name as any}
									size={30}
									color={tierIconEntry(rating.tier.name).color}
								/>
							</View>
							<View style={{ flex: 1, marginLeft: 12 }}>
								<View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
									<Text style={[s.levelNum, { color: rating.tier.color }]}>
										{t('rating', 'levelLabel')} {rating.currentLevel.level}
									</Text>
									<Text style={s.levelTotal}>/50</Text>
								</View>
								<Text style={[s.tierTitle, { color: rating.tier.color }]}>
									{tierLabel(rating.tier.name)}
								</Text>
								<Text style={s.scoreInline}>
									{rating.totalScore.toLocaleString()} {t('rating', 'pts')} · {t('rating', 'totalScore')}
								</Text>
							</View>
						</View>
						<View style={{ marginTop: 14 }}>
							<ProgressBar percent={rating.levelProgressPercent} color={rating.tier.color} height={10} />
							<View style={s.progressLabels}>
								<Text style={s.pl}>{rating.levelProgressPercent}%</Text>
								{rating.nextLevel ? (
									<Text style={s.pl} numberOfLines={1}>
										→ {t('rating', 'levelLabel')} {rating.nextLevel.level}:{' '}
										{(rating.nextLevel.minScore - rating.totalScore).toLocaleString()}{' '}
										{t('rating', 'pointsLeft')}
									</Text>
								) : (
									<Text style={[s.pl, { color: rating.tier.color }]}>{t('rating', 'maxLevel')}</Text>
								)}
							</View>
						</View>
						<TierLevelDots tierName={rating.tier.name} currentLevel={rating.currentLevel.level} />
						{/* Tier ladder mini */}
						<View style={s.tierLadder}>
							{TIERS.map((t2, i) => {
								const isActive = t2.name === rating.tier.name
								const isPassed = i < TIERS.findIndex(x => x.name === rating.tier.name)
								const ic = TIER_ICONS[t2.name]
								return (
									<View key={t2.name} style={s.tierStep}>
										<View
											style={[
												s.tierStepIcon,
												isActive && { borderColor: ic.color, backgroundColor: `${ic.color}14` },
												isPassed && { borderColor: `${ic.color}70`, backgroundColor: `${ic.color}08` },
											]}
										>
											<Ionicons
												name={ic.name as any}
												size={isActive ? 16 : 12}
												color={isActive ? ic.color : isPassed ? `${ic.color}AA` : '#444'}
											/>
										</View>
										{i < TIERS.length - 1 && (
											<View
												style={[
													s.tierConn,
													{ backgroundColor: isPassed ? rating.tier.color : C.border },
												]}
											/>
										)}
									</View>
								)
							})}
						</View>
					</View>

					{/* Categories */}
					<Text style={s.section}>{t('rating', 'categories')}</Text>
					<View style={s.catGrid}>
						{(
							[
								{ key: 'volume', label: t('rating', 'catVolume'), val: `${Math.round(data.lifetime.volume).toLocaleString()} ${t('rating', 'kg')}` },
								{ key: 'workouts', label: t('rating', 'catWorkouts'), val: String(data.lifetime.workouts) },
								{ key: 'streak', label: t('rating', 'catStreak'), val: `${data.lifetime.streakDays} ${t('rating', 'days')}` },
								{ key: 'sets', label: t('rating', 'catSets'), val: String(data.lifetime.sets) },
								{
									key: 'avgDuration',
									label: t('rating', 'catDuration'),
									val: `${Math.round(data.lifetime.avgDuration ?? 0)} ${t('rating', 'min')}`,
								},
								{ key: 'records', label: t('rating', 'catRecords'), val: String(data.lifetime.prCount) },
							] as const
						).map(cat => {
							const tier = rating.categoryTiers[cat.key] ?? rating.tier
							const ic = CAT_ICONS[cat.key] ?? CAT_ICONS.volume
							return (
								<View
									key={cat.key}
									style={[s.catCell, { width: CAT_W, borderColor: `${tier.color}35` }]}
								>
									<View style={[s.catIconWrap, { backgroundColor: `${ic.color}15` }]}>
										<Ionicons name={ic.icon as any} size={20} color={ic.color} />
									</View>
									<Text style={s.catLabel}>{cat.label}</Text>
									<Text style={s.catValue}>{cat.val}</Text>
									<View style={[s.catTierBadge, { backgroundColor: `${tier.color}22` }]}>
										<Ionicons name={tierIconEntry(tier.name).name as any} size={10} color={tier.color} />
										<Text style={[s.catTierText, { color: tier.color }]}> {tierLabel(tier.name)}</Text>
									</View>
								</View>
							)
						})}
					</View>

					{/* Score breakdown */}
					<View style={s.card}>
						<Text style={s.cardTitle}>{t('rating', 'scoreBreakdown')}</Text>
						{(
							[
								{ label: t('rating', 'workoutPts'), v: rating.scoreBreakdown.workoutPts, icon: 'barbell-outline', color: '#34C759' },
								{ label: t('rating', 'setPts'), v: rating.scoreBreakdown.setPts, icon: 'layers-outline', color: '#5AC8FA' },
								{ label: t('rating', 'volumePts'), v: rating.scoreBreakdown.volumePts, icon: 'trending-up-outline', color: '#FF9F0A' },
								{ label: t('rating', 'streakPts'), v: rating.scoreBreakdown.streakPts, icon: 'flame-outline', color: '#FF6B35' },
								{ label: t('rating', 'prPts'), v: rating.scoreBreakdown.prPts, icon: 'trophy-outline', color: '#FFD700' },
								{ label: t('rating', 'durationBonus'), v: rating.scoreBreakdown.durationBonus, icon: 'timer-outline', color: '#AF52DE' },
							] as const
						).map(row => (
							<View key={row.label} style={s.breakRow}>
								<View style={[s.breakIcon, { backgroundColor: `${row.color}18` }]}>
									<Ionicons name={row.icon as any} size={15} color={row.color} />
								</View>
								<Text style={s.breakLabel}>{row.label}</Text>
								<Text style={[s.breakVal, { color: row.color }]}>{row.v}</Text>
							</View>
						))}
					</View>

					{/* Achievements */}
					<View style={s.achHead}>
						<Text style={s.section}>{t('rating', 'achievements')}</Text>
						<Text style={s.achCount}>
							{rating.achievements.filter((a: Achievement) => a.earned).length}/{rating.achievements.length}{' '}
							{t('rating', 'earned')}
						</Text>
					</View>
					<View style={s.achGrid}>
						{[...rating.achievements]
							.sort((a, b) => {
								if (a.earned !== b.earned) return a.earned ? -1 : 1
								return b.progressPercent - a.progressPercent
							})
							.slice(0, 16)
							.map((a: Achievement) => (
								<View
									key={a.id}
									style={[
										s.achBadge,
										a.earned ? s.achEarned : s.achLocked,
										a.earned && { borderColor: `${a.iconColor}45`, backgroundColor: `${a.iconColor}10` },
									]}
								>
									<Ionicons
										name={a.icon as any}
										size={Math.round(ACH_BADGE * 0.42)}
										color={a.earned ? a.iconColor : '#444'}
									/>
									{a.earned && (
										<View style={s.achCheck}>
											<Ionicons name='checkmark' size={8} color='#fff' />
										</View>
									)}
								</View>
							))}
					</View>

					{/* Monthly */}
					<Text style={s.section}>{t('leaderboard', 'thisMonth')}</Text>
					<View style={s.card}>
						<Row k={t('leaderboard', 'rank')} v={`#${data.monthly.rank}`} />
						<Row k={t('leaderboard', 'score')} v={data.monthly.score.toLocaleString()} accent={TIERS.find(x => x.name === data.monthly.tierName)?.color} />
						<Row k={t('leaderboard', 'workouts')} v={String(data.monthly.workouts)} />
						<Row k={t('leaderboard', 'volume')} v={Math.round(data.monthly.volume).toLocaleString()} />
						<Row k={t('leaderboard', 'streak')} v={String(data.monthly.streakDays)} />
					</View>

					<Text style={s.section}>{t('leaderboard', 'podiumHistory')}</Text>
					<View style={s.card}>
						<Row k={`🥇 ${t('leaderboard', 'firstPlaces')}`} v={String(data.podium.first)} />
						<Row k={`🥈 ${t('leaderboard', 'secondPlaces')}`} v={String(data.podium.second)} />
						<Row k={`🥉 ${t('leaderboard', 'thirdPlaces')}`} v={String(data.podium.third)} />
					</View>

					<Text style={s.section}>{t('leaderboard', 'bestRecords')}</Text>
					<View style={s.card}>
						{data.topRecords.length === 0 ? (
							<Text style={s.muted}>{t('leaderboard', 'noRecords')}</Text>
						) : (
							data.topRecords.map((r, i) => (
								<View key={`${r.exercise}-${i}`} style={s.recRow}>
									<Text style={s.recEx} numberOfLines={2}>
										{r.exercise}
									</Text>
									<Text style={s.recW}>{r.weight}</Text>
								</View>
							))
						)}
					</View>
				</ScrollView>
			)}
		</SafeAreaView>
	)
}

function Row({ k, v, accent }: { k: string; v: string; accent?: string }) {
	return (
		<View style={s.row}>
			<Text style={s.muted}>{k}</Text>
			<Text style={[s.val, accent && { color: accent }]}>{v}</Text>
		</View>
	)
}

const s = StyleSheet.create({
	safe: { flex: 1, backgroundColor: C.bg },
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 8,
		paddingVertical: 8,
		zIndex: 2,
	},
	backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
	headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '800', color: C.text },
	centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },
	errText: { color: C.sub, fontSize: 15, textAlign: 'center' },
	retry: {
		marginTop: 8,
		paddingHorizontal: 20,
		paddingVertical: 10,
		borderRadius: 12,
		backgroundColor: 'rgba(52, 199, 89, 0.15)',
		borderWidth: 1,
		borderColor: 'rgba(52, 199, 89, 0.35)',
	},
	retryText: { color: C.primary, fontWeight: '700' },
	scroll: { paddingHorizontal: PAD, paddingBottom: 48 },
	hero: { alignItems: 'center', marginTop: 4, marginBottom: 6 },
	avatarRing: {
		padding: 4,
		borderRadius: 56,
		borderWidth: 2,
		...Platform.select({
			ios: { shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8 },
			android: { elevation: 6 },
		}),
	},
	avatarWrap: { position: 'relative', width: 96, height: 96 },
	avatar: {
		width: 96,
		height: 96,
		borderRadius: 48,
		backgroundColor: C.card,
	},
	avatarPh: { alignItems: 'center', justifyContent: 'center' },
	avatarIn: { fontSize: 32, fontWeight: '800', color: C.text },
	premBadge: {
		position: 'absolute',
		top: -2,
		right: -2,
		width: 30,
		height: 30,
		borderRadius: 15,
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: 2,
		borderColor: C.bg,
		zIndex: 4,
	},
	name: { marginTop: 12, fontSize: 24, fontWeight: '800', color: C.text },
	youTag: {
		marginTop: 8,
		backgroundColor: `${C.primary}22`,
		paddingHorizontal: 10,
		paddingVertical: 4,
		borderRadius: 8,
	},
	youTagText: { fontSize: 11, fontWeight: '800', color: C.primary },
	socialRow: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'center',
		gap: 10,
		marginBottom: 8,
	},
	socialBtn: {
		width: 48,
		height: 48,
		borderRadius: 14,
		backgroundColor: C.card,
		borderWidth: 1,
		borderColor: 'rgba(255,255,255,0.08)',
		alignItems: 'center',
		justifyContent: 'center',
	},
	hint: {
		fontSize: 11,
		color: C.sub,
		lineHeight: 15,
		marginBottom: 16,
		textAlign: 'center',
		paddingHorizontal: 8,
		opacity: 0.95,
	},
	section: {
		fontSize: 13,
		fontWeight: '800',
		color: C.sub,
		letterSpacing: 0.5,
		textTransform: 'uppercase',
		marginBottom: 10,
		marginTop: 6,
	},
	levelCard: {
		backgroundColor: C.card,
		borderRadius: 20,
		borderWidth: 1.5,
		padding: 16,
		marginBottom: 20,
	},
	levelHeader: { flexDirection: 'row', alignItems: 'center' },
	tierIconWrap: {
		width: 56,
		height: 56,
		borderRadius: 16,
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: 1,
	},
	levelNum: { fontSize: 26, fontWeight: '800' },
	levelTotal: { fontSize: 14, color: C.sub, fontWeight: '600' },
	tierTitle: { fontSize: 15, fontWeight: '700', marginTop: 2 },
	scoreInline: { fontSize: 12, color: C.sub, marginTop: 4 },
	progressLabels: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginTop: 8,
		gap: 8,
	},
	pl: { fontSize: 11, color: C.sub, flexShrink: 1 },
	tierLadder: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		marginTop: 16,
		paddingTop: 12,
		borderTopWidth: StyleSheet.hairlineWidth,
		borderTopColor: 'rgba(255,255,255,0.08)',
	},
	tierStep: { alignItems: 'center' },
	tierStepIcon: {
		width: 32,
		height: 32,
		borderRadius: 10,
		borderWidth: 1,
		borderColor: '#333',
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: 'rgba(0,0,0,0.2)',
	},
	tierConn: { width: 2, height: 14, marginVertical: 2 },
	catGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: CAT_GAP,
		marginBottom: 18,
	},
	catCell: {
		backgroundColor: C.card,
		borderRadius: 16,
		padding: 12,
		borderWidth: 1,
	},
	catIconWrap: {
		width: 40,
		height: 40,
		borderRadius: 12,
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: 8,
	},
	catLabel: { fontSize: 11, color: C.sub, fontWeight: '600' },
	catValue: { fontSize: 16, fontWeight: '800', color: C.text, marginTop: 4 },
	catTierBadge: {
		flexDirection: 'row',
		alignItems: 'center',
		alignSelf: 'flex-start',
		marginTop: 8,
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 8,
	},
	catTierText: { fontSize: 10, fontWeight: '800' },
	card: {
		backgroundColor: C.card,
		borderRadius: 18,
		borderWidth: 1,
		borderColor: 'rgba(255,255,255,0.06)',
		padding: 14,
		marginBottom: 18,
	},
	cardTitle: { fontSize: 15, fontWeight: '800', color: C.text, marginBottom: 10 },
	breakRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 10 },
	breakIcon: {
		width: 32,
		height: 32,
		borderRadius: 10,
		alignItems: 'center',
		justifyContent: 'center',
	},
	breakLabel: { flex: 1, fontSize: 13, color: C.text },
	breakVal: { fontSize: 14, fontWeight: '800' },
	achHead: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 8,
		paddingRight: 4,
	},
	achCount: { fontSize: 12, color: C.sub, fontWeight: '600' },
	achGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 8,
		marginBottom: 20,
	},
	achBadge: {
		width: ACH_BADGE,
		height: ACH_BADGE,
		borderRadius: 14,
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: 1,
		borderColor: '#333',
	},
	achEarned: {},
	achLocked: { opacity: 0.55 },
	achCheck: {
		position: 'absolute',
		top: 4,
		right: 4,
		width: 16,
		height: 16,
		borderRadius: 8,
		backgroundColor: C.primary,
		alignItems: 'center',
		justifyContent: 'center',
	},
	row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
	muted: { fontSize: 14, color: C.sub },
	val: { fontSize: 15, fontWeight: '700', color: C.text },
	recRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingVertical: 8,
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderBottomColor: 'rgba(255,255,255,0.08)',
	},
	recEx: { flex: 1, fontSize: 14, fontWeight: '600', color: C.text, paddingRight: 12 },
	recW: { fontSize: 14, fontWeight: '800', color: C.primary },
})
