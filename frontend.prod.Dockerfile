# --- Dependencies stage ---
FROM node:20 AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# --- Build stage ---
FROM node:20 AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules

# Copy env FIRST so Next can read it at build time
COPY .env .env

# Copy the rest of the frontend source
COPY . .

# Next.js will read .env automatically
RUN npm run build

# --- Runtime stage ---
FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY package*.json ./
COPY --from=deps /app/node_modules ./node_modules

EXPOSE 3000
CMD ["npm", "start"]
