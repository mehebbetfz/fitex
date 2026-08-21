import { useLanguage } from '@/contexts/language-context'
import { useAppTheme } from '@/contexts/theme-context'
import type { AppColors } from '@/constants/app-theme'
import { presetAvatarSource } from '@/constants/preset-avatars'
import { Language } from '@/locales'
import ProfileStatsSections from '@/components/profile-stats-sections'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
	ActivityIndicator,
	Alert,
	Animated,
	Image,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { hasActivePremium, useAuth } from '../contexts/auth-context'

/** До окончания текущего периода подписки (сервер: premiumExpiresAt). */
function formatNextBillingRelative(
	expiresAt: string,
	lang: Language | null,
): string | null {
	const exp = new Date(expiresAt).getTime()
	if (!Number.isFinite(exp) || exp <= Date.now()) return null
	const ms = exp - Date.now()
	const days = Math.floor(ms / 86400000)
	const hours = Math.floor((ms % 86400000) / 3600000)
	const minutes = Math.floor((ms % 3600000) / 60000)
	const locale = lang === 'en' ? 'en' : lang === 'az' ? 'az' : 'ru'
	try {
		const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
		if (days >= 1) return rtf.format(days, 'day')
		if (hours >= 1) return rtf.format(hours, 'hour')
		return rtf.format(Math.max(1, minutes), 'minute')
	} catch {
		return null
	}
}

// ─────────────────────────────────────────────
// Shimmer (identical to RecoveryTab)
// ─────────────────────────────────────────────
const useShimmer = () => {
	const anim = useRef(new Animated.Value(0)).current
	useEffect(() => {
		const loop = Animated.loop(
			Animated.sequence([
				Animated.timing(anim, {
					toValue: 1,
					duration: 750,
					useNativeDriver: true,
				}),
				Animated.timing(anim, {
					toValue: 0,
					duration: 750,
					useNativeDriver: true,
				}),
			]),
		)
		loop.start()
		return () => loop.stop()
	}, [])
	return anim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.7] })
}

const ShimmerBlock = ({ style }: { style: any }) => {
	const opacity = useShimmer()
	return <Animated.View style={[style, { opacity }]} />
}

// ─────────────────────────────────────────────
// FadeIn (identical to RecoveryTab)
// ─────────────────────────────────────────────
const FadeIn = ({
	show,
	children,
}: {
	show: boolean
	children: React.ReactNode
}) => {
	const anim = useRef(new Animated.Value(0)).current
	useEffect(() => {
		if (show) {
			Animated.timing(anim, {
				toValue: 1,
				duration: 300,
				useNativeDriver: true,
			}).start()
		}
	}, [show])
	return <Animated.View style={{ opacity: anim }}>{children}</Animated.View>
}

// ─────────────────────────────────────────────
// Skeleton blocks
// ─────────────────────────────────────────────
const HeaderSkeleton = () => {
	const { colors } = useAppTheme()
	const styles = useMemo(() => makeStyles(colors), [colors])
	return (
		<View style={styles.header}>
			<View style={{ flex: 1, gap: 10, paddingRight: 12 }}>
				<ShimmerBlock
					style={{
						height: 28,
						width: '58%',
						maxWidth: 220,
						borderRadius: 8,
						backgroundColor: colors.cardLight,
					}}
				/>
				<ShimmerBlock
					style={{
						height: 15,
						width: '82%',
						maxWidth: 280,
						borderRadius: 5,
						backgroundColor: colors.cardLight,
					}}
				/>
			</View>
			<ShimmerBlock
				style={{
					height: 34,
					width: 88,
					borderRadius: 20,
					backgroundColor: colors.cardLight,
				}}
			/>
		</View>
	)
}

const UserCardSkeleton = () => {
	const { colors } = useAppTheme()
	const styles = useMemo(() => makeStyles(colors), [colors])
	return (
		<View style={[styles.userCard, { borderColor: colors.border }]}>
			<ShimmerBlock
				style={{
					width: 70,
					height: 70,
					borderRadius: 35,
					backgroundColor: colors.cardLight,
					marginRight: 16,
				}}
			/>
			<View style={{ flex: 1, gap: 10 }}>
				<ShimmerBlock
					style={{
						height: 18,
						width: 130,
						borderRadius: 6,
						backgroundColor: colors.cardLight,
					}}
				/>
				<ShimmerBlock
					style={{
						height: 13,
						width: 180,
						borderRadius: 4,
						backgroundColor: colors.cardLight,
					}}
				/>
				<ShimmerBlock
					style={{
						height: 12,
						width: '65%',
						borderRadius: 4,
						backgroundColor: colors.cardLight,
						marginTop: 2,
					}}
				/>
			</View>
		</View>
	)
}

const PremiumBlockSkeleton = () => {
	const { colors } = useAppTheme()
	const styles = useMemo(() => makeStyles(colors), [colors])
	return (
		<View style={[styles.premiumStatusBlock, { borderColor: colors.border }]}>
			<View
				style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}
			>
				<ShimmerBlock
					style={{
						width: 24,
						height: 24,
						borderRadius: 12,
						backgroundColor: colors.cardLight,
					}}
				/>
				<ShimmerBlock
					style={{
						height: 16,
						width: 120,
						borderRadius: 5,
						backgroundColor: colors.cardLight,
						marginLeft: 10,
					}}
				/>
			</View>
			<View style={{ paddingLeft: 34, gap: 10 }}>
				<ShimmerBlock
					style={{
						height: 13,
						width: '80%',
						borderRadius: 4,
						backgroundColor: colors.cardLight,
					}}
				/>
				<ShimmerBlock
					style={{
						height: 12,
						width: '62%',
						borderRadius: 4,
						backgroundColor: colors.cardLight,
					}}
				/>
				<ShimmerBlock
					style={{
						height: 38,
						width: 140,
						borderRadius: 30,
						backgroundColor: colors.cardLight,
					}}
				/>
			</View>
		</View>
	)
}

const SettingsItemSkeleton = () => {
	const { colors } = useAppTheme()
	const styles = useMemo(() => makeStyles(colors), [colors])
	return (
		<View style={[styles.settingsItem, { marginBottom: 8 }]}>
			<ShimmerBlock
				style={{
					width: 44,
					height: 44,
					borderRadius: 22,
					backgroundColor: colors.cardLight,
					marginRight: 12,
				}}
			/>
			<View style={{ flex: 1, gap: 8 }}>
				<ShimmerBlock
					style={{
						height: 14,
						width: 150,
						borderRadius: 4,
						backgroundColor: colors.cardLight,
					}}
				/>
				<ShimmerBlock
					style={{
						height: 11,
						width: 110,
						borderRadius: 4,
						backgroundColor: colors.cardLight,
					}}
				/>
			</View>
			<ShimmerBlock
				style={{
					width: 20,
					height: 20,
					borderRadius: 4,
					backgroundColor: colors.cardLight,
				}}
			/>
		</View>
	)
}

/** Заголовок секции + N строк в стиле SettingsItem */
const SettingsSectionSkeleton = ({ rows = 2 }: { rows?: number }) => {
	const { colors } = useAppTheme()
	const styles = useMemo(() => makeStyles(colors), [colors])
	return (
		<View style={styles.section}>
			<ShimmerBlock
				style={{
					height: 18,
					width: 140,
					borderRadius: 5,
					backgroundColor: colors.cardLight,
					marginBottom: 12,
					marginLeft: 8,
				}}
			/>
			{Array.from({ length: rows }, (_, i) => (
				<SettingsItemSkeleton key={i} />
			))}
		</View>
	)
}

// ─────────────────────────────────────────────
// SettingsItem
// ─────────────────────────────────────────────
interface SettingsItemProps {
	icon: keyof typeof Ionicons.glyphMap
	title: string
	subtitle?: string
	onPress?: () => void
	showChevron?: boolean
	rightElement?: React.ReactNode
	iconColor?: string
}

const SettingsItem: React.FC<SettingsItemProps> = ({
	icon,
	title,
	subtitle,
	onPress,
	showChevron = true,
	rightElement,
	iconColor,
}) => {
	const { colors } = useAppTheme()
	const styles = useMemo(() => makeStyles(colors), [colors])
	const resolvedIconColor = iconColor ?? colors.primary
	return (
		<TouchableOpacity
			style={styles.settingsItem}
			onPress={onPress}
			disabled={!onPress}
			activeOpacity={0.7}
		>
			<View
				style={[
					styles.settingsIcon,
					{ backgroundColor: `${resolvedIconColor}20` },
				]}
			>
				<Ionicons name={icon} size={24} color={resolvedIconColor} />
			</View>
			<View style={styles.settingsContent}>
				<Text style={styles.settingsTitle}>{title}</Text>
				{subtitle && <Text style={styles.settingsSubtitle}>{subtitle}</Text>}
			</View>
			{rightElement}
			{showChevron && !rightElement && (
				<Ionicons
					name='chevron-forward'
					size={20}
					color={colors.textSecondary}
				/>
			)}
		</TouchableOpacity>
	)
}

// ─────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────
export default function ProfileScreen() {
	const { colors } = useAppTheme()
	const styles = useMemo(() => makeStyles(colors), [colors])
	const { user, signOut } = useAuth()
	const { t, language } = useLanguage()
	const [signingOut, setSigningOut] = useState(false)
	const [loading, setLoading] = useState(true)

	const premium = user ? hasActivePremium(user) : false

	const nextBillingRelative = useMemo(() => {
		if (!premium || !user?.premiumExpiresAt) return null
		return formatNextBillingRelative(user.premiumExpiresAt, language)
	}, [premium, user?.premiumExpiresAt, language])

	useEffect(() => {
		if (user !== undefined) {
			const timer = setTimeout(() => setLoading(false), 300)
			return () => clearTimeout(timer)
		}
	}, [user])

	const handleSignOut = () => {
		Alert.alert(t('profile', 'signOutTitle'), t('profile', 'signOutConfirm'), [
			{ text: t('common', 'cancel'), style: 'cancel' },
			{
				text: t('profile', 'signOut'),
				style: 'destructive',
				onPress: async () => {
					setSigningOut(true)
					try {
						await signOut()
						router.replace('/(auth)/login')
					} catch (err) {
						Alert.alert(t('common', 'error'), t('profile', 'syncError'))
					} finally {
						setSigningOut(false)
					}
				},
			},
		])
	}

	const handleUpgrade = () => router.push('/(auth)/trial-paywall' as any)
	const displayNameLine = [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim()
	const userInitial =
		user?.firstName?.[0] || user?.lastName?.[0] || user?.email?.[0] || '?'
	const presetSrc = presetAvatarSource(user?.avatarPreset)
	const remoteAvatar =
		user?.avatarUrl && String(user.avatarUrl).startsWith('http')
			? user.avatarUrl
			: null

	return (
		<SafeAreaView style={styles.container} edges={['top']}>
			<ScrollView
				showsVerticalScrollIndicator={false}
				contentContainerStyle={styles.scrollContent}
			>
				{/* Header — при загрузке весь блок шиммер */}
				{loading ? (
					<HeaderSkeleton />
				) : (
					<View style={styles.header}>
						<View>
							<Text style={styles.title}>{t('profile', 'title')}</Text>
							<Text style={styles.subtitle}>{t('profile', 'subtitle')}</Text>
						</View>
						<FadeIn show={!loading}>
							<View
								style={{
									flexDirection: 'row',
									alignItems: 'center',
									backgroundColor: premium
										? 'rgba(52,199,89,0.1)'
										: 'rgba(142,142,147,0.1)',
									borderRadius: 20,
									paddingHorizontal: 12,
									paddingVertical: 6,
									borderWidth: 1,
									borderColor: premium
										? 'rgba(52,199,89,0.2)'
										: 'rgba(142,142,147,0.2)',
									gap: 6,
								}}
							>
								<View
									style={{
										width: 7,
										height: 7,
										borderRadius: 3.5,
										backgroundColor: premium
											? colors.primary
											: colors.textSecondary,
									}}
								/>
								<Text
									style={{
										fontSize: 13,
										fontWeight: '600',
										color: premium
											? colors.primary
											: colors.textSecondary,
									}}
								>
									{premium ? t('profile', 'premium') : t('profile', 'basic')}
								</Text>
							</View>
						</FadeIn>
					</View>
				)}

				{/* User card */}
				{loading ? (
					<UserCardSkeleton />
				) : (
					<FadeIn show={!loading}>
						<View style={styles.userCard}>
							<TouchableOpacity
								style={styles.avatarHit}
								onPress={() =>
									router.push({
										pathname: '/(auth)/avatar-select',
										params: { mode: 'profile' },
									})
								}
								activeOpacity={0.8}
							>
								<View style={styles.avatarContainer}>
									{presetSrc ? (
										<Image source={presetSrc} style={styles.avatarImage} />
									) : remoteAvatar ? (
										<Image
											source={{ uri: remoteAvatar }}
											style={styles.avatarImage}
										/>
									) : (
										<Text style={styles.avatarText}>{userInitial}</Text>
									)}
								</View>
								<View style={styles.avatarEditBadge}>
									<Ionicons name='camera' size={12} color='#000' />
								</View>
							</TouchableOpacity>
							<View style={styles.userInfo}>
								<Text style={styles.userName}>
									{displayNameLine || t('profile', 'defaultUser')}
								</Text>
								<Text style={styles.userEmail}>{user?.email || '—'}</Text>
								<Text style={styles.avatarHint}>
									{t('profile', 'avatarChangeHint')}
								</Text>
							</View>
						</View>
					</FadeIn>
				)}

				{/* Имя и фамилия (сервер → лидерборд и весь клиент) */}
				{!loading && (
					<FadeIn show={!loading}>
						<View style={styles.section}>
							<Text style={styles.sectionTitle}>{t('profile', 'displayNameSection')}</Text>
							<SettingsItem
								icon='create-outline'
								title={t('profile', 'displayNameEntry')}
								subtitle={t('profile', 'displayNameSubtitle')}
								onPress={() => router.push('/(auth)/(routes)/edit-name')}
								iconColor={colors.primary}
							/>
						</View>
					</FadeIn>
				)}

				{/* Premium status block */}
				{loading ? (
					<PremiumBlockSkeleton />
				) : (
					<FadeIn show={!loading}>
						<View style={styles.premiumStatusBlock}>
						<View style={styles.premiumStatusHeader}>
							<Ionicons
								name={premium ? 'diamond' : 'diamond-outline'}
								size={24}
								color={
									premium ? colors.primary : colors.textSecondary
								}
							/>
							<Text style={styles.premiumStatusTitle}>{t('profile', 'premiumStatus')}</Text>
						</View>
						<View style={styles.premiumStatusBody}>
							<Text style={styles.premiumStatusText}>
								{premium
									? t('profile', 'premiumActive')
									: t('profile', 'freePlan')}
							</Text>
							{nextBillingRelative ? (
								<Text style={styles.premiumRenewal}>
									{t('profile', 'nextBillingLabel')}: {nextBillingRelative}
								</Text>
							) : null}
							{!premium && (
								<TouchableOpacity
									style={styles.upgradeButton}
									onPress={handleUpgrade}
								>
									<Text style={styles.upgradeButtonText}>{t('profile', 'buyPremium')}</Text>
									<Ionicons
										name='arrow-forward'
										size={18}
										color={colors.primary}
									/>
								</TouchableOpacity>
							)}
						</View>
						</View>
					</FadeIn>
				)}

				{!loading ? (
					<FadeIn show={!loading}>
						<ProfileStatsSections />
					</FadeIn>
				) : null}

				{/* Settings entry */}
				{loading ? (
					<SettingsSectionSkeleton rows={1} />
				) : (
					<FadeIn show={!loading}>
						<View style={styles.section}>
							{user?.isAdmin ? (
								<SettingsItem
									icon='shield-checkmark-outline'
									title={t('profile', 'adminEntry')}
									subtitle={t('profile', 'adminSubtitle')}
									onPress={() => router.push('/(auth)/(routes)/admin')}
									iconColor={colors.accent}
								/>
							) : null}
							<SettingsItem
								icon='settings-outline'
								title={t('profile', 'settingsEntry')}
								subtitle={t('profile', 'settingsSubtitle')}
								onPress={() => router.push('/(auth)/(routes)/settings')}
								iconColor={colors.textSecondary}
							/>
						</View>
					</FadeIn>
				)}

			{/* Rating + social */}
			{loading ? (
				<SettingsSectionSkeleton rows={2} />
			) : (
				<FadeIn show={!loading}>
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>{t('profile', 'ratingSocialSection')}</Text>
						<SettingsItem
							icon='trophy-outline'
							title={t('profile', 'ratingEntry')}
							subtitle={t('profile', 'ratingEntrySubtitle')}
							onPress={() => router.push('/(auth)/(routes)/rating')}
							iconColor='#FFD700'
						/>
						<SettingsItem
							icon='copy-outline'
							title={t('profile', 'templatesEntry')}
							subtitle={t('profile', 'templatesEntrySubtitle')}
							onPress={() => router.push('/templates')}
							iconColor='#34C759'
						/>
						<SettingsItem
							icon='share-social-outline'
							title={t('profile', 'socialLinksEntry')}
							subtitle={t('profile', 'socialLinksSubtitle')}
							onPress={() => router.push('/(auth)/(routes)/edit-social')}
							iconColor='#5AC8FA'
						/>
					</View>
				</FadeIn>
			)}

				{/* Sign out */}
				{loading ? (
					<SettingsSectionSkeleton rows={1} />
				) : (
					<FadeIn show={!loading}>
						<Text style={styles.sectionTitle}>{t('profile', 'signOutSection')}</Text>
						<SettingsItem
							icon='log-out-outline'
							title={t('profile', 'signOut')}
							subtitle={t('profile', 'signOutSubtitle')}
							onPress={handleSignOut}
							iconColor={colors.error}
							showChevron={false}
							rightElement={
								signingOut ? (
									<ActivityIndicator size='small' color={colors.error} />
								) : null
							}
						/>
					</FadeIn>
				)}
			</ScrollView>
		</SafeAreaView>
	)
}

function makeStyles(C: AppColors) {
	return StyleSheet.create({
	container: { flex: 1, backgroundColor: C.background },
	scrollContent: { paddingBottom: 40 },
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 10,
		paddingTop: 20,
		paddingBottom: 16,
	},
	title: { fontSize: 28, fontWeight: 'bold', color: C.text },
	subtitle: { fontSize: 15, color: C.textSecondary, marginTop: 4 },
	userCard: {
		flexDirection: 'row',
		backgroundColor: C.card,
		borderRadius: 20,
		padding: 20,
		marginHorizontal: 10,
		marginBottom: 16,
		borderWidth: 1,
		borderColor: C.border,
		alignItems: 'center',
	},
	avatarHit: {
		width: 70,
		height: 70,
		marginRight: 16,
		position: 'relative',
	},
	avatarContainer: {
		width: 70,
		height: 70,
		borderRadius: 35,
		backgroundColor: C.cardLight,
		justifyContent: 'center',
		alignItems: 'center',
		overflow: 'hidden',
	},
	avatarImage: { width: '100%', height: '100%' },
	avatarEditBadge: {
		position: 'absolute',
		right: -2,
		bottom: -2,
		width: 22,
		height: 22,
		borderRadius: 11,
		backgroundColor: C.primary,
		alignItems: 'center',
		justifyContent: 'center',
	},
	avatarText: { fontSize: 30, fontWeight: 'bold', color: C.text },
	avatarHint: {
		marginTop: 4,
		fontSize: 12,
		color: C.textSecondary,
	},
	userInfo: { flex: 1 },
	userName: { fontSize: 20, fontWeight: '600', color: C.text },
	userEmail: { fontSize: 15, color: C.textSecondary, marginTop: 2 },
	premiumStatusBlock: {
		backgroundColor: C.card,
		borderRadius: 20,
		padding: 20,
		marginHorizontal: 10,
		marginBottom: 15,
		borderWidth: 1,
		borderColor: C.border,
	},
	premiumStatusHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 12,
	},
	premiumStatusTitle: {
		fontSize: 18,
		fontWeight: '600',
		color: C.text,
		marginLeft: 10,
	},
	premiumStatusBody: { paddingLeft: 34 },
	premiumStatusText: {
		fontSize: 15,
		color: C.textSecondary,
		marginBottom: 12,
	},
	premiumRenewal: {
		marginTop: -6,
		marginBottom: 12,
		fontSize: 13,
		color: C.textSecondary,
		lineHeight: 18,
	},
	upgradeButton: {
		flexDirection: 'row',
		alignItems: 'center',
		alignSelf: 'flex-start',
		backgroundColor: 'rgba(52, 199, 89, 0.15)',
		paddingHorizontal: 16,
		paddingVertical: 10,
		borderRadius: 30,
		gap: 8,
	},
	upgradeButtonText: { color: C.primary, fontSize: 15, fontWeight: '600' },
	section: { marginTop: 10 },
	sectionTitle: {
		fontSize: 18,
		fontWeight: '600',
		color: C.text,
		marginBottom: 12,
		marginLeft: 8,
	},
	settingsItem: {
		flexDirection: 'row',
		backgroundColor: C.card,
		borderRadius: 16,
		padding: 16,
		marginBottom: 8,
		marginHorizontal: 10,
		alignItems: 'center',
		borderWidth: 1,
		borderColor: C.border,
	},
	settingsIcon: {
		width: 44,
		height: 44,
		borderRadius: 22,
		justifyContent: 'center',
		alignItems: 'center',
		marginRight: 12,
	},
	settingsContent: { flex: 1 },
	settingsTitle: { fontSize: 16, fontWeight: '500', color: C.text },
	settingsSubtitle: { fontSize: 13, color: C.textSecondary, marginTop: 2 },
})
}

