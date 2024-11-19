FROM node:14.17.4-alpine

WORKDIR /app

COPY ["package.json", "package-lock.json*", "./"]

RUN apk add --no-cache --virtual .build-deps alpine-sdk python \
    && apk add curl \
    && npm ci \
    && npm cache clean --force \
    && apk del .build-deps \
    && rm -rf /var/cache/apk/*

COPY . .

CMD ["node", "index.js"]
