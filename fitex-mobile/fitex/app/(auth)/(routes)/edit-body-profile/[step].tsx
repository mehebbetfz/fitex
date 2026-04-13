import { BodyProfileWizardStep } from '@/components/body-profile-wizard-step'
import {
	BODY_PROFILE_STEPS,
	type BodyProfileStep,
	isBodyProfileStep,
} from '@/constants/body-profile-wizard'
import { useLanguage } from '@/contexts/language-context'
import { Ionicons } from '@expo/vector-icons'
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router'
import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useEditBodyProfile } from './edit-body-profile-context'

const BG = '#0A0A0A'

function stepParam(raw: string | string[] | undefined): string | undefined {
	if (raw == null) return undefined
	return Array.isArray(raw) ? raw[0] : raw
}

export default function EditBodyProfileStepScreen() {
	const { t } = useLanguage()
	const router = useRouter()
	const raw = stepParam(useLocalSearchParams().step)
	const { state, setState, loading, submitSave } = useEditBodyProfile()

	if (!raw || !isBodyProfileStep(raw)) {
		return <Redirect href='/(auth)/(routes)/edit-body-profile/weight' />
	}

	const step: BodyProfileStep = raw
	const stepIndex = BODY_PROFILE_STEPS.indexOf(step)
	const canFooterBack = stepIndex > 0

	const goNext = () => {
		if (stepIndex >= BODY_PROFILE_STEPS.length - 1) {
			void submitSave()
			return
		}
		const next = BODY_PROFILE_STEPS[stepIndex + 1]
		router.push(`/(auth)/(routes)/edit-body-profile/${next}`)
	}

	return (
		<SafeAreaView style={styles.safe}>
			<View style={styles.header}>
				<TouchableOpacity
					onPress={() => router.back()}
					hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
				>
					<Ionicons name='chevron-back' size={28} color='#fff' />
				</TouchableOpacity>
				<Text style={styles.headerTitle}>{t('bodyProfile', 'editTitle')}</Text>
				<View style={{ width: 28 }} />
			</View>
			<BodyProfileWizardStep
				variant='edit'
				step={step}
				state={state}
				setState={setState}
				loading={loading}
				onPrimary={goNext}
				canFooterBack={canFooterBack}
				onFooterBack={() => router.back()}
			/>
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
	safe: { flex: 1, backgroundColor: BG },
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 8,
		paddingVertical: 8,
		borderBottomWidth: 1,
		borderBottomColor: '#2C2C2E',
	},
	headerTitle: {
		flex: 1,
		fontSize: 18,
		fontWeight: '600',
		color: '#fff',
		textAlign: 'center',
	},
})
