import type { AppColors } from '@/constants/app-theme'
import { useLanguage } from '@/contexts/language-context'
import { useAppTheme } from '@/contexts/theme-context'
import { LANGUAGE_CODES, LANGUAGE_FLAGS, LANGUAGE_NAMES, Language } from '@/locales'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import React, { useMemo, useState } from 'react'
import {
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

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

			<ScrollView
				style={styles.list}
				contentContainerStyle={styles.listContent}
				showsVerticalScrollIndicator={false}
			>
				{LANGUAGE_CODES.map(code => {
					const isSelected = selected === code
					return (
						<TouchableOpacity
							key={code}
							style={[styles.row, isSelected && styles.rowSelected]}
							onPress={() => setSelected(code)}
							activeOpacity={0.7}
						>
							<Text style={styles.flag}>{LANGUAGE_FLAGS[code]}</Text>
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
			</ScrollView>

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
		container: { flex: 1, backgroundColor: C.background },
		header: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 12 },
		title: { fontSize: 28, fontWeight: '800', color: C.text },
		subtitle: { fontSize: 15, color: C.textSecondary, marginTop: 8, lineHeight: 22 },
		list: { flex: 1 },
		listContent: { paddingHorizontal: 16, paddingBottom: 16, gap: 8 },
		row: {
			flexDirection: 'row',
			alignItems: 'center',
			gap: 12,
			paddingVertical: 14,
			paddingHorizontal: 14,
			borderRadius: 14,
			backgroundColor: C.card,
			borderWidth: 1,
			borderColor: C.border,
		},
		rowSelected: {
			borderColor: C.primary,
			backgroundColor: `${C.primary}14`,
		},
		flag: { fontSize: 22 },
		rowText: { flex: 1, fontSize: 16, fontWeight: '600', color: C.text },
		rowTextSelected: { color: C.primary },
		checkPlaceholder: { width: 20, height: 20 },
		footer: { paddingHorizontal: 24, paddingVertical: 16 },
		btn: {
			backgroundColor: C.primary,
			borderRadius: 14,
			paddingVertical: 16,
			alignItems: 'center',
		},
		btnDisabled: { backgroundColor: C.cardLight },
		btnText: { fontSize: 16, fontWeight: '800', color: '#000' },
		btnTextDisabled: { color: C.textSecondary },
	})
}
