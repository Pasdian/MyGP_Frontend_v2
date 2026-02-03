# syntax=docker/dockerfile:1

FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache libc6-compat

# Copy dependency files
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./

# Install dependencies based on the lockfile present
RUN \
    if [ -f pnpm-lock.yaml ]; then \
    npm install -g pnpm && pnpm install; \
    elif [ -f yarn.lock ]; then \
    yarn install; \
    elif [ -f package-lock.json ]; then \
    npm ci; \
    else \
    npm install; \
    fi

COPY . .

ENV NODE_ENV=development
ENV PORT=3000

EXPOSE 3000

CMD ["npm", "run", "dev"]
