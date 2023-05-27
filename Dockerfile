FROM node:16-alpine
COPY . /app
COPY package.json /app
WORKDIR /app
RUN apk update
RUN yarn
ENTRYPOINT ["yarn", "start"]