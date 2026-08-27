import { requireOptionalNativeModule } from 'expo-modules-core'

type ExpoAudio = typeof import('expo-av').Audio
type ExpoSound = import('expo-av').Audio.Sound
type InterruptionModeIOS = typeof import('expo-av').InterruptionModeIOS
type InterruptionModeAndroid = typeof import('expo-av').InterruptionModeAndroid

let AudioMod: ExpoAudio | null | undefined
let InterruptionModeIOSMod: InterruptionModeIOS | null = null
let InterruptionModeAndroidMod: InterruptionModeAndroid | null = null
let sound: ExpoSound | null = null
let loading: Promise<ExpoSound | null> | null = null
let modeReady = false

/**
 * OTA-safe: expo-av needs a native build. If ExpoAV / ExponentAV is absent,
 * skip sound instead of crashing when opening the workout screen.
 */
function getAudio(): ExpoAudio | null {
	if (AudioMod !== undefined) return AudioMod

	const hasNative =
		requireOptionalNativeModule('ExponentAV') != null ||
		requireOptionalNativeModule('ExpoAV') != null

	if (!hasNative) {
		AudioMod = null
		return null
	}

	try {
		// eslint-disable-next-line @typescript-eslint/no-require-imports
		const av = require('expo-av') as typeof import('expo-av')
		AudioMod = av.Audio
		InterruptionModeIOSMod = av.InterruptionModeIOS
		InterruptionModeAndroidMod = av.InterruptionModeAndroid
		return AudioMod
	} catch {
		AudioMod = null
		return null
	}
}

async function ensureAudioMode(Audio: ExpoAudio) {
	if (modeReady) return
	await Audio.setAudioModeAsync({
		playsInSilentModeIOS: true,
		allowsRecordingIOS: false,
		staysActiveInBackground: false,
		shouldDuckAndroid: true,
		playThroughEarpieceAndroid: false,
		...(InterruptionModeIOSMod
			? { interruptionModeIOS: InterruptionModeIOSMod.MixWithOthers }
			: {}),
		...(InterruptionModeAndroidMod
			? { interruptionModeAndroid: InterruptionModeAndroidMod.DuckOthers }
			: {}),
	})
	modeReady = true
}

async function loadSound(): Promise<ExpoSound | null> {
	const Audio = getAudio()
	if (!Audio) return null
	if (sound) return sound
	if (loading) return loading
	loading = (async () => {
		try {
			await ensureAudioMode(Audio)
			const { sound: created } = await Audio.Sound.createAsync(
				require('@/assets/sounds/rest-complete.wav'),
				{ shouldPlay: false, volume: 1 },
			)
			sound = created
			return created
		} catch (e) {
			console.warn('Failed to load rest sound', e)
			return null
		} finally {
			loading = null
		}
	})()
	return loading
}

/** Prefetch sound so the first chime isn't delayed. */
export async function preloadRestSound(): Promise<void> {
	try {
		await loadSound()
	} catch {
		// ignore
	}
}

/** Short chime when rest timer finishes. Safe to call fire-and-forget. */
export async function playRestCompleteSound(): Promise<void> {
	try {
		const s = await loadSound()
		if (!s) return
		await s.setPositionAsync(0)
		await s.playAsync()
	} catch (e) {
		console.warn('Failed to play rest sound', e)
	}
}

export async function unloadRestSound(): Promise<void> {
	try {
		if (sound) {
			await sound.unloadAsync()
			sound = null
		}
	} catch {
		// ignore
	}
}
