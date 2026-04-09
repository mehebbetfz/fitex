import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
	ActivityIndicator,
	Alert,
	FlatList,
	Platform,
	SafeAreaView,
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

import { useLanguage } from '@/contexts/language-context'
import { fetchPremiumSubscriptions } from '@/services/iap-products'
import { syncAlreadyOwnedSubscription, verifySubscriptionOnServer } from '@/services/subscription-verify'
import { useAuth } from '../contexts/auth-context'

const LOG_TAG = '[SubscriptionScreen]'

const log = (msg: string, data?: any) => {
	if (data !== undefined) {
		console.log(`${LOG_TAG} ${msg}`, JSON.stringify(data, null, 2))
	} else {
		console.log(`${LOG_TAG} ${msg}`)
	}
}

const logWarn = (msg: string, data?: any) => {
	if (data !== undefined) {
		console.warn(`${LOG_TAG} ⚠️ ${msg}`, JSON.stringify(data, null, 2))
	} else {
		console.warn(`${LOG_TAG} ⚠️ ${msg}`)
	}
}

const logError = (msg: string, error?: any) => {
	console.error(`${LOG_TAG} ❌ ${msg}`, error)
}

// ─────────────────────────────────────────────

const COLORS = {
	primary: '#34C759',
	background: '#121212',
	card: '#1C1C1E',
	border: '#2C2C2E',
	text: '#FFFFFF',
	textSecondary: '#8E8E93',
	accent: '#FF9500',
} as const

const SKUS = {
	monthly: 'premium_monthly',
	yearly: 'premium_yearly',
}

const handleBack = () => {
	router.back()
}

export default function SubscriptionScreen() {
	log('Component function called (render)')

	const { updateUser } = useAuth()
	const { t } = useLanguage()
	const [products, setProducts] = useState<ProductSubscription[]>([])
	const [loading, setLoading] = useState(false)
	const [initializing, setInitializing] = useState(true)

	const purchaseUpdateSub = useRef<any>(null)
	const purchaseErrorSub = useRef<any>(null)

	// ==============================
	// ОБРАБОТКА ПОКУПКИ
	// ==============================
	const handlePurchase = useCallback(
		async (purchase: Purchase) => {
			log('handlePurchase called', {
				productId: purchase.productId,
				transactionId: purchase.transactionId,
				platform: Platform.OS,
			})

			const result = await verifySubscriptionOnServer(purchase)
			if (result.ok) {
				log('Verification successful')
				await updateUser({
					isPremium: true,
					premiumExpiresAt: result.premiumExpiresAt,
				})
				Alert.alert(t('subscription', 'restoreSuccess'), t('subscription', 'alreadyPremium'))
				router.back()
			} else {
				logWarn('Verification failed', { message: result.message })
				const msg =
					result.message === 'noReceipt' ? 'No purchase receipt found' : result.message
				Alert.alert(t('common', 'error'), msg)
			}
			log('handlePurchase finally: setLoading(false)')
			setLoading(false)
		},
		[updateUser, t],
	)

	// ==============================
	// ИНИЦИАЛИЗАЦИЯ IAP
	// ==============================
	useEffect(() => {
		log('🟢 useEffect MOUNT — starting IAP initialization')
		let mounted = true

		const init = async () => {
			try {
				log('Calling initConnection()...')
				await initConnection()
				log('initConnection() succeeded')

				log('Subscribing to purchaseUpdatedListener')
				purchaseUpdateSub.current = purchaseUpdatedListener(async purchase => {
					log('purchaseUpdatedListener fired', {
						productId: purchase.productId,
						transactionId: purchase.transactionId,
					})
					await handlePurchase(purchase)
				})

				log('Subscribing to purchaseErrorListener')
				purchaseErrorSub.current = purchaseErrorListener(async (error: any) => {
					logWarn('purchaseErrorListener fired', {
						code: error.code,
						message: error.message,
					})
					if (error.code === ErrorCode.UserCancelled) {
						log('User cancelled purchase — no alert shown')
						setLoading(false)
						return
					}
					if (error.code === ErrorCode.AlreadyOwned) {
						const r = await syncAlreadyOwnedSubscription()
						if (r.ok) {
							await updateUser({
								isPremium: true,
								premiumExpiresAt: r.premiumExpiresAt,
							})
							Alert.alert(t('subscription', 'restoreSuccess'), t('subscription', 'alreadyPremium'))
							router.back()
						} else {
							Alert.alert(t('subscription', 'purchaseError'), t('subscription', 'restoreEmpty'))
						}
						setLoading(false)
						return
					}
					Alert.alert(t('subscription', 'purchaseError'), error.message)
					setLoading(false)
				})

				log('Fetching subscription products (retries + fallback)...')
				const items = await fetchPremiumSubscriptions()

				log('fetchPremiumSubscriptions returned', {
					count: items?.length ?? 0,
					ids: items?.map(i => i.id),
				})

				if (mounted) {
					setProducts(items)
				} else {
					logWarn('Component unmounted before products could be set')
				}
			} catch (error) {
				logError('IAP init failed', error)
				if (mounted) {
					setProducts([])
				}
			} finally {
				if (mounted) {
					log('setInitializing(false)')
					setInitializing(false)
				}
			}
		}

		init()

		return () => {
			log('🔴 useEffect CLEANUP — component unmounting')
			mounted = false

			log('Removing purchaseUpdateSub listener')
			purchaseUpdateSub.current?.remove()

			log('Removing purchaseErrorSub listener')
			purchaseErrorSub.current?.remove()

			log('Calling endConnection()')
			endConnection()
			log('endConnection() called')
		}
	}, [handlePurchase, t, updateUser])

	// ==============================
	// ПОКУПКА
	// ==============================
	const buySubscription = async (productId: string) => {
		log('buySubscription called', { productId })

		if (loading) {
			logWarn('buySubscription: already loading, ignoring tap')
			return
		}

		if (!products.length) {
			Alert.alert(t('common', 'error'), t('trial', 'storeUnavailable'))
			return
		}

		setLoading(true)
		log('setLoading(true)')

		try {
			log('Calling requestPurchase', { productId, type: 'subs' })
			if (Platform.OS === 'ios') {
				await requestPurchase({
					type: 'subs',
					request: {
						apple: {
							sku: productId,
							andDangerouslyFinishTransactionAutomatically: false,
						},
					},
				})
			} else {
				const prod = products.find(p => p.id === productId)
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
							skus: [productId],
							subscriptionOffers: [{ sku: productId, offerToken: token }],
						},
					},
				})
			}
			log('requestPurchase returned (result will arrive via listener)')
		} catch (error: any) {
			logError('requestPurchase threw', {
				code: error.code,
				message: error.message,
			})
		if (error.code !== ErrorCode.UserCancelled) {
					Alert.alert(t('common', 'error'), error.message)
				} else {
				log('User cancelled purchase in requestPurchase catch')
			}
			log('setLoading(false) after requestPurchase error')
			setLoading(false)
		}
	}

	// ==============================
	// ВОССТАНОВЛЕНИЕ ПОКУПОК
	// ==============================
	const restorePurchases = async () => {
		log('restorePurchases called')

		if (loading) {
			logWarn('restorePurchases: already loading, ignoring tap')
			return
		}

		setLoading(true)
		log('setLoading(true)')

		try {
			log('Calling syncAlreadyOwnedSubscription()...')
			const r = await syncAlreadyOwnedSubscription()
			log('restore result', { ok: r.ok })

			if (!r.ok) {
				logWarn('No active premium subscription to restore', { message: r.message })
				Alert.alert(t('subscription', 'restoreEmpty'))
				setLoading(false)
				return
			}

			await updateUser({
				isPremium: true,
				premiumExpiresAt: r.premiumExpiresAt,
			})
			Alert.alert(t('subscription', 'restoreSuccess'), t('subscription', 'alreadyPremium'))
			setLoading(false)
			router.back()
		} catch (error) {
			logError('restorePurchases threw', error)
			Alert.alert(t('common', 'error'), t('subscription', 'purchaseError'))
			setLoading(false)
		}
	}

	const renderHeader = () => (
		<View style={modalStyles.header}>
			<TouchableOpacity
				style={modalStyles.backButton}
				onPress={handleBack}
				activeOpacity={0.7}
			>
				<Ionicons name={'arrow-back'} size={24} color={COLORS.text} />
			</TouchableOpacity>
			<Text style={modalStyles.headerTitle} numberOfLines={1}>
				{t('subscription', 'title')}
			</Text>
		</View>
	)

	const FeatureItem = ({ text }: { text: string }) => (
		<View style={styles.featureRow}>
			<Ionicons name='checkmark-circle' size={18} color={COLORS.primary} />
			<Text style={styles.featureText}>{text}</Text>
		</View>
	)

	const renderProduct = ({ item }: { item: ProductSubscription }) => {
		const productId = item.id
		const isYearly = productId.includes('yearly')
		const price = item.displayPrice ?? (item as any).localizedPrice ?? '—'
		const description =
			item.description ??
			(isYearly ? t('subscription', 'yearlyDesc') : t('subscription', 'monthlyDesc'))

		return (
			<TouchableOpacity
				style={[styles.productCard, isYearly && styles.productCardPopular]}
				onPress={() => {
					log('Product card pressed', { productId, isYearly })
					buySubscription(productId)
				}}
				disabled={loading}
				activeOpacity={0.8}
			>
				{isYearly && (
					<View style={styles.popularBadge}>
						<Text style={styles.popularText}>{t('subscription', 'bestValue')}</Text>
					</View>
				)}
				<Text style={styles.productTitle}>{item.title}</Text>
				<View style={styles.priceContainer}>
					<Text style={styles.price}>{price}</Text>
					<Text style={styles.period}>/{isYearly ? t('subscription', 'year') : t('subscription', 'month')}</Text>
				</View>
				<Text style={styles.productDescription}>{description}</Text>
				<View style={styles.featureList}>
					<FeatureItem text={t('subscription', 'feature1')} />
					<FeatureItem text={t('subscription', 'feature2')} />
					<FeatureItem text={t('subscription', 'feature3')} />
					<FeatureItem text={t('subscription', 'feature4')} />
					<FeatureItem text={t('subscription', 'feature5')} />
				</View>
			</TouchableOpacity>
		)
	}

	log('Rendering', { initializing, loading, productsCount: products.length })

	if (initializing) {
		log('Rendering loading state (initializing)')
		return (
			<SafeAreaView style={styles.loadingContainer}>
				<ActivityIndicator size='large' color={COLORS.primary} />
				<Text style={styles.loadingText}>{t('subscription', 'loading')}</Text>
			</SafeAreaView>
		)
	}

	return (
		<SafeAreaView style={styles.container}>
			{renderHeader()}

			<FlatList
				ListHeaderComponent={
					<>
						<Text style={styles.title}>{t('subscription', 'title')}</Text>
						<Text style={styles.subtitle}>
							{t('subscription', 'feature1')} · {t('subscription', 'feature2')} · {t('subscription', 'feature3')}
						</Text>
					</>
				}
				data={products}
				keyExtractor={item => String(item.id)}
				renderItem={renderProduct}
				contentContainerStyle={styles.listContent}
				showsVerticalScrollIndicator={false}
				ListEmptyComponent={
					!initializing ? (
						<Text style={styles.emptyProducts}>{t('trial', 'storeUnavailable')}</Text>
					) : null
				}
				ListFooterComponent={
					Platform.OS === 'ios' ? (
						<TouchableOpacity
							style={styles.restoreButton}
							onPress={() => {
								log('Restore purchases button pressed')
								restorePurchases()
							}}
						>
							<Text style={styles.restoreText}>{t('subscription', 'restore')}</Text>
						</TouchableOpacity>
					) : null
				}
			/>

			{loading && (
				<View style={styles.loadingOverlay}>
					<ActivityIndicator size='large' color={COLORS.primary} />
				</View>
			)}
		</SafeAreaView>
	)
}

const modalStyles = StyleSheet.create({
	modalOverlay: {
		flex: 1,
		backgroundColor: '#121212',
		justifyContent: 'flex-end',
	},
	modalBackdrop: {
		...StyleSheet.absoluteFillObject,
	},
	modalContainer: {
		backgroundColor: '#121212',
		borderTopLeftRadius: 24,
		borderTopRightRadius: 24,
		height: '95%',
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 16,
		paddingVertical: 12,
		backgroundColor: COLORS.card,
		borderBottomWidth: 1,
		borderBottomColor: COLORS.border,
	},
	backButton: {
		padding: 8,
	},
	headerTitle: {
		flex: 1,
		fontSize: 18,
		fontWeight: '600',
		color: COLORS.text,
		textAlign: 'center',
		marginRight: 24,
	},
	headerRight: {
		width: 40,
		alignItems: 'flex-end',
	},
	content: {
		flex: 1,
	},
	tabsContainer: {
		flexDirection: 'row',
		paddingHorizontal: 8,
		paddingVertical: 8,
		backgroundColor: COLORS.card,
		borderBottomWidth: 1,
		borderBottomColor: COLORS.border,
	},
	tab: {
		flex: 1,
		alignItems: 'center',
		paddingVertical: 10,
		borderRadius: 10,
		marginHorizontal: 4,
	},
	activeTab: {
		backgroundColor: 'rgba(52, 199, 89, 0.1)',
	},
	tabText: {
		fontSize: 12,
		color: COLORS.textSecondary,
		marginTop: 4,
		fontWeight: '500',
	},
	activeTabText: {
		color: COLORS.primary,
		fontWeight: '600',
	},
	searchContainer: {
		paddingHorizontal: 16,
		paddingVertical: 12,
		backgroundColor: COLORS.card,
	},
	searchInput: {
		flex: 1,
		fontSize: 16,
		color: COLORS.text,
		marginLeft: 12,
		marginRight: 8,
	},
	muscleGroupsGrid: {
		padding: 12,
		paddingBottom: 24,
	},
	columnWrapper: {
		justifyContent: 'space-between',
	},
	muscleGroupImageContainer: {
		width: '100%',
		height: 120,
		position: 'relative',
	},
	muscleGroupImage: {
		width: '100%',
		height: '100%',
		resizeMode: 'contain',
	},
	muscleGroupName: {
		fontSize: 16,
		fontWeight: '600',
		color: COLORS.text,
		paddingHorizontal: 12,
		paddingTop: 12,
		paddingBottom: 4,
	},
	muscleGroupCount: {
		fontSize: 12,
		color: COLORS.textSecondary,
		paddingHorizontal: 12,
		paddingBottom: 12,
	},
	subgroupsGrid: {
		padding: 12,
		paddingBottom: 24,
	},
	muscleSubgroupImageContainer: {
		width: '100%',
		height: 120,
		position: 'relative',
	},
	muscleSubgroupImage: {
		width: '100%',
		height: '100%',
		resizeMode: 'contain',
	},
	muscleSubgroupName: {
		fontSize: 14,
		fontWeight: '600',
		color: COLORS.text,
		paddingHorizontal: 12,
		paddingTop: 10,
		paddingBottom: 4,
	},
	exerciseCount: {
		fontSize: 11,
		color: COLORS.textSecondary,
		paddingHorizontal: 12,
		paddingBottom: 10,
	},
	exercisesList: {
		padding: 12,
		paddingBottom: 24,
	},
	exerciseListItem: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: COLORS.card,
		borderRadius: 14,
		padding: 12,
		marginBottom: 8,
		borderWidth: 1,
		borderColor: COLORS.border,
	},
	exerciseListImage: {
		width: 60,
		height: 60,
		borderRadius: 10,
		marginRight: 12,
	},
	exerciseListContent: {
		flex: 1,
	},
	exerciseListHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 6,
	},
	exerciseListName: {
		fontSize: 16,
		fontWeight: '600',
		color: COLORS.text,
		flex: 1,
		marginRight: 8,
	},
	exerciseListDescription: {
		fontSize: 12,
		color: COLORS.textSecondary,
		marginBottom: 8,
		lineHeight: 16,
	},
	exerciseListTags: {
		flexDirection: 'row',
		gap: 8,
	},
	difficultyTag: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: 'rgba(52, 199, 89, 0.2)',
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 6,
	},
	difficultyText: {
		fontSize: 10,
		color: COLORS.text,
		fontWeight: '600',
		marginLeft: 4,
	},
	equipmentTag: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: 'rgba(142, 142, 147, 0.2)',
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 6,
	},
	equipmentText: {
		fontSize: 10,
		color: COLORS.text,
		fontWeight: '600',
		marginLeft: 4,
	},
	exerciseDetailContainer: {
		flex: 1,
		backgroundColor: '#121212',
	},
	exerciseImageContainer: {
		width: '100%',
		height: 240,
		position: 'relative',
	},
	exerciseMainImage: {
		width: '100%',
		height: '100%',
	},
	exerciseDetailContent: {
		padding: 16,
	},
	exerciseHeader: {
		marginBottom: 24,
	},
	exerciseTitleContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 12,
	},
	exerciseDetailTitle: {
		fontSize: 24,
		fontWeight: 'bold',
		color: COLORS.text,
		flex: 1,
		marginRight: 8,
	},
	exerciseDetailDescriptionFull: {
		fontSize: 15,
		color: COLORS.text,
		lineHeight: 22,
		marginBottom: 20,
	},
	detailStats: {
		justifyContent: 'space-between',
		marginTop: 16,
	},
	detailStat: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: COLORS.card,
		padding: 12,
		borderRadius: 12,
		marginVertical: 4,
	},
	detailStatIcon: {
		width: 32,
		height: 32,
		borderRadius: 16,
		backgroundColor: 'rgba(52, 199, 89, 0.1)',
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: 12,
	},
	detailStatLabel: {
		fontSize: 11,
		color: COLORS.textSecondary,
		marginBottom: 2,
	},
	detailStatValue: {
		fontSize: 13,
		fontWeight: '600',
		color: COLORS.text,
	},
	section: {
		marginBottom: 24,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: 'bold',
		color: COLORS.text,
		marginBottom: 16,
	},
	muscleGroupsGridDetail: {
		backgroundColor: COLORS.card,
		borderRadius: 12,
		overflow: 'hidden',
	},
	muscleGroupItem: {
		padding: 16,
	},
	muscleGroupHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 12,
	},
	muscleGroupLabel: {
		fontSize: 14,
		fontWeight: '600',
		color: COLORS.text,
		marginLeft: 8,
	},
	muscleItem: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 8,
	},
	muscleDot: {
		width: 8,
		height: 8,
		borderRadius: 4,
		backgroundColor: COLORS.primary,
		marginRight: 12,
	},
	muscleText: {
		fontSize: 14,
		color: COLORS.text,
		flex: 1,
	},
	muscleDotSecondary: {
		width: 8,
		height: 8,
		borderRadius: 4,
		backgroundColor: COLORS.textSecondary,
		marginRight: 12,
	},
	muscleTextSecondary: {
		fontSize: 14,
		color: COLORS.textSecondary,
		flex: 1,
	},
	tipsList: {
		backgroundColor: COLORS.card,
		borderRadius: 12,
		overflow: 'hidden',
	},
	tipItem: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		padding: 16,
	},
	tipNumber: {
		width: 24,
		height: 24,
		borderRadius: 12,
		backgroundColor: COLORS.primary,
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: 12,
		flexShrink: 0,
	},
	tipNumberText: {
		fontSize: 12,
		fontWeight: 'bold',
		color: COLORS.background,
	},
	tipText: {
		fontSize: 14,
		color: COLORS.text,
		flex: 1,
		lineHeight: 20,
	},
	confirmButton: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: COLORS.primary,
		paddingHorizontal: 32,
		paddingVertical: 18,
		borderRadius: 14,
		marginBottom: 16,
		marginTop: 8,
	},
	confirmButtonText: {
		fontSize: 16,
		fontWeight: 'bold',
		color: COLORS.background,
		marginLeft: 8,
	},
	spacer: {
		height: 32,
	},
	emptyState: {
		alignItems: 'center',
		justifyContent: 'center',
		padding: 40,
	},
	emptyStateTitle: {
		fontSize: 16,
		color: COLORS.textSecondary,
		marginTop: 16,
		textAlign: 'center',
		fontWeight: '600',
	},
	fixedBottomButtonContainer: {
		position: 'absolute',
		bottom: 0,
		left: 0,
		right: 0,
		paddingHorizontal: 16,
		paddingVertical: 8,
		backgroundColor: COLORS.card, // или COLORS.card, если хотите другой фон
		borderTopWidth: 1,
		borderTopColor: COLORS.border,
		zIndex: 10,
		// Тень для красивого эффекта поднятия (опционально)
		shadowColor: '#000',
		shadowOffset: { width: 0, height: -3 },
		shadowOpacity: 0.15,
		shadowRadius: 8,
		elevation: 8, // для Android
	},
})

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: COLORS.background },
	backButton: {
		position: 'absolute',
		top: 10,
		left: 16,
		zIndex: 10,
		padding: 8,
	},
	loadingContainer: {
		flex: 1,
		backgroundColor: COLORS.background,
		justifyContent: 'center',
		alignItems: 'center',
	},
	loadingText: { marginTop: 16, fontSize: 16, color: COLORS.textSecondary },
	listContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 60 },
	emptyProducts: {
		paddingHorizontal: 16,
		paddingVertical: 24,
		color: COLORS.textSecondary,
		fontSize: 14,
		lineHeight: 20,
		textAlign: 'center',
	},
	title: {
		fontSize: 32,
		fontWeight: 'bold',
		color: COLORS.text,
		marginBottom: 8,
	},
	subtitle: {
		fontSize: 16,
		color: COLORS.textSecondary,
		marginBottom: 24,
		lineHeight: 22,
	},
	productCard: {
		backgroundColor: COLORS.card,
		borderRadius: 20,
		padding: 20,
		marginBottom: 16,
		borderWidth: 1,
		borderColor: COLORS.border,
		position: 'relative',
	},
	productCardPopular: { borderColor: COLORS.primary, borderWidth: 2 },
	popularBadge: {
		position: 'absolute',
		top: -12,
		right: 20,
		backgroundColor: COLORS.primary,
		paddingHorizontal: 16,
		paddingVertical: 4,
		borderRadius: 20,
	},
	popularText: { color: COLORS.text, fontWeight: 'bold', fontSize: 14 },
	productTitle: {
		fontSize: 22,
		fontWeight: '600',
		color: COLORS.text,
		marginBottom: 8,
	},
	priceContainer: {
		flexDirection: 'row',
		alignItems: 'baseline',
		marginBottom: 12,
	},
	price: { fontSize: 32, fontWeight: 'bold', color: COLORS.primary },
	period: { fontSize: 16, color: COLORS.textSecondary, marginLeft: 4 },
	productDescription: {
		fontSize: 14,
		color: COLORS.textSecondary,
		marginBottom: 16,
	},
	featureList: { marginTop: 8 },
	featureRow: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 8,
		gap: 8,
	},
	featureText: { fontSize: 14, color: COLORS.text, flex: 1 },
	restoreButton: { alignItems: 'center', marginTop: 16, paddingVertical: 12 },
	restoreText: { color: COLORS.primary, fontSize: 16, fontWeight: '500' },
	loadingOverlay: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: 'rgba(0,0,0,0.7)',
		justifyContent: 'center',
		alignItems: 'center',
	},
})
