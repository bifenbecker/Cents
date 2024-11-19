FROM node:14-alpine
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
ADD package*.json /usr/src/app/
RUN ls -l
RUN yarn install
ADD . /usr/src/app
ENV PORT 3000
EXPOSE $PORT
CMD ["yarn", "start", "-o", "--watch"]