import { useAuth } from '@/app/contexts/auth-context'
import { useLanguage } from '@/contexts/language-context'
import {
	formatPrice,
	getActiveMembership,
	getVisitHistory,
	GymVisit,
	Membership,
} from '@/services/gym-pass'
import { Ionicons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import { router } from 'expo-router'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
	ActivityIndicator,
	Animated,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const COLORS = {
	background: '#121212',
	card: '#1C1C1E',
	cardLight: '#2C2C2E',
	border: '#2C2C2E',
	text: '#FFFFFF',
	textSecondary: '#8E8E93',
	primary: '#34C759',
} as const

const PLAN_KEY_MAP: Record<string, string> = {
	day: 'plan_day',
	month: 'plan_month',
	quarter: 'plan_quarter',
	year: 'plan_year',
	all_access: 'plan_all_access',
}

// ─── Membership card ─────────────────────────────────────────────────────────

const MembershipCard = ({
	membership,
	userName,
}: {
	membership: Membership
	userName: string
}) => {
	const { t, language } = useLanguage()
	const gym = membership.gymId as any
	const planKey = PLAN_KEY_MAP[membership.planType] ?? 'plan_month'

	const validUntil = new Date(membership.endDate).toLocaleDateString(language, {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
	})

	const daysLeft = Math.max(
		0,
		Math.ceil((new Date(membership.endDate).getTime() - Date.now()) / 86_400_000),
	)

	const parts = membership.accessToken.split('-')
	const formattedToken = parts.join(' · ')

	const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&color=34C759&bgcolor=1C1C1E&data=${encodeURIComponent(membership.accessToken)}`

	return (
		<View style={cardStyles.wrapper}>
			{/* The card itself */}
			<View style={cardStyles.card}>
				{/* Top row */}
				<View style={cardStyles.topRow}>
					<View style={cardStyles.logoArea}>
						<Ionicons name='fitness' size={22} color={COLORS.primary} />
						<Text style={cardStyles.logoText}>FitEx Pass</Text>
					</View>
					<View style={[cardStyles.statusDot, membership.status === 'active' ? cardStyles.statusActive : cardStyles.statusExpired]} />
				</View>

				{/* Plan name */}
				<Text style={cardStyles.planName}>
					{t('gymPass', planKey as Parameters<typeof t>[1])}
				</Text>

				{/* Gym or "All gyms" */}
				<Text style={cardStyles.gymName}>
					{gym?.name ?? t('gymPass', 'allGyms')}
				</Text>

				{/* Token */}
				<Text style={cardStyles.token}>{formattedToken}</Text>

				{/* Bottom row */}
				<View style={cardStyles.bottomRow}>
					<View>
						<Text style={cardStyles.metaLabel}>{t('gymPass', 'validUntil')}</Text>
						<Text style={cardStyles.metaValue}>{validUntil}</Text>
					</View>
					<View style={{ alignItems: 'flex-end' }}>
						<Text style={cardStyles.metaLabel}>{t('gymPass', 'daysLeft')}</Text>
						<Text style={[cardStyles.metaValue, { color: COLORS.primary }]}>
							{daysLeft}
						</Text>
					</View>
				</View>

				{/* Decorative circles */}
				<View style={cardStyles.decorCircle1} />
				<View style={cardStyles.decorCircle2} />
			</View>

			{/* QR Section */}
			<View style={cardStyles.qrSection}>
				<View style={cardStyles.qrFrame}>
					<Image
						source={{ uri: qrUrl }}
						style={{ width: 140, height: 140 }}
						contentFit='fill'
					/>
				</View>
				<View style={{ flex: 1, paddingLeft: 16 }}>
					<View style={cardStyles.scanIconRow}>
						<Ionicons name='wifi' size={20} color={COLORS.primary} style={{ transform: [{ rotate: '90deg' }] }} />
						<Text style={cardStyles.scanTitle}>{t('gymPass', 'accessCode')}</Text>
					</View>
					<Text style={cardStyles.scanHint}>{t('gymPass', 'scanHint')}</Text>
					<View style={cardStyles.statsRow}>
						<View>
							<Text style={cardStyles.statsLabel}>{t('gymPass', 'visitsTotal')}</Text>
							<Text style={cardStyles.statsValue}>{membership.visitsCount}</Text>
						</View>
					</View>
				</View>
			</View>
		</View>
	)
}

// ─── Visit row ────────────────────────────────────────────────────────────────

const VisitRow = ({ visit }: { visit: GymVisit }) => {
	const { language } = useLanguage()
	const gym = visit.gymId as any
	const date = new Date(visit.checkInTime)
	const dateStr = date.toLocaleDateString(language, { day: '2-digit', month: '2-digit', year: 'numeric' })
	const timeStr = date.toLocaleTimeString(language, { hour: '2-digit', minute: '2-digit' })

	return (
		<View style={styles.visitRow}>
			<View style={styles.visitIcon}>
				<Ionicons name='enter-outline' size={18} color={COLORS.primary} />
			</View>
			<View style={{ flex: 1 }}>
				<Text style={styles.visitGym} numberOfLines={1}>{gym?.name ?? '—'}</Text>
				<Text style={styles.visitAddress} numberOfLines={1}>{gym?.address ?? ''}</Text>
			</View>
			<View style={{ alignItems: 'flex-end' }}>
				<Text style={styles.visitDate}>{dateStr}</Text>
				<Text style={styles.visitTime}>{timeStr}</Text>
			</View>
		</View>
	)
}

// ─── No membership state ──────────────────────────────────────────────────────

const NoMembership = () => {
	const { t } = useLanguage()
	return (
		<View style={styles.noMembershipContainer}>
			<Text style={styles.noMembershipEmoji}>🏃</Text>
			<Text style={styles.noMembershipTitle}>{t('gymPass', 'noMembership')}</Text>
			<Text style={styles.noMembershipSubtitle}>{t('gymPass', 'noMembershipSubtitle')}</Text>
			<TouchableOpacity
				style={styles.browseBtn}
				onPress={() => router.push('/(routes)/gyms')}
				activeOpacity={0.8}
			>
				<Ionicons name='location-outline' size={18} color='#000' />
				<Text style={styles.browseBtnText}>{t('gymPass', 'browseGyms')}</Text>
			</TouchableOpacity>
		</View>
	)
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function GymPassScreen() {
	const { t } = useLanguage()
	const { user } = useAuth()
	const [membership, setMembership] = useState<Membership | null>(null)
	const [visits, setVisits] = useState<GymVisit[]>([])
	const [loading, setLoading] = useState(true)
	const fadeAnim = useRef(new Animated.Value(0)).current

	const load = useCallback(async () => {
		setLoading(true)
		try {
			const [m, v] = await Promise.all([getActiveMembership(), getVisitHistory()])
			setMembership(m)
			setVisits(v)
			Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }).start()
		} catch {
			// API not reachable
		} finally {
			setLoading(false)
		}
	}, [])

	useEffect(() => { load() }, [load])

	const userName = user
		? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.email
		: ''

	return (
		<SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
			<View style={styles.header}>
				<TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
					<Ionicons name='chevron-back' size={26} color={COLORS.text} />
				</TouchableOpacity>
				<Text style={styles.headerTitle}>{t('gymPass', 'title')}</Text>
				<TouchableOpacity onPress={() => router.push('/(routes)/gyms')} style={styles.backBtn}>
					<Ionicons name='location-outline' size={22} color={COLORS.primary} />
				</TouchableOpacity>
			</View>

			{loading ? (
				<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
					<ActivityIndicator color={COLORS.primary} />
				</View>
			) : (
				<ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
					<Animated.View style={{ opacity: fadeAnim }}>
						{membership ? (
							<>
								<MembershipCard membership={membership} userName={userName} />

								{/* Visit history */}
								<Text style={styles.sectionTitle}>{t('gymPass', 'visitHistory')}</Text>
								{visits.length === 0 ? (
									<View style={styles.noVisitsState}>
										<Text style={styles.noVisitsEmoji}>🚪</Text>
										<Text style={styles.noVisitsText}>{t('gymPass', 'noVisits')}</Text>
									</View>
								) : (
									<View style={styles.visitsCard}>
										{visits.map((v, i) => (
											<View key={v._id}>
												<VisitRow visit={v} />
												{i < visits.length - 1 && <View style={styles.divider} />}
											</View>
										))}
									</View>
								)}
							</>
						) : (
							<NoMembership />
						)}
					</Animated.View>
					<View style={{ height: 40 }} />
				</ScrollView>
			)}
		</SafeAreaView>
	)
}

// ─── Card styles ──────────────────────────────────────────────────────────────

const cardStyles = StyleSheet.create({
	wrapper: { marginHorizontal: 20, marginTop: 4 },
	card: {
		backgroundColor: '#0F2318',
		borderRadius: 20,
		padding: 22,
		borderWidth: 1.5,
		borderColor: 'rgba(52,199,89,0.35)',
		overflow: 'hidden',
		shadowColor: COLORS.primary,
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.25,
		shadowRadius: 12,
		elevation: 8,
		marginBottom: 16,
	},
	topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
	logoArea: { flexDirection: 'row', alignItems: 'center', gap: 8 },
	logoText: { fontSize: 16, fontWeight: '800', color: COLORS.primary, letterSpacing: 0.5 },
	statusDot: { width: 10, height: 10, borderRadius: 5 },
	statusActive: { backgroundColor: COLORS.primary },
	statusExpired: { backgroundColor: '#8E8E93' },
	planName: { fontSize: 22, fontWeight: '800', color: COLORS.text, marginBottom: 4 },
	gymName: { fontSize: 14, color: 'rgba(255,255,255,0.6)', marginBottom: 20 },
	token: { fontSize: 16, color: COLORS.text, letterSpacing: 3, fontWeight: '600', marginBottom: 20, fontVariant: ['tabular-nums'] },
	bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
	metaLabel: { fontSize: 10, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
	metaValue: { fontSize: 15, fontWeight: '700', color: COLORS.text },
	decorCircle1: {
		position: 'absolute',
		width: 140,
		height: 140,
		borderRadius: 70,
		backgroundColor: 'rgba(52,199,89,0.06)',
		top: -40,
		right: -30,
	},
	decorCircle2: {
		position: 'absolute',
		width: 80,
		height: 80,
		borderRadius: 40,
		backgroundColor: 'rgba(52,199,89,0.04)',
		bottom: -20,
		left: 60,
	},
	qrSection: {
		backgroundColor: COLORS.card,
		borderRadius: 16,
		padding: 16,
		flexDirection: 'row',
		alignItems: 'center',
		borderWidth: 1,
		borderColor: COLORS.border,
		marginBottom: 24,
	},
	qrFrame: {
		backgroundColor: '#1C1C1E',
		borderRadius: 12,
		padding: 6,
		borderWidth: 1,
		borderColor: COLORS.primary + '30',
	},
	scanIconRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
	scanTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text },
	scanHint: { fontSize: 12, color: COLORS.textSecondary, lineHeight: 18, marginBottom: 12 },
	statsRow: { flexDirection: 'row', gap: 20 },
	statsLabel: { fontSize: 10, color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
	statsValue: { fontSize: 18, fontWeight: '800', color: COLORS.text },
})

// ─── Screen styles ────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
	safeArea: { flex: 1, backgroundColor: COLORS.background },
	header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
	backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
	headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
	scrollContent: { paddingTop: 8 },
	sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginHorizontal: 20, marginBottom: 12 },

	// Visit history
	visitsCard: { backgroundColor: COLORS.card, borderRadius: 16, marginHorizontal: 20, borderWidth: 1, borderColor: COLORS.border },
	visitRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
	visitIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.primary + '15', alignItems: 'center', justifyContent: 'center' },
	visitGym: { fontSize: 14, fontWeight: '600', color: COLORS.text },
	visitAddress: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
	visitDate: { fontSize: 12, fontWeight: '600', color: COLORS.text },
	visitTime: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
	divider: { height: 1, backgroundColor: COLORS.border, marginLeft: 62 },

	// No membership
	noMembershipContainer: { alignItems: 'center', paddingTop: 80, paddingHorizontal: 40 },
	noMembershipEmoji: { fontSize: 56, marginBottom: 20 },
	noMembershipTitle: { fontSize: 20, fontWeight: '800', color: COLORS.text, textAlign: 'center', marginBottom: 10 },
	noMembershipSubtitle: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 21, marginBottom: 28 },
	browseBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.primary, borderRadius: 14, paddingHorizontal: 28, paddingVertical: 14 },
	browseBtnText: { color: '#000', fontWeight: '800', fontSize: 16 },

	// No visits
	noVisitsState: { alignItems: 'center', paddingVertical: 32 },
	noVisitsEmoji: { fontSize: 36, marginBottom: 10 },
	noVisitsText: { fontSize: 14, color: COLORS.textSecondary },
})
