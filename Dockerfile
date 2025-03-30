FROM oven/bun:latest

WORKDIR /app

COPY package.json bun.lock ./

RUN bun install --frozen-lockfile ----production

COPY lib/ ./lib/
COPY index.ts tsconfig.json ./
COPY entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"] 