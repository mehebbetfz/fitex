import { dateLocaleFor } from '@/locales'
import {
	statsHistoryColorsFromTheme,
	statsHistoryThemeFromApp,
	type StatsHistoryTheme,
} from '@/constants/stats-history-theme'
import { useLanguage } from '@/contexts/language-context'
import { useAppTheme } from '@/contexts/theme-context'
import { fetchFoodHistory, type FoodEntry } from '@/services/nutrition'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect } from 'expo-router'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
	ActivityIndicator,
	Animated,
	Image,
	RefreshControl,
	SectionList,
	StyleSheet,
	Text,
	View,
} from 'react-native'

const PAGE = 30

type DaySection = {
	title: string
	dateKey: string
	data: FoodEntry[]
	totals: {
		calories: number
		proteinG: number
		carbsG: number
		fatG: number
	}
}

const useShimmer = () => {
	const anim = useRef(new Animated.Value(0)).current
	useEffect(() => {
		const loop = Animated.loop(
			Animated.sequence([
				Animated.timing(anim, { toValue: 1, duration: 750, useNativeDriver: true }),
				Animated.timing(anim, { toValue: 0, duration: 750, useNativeDriver: true }),
			]),
		)
		loop.start()
		return () => loop.stop()
	}, [anim])
	return anim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.7] })
}

const ShimmerBlock = ({ style }: { style: object }) => {
	const opacity = useShimmer()
	return <Animated.View style={[style, { opacity }]} />
}

function FoodCardSkeleton() {
	const { colors, resolved } = useAppTheme()
	const T = useMemo(() => statsHistoryThemeFromApp(colors, resolved), [colors, resolved])
	const COLORS = useMemo(() => statsHistoryColorsFromTheme(T), [T])
	const styles = useMemo(() => makeStyles(T, COLORS), [T, COLORS])
	const sk = colors.skeleton
	return (
		<View style={styles.card}>
			<ShimmerBlock
				style={{
					width: 48,
					height: 48,
					borderRadius: 12,
					backgroundColor: sk,
					marginRight: 12,
				}}
			/>
			<View style={{ flex: 1, gap: 8 }}>
				<ShimmerBlock
					style={{ height: 15, width: '70%', borderRadius: 5, backgroundColor: sk }}
				/>
				<ShimmerBlock
					style={{ height: 12, width: '45%', borderRadius: 4, backgroundColor: sk }}
				/>
			</View>
			<ShimmerBlock
				style={{ height: 16, width: 40, borderRadius: 5, backgroundColor: sk }}
			/>
		</View>
	)
}

function entryDateKey(entry: FoodEntry): string {
	if (entry.date && /^\d{4}-\d{2}-\d{2}/.test(entry.date)) {
		return entry.date.slice(0, 10)
	}
	if (entry.createdAt) {
		const d = new Date(entry.createdAt)
		if (Number.isFinite(d.getTime())) {
			return d.toLocaleDateString('en-CA')
		}
	}
	return entry.date || 'unknown'
}

function formatDayHeading(
	dateKey: string,
	locale: string,
	todayLabel: string,
	yesterdayLabel: string,
): string {
	try {
		const base = new Date(`${dateKey}T12:00:00`)
		if (!Number.isFinite(base.getTime())) return dateKey
		const today = new Date()
		const yesterday = new Date(today)
		yesterday.setDate(yesterday.getDate() - 1)
		if (base.toDateString() === today.toDateString()) return todayLabel
		if (base.toDateString() === yesterday.toDateString()) return yesterdayLabel
		return base.toLocaleDateString(locale, {
			weekday: 'short',
			day: 'numeric',
			month: 'long',
			year: base.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
		})
	} catch {
		return dateKey
	}
}

function formatMealTime(createdAt: string | undefined, locale: string): string {
	if (!createdAt) return ''
	try {
		const d = new Date(createdAt)
		if (!Number.isFinite(d.getTime())) return ''
		return d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })
	} catch {
		return ''
	}
}

function groupEntriesByDay(
	entries: FoodEntry[],
	locale: string,
	todayLabel: string,
	yesterdayLabel: string,
): DaySection[] {
	const map = new Map<string, FoodEntry[]>()
	for (const entry of entries) {
		const key = entryDateKey(entry)
		const list = map.get(key)
		if (list) list.push(entry)
		else map.set(key, [entry])
	}

	const keys = [...map.keys()].sort((a, b) => (a < b ? 1 : a > b ? -1 : 0))

	return keys.map(dateKey => {
		const data = [...(map.get(dateKey) ?? [])].sort((a, b) => {
			const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0
			const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0
			return tb - ta
		})
		const totals = data.reduce(
			(acc, e) => ({
				calories: acc.calories + (e.calories || 0),
				proteinG: acc.proteinG + (e.proteinG || 0),
				carbsG: acc.carbsG + (e.carbsG || 0),
				fatG: acc.fatG + (e.fatG || 0),
			}),
			{ calories: 0, proteinG: 0, carbsG: 0, fatG: 0 },
		)
		return {
			dateKey,
			title: formatDayHeading(dateKey, locale, todayLabel, yesterdayLabel),
			data,
			totals,
		}
	})
}

type Props = {
	onCountChange?: (count: number) => void
}

export default function FoodHistoryPanel({ onCountChange }: Props) {
	const { colors, resolved } = useAppTheme()
	const T = useMemo(() => statsHistoryThemeFromApp(colors, resolved), [colors, resolved])
	const COLORS = useMemo(() => statsHistoryColorsFromTheme(T), [T])
	const styles = useMemo(() => makeStyles(T, COLORS), [T, COLORS])
	const { t, language } = useLanguage()
	const locale = dateLocaleFor(language)

	const [entries, setEntries] = useState<FoodEntry[]>([])
	const [cursor, setCursor] = useState<string | null>(null)
	const [initialLoading, setInitialLoading] = useState(true)
	const [loadingMore, setLoadingMore] = useState(false)
	const [refreshing, setRefreshing] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const mealWord = useCallback(
		(count: number) => {
			if (language === 'ru') {
				if (count % 10 === 1 && count % 100 !== 11) return t('history', 'meal1')
				if (
					[2, 3, 4].includes(count % 10) &&
					![12, 13, 14].includes(count % 100)
				) {
					return t('history', 'meal2')
				}
				return t('history', 'meal5')
			}
			return count === 1 ? t('history', 'meal1') : t('history', 'meal5')
		},
		[language, t],
	)

	const sections = useMemo(
		() =>
			groupEntriesByDay(
				entries,
				locale,
				t('exercises', 'today'),
				t('exercises', 'yesterday'),
			),
		[entries, locale, t],
	)

	const load = useCallback(
		async (mode: 'reset' | 'more') => {
			if (mode === 'more') {
				if (!cursor || loadingMore) return
				setLoadingMore(true)
			} else if (mode === 'reset' && !refreshing) {
				setInitialLoading(true)
			}
			try {
				setError(null)
				const res = await fetchFoodHistory({
					limit: PAGE,
					before: mode === 'more' ? cursor ?? undefined : undefined,
				})
				setEntries(prev => {
					if (mode !== 'more') return res.entries
					const seen = new Set(prev.map(e => e.id))
					const next = res.entries.filter(e => e.id && !seen.has(e.id))
					return [...prev, ...next]
				})
				setCursor(res.nextCursor)
				if (mode !== 'more') onCountChange?.(res.entries.length)
			} catch (e) {
				setError(e instanceof Error ? e.message : String(e))
				if (mode !== 'more') {
					setEntries([])
					onCountChange?.(0)
				}
			} finally {
				setInitialLoading(false)
				setLoadingMore(false)
				setRefreshing(false)
			}
		},
		[cursor, loadingMore, refreshing, onCountChange],
	)

	const onRefresh = useCallback(async () => {
		setRefreshing(true)
		setCursor(null)
		try {
			const res = await fetchFoodHistory({ limit: PAGE })
			setEntries(res.entries)
			setCursor(res.nextCursor)
			setError(null)
			onCountChange?.(res.entries.length)
		} catch (e) {
			setError(e instanceof Error ? e.message : String(e))
		} finally {
			setRefreshing(false)
			setInitialLoading(false)
		}
	}, [onCountChange])

	useFocusEffect(
		useCallback(() => {
			void onRefresh()
		}, [onRefresh]),
	)

	useEffect(() => {
		onCountChange?.(entries.length)
	}, [entries.length, onCountChange])

	if (initialLoading) {
		return (
			<View style={[styles.listFlex, styles.listPad]}>
				{[0, 1, 2, 3, 4].map(i => (
					<FoodCardSkeleton key={i} />
				))}
			</View>
		)
	}

	return (
		<SectionList
			style={styles.listFlex}
			sections={sections}
			keyExtractor={(item, i) => item.id || `f-${i}`}
			stickySectionHeadersEnabled
			contentContainerStyle={styles.listContent}
			showsVerticalScrollIndicator={false}
			onEndReached={() => {
				if (cursor) void load('more')
			}}
			onEndReachedThreshold={0.35}
			refreshControl={
				<RefreshControl
					refreshing={refreshing}
					onRefresh={() => void onRefresh()}
					tintColor={COLORS.primary}
					colors={[COLORS.primary]}
				/>
			}
			ListFooterComponent={
				loadingMore ? (
					<View style={styles.footer}>
						<ActivityIndicator size='small' color={COLORS.primary} />
						<Text style={styles.footerText}>{t('history', 'foodLoading')}</Text>
					</View>
				) : null
			}
			ListEmptyComponent={
				<View style={styles.empty}>
					<View style={styles.emptyIcon}>
						<Ionicons name='restaurant-outline' size={36} color={COLORS.primary} />
					</View>
					<Text style={styles.emptyTitle}>{error ? error : t('history', 'noFood')}</Text>
					<Text style={styles.emptyBody}>{t('history', 'noFoodBody')}</Text>
				</View>
			}
			renderSectionHeader={({ section }) => (
				<View style={styles.dayHeader}>
					<View style={styles.dayHeaderTop}>
						<Text style={styles.dayTitle}>{section.title}</Text>
						<Text style={styles.dayKcal}>
							{Math.round(section.totals.calories)} kcal
						</Text>
					</View>
					<Text style={styles.dayMacros}>
						{Math.round(section.totals.proteinG)}P ·{' '}
						{Math.round(section.totals.carbsG)}C ·{' '}
						{Math.round(section.totals.fatG)}F · {section.data.length}{' '}
						{mealWord(section.data.length)}
					</Text>
				</View>
			)}
			renderItem={({ item, index, section }) => {
				const time = formatMealTime(item.createdAt, locale)
				const isLast = index === section.data.length - 1
				return (
					<View style={[styles.card, isLast && styles.cardLastInDay]}>
						{item.photoUrl ? (
							<Image source={{ uri: item.photoUrl }} style={styles.thumb} />
						) : (
							<View style={[styles.thumb, styles.thumbPh]}>
								<Ionicons
									name='fast-food-outline'
									size={22}
									color={COLORS.textSecondary}
								/>
							</View>
						)}
						<View style={styles.meta}>
							<Text style={styles.name} numberOfLines={1}>
								{item.name}
							</Text>
							<Text style={styles.sub} numberOfLines={1}>
								{time ? `${time} · ` : ''}
								{Math.round(item.proteinG)}P · {Math.round(item.carbsG)}C ·{' '}
								{Math.round(item.fatG)}F
							</Text>
						</View>
						<Text style={styles.kcal}>{Math.round(item.calories)}</Text>
					</View>
				)
			}}
		/>
	)
}

function makeStyles(
	T: StatsHistoryTheme,
	COLORS: ReturnType<typeof statsHistoryColorsFromTheme>,
) {
	return StyleSheet.create({
		listFlex: { flex: 1 },
		listPad: { paddingHorizontal: 10, paddingTop: 8 },
		listContent: { paddingHorizontal: 10, paddingBottom: 96, paddingTop: 4, flexGrow: 1 },
		dayHeader: {
			backgroundColor: T.background,
			paddingTop: 14,
			paddingBottom: 8,
			paddingHorizontal: 2,
		},
		dayHeaderTop: {
			flexDirection: 'row',
			alignItems: 'baseline',
			justifyContent: 'space-between',
			gap: 12,
		},
		dayTitle: {
			flex: 1,
			fontSize: 16,
			fontWeight: '800',
			color: T.text,
			textTransform: 'capitalize',
		},
		dayKcal: {
			fontSize: 14,
			fontWeight: '700',
			color: COLORS.primary,
		},
		dayMacros: {
			marginTop: 3,
			fontSize: 12,
			color: COLORS.textSecondary,
		},
		card: {
			flexDirection: 'row',
			alignItems: 'center',
			backgroundColor: COLORS.card,
			borderRadius: 16,
			padding: 12,
			marginBottom: 8,
			borderWidth: 1,
			borderColor: COLORS.border,
		},
		cardLastInDay: {
			marginBottom: 4,
		},
		thumb: {
			width: 48,
			height: 48,
			borderRadius: 12,
			backgroundColor: COLORS.cardLight,
			marginRight: 12,
		},
		thumbPh: { alignItems: 'center', justifyContent: 'center' },
		meta: { flex: 1, paddingRight: 8 },
		name: { fontSize: 15, fontWeight: '600', color: T.text },
		sub: { marginTop: 3, fontSize: 12, color: COLORS.textSecondary },
		kcal: { fontSize: 15, fontWeight: '700', color: T.text },
		footer: {
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'center',
			gap: 8,
			paddingVertical: 16,
		},
		footerText: { fontSize: 13, color: COLORS.textSecondary },
		empty: { alignItems: 'center', paddingTop: 48, paddingHorizontal: 28 },
		emptyIcon: {
			width: 72,
			height: 72,
			borderRadius: 36,
			backgroundColor: `${COLORS.primary}1A`,
			alignItems: 'center',
			justifyContent: 'center',
			marginBottom: 14,
		},
		emptyTitle: { fontSize: 17, fontWeight: '700', color: T.text, textAlign: 'center' },
		emptyBody: {
			marginTop: 8,
			fontSize: 14,
			color: COLORS.textSecondary,
			textAlign: 'center',
			lineHeight: 20,
		},
	})
}
