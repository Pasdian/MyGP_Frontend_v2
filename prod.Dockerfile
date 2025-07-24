FROM node:20 AS runner
WORKDIR /app

# Add non-root user
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
USER nextjs

# Only copy what we need (after local build)
COPY public ./public
COPY .next ./.next
COPY package.json ./
COPY node_modules ./node_modules

EXPOSE 3001
CMD ["npm", "start"]
