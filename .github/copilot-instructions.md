# Copilot instructions (shoplistapp-server)

## Big picture

- Express API (no `/api` prefix): routes in `src/routes/*` mounted in `src/server.ts` at `/users` and `/lists`.
- Persistence is MongoDB via Mongoose models in `src/models/**`.
- Auth is cookie-based JWT: `accessToken` and `refreshToken` HttpOnly cookies (see `src/controllers/userController.ts`, `src/auth/tools.ts`).

## Day-to-day dev workflow

- Install: `bun install`
- Dev (watch): `bun run dev` (runs `src/server.ts` directly)
- Build: `bun run build` (emits `build/server.js`)
- Start built: `bun run start`

## Server & middleware conventions

- Middleware order in `src/server.ts` matters: `limiter` → `helmet` → `cors` → `express.json()` → `cookieParser()` → routes → `errorHandler`.
- CORS is strict: allowed origins come from `FE_URL_DEV` and `FE_URL_PROD`, normalized without trailing slashes.

## Auth/authorization patterns

- Protect routes with `JWTAuthMiddleware` (reads `req.cookies.accessToken`, attaches `req.user`; typing is extended in `typings/express.d.ts`).
- Role checks use `authorize(['Admin' | 'User' ...])` from `src/auth/index.ts`.
- For list-owner-only endpoints, also include `ownsList` from `src/controllers/listController.ts`.
- Request-body field blocking uses `blacklist([...])` (express-validator) from `src/auth/validator.ts` (e.g. `/users/profile` blocks `role`).

## API shape (routes)

- Base paths are mounted directly (no `/api`): `/users/*` and `/lists/*` (see `src/routes/userRoutes.ts`, `src/routes/listRoutes.ts`).
- **Users**
  - `POST /users/register` (public) → creates user, sets `accessToken` + `refreshToken` cookies.
  - `POST /users/login` (public) → validates credentials, sets cookies.
  - `POST /users/logout` (auth) → clears cookies.
  - `GET /users/profile` (auth) and `PUT /users/profile` (auth + `blacklist(['role'])`).
  - `GET /users` (auth + `authorize(['Admin'])`).
- **Lists**
  - `GET /lists` (auth + `authorize(['Admin'])`).
  - `GET /lists/user` (auth) → returns lists where current user is `user` (owner) or is in `invited`.
  - `POST /lists/user` (auth) → creates list for current user.
  - Owner-only list mutations use `ownsList` and require `:id` to be a valid Mongo ObjectId (invalid id → 400).
  - List items are embedded subdocuments (`lists.items[]`), so item routes use `:itemId` (subdoc `_id`):
    - `POST /lists/:id` add item, `PUT /lists/:id/item/:itemId` update, `DELETE /lists/:id/item/:itemId` remove.
  - Collaborators use `invited[]` by user id; invite/remove endpoints take an `email` in the body:
    - `POST /lists/:id/invited` add invited, `PUT /lists/:id/invited` remove invited.

## Controllers: error and response style

- Controllers are async with `try/catch` and `next(error)` (see `src/controllers/*.ts`).
- Prefer `http-errors` (`createError(...)`) for consistent status codes; the centralized handler returns JSON:
  - `{ status, error, details }` where `details` is only set for 400 and comes from `err.errorsList` (see `src/utils/errorHandlers/errorHandlers.ts`).

## Data layer conventions

- Mongoose schemas live in `src/models/**`; Typescript interfaces live alongside in `types.ts`.
- User passwords are hashed in a `pre('save')` hook using Bun’s `password.hash` with `SALT_ROUNDS` (see `src/models/users/userModel.ts`). Don’t manually hash in controllers.

## Environment variables (used in code)

- `MONGODB_ADDRESS`, `PORT`, `NODE_ENV`, `FE_URL_DEV`, `FE_URL_PROD`, `ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_SECRET`, `SALT_ROUNDS`.

## When adding a new endpoint

- Add the handler in `src/controllers/*Controller.ts`, wire it in the appropriate router in `src/routes/*Routes.ts`, and mount only via `src/server.ts`.
- Decide if it needs `JWTAuthMiddleware`, `authorize(...)`, and/or list ownership (`ownsList`).
- Return plain JSON (or `204` on delete/logout) consistent with existing controllers.
