import { useLanguage } from '@/contexts/language-context'
import { Language, LANGUAGE_FLAGS, LANGUAGE_NAMES } from '@/locales'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import React, { useState } from 'react'
import {
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const LANGUAGES: { code: Language; nativeName: string; localName: string }[] = [
	{ code: 'ru', nativeName: 'Русский', localName: 'Russian' },
	{ code: 'en', nativeName: 'English', localName: 'English' },
	{ code: 'az', nativeName: 'Azərbaycanca', localName: 'Azerbaijani' },
]

export default function LanguageSelectScreen() {
	const { setLanguage, t } = useLanguage()
	const [selected, setSelected] = useState<Language | null>(null)
	const [loading, setLoading] = useState(false)

	const handleContinue = async () => {
		if (!selected || loading) return
		setLoading(true)
		await setLanguage(selected)
		router.replace('/(tabs)')
	}

	return (
		<SafeAreaView style={styles.container}>
			{/* Header */}
			<View style={styles.header}>
				<LinearGradient
					colors={['rgba(52,199,89,0.15)', 'transparent']}
					style={styles.headerGlow}
				/>
				<View style={styles.iconWrap}>
					<Text style={styles.globeEmoji}>🌍</Text>
				</View>
				<Text style={styles.title}>{t('languageSelect', 'title')}</Text>
				<Text style={styles.subtitle}>{t('languageSelect', 'subtitle')}</Text>
			</View>

			{/* Language cards */}
			<View style={styles.languageList}>
				{LANGUAGES.map(lang => {
					const isSelected = selected === lang.code
					return (
						<TouchableOpacity
							key={lang.code}
							style={[styles.card, isSelected && styles.cardSelected]}
							onPress={() => setSelected(lang.code)}
							activeOpacity={0.75}
						>
							<View style={styles.cardLeft}>
								<Text style={styles.flag}>{LANGUAGE_FLAGS[lang.code]}</Text>
								<View>
									<Text style={[styles.nativeName, isSelected && styles.nativeNameSelected]}>
										{lang.nativeName}
									</Text>
									<Text style={styles.localName}>{LANGUAGE_NAMES[lang.code]}</Text>
								</View>
							</View>
							<View style={[styles.radio, isSelected && styles.radioSelected]}>
								{isSelected && (
									<View style={styles.radioDot} />
								)}
							</View>
						</TouchableOpacity>
					)
				})}
			</View>

			{/* Continue button */}
			<View style={styles.footer}>
				<TouchableOpacity
					style={[styles.btn, !selected && styles.btnDisabled]}
					onPress={handleContinue}
					disabled={!selected || loading}
					activeOpacity={0.8}
				>
					{loading ? (
						<Text style={styles.btnText}>{t('common', 'loading')}</Text>
					) : (
						<>
							<Text style={styles.btnText}>{t('languageSelect', 'continue')}</Text>
							<Ionicons name='arrow-forward' size={20} color='#fff' />
						</>
					)}
				</TouchableOpacity>
			</View>
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#121212',
	},
	header: {
		alignItems: 'center',
		paddingTop: 40,
		paddingBottom: 32,
		paddingHorizontal: 24,
		position: 'relative',
	},
	headerGlow: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		height: 200,
	},
	iconWrap: {
		width: 80,
		height: 80,
		borderRadius: 40,
		backgroundColor: 'rgba(52,199,89,0.12)',
		borderWidth: 1,
		borderColor: 'rgba(52,199,89,0.3)',
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: 20,
	},
	globeEmoji: {
		fontSize: 40,
	},
	title: {
		fontSize: 28,
		fontWeight: 'bold',
		color: '#FFFFFF',
		textAlign: 'center',
		marginBottom: 10,
	},
	subtitle: {
		fontSize: 15,
		color: '#8E8E93',
		textAlign: 'center',
		lineHeight: 22,
	},
	languageList: {
		flex: 1,
		paddingHorizontal: 20,
		gap: 12,
	},
	card: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		backgroundColor: '#1C1C1E',
		borderRadius: 20,
		padding: 20,
		borderWidth: 1.5,
		borderColor: '#2C2C2E',
	},
	cardSelected: {
		borderColor: '#34C759',
		backgroundColor: 'rgba(52,199,89,0.07)',
	},
	cardLeft: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 16,
	},
	flag: {
		fontSize: 38,
	},
	nativeName: {
		fontSize: 18,
		fontWeight: '600',
		color: '#FFFFFF',
		marginBottom: 2,
	},
	nativeNameSelected: {
		color: '#34C759',
	},
	localName: {
		fontSize: 13,
		color: '#8E8E93',
	},
	radio: {
		width: 24,
		height: 24,
		borderRadius: 12,
		borderWidth: 2,
		borderColor: '#3A3A3C',
		alignItems: 'center',
		justifyContent: 'center',
	},
	radioSelected: {
		borderColor: '#34C759',
	},
	radioDot: {
		width: 12,
		height: 12,
		borderRadius: 6,
		backgroundColor: '#34C759',
	},
	footer: {
		paddingHorizontal: 20,
		paddingBottom: 16,
		paddingTop: 12,
	},
	btn: {
		backgroundColor: '#34C759',
		borderRadius: 16,
		paddingVertical: 17,
		alignItems: 'center',
		justifyContent: 'center',
		flexDirection: 'row',
		gap: 8,
	},
	btnDisabled: {
		backgroundColor: '#2C2C2E',
	},
	btnText: {
		color: '#fff',
		fontSize: 17,
		fontWeight: '700',
	},
})
