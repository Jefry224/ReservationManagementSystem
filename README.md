# Reservation Management System

Technical challenge submission for a reservation booking platform with a patient-facing frontend and a provider portal.

## What is deployed today

The application is currently deployed with a split managed stack:

- Frontend: Vercel
- Backend API: Render
- Database: Neon Postgres
- Redis: Upstash

Locally, the full stack runs with Docker Compose.

## Tech choices

### Backend: NestJS

I chose NestJS for the backend because this codebase benefits from a structured, opinionated Node.js framework.

- The domain is split into clear modules: providers, reservations, email queue, and database.
- Dependency injection keeps the booking flow testable and easier to reason about.
- NestJS works well with TypeORM transactions, validation pipes, and BullMQ workers.
- The framework makes it straightforward to grow into a larger system without turning the codebase into a set of ad hoc route handlers.

Why not a lighter framework such as Fastify or Hono?

- They would be perfectly valid choices for a smaller surface area.
- For this challenge, the extra structure from NestJS is more useful than minimalism because the solution needs transactions, queue processing, DTO validation, and a clean module boundary.

### Frontend: React + Vite

I chose React with Vite because the UI is a standard single-page booking experience with a provider dashboard.

- Vite gives a fast local dev loop and a simple production build.
- React fits the component-driven booking flow well.
- The app benefits more from straightforward state composition than from a heavier frontend framework.
- The current UI is intentionally simple and can be expanded without reworking the stack.

Why not a different frontend framework?

- The challenge does not need server-rendering complexity.
- React keeps the implementation easy to audit and extend.
- Vite gives the speed and ergonomics needed for a small-to-medium SPA.

## Architecture notes

The solution is organized as a monorepo with three main pieces:

- `apps/backend`: NestJS API
- `apps/frontend`: React client
- `scripts`: operational and load-testing scripts

### Backend architecture

The backend follows a modular design:

- `providers` exposes provider data and validation.
- `reservations` owns booking creation, availability queries, and the provider dashboard data.
- `email-queue` isolates asynchronous notification processing through BullMQ.
- `database` centralizes TypeORM configuration and migrations.

The booking flow is intentionally simple:

1. Validate the request payload.
2. Open a TypeORM transaction.
3. Lock the provider row with a pessimistic write lock.
4. Check for overlapping reservations in the requested slot.
5. Persist the reservation.
6. After the transaction commits, enqueue the confirmation email job.

That order matters. The email job is only queued after the reservation is safely committed, so notifications do not get sent for bookings that fail or roll back.

### Frontend architecture

The frontend is split by feature rather than by technical layer:

- `features/booking` handles the patient booking flow.
- `features/reservations` handles the provider dashboard.
- `shared/components` contains reusable UI primitives and layout.
- `shared/lib` contains utilities and API helpers.

This keeps booking-specific logic out of the shared layer and makes the UI easier to extend later with authentication and role-based access.

## Concurrency handling

The main constraint is that two patients must not book the same provider slot at the same time.

The current approach combines application-level locking and a transactional overlap check:

- the provider row is locked pessimistically during booking,
- overlapping reservations are checked inside the same transaction,
- the reservation is saved only if the slot is still free,
- an email job is queued only after commit.

This is a pragmatic solution for the current scope.

Trade-off:

- It is easy to understand and works well with the current relational schema.
- It reduces the chance of double booking without making the design overly complex.
- It is not the most advanced possible approach, because a database-level exclusion constraint or a more elaborate slot-reservation model could make the invariant even stronger.

The repository includes a k6 script in [`scripts/concurrency-booking.k6.js`](scripts/concurrency-booking.k6.js) to validate the behavior under concurrent requests.

## Local setup

### Requirements

- Node.js
- pnpm 11.6.0
- Docker and Docker Compose

### Start everything locally

```bash
docker compose up --build
```

Services:

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- Postgres: localhost:5433
- Redis: localhost:6379

### Useful commands

```bash
pnpm run dev:backend
pnpm run dev:frontend
pnpm run build:backend
pnpm run build:frontend
pnpm db:migrate:run:docker
pnpm db:migrate:revert:docker
```

### Load test

```bash
docker compose run --rm k6
```

## AWS deployment plan

The solution is designed with AWS in mind. The migration path I would use is:

- Frontend: AWS Amplify
- Backend API: ECS Fargate
- Database: Amazon RDS for PostgreSQL
- Cache / queue backend: Amazon ElastiCache for Redis
- DNS: Route 53
- TLS certificates: ACM
- Networking: VPC with public and private subnets

### Why these services

- Amplify is a good fit for the frontend because it handles build, hosting, preview deployments, and custom domain integration with very little operational overhead.
- ECS Fargate avoids server management for the backend while keeping deployment close to the Docker image already used locally.
- RDS gives managed Postgres with backups, monitoring, and sane operational defaults.
- ElastiCache is the natural managed replacement for Redis when BullMQ is part of the backend.
- Route 53 and ACM are the standard AWS pieces for a custom domain and HTTPS.

### Network layout

I would keep the data layer private:

- RDS in private subnets
- ElastiCache in private subnets
- ECS tasks in private subnets
- security groups allowing only the backend to reach Postgres and Redis

For the public surface:

- Amplify serves the frontend
- the backend is exposed through a controlled ingress layer, typically an Application Load Balancer in front of ECS, or another equivalent entry point if the API needs a different exposure model

If the backend needs to call external email or SMS providers, I would allow outbound traffic through a NAT gateway and keep the database and cache unreachable from the internet.

### Custom domain

A custom domain can be added from AWS using Route 53 and ACM. That gives DNS management, certificate issuance, and clean HTTPS configuration in the same platform.

## Current trade-offs

- The product is functional but intentionally basic.
- The UI solves the booking flow, but the calendar component could be better designed.
- Email delivery is still mocked at the worker level rather than integrated with a real mail provider.
- Security is minimal for the current scope.
- There is no role-based login yet, so the provider and patient experiences are still separate views rather than separately authenticated areas.
- Automated tests are limited and should be expanded.

## What I would do with more time

- Add authentication and split the patient and provider portals behind login.
- Add role-based authorization and session handling, at minimum with JWT.
- Expand automated tests, especially booking concurrency, API coverage, and UI flows.
- Replace the mocked email worker with a real outbound mail provider.
- Add SMS notifications for reservation confirmation.
- Rework the calendar UX and visual design.
- Finish the AWS migration end to end.

## Questions worth asking before production

- What is the required authentication model for patients and providers?
- Which notification channels are mandatory: email only, SMS only, or both?
- Do reservations need cancellation, rescheduling, or provider-managed overrides?
- Should the system enforce availability at the database level in addition to application-level locking?
- What observability is required: logs only, or metrics and tracing as well?

## Repository structure

```text
apps/backend   # NestJS API, TypeORM, BullMQ workers
apps/frontend  # React SPA
scripts        # k6 load test and operational scripts
```
