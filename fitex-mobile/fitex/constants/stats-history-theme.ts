/**
 * Базовая палитра вкладки «Статистика» (прогресс). Экраны истории и деталей тренировки
 * используют те же токены, чтобы визуально совпадать со статистикой.
 */
export const STATS_HISTORY_THEME = {
	background: '#121212',
	surface: '#1C1C1E',
	surfaceElevated: '#1C1C1E',
	surfaceMuted: '#2C2C2E',
	chipInactive: '#1E1E1E',
	border: '#3A3A3C',
	borderSubtle: '#2C2C2E',
	borderHairline: '#2C2C2E',
	borderLegacy: '#2C2C2E',
	primary: '#34C759',
	primaryDark: '#2CAE4E',
	text: '#FFFFFF',
	textSecondary: '#8E8E93',
	textTertiary: '#636366',
	textMuted: '#AEAEB2',
	error: '#FF3B30',
	warning: '#FF9500',
	info: '#5AC8FA',
	success: '#34C759',
	greenAccent: '#1cd22eff',
	pillBg: 'rgba(52, 199, 89, 0.1)',
	pillBorder: 'rgba(52, 199, 89, 0.2)',
	statCellBg: 'rgba(255,255,255,0.04)',
	statCellBorder: '#2C2C2E',
	gold: '#FFD60A',
	modalSurface: '#1E1E1E',
} as const

export const STATS_HISTORY_COLORS = {
	green: STATS_HISTORY_THEME.greenAccent,
	primary: STATS_HISTORY_THEME.primary,
	primaryDark: STATS_HISTORY_THEME.primaryDark,
	background: STATS_HISTORY_THEME.background,
	card: STATS_HISTORY_THEME.surfaceElevated,
	cardLight: STATS_HISTORY_THEME.surfaceMuted,
	border: STATS_HISTORY_THEME.border,
	text: STATS_HISTORY_THEME.text,
	textSecondary: STATS_HISTORY_THEME.textSecondary,
	error: STATS_HISTORY_THEME.error,
	warning: STATS_HISTORY_THEME.warning,
	success: STATS_HISTORY_THEME.success,
	info: STATS_HISTORY_THEME.info,
	surface: STATS_HISTORY_THEME.surface,
} as const
