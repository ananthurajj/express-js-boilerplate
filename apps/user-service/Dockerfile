# Use the official Node.js image as the base image
FROM node:20-slim

# create & set working directory
RUN mkdir -p /home/node/express-check
WORKDIR /home/node/express-check

# copy global package.json files
COPY --chown=node package*.json ./

RUN mkdir -p apps/user-service

# create & copy package.json file of user-service

COPY --chown=node ./apps/user-service/package.json ./apps/user-service/
COPY --chown=node ./apps/user-service ./apps/user-service

# install dependencies
RUN npm install -w user-service --include-workspace-root --ignore-scripts --omit=dev 

ENV HOST=0.0.0.0 PORT=3000

EXPOSE ${PORT}
CMD [ "npm", "run", "-w", "user-service", "start" ]