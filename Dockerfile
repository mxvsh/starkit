FROM oven/bun:latest

WORKDIR /app

COPY package.json bun.lockb* ./
RUN bun install

COPY lib ./lib
COPY index.ts tsconfig.json ./

ENTRYPOINT ["bun", "run", "index.ts"] 