# Fitex — Fitness Tracking App

A full-stack fitness application with React Native (Expo) mobile app and NestJS backend.

## Project Structure

```
fitex/
├── fitex-mobile/fitex/     # React Native app (Expo SDK 54)
├── fitex-server/fitex/     # NestJS REST API
└── .github/workflows/      # CI/CD pipelines
```

## Features

- **Workout Tracking** — log exercises, sets, reps, weight
- **Body Measurements** — track weight, body fat, measurements over time
- **Personal Records** — automatic PR detection and history
- **Rating System** — tier-based progression (Premium)
- **Trainer Marketplace** — buy/sell workout & nutrition plans
- **FitEx Pass** — digital gym membership with QR check-in
- **Sync** — two-way sync between device and cloud
- **i18n** — Russian, English, Azerbaijani

## Tech Stack

| Layer | Technology |
|---|---|
| Mobile | React Native, Expo SDK 54, TypeScript, MobX |
| Backend | NestJS v10, MongoDB, JWT, Stripe, AWS S3 |
| CI/CD | GitHub Actions, EAS (Expo Application Services) |
| Hosting | Hetzner VPS (Docker + Nginx) |
| OTA | Expo EAS Update |

## Getting Started

### Backend

```bash
cd fitex-server/fitex
cp .env.example .env   # fill in your values
npm install
npm run start:dev
```

### Mobile

```bash
cd fitex-mobile/fitex
cp .env.example .env   # fill in your values
npm install
npx expo start
```

## CI/CD

| Workflow | Trigger | Action |
|---|---|---|
| `deploy-server.yml` | push to `main` (server changes) | Build & deploy to Hetzner via SSH |
| `eas-update.yml` | push to `main` (mobile JS changes) | OTA update via EAS Update |
| `eas-build.yml` | push tag `v*.*.*` or manual | Full build + submit to App Store / Play Market |

### Required GitHub Secrets

| Secret | Description |
|---|---|
| `HETZNER_HOST` | Server IP address |
| `HETZNER_USER` | SSH username (`fitex`) |
| `HETZNER_SSH_KEY` | Private SSH key for deployment |
| `EXPO_TOKEN` | Expo access token from expo.dev |

## Deployment

See [setup-hetzner.sh](fitex-server/fitex/setup-hetzner.sh) for initial server setup.

## License

Private — All rights reserved.
