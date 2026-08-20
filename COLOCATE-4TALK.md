# Fitex на том же Hetzner, что и 4talk (Toki)

4talk уже держит **Caddy** на портах 80/443. Fitex ставим рядом как второй Docker-стек и отдаём через тот же Caddy. **Nginx Fitex и `setup-hetzner.sh` на этом сервере не запускать** — они перехватят 80/443.

## Схема

```
Интернет
   │
   ├─ api.4talk.club     → Caddy → toki api:3000
   ├─ livekit.4talk.club → Caddy → livekit:7880
   └─ api.fitex.app      → Caddy → fitex-api:3000  (host :3001)
```

Оба приложения на одном IP. Разделение — по DNS-именам.

## 1. DNS

В Namecheap (или где `fitex.app`):

| Type | Host | Value |
|------|------|--------|
| A | `api` | тот же IP, что у `api.4talk.club` |

Проверка: `dig +short api.fitex.app` → IP Hetzner 4talk.

## 2. Сеть Docker (один раз)

На сервере:

```bash
docker network create proxy
```

## 3. Подключить Caddy 4talk к Fitex

### 3.1 `~/toki-app/deploy/Caddyfile`

Добавь блок (email уже в глобальном блоке):

```caddy
api.fitex.app {
	encode gzip
	request_body {
		max_size 20MB
	}
	reverse_proxy fitex-api:3000
}
```

Альтернатива без общей сети (если контейнер Fitex не в `proxy`):

```caddy
api.fitex.app {
	encode gzip
	reverse_proxy host.docker.internal:3001
}
```

### 3.2 `~/toki-app/deploy/docker-compose.prod.yml` — у сервиса `caddy`

```yaml
  caddy:
    # ... existing ...
    extra_hosts:
      - "host.docker.internal:host-gateway"
    networks:
      - toki
      - proxy

networks:
  toki:
    driver: bridge
  proxy:
    external: true
    name: proxy
```

Перезапуск Caddy:

```bash
cd ~/toki-app/deploy
docker compose -f docker-compose.prod.yml --env-file .env.production up -d caddy
```

Caddy сам выпустит Let's Encrypt для `api.fitex.app`, когда DNS уже смотрит на сервер.

## 4. Деплой Fitex

```bash
# клон (один раз)
sudo mkdir -p /opt/fitex
sudo chown "$USER:$USER" /opt/fitex
git clone https://github.com/mehebbetfz/fitex.git /opt/fitex   # или ваш remote

cd /opt/fitex/fitex-server/fitex
cp .env.example .env
nano .env
```

Обязательно в `.env`:

```env
PUBLIC_BASE_URL=https://api.fitex.app
PORT=3000
MONGODB_URI=...   # отдельная БД/кластер Fitex (не Toki)
JWT_SECRET=...    # свой секрет, не от 4talk
```

`.env` **не в git**. Клади один раз вручную и не удаляй каталог `/opt/fitex` целиком.
Бэкап на сервере: `/opt/fitex.env.backup` (деплой копирует туда автоматически).

Восстановление с ПК:

```powershell
scp fitex-server/fitex/.env root@ТВОЙ_IP:/opt/fitex/fitex-server/fitex/.env
```

Потом на сервере:

```bash
cp -a /opt/fitex/fitex-server/fitex/.env /opt/fitex.env.backup
cd /opt/fitex/fitex-server/fitex
docker compose -f docker-compose.colocate.yml up -d --force-recreate
```

Сертификаты Apple (если нужны вебхуки) — в `./certs`.

Запуск:

```bash
docker compose -f docker-compose.colocate.yml up -d --build
curl -sf http://127.0.0.1:3001/health && echo OK
curl -sf https://api.fitex.app/health && echo HTTPS_OK
```

## 5. GitHub Actions Fitex

Secrets в репо Fitex (тот же хост, что у 4talk):

| Secret | Значение |
|--------|----------|
| `HETZNER_HOST` | IP сервера 4talk |
| `HETZNER_USER` | `root` (как у Toki) или отдельный пользователь с docker |
| `HETZNER_SSH_KEY` | deploy-ключ |

В workflow путь уже `/opt/fitex`. Команду деплоя смени на colocated compose:

```bash
cd "$APP_DIR/fitex-server/fitex"
docker compose -f docker-compose.colocate.yml build --no-cache
docker compose -f docker-compose.colocate.yml up -d --force-recreate
curl -sf http://127.0.0.1:3001/health
```

Файл workflow: `.github/workflows/deploy-server.yml` — правь `docker compose` на `-f docker-compose.colocate.yml` и health на `:3001`.

## 6. Мобильное приложение

В EAS / `.env` production:

```env
EXPO_PUBLIC_API_URL=https://api.fitex.app/
```

## 7. Чего не делать

- Не запускать `setup-hetzner.sh` на сервере 4talk (поставит nginx на 80/443).
- Не публиковать Fitex как `0.0.0.0:3000` — конфликт и дыра в firewall.
- Не смешивать Mongo/JWT/Redis 4talk и Fitex.

## 8. Чеклист

- [ ] A-запись `api.fitex.app` → IP 4talk
- [ ] `docker network create proxy`
- [ ] Caddyfile + сеть `proxy` у caddy, reload
- [ ] `/opt/fitex` + `.env` + `docker-compose.colocate.yml up`
- [ ] `curl https://api.fitex.app/health`
- [ ] Мобильный `EXPO_PUBLIC_API_URL` обновлён
