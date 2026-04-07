import { useDatabase } from '@/app/contexts/database-context'
import { SyncMeta, SyncHistoryEntry, SYNC_META_KEY } from '@/app/contexts/database-context'
import { useAuth } from '@/app/contexts/auth-context'
import PremiumGate from '@/app/components/premium-gate'
import { useLanguage } from '@/contexts/language-context'
import { api } from '@/services/api'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Network from 'expo-network'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useCallback, useEffect, useState } from 'react'
import {
	ActivityIndicator,
	Alert,
	Animated,
	RefreshControl,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as db from '@/scripts/database'

// ─── Constants ────────────────────────────────────────────────────────────────

const C = {
	bg:      '#121212',
	card:    '#1C1C1E',
	card2:   '#2C2C2E',
	border:  '#3A3A3C',
	text:    '#FFFFFF',
	sub:     '#8E8E93',
	primary: '#34C759',
	warn:    '#FF9500',
	error:   '#FF3B30',
	blue:    '#5AC8FA',
} as const

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtDate = (iso: string, lang: string): string => {
	try {
		const d = new Date(iso)
		const localeMap: Record<string, string> = { ru: 'ru-RU', en: 'en-US', az: 'az-AZ' }
		return d.toLocaleString(localeMap[lang] ?? 'en-US', {
			day: '2-digit', month: 'short', year: 'numeric',
			hour: '2-digit', minute: '2-digit',
		})
	} catch {
		return iso
	}
}

const timeAgo = (iso: string, lang: string): string => {
	const ms  = Date.now() - new Date(iso).getTime()
	const min = Math.floor(ms / 60000)
	const hr  = Math.floor(min / 60)
	const day = Math.floor(hr / 24)
	if (lang === 'ru') {
		if (min < 1)  return 'только что'
		if (min < 60) return `${min} мин. назад`
		if (hr < 24)  return `${hr} ч. назад`
		return `${day} д. назад`
	} else if (lang === 'az') {
		if (min < 1)  return 'indicə'
		if (min < 60) return `${min} dəq. əvvəl`
		if (hr < 24)  return `${hr} saat əvvəl`
		return `${day} gün əvvəl`
	} else {
		if (min < 1)  return 'just now'
		if (min < 60) return `${min}m ago`
		if (hr < 24)  return `${hr}h ago`
		return `${day}d ago`
	}
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface LocalCounts {
	workoutsTotal:      number
	workoutsSynced:     number
	workoutsPending:    number
	measurementsTotal:  number
	measurementsSynced: number
	measurementsPending:number
	recordsTotal:       number
	recordsSynced:      number
	recordsPending:     number
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatusDot = ({ status }: { status: 'success' | 'error' | 'never' }) => {
	const color = status === 'success' ? C.primary : status === 'error' ? C.error : C.sub
	return (
		<View style={[sd.dot, { backgroundColor: color }]} />
	)
}
const sd = StyleSheet.create({
	dot: { width: 10, height: 10, borderRadius: 5 },
})

const ProgressBar = ({ value, total, color }: { value: number; total: number; color: string }) => {
	const pct = total > 0 ? Math.min(1, value / total) : 0
	return (
		<View style={pb.track}>
			<Animated.View style={[pb.fill, { width: `${pct * 100}%`, backgroundColor: color }]} />
		</View>
	)
}
const pb = StyleSheet.create({
	track: { height: 6, backgroundColor: '#2C2C2E', borderRadius: 3, overflow: 'hidden', flex: 1 },
	fill:  { height: 6, borderRadius: 3 },
})

// ─── Data row ─────────────────────────────────────────────────────────────────

const DataRow = ({
	icon, iconColor, label,
	total, synced, pending,
	t,
}: {
	icon: string; iconColor: string; label: string
	total: number; synced: number; pending: number
	t: ReturnType<typeof useLanguage>['t']
}) => (
	<View style={dr.wrap}>
		<View style={dr.top}>
			<View style={[dr.iconWrap, { backgroundColor: `${iconColor}18` }]}>
				<Ionicons name={icon as any} size={18} color={iconColor} />
			</View>
			<View style={{ flex: 1 }}>
				<View style={dr.labelRow}>
					<Text style={dr.label}>{label}</Text>
					<View style={dr.badges}>
						{synced > 0 && (
							<View style={[dr.badge, { backgroundColor: `${C.primary}20` }]}>
								<Ionicons name='checkmark-circle' size={10} color={C.primary} />
								<Text style={[dr.badgeText, { color: C.primary }]}>{synced}</Text>
							</View>
						)}
						{pending > 0 && (
							<View style={[dr.badge, { backgroundColor: `${C.warn}20` }]}>
								<Ionicons name='time-outline' size={10} color={C.warn} />
								<Text style={[dr.badgeText, { color: C.warn }]}>{pending}</Text>
							</View>
						)}
					</View>
				</View>
				<ProgressBar value={synced} total={total} color={C.primary} />
				<View style={dr.stats}>
					<Text style={dr.stat}>
						{t('sync', 'total')}: <Text style={{ color: C.text }}>{total}</Text>
					</Text>
					<Text style={dr.stat}>
						{t('sync', 'inSync')}: <Text style={{ color: C.primary }}>{synced}</Text>
					</Text>
					{pending > 0 && (
						<Text style={dr.stat}>
							{t('sync', 'notSynced')}: <Text style={{ color: C.warn }}>{pending}</Text>
						</Text>
					)}
				</View>
			</View>
		</View>
	</View>
)

const dr = StyleSheet.create({
	wrap: { gap: 6 },
	top: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
	iconWrap: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
	labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
	label: { fontSize: 14, fontWeight: '600', color: C.text },
	badges: { flexDirection: 'row', gap: 4 },
	badge: { flexDirection: 'row', alignItems: 'center', gap: 3, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 },
	badgeText: { fontSize: 10, fontWeight: '700' },
	stats: { flexDirection: 'row', gap: 12, marginTop: 4 },
	stat: { fontSize: 11, color: C.sub },
})

// ─── History item ─────────────────────────────────────────────────────────────

const HistoryItem = ({ entry, language }: { entry: SyncHistoryEntry; language: string }) => {
	const ok = entry.result === 'success'
	return (
		<View style={hi.row}>
			<View style={[hi.dot, { backgroundColor: ok ? C.primary : C.error }]} />
			<View style={{ flex: 1 }}>
				<Text style={hi.date}>{fmtDate(entry.at, language)}</Text>
				<Text style={hi.sub}>
					{ok
						? `+${entry.workouts}w  +${entry.measurements}m  +${entry.records}r`
						: '—'}
				</Text>
			</View>
			<View style={[hi.badge, { backgroundColor: ok ? `${C.primary}18` : `${C.error}18` }]}>
				<Ionicons
					name={ok ? 'checkmark-circle' : 'close-circle'}
					size={14}
					color={ok ? C.primary : C.error}
				/>
			</View>
		</View>
	)
}

const hi = StyleSheet.create({
	row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
	dot: { width: 8, height: 8, borderRadius: 4 },
	date: { fontSize: 13, color: C.text, fontWeight: '600' },
	sub: { fontSize: 11, color: C.sub, marginTop: 2 },
	badge: { borderRadius: 8, padding: 4 },
})

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function SyncStatsScreen() {
	const { t, language } = useLanguage()
	const { user } = useAuth()
	const { syncWithServer } = useDatabase()

	const [meta, setMeta]     = useState<SyncMeta | null>(null)
	const [counts, setCounts] = useState<LocalCounts | null>(null)
	const [loading, setLoading]   = useState(true)
	const [syncing, setSyncing]   = useState(false)
	const [refreshing, setRefreshing] = useState(false)
	const [online, setOnline] = useState(true)

	const loadData = useCallback(async () => {
		try {
			// Load sync meta from AsyncStorage
			const raw = await AsyncStorage.getItem(SYNC_META_KEY)
			setMeta(raw ? JSON.parse(raw) : null)

			// Load local counts from SQLite
			const [allWorkouts, unsyncedWorkouts, allMeasurements, unsyncedMeasurements, allRecords, unsyncedRecords] =
				await Promise.all([
					db.getWorkouts(),
					db.getWorkouts(undefined, undefined, { synced: false }),
					db.getBodyMeasurements(),
					db.getBodyMeasurements({ synced: false }),
					db.getPersonalRecords(),
					db.getPersonalRecords({ synced: false }),
				])

			setCounts({
				workoutsTotal:       allWorkouts.length,
				workoutsSynced:      allWorkouts.length - unsyncedWorkouts.length,
				workoutsPending:     unsyncedWorkouts.length,
				measurementsTotal:   allMeasurements.length,
				measurementsSynced:  allMeasurements.length - unsyncedMeasurements.length,
				measurementsPending: unsyncedMeasurements.length,
				recordsTotal:        allRecords.length,
				recordsSynced:       allRecords.length - unsyncedRecords.length,
				recordsPending:      unsyncedRecords.length,
			})

			const net = await Network.getNetworkStateAsync()
			setOnline(!!(net.isConnected && net.isInternetReachable))
		} catch (e) {
			console.error(e)
		} finally {
			setLoading(false)
			setRefreshing(false)
		}
	}, [])

	useEffect(() => { loadData() }, [loadData])

	if (!user?.isPremium) return <PremiumGate featureIcon='cloud-upload-outline' featureColor='#5AC8FA' />

	const onRefresh = () => { setRefreshing(true); loadData() }

	const handleSync = async () => {
		if (!user?.isPremium) {
			Alert.alert(t('sync', 'premiumRequired'))
			return
		}
		if (!online) {
			Alert.alert(t('sync', 'offlineMsg'))
			return
		}
		setSyncing(true)
		try {
			await syncWithServer(true)
			await loadData()
		} finally {
			setSyncing(false)
		}
	}

	const status = meta?.lastSyncResult ?? 'never'
	const statusColor = status === 'success' ? C.primary : status === 'error' ? C.error : C.sub
	const statusLabel = t('sync', status === 'success' ? 'statusSuccess' : status === 'error' ? 'statusError' : 'statusNever')

	const totalPending = (counts?.workoutsPending ?? 0) + (counts?.measurementsPending ?? 0) + (counts?.recordsPending ?? 0)

	return (
		<SafeAreaView style={s.safe} edges={['top', 'left', 'right']}>
			{/* Header */}
			<View style={s.header}>
				<TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
					<Ionicons name='chevron-back' size={26} color={C.text} />
				</TouchableOpacity>
				<Text style={s.title}>{t('sync', 'statsTitle')}</Text>
				<TouchableOpacity onPress={() => { setRefreshing(true); loadData() }} style={s.backBtn}>
					<Ionicons name='refresh-outline' size={22} color={C.sub} />
				</TouchableOpacity>
			</View>

			{loading ? (
				<View style={s.loader}>
					<ActivityIndicator size='large' color={C.primary} />
				</View>
			) : (
				<ScrollView
					contentContainerStyle={s.scroll}
					showsVerticalScrollIndicator={false}
					refreshControl={
						<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.primary} />
					}
				>
					{/* Status card */}
					<View style={[s.card, s.statusCard, { borderColor: `${statusColor}40` }]}>
						<View style={s.statusRow}>
							<View style={[s.statusIconWrap, { backgroundColor: `${statusColor}18` }]}>
								<Ionicons
									name={
										status === 'success' ? 'cloud-done-outline'
										: status === 'error' ? 'cloud-offline-outline'
										: 'cloud-outline'
									}
									size={32}
									color={statusColor}
								/>
							</View>
							<View style={{ flex: 1, gap: 4 }}>
								<View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
									<StatusDot status={status} />
									<Text style={[s.statusLabel, { color: statusColor }]}>{statusLabel}</Text>
									{!online && (
										<View style={s.offlineBadge}>
											<Ionicons name='wifi-outline' size={10} color={C.warn} />
											<Text style={s.offlineText}>{t('sync', 'offlineMsg')}</Text>
										</View>
									)}
								</View>
								<Text style={s.lastSyncLabel}>{t('sync', 'lastSync')}</Text>
								<Text style={s.lastSyncVal}>
									{meta?.lastSyncAt
										? fmtDate(meta.lastSyncAt, language ?? 'en')
										: t('sync', 'neverSynced')}
								</Text>
								{meta?.lastSyncAt && (
									<Text style={s.timeAgo}>{timeAgo(meta.lastSyncAt, language ?? 'en')}</Text>
								)}
							</View>
						</View>

						{/* Pending chip */}
						{totalPending > 0 && (
							<View style={s.pendingChip}>
								<Ionicons name='time-outline' size={14} color={C.warn} />
								<Text style={s.pendingChipText}>
									{totalPending} {t('sync', 'pending')}
								</Text>
							</View>
						)}
					</View>

					{/* Sync now button */}
					{user?.isPremium && (
						<TouchableOpacity
							style={[s.syncBtn, (!online || syncing) && s.syncBtnDisabled]}
							onPress={handleSync}
							disabled={syncing || !online}
							activeOpacity={0.8}
						>
							{syncing ? (
								<ActivityIndicator size='small' color='#000' />
							) : (
								<Ionicons name='cloud-upload-outline' size={18} color='#000' />
							)}
							<Text style={s.syncBtnText}>{t('sync', 'syncNow')}</Text>
						</TouchableOpacity>
					)}

					{/* Data breakdown */}
					<View style={s.card}>
						<Text style={s.sectionTitle}>{t('sync', 'dataBreakdown')}</Text>
						{counts && (
							<View style={{ gap: 18, marginTop: 14 }}>
								<View style={s.divider} />
								<DataRow
									icon='barbell-outline'
									iconColor='#34C759'
									label={t('sync', 'workouts')}
									total={counts.workoutsTotal}
									synced={counts.workoutsSynced}
									pending={counts.workoutsPending}
									t={t}
								/>
								<View style={s.divider} />
								<DataRow
									icon='body-outline'
									iconColor='#5AC8FA'
									label={t('sync', 'measurements')}
									total={counts.measurementsTotal}
									synced={counts.measurementsSynced}
									pending={counts.measurementsPending}
									t={t}
								/>
								<View style={s.divider} />
								<DataRow
									icon='trophy-outline'
									iconColor='#FFD700'
									label={t('sync', 'records')}
									total={counts.recordsTotal}
									synced={counts.recordsSynced}
									pending={counts.recordsPending}
									t={t}
								/>
							</View>
						)}
					</View>

					{/* Cloud info */}
					<View style={s.cloudInfoCard}>
						<Ionicons name='information-circle-outline' size={16} color={C.blue} />
						<Text style={s.cloudInfoText}>{t('sync', 'cloudInfo')}</Text>
					</View>

					{/* Sync history */}
					<View style={s.card}>
						<Text style={s.sectionTitle}>{t('sync', 'history')}</Text>
						{meta?.history && meta.history.length > 0 ? (
							<View style={{ marginTop: 8, gap: 0 }}>
								{meta.history.map((entry, idx) => (
									<View key={idx}>
										<HistoryItem entry={entry} language={language ?? 'en'} />
										{idx < meta.history.length - 1 && <View style={s.divider} />}
									</View>
								))}
							</View>
						) : (
							<View style={s.emptyHistory}>
								<Ionicons name='time-outline' size={28} color={C.sub} />
								<Text style={s.emptyHistoryText}>{t('sync', 'historyEmpty')}</Text>
							</View>
						)}
					</View>

					<View style={{ height: 40 }} />
				</ScrollView>
			)}
		</SafeAreaView>
	)
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
	safe: { flex: 1, backgroundColor: C.bg },

	header: {
		flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
		paddingHorizontal: 16, paddingVertical: 12,
	},
	backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
	title: { fontSize: 18, fontWeight: '800', color: C.text },

	loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },

	scroll: { paddingHorizontal: 16, gap: 14 },

	card: {
		backgroundColor: C.card, borderRadius: 16, padding: 16,
	},
	statusCard: {
		borderWidth: 1.5, gap: 12,
	},
	statusRow: { flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
	statusIconWrap: {
		width: 60, height: 60, borderRadius: 16,
		alignItems: 'center', justifyContent: 'center',
	},
	statusLabel: { fontSize: 16, fontWeight: '800' },
	lastSyncLabel: { fontSize: 11, color: C.sub },
	lastSyncVal: { fontSize: 13, color: C.text, fontWeight: '600' },
	timeAgo: { fontSize: 11, color: C.sub },

	offlineBadge: {
		flexDirection: 'row', alignItems: 'center', gap: 3,
		backgroundColor: `${C.warn}20`, borderRadius: 6,
		paddingHorizontal: 5, paddingVertical: 2,
	},
	offlineText: { fontSize: 9, color: C.warn, fontWeight: '700' },

	pendingChip: {
		flexDirection: 'row', alignItems: 'center', gap: 6,
		backgroundColor: `${C.warn}15`, borderRadius: 10,
		paddingHorizontal: 10, paddingVertical: 7,
		alignSelf: 'flex-start',
	},
	pendingChipText: { fontSize: 12, color: C.warn, fontWeight: '700' },

	syncBtn: {
		flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
		gap: 8, backgroundColor: C.primary, borderRadius: 14,
		paddingVertical: 14,
	},
	syncBtnDisabled: { opacity: 0.5 },
	syncBtnText: { fontSize: 15, fontWeight: '800', color: '#000' },

	sectionTitle: { fontSize: 15, fontWeight: '700', color: C.text },
	divider: { height: 1, backgroundColor: C.border },

	cloudInfoCard: {
		flexDirection: 'row', alignItems: 'flex-start', gap: 8,
		backgroundColor: `${C.blue}12`, borderRadius: 12,
		padding: 12, borderWidth: 1, borderColor: `${C.blue}25`,
	},
	cloudInfoText: { fontSize: 12, color: C.sub, flex: 1, lineHeight: 17 },

	emptyHistory: { alignItems: 'center', gap: 8, paddingVertical: 20 },
	emptyHistoryText: { fontSize: 13, color: C.sub },
})
