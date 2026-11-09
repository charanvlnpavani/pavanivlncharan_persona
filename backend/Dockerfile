# Production image for the API, with Chromium for resume PDFs.
# Build from the repository root:  docker build -f backend/Dockerfile -t portfolio-api .
# NOTE: written for deployment; not yet built locally (Docker isn't installed on the dev machine).

FROM node:24-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY shared/package.json shared/
COPY backend/package.json backend/
RUN npm ci --workspace backend --include-workspace-root=false
COPY shared shared
COPY backend backend
RUN npm run db:generate -w backend && npm run build -w backend

FROM node:24-slim
# Chromium + fonts for real-text PDFs.
RUN apt-get update && apt-get install -y --no-install-recommends chromium fonts-liberation fonts-noto-core ca-certificates \
  && rm -rf /var/lib/apt/lists/*
ENV NODE_ENV=production \
    CHROME_PATH=/usr/bin/chromium \
    STORAGE_DIR=/data
WORKDIR /app
COPY --from=build /app/node_modules node_modules
COPY --from=build /app/backend/node_modules backend/node_modules
COPY --from=build /app/backend/package.json backend/
COPY --from=build /app/backend/dist backend/dist
COPY --from=build /app/backend/prisma backend/prisma
COPY --from=build /app/backend/prisma.config.ts backend/
COPY --from=build /app/backend/src/generated backend/src/generated
# Run as a non-root user (Chrome's sandbox then works without --no-sandbox).
RUN useradd --create-home app && mkdir -p /data && chown -R app /data
USER app
WORKDIR /app/backend
EXPOSE 4000
# Apply pending migrations, then start.
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
