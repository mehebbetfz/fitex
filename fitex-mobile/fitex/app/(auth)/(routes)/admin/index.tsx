import { useLanguage } from '@/contexts/language-context'
import {
	adminGrantPremium,
	adminSearchUsers,
	type AdminUser,
	type PremiumDuration,
} from '@/services/admin'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useCallback, useState } from 'react'
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

const COLORS = {
	bg: '#121212',
	card: '#1C1C1E',
	border: '#2C2C2E',
	text: '#FFF',
	muted: '#8E8E93',
	green: '#34C759',
	red: '#FF3B30',
	orange: '#FF9500',
	blue: '#5AC8FA',
} as const

const PRESETS: { id: PremiumDuration; label: string }[] = [
	{ id: '7d', label: '7д' },
	{ id: '30d', label: '30д' },
	{ id: '90d', label: '90д' },
	{ id: '180d', label: '180д' },
	{ id: '365d', label: '1г' },
	{ id: 'lifetime', label: '∞' },
	{ id: 'revoke', label: 'Снять' },
]

export default function AdminScreen() {
	const router = useRouter()
	const { t } = useLanguage()
	const [q, setQ] = useState('')
	const [loading, setLoading] = useState(false)
	const [busyId, setBusyId] = useState<string | null>(null)
	const [users, setUsers] = useState<AdminUser[]>([])
	const [customDays, setCustomDays] = useState<Record<string, string>>({})

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

	const renderUser = ({ item }: { item: AdminUser }) => {
		const name = [item.firstName, item.lastName].filter(Boolean).join(' ') || '—'
		const expires = item.premiumLifetime
			? '∞'
			: item.premiumExpiresAt
				? new Date(item.premiumExpiresAt).toLocaleDateString()
				: '—'
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
								{ color: item.premiumActive ? COLORS.green : COLORS.muted },
							]}
						>
							{item.premiumActive ? 'Premium' : 'Free'}
						</Text>
					</View>
					{item.premiumLifetime ? (
						<View style={[styles.pill, styles.pillLife]}>
							<Text style={[styles.pillText, { color: COLORS.blue }]}>∞</Text>
						</View>
					) : null}
					{item.role === 'admin' ? (
						<View style={[styles.pill, styles.pillAdmin]}>
							<Text style={[styles.pillText, { color: COLORS.orange }]}>
								admin
							</Text>
						</View>
					) : null}
				</View>
				<Text style={styles.expires}>до: {expires}</Text>

				{busyId === item.id ? (
					<ActivityIndicator color={COLORS.green} style={{ marginTop: 12 }} />
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
											p.id === 'revoke' && { color: COLORS.red },
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
								placeholderTextColor={COLORS.muted}
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
					</>
				)}
			</View>
		)
	}

	return (
		<SafeAreaView style={styles.safe} edges={['top']}>
			<View style={styles.header}>
				<TouchableOpacity onPress={() => router.back()} hitSlop={10}>
					<Ionicons name='arrow-back' size={24} color={COLORS.text} />
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
					placeholderTextColor={COLORS.muted}
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
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
	safe: { flex: 1, backgroundColor: COLORS.bg },
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 16,
		paddingVertical: 12,
	},
	title: { fontSize: 18, fontWeight: '700', color: COLORS.text },
	searchRow: {
		flexDirection: 'row',
		gap: 10,
		paddingHorizontal: 16,
		marginBottom: 8,
	},
	search: {
		flex: 1,
		backgroundColor: COLORS.card,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: COLORS.border,
		paddingHorizontal: 14,
		paddingVertical: 12,
		color: COLORS.text,
		fontSize: 15,
	},
	searchBtn: {
		backgroundColor: COLORS.green,
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
		color: COLORS.muted,
		marginTop: 40,
		fontSize: 14,
	},
	card: {
		backgroundColor: COLORS.card,
		borderRadius: 16,
		borderWidth: 1,
		borderColor: COLORS.border,
		padding: 16,
		marginBottom: 12,
	},
	email: { fontSize: 16, fontWeight: '700', color: COLORS.text },
	meta: { fontSize: 13, color: COLORS.muted, marginTop: 4 },
	pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
	pill: {
		paddingHorizontal: 8,
		paddingVertical: 3,
		borderRadius: 999,
	},
	pillOk: { backgroundColor: 'rgba(52,199,89,0.15)' },
	pillOff: { backgroundColor: 'rgba(142,142,147,0.15)' },
	pillLife: { backgroundColor: 'rgba(90,200,250,0.15)' },
	pillAdmin: { backgroundColor: 'rgba(255,149,0,0.15)' },
	pillText: { fontSize: 11, fontWeight: '700' },
	expires: { marginTop: 8, fontSize: 12, color: COLORS.muted },
	chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
	chip: {
		backgroundColor: '#2C2C2E',
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 10,
	},
	chipDanger: { backgroundColor: 'rgba(255,59,48,0.12)' },
	chipLife: { backgroundColor: 'rgba(90,200,250,0.12)' },
	chipText: { color: COLORS.text, fontWeight: '600', fontSize: 13 },
	customRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
	customInput: {
		flex: 1,
		backgroundColor: '#111',
		borderRadius: 10,
		borderWidth: 1,
		borderColor: COLORS.border,
		paddingHorizontal: 12,
		paddingVertical: 10,
		color: COLORS.text,
	},
	customBtn: {
		backgroundColor: COLORS.green,
		borderRadius: 10,
		paddingHorizontal: 16,
		justifyContent: 'center',
	},
	customBtnText: { fontWeight: '700', color: '#000' },
})
