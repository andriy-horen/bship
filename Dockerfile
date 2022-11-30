# FROM node:lts-alpine
# ENV NODE_ENV=production
# WORKDIR /usr/src/app
# COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
# RUN npm install --production --silent && mv node_modules ../
# COPY . .
# EXPOSE 3000
# RUN chown -R node /usr/src/app
# USER node
# CMD ["npm", "start"]




# FROM node:18.12-bullseye AS base
# TBD

#FROM node:18.12.1-bullseye-slim as base
FROM node:18.12.1-bullseye as base
RUN apt-get update && apt-get install -y --no-install-recommends tini
WORKDIR /usr/src/app


FROM base AS build
COPY ["package.json", "package-lock.json", "./"]
# Install PROD dependencies
RUN npm ci
COPY . .
RUN npm run build --workspaces


FROM base AS prod
ENV NODE_ENV production
COPY --from=build /usr/src/app/package*.json .
RUN npm ci --only=production
COPY --from=build /usr/src/app/dist ./dist/

EXPOSE 3001
RUN chown -R node /usr/src/app
USER node
# Node was not designed to run as PID 1 which leads to unexpected behaviour when running inside of Docker.
# e.g. Node process running as PID 1 will not respond to SIGINT (CTRL-C) and similar signals.
# Tiny properly handles running as PID 1.
ENTRYPOINT ["/usr/bin/tini", "--"]
# Run the server
CMD [ "node", "./dist/server/src/main.js" ]
