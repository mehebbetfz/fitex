import {
	HEATMAP_LEVEL_COLORS,
	type HeatmapCell,
	type HeatmapLevel,
	type HeatmapWeek,
	buildMonthLabels,
} from '@/scripts/activity-heatmap'
import { STATS_HISTORY_COLORS as COLORS, STATS_HISTORY_THEME as T } from '@/constants/stats-history-theme'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import {
	Alert,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native'

const CELL = 11
const GAP = 3
const COL_W = CELL + GAP

type Props = {
	weeks: HeatmapWeek[]
	locale: string
	title: string
	lessLabel: string
	moreLabel: string
	/** Format: "{count}" placeholder for sets */
	daySetsTemplate: string
	formatDate: (isoDate: string) => string
}

export default function ActivityHeatmap({
	weeks,
	locale,
	title,
	lessLabel,
	moreLabel,
	daySetsTemplate,
	formatDate,
}: Props) {
	const scrollRef = useRef<ScrollView>(null)
	const monthLabels = useMemo(
		() => buildMonthLabels(weeks, locale),
		[weeks, locale],
	)

	useEffect(() => {
		const t = setTimeout(() => {
			scrollRef.current?.scrollToEnd({ animated: false })
		}, 50)
		return () => clearTimeout(t)
	}, [weeks])

	const onPressCell = useCallback(
		(cell: HeatmapCell) => {
			if (cell.empty || cell.sets <= 0) return
			const setsText = daySetsTemplate.replace('{count}', String(cell.sets))
			Alert.alert(formatDate(cell.date), setsText)
		},
		[daySetsTemplate, formatDate],
	)

	const levels: HeatmapLevel[] = [0, 1, 2, 3, 4]

	return (
		<View style={styles.wrap}>
			<Text style={styles.title}>{title}</Text>
			<ScrollView
				ref={scrollRef}
				horizontal
				showsHorizontalScrollIndicator={false}
				contentContainerStyle={styles.scrollContent}
			>
				<View>
					<View style={[styles.monthsRow, { width: weeks.length * COL_W }]}>
						{monthLabels.map(({ weekIndex, label }) => (
							<Text
								key={`${weekIndex}-${label}`}
								style={[styles.monthLabel, { left: weekIndex * COL_W }]}
								numberOfLines={1}
							>
								{label}
							</Text>
						))}
					</View>
					<View style={styles.gridRow}>
						{weeks.map((week, wi) => (
							<View key={wi} style={styles.weekCol}>
								{week.map(cell => (
									<TouchableOpacity
										key={cell.date}
										activeOpacity={cell.sets > 0 ? 0.7 : 1}
										disabled={cell.empty || cell.sets <= 0}
										onPress={() => onPressCell(cell)}
										style={[
											styles.cell,
											{
												backgroundColor: cell.empty
													? 'transparent'
													: HEATMAP_LEVEL_COLORS[cell.level],
												opacity: cell.empty ? 0 : 1,
											},
										]}
									/>
								))}
							</View>
						))}
					</View>
				</View>
			</ScrollView>
			<View style={styles.legend}>
				<Text style={styles.legendText}>{lessLabel}</Text>
				{levels.map(level => (
					<View
						key={level}
						style={[
							styles.legendCell,
							{ backgroundColor: HEATMAP_LEVEL_COLORS[level] },
						]}
					/>
				))}
				<Text style={styles.legendText}>{moreLabel}</Text>
			</View>
		</View>
	)
}

const styles = StyleSheet.create({
	wrap: {
		marginHorizontal: 10,
		marginTop: 8,
		marginBottom: 4,
		backgroundColor: COLORS.card,
		borderRadius: 14,
		borderWidth: 1,
		borderColor: COLORS.border,
		paddingHorizontal: 12,
		paddingTop: 12,
		paddingBottom: 10,
	},
	title: {
		fontSize: 14,
		fontWeight: '700',
		color: COLORS.text,
		marginBottom: 10,
	},
	scrollContent: {
		paddingBottom: 4,
	},
	monthsRow: {
		height: 16,
		marginBottom: 4,
		position: 'relative',
	},
	monthLabel: {
		position: 'absolute',
		top: 0,
		fontSize: 10,
		color: T.textSecondary,
		fontWeight: '600',
	},
	gridRow: {
		flexDirection: 'row',
		gap: GAP,
	},
	weekCol: {
		width: CELL,
		gap: GAP,
	},
	cell: {
		width: CELL,
		height: CELL,
		borderRadius: 2,
	},
	legend: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'flex-end',
		gap: 4,
		marginTop: 10,
	},
	legendText: {
		fontSize: 10,
		color: T.textSecondary,
		marginHorizontal: 2,
	},
	legendCell: {
		width: 10,
		height: 10,
		borderRadius: 2,
	},
})
