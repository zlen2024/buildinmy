FROM node:20-slim AS builder
WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl sqlite3

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ENV DATABASE_URL="file:/app/db/custom.db"
RUN npx prisma generate
RUN npm run build

FROM node:20-slim AS runner
WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl sqlite3

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV DATABASE_URL="file:/app/db/custom.db"

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/db ./db
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

CMD ["node", "server.js"]
