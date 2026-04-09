// Metro must treat .wasm as an asset so expo-sqlite web (and eas update --platform=all) can bundle.
const { getDefaultConfig } = require('expo/metro-config')

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname)

if (!config.resolver.assetExts.includes('wasm')) {
	config.resolver.assetExts.push('wasm')
}

module.exports = config
