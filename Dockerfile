FROM node:19.6.1-bullseye-slim as base
RUN apt-get update && apt-get install -y --no-install-recommends tini
WORKDIR /usr/src/app


FROM base AS build
COPY ["package.json", "package-lock.json", "./"]

RUN npm ci
COPY . .
RUN npm run build --workspaces


FROM base AS prod
ENV NODE_ENV production
COPY --from=build /usr/src/app/package*.json .
RUN npm ci --only=production && npm cache clean --force

COPY --from=build /usr/src/app/packages/bship-app/dist ./packages/bship-app/dist
COPY --from=build /usr/src/app/packages/bship-app/package*.json ./packages/bship-app

COPY --from=build /usr/src/app/packages/bship-contracts/dist ./packages/bship-contracts/dist
COPY --from=build /usr/src/app/packages/bship-contracts/package*.json ./packages/bship-contracts

COPY --from=build /usr/src/app/packages/bship-server/dist ./packages/bship-server/dist
COPY --from=build /usr/src/app/packages/bship-server/package*.json ./packages/bship-server

EXPOSE 3001
RUN chown -R node /usr/src/app
USER node
# Node was not designed to run as PID 1 which leads to unexpected behaviour when running inside of Docker.
# e.g. Node process running as PID 1 will not respond to SIGINT (CTRL-C) and similar signals.
# Tiny properly handles running as PID 1.
ENTRYPOINT ["/usr/bin/tini", "--"]

CMD [ "node", "./packages/bship-server/dist/src/main.js" ]
