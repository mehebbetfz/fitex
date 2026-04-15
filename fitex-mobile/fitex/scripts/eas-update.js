#!/usr/bin/env node
/**
 * Публикация OTA (EAS Update) на выбранный channel.
 *
 * Использование:
 *   npm run ota
 *   npm run ota -- "fix: профиль после покупки"
 *   set EAS_UPDATE_CHANNEL=preview&& npm run ota   (Windows)
 *   EAS_UPDATE_CHANNEL=preview npm run ota         (macOS/Linux)
 *
 * Сообщение: аргументы командной строки, иначе последний коммит (git), иначе "OTA update".
 */

const { execSync } = require('child_process')
const path = require('path')

const root = path.join(__dirname, '..')

function gitSubject() {
	try {
		return execSync('git log -1 --pretty=%s', {
			encoding: 'utf8',
			cwd: root,
		}).trim()
	} catch {
		return ''
	}
}

const channel = process.env.EAS_UPDATE_CHANNEL || 'production'
const cliArg = process.argv.slice(2).join(' ').trim()
const message = cliArg || gitSubject() || 'OTA update'

// Windows: spawnSync('npx.cmd', [...], { shell: false }) даёт EINVAL; spawn + shell: true снова ломал --message с пробелами.
// Одна shell-команда + JSON.stringify для значений — стабильно для cmd/PowerShell и длинных git subject.
const q = (s) => JSON.stringify(String(s))
try {
	execSync(`npx eas-cli update --channel ${q(channel)} --message ${q(message)} --non-interactive`, {
		cwd: root,
		stdio: 'inherit',
	})
	process.exit(0)
} catch (e) {
	process.exit(typeof e.status === 'number' ? e.status : 1)
}
