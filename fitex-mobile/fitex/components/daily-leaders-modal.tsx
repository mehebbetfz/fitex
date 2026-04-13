import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { Image, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export interface DailyLeaderRow {
	rank: number
	userId: string
	firstName: string
	lastName: string
	avatarUrl?: string | null
	totalScore: number
	isPremium: boolean
	isCurrentUser: boolean
}

const C = {
	bg: '#121212',
	card: '#1C1C1E',
	border: '#3A3A3C',
	text: '#FFFFFF',
	sub: '#8E8E93',
	primary: '#34C759',
	gold: '#FFD700',
} as const

type TFn = (ns: 'leaderboard' | 'common', key: string) => string

const PremiumDiamondBadge = ({ diameter = 16 }: { diameter?: number }) => (
	<LinearGradient
		colors={['#FFE566', '#FFD700', '#E6A800']}
		start={{ x: 0, y: 0 }}
		end={{ x: 1, y: 1 }}
		style={{
			position: 'absolute',
			top: -2,
			right: -2,
			width: diameter,
			height: diameter,
			borderRadius: diameter / 2,
			alignItems: 'center',
			justifyContent: 'center',
			borderWidth: 2,
			borderColor: C.card,
			zIndex: 6,
		}}
	>
		<Ionicons name='diamond' size={Math.max(7, diameter * 0.48)} color='#1a1a1a' />
	</LinearGradient>
)

function RowAvatar({
	uri,
	name,
	isCurrentUser,
	isPremium,
}: {
	uri?: string | null
	name: string
	isCurrentUser: boolean
	isPremium: boolean
}) {
	const size = 36
	const initials = name.trim().slice(0, 2).toUpperCase() || '?'
	const ringW = isCurrentUser ? 2.5 : 0
	const badgeD = Math.max(15, Math.round(size * 0.4))

	const inner = uri ? (
		<Image
			source={{ uri }}
			style={{ width: size, height: size, borderRadius: size / 2 }}
			resizeMode='cover'
		/>
	) : (
		<View style={[rowAv.placeholder, { width: size, height: size, borderRadius: size / 2 }]}>
			<Text style={[rowAv.initials, { fontSize: size * 0.36 }]}>{initials}</Text>
		</View>
	)

	const core = (
		<View
			style={{
				width: size,
				height: size,
				borderRadius: size / 2,
				overflow: 'hidden',
				backgroundColor: '#2C2C2E',
			}}
		>
			{inner}
		</View>
	)

	const body =
		ringW > 0 ? (
			<LinearGradient
				colors={['#34C759', '#2CAE4E']}
				style={{
					width: size + ringW * 2,
					height: size + ringW * 2,
					borderRadius: (size + ringW * 2) / 2,
					padding: ringW,
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
				{core}
			</LinearGradient>
		) : (
			core
		)

	return (
		<View
			style={{
				position: 'relative',
				width: ringW ? size + ringW * 2 : size,
				height: ringW ? size + ringW * 2 : size,
			}}
		>
			{body}
			{isPremium ? <PremiumDiamondBadge diameter={badgeD} /> : null}
		</View>
	)
}

const rowAv = StyleSheet.create({
	placeholder: { backgroundColor: '#3A3A3C', alignItems: 'center', justifyContent: 'center' },
	initials: { color: '#fff', fontWeight: '700' },
})

export default function DailyLeadersModal({
	visible,
	onClose,
	entries,
	t,
}: {
	visible: boolean
	onClose: () => void
	entries: DailyLeaderRow[]
	t: TFn
}) {
	const router = useRouter()
	const { top, bottom } = useSafeAreaInsets()

	const openFull = () => {
		onClose()
		router.push('/(auth)/(routes)/leaderboard')
	}

	return (
		<Modal visible={visible} animationType='fade' transparent onRequestClose={onClose}>
			<Pressable style={styles.backdrop} onPress={onClose}>
				<Pressable style={[styles.sheet, { marginTop: top + 24, marginBottom: bottom + 16 }]} onPress={e => e.stopPropagation()}>
					<LinearGradient
						colors={['rgba(255, 215, 0, 0.18)', 'rgba(52, 199, 89, 0.08)', 'transparent']}
						start={{ x: 0, y: 0 }}
						end={{ x: 1, y: 0 }}
						style={styles.sheetGlow}
					/>
					<View style={styles.sheetHeader}>
						<View style={styles.sheetIconWrap}>
							<Ionicons name='podium' size={26} color={C.gold} />
						</View>
						<View style={{ flex: 1 }}>
							<Text style={styles.sheetTitle}>{t('leaderboard', 'dailyLeadersTitle')}</Text>
							<Text style={styles.sheetSub}>{t('leaderboard', 'dailyLeadersSubtitle')}</Text>
						</View>
					</View>

					<ScrollView
						style={styles.scroll}
						showsVerticalScrollIndicator={false}
						contentContainerStyle={styles.scrollContent}
					>
						{entries.map(row => {
								const name = [row.firstName, row.lastName].filter(Boolean).join(' ') || '—'
								return (
									<View
										key={row.userId}
										style={[
											styles.row,
											row.isPremium && styles.rowPremium,
											row.isCurrentUser && styles.rowYou,
										]}
									>
										<Text style={[styles.rank, row.rank <= 3 && { color: C.gold }]}>
											{row.rank <= 3 ? `#${row.rank}` : `${row.rank}.`}
										</Text>
										<RowAvatar
											uri={row.avatarUrl}
											name={row.firstName || '?'}
											isCurrentUser={row.isCurrentUser}
											isPremium={row.isPremium}
										/>
										<View style={{ flex: 1, minWidth: 0 }}>
											<View style={styles.nameLine}>
												<Text style={styles.name} numberOfLines={1}>
													{name}
												</Text>
												{row.isCurrentUser && (
													<View style={styles.youChip}>
														<Text style={styles.youChipText}>{t('leaderboard', 'you')}</Text>
													</View>
												)}
											</View>
										</View>
										<Text style={styles.score}>
											{row.totalScore >= 1000
												? `${(row.totalScore / 1000).toFixed(1)}k`
												: row.totalScore}
										</Text>
									</View>
								)
							})}
					</ScrollView>

					<View style={styles.actions}>
						<TouchableOpacity style={styles.btnSecondary} onPress={openFull} activeOpacity={0.85}>
							<Ionicons name='open-outline' size={18} color={C.primary} />
							<Text style={styles.btnSecondaryText}>{t('leaderboard', 'openLeaderboard')}</Text>
						</TouchableOpacity>
						<TouchableOpacity style={styles.btnPrimary} onPress={onClose} activeOpacity={0.88}>
							<Text style={styles.btnPrimaryText}>{t('common', 'ok')}</Text>
						</TouchableOpacity>
					</View>
				</Pressable>
			</Pressable>
		</Modal>
	)
}

const styles = StyleSheet.create({
	backdrop: {
		flex: 1,
		backgroundColor: 'rgba(0,0,0,0.72)',
		justifyContent: 'center',
		paddingHorizontal: 20,
	},
	sheet: {
		backgroundColor: C.card,
		borderRadius: 22,
		borderWidth: 1,
		borderColor: 'rgba(255,215,0,0.35)',
		overflow: 'hidden',
		maxHeight: '78%',
		...Platform.select({
			ios: {
				shadowColor: '#000',
				shadowOffset: { width: 0, height: 12 },
				shadowOpacity: 0.45,
				shadowRadius: 24,
			},
			android: { elevation: 16 },
		}),
	},
	sheetGlow: {
		...StyleSheet.absoluteFillObject,
		opacity: 0.9,
	},
	sheetHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 14,
		paddingHorizontal: 18,
		paddingTop: 18,
		paddingBottom: 12,
	},
	sheetIconWrap: {
		width: 48,
		height: 48,
		borderRadius: 14,
		backgroundColor: 'rgba(255,215,0,0.15)',
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: 1,
		borderColor: 'rgba(255,215,0,0.4)',
	},
	sheetTitle: {
		fontSize: 18,
		fontWeight: '800',
		color: C.text,
		letterSpacing: 0.2,
	},
	sheetSub: {
		fontSize: 13,
		color: C.sub,
		marginTop: 4,
		lineHeight: 18,
	},
	scroll: { maxHeight: 340 },
	scrollContent: { paddingHorizontal: 14, paddingBottom: 8 },
	row: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 10,
		paddingVertical: 10,
		paddingHorizontal: 12,
		marginBottom: 6,
		backgroundColor: 'rgba(255,255,255,0.04)',
		borderRadius: 14,
		borderWidth: 1,
		borderColor: 'rgba(255,255,255,0.06)',
	},
	rowYou: {
		borderColor: 'rgba(52, 199, 89, 0.45)',
		backgroundColor: 'rgba(52, 199, 89, 0.08)',
	},
	rowPremium: {
		borderColor: 'rgba(255, 215, 0, 0.35)',
		backgroundColor: 'rgba(255, 215, 0, 0.06)',
	},
	rank: { fontSize: 14, fontWeight: '800', color: C.sub, width: 36 },
	nameLine: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
	name: { fontSize: 14, fontWeight: '700', color: C.text, flexShrink: 1 },
	youChip: {
		backgroundColor: `${C.primary}28`,
		paddingHorizontal: 6,
		paddingVertical: 2,
		borderRadius: 6,
	},
	youChipText: { fontSize: 9, fontWeight: '800', color: C.primary },
	score: { fontSize: 15, fontWeight: '800', color: C.primary, minWidth: 44, textAlign: 'right' },
	actions: {
		flexDirection: 'row',
		gap: 10,
		paddingHorizontal: 14,
		paddingTop: 10,
		paddingBottom: 16,
		borderTopWidth: StyleSheet.hairlineWidth,
		borderTopColor: 'rgba(255,255,255,0.1)',
	},
	btnPrimary: {
		flex: 1,
		backgroundColor: C.primary,
		paddingVertical: 14,
		borderRadius: 14,
		alignItems: 'center',
	},
	btnPrimaryText: { fontSize: 16, fontWeight: '800', color: '#fff' },
	btnSecondary: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 6,
		paddingVertical: 14,
		borderRadius: 14,
		borderWidth: 1,
		borderColor: 'rgba(52, 199, 89, 0.45)',
		backgroundColor: 'rgba(52, 199, 89, 0.08)',
	},
	btnSecondaryText: { fontSize: 14, fontWeight: '700', color: C.primary },
})

export const DAILY_LEADERS_STORAGE_KEY = '@fitex/daily_leaders_modal_date_v1'
