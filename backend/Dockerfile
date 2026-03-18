# ─── Stage 1: deps ────────────────────────────────────────────────────────────
FROM node:20-alpine AS deps

WORKDIR /app

# Install only production deps first (layer cache)
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# ─── Stage 2: runner ──────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

# Security: run as non-root
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy production node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source
COPY --chown=appuser:appgroup . .

# Remove dev/test files not needed at runtime
RUN rm -rf tests .env.example

ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

USER appuser

# Healthcheck — hits the /health endpoint (add this route if missing)
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:5000/health || exit 1

CMD ["node", "main.js"]
