FROM node:18.12-bullseye AS base
# TBD

FROM node:18.12-bullseye-slim
RUN apt-get update && apt-get install -y --no-install-recommends tini
ENV NODE_ENV production
WORKDIR /usr/src/app
COPY --chown=node:node . .
# Install PROD dependencies
RUN npm ci --only=production
USER node
# Node was not designed to run as PID 1 which leads to unexpected behaviour when running inside of Docker.
# e.g. Node process running as PID 1 will not respond to SIGINT (CTRL-C) and similar signals.
# Tiny properly handles running as PID 1.
ENTRYPOINT ["/usr/bin/tini", "--"]
# Run the server
CMD [ "node", "src/main.js" ]
