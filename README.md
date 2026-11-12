# SecureDrop

> **Status: no longer maintained.** This was a learning project and is kept here for reference. Issues and PRs won't be reviewed.

An anonymous whistleblower portal. People can submit reports and attachments without an account, and reviewers sign in to triage them. Access is controlled by roles and permissions, and every view is written to an audit log.

## Features

- Anonymous submissions with file attachments (uploads are checked by file signature, not just by extension)
- JWT authentication, with optional auth on the public submission routes
- Role and permission based access control (`User`, `Role`, `Permission`, `UserRole`)
- Submission status workflow and an access audit log
- Input sanitisation pipe on incoming requests
- HTTPS in development

## Stack

| Layer | Tech |
|---|---|
| Backend | NestJS, Prisma, PostgreSQL, Passport JWT, argon2 |
| Frontend | React 19, React Router, Vite, TypeScript |
| Infra | Docker Compose, Dockerfiles in `infra/` |

## Running locally

1. Start Postgres:
   ```bash
   docker compose up -d
   ```
2. Generate a self-signed dev certificate. The backend reads it from `backend/secrets/`, which is git-ignored:
   ```bash
   mkdir -p backend/secrets
   openssl req -x509 -newkey rsa:2048 -nodes -days 365 -subj "/CN=localhost" \
     -keyout backend/secrets/server.key -out backend/secrets/server.cert
   ```
3. Create `backend/.env` with `DATABASE_URL` (pointing at the Postgres container on port 5433) and `JWT_SECRET`.
4. Backend:
   ```bash
   cd backend
   pnpm install
   pnpm prisma migrate dev
   pnpm prisma db seed
   pnpm start:dev
   ```
5. Frontend:
   ```bash
   cd frontend
   pnpm install
   pnpm dev
   ```

The credentials in `docker-compose.yml` and the seed script are local-development placeholders only.
