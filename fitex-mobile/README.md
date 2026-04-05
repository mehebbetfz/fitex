# Fitex Mobile

React Native + Expo приложение для трекинга тренировок.

## Стек

- **Expo SDK 54** (expo-router, file-based routing)
- **React Native 0.81**
- **TypeScript**
- **MobX** — управление состоянием
- **expo-sqlite** — локальная база данных (offline-first)
- **React Native Paper** — UI-компоненты
- **victory-native / react-native-chart-kit** — графики

## Запуск

```bash
cd fitex
npm install
npx expo start
```

Для iOS/Android dev-build:
```bash
npx expo run:ios
npx expo run:android
```

## Переменные окружения

Создайте файл `fitex/.env` на основе примера:

```env
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your-ios-client-id
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=your-android-client-id
EXPO_PUBLIC_APP_SCHEME=fitex
EXPO_PUBLIC_SUBSCRIPTION_ENABLED=true
```

## Основные функции

- **Тренировки** — создание, редактирование, история, шаблоны
- **Прогресс** — графики по весу, объёму и упражнениям
- **Восстановление** — визуализация усталости мышц на теле
- **Замеры тела** — трекинг параметров (вес, объёмы и т.д.)
- **Личные рекорды** — автоматическая фиксация PR
- **Напоминания** — push-уведомления по расписанию (Пн–Пт)
- **Экспорт** — выгрузка данных в CSV
- **Облачная синхронизация** — для Premium-пользователей (двухсторонняя)

## Аутентификация

Поддерживается:
- Sign in with Google (expo-auth-session)
- Sign in with Apple (expo-apple-authentication)

## Структура проекта

```
fitex/
├── app/
│   ├── (auth)/          # Экраны авторизации и тренировок
│   ├── (tabs)/          # Основные вкладки (прогресс, тело, тренировка, история, профиль)
│   ├── contexts/        # React Context (auth, database, sync)
│   ├── modals/          # Модальные окна
│   └── screens/         # Дополнительные экраны
├── components/          # Переиспользуемые компоненты
├── constants/           # Темы, мышцы, упражнения
├── scripts/
│   └── database.ts      # Весь SQLite-слой
└── services/
    ├── api.ts           # Axios-клиент
    ├── notifications.ts # Push-уведомления
    └── export.ts        # Экспорт в CSV
```

## EAS Build

```bash
eas build --platform ios
eas build --platform android
```

`eas.json` уже настроен с профилями `development`, `preview`, `production`.
