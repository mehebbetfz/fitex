// components/CustomSplash.tsx
import { useLanguage } from '@/contexts/language-context'
import { mains } from '@/constants/images'
import {
	ImageBackground,
	StatusBar,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native'

export default function CustomSplash() {
	const { t } = useLanguage()
	return (
		<>
			<StatusBar barStyle='light-content' backgroundColor='#000' />
			<ImageBackground source={mains.main} style={styles.bg} resizeMode='cover'>
				{/* Основной контент */}
				<View style={styles.container}>
					{/* Верхняя часть с заголовком */}
					<View style={styles.topSection}>
						<View style={styles.titleContainer}>
							<Text style={styles.mainTitlem}>FITEX</Text>
							<Text style={styles.mainTitle}>GET BETTER</Text>
							<Text style={styles.mainTitle}>
								RESULTS <Text style={styles.highlight}>EASILY!</Text>
							</Text>
						</View>
					</View>

					{/* Нижняя часть с кнопкой */}
					<View style={styles.bottomSection}>
						<TouchableOpacity style={styles.button}>
							<Text style={styles.buttonText}>{t('splash', 'getStarted')}</Text>
						</TouchableOpacity>

						<View style={styles.footerNote}>
						<Text style={styles.footerText}>{t('splash', 'hasAccount')} </Text>
						<Text style={styles.footerLink}>{t('splash', 'signIn')}</Text>
						</View>
					</View>
				</View>

				{/* Градиентные наложения для лучшей читаемости */}
				<View style={styles.topGradient} />
				<View style={styles.bottomGradient} />
			</ImageBackground>
		</>
	)
}

const styles = StyleSheet.create({
	bg: {
		flex: 1,
		backgroundColor: '#000',
	},
	container: {
		flex: 1,
		justifyContent: 'space-between',
		paddingHorizontal: 24,
		paddingTop: 60,
		paddingBottom: 40,
	},
	topSection: {
		flex: 1,
		zIndex: 1000,
		justifyContent: 'flex-start',
	},
	titleContainer: {
		marginTop: 20,
	},
	mainTitle: {
		fontSize: 30,
		fontWeight: '800',
		color: '#FFFFFF',
		lineHeight: 30,
		letterSpacing: -0.5,
		textShadowColor: 'rgba(0, 0, 0, 0.5)',
		textShadowOffset: { width: 0, height: 2 },
		textShadowRadius: 4,
	},

	mainTitlem: {
		fontSize: 50,
		fontWeight: '800',
		color: '#0cdc28ff',
		lineHeight: 50,
		letterSpacing: -0.5,
		textShadowColor: 'rgba(0, 0, 0, 0.5)',
		textShadowOffset: { width: 0, height: 2 },
		textShadowRadius: 4,
	},
	highlight: {},
	middleSection: {
		flex: 1,
		justifyContent: 'center',
		maxWidth: '85%',
	},
	description: {
		fontSize: 18,
		fontWeight: '500',
		color: '#FFFFFF',
		lineHeight: 26,
		opacity: 0.95,
		textShadowColor: 'rgba(0, 0, 0, 0.4)',
		textShadowOffset: { width: 0, height: 1 },
		textShadowRadius: 2,
	},
	bottomSection: {
		flex: 1,
		justifyContent: 'flex-end',
		alignItems: 'center',
		zIndex: 1000,
	},
	button: {
		backgroundColor: '#27bb2aff',
		width: '100%',
		paddingVertical: 18,
		borderRadius: 16,
		alignItems: 'center',
		justifyContent: 'center',
		shadowColor: '#35ff46ff',
		shadowOffset: {
			width: 0,
			height: 8,
		},
		shadowOpacity: 0.3,
		shadowRadius: 16,
		elevation: 8,
	},
	buttonText: {
		fontSize: 18,
		fontWeight: '700',
		color: '#FFFFFF',
		letterSpacing: 0.5,
	},
	footerNote: {
		flexDirection: 'row',
		marginTop: 24,
		alignItems: 'center',
	},
	footerText: {
		fontSize: 16,
		color: 'rgba(255, 255, 255, 0.7)',
	},
	footerLink: {
		fontSize: 16,
		color: '#35ff3cff',
		fontWeight: '600',
	},
	topGradient: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		opacity: 0.4,
	},
	bottomGradient: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: 'rgba(0, 0, 0, 0.7)',
		opacity: 0.7,
	},
})
