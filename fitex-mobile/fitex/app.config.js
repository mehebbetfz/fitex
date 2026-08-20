/**
 * Dynamic Expo config so API URL is available in Constants.expoConfig.extra
 * (EXPO_PUBLIC_* must be plaintext in EAS — secrets are not inlined into OTA).
 */
const appJson = require('./app.json')

const apiUrl = (
	process.env.EXPO_PUBLIC_API_URL ||
	'https://fitex.4talk.club/'
).replace(/\/?$/, '/')

module.exports = {
	...appJson.expo,
	extra: {
		...(appJson.expo.extra || {}),
		apiUrl,
	},
}
