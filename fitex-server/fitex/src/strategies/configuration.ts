export default () => ({
	port: parseInt(process.env.PORT, 10) || 3000,
	jwt: {
		secret: process.env.JWT_SECRET,
	},
	cors: {
		origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
	},
})