FROM node:22.23.4-bookworm-slim

LABEL author="Pratik Sharma"

RUN mkdir -p meetup-backend

COPY . /meetup-backend

WORKDIR /meetup-backend

RUN npm install pnpm -g

RUN pnpm -v

RUN pnpm install

EXPOSE 3000

CMD [ "pnpm", "dev" ]