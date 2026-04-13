import { useLanguage } from '@/contexts/language-context'
import { api } from '@/services/api'
import { TIERS, TierName } from '@/services/rating'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { router, useLocalSearchParams } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
import {
	ActivityIndicator,
	Image,
	Platform,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const C = {
	bg: '#121212',
	card: '#1C1C1E',
	border: '#3A3A3C',
	text: '#FFFFFF',
	sub: '#8E8E93',
	primary: '#34C759',
	gold: '#FFD700',
} as const

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
		tierName: TierName
	}
	podium: { first: number; second: number; third: number }
	topRecords: { exercise: string; weight: string; date: string }[]
}

const tierStyle = (name: string) => ({
	color: TIERS.find(t => t.name === name)?.color ?? C.sub,
})

export default function AthleteProfileScreen() {
	const { userId } = useLocalSearchParams<{ userId: string }>()
	const { t } = useLanguage()
	const [data, setData] = useState<AthleteProfile | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(false)

	const load = useCallback(async () => {
		if (!userId) return
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

	const name =
		data ? [data.firstName, data.lastName].filter(Boolean).join(' ') || '—' : ''

	return (
		<SafeAreaView style={s.safe} edges={['top', 'left', 'right']}>
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
			) : error || !data ? (
				<View style={s.centered}>
					<Ionicons name='alert-circle-outline' size={40} color={C.sub} />
					<Text style={s.errText}>{t('leaderboard', 'profileLoadError')}</Text>
					<TouchableOpacity style={s.retry} onPress={() => void load()}>
						<Text style={s.retryText}>{t('common', 'retry')}</Text>
					</TouchableOpacity>
				</View>
			) : (
				<ScrollView
					showsVerticalScrollIndicator={false}
					contentContainerStyle={s.scroll}
				>
					<View style={s.hero}>
						<View style={s.avatarWrap}>
							{data.avatarUrl ? (
								<Image source={{ uri: data.avatarUrl }} style={s.avatar} />
							) : (
								<View style={[s.avatar, s.avatarPh]}>
									<Text style={s.avatarIn}>{name.slice(0, 2).toUpperCase() || '?'}</Text>
								</View>
							)}
							{data.isPremium && (
								<LinearGradient
									colors={['#FFE566', '#FFD700', '#E6A800']}
									style={s.premBadge}
								>
									<Ionicons name='diamond' size={14} color='#1a1a1a' />
								</LinearGradient>
							)}
						</View>
						<Text style={s.name}>{name}</Text>
						{data.isViewer && (
							<View style={s.youTag}>
								<Text style={s.youTagText}>{t('leaderboard', 'you')}</Text>
							</View>
						)}
					</View>

					<Text style={s.hint}>{t('leaderboard', 'monthlyRatingHint')}</Text>

					<Text style={s.section}>{t('leaderboard', 'thisMonth')}</Text>
					<View style={s.card}>
						<View style={s.row}>
							<Text style={s.muted}>{t('leaderboard', 'rank')}</Text>
							<Text style={s.val}>#{data.monthly.rank}</Text>
						</View>
						<View style={s.row}>
							<Text style={s.muted}>{t('leaderboard', 'score')}</Text>
							<Text style={[s.val, tierStyle(data.monthly.tierName as TierName)]}>
								{data.monthly.score.toLocaleString()}
							</Text>
						</View>
						<View style={s.row}>
							<Text style={s.muted}>{t('leaderboard', 'workouts')}</Text>
							<Text style={s.val}>{data.monthly.workouts}</Text>
						</View>
						<View style={s.row}>
							<Text style={s.muted}>{t('leaderboard', 'volume')}</Text>
							<Text style={s.val}>{Math.round(data.monthly.volume).toLocaleString()}</Text>
						</View>
						<View style={s.row}>
							<Text style={s.muted}>{t('leaderboard', 'streak')}</Text>
							<Text style={s.val}>{data.monthly.streakDays}</Text>
						</View>
					</View>

					<Text style={s.section}>{t('leaderboard', 'lifetime')}</Text>
					<View style={s.card}>
						<View style={s.row}>
							<Text style={s.muted}>{t('leaderboard', 'score')}</Text>
							<Text style={[s.val, tierStyle(data.lifetime.tierName as TierName)]}>
								{data.lifetime.score.toLocaleString()}
							</Text>
						</View>
						<View style={s.row}>
							<Text style={s.muted}>{t('leaderboard', 'workouts')}</Text>
							<Text style={s.val}>{data.lifetime.workouts}</Text>
						</View>
						<View style={s.row}>
							<Text style={s.muted}>{t('leaderboard', 'volume')}</Text>
							<Text style={s.val}>{Math.round(data.lifetime.volume).toLocaleString()}</Text>
						</View>
						<View style={s.row}>
							<Text style={s.muted}>{t('leaderboard', 'sets')}</Text>
							<Text style={s.val}>{data.lifetime.sets}</Text>
						</View>
						<View style={s.row}>
							<Text style={s.muted}>{t('leaderboard', 'streak')}</Text>
							<Text style={s.val}>{data.lifetime.streakDays}</Text>
						</View>
						<View style={s.row}>
							<Text style={s.muted}>{t('leaderboard', 'prs')}</Text>
							<Text style={s.val}>{data.lifetime.prCount}</Text>
						</View>
					</View>

					<Text style={s.section}>{t('leaderboard', 'podiumHistory')}</Text>
					<View style={s.card}>
						<View style={s.row}>
							<View style={s.podiumLabel}>
								<Ionicons name='trophy' size={16} color={C.gold} />
								<Text style={s.muted}>{t('leaderboard', 'firstPlaces')}</Text>
							</View>
							<Text style={s.val}>{data.podium.first}</Text>
						</View>
						<View style={s.row}>
							<View style={s.podiumLabel}>
								<Ionicons name='medal-outline' size={16} color='#C0C0C0' />
								<Text style={s.muted}>{t('leaderboard', 'secondPlaces')}</Text>
							</View>
							<Text style={s.val}>{data.podium.second}</Text>
						</View>
						<View style={s.row}>
							<View style={s.podiumLabel}>
								<Ionicons name='medal-outline' size={16} color='#CD7F32' />
								<Text style={s.muted}>{t('leaderboard', 'thirdPlaces')}</Text>
							</View>
							<Text style={s.val}>{data.podium.third}</Text>
						</View>
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

const s = StyleSheet.create({
	safe: { flex: 1, backgroundColor: C.bg },
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 8,
		paddingVertical: 8,
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
	scroll: { paddingHorizontal: 16, paddingBottom: 40 },
	hero: { alignItems: 'center', marginTop: 8, marginBottom: 8 },
	avatarWrap: {
		position: 'relative',
		width: 88,
		height: 88,
		alignSelf: 'center',
	},
	avatar: {
		width: 88,
		height: 88,
		borderRadius: 44,
		backgroundColor: C.card,
	},
	avatarPh: { alignItems: 'center', justifyContent: 'center' },
	avatarIn: { fontSize: 28, fontWeight: '800', color: C.text },
	premBadge: {
		position: 'absolute',
		top: -2,
		right: -2,
		width: 28,
		height: 28,
		borderRadius: 14,
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: 2,
		borderColor: C.bg,
		zIndex: 4,
		...Platform.select({
			ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3 },
			android: { elevation: 4 },
		}),
	},
	name: { marginTop: 14, fontSize: 22, fontWeight: '800', color: C.text },
	youTag: {
		marginTop: 8,
		backgroundColor: `${C.primary}22`,
		paddingHorizontal: 10,
		paddingVertical: 4,
		borderRadius: 8,
	},
	youTagText: { fontSize: 11, fontWeight: '800', color: C.primary },
	hint: {
		fontSize: 12,
		color: C.sub,
		lineHeight: 17,
		marginBottom: 18,
		textAlign: 'center',
	},
	section: {
		fontSize: 13,
		fontWeight: '800',
		color: C.sub,
		letterSpacing: 0.5,
		textTransform: 'uppercase',
		marginBottom: 8,
		marginTop: 4,
	},
	card: {
		backgroundColor: C.card,
		borderRadius: 16,
		borderWidth: 1,
		borderColor: 'rgba(255,255,255,0.06)',
		padding: 14,
		gap: 10,
		marginBottom: 18,
	},
	row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
	muted: { fontSize: 14, color: C.sub },
	val: { fontSize: 15, fontWeight: '700', color: C.text },
	podiumLabel: { flexDirection: 'row', alignItems: 'center', gap: 8 },
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
