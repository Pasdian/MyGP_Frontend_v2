# --- Dependencies stage ---
FROM node:20 AS deps
WORKDIR /app

# We are INSIDE frontend, so package.json is at ./package.json
COPY package*.json ./

RUN npm ci


# --- Build stage ---
FROM node:20 AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules

# Copy all frontend source (we're in frontend/, so this is correct)
COPY . .

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
