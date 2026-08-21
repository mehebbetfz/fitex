import * as SharpImport from 'sharp'

type SharpFn = typeof import('sharp')

/**
 * sharp is CJS; without esModuleInterop, `import sharp from 'sharp'`
 * becomes `.default` and blows up at runtime in Docker as
 * "sharp_1.default is not a function".
 */
function resolveSharp(): SharpFn {
	const mod = SharpImport as unknown as SharpFn & { default?: SharpFn }
	if (typeof mod === 'function') return mod
	if (typeof mod?.default === 'function') return mod.default
	// Last resort for odd Nest/webpack interop
	// eslint-disable-next-line @typescript-eslint/no-require-imports
	return require('sharp') as SharpFn
}

export const sharp = resolveSharp()
