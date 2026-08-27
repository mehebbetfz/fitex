import type { AppColors } from '@/constants/app-theme'
import { useLanguage } from '@/contexts/language-context'
import { useAppTheme } from '@/contexts/theme-context'
import { PageListSkeleton } from '@/components/ui/skeleton'
import {
	adminAdjustMealPhotos,
	adminGrantPremium,
	adminSearchUsers,
	type AdminUser,
	type PremiumDuration,
} from '@/services/admin'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useCallback, useMemo, useState } from 'react'
import {
	ActivityIndicator,
	Alert,
	FlatList,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const PRESETS: { id: PremiumDuration; label: string }[] = [
	{ id: '7d', label: '7д' },
	{ id: '30d', label: '30д' },
	{ id: '90d', label: '90д' },
	{ id: '180d', label: '180д' },
	{ id: '365d', label: '1г' },
	{ id: 'lifetime', label: '∞' },
	{ id: 'revoke', label: 'Снять' },
]

const PHOTO_ADD_PRESETS = [10, 50, 100, 240]

export default function AdminScreen() {
	const router = useRouter()
	const { t } = useLanguage()
	const { colors: C } = useAppTheme()
	const styles = useMemo(() => makeStyles(C), [C])
	const [q, setQ] = useState('')
	const [loading, setLoading] = useState(false)
	const [busyId, setBusyId] = useState<string | null>(null)
	const [users, setUsers] = useState<AdminUser[]>([])
	const [customDays, setCustomDays] = useState<Record<string, string>>({})
	const [photoAmount, setPhotoAmount] = useState<Record<string, string>>({})

	const search = useCallback(async () => {
		setLoading(true)
		try {
			setUsers(await adminSearchUsers(q.trim()))
		} catch (e) {
			Alert.alert(t('common', 'error'), e instanceof Error ? e.message : String(e))
		} finally {
			setLoading(false)
		}
	}, [q, t])

	const grant = async (
		userId: string,
		body: { duration?: PremiumDuration; customDays?: number },
	) => {
		setBusyId(userId)
		try {
			const updated = await adminGrantPremium(userId, body)
			setUsers(prev => prev.map(u => (u.id === userId ? updated : u)))
		} catch (e) {
			Alert.alert(t('common', 'error'), e instanceof Error ? e.message : String(e))
		} finally {
			setBusyId(null)
		}
	}

	const adjustPhotos = async (
		userId: string,
		body: { add?: number; set?: number },
	) => {
		setBusyId(userId)
		try {
			const updated = await adminAdjustMealPhotos(userId, body)
			setUsers(prev => prev.map(u => (u.id === userId ? updated : u)))
			setPhotoAmount(prev => ({ ...prev, [userId]: '' }))
		} catch (e) {
			Alert.alert(t('common', 'error'), e instanceof Error ? e.message : String(e))
		} finally {
			setBusyId(null)
		}
	}

	const renderUser = ({ item }: { item: AdminUser }) => {
		const name = [item.firstName, item.lastName].filter(Boolean).join(' ') || '—'
		const expires = item.premiumLifetime
			? '∞'
			: item.premiumExpiresAt
				? new Date(item.premiumExpiresAt).toLocaleDateString()
				: '—'
		const photosLeft =
			item.mealPhotoRemaining != null ? String(item.mealPhotoRemaining) : '—'
		return (
			<View style={styles.card}>
				<Text style={styles.email}>{item.email}</Text>
				<Text style={styles.meta}>
					{name} · {item.provider}
				</Text>
				<View style={styles.pills}>
					<View
						style={[
							styles.pill,
							item.premiumActive ? styles.pillOk : styles.pillOff,
						]}
					>
						<Text
							style={[
								styles.pillText,
								{ color: item.premiumActive ? C.primary : C.textSecondary },
							]}
						>
							{item.premiumActive ? 'Premium' : 'Free'}
						</Text>
					</View>
					{item.premiumLifetime ? (
						<View style={[styles.pill, styles.pillLife]}>
							<Text style={[styles.pillText, { color: C.info }]}>∞</Text>
						</View>
					) : null}
					{item.role === 'admin' ? (
						<View style={[styles.pill, styles.pillAdmin]}>
							<Text style={[styles.pillText, { color: C.accent }]}>admin</Text>
						</View>
					) : null}
					<View style={[styles.pill, styles.pillPhotos]}>
						<Ionicons name='camera-outline' size={12} color={C.primary} />
						<Text style={[styles.pillText, { color: C.primary }]}>
							{photosLeft}
						</Text>
					</View>
				</View>
				<Text style={styles.expires}>
					до: {expires} · {t('admin', 'mealPhotos')}: {photosLeft}{' '}
					{t('admin', 'mealPhotosHint')}
				</Text>

				{busyId === item.id ? (
					<ActivityIndicator color={C.primary} style={{ marginTop: 12 }} />
				) : (
					<>
						<View style={styles.chips}>
							{PRESETS.map(p => (
								<TouchableOpacity
									key={p.id}
									style={[
										styles.chip,
										p.id === 'revoke' && styles.chipDanger,
										p.id === 'lifetime' && styles.chipLife,
									]}
									onPress={() => void grant(item.id, { duration: p.id })}
								>
									<Text
										style={[
											styles.chipText,
											p.id === 'revoke' && { color: C.error },
										]}
									>
										{p.label}
									</Text>
								</TouchableOpacity>
							))}
						</View>
						<View style={styles.customRow}>
							<TextInput
								style={styles.customInput}
								keyboardType='number-pad'
								placeholder='дней'
								placeholderTextColor={C.textSecondary}
								value={customDays[item.id] || ''}
								onChangeText={v =>
									setCustomDays(prev => ({ ...prev, [item.id]: v }))
								}
							/>
							<TouchableOpacity
								style={styles.customBtn}
								onPress={() => {
									const days = parseInt(customDays[item.id] || '', 10)
									if (!days || days < 1) return
									void grant(item.id, { customDays: days })
								}}
							>
								<Text style={styles.customBtnText}>OK</Text>
							</TouchableOpacity>
						</View>

						<Text style={styles.sectionLabel}>{t('admin', 'mealPhotos')}</Text>
						<View style={styles.chips}>
							{PHOTO_ADD_PRESETS.map(n => (
								<TouchableOpacity
									key={n}
									style={styles.chip}
									onPress={() => void adjustPhotos(item.id, { add: n })}
								>
									<Text style={styles.chipText}>+{n}</Text>
								</TouchableOpacity>
							))}
						</View>
						<View style={styles.customRow}>
							<TextInput
								style={styles.customInput}
								keyboardType='number-pad'
								placeholder='N'
								placeholderTextColor={C.textSecondary}
								value={photoAmount[item.id] || ''}
								onChangeText={v =>
									setPhotoAmount(prev => ({ ...prev, [item.id]: v }))
								}
							/>
							<TouchableOpacity
								style={styles.customBtn}
								onPress={() => {
									const n = parseInt(photoAmount[item.id] || '', 10)
									if (!Number.isFinite(n) || n === 0) return
									void adjustPhotos(item.id, { add: n })
								}}
							>
								<Text style={styles.customBtnText}>{t('admin', 'mealPhotosAdd')}</Text>
							</TouchableOpacity>
							<TouchableOpacity
								style={[styles.customBtn, styles.customBtnSecondary]}
								onPress={() => {
									const n = parseInt(photoAmount[item.id] || '', 10)
									if (!Number.isFinite(n) || n < 0) return
									void adjustPhotos(item.id, { set: n })
								}}
							>
								<Text style={styles.customBtnTextSecondary}>
									{t('admin', 'mealPhotosSet')}
								</Text>
							</TouchableOpacity>
						</View>
					</>
				)}
			</View>
		)
	}

	return (
		<SafeAreaView style={styles.safe} edges={['top']}>
			<View style={styles.header}>
				<TouchableOpacity onPress={() => router.back()} hitSlop={10}>
					<Ionicons name='arrow-back' size={24} color={C.text} />
				</TouchableOpacity>
				<Text style={styles.title}>{t('admin', 'title')}</Text>
				<View style={{ width: 24 }} />
			</View>

			<View style={styles.searchRow}>
				<TextInput
					style={styles.search}
					value={q}
					onChangeText={setQ}
					placeholder={t('admin', 'searchPlaceholder')}
					placeholderTextColor={C.textSecondary}
					autoCapitalize='none'
					onSubmitEditing={() => void search()}
					returnKeyType='search'
				/>
				<TouchableOpacity style={styles.searchBtn} onPress={() => void search()}>
					{loading ? (
						<ActivityIndicator color='#000' />
					) : (
						<Text style={styles.searchBtnText}>{t('admin', 'search')}</Text>
					)}
				</TouchableOpacity>
			</View>

			{loading && users.length === 0 ? (
				<PageListSkeleton rows={5} />
			) : (
				<FlatList
					data={users}
					keyExtractor={u => u.id}
					renderItem={renderUser}
					contentContainerStyle={styles.list}
					ListEmptyComponent={
						!loading ? (
							<Text style={styles.empty}>{t('admin', 'empty')}</Text>
						) : null
					}
				/>
			)}
		</SafeAreaView>
	)
}

function makeStyles(C: AppColors) {
	return StyleSheet.create({
		safe: { flex: 1, backgroundColor: C.background },
		header: {
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'space-between',
			paddingHorizontal: 16,
			paddingVertical: 12,
		},
		title: { fontSize: 18, fontWeight: '700', color: C.text },
		searchRow: {
			flexDirection: 'row',
			gap: 10,
			paddingHorizontal: 16,
			marginBottom: 8,
		},
		search: {
			flex: 1,
			backgroundColor: C.card,
			borderRadius: 12,
			borderWidth: 1,
			borderColor: C.border,
			paddingHorizontal: 14,
			paddingVertical: 12,
			color: C.text,
			fontSize: 15,
		},
		searchBtn: {
			backgroundColor: C.primary,
			borderRadius: 12,
			paddingHorizontal: 16,
			justifyContent: 'center',
			minWidth: 72,
			alignItems: 'center',
		},
		searchBtnText: { fontWeight: '700', color: '#000' },
		list: { padding: 16, paddingBottom: 40, gap: 12 },
		empty: {
			textAlign: 'center',
			color: C.textSecondary,
			marginTop: 40,
			fontSize: 14,
		},
		card: {
			backgroundColor: C.card,
			borderRadius: 16,
			borderWidth: 1,
			borderColor: C.border,
			padding: 16,
			marginBottom: 12,
		},
		email: { fontSize: 16, fontWeight: '700', color: C.text },
		meta: { fontSize: 13, color: C.textSecondary, marginTop: 4 },
		pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
		pill: {
			flexDirection: 'row',
			alignItems: 'center',
			gap: 4,
			paddingHorizontal: 8,
			paddingVertical: 3,
			borderRadius: 999,
		},
		pillOk: { backgroundColor: `${C.primary}26` },
		pillOff: { backgroundColor: `${C.textSecondary}26` },
		pillLife: { backgroundColor: `${C.info}26` },
		pillAdmin: { backgroundColor: `${C.accent}26` },
		pillPhotos: { backgroundColor: `${C.primary}1A` },
		pillText: { fontSize: 11, fontWeight: '700' },
		expires: { marginTop: 8, fontSize: 12, color: C.textSecondary },
		sectionLabel: {
			marginTop: 14,
			marginBottom: 2,
			fontSize: 12,
			fontWeight: '700',
			color: C.textSecondary,
			textTransform: 'uppercase',
			letterSpacing: 0.4,
		},
		chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
		chip: {
			backgroundColor: C.cardLight,
			paddingHorizontal: 12,
			paddingVertical: 8,
			borderRadius: 10,
			borderWidth: 1,
			borderColor: C.border,
		},
		chipDanger: { backgroundColor: `${C.error}1F`, borderColor: `${C.error}40` },
		chipLife: { backgroundColor: `${C.info}1F`, borderColor: `${C.info}40` },
		chipText: { color: C.text, fontWeight: '600', fontSize: 13 },
		customRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
		customInput: {
			flex: 1,
			backgroundColor: C.inputBg,
			borderRadius: 10,
			borderWidth: 1,
			borderColor: C.border,
			paddingHorizontal: 12,
			paddingVertical: 10,
			color: C.text,
		},
		customBtn: {
			backgroundColor: C.primary,
			borderRadius: 10,
			paddingHorizontal: 14,
			justifyContent: 'center',
		},
		customBtnSecondary: {
			backgroundColor: C.cardLight,
			borderWidth: 1,
			borderColor: C.border,
		},
		customBtnText: { fontWeight: '700', color: '#000' },
		customBtnTextSecondary: { fontWeight: '700', color: C.text },
	})
}
