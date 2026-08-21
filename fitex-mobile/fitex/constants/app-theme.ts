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
	background: '#121212',
	card: '#1C1C1E',
	cardLight: '#2C2C2E',
	border: '#3A3A3C',
	text: '#FFFFFF',
	textSecondary: '#8E8E93',
	textTertiary: '#636366',
	accent: '#FF9500',
	error: '#FF3B30',
	warning: '#FF9500',
	info: '#5AC8FA',
	success: '#34C759',
	tabBarTop: 'rgba(18, 18, 18, 0.96)',
	tabBarBottom: 'rgba(18, 18, 18, 0.98)',
	tabBarBorder: 'rgba(255, 255, 255, 0.08)',
	track: 'rgba(255,255,255,0.08)',
	inputBg: '#2C2C2E',
	skeleton: 'rgba(255,255,255,0.08)',
	overlay: 'rgba(0,0,0,0.72)',
	modalSurface: '#1E1E1E',
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
