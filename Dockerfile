FROM node:18-bullseye-slim

RUN apt-get update && apt-get install -y curl unzip && \
    curl -fsSL https://bun.sh/install | bash && \
    ln -s /root/.bun/bin/bun /usr/local/bin/bun

WORKDIR /app

COPY package.json bun.lockb ./

RUN bun install

COPY . .

EXPOSE 8080

CMD ["bun", "run", "start"]