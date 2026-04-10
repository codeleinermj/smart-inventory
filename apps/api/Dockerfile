FROM node:20-alpine

WORKDIR /app

RUN npm install -g pnpm@9

# Copy workspace manifests so pnpm can resolve the workspace graph.
# This layer is cached as long as lockfile/manifests do not change.
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared-types/package.json ./packages/shared-types/

# Install deps for api AND shared-types (shared-types needs zod at runtime via tsx).
RUN pnpm install --filter api --filter "@smart-inv/shared-types" --frozen-lockfile

# Copy source. node_modules is excluded via .dockerignore, so pnpm's install layer is preserved.
COPY apps/api/ ./apps/api/
COPY packages/shared-types/ ./packages/shared-types/

WORKDIR /app/apps/api

EXPOSE 3001

# Use `pnpm exec` to resolve tsx through pnpm's workspace-aware bin resolver.
CMD ["pnpm", "exec", "tsx", "watch", "src/server.ts"]
