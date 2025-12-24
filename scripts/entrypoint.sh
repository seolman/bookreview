#!/bin/sh

set -e

export PATH="/usr/bin:/app/node_modules/.bin$PATH"

echo "Running database migration"
npm run db:migrate

exec "$@"
