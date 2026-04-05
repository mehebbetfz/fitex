# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --ignore-scripts

COPY . .
RUN npm run build

# Remove dev dependencies
RUN npm prune --production

# ── Stage 2: Runtime ──────────────────────────────────────────────────────────
FROM node:20-alpine

RUN apk add --no-cache tzdata dumb-init

ENV NODE_ENV=production \
    TZ=Europe/Moscow

WORKDIR /app

COPY --from=builder /app/dist       ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

# dumb-init handles PID 1 signals correctly
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main"]
