import { useLanguage } from '@/contexts/language-context'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
	ActivityIndicator,
	Alert,
	Linking,
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
	ProductSubscription,
	endConnection,
	initConnection,
	purchaseErrorListener,
	purchaseUpdatedListener,
	requestPurchase,
} from 'react-native-iap'
import { fetchPremiumSubscriptions } from '@/services/iap-products'
import { getStorefrontPrice } from '@/services/iap-price'
import { syncAlreadyOwnedSubscription, verifySubscriptionOnServer } from '@/services/subscription-verify'
import { useAuth } from '../contexts/auth-context'

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
	const { dismissTrialPaywall, refreshProfile } = useAuth()
	const { t } = useLanguage()

	const [products, setProducts] = useState<ProductSubscription[]>([])
	const [storeReady, setStoreReady] = useState(false)
	const [selectedSku, setSelectedSku] = useState<string>(SKUS.yearly)
	const [loading, setLoading] = useState(false)
	const [initializing, setInitializing] = useState(true)

	const purchaseUpdateSub = useRef<any>(null)
	const purchaseErrorSub = useRef<any>(null)

	// ── Purchase handler ─────────────────────────────────────────────────────
	const handlePurchase = useCallback(
		async (purchase: Purchase) => {
			const result = await verifySubscriptionOnServer(purchase)
			if (result.ok) {
				await refreshProfile()
				await dismissTrialPaywall()
				router.replace('/(tabs)')
			} else {
				const msg =
					result.message === 'noReceipt' ? t('trial', 'noReceipt') : result.message
				Alert.alert(t('common', 'error'), msg)
				setLoading(false)
			}
		},
		[dismissTrialPaywall, refreshProfile, t],
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

				purchaseErrorSub.current = purchaseErrorListener(async (error: any) => {
					if (
						error.code === ErrorCode.UserCancelled ||
						error.code === 'E_USER_CANCELLED'
					) {
						setLoading(false)
						return
					}
					if (error.code === ErrorCode.AlreadyOwned) {
						const r = await syncAlreadyOwnedSubscription()
						if (r.ok) {
							await refreshProfile()
							await dismissTrialPaywall()
							router.replace('/(tabs)')
						} else {
							Alert.alert(
								t('subscription', 'purchaseError'),
								t('subscription', 'restoreEmpty'),
							)
						}
						setLoading(false)
						return
					}
					Alert.alert(t('subscription', 'purchaseError'), error.message)
					setLoading(false)
				})

				const subs = await fetchPremiumSubscriptions()

				if (mounted) {
					if (subs.length) {
						setProducts(subs)
						setStoreReady(true)
					} else {
						setProducts([])
						setStoreReady(false)
						console.warn('[IAP] No subscription products after retries + fallback')
					}
				}
			} catch (e) {
				console.warn('[IAP] fetchProducts error:', e)
				if (mounted) {
					setProducts([])
					setStoreReady(false)
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
	}, [handlePurchase, t, dismissTrialPaywall, refreshProfile])

	// ── Buy ───────────────────────────────────────────────────────────────────
	const buySubscription = async () => {
		if (loading) return

		if (!storeReady || !products.length) {
			Alert.alert(
				t('common', 'error'),
				t('trial', 'storeUnavailable'),
			)
			return
		}

		setLoading(true)
		try {
			console.log('[IAP] requestPurchase subs sku:', selectedSku)

			if (Platform.OS === 'ios') {
				await requestPurchase({
					type: 'subs',
					request: {
						apple: {
							sku: selectedSku,
							andDangerouslyFinishTransactionAutomatically: false,
						},
					},
				})
			} else {
				const prod = products.find(p => p.id === selectedSku)
				const offers =
					prod?.platform === 'android' ? prod.subscriptionOffers ?? [] : []
				const token =
					offers.find(o => o.offerTokenAndroid)?.offerTokenAndroid
					?? offers[0]?.offerTokenAndroid
				if (!token) {
					Alert.alert(t('common', 'error'), t('trial', 'androidOfferMissing'))
					setLoading(false)
					return
				}
				await requestPurchase({
					type: 'subs',
					request: {
						google: {
							skus: [selectedSku],
							subscriptionOffers: [
								{ sku: selectedSku, offerToken: token },
							],
						},
					},
				})
			}
			// Purchase completes via purchaseUpdatedListener; do not setLoading(false) here
		} catch (error: any) {
			console.log('[IAP] error code:', error.code, error.message)
			if (
				error.code !== ErrorCode.UserCancelled &&
				error.code !== 'E_USER_CANCELLED'
			) {
				Alert.alert(t('common', 'error'), error.message ?? String(error))
			}
			setLoading(false)
		}
	}

	// ── Skip (limited access, no trial) ──────────────────────────────────────
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
						// Limited access — do NOT start trial without StoreKit purchase
						await dismissTrialPaywall()
						router.replace('/(tabs)')
					},
				},
			],
		)
	}

	// ── UI helpers ────────────────────────────────────────────────────────────
	const getPrice = (sku: string) => {
		const product = products.find(p => p.id === sku)
		return getStorefrontPrice(product)
	}

	const getTitle = (sku: string) => {
		const product = products.find(p => p.id === sku)
		if (!product) return sku === SKUS.monthly ? t('trial', 'monthly') : t('trial', 'yearly')
		return product.title
			?.replace(/\(.*\)/, '')
			.trim()
			?? (sku === SKUS.monthly ? t('trial', 'monthly') : t('trial', 'yearly'))
	}

	const getDescription = (sku: string) => {
		const product = products.find(p => p.id === sku)
		return product?.description ?? ''
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
			<View style={styles.topCloseBar}>
				<TouchableOpacity
					onPress={skipForNow}
					hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
					activeOpacity={0.7}
					accessibilityRole='button'
					accessibilityLabel={t('trial', 'skipLimited')}
				>
					<Ionicons name='close' size={28} color={COLORS.textSecondary} />
				</TouchableOpacity>
			</View>
			<ScrollView
				contentContainerStyle={styles.scroll}
				showsVerticalScrollIndicator={false}
			>
			{/* Hero */}
			<LinearGradient
				colors={['#0D1F0D', '#0A0A0A']}
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

				{/* Timeline */}
				<View style={styles.timeline}>
					<View style={styles.timelineStep}>
						<View style={[styles.timelineDot, { backgroundColor: COLORS.primary }]}>
							<Ionicons name='card-outline' size={14} color='#fff' />
						</View>
						<Text style={styles.timelineTitle}>{t('trial', 'timelineCard')}</Text>
						<Text style={styles.timelineDesc}>{t('trial', 'timelineCardDesc')}</Text>
					</View>
					<View style={styles.timelineLine} />
					<View style={styles.timelineStep}>
						<View style={[styles.timelineDot, { backgroundColor: COLORS.accent }]}>
							<Ionicons name='trophy-outline' size={14} color='#fff' />
						</View>
						<Text style={styles.timelineTitle}>{TRIAL_DAYS} {t('trial', 'timelineDays')}</Text>
						<Text style={styles.timelineDesc}>{t('trial', 'timelineFree')}</Text>
					</View>
					<View style={styles.timelineLine} />
					<View style={styles.timelineStep}>
						<View style={[styles.timelineDot, { backgroundColor: '#8E8E93' }]}>
							<Ionicons name='refresh-outline' size={14} color='#fff' />
						</View>
						<Text style={styles.timelineTitle}>{t('trial', 'timelineCharge')}</Text>
						<Text style={styles.timelineDesc}>{t('trial', 'timelineChargeDesc')}</Text>
					</View>
				</View>

				<View style={styles.noChargeRow}>
					<Ionicons name='checkmark-circle' size={16} color={COLORS.primary} />
					<Text style={styles.noChargeText}>{t('trial', 'noChargeToday')}</Text>
				</View>
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
							<Text style={styles.planName}>{t('trial', 'trialFreeLabel')}</Text>
							<Text style={styles.planTrialSub}>
								{t('trial', 'thenPay')} {yearlyPrice} / {t('trial', 'yearShort')}
							</Text>
						</View>
						<View style={styles.planPriceWrap}>
							<Text style={styles.planPriceFree}>{t('trial', 'free')}</Text>
							<Text style={styles.planPriceSub}>{TRIAL_DAYS} {t('trial', 'days')}</Text>
						</View>
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
							<Text style={styles.planName}>{t('trial', 'trialFreeLabel')}</Text>
							<Text style={styles.planTrialSub}>
								{t('trial', 'thenPay')} {monthlyPrice} / {t('trial', 'monthShort')}
							</Text>
						</View>
						<View style={styles.planPriceWrap}>
							<Text style={styles.planPriceFree}>{t('trial', 'free')}</Text>
							<Text style={styles.planPriceSub}>{TRIAL_DAYS} {t('trial', 'days')}</Text>
						</View>
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
								<View style={styles.ctaInner}>
									<Ionicons name='card-outline' size={20} color='#fff' />
									<Text style={styles.ctaText}>{t('trial', 'ctaNew')}</Text>
								</View>
								<Text style={styles.ctaSubtext}>{t('trial', 'ctaNewSub')}</Text>
							</>
						)}
						</LinearGradient>
					</TouchableOpacity>

				<Text style={styles.legalText}>{t('trial', 'legal')}</Text>

				{/* Required EULA + Privacy links for App Store compliance */}
				<View style={styles.linksRow}>
					<TouchableOpacity onPress={() => Linking.openURL('https://www.apple.com/legal/internet-services/itunes/dev/stdeula/')}>
						<Text style={styles.linkText}>{t('trial', 'termsLink')}</Text>
					</TouchableOpacity>
					<Text style={styles.linkSep}> · </Text>
					<TouchableOpacity onPress={() => Linking.openURL('https://github.com/mehebbetfz/fitex/blob/main/fitex-mobile/fitex/privacy-policy.md')}>
						<Text style={styles.linkText}>{t('trial', 'privacyLink')}</Text>
					</TouchableOpacity>
				</View>

				<TouchableOpacity onPress={skipForNow} style={styles.skipButton}>
					<Text style={styles.skipText}>{t('trial', 'skipLimited')}</Text>
				</TouchableOpacity>
				</View>
			</ScrollView>
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
	topCloseBar: {
		flexDirection: 'row',
		justifyContent: 'flex-end',
		alignItems: 'center',
		paddingHorizontal: 8,
		paddingVertical: 4,
	},

	// Hero
	hero: {
		alignItems: 'center',
		paddingTop: 8,
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

	// Timeline
	timeline: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		marginTop: 24,
		marginBottom: 16,
		paddingHorizontal: 8,
	},
	timelineStep: {
		flex: 1,
		alignItems: 'center',
		gap: 6,
	},
	timelineDot: {
		width: 36,
		height: 36,
		borderRadius: 18,
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: 4,
	},
	timelineTitle: {
		fontSize: 12,
		fontWeight: '700',
		color: '#fff',
		textAlign: 'center',
	},
	timelineDesc: {
		fontSize: 11,
		color: COLORS.textSecondary,
		textAlign: 'center',
		lineHeight: 14,
	},
	timelineLine: {
		flex: 0,
		width: 28,
		height: 2,
		backgroundColor: 'rgba(255,255,255,0.15)',
		marginTop: 17,
	},
	noChargeRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
		backgroundColor: 'rgba(52,199,89,0.12)',
		paddingHorizontal: 14,
		paddingVertical: 8,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: 'rgba(52,199,89,0.25)',
	},
	noChargeText: {
		fontSize: 13,
		color: COLORS.primary,
		fontWeight: '600',
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
		fontSize: 15,
		fontWeight: '700',
		color: COLORS.text,
	},
	planDesc: {
		fontSize: 13,
		color: COLORS.textSecondary,
		marginTop: 2,
	},
	planTrialSub: {
		fontSize: 12,
		color: COLORS.textSecondary,
		marginTop: 3,
	},
	planPriceWrap: {
		alignItems: 'flex-end',
	},
	planPriceFree: {
		fontSize: 18,
		fontWeight: '800',
		color: COLORS.primary,
	},
	planPriceSub: {
		fontSize: 11,
		color: COLORS.textSecondary,
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
	ctaInner: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
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
	linksRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		marginTop: 10,
		marginBottom: 4,
	},
	linkText: {
		fontSize: 12,
		color: '#5AC8FA',
		textDecorationLine: 'underline',
	},
	linkSep: {
		fontSize: 12,
		color: COLORS.textSecondary,
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
})
