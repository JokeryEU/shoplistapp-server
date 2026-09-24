FROM oven/bun:1.4.2-alpine AS base

WORKDIR /app/shoplist-server

COPY package.json bun.lock ./

RUN bun install --frozen-lockfile

COPY . .

FROM base AS build

RUN bun run build

FROM oven/bun:1.4.2-alpine AS production

WORKDIR /app/shoplist-server

ENV NODE_ENV=production

COPY package.json bun.lock ./

RUN bun install --frozen-lockfile --production

COPY --from=build /app/shoplist-server/build ./build

USER bun

EXPOSE 3004

CMD ["bun", "run", "./build/server.js"]
