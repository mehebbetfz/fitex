# Fitex Server

NestJS backend для приложения Fitex.

## Стек

- **NestJS 10** (Node.js)
- **MongoDB** + **Mongoose**
- **JWT** аутентификация (Passport)
- **Redis** — кэширование / throttling
- **AWS S3** — хранение файлов
- **Stripe** — платёжная система
- **Winston** — логирование

## Запуск

```bash
cd fitex
npm install
npm run start:dev
```

Продакшн:
```bash
npm run build
npm run start:prod
```

## Переменные окружения

Создайте файл `fitex/.env`:

```env
# MongoDB
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/fitex

# JWT
JWT_SECRET=your-jwt-secret-key

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id

# Apple Sign In
APPLE_CLIENT_ID=com.farzaliyev.fitex
APPLE_TEAM_ID=YOUR_TEAM_ID

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# AWS S3
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_BUCKET_NAME=fitex

# Redis
REDIS_URL=redis://localhost:6379

# CORS (через запятую)
ALLOWED_ORIGINS=https://fitex.app,https://admin.fitex.app

# Deploy
PORT=3000
```

## API Endpoints

### Auth
| Метод | URL | Описание |
|-------|-----|----------|
| POST | `/auth/google` | Вход через Google (idToken) |
| POST | `/auth/apple` | Вход через Apple (identityToken + code) |

### Sync *(требует JWT)*
| Метод | URL | Описание |
|-------|-----|----------|
| POST | `/sync/upload` | Загрузить данные на сервер |
| GET | `/sync/download` | Скачать данные с сервера |

### Subscriptions *(требует JWT)*
| Метод | URL | Описание |
|-------|-----|----------|
| POST | `/subscription/verify` | Верифицировать покупку (IAP) |
| GET | `/subscription` | Список подписок пользователя |

## Архитектура модулей

```
src/
├── modules/
│   ├── auth/           # Вход через Google/Apple, JWT
│   ├── user/           # Профиль пользователя
│   ├── workout/        # Тренировки (используется через sync)
│   ├── sync/           # Двухсторонняя синхронизация данных
│   ├── subscription/   # Управление подписками
│   └── iap/            # Верификация покупок App Store / Google Play
├── models/             # Mongoose-схемы
├── guards/             # JWT guard
├── strategies/         # Passport стратегии
└── dtos/               # DTO для валидации запросов
```

## Deploy на Railway

1. Создайте проект в [Railway](https://railway.app)
2. Подключите MongoDB и Redis плагины
3. Задайте переменные окружения
4. `PORT` Railway выставит автоматически

`main.ts` уже настроен на `0.0.0.0:PORT` для Railway.
