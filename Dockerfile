# syntax=docker/dockerfile:1.7-labs
FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app
COPY . /app

ARG VITE_GTAG_ID
ENV VITE_GTAG_ID=$VITE_GTAG_ID

# Use Railway build cache for pnpm store
# NOTE: Replace RAILWAY_SERVICE_ID with your actual Railway service ID to persist cache across builds
# Format: id=s/<service id>-<target path>,target=<target path>
RUN --mount=type=cache,id=s/7f197e6f-f1f4-4a5d-97e7-9b2a313f0dc4-/pnpm/store,target=/pnpm/store pnpm install

# Cache Vite pre-bundles between builds (optional but helpful for faster builds)
# NOTE: Replace RAILWAY_SERVICE_ID with your actual Railway service ID
RUN --mount=type=cache,id=s/7f197e6f-f1f4-4a5d-97e7-9b2a313f0dc4-/app/node_modules/.vite,target=/app/node_modules/.vite pnpm run build

EXPOSE 8000
CMD [ "pnpm", "start" ]

