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

## Deploy (Ubuntu VPS)
- Use PM2 with `backend/ecosystem.config.js`.
- Nginx reverse proxy to backend `http://127.0.0.1:4000` and serve Gatsby build.
- Enforce HTTPS; never log PHI; restrict access by roles; enable auto-logoff.

## HIPAA-conscious notes
- TLS required in prod; no PHI in logs or analytics; strict RBAC; audit trails enabled.
- Configure CORS allowlist to exact origins.