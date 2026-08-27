import React, { Component, type ErrorInfo, type ReactNode } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

type Props = { children: ReactNode }
type State = { error: Error | null }

/**
 * Ловит JS-ошибки рендера, чтобы приложение не закрывалось после splash.
 */
export class ErrorBoundary extends Component<Props, State> {
	state: State = { error: null }

	static getDerivedStateFromError(error: Error): State {
		return { error }
	}

	componentDidCatch(error: Error, info: ErrorInfo) {
		console.error('[ErrorBoundary]', error, info?.componentStack)
	}

	render() {
		if (!this.state.error) return this.props.children
		return (
			<View style={styles.wrap}>
				<Text style={styles.title}>Что-то пошло не так</Text>
				<Text style={styles.msg}>
					Приложение не смогло открыть главный экран. Можно продолжить — обычно помогает
					повторный вход.
				</Text>
				<Text style={styles.detail} numberOfLines={6}>
					{this.state.error.message}
				</Text>
				<Pressable style={styles.btn} onPress={() => this.setState({ error: null })}>
					<Text style={styles.btnText}>Попробовать снова</Text>
				</Pressable>
			</View>
		)
	}
}

const styles = StyleSheet.create({
	wrap: {
		flex: 1,
		backgroundColor: '#222226',
		justifyContent: 'center',
		padding: 24,
	},
	title: {
		color: '#fff',
		fontSize: 22,
		fontWeight: '700',
		marginBottom: 12,
		textAlign: 'center',
	},
	msg: {
		color: '#AEAEB2',
		fontSize: 15,
		lineHeight: 22,
		textAlign: 'center',
		marginBottom: 16,
	},
	detail: {
		color: '#8E8E93',
		fontSize: 12,
		marginBottom: 20,
		textAlign: 'center',
	},
	btn: {
		backgroundColor: '#34C759',
		paddingVertical: 14,
		borderRadius: 12,
		alignItems: 'center',
	},
	btnText: {
		color: '#000',
		fontWeight: '700',
		fontSize: 16,
	},
})
