# Apple Root CA (вебхуки App Store)

Сюда кладутся два **публичных** файла с официального сайта Apple (имена должны совпадать с кодом):

- `AppleRootCA-G3.cer`
- `AppleIncRootCertificate.cer`

## Скачать на сервере (рядом с `docker-compose.yml`)

```bash
mkdir -p certs && cd certs
curl -fsSLO https://www.apple.com/certificateauthority/AppleRootCA-G3.cer
curl -fsSLO https://www.apple.com/appleca/AppleIncRootCertificate.cer
```

После этого `docker compose up -d` подхватит папку автоматически (см. `docker-compose.yml`: том `./certs` → `/app/certs` в контейнере).

Переменная `APPLE_ROOT_CA_DIR=/app/certs` задана в compose — Node ищет сертификаты именно там.
