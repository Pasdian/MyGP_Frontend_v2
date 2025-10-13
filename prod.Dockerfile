FROM node:20 AS base

# ---------- Builder ----------
FROM base AS builder
WORKDIR /app

# Make the value available during "next build"
ARG NEXT_PUBLIC_DEA_API_KEY
ENV NEXT_PUBLIC_DEA_API_KEY=$NEXT_PUBLIC_DEA_API_KEY

ARG NODE_ENV
ENV NODE_ENV=$NODE_ENV

ARG NEXT_PUBLIC_POSTHOG_HOST
ENV NEXT_PUBLIC_POSTHOG_HOST=$NEXT_PUBLIC_POSTHOG_HOST

ARG NEXT_PUBLIC_POSTHOG_KEY
ENV NEXT_PUBLIC_POSTHOG_KEY=$NEXT_PUBLIC_POSTHOG_KEY

COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
RUN npm run build

# ---------- Runner ----------
FROM base AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
USER nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules

# Make Next listen on 3001 to match Caddy
ENV TZ=America/Mexico_City
ENV PORT=3001
EXPOSE 3001

CMD ["npm", "start"]
