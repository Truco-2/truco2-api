FROM node:22.1.0-alpine3.18 AS base

WORKDIR /app

COPY ./ ./ 

RUN npm install
CMD ["npm", "run", "start:dev_db"]

# To keep container active for testing
# ENTRYPOINT ["tail", "-f", "/dev/null"]