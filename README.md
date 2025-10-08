# EMR Registration (Gatsby + Node)

- Frontend: Gatsby (mobile-first with MUI) in `frontend/`
- Backend: Node/Express + MongoDB in `backend/`

## Local dev

1) Backend
- Copy `backend/.env.example` to `backend/.env` and set MONGODB_URI, JWT_SECRET.
- From `backend/`: `npm i` then `npm run dev` (listens on :4000)

2) Frontend
- From `frontend/`: `npm i` then `npm start` (Gatsby dev server on :8000)
- API calls `/api/*` are proxied to backend.

### Environment variables

- `JWT_EXPIRES_IN` (backend) - Optional. Set JWT expiry (e.g. `8h`, `1d`). Default: `8h`.
- `GATSBY_INACTIVITY_MINUTES` (frontend) - Optional. Auto-logout after this many minutes of inactivity. Set to `0` to disable auto-logout. Default: `15`.

## Deploy (Ubuntu VPS)
- Use PM2 with `backend/ecosystem.config.js`.
- Nginx reverse proxy to backend `http://127.0.0.1:4000` and serve Gatsby build.
- Enforce HTTPS; never log PHI; restrict access by roles; enable auto-logoff.

## HIPAA-conscious notes
- TLS required in prod; no PHI in logs or analytics; strict RBAC; audit trails enabled.
- Configure CORS allowlist to exact origins.