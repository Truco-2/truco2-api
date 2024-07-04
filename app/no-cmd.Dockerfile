FROM node:22.1.0-alpine3.18 AS base

WORKDIR /app

COPY ./ ./

# To keep container active for testing
# ENTRYPOINT ["tail", "-f", "/dev/null"]