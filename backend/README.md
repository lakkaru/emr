# EMR Backend API

Secure Node/Express API for patient registration. HIPAA-conscious: avoid PHI in logs, enforce TLS in production, implement RBAC and audit logging.

## Quick start

- Copy `.env.example` to `.env` and fill values.
- Run: `npm i` then `npm run dev`.

## Endpoints

- POST /api/auth/register (admin)
- POST /api/auth/login
- POST /api/patients (auth)
- GET /api/patients (auth)
- POST /api/patients/check-duplicate (auth)
- GET /api/audits (admin)

## Deploy

- Use pm2 with `ecosystem.config.js`.
- Behind Nginx reverse proxy with HTTPS.

Notes: Configure CORS allowlist for Gatsby origin; rotate JWT secret; set logging to minimal in production.