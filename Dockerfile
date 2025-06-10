# Step 1: Install dependencies and build the app
FROM node:18-alpine AS builder

WORKDIR /app

# Copy only the necessary files first (for better caching)
COPY package.json package-lock.json ./
RUN npm install --legacy-peer-deps

# Copy the rest of the codebase
COPY . .
# Expose Next.js default port
EXPOSE 3002

# Start the app
CMD ["npm", "run", "dev"]
