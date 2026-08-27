import type { AppColors, ResolvedTheme } from '@/constants/app-theme'
import { darkColors, lightColors } from '@/constants/app-theme'

/**
 * Палитра вкладки «История» / деталей тренировки — следует app light/dark.
 */
export type StatsHistoryTheme = {
	background: string
	surface: string
	surfaceElevated: string
	surfaceMuted: string
	chipInactive: string
	border: string
	borderSubtle: string
	borderHairline: string
	borderLegacy: string
	primary: string
	primaryDark: string
	text: string
	textSecondary: string
	textTertiary: string
	textMuted: string
	error: string
	warning: string
	info: string
	success: string
	greenAccent: string
	pillBg: string
	pillBorder: string
	statCellBg: string
	statCellBorder: string
	gold: string
	modalSurface: string
}

function fromApp(c: AppColors, isDark: boolean): StatsHistoryTheme {
	return {
		background: c.background,
		surface: c.card,
		surfaceElevated: c.card,
		surfaceMuted: c.cardLight,
		chipInactive: isDark ? '#2A2A2E' : '#E5E5EA',
		border: c.border,
		borderSubtle: c.cardLight,
		borderHairline: c.cardLight,
		borderLegacy: c.cardLight,
		primary: c.primary,
		primaryDark: c.primaryDark,
		text: c.text,
		textSecondary: c.textSecondary,
		textTertiary: c.textTertiary,
		textMuted: isDark ? '#AEAEB2' : '#8E8E93',
		error: c.error,
		warning: c.warning,
		info: c.info,
		success: c.success,
		greenAccent: c.primary,
		pillBg: 'rgba(52, 199, 89, 0.1)',
		pillBorder: 'rgba(52, 199, 89, 0.2)',
		statCellBg: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
		statCellBorder: c.cardLight,
		gold: '#FFD60A',
		modalSurface: c.modalSurface,
	}
}

/** @deprecated Prefer statsHistoryThemeFromApp / useAppTheme */
export const STATS_HISTORY_THEME = fromApp(darkColors, true)

export const STATS_HISTORY_THEME_LIGHT = fromApp(lightColors, false)

export function statsHistoryThemeFromApp(
	colors: AppColors,
	resolved: ResolvedTheme = 'dark',
): StatsHistoryTheme {
	return fromApp(colors, resolved === 'dark')
}

export function statsHistoryColorsFromTheme(T: StatsHistoryTheme) {
	return {
		green: T.greenAccent,
		primary: T.primary,
		primaryDark: T.primaryDark,
		background: T.background,
		card: T.surfaceElevated,
		cardLight: T.surfaceMuted,
		border: T.border,
		text: T.text,
		textSecondary: T.textSecondary,
		error: T.error,
		warning: T.warning,
		success: T.success,
		info: T.info,
		surface: T.surface,
	} as const
}

/** @deprecated Prefer statsHistoryColorsFromTheme */
export const STATS_HISTORY_COLORS = statsHistoryColorsFromTheme(STATS_HISTORY_THEME)
