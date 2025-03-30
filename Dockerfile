FROM oven/bun:latest

WORKDIR /app

COPY package.json bun.lock ./

RUN bun install --frozen-lockfile ----production

COPY lib/ ./lib/
COPY index.ts tsconfig.json ./
COPY entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh

ENV GITHUB_TOKEN=""
ENV GITHUB_USERNAME=""
ENV README_PATH=""
ENV START_MARKER=""
ENV INCLUDE_LANGUAGES=""
ENV EXCLUDE_LANGUAGES=""
ENV SORT_BY=""
ENV MAX_REPOS=""

ENTRYPOINT ["/entrypoint.sh"] 