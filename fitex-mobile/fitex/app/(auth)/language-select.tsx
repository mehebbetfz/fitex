import type { AppColors } from '@/constants/app-theme'
import { useLanguage } from '@/contexts/language-context'
import { useAppTheme } from '@/contexts/theme-context'
import { Language, LANGUAGE_NAMES } from '@/locales'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import React, { useMemo, useState } from 'react'
import {
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const LANGUAGES: Language[] = ['ru', 'en', 'az']

export default function LanguageSelectScreen() {
	const { setLanguage, t } = useLanguage()
	const { colors: C } = useAppTheme()
	const styles = useMemo(() => makeStyles(C), [C])
	const [selected, setSelected] = useState<Language | null>(null)
	const [loading, setLoading] = useState(false)

	const handleContinue = async () => {
		if (!selected || loading) return
		setLoading(true)
		try {
			await setLanguage(selected)
			router.replace('/')
		} catch {
			setLoading(false)
		}
	}

	return (
		<SafeAreaView style={styles.container} edges={['top', 'bottom']}>
			<View style={styles.header}>
				<Text style={styles.title}>{t('languageSelect', 'title')}</Text>
				<Text style={styles.subtitle}>{t('languageSelect', 'subtitle')}</Text>
			</View>

			<View style={styles.list}>
				{LANGUAGES.map(code => {
					const isSelected = selected === code
					return (
						<TouchableOpacity
							key={code}
							style={[styles.row, isSelected && styles.rowSelected]}
							onPress={() => setSelected(code)}
							activeOpacity={0.7}
						>
							<Text style={[styles.rowText, isSelected && styles.rowTextSelected]}>
								{LANGUAGE_NAMES[code]}
							</Text>
							{isSelected ? (
								<Ionicons name='checkmark' size={20} color={C.primary} />
							) : (
								<View style={styles.checkPlaceholder} />
							)}
						</TouchableOpacity>
					)
				})}
			</View>

			<View style={styles.footer}>
				<TouchableOpacity
					style={[styles.btn, !selected && styles.btnDisabled]}
					onPress={handleContinue}
					disabled={!selected || loading}
					activeOpacity={0.85}
				>
					<Text style={[styles.btnText, !selected && styles.btnTextDisabled]}>
						{loading ? t('common', 'loading') : t('languageSelect', 'continue')}
					</Text>
				</TouchableOpacity>
			</View>
		</SafeAreaView>
	)
}

function makeStyles(C: AppColors) {
	return StyleSheet.create({
		container: {
			flex: 1,
			backgroundColor: C.background,
			paddingHorizontal: 24,
		},
		header: {
			paddingTop: 48,
			paddingBottom: 36,
		},
		title: {
			fontSize: 28,
			fontWeight: '700',
			color: C.text,
			letterSpacing: -0.4,
			marginBottom: 8,
		},
		subtitle: {
			fontSize: 15,
			color: C.textSecondary,
			lineHeight: 22,
		},
		list: {
			flex: 1,
			gap: 4,
		},
		row: {
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'space-between',
			paddingVertical: 18,
			paddingHorizontal: 4,
			borderBottomWidth: StyleSheet.hairlineWidth,
			borderBottomColor: C.border,
		},
		rowSelected: {
			borderBottomColor: C.primary,
		},
		rowText: {
			fontSize: 18,
			fontWeight: '500',
			color: C.text,
		},
		rowTextSelected: {
			color: C.primary,
			fontWeight: '600',
		},
		checkPlaceholder: {
			width: 20,
			height: 20,
		},
		footer: {
			paddingBottom: 12,
			paddingTop: 20,
		},
		btn: {
			backgroundColor: C.primary,
			borderRadius: 14,
			paddingVertical: 16,
			alignItems: 'center',
		},
		btnDisabled: {
			backgroundColor: C.cardLight,
		},
		btnText: {
			color: '#000',
			fontSize: 16,
			fontWeight: '700',
		},
		btnTextDisabled: {
			color: C.textSecondary,
		},
	})
}
