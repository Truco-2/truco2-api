FROM node:22.1.0-alpine3.18 AS base

WORKDIR /app

COPY ./ ./ 

RUN npm ci
RUN npm run build

CMD ["node", "dist/main"]