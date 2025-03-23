# syntax = docker/dockerfile:1

ARG NODE_VERSION=22.14.0
ARG NODE_DISTRO=bullseye-slim
ARG PNPM_VERSION=10.6.5

FROM public.ecr.aws/docker/library/node:${NODE_VERSION}-${NODE_DISTRO} AS base

# Define build arguments with defaults
ARG NODE_ENV=production
ARG PORT=3000
ARG HOSTNAME="0.0.0.0"
ARG USER_ID=1001
ARG GROUP_ID=1001
ARG USER_NAME=nextjs
ARG GROUP_NAME=nodejs

# Set environment variables that are common across stages
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=$PORT
ENV HOSTNAME=$HOSTNAME

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate

# Install dependencies based on the preferred package manager
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

# Development image for local development
FROM base AS stage
WORKDIR /app

ENV NODE_ENV=development

# Install pnpm in the development stage
RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate

COPY --from=deps /app/node_modules ./node_modules
COPY . .

EXPOSE $PORT

# Run the development server with hot reloading
CMD ["pnpm", "run", "dev"]

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Install pnpm in the builder stage too
RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN pnpm run build

# Production image, copy all the files and run next
FROM base AS prod
WORKDIR /app

# Set NODE_ENV from build arg
ENV NODE_ENV=$NODE_ENV

# Create non-root user and group
RUN addgroup --system --gid $GROUP_ID $GROUP_NAME && \
    adduser --system --uid $USER_ID $USER_NAME

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next && \
    chown $USER_NAME:$GROUP_NAME .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=$USER_NAME:$GROUP_NAME /app/.next/standalone ./
COPY --from=builder --chown=$USER_NAME:$GROUP_NAME /app/.next/static ./.next/static

USER $USER_NAME
EXPOSE $PORT

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
CMD ["node", "server.js"]
