# ── Stage 1: Build Vite frontend ──────────────────────────
FROM node:20-alpine AS frontend-builder

WORKDIR /build/frontend

COPY frontend/package*.json ./
RUN npm ci --legacy-peer-deps

COPY frontend/ ./
# No VITE_API_URL needed — the Node server serves both API and static files on the same origin
RUN npm run build

# ── Stage 2: Production Node app ──────────────────────────
FROM node:20-alpine

WORKDIR /app

# Install backend dependencies
COPY backend/package*.json ./
RUN npm ci --omit=dev

# Copy backend source
COPY backend/src/ ./src/

# Copy built frontend assets into a public/ folder served by Express
COPY --from=frontend-builder /build/frontend/dist ./public/

EXPOSE 4000

# Run as non-root user
RUN addgroup -S mealytics && adduser -S mealytics -G mealytics
USER mealytics

CMD ["node", "src/index.js"]
