import { Redirect } from 'expo-router'

/** Tabs `index` must stay light — Food lives at /(tabs)/nutrition */
export default function TabsIndex() {
	return <Redirect href='/(tabs)/nutrition' />
}
