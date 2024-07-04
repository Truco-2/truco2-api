FROM node:22.1.0-alpine3.18 AS base

WORKDIR /app

COPY ./ ./ 

RUN npm ci
RUN npm run build
RUN npx prisma generate 
RUN npx prisma migrate deploy

CMD ["node", "dist/main"]