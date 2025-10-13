FROM node:20 AS base

# Builder stage
FROM base AS builder
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .
# This will do the trick, use the corresponding env file for each environment.
COPY .env.docker .env

RUN npm run build

# Runner stage
FROM base AS runner
WORKDIR /app


RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
USER nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules

ENV TZ=America/Mexico_City

EXPOSE 3001
CMD ["npm", "start"]