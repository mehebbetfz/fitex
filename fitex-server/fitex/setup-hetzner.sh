#!/usr/bin/env bash
# =============================================================================
# Fitex — первоначальная настройка Hetzner VPS (Ubuntu 22.04)
# Запуск: sudo bash setup-hetzner.sh
# =============================================================================
set -euo pipefail

DOMAIN="api.fitex.app"          # ← замени на свой домен
APP_DIR="/opt/fitex"
DEPLOY_USER="fitex"

echo "▶ 1/9  Обновление системы..."
apt-get update -q && apt-get upgrade -y -q

echo "▶ 2/9  Установка базовых пакетов..."
apt-get install -y -q \
  curl git ufw fail2ban nginx certbot python3-certbot-nginx \
  ca-certificates gnupg lsb-release

echo "▶ 3/9  Установка Docker..."
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
  | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" \
  > /etc/apt/sources.list.d/docker.list

apt-get update -q
apt-get install -y -q docker-ce docker-ce-cli containerd.io docker-compose-plugin
systemctl enable --now docker

echo "▶ 4/9  Создание deploy-пользователя '${DEPLOY_USER}'..."
if ! id "${DEPLOY_USER}" &>/dev/null; then
  useradd -m -s /bin/bash "${DEPLOY_USER}"
  usermod -aG docker "${DEPLOY_USER}"
fi

echo "▶ 5/9  Создание директории приложения..."
mkdir -p "${APP_DIR}"
chown "${DEPLOY_USER}:${DEPLOY_USER}" "${APP_DIR}"

echo "▶ 6/9  Настройка UFW (firewall)..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow http
ufw allow https
ufw --force enable

echo "▶ 7/9  Настройка fail2ban..."
systemctl enable --now fail2ban

echo "▶ 8/9  Настройка nginx..."
cp /dev/stdin /etc/nginx/sites-available/fitex << 'NGINX_EOF'
# Временный конфиг для выпуска сертификата
server {
    listen 80;
    server_name DOMAIN_PLACEHOLDER;
    location /.well-known/acme-challenge/ { root /var/www/certbot; }
    location / { return 200 'ok'; add_header Content-Type text/plain; }
}
NGINX_EOF

sed -i "s/DOMAIN_PLACEHOLDER/${DOMAIN}/g" /etc/nginx/sites-available/fitex
ln -sf /etc/nginx/sites-available/fitex /etc/nginx/sites-enabled/fitex
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

echo "▶ 9/9  Выпуск SSL-сертификата (Let's Encrypt)..."
mkdir -p /var/www/certbot
certbot --nginx -d "${DOMAIN}" --non-interactive --agree-tos \
  --email admin@fitex.app --redirect || \
  echo "⚠️  certbot не смог получить сертификат — убедись, что DNS домена указывает на этот сервер"

echo ""
echo "═══════════════════════════════════════════════════════"
echo "✅  Сервер подготовлен!"
echo ""
echo "Следующие шаги:"
echo "  1. Скопируй .env в ${APP_DIR}/fitex-server/fitex/.env"
echo "  2. Скопируй nginx.conf из репозитория:"
echo "     cp ${APP_DIR}/fitex-server/fitex/nginx.conf /etc/nginx/sites-available/fitex"
echo "     nginx -t && systemctl reload nginx"
echo "  3. Добавь публичный ключ GitHub Actions в ~/.ssh/authorized_keys для пользователя '${DEPLOY_USER}'"
echo "  4. Добавь GitHub Secrets:"
echo "       HETZNER_HOST   = $(curl -s ifconfig.me)"
echo "       HETZNER_USER   = ${DEPLOY_USER}"
echo "       HETZNER_SSH_KEY = <приватный ключ>"
echo "═══════════════════════════════════════════════════════"
