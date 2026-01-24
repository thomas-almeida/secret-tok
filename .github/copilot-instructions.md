<!-- Copilot instructions for working on the `secret-tok` repo -->

# Project Overview
- Monorepo-style layout: a Node/Express backend and a Next.js frontend.
- Backend: Express + Mongoose (MongoDB). See [backend/server.js](backend/server.js#L1).
- Frontend: Next.js app in `frontend/` (dev server on :3000). See [frontend/package.json](frontend/package.json#L1).

# Big Picture / Data Flow
- Frontend calls backend HTTP APIs under `/api/*` (backend route mounting in [backend/server.js](backend/server.js#L1)).
- Persistent data uses MongoDB via Mongoose models in [backend/models](backend/models).
- Subscription plans are kept as an in-repo config (no external billing provider integration) in [backend/config/plans.js](backend/config/plans.js#L1).

# Key Files and Patterns
- API routes: [backend/routes](backend/routes) — each file registers an Express Router and controller handlers.
- Controllers: [backend/controllers](backend/controllers) — export handler functions (e.g. `getPlans`) and respond with JSON.
- Models: [backend/models/*.js](backend/models) — default Mongoose model exports (ESM). Example: `User` in [backend/models/User.js](backend/models/User.js#L1).
- Config-only modules: [backend/config/plans.js](backend/config/plans.js#L1) exports named helpers `getAllPlans` / `getPlanById`.

# Project Conventions
- ESM modules: `package.json` for backend sets `"type": "module"` — use `import`/`export` (see [backend/package.json](backend/package.json#L1)).
- Controllers use async functions and send JSON with `res.status(...).json({...})`.
- Models use `export default` for Mongoose models and schemas.
- Environment: `.env`-driven; DB connection uses `process.env.DB_URI`. Check [backend/server.js](backend/server.js#L1).

# Developer Workflows
- Start backend dev server: from `/backend` run `npm run dev` (uses `nodemon`).
- Start frontend dev server: from `/frontend` run `npm run dev` (Next.js).
- No root-level task orchestrator provided — run frontend and backend in separate terminals or add a small root script if desired.

# Repository-specific gotchas & actionable notes
- plans.js exports named functions (`getAllPlans` / `getPlanById`). Some controllers import default — check imports for named vs default mismatch. Example: [backend/controllers/subscriptionController.js](backend/controllers/subscriptionController.js#L1) currently imports `getAllPlans` as default which will fail at runtime; prefer `import { getAllPlans } from '../config/plans.js'`.
- No automated tests present — be cautious when changing contracts between frontend and backend.
- Code style: frontend uses ESLint/TypeScript configs in `frontend/` — run `npm run lint` there.

# How to Add a New API Endpoint
- Create controller function in `backend/controllers/*.js` that exports the handler.
- Add a route in `backend/routes/*.js` (use `express.Router()`), require the controller, and export the router.
- Mount the new route in [backend/server.js](backend/server.js#L1) with a path under `/api/*`.
- Update frontend fetch calls to point to `http://localhost:<backend-port>/api/<your-route>` (or configure a proxy during development).

# When You Need More Context
- Inspect running logs from `backend` — the server prints Mongo connection and port on successful startup.
- Check `frontend/app` for UI components and how data is passed into pages/components.

# If You Break Something
- Backend: inspect console where `npm run dev` was started for stack traces.
- Typical quick fix: named vs default import/export mismatches (see subscription plans example above).

# Questions for the Maintainer
- Preferred backend port default (env var) and any expected CORS origins to allow?
- Any CI or deploy steps omitted from this repo that an agent should be aware of?

Please review and tell me which sections need more detail or examples.
