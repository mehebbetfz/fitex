export type ThemePreference = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

export type AppColors = {
	primary: string
	primaryDark: string
	background: string
	card: string
	cardLight: string
	border: string
	text: string
	textSecondary: string
	textTertiary: string
	accent: string
	error: string
	warning: string
	info: string
	success: string
	/** Tab bar / overlay gradients */
	tabBarTop: string
	tabBarBottom: string
	tabBarBorder: string
	track: string
	inputBg: string
	skeleton: string
	overlay: string
	modalSurface: string
}

export const darkColors: AppColors = {
	primary: '#34C759',
	primaryDark: '#2CAE4E',
	background: '#222226',
	card: '#2C2C30',
	cardLight: '#3A3A40',
	border: '#48484E',
	text: '#FFFFFF',
	textSecondary: '#A1A1A6',
	textTertiary: '#8E8E93',
	accent: '#FF9500',
	error: '#FF3B30',
	warning: '#FF9500',
	info: '#5AC8FA',
	success: '#34C759',
	tabBarTop: 'rgba(34, 34, 38, 0.96)',
	tabBarBottom: 'rgba(34, 34, 38, 0.98)',
	tabBarBorder: 'rgba(255, 255, 255, 0.1)',
	track: 'rgba(255,255,255,0.1)',
	inputBg: '#3A3A40',
	skeleton: 'rgba(255,255,255,0.1)',
	overlay: 'rgba(0,0,0,0.55)',
	modalSurface: '#2C2C30',
}

export const lightColors: AppColors = {
	primary: '#34C759',
	primaryDark: '#2CAE4E',
	background: '#F2F2F7',
	card: '#FFFFFF',
	cardLight: '#E5E5EA',
	border: '#D1D1D6',
	text: '#1C1C1E',
	textSecondary: '#6C6C70',
	textTertiary: '#8E8E93',
	accent: '#FF9500',
	error: '#FF3B30',
	warning: '#FF9500',
	info: '#007AFF',
	success: '#34C759',
	tabBarTop: 'rgba(255, 255, 255, 0.94)',
	tabBarBottom: 'rgba(242, 242, 247, 0.98)',
	tabBarBorder: 'rgba(0, 0, 0, 0.08)',
	track: 'rgba(0,0,0,0.08)',
	inputBg: '#FFFFFF',
	skeleton: 'rgba(0,0,0,0.08)',
	overlay: 'rgba(0,0,0,0.45)',
	modalSurface: '#FFFFFF',
}

export function colorsFor(scheme: ResolvedTheme): AppColors {
	return scheme === 'light' ? lightColors : darkColors
}
