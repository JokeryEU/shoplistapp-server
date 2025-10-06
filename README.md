# ShopListApp — Backend

ShopListApp is a concise, production-ready Node.js + TypeScript backend for a collaborative shopping list application.

This repository contains the API server used by the ShopList client. It implements user management (register/login/logout/profile) and shopping list management (create/update/delete lists and items, invite/remove collaborators). The codebase is TypeScript-first and uses Express + Mongoose.

## Quick summary

- Language: TypeScript
- Framework: Express
- Database: MongoDB (via Mongoose)
- Auth: JWT (access + refresh) kept in cookies
- Build tools: Bun (project scripts use Bun)

## Table of contents

- Features
- Requirements
- Project layout
- Environment variables
- Scripts
- Local development
- API (high level)
- Authentication
- Docker
- Notes & assumptions
- Contributing

## Features

- Register/login/logout with JWT access and refresh tokens
- Cookie-based authentication for browser-friendly usage
- CRUD for lists and list items
- Invite/remove collaborators on lists
- Role-based authorization (Admin / User)
- Centralized error handling and request rate limiting

## Requirements

- bun <= 1.2.23 (project `engines`)
- node <= 24.9.0 (project `engines`) — Bun ships its own runtime, but Node may be needed for some environments
- MongoDB instance reachable from the server

Install a supported Bun version (or use Node + an alternative build/run strategy if you prefer). The repository contains scripts that use Bun directly.

## Project layout (important files)

- `src/server.ts` — application entry
- `src/routes/` — route definitions (`users`, `lists`)
- `src/controllers/` — request handlers
- `src/models/` — Mongoose models and types
- `src/auth/` — JWT helpers, middleware and validators
- `src/utils/` — logger and error handlers (including rate limiter)
- `build/` — transpiled output (when you run `bun build`)
- `Dockerfile`, `docker-compose.yml` — containerization files

## Environment variables

Create a `.env` file (or set env vars in your container/orchestration). The server expects the following variables (names are taken directly from source):

- `PORT` — port to listen on (default: `3004`)
- `NODE_ENV` — `development` or `production` (affects cookies and logging)
- `MONGODB_ADDRESS` — MongoDB connection string (used by Mongoose)
- `FE_URL_DEV` — frontend origin URL allowed in CORS for development
- `FE_URL_PROD` — frontend origin URL allowed in CORS for production
- `ACCESS_TOKEN_SECRET` — secret for signing access JWTs
- `REFRESH_TOKEN_SECRET` — secret for signing refresh JWTs

Tip: keep `ACCESS_TOKEN_SECRET` and `REFRESH_TOKEN_SECRET` secure and do not commit them to Git.

## Scripts (from `package.json`)

- `bun run dev` — development run (uses `bun run --watch ./src/server.ts`)
- `bun run build` — build/transpile TypeScript to `./build` (`bun build ./src/server.ts --outdir ./build --target bun`)
- `bun run start` — run the built server (`bun run ./build/server.js`)
- `test` — placeholder (no tests configured in the snapshot)

Examples (run from project root):

```bash
# install dependencies with bun
bun install

# development
bun run dev

# build
bun run build

# run built app
bun run start
```

## Local development

1. Install dependencies: `bun install`
2. Create `.env` with the variables listed above (at minimum `MONGODB_ADDRESS`, `ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_SECRET`).
3. Run in dev mode: `bun run dev` (server listens on `PORT` or `3004`).

### Quick curl examples

Register a user (public):

```bash
curl -X POST http://localhost:3004/users/register \
  -H "Content-Type: application/json" \
  -d '{"email":"JohnDoe@example.com","password":"secret","name":"JohnDoe"}'
```

Login and store cookies to `cookies.txt`:

```bash
curl -i -c cookies.txt -X POST http://localhost:3004/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"JohnDoe@example.com","password":"secret"}'
```

Use stored cookies for authenticated requests:

```bash
curl -b cookies.txt http://localhost:3004/lists/user
```

Note: the server uses cookie-based access tokens (`accessToken` and `refreshToken`). When calling API from a browser, the cookies are set automatically. For API clients use cookie storage (or extract tokens from cookies if needed).

## API (high-level)

Base paths are mounted directly at `/users` and `/lists` (no `/api` prefix in the current code).

Users

- POST /users/register — register a new user (returns created user; sets access & refresh cookies)
- POST /users/login — login and set access & refresh cookies (returns user)
- POST /users/logout — clear tokens (requires authentication)
- GET /users/profile — get current user profile (requires authentication)
- PUT /users/profile — update profile (requires authentication; `role` cannot be modified by clients)
- GET /users — admin only: list all users

Lists

- GET /lists — admin only: list all lists
- GET /lists/user — get lists for current user (owner + invited)
- POST /lists/user — create a new list (requires authentication)
- POST /lists/:id — add an item to a list (owner only)
- PUT /lists/:id — update list meta (owner only)
- DELETE /lists/:id — delete a list (owner only)
- POST /lists/:id/invited — invite a user to a list by email (owner only)
- PUT /lists/:id/invited — remove an invited user (owner only)
- PUT /lists/:id/item/:itemId — update an item (owner only)
- DELETE /lists/:id/item/:itemId — remove an item (owner only)

Refer to the route files in `src/routes/` and controllers in `src/controllers/` for exact request/response shapes and validation.

## Authentication details

- The server issues two JWTs: an access token (1 day expiry) and a refresh token (7 days expiry). They are signed with `ACCESS_TOKEN_SECRET` and `REFRESH_TOKEN_SECRET`.
- Tokens are set as HttpOnly cookies named `accessToken` and `refreshToken`. Access-protected endpoints use the token from the `accessToken` cookie.
- Role-based authorization middleware is available (Admin vs User).

## Database

- The app uses Mongoose to connect to MongoDB. Set `MONGODB_ADDRESS` to your MongoDB connection string.

## Docker

This repo contains a `Dockerfile` and `docker-compose.yml`. A simple container run looks like:

```bash
docker build -t shoplistapp-server .
docker run -e MONGODB_ADDRESS="<your-mongo>" -e ACCESS_TOKEN_SECRET="<secret>" -e REFRESH_TOKEN_SECRET="<secret>" -p 3004:3004 shoplistapp-server
```

Or with docker-compose:

```bash
docker-compose up --build
```

Check `docker-compose.yml` to see how the DB and other services are wired.

## Notes, assumptions & next steps

- Assumed CORS whitelist values come from `FE_URL_DEV` and `FE_URL_PROD` environment variables. If you want a permissive dev CORS behaviour, set `FE_URL_DEV` to `http://localhost:3000` (or your frontend port).
- Scripts use Bun; if you prefer npm/node tooling replace the scripts or install equivalent dev tooling (ts-node-dev, nodemon, tsc, etc.).
- There are currently no automated tests in the snapshot. Adding Jest + Supertest is recommended.

## Contributing

- Fork, add tests for new behavior, and open a PR against `main`.

---

If you'd like, I can:

- open a PR that adds this README to the repository, or
- update the README with additional details (examples of request/response JSON shapes) by reading specific model/type files.

Contact: Mihai Ivanov — <mihai.ivanov.dev@gmail.com>
