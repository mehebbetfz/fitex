import { useLanguage } from '@/contexts/language-context'
import { api } from '@/services/api'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
	ActivityIndicator,
	Alert,
	Dimensions,
	Platform,
	SafeAreaView,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native'
import {
	ErrorCode,
	Purchase,
	Subscription,
	endConnection,
	finishTransaction,
	getSubscriptions,
	initConnection,
	purchaseErrorListener,
	purchaseUpdatedListener,
	requestSubscription,
} from 'react-native-iap'
import { useAuth } from '../contexts/auth-context'

const { width } = Dimensions.get('window')

const COLORS = {
	primary: '#34C759',
	background: '#0A0A0A',
	card: '#1C1C1E',
	border: '#2C2C2E',
	text: '#FFFFFF',
	textSecondary: '#8E8E93',
	accent: '#FF9500',
	gold: '#FFD700',
	purple: '#AF52DE',
} as const

const SKUS = {
	monthly: 'premium_monthly',
	yearly: 'premium_yearly',
}

const TRIAL_DAYS = 30

export default function TrialPaywallScreen() {
	const { startTrial, updateUser } = useAuth()
	const { t } = useLanguage()

	const [products, setProducts] = useState<Subscription[]>([])
	const [selectedSku, setSelectedSku] = useState<string>(SKUS.yearly)
	const [loading, setLoading] = useState(false)
	const [initializing, setInitializing] = useState(true)

	const purchaseUpdateSub = useRef<any>(null)
	const purchaseErrorSub = useRef<any>(null)

	// ── Purchase handler ─────────────────────────────────────────────────────
	const handlePurchase = useCallback(
		async (purchase: Purchase) => {
			const receipt =
				Platform.OS === 'ios'
					? (purchase as any).transactionReceipt
					: purchase.purchaseToken

			if (!receipt) {
				Alert.alert(t('common', 'error'), t('trial', 'noReceipt'))
				setLoading(false)
				return
			}

			try {
				const response = await api.post('/subscription/verify', {
					receipt,
					productId: purchase.productId,
					platform: Platform.OS,
					transactionId: purchase.transactionId,
				})

				if (response.data?.success) {
					await finishTransaction({ purchase, isConsumable: false })
					await updateUser({ isPremium: true })
					await startTrial()
					router.replace('/(tabs)')
				} else {
					Alert.alert(t('common', 'error'), response.data?.message || t('subscription', 'purchaseError'))
					setLoading(false)
				}
			} catch {
				Alert.alert(t('common', 'error'), t('subscription', 'purchaseError'))
				setLoading(false)
			}
		},
		[startTrial, updateUser, t],
	)

	// ── IAP init ─────────────────────────────────────────────────────────────
	useEffect(() => {
		let mounted = true

		const init = async () => {
			try {
				await initConnection()

				purchaseUpdateSub.current = purchaseUpdatedListener(async purchase => {
					await handlePurchase(purchase)
				})

				purchaseErrorSub.current = purchaseErrorListener((error: any) => {
					if (error.code !== ErrorCode.UserCancelled) {
						Alert.alert(t('subscription', 'purchaseError'), error.message)
					}
					setLoading(false)
				})

				const items = await getSubscriptions({
					skus: [SKUS.monthly, SKUS.yearly],
				})

				if (mounted) {
					if (items?.length) {
						// Sort: yearly first
						const sorted = [...items].sort((a, b) =>
							a.productId === SKUS.yearly ? -1 : 1
						)
						setProducts(sorted)
					} else {
						setProducts([
							{ productId: SKUS.monthly, title: t('trial', 'monthly'), localizedPrice: '$4.99' } as any,
							{ productId: SKUS.yearly, title: t('trial', 'yearly'), localizedPrice: '$39.99' } as any,
						])
					}
				}
			} catch (e) {
				console.warn('[IAP] getSubscriptions error:', e)
				if (mounted) {
					setProducts([
						{ productId: SKUS.monthly, title: t('trial', 'monthly'), localizedPrice: '$4.99' } as any,
						{ productId: SKUS.yearly, title: t('trial', 'yearly'), localizedPrice: '$39.99' } as any,
					])
				}
			} finally {
				if (mounted) setInitializing(false)
			}
		}

		init()

		return () => {
			mounted = false
			purchaseUpdateSub.current?.remove()
			purchaseErrorSub.current?.remove()
			endConnection()
		}
	}, [handlePurchase, t])

	// ── Buy ───────────────────────────────────────────────────────────────────
	const buySubscription = async () => {
		if (loading) return
		setLoading(true)
		try {
			await requestSubscription({
				sku: selectedSku,
				andDangerouslyFinishTransactionAutomaticallyIOS: false,
			})
		} catch (error: any) {
			if (error.code !== ErrorCode.E_USER_CANCELLED) {
				Alert.alert(t('common', 'error'), error.message)
			}
			setLoading(false)
		}
	}

	// ── Skip (use only 30-day countdown without IAP) ─────────────────────────
	const skipForNow = () => {
		Alert.alert(
			t('trial', 'skipTitle'),
			t('trial', 'skipBody'),
			[
				{ text: t('common', 'cancel'), style: 'cancel' },
				{
					text: t('trial', 'skipConfirm'),
					style: 'destructive',
					onPress: async () => {
						// Give a non-premium 30-day trial without IAP (limited features)
						await startTrial()
						router.replace('/(tabs)')
					},
				},
			],
		)
	}

	// ── UI helpers ────────────────────────────────────────────────────────────
	const getPrice = (sku: string) => {
		const product = products.find(p => p.productId === sku)
		if (!product) return '—'
		// react-native-iap v14 on iOS returns localizedPrice
		// Android returns price
		return (product as any).localizedPrice
			?? (product as any).price
			?? '—'
	}

	const getTitle = (sku: string) => {
		const product = products.find(p => p.productId === sku)
		if (!product) return sku === SKUS.monthly ? t('trial', 'monthly') : t('trial', 'yearly')
		return (product as any).title
			?.replace(/\(.*\)/, '')
			.trim()
			?? (sku === SKUS.monthly ? t('trial', 'monthly') : t('trial', 'yearly'))
	}

	const getDescription = (sku: string) => {
		const product = products.find(p => p.productId === sku)
		return (product as any).description ?? ''
	}

	if (initializing) {
		return (
			<SafeAreaView style={styles.loadingContainer}>
				<ActivityIndicator size='large' color={COLORS.primary} />
			</SafeAreaView>
		)
	}

	const monthlyPrice = getPrice(SKUS.monthly)
	const yearlyPrice = getPrice(SKUS.yearly)

	return (
		<SafeAreaView style={styles.container}>
			<ScrollView
				contentContainerStyle={styles.scroll}
				showsVerticalScrollIndicator={false}
			>
				{/* Hero */}
				<LinearGradient
					colors={['#1A2B1A', '#0A0A0A']}
					style={styles.hero}
				>
					<View style={styles.badgeRow}>
						<View style={styles.badge}>
							<Ionicons name='shield-checkmark' size={14} color={COLORS.primary} />
							<Text style={styles.badgeText}>{t('trial', 'badge')}</Text>
						</View>
					</View>

					<Text style={styles.heroTitle}>{t('trial', 'heroTitle')}</Text>
					<Text style={styles.heroSubtitle}>{t('trial', 'heroSubtitle')}</Text>

					<View style={styles.trialBubble}>
						<Text style={styles.trialDays}>{TRIAL_DAYS}</Text>
						<Text style={styles.trialLabel}>{t('trial', 'days')}</Text>
					</View>
					<Text style={styles.trialFree}>{t('trial', 'freeLabel')}</Text>
				</LinearGradient>

				{/* Features */}
				<View style={styles.featuresSection}>
				<Text style={styles.sectionTitle}>{t('trial', 'featuresTitle')}</Text>
				{FEATURES.map(f => (
					<FeatureRow key={f.icon} icon={f.icon} text={t('subscription', f.key as any)} color={f.color} />
				))}
				</View>

				{/* Plan selector */}
				<View style={styles.plansSection}>
					<Text style={styles.sectionTitle}>{t('trial', 'choosePlan')}</Text>

					<TouchableOpacity
						style={[styles.planCard, selectedSku === SKUS.yearly && styles.planCardSelected]}
						onPress={() => setSelectedSku(SKUS.yearly)}
						activeOpacity={0.8}
					>
						<View style={styles.planBestValue}>
							<Text style={styles.planBestValueText}>{t('subscription', 'bestValue')}</Text>
						</View>
						<View style={styles.planRow}>
							<View style={styles.planRadio}>
								{selectedSku === SKUS.yearly && <View style={styles.planRadioDot} />}
							</View>
							<View style={styles.planInfo}>
								<Text style={styles.planName}>{getTitle(SKUS.yearly)}</Text>
								<Text style={styles.planDesc}>{getDescription(SKUS.yearly) || t('trial', 'yearlySave')}</Text>
							</View>
							<Text style={styles.planPrice}>{yearlyPrice}</Text>
						</View>
					</TouchableOpacity>

					<TouchableOpacity
						style={[styles.planCard, selectedSku === SKUS.monthly && styles.planCardSelected]}
						onPress={() => setSelectedSku(SKUS.monthly)}
						activeOpacity={0.8}
					>
						<View style={styles.planRow}>
							<View style={styles.planRadio}>
								{selectedSku === SKUS.monthly && <View style={styles.planRadioDot} />}
							</View>
							<View style={styles.planInfo}>
								<Text style={styles.planName}>{getTitle(SKUS.monthly)}</Text>
								<Text style={styles.planDesc}>{getDescription(SKUS.monthly) || t('trial', 'monthlyDesc')}</Text>
							</View>
							<Text style={styles.planPrice}>{monthlyPrice}</Text>
						</View>
					</TouchableOpacity>
				</View>

				{/* CTA */}
				<View style={styles.ctaSection}>
					<TouchableOpacity
						style={styles.ctaButton}
						onPress={buySubscription}
						disabled={loading}
						activeOpacity={0.85}
					>
						<LinearGradient
							colors={['#34C759', '#28A745']}
							start={{ x: 0, y: 0 }}
							end={{ x: 1, y: 0 }}
							style={styles.ctaGradient}
						>
							{loading ? (
								<ActivityIndicator color='#fff' />
							) : (
								<>
									<Text style={styles.ctaText}>{t('trial', 'cta')}</Text>
									<Text style={styles.ctaSubtext}>{t('trial', 'ctaSub')}</Text>
								</>
							)}
						</LinearGradient>
					</TouchableOpacity>

					<Text style={styles.legalText}>{t('trial', 'legal')}</Text>

					<TouchableOpacity onPress={skipForNow} style={styles.skipButton}>
						<Text style={styles.skipText}>{t('trial', 'skipLink')}</Text>
					</TouchableOpacity>
				</View>
			</ScrollView>

			{loading && (
				<View style={styles.loadingOverlay}>
					<ActivityIndicator size='large' color={COLORS.primary} />
				</View>
			)}
		</SafeAreaView>
	)
}

// ── Feature list ──────────────────────────────────────────────────────────────
const FEATURES = [
	{ icon: 'ribbon-outline',       key: 'feature1', color: '#FFD700' },
	{ icon: 'podium-outline',        key: 'feature4', color: '#FF9500' },
	{ icon: 'cloud-upload-outline',  key: 'feature2', color: '#5AC8FA' },
	{ icon: 'analytics-outline',     key: 'feature3', color: '#AF52DE' },
	{ icon: 'body-outline',          key: 'feature5', color: '#34C759' },
]

function FeatureRow({ icon, text, color }: { icon: string; text: string; color: string }) {
	return (
		<View style={styles.featureRow}>
			<View style={[styles.featureIconWrap, { backgroundColor: `${color}20` }]}>
				<Ionicons name={icon as any} size={20} color={color} />
			</View>
			<Text style={styles.featureText}>{text}</Text>
			<View style={[styles.featureCheck, { backgroundColor: `${color}18` }]}>
				<Ionicons name='checkmark' size={14} color={color} />
			</View>
		</View>
	)
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: COLORS.background,
	},
	loadingContainer: {
		flex: 1,
		backgroundColor: COLORS.background,
		justifyContent: 'center',
		alignItems: 'center',
	},
	scroll: {
		paddingBottom: 40,
	},

	// Hero
	hero: {
		alignItems: 'center',
		paddingTop: 48,
		paddingBottom: 36,
		paddingHorizontal: 24,
	},
	badgeRow: {
		marginBottom: 16,
	},
	badge: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
		backgroundColor: 'rgba(52,199,89,0.15)',
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 20,
		borderWidth: 1,
		borderColor: 'rgba(52,199,89,0.3)',
	},
	badgeText: {
		fontSize: 12,
		fontWeight: '600',
		color: COLORS.primary,
		letterSpacing: 0.5,
		textTransform: 'uppercase',
	},
	heroTitle: {
		fontSize: 32,
		fontWeight: '800',
		color: COLORS.text,
		textAlign: 'center',
		letterSpacing: -0.5,
		marginBottom: 8,
	},
	heroSubtitle: {
		fontSize: 16,
		color: COLORS.textSecondary,
		textAlign: 'center',
		lineHeight: 22,
		marginBottom: 32,
	},
	trialBubble: {
		width: 120,
		height: 120,
		borderRadius: 60,
		backgroundColor: COLORS.primary,
		justifyContent: 'center',
		alignItems: 'center',
		shadowColor: COLORS.primary,
		shadowOffset: { width: 0, height: 8 },
		shadowOpacity: 0.4,
		shadowRadius: 16,
		elevation: 12,
		marginBottom: 12,
	},
	trialDays: {
		fontSize: 48,
		fontWeight: '900',
		color: '#fff',
		lineHeight: 52,
	},
	trialLabel: {
		fontSize: 13,
		fontWeight: '600',
		color: 'rgba(255,255,255,0.85)',
		textTransform: 'uppercase',
		letterSpacing: 1,
	},
	trialFree: {
		fontSize: 18,
		fontWeight: '700',
		color: COLORS.primary,
	},

	// Features
	featuresSection: {
		paddingHorizontal: 20,
		paddingTop: 28,
		paddingBottom: 8,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: '700',
		color: COLORS.text,
		marginBottom: 16,
	},
	featureRow: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 12,
		borderBottomWidth: 1,
		borderBottomColor: COLORS.border,
	},
	featureIconWrap: {
		width: 36,
		height: 36,
		borderRadius: 10,
		backgroundColor: 'rgba(52,199,89,0.12)',
		justifyContent: 'center',
		alignItems: 'center',
		marginRight: 12,
	},
	featureCheck: {
		width: 26, height: 26, borderRadius: 8,
		alignItems: 'center', justifyContent: 'center',
	},
	featureText: {
		flex: 1,
		fontSize: 15,
		color: COLORS.text,
		fontWeight: '500',
	},

	// Plans
	plansSection: {
		paddingHorizontal: 20,
		paddingTop: 28,
		paddingBottom: 8,
	},
	planCard: {
		backgroundColor: COLORS.card,
		borderRadius: 16,
		padding: 16,
		marginBottom: 12,
		borderWidth: 2,
		borderColor: COLORS.border,
	},
	planCardSelected: {
		borderColor: COLORS.primary,
		backgroundColor: 'rgba(52,199,89,0.05)',
	},
	planBestValue: {
		alignSelf: 'flex-start',
		backgroundColor: COLORS.primary,
		paddingHorizontal: 8,
		paddingVertical: 3,
		borderRadius: 6,
		marginBottom: 10,
	},
	planBestValueText: {
		fontSize: 11,
		fontWeight: '700',
		color: '#fff',
		textTransform: 'uppercase',
		letterSpacing: 0.5,
	},
	planRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
	},
	planRadio: {
		width: 20,
		height: 20,
		borderRadius: 10,
		borderWidth: 2,
		borderColor: COLORS.primary,
		justifyContent: 'center',
		alignItems: 'center',
	},
	planRadioDot: {
		width: 10,
		height: 10,
		borderRadius: 5,
		backgroundColor: COLORS.primary,
	},
	planInfo: {
		flex: 1,
	},
	planName: {
		fontSize: 16,
		fontWeight: '700',
		color: COLORS.text,
	},
	planDesc: {
		fontSize: 13,
		color: COLORS.textSecondary,
		marginTop: 2,
	},
	planPrice: {
		fontSize: 17,
		fontWeight: '700',
		color: COLORS.text,
	},

	// CTA
	ctaSection: {
		paddingHorizontal: 20,
		paddingTop: 28,
		alignItems: 'center',
	},
	ctaButton: {
		width: '100%',
		borderRadius: 16,
		overflow: 'hidden',
		shadowColor: COLORS.primary,
		shadowOffset: { width: 0, height: 6 },
		shadowOpacity: 0.35,
		shadowRadius: 12,
		elevation: 8,
	},
	ctaGradient: {
		paddingVertical: 18,
		alignItems: 'center',
		justifyContent: 'center',
	},
	ctaText: {
		fontSize: 18,
		fontWeight: '800',
		color: '#fff',
		letterSpacing: 0.3,
	},
	ctaSubtext: {
		fontSize: 13,
		color: 'rgba(255,255,255,0.75)',
		marginTop: 2,
	},
	legalText: {
		fontSize: 12,
		color: COLORS.textSecondary,
		textAlign: 'center',
		marginTop: 16,
		lineHeight: 17,
		paddingHorizontal: 8,
	},
	skipButton: {
		paddingVertical: 12,
		paddingHorizontal: 24,
		marginTop: 4,
	},
	skipText: {
		fontSize: 14,
		color: COLORS.textSecondary,
		textDecorationLine: 'underline',
	},

	// Loading overlay
	loadingOverlay: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: 'rgba(0,0,0,0.6)',
		justifyContent: 'center',
		alignItems: 'center',
	},
})
