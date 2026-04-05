import { useLanguage } from '@/contexts/language-context'
import { formatPrice, getGyms, GymPartner, purchaseMembership } from '@/services/gym-pass'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
	ActivityIndicator,
	Alert,
	Animated,
	Modal,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
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
	error: '#FF3B30',
} as const

const AMENITY_ICONS: Record<string, string> = {
	pool: '🏊',
	sauna: '🧖',
	cardio: '🏃',
	weights: '🏋️',
	parking: '🅿️',
	showers: '🚿',
	crossfit: '💪',
	boxing: '🥊',
}

// ─── Opening hours helper ─────────────────────────────────────────────────────

const isGymOpen = (hours: Record<string, { open: string; close: string }>): boolean => {
	if (!hours) return false
	const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
	const today = days[new Date().getDay()]
	const todayHours = hours[today]
	if (!todayHours) return false
	const now = new Date()
	const currentMinutes = now.getHours() * 60 + now.getMinutes()
	const [openH, openM] = todayHours.open.split(':').map(Number)
	const [closeH, closeM] = todayHours.close.split(':').map(Number)
	return currentMinutes >= openH * 60 + openM && currentMinutes <= closeH * 60 + closeM
}

// ─── Purchase modal ───────────────────────────────────────────────────────────

const PurchaseModal = ({
	gym,
	visible,
	onClose,
	onSuccess,
}: {
	gym: GymPartner
	visible: boolean
	onClose: () => void
	onSuccess: () => void
}) => {
	const { t } = useLanguage()
	const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
	const [purchasing, setPurchasing] = useState(false)

	const PLAN_KEY_MAP: Record<string, string> = {
		day: 'plan_day',
		month: 'plan_month',
		quarter: 'plan_quarter',
		year: 'plan_year',
		all_access: 'plan_all_access',
	}

	const handlePurchase = async () => {
		if (!selectedPlan) return
		setPurchasing(true)
		try {
			await purchaseMembership({ gymId: gym._id, planType: selectedPlan })
			onSuccess()
			onClose()
		} catch (e: any) {
			Alert.alert(t('common', 'error'), e?.response?.data?.message ?? String(e))
		} finally {
			setPurchasing(false)
		}
	}

	return (
		<Modal visible={visible} transparent animationType='slide' onRequestClose={onClose}>
			<Pressable style={modalStyles.overlay} onPress={onClose}>
				<Pressable style={modalStyles.sheet} onPress={e => e.stopPropagation()}>
					<View style={modalStyles.handle} />
					<Text style={modalStyles.title}>{gym.name}</Text>
					<Text style={modalStyles.subtitle}>{t('gymPass', 'choosePlan')}</Text>

					{gym.membershipPrices?.length > 0 ? (
						gym.membershipPrices.map(p => {
							const planKey = PLAN_KEY_MAP[p.planType] ?? p.planType
							const isSelected = selectedPlan === p.planType
							return (
								<TouchableOpacity
									key={p.planType}
									style={[modalStyles.planRow, isSelected && modalStyles.planRowSelected]}
									onPress={() => setSelectedPlan(p.planType)}
									activeOpacity={0.8}
								>
									<View style={[modalStyles.radio, isSelected && modalStyles.radioSelected]}>
										{isSelected && <View style={modalStyles.radioDot} />}
									</View>
									<Text style={[modalStyles.planLabel, isSelected && modalStyles.planLabelSelected]}>
										{t('gymPass', planKey as Parameters<typeof t>[1])}
									</Text>
									<Text style={[modalStyles.planPrice, isSelected && modalStyles.planPriceSelected]}>
										{formatPrice(p.price, p.currency)}
									</Text>
								</TouchableOpacity>
							)
						})
					) : (
						<Text style={{ color: COLORS.textSecondary, textAlign: 'center', paddingVertical: 20 }}>
							{t('gymPass', 'noGyms')}
						</Text>
					)}

					<TouchableOpacity
						style={[modalStyles.buyBtn, (!selectedPlan || purchasing) && { opacity: 0.5 }]}
						onPress={handlePurchase}
						disabled={!selectedPlan || purchasing}
						activeOpacity={0.8}
					>
						{purchasing ? (
							<ActivityIndicator color='#000' />
						) : (
							<Text style={modalStyles.buyBtnText}>{t('gymPass', 'buyMembership')}</Text>
						)}
					</TouchableOpacity>
				</Pressable>
			</Pressable>
		</Modal>
	)
}

// ─── Gym card ─────────────────────────────────────────────────────────────────

const GymCard = ({ gym, onBuy }: { gym: GymPartner; onBuy: (g: GymPartner) => void }) => {
	const { t } = useLanguage()
	const open = isGymOpen(gym.workingHours)

	return (
		<View style={styles.gymCard}>
			<View style={styles.gymCardHeader}>
				<View style={{ flex: 1 }}>
					<View style={styles.gymNameRow}>
						<Text style={styles.gymName} numberOfLines={1}>{gym.name}</Text>
						<View style={[styles.statusBadge, open ? styles.statusOpen : styles.statusClosed]}>
							<Text style={[styles.statusText, open ? styles.statusOpenText : styles.statusClosedText]}>
								{open ? t('gymPass', 'open') : t('gymPass', 'closed')}
							</Text>
						</View>
					</View>
					<View style={styles.gymAddressRow}>
						<Ionicons name='location-outline' size={13} color={COLORS.textSecondary} />
						<Text style={styles.gymAddress} numberOfLines={1}>
							{gym.address}{gym.city ? `, ${gym.city}` : ''}
						</Text>
					</View>
				</View>
			</View>

			{gym.amenities?.length > 0 && (
				<View style={styles.amenitiesRow}>
					{gym.amenities.slice(0, 6).map(a => (
						<View key={a} style={styles.amenityChip}>
							<Text style={styles.amenityIcon}>{AMENITY_ICONS[a] ?? '✓'}</Text>
							<Text style={styles.amenityLabel}>{a}</Text>
						</View>
					))}
				</View>
			)}

			{gym.membershipPrices?.length > 0 && (
				<View style={styles.pricesRow}>
					{gym.membershipPrices.slice(0, 3).map(p => (
						<View key={p.planType} style={styles.priceChip}>
							<Text style={styles.priceChipText}>{formatPrice(p.price, p.currency)}</Text>
						</View>
					))}
				</View>
			)}

			<TouchableOpacity
				style={styles.buyBtn}
				onPress={() => onBuy(gym)}
				activeOpacity={0.8}
			>
				<Ionicons name='card-outline' size={16} color='#000' />
				<Text style={styles.buyBtnText}>{t('gymPass', 'buyMembership')}</Text>
			</TouchableOpacity>
		</View>
	)
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function GymsScreen() {
	const { t } = useLanguage()
	const [gyms, setGyms] = useState<GymPartner[]>([])
	const [search, setSearch] = useState('')
	const [loading, setLoading] = useState(true)
	const [selectedGym, setSelectedGym] = useState<GymPartner | null>(null)
	const fadeAnim = useRef(new Animated.Value(0)).current

	const load = useCallback(async () => {
		setLoading(true)
		try {
			const data = await getGyms(search || undefined)
			setGyms(data)
			Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start()
		} catch {
			// API not reachable in development
		} finally {
			setLoading(false)
		}
	}, [search])

	useEffect(() => {
		fadeAnim.setValue(0)
		const t = setTimeout(load, 300)
		return () => clearTimeout(t)
	}, [load])

	return (
		<SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
			<View style={styles.header}>
				<TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
					<Ionicons name='chevron-back' size={26} color={COLORS.text} />
				</TouchableOpacity>
				<Text style={styles.headerTitle}>{t('gymPass', 'gymsTitle')}</Text>
				<View style={{ width: 40 }} />
			</View>

			<View style={styles.searchContainer}>
				<Ionicons name='search' size={18} color={COLORS.textSecondary} style={{ marginRight: 8 }} />
				<TextInput
					style={styles.searchInput}
					placeholder={t('gymPass', 'gymsTitle') + '...'}
					placeholderTextColor={COLORS.textSecondary}
					value={search}
					onChangeText={setSearch}
				/>
			</View>

			{loading ? (
				<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
					<ActivityIndicator color={COLORS.primary} />
				</View>
			) : (
				<ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
					<Animated.View style={{ opacity: fadeAnim }}>
						{gyms.length === 0 ? (
							<View style={styles.emptyState}>
								<Text style={styles.emptyEmoji}>🏋️</Text>
								<Text style={styles.emptyTitle}>{t('gymPass', 'noGyms')}</Text>
								<Text style={styles.emptySubtitle}>{t('gymPass', 'comingSoon')}</Text>
							</View>
						) : (
							gyms.map(g => (
								<GymCard key={g._id} gym={g} onBuy={setSelectedGym} />
							))
						)}
					</Animated.View>
					<View style={{ height: 40 }} />
				</ScrollView>
			)}

			{selectedGym && (
				<PurchaseModal
					gym={selectedGym}
					visible={!!selectedGym}
					onClose={() => setSelectedGym(null)}
					onSuccess={() => router.push('/(routes)/gym-pass')}
				/>
			)}
		</SafeAreaView>
	)
}

// ─── Modal styles ─────────────────────────────────────────────────────────────

const modalStyles = StyleSheet.create({
	overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
	sheet: {
		backgroundColor: COLORS.card,
		borderTopLeftRadius: 24,
		borderTopRightRadius: 24,
		padding: 24,
		paddingBottom: 40,
	},
	handle: { width: 36, height: 4, backgroundColor: COLORS.border, borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
	title: { fontSize: 20, fontWeight: '800', color: COLORS.text, marginBottom: 4 },
	subtitle: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 20 },
	planRow: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 14,
		paddingHorizontal: 16,
		borderRadius: 12,
		marginBottom: 8,
		backgroundColor: COLORS.cardLight,
		borderWidth: 1,
		borderColor: 'transparent',
	},
	planRowSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '10' },
	radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: COLORS.textSecondary, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
	radioSelected: { borderColor: COLORS.primary },
	radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.primary },
	planLabel: { flex: 1, fontSize: 15, fontWeight: '600', color: COLORS.text },
	planLabelSelected: { color: COLORS.primary },
	planPrice: { fontSize: 15, fontWeight: '700', color: COLORS.textSecondary },
	planPriceSelected: { color: COLORS.primary },
	buyBtn: {
		backgroundColor: COLORS.primary,
		borderRadius: 14,
		paddingVertical: 16,
		alignItems: 'center',
		marginTop: 16,
	},
	buyBtnText: { color: '#000', fontWeight: '800', fontSize: 16 },
})

// ─── Gym card & screen styles ─────────────────────────────────────────────────

const styles = StyleSheet.create({
	safeArea: { flex: 1, backgroundColor: COLORS.background },
	header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
	backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
	headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
	searchContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: COLORS.card,
		borderRadius: 12,
		marginHorizontal: 20,
		paddingHorizontal: 14,
		paddingVertical: 10,
		borderWidth: 1,
		borderColor: COLORS.border,
		marginBottom: 12,
	},
	searchInput: { flex: 1, color: COLORS.text, fontSize: 15 },
	scrollContent: { paddingHorizontal: 20, paddingTop: 4 },

	gymCard: { backgroundColor: COLORS.card, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
	gymCardHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
	gymNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
	gymName: { fontSize: 17, fontWeight: '700', color: COLORS.text, flex: 1 },
	statusBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
	statusOpen: { backgroundColor: 'rgba(52,199,89,0.15)' },
	statusClosed: { backgroundColor: 'rgba(255,59,48,0.12)' },
	statusText: { fontSize: 11, fontWeight: '700' },
	statusOpenText: { color: COLORS.primary },
	statusClosedText: { color: COLORS.error },
	gymAddressRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
	gymAddress: { fontSize: 12, color: COLORS.textSecondary, flex: 1 },

	amenitiesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
	amenityChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.cardLight, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
	amenityIcon: { fontSize: 12 },
	amenityLabel: { fontSize: 11, color: COLORS.textSecondary },

	pricesRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
	priceChip: { backgroundColor: COLORS.cardLight, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
	priceChipText: { fontSize: 12, fontWeight: '600', color: COLORS.text },

	buyBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 12 },
	buyBtnText: { color: '#000', fontWeight: '800', fontSize: 15 },

	emptyState: { alignItems: 'center', paddingTop: 100 },
	emptyEmoji: { fontSize: 56, marginBottom: 16 },
	emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, textAlign: 'center', marginBottom: 8 },
	emptySubtitle: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', paddingHorizontal: 40 },
})
