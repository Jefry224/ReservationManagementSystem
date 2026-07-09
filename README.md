# ReservationManagementSystem

## Local Docker

Start the full application with a single command:

```bash
docker compose up --build
```

Local services:

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- Postgres: localhost:5433
- Redis: localhost:6379

All services run on the `rms-network` network. The backend connects to Postgres using `postgres:5432` and to Redis using `redis:6379` inside Docker.

### k6 concurrency demo

The repository includes a script in [`scripts/concurrency-booking.k6.js`](/home/jefry/dev/personal/ReservationManagementSystem/scripts/concurrency-booking.k6.js) that fires multiple concurrent bookings for the same slot and verifies that only one is created.

Run it with:

```bash
docker compose run --rm k6
```

The test uses `20` VUs by default and automatically computes a future 30-minute slot so dates do not need to be hardcoded.

### Docker migrations

To run migrations inside the Docker environment:

```bash
docker compose run --rm migrate
docker compose run --rm migrate-revert
```

They are also exposed as scripts in `package.json`:

```bash
pnpm db:migrate:run:docker
pnpm db:migrate:revert:docker
```

To stop the stack:

```bash
docker compose down
```
