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
import type { Purchase, ProductSubscription } from 'react-native-iap'
import { fetchPremiumSubscriptions } from '@/services/iap-products'
import { getReactNativeIap } from '@/services/iap-runtime'
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
	gold: '#E8C547',
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
				router.replace('/')
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
			const iap = getReactNativeIap()
			if (!iap) {
				if (mounted) {
					setProducts([])
					setStoreReady(false)
					setInitializing(false)
				}
				return
			}

			const {
				initConnection,
				purchaseUpdatedListener,
				purchaseErrorListener,
				endConnection,
				ErrorCode,
			} = iap

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
							router.replace('/')
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
			const iap = getReactNativeIap()
			if (iap) void iap.endConnection()
		}
	}, [handlePurchase, t, dismissTrialPaywall, refreshProfile])

	// ── Buy ───────────────────────────────────────────────────────────────────
	const buySubscription = async () => {
		if (loading) return

		const iap = getReactNativeIap()
		if (!iap) {
			Alert.alert(
				t('common', 'error'),
				t('trial', 'storeUnavailable'),
			)
			return
		}

		if (!storeReady || !products.length) {
			Alert.alert(
				t('common', 'error'),
				t('trial', 'storeUnavailable'),
			)
			return
		}

		setLoading(true)
		try {
			const { requestPurchase } = iap
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
			const EC = iap.ErrorCode
			console.log('[IAP] error code:', error.code, error.message)
			if (error.code !== EC.UserCancelled && error.code !== 'E_USER_CANCELLED') {
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
						router.replace('/')
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
		<View style={styles.root}>
			<LinearGradient
				colors={['#122A1A', '#0A0A0A', '#0A0A0A']}
				locations={[0, 0.38, 1]}
				style={StyleSheet.absoluteFill}
			/>
			<SafeAreaView style={styles.container}>
				<View style={styles.topCloseBar}>
					<TouchableOpacity
						onPress={skipForNow}
						hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
						activeOpacity={0.7}
						style={styles.closeBtn}
						accessibilityRole='button'
						accessibilityLabel={t('trial', 'skipLimited')}
					>
						<Ionicons name='close' size={20} color='rgba(255,255,255,0.65)' />
					</TouchableOpacity>
				</View>
				<ScrollView
					contentContainerStyle={styles.scroll}
					showsVerticalScrollIndicator={false}
				>
					<View style={styles.hero}>
						<View style={styles.badge}>
							<Ionicons name='sparkles' size={13} color={COLORS.gold} />
							<Text style={styles.badgeText}>{t('trial', 'badge')}</Text>
						</View>

						<View style={styles.daysOrb}>
							<LinearGradient
								colors={['rgba(52,199,89,0.35)', 'rgba(52,199,89,0.08)']}
								style={styles.daysOrbGrad}
							>
								<Text style={styles.trialDays}>{TRIAL_DAYS}</Text>
								<Text style={styles.trialLabel}>{t('trial', 'days')}</Text>
							</LinearGradient>
						</View>

						<Text style={styles.heroTitle}>{t('trial', 'heroTitle')}</Text>
						<Text style={styles.heroSubtitle}>{t('trial', 'heroSubtitle')}</Text>

						<View style={styles.timeline}>
							{(
								[
									{
										icon: 'card-outline' as const,
										color: COLORS.primary,
										title: t('trial', 'timelineCard'),
										desc: t('trial', 'timelineCardDesc'),
									},
									{
										icon: 'trophy-outline' as const,
										color: COLORS.gold,
										title: `${TRIAL_DAYS} ${t('trial', 'timelineDays')}`,
										desc: t('trial', 'timelineFree'),
									},
									{
										icon: 'refresh-outline' as const,
										color: '#8E8E93',
										title: t('trial', 'timelineCharge'),
										desc: t('trial', 'timelineChargeDesc'),
									},
								] as const
							).map((step, i) => (
								<View key={step.title} style={styles.timelineCol}>
									{i > 0 ? <View style={styles.timelineConnector} /> : null}
									<View style={[styles.timelineDot, { backgroundColor: step.color }]}>
										<Ionicons name={step.icon} size={14} color='#fff' />
									</View>
									<Text style={styles.timelineTitle}>{step.title}</Text>
									<Text style={styles.timelineDesc}>{step.desc}</Text>
								</View>
							))}
						</View>

						<View style={styles.noChargeRow}>
							<Ionicons name='checkmark-circle' size={16} color={COLORS.primary} />
							<Text style={styles.noChargeText}>{t('trial', 'noChargeToday')}</Text>
						</View>
					</View>

					<View style={styles.featuresSection}>
						<Text style={styles.sectionTitle}>{t('trial', 'featuresTitle')}</Text>
						<View style={styles.featuresPanel}>
							{FEATURES.map(f => (
								<FeatureRow
									key={f.icon}
									icon={f.icon}
									text={t('subscription', f.key as any)}
									color={f.color}
								/>
							))}
						</View>
					</View>

					<View style={styles.plansSection}>
						<Text style={styles.sectionTitle}>{t('trial', 'choosePlan')}</Text>

						<TouchableOpacity
							style={[styles.planCard, selectedSku === SKUS.yearly && styles.planCardSelected]}
							onPress={() => setSelectedSku(SKUS.yearly)}
							activeOpacity={0.85}
						>
							<View style={styles.planBestValue}>
								<Text style={styles.planBestValueText}>{t('subscription', 'bestValue')}</Text>
							</View>
							<View style={styles.planRow}>
								<View style={[styles.planRadio, selectedSku === SKUS.yearly && styles.planRadioOn]}>
									{selectedSku === SKUS.yearly ? <View style={styles.planRadioDot} /> : null}
								</View>
								<View style={styles.planInfo}>
									<Text style={styles.planName}>{t('trial', 'trialFreeLabel')}</Text>
									<Text style={styles.planTrialSub}>
										{t('trial', 'thenPay')} {yearlyPrice} / {t('trial', 'yearShort')}
									</Text>
								</View>
								<View style={styles.planPriceWrap}>
									<Text style={styles.planPriceFree}>{t('trial', 'free')}</Text>
									<Text style={styles.planPriceSub}>
										{TRIAL_DAYS} {t('trial', 'days')}
									</Text>
								</View>
							</View>
						</TouchableOpacity>

						<TouchableOpacity
							style={[styles.planCard, selectedSku === SKUS.monthly && styles.planCardSelected]}
							onPress={() => setSelectedSku(SKUS.monthly)}
							activeOpacity={0.85}
						>
							<View style={styles.planRow}>
								<View style={[styles.planRadio, selectedSku === SKUS.monthly && styles.planRadioOn]}>
									{selectedSku === SKUS.monthly ? <View style={styles.planRadioDot} /> : null}
								</View>
								<View style={styles.planInfo}>
									<Text style={styles.planName}>{t('trial', 'trialFreeLabel')}</Text>
									<Text style={styles.planTrialSub}>
										{t('trial', 'thenPay')} {monthlyPrice} / {t('trial', 'monthShort')}
									</Text>
								</View>
								<View style={styles.planPriceWrap}>
									<Text style={styles.planPriceFree}>{t('trial', 'free')}</Text>
									<Text style={styles.planPriceSub}>
										{TRIAL_DAYS} {t('trial', 'days')}
									</Text>
								</View>
							</View>
						</TouchableOpacity>
					</View>

					<View style={styles.ctaSection}>
						<TouchableOpacity
							style={styles.ctaButton}
							onPress={buySubscription}
							disabled={loading}
							activeOpacity={0.85}
						>
							<LinearGradient
								colors={['#3DDB66', '#2FB350']}
								start={{ x: 0, y: 0 }}
								end={{ x: 1, y: 1 }}
								style={styles.ctaGradient}
							>
								{loading ? (
									<ActivityIndicator color='#06140A' />
								) : (
									<>
										<View style={styles.ctaInner}>
											<Ionicons name='diamond' size={18} color='#06140A' />
											<Text style={styles.ctaText}>{t('trial', 'ctaNew')}</Text>
										</View>
										<Text style={styles.ctaSubtext}>{t('trial', 'ctaNewSub')}</Text>
									</>
								)}
							</LinearGradient>
						</TouchableOpacity>

						<Text style={styles.legalText}>{t('trial', 'legal')}</Text>

						<View style={styles.linksRow}>
							<TouchableOpacity
								onPress={() =>
									Linking.openURL(
										'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/',
									)
								}
							>
								<Text style={styles.linkText}>{t('trial', 'termsLink')}</Text>
							</TouchableOpacity>
							<Text style={styles.linkSep}> · </Text>
							<TouchableOpacity
								onPress={() =>
									Linking.openURL(
										'https://github.com/mehebbetfz/fitex/blob/main/fitex-mobile/fitex/privacy-policy.md',
									)
								}
							>
								<Text style={styles.linkText}>{t('trial', 'privacyLink')}</Text>
							</TouchableOpacity>
						</View>

						<TouchableOpacity onPress={skipForNow} style={styles.skipButton}>
							<Text style={styles.skipText}>{t('trial', 'skipLimited')}</Text>
						</TouchableOpacity>
					</View>
				</ScrollView>
			</SafeAreaView>
		</View>
	)
}

const FEATURES = [
	{ icon: 'ribbon-outline', key: 'feature1', color: '#E8C547' },
	{ icon: 'podium-outline', key: 'feature4', color: '#FF9500' },
	{ icon: 'cloud-upload-outline', key: 'feature2', color: '#5AC8FA' },
	{ icon: 'analytics-outline', key: 'feature3', color: '#34C759' },
	{ icon: 'body-outline', key: 'feature5', color: '#34C759' },
]

function FeatureRow({ icon, text, color }: { icon: string; text: string; color: string }) {
	return (
		<View style={styles.featureRow}>
			<View style={[styles.featureIconWrap, { backgroundColor: `${color}18` }]}>
				<Ionicons name={icon as any} size={18} color={color} />
			</View>
			<Text style={styles.featureText}>{text}</Text>
			<Ionicons name='checkmark' size={16} color={COLORS.primary} />
		</View>
	)
}

const styles = StyleSheet.create({
	root: { flex: 1, backgroundColor: COLORS.background },
	container: { flex: 1, backgroundColor: 'transparent' },
	loadingContainer: {
		flex: 1,
		backgroundColor: COLORS.background,
		justifyContent: 'center',
		alignItems: 'center',
	},
	scroll: { paddingBottom: 48 },
	topCloseBar: {
		flexDirection: 'row',
		justifyContent: 'flex-end',
		alignItems: 'center',
		paddingHorizontal: 16,
		paddingVertical: 4,
	},
	closeBtn: {
		width: 36,
		height: 36,
		borderRadius: 18,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: 'rgba(255,255,255,0.06)',
	},
	hero: {
		alignItems: 'center',
		paddingTop: 4,
		paddingBottom: 28,
		paddingHorizontal: 24,
	},
	badge: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
		backgroundColor: 'rgba(232,197,71,0.12)',
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 20,
		borderWidth: 1,
		borderColor: 'rgba(232,197,71,0.28)',
		marginBottom: 18,
	},
	badgeText: {
		fontSize: 12,
		fontWeight: '700',
		color: COLORS.gold,
		letterSpacing: 0.6,
		textTransform: 'uppercase',
	},
	daysOrb: { marginBottom: 18 },
	daysOrbGrad: {
		width: 120,
		height: 120,
		borderRadius: 60,
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: 1,
		borderColor: 'rgba(52,199,89,0.35)',
	},
	trialDays: {
		fontSize: 44,
		fontWeight: '900',
		color: '#fff',
		lineHeight: 48,
		letterSpacing: -1,
	},
	trialLabel: {
		fontSize: 12,
		fontWeight: '700',
		color: 'rgba(255,255,255,0.7)',
		textTransform: 'uppercase',
		letterSpacing: 1.2,
	},
	heroTitle: {
		fontSize: 30,
		fontWeight: '800',
		color: COLORS.text,
		textAlign: 'center',
		letterSpacing: -0.6,
		marginBottom: 8,
	},
	heroSubtitle: {
		fontSize: 15,
		color: 'rgba(255,255,255,0.55)',
		textAlign: 'center',
		lineHeight: 22,
		marginBottom: 24,
	},
	timeline: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		marginBottom: 16,
		width: '100%',
	},
	timelineCol: {
		flex: 1,
		alignItems: 'center',
		gap: 6,
		position: 'relative',
	},
	timelineConnector: {
		position: 'absolute',
		left: -14,
		top: 17,
		width: 28,
		height: 2,
		backgroundColor: 'rgba(255,255,255,0.12)',
	},
	timelineDot: {
		width: 34,
		height: 34,
		borderRadius: 17,
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: 2,
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
	noChargeRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
		backgroundColor: 'rgba(52,199,89,0.12)',
		paddingHorizontal: 14,
		paddingVertical: 9,
		borderRadius: 14,
		borderWidth: 1,
		borderColor: 'rgba(52,199,89,0.25)',
	},
	noChargeText: {
		fontSize: 13,
		color: COLORS.primary,
		fontWeight: '600',
	},
	featuresSection: {
		paddingHorizontal: 20,
		paddingTop: 8,
		paddingBottom: 8,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: '700',
		color: COLORS.text,
		marginBottom: 14,
		letterSpacing: -0.2,
	},
	featuresPanel: {
		borderRadius: 18,
		backgroundColor: 'rgba(255,255,255,0.04)',
		borderWidth: 1,
		borderColor: 'rgba(255,255,255,0.06)',
		paddingHorizontal: 4,
		overflow: 'hidden',
	},
	featureRow: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 13,
		paddingHorizontal: 12,
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderBottomColor: 'rgba(255,255,255,0.06)',
	},
	featureIconWrap: {
		width: 34,
		height: 34,
		borderRadius: 10,
		justifyContent: 'center',
		alignItems: 'center',
		marginRight: 12,
	},
	featureText: {
		flex: 1,
		fontSize: 14,
		color: COLORS.text,
		fontWeight: '600',
	},
	plansSection: {
		paddingHorizontal: 20,
		paddingTop: 24,
		paddingBottom: 8,
	},
	planCard: {
		backgroundColor: 'rgba(255,255,255,0.04)',
		borderRadius: 18,
		padding: 16,
		marginBottom: 12,
		borderWidth: 1.5,
		borderColor: 'rgba(255,255,255,0.08)',
	},
	planCardSelected: {
		borderColor: COLORS.primary,
		backgroundColor: 'rgba(52,199,89,0.08)',
	},
	planBestValue: {
		alignSelf: 'flex-start',
		backgroundColor: COLORS.gold,
		paddingHorizontal: 9,
		paddingVertical: 3,
		borderRadius: 8,
		marginBottom: 10,
	},
	planBestValueText: {
		fontSize: 11,
		fontWeight: '800',
		color: '#1A1400',
		textTransform: 'uppercase',
		letterSpacing: 0.4,
	},
	planRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
	},
	planRadio: {
		width: 22,
		height: 22,
		borderRadius: 11,
		borderWidth: 2,
		borderColor: 'rgba(255,255,255,0.25)',
		justifyContent: 'center',
		alignItems: 'center',
	},
	planRadioOn: { borderColor: COLORS.primary },
	planRadioDot: {
		width: 10,
		height: 10,
		borderRadius: 5,
		backgroundColor: COLORS.primary,
	},
	planInfo: { flex: 1 },
	planName: {
		fontSize: 15,
		fontWeight: '700',
		color: COLORS.text,
	},
	planTrialSub: {
		fontSize: 12,
		color: COLORS.textSecondary,
		marginTop: 3,
	},
	planPriceWrap: { alignItems: 'flex-end' },
	planPriceFree: {
		fontSize: 18,
		fontWeight: '800',
		color: COLORS.primary,
	},
	planPriceSub: {
		fontSize: 11,
		color: COLORS.textSecondary,
	},
	ctaSection: {
		paddingHorizontal: 20,
		paddingTop: 24,
		alignItems: 'center',
	},
	ctaButton: {
		width: '100%',
		borderRadius: 18,
		overflow: 'hidden',
	},
	ctaGradient: {
		paddingVertical: 16,
		alignItems: 'center',
		justifyContent: 'center',
	},
	ctaInner: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	ctaText: {
		fontSize: 16,
		fontWeight: '800',
		color: '#06140A',
		letterSpacing: 0.2,
	},
	ctaSubtext: {
		fontSize: 12,
		color: 'rgba(6,20,10,0.7)',
		marginTop: 3,
		fontWeight: '600',
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
		color: 'rgba(255,255,255,0.55)',
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
		color: 'rgba(255,255,255,0.4)',
	},
})