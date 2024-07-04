#!/bin/sh
if [ -e app/.env ]
then
    rm app/.env
fi



cat <<EOF > app/.env
DATABASE_URL="$3"
JWT_SECRET="$4"
EOF

APP_NAME=$1 APP_PORT=$2 docker compose -f docker-compose.server.yml up --build