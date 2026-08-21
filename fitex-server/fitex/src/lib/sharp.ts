/**
 * sharp is CJS; `import sharp from 'sharp'` can become `.default` at runtime
 * in Docker and throw "sharp_1.default is not a function".
 */
type SharpFn = typeof import('sharp')

// eslint-disable-next-line @typescript-eslint/no-require-imports
const loaded: unknown = require('sharp')

function resolveSharp(): SharpFn {
	if (typeof loaded === 'function') return loaded as SharpFn
	if (loaded && typeof loaded === 'object' && 'default' in loaded) {
		const def = (loaded as { default: unknown }).default
		if (typeof def === 'function') return def as SharpFn
	}
	throw new Error('Failed to load sharp module')
}

export const sharp = resolveSharp()
