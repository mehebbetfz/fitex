# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

# sharp needs libc/vips bits for native rebuild on alpine
RUN apk add --no-cache vips-dev build-base python3

WORKDIR /app

COPY package*.json ./
RUN npm ci --ignore-scripts \
	&& npm install --os=linux --cpu=x64 --libc=musl sharp \
	&& npm rebuild sharp --foreground-scripts

COPY . .
# nest/tsc в Docker часто упираются в лимит кучи (~2GB) → heap out of memory
RUN NODE_OPTIONS="--max-old-space-size=4096" npm run build

# Remove dev dependencies (keep sharp native binary)
RUN npm prune --production \
	&& npm rebuild sharp --foreground-scripts

# ── Stage 2: Runtime ──────────────────────────────────────────────────────────
FROM node:20-alpine

RUN apk add --no-cache tzdata dumb-init

ENV NODE_ENV=production \
    TZ=Europe/Moscow

WORKDIR /app

COPY --from=builder /app/dist       ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/scripts     ./scripts
COPY --from=builder /app/public      ./public

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', r => r.statusCode === 200 ? process.exit(0) : process.exit(1)).on('error', () => process.exit(1))"

# dumb-init handles PID 1 signals correctly
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main"]
