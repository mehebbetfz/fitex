/**
 * Проверка EAS / expo-updates: при доступном OTA показываем модальное окно обновления.
 */
import { useLanguage } from '@/contexts/language-context'
import { Ionicons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Updates from 'expo-updates'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
	ActivityIndicator,
	AppState,
	Modal,
	Platform,
	Pressable,
	StyleSheet,
	Text,
	View,
} from 'react-native'

const DISMISS_KEY = '@fitex_ota_dismissed_manifest_id'
const MIN_CHECK_INTERVAL_MS = 45_000

function getManifestId(manifest: Updates.Manifest | undefined): string | null {
	if (!manifest || typeof manifest !== 'object') return null
	const m = manifest as { id?: string; createdAt?: string; runtimeVersion?: string; metadata?: { updateId?: string } }
	if (m.id) return m.id
	if (m.metadata?.updateId) return m.metadata.updateId
	if (m.createdAt != null) return String(m.createdAt)
	if (m.runtimeVersion) return m.runtimeVersion
	return null
}

export default function OtaUpdateGate() {
	const { t } = useLanguage()
	const [visible, setVisible] = useState(false)
	const [loading, setLoading] = useState(false)
	const [fetchError, setFetchError] = useState<string | null>(null)
	const [pendingManifestId, setPendingManifestId] = useState<string | null>(null)
	const lastCheckRef = useRef(0)
	const checkingRef = useRef(false)

	const runCheck = useCallback(async () => {
		if (Platform.OS === 'web') return
		if (!Updates.isEnabled) return
		if (__DEV__) return

		const now = Date.now()
		if (now - lastCheckRef.current < MIN_CHECK_INTERVAL_MS) return
		if (checkingRef.current) return
		checkingRef.current = true
		lastCheckRef.current = now

		try {
			const result = await Updates.checkForUpdateAsync()
			if (!result.isAvailable) return

			const newId = getManifestId(result.manifest)
			if (newId) {
				const dismissed = await AsyncStorage.getItem(DISMISS_KEY)
				if (dismissed === newId) return
			}

			setFetchError(null)
			setPendingManifestId(newId)
			setVisible(true)
		} catch (e) {
			console.warn('[OTA] checkForUpdateAsync failed', e)
		} finally {
			checkingRef.current = false
		}
	}, [])

	useEffect(() => {
		runCheck()
		const sub = AppState.addEventListener('change', state => {
			if (state === 'active') runCheck()
		})
		return () => sub.remove()
	}, [runCheck])

	const onLater = async () => {
		if (pendingManifestId) {
			try {
				await AsyncStorage.setItem(DISMISS_KEY, pendingManifestId)
			} catch {
				/* ignore */
			}
		}
		setVisible(false)
		setLoading(false)
	}

	const onUpdate = async () => {
		setFetchError(null)
		setLoading(true)
		try {
			const fetched = await Updates.fetchUpdateAsync()
			if (fetched.isNew) {
				await Updates.reloadAsync()
				return
			}
			setVisible(false)
			setPendingManifestId(null)
		} catch (e) {
			console.warn('[OTA] fetchUpdateAsync failed', e)
			setFetchError(t('common', 'otaUpdateError'))
		} finally {
			setLoading(false)
		}
	}

	if (Platform.OS === 'web' || !Updates.isEnabled) return null
	if (__DEV__) return null

	return (
		<Modal visible={visible} transparent animationType='fade' onRequestClose={loading ? undefined : onLater}>
			<Pressable style={styles.overlay} onPress={loading ? undefined : onLater}>
				<Pressable style={styles.card} onPress={e => e.stopPropagation()}>
					<View style={styles.iconWrap}>
						<Ionicons name='cloud-download-outline' size={40} color='#34C759' />
					</View>
					<Text style={styles.title}>{t('common', 'otaUpdateTitle')}</Text>
					<Text style={styles.message}>{t('common', 'otaUpdateMessage')}</Text>
					{fetchError ? <Text style={styles.error}>{fetchError}</Text> : null}
					{loading ? (
						<View style={styles.loadingRow}>
							<ActivityIndicator size='small' color='#34C759' style={styles.loadingSpinner} />
							<Text style={styles.loadingText}>{t('common', 'otaUpdating')}</Text>
						</View>
					) : (
						<View style={styles.buttons}>
							<Pressable style={[styles.btn, styles.btnSecondary, styles.btnLeft]} onPress={onLater}>
								<Text style={styles.btnSecondaryText}>{t('common', 'otaUpdateLater')}</Text>
							</Pressable>
							<Pressable style={[styles.btn, styles.btnPrimary, styles.btnRight]} onPress={onUpdate}>
								<Text style={styles.btnPrimaryText}>{t('common', 'otaUpdateNow')}</Text>
							</Pressable>
						</View>
					)}
				</Pressable>
			</Pressable>
		</Modal>
	)
}

const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		backgroundColor: 'rgba(0,0,0,0.72)',
		justifyContent: 'center',
		alignItems: 'center',
		padding: 24,
	},
	card: {
		width: '100%',
		maxWidth: 360,
		backgroundColor: '#1C1C1E',
		borderRadius: 16,
		padding: 22,
		borderWidth: 1,
		borderColor: '#3A3A3C',
	},
	iconWrap: {
		alignSelf: 'center',
		marginBottom: 14,
	},
	title: {
		color: '#FFF',
		fontSize: 20,
		fontWeight: '700',
		textAlign: 'center',
		marginBottom: 10,
	},
	message: {
		color: '#AEAEB2',
		fontSize: 15,
		lineHeight: 22,
		textAlign: 'center',
		marginBottom: 12,
	},
	error: {
		color: '#FF453A',
		fontSize: 14,
		textAlign: 'center',
		marginBottom: 16,
	},
	loadingRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: 8,
	},
	loadingSpinner: {
		marginRight: 10,
	},
	loadingText: {
		color: '#AEAEB2',
		fontSize: 15,
	},
	buttons: {
		flexDirection: 'row',
	},
	btn: {
		flex: 1,
		paddingVertical: 14,
		borderRadius: 12,
		alignItems: 'center',
	},
	btnLeft: {
		marginRight: 6,
	},
	btnRight: {
		marginLeft: 6,
	},
	btnPrimary: {
		backgroundColor: '#34C759',
	},
	btnPrimaryText: {
		color: '#000',
		fontWeight: '700',
		fontSize: 16,
	},
	btnSecondary: {
		backgroundColor: '#2C2C2E',
		borderWidth: 1,
		borderColor: '#3A3A3C',
	},
	btnSecondaryText: {
		color: '#FFF',
		fontWeight: '600',
		fontSize: 16,
	},
})
