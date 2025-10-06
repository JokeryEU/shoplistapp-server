FROM node:alpine as base

WORKDIR /app/shoplist-server

COPY package*.json ./

COPY bun.lock ./

RUN bun i

COPY . .

FROM base as production

ENV NODE_PATH=./build

RUN bun run build

