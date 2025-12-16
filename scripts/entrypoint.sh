#!/usr/bin/env bash

set -e

until pg_isready -h localhost -p 5432 -U postgres -d manga_db; do
  echo "PostgreSQL is sleeping"
  sleep 1
done
echo "PostgreSQL is ready"

echo "Running database migration"
npm run db:migrate

exec "$@"
