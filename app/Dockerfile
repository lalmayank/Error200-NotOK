# Stage 1: Base
FROM node:20-alpine AS base
WORKDIR /app

# Stage 2: Install ALL dependencies (for building)
FROM base AS deps
COPY package.json package-lock.json ./
# Removed the custom proxies and registry so Render can reach NPM
RUN --mount=type=cache,target=/root/.npm \
    npm ci --prefer-offline --no-audit --fund false

# Stage 3: Build the application
FROM deps AS build
COPY . .
RUN npm run build

# Stage 4: Production Dependencies Only
FROM base AS prod-deps
COPY package.json package-lock.json ./
# Install ONLY production dependencies
RUN --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev --prefer-offline --no-audit --fund false

# Stage 5: Final Production Image
FROM node:20-alpine AS production
WORKDIR /app

# Copy only production node_modules
COPY --from=prod-deps /app/node_modules ./node_modules
# Copy the compiled dist folder (frontend + backend)
COPY --from=build /app/dist ./dist
# Only copy package.json (keep .env out for security)
COPY package.json ./

EXPOSE 3000
# Change this line in your Dockerfile
CMD ["node", "-r", "dotenv/config", "dist/boot.js"]
