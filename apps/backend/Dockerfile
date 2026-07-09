FROM node:24-alpine AS build

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@8.15.6 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/backend/package.json apps/backend/package.json
COPY apps/frontend/package.json apps/frontend/package.json

RUN pnpm install --frozen-lockfile

COPY apps/backend apps/backend

RUN pnpm --filter backend build
RUN pnpm --filter backend deploy --prod /tmp/backend-deploy

FROM build AS migration

WORKDIR /app

CMD ["pnpm", "--filter", "backend", "migration:run"]

FROM node:24-alpine AS runtime

WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /tmp/backend-deploy ./

EXPOSE 3000

CMD ["node", "dist/main"]
