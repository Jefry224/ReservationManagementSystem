FROM node:24-alpine AS build

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@11.6.0 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/backend/package.json apps/backend/package.json
COPY apps/frontend/package.json apps/frontend/package.json

RUN pnpm install --frozen-lockfile

COPY apps/backend apps/backend

RUN pnpm --filter backend build
RUN pnpm --filter backend deploy --legacy --prod /tmp/backend-deploy

FROM build AS migration

WORKDIR /app

CMD ["pnpm", "--filter", "backend", "migration:run"]

FROM node:24-alpine AS runtime

WORKDIR /app
ENV NODE_ENV=development

COPY --from=build /tmp/backend-deploy ./

EXPOSE 3000

CMD ["node", "dist/main"]
