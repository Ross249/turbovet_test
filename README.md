# TurboVets Secure Task Management System

## Overview
TurboVets uses an Nx monorepo to host a NestJS API and Angular dashboard that demonstrate secure, role-based task coordination. The goal is to highlight security-first defaults (JWT, RBAC decorators, audit logging), modular boundaries, and agent-friendly UX.

## Project Structure
- `apps/api` – NestJS service with TypeORM (SQLite), JWT auth, RBAC guards, and scenario seeding.
- `apps/dashboard` – Angular 20 + Tailwind UI with NgRx store, drag-and-drop task lanes, and JWT-aware API client.
- `libs/auth` – Shared role definitions, permission matrices, and scope helpers.
- `libs/data` – DTO contracts for tasks, organizations, audit entries, and pagination.

## Run & Test
| Task | Command |
| --- | --- |
| Install deps | `npm install` |
| Start API (http://localhost:3000/api) | `npx nx serve api` |
| Start Dashboard (http://localhost:4200) | `npx nx serve dashboard` |
| Lint all | `npx nx lint` |
| Jest unit tests | `npx nx test auth` |
| API e2e RBAC tests | `npx nx run api-e2e:e2e` |

Default login credentials: `owner@turbovets.test`, `admin@…`, `viewer@…` with `ChangeMe123!`.

## Architecture Highlights
- **Authentication** – `/auth/login` issues JWTs; tokens expire after 60 minutes and are persisted client-side via `AuthStorageService`. A `JwtAuthGuard` validates tokens on every request.
- **RBAC** – Roles (Owner, Admin, Viewer) inherit permissions defined in `libs/auth`. `RequirePermissions` decorator + `PermissionsGuard` enforce action-level rules, while `AccessControlService` constrains organization scope before mutating entities.
- **Data Model** – Organizations (two-level tree), Roles, Permissions, Users, Tasks, and Audit Logs. Seeding creates canonical Orgs and demo users with hashed passwords.
- **Observability** – `AuditService` records CRUD events with actor/resource metadata (persisted + console logged). `/audit-log` is limited to Owner/Admin roles.
- **Frontend State** – NgRx slices (`auth`, `tasks`) coordinate login/restore flows, optimistic task updates, and filter persistence. Tailwind+CDK deliver drag-and-drop lanes with real-time badge counts.

## API Reference (samples)
- `POST /api/auth/login` → `{ "email": "owner@turbovets.test", "password": "ChangeMe123!" }`
- `GET /api/tasks` → `Authorization: Bearer <token>`; supports `status`, `category`, `search` query params.
- `POST /api/tasks` → `{ "title": "Deploy field kit", "organizationId": "<uuid>", "priority": "HIGH" }`
- `PUT /api/tasks/:id` → Partial `UpdateTaskRequest` (status transitions powered by lane drag-drop).
- `GET /api/organizations` → Organization DTO array for scoped dropdowns.
- `GET /api/audit-log?limit=25` → Most recent audit entries (Owner/Admin only).

## Future Enhancements
1. Introduce refresh tokens + short-lived access tokens to tighten session hygiene.
2. Expand org graph to N-depth with materialized-path caching for faster scope resolution.
3. Add WebSocket subscription layer for live board updates and audit feed streaming.
4. Promote `TasksActions` to support optimistic failure rollback & toast notifications.
5. Harden SecOps: integrate dependency scanning, database migrations, and per-request encryption for sensitive metadata.
