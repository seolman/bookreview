#!/bin/sh

set -e

export PATH="/usr/bin:/app/node_modules/.bin$PATH"

DB_HOST=${DB_HOST:-db}                                                                                                            
DB_USER=${DB_USER:-postgres} 
DB_NAME=${DB_NAME:-manga_db} 

until pg_isready -h "${DB_HOST}" -p 5432 -U "${DB_USER}" -d "${DB_NAME}"; do
  echo "PostgreSQL is sleeping"
  sleep 1
done
echo "PostgreSQL is ready"

echo "Running database migration"
npm run db:migrate

exec "$@"
