FROM node:22-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS prod
RUN mkdir /app
COPY pnpm-lock.yaml /app
WORKDIR /app
RUN npm i -g next@canary
RUN pnpm fetch --prod

COPY . /app
RUN pnpm i
RUN pnpm run build

FROM base
COPY --from=prod /app/node_modules /app/node_modules
COPY --from=prod /app/dist /app/dist
EXPOSE 8000
CMD [ "pnpm", "start" ]
