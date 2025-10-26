#!/bin/bash
# wait.sh

DB_HOST=postgres-db
DB_PORT=5432
# Ensure this command exactly matches the CMD in the standalone services
UVICORN_CMD="python -m uvicorn app.main:app --host 0.0.0.0 --port 8000"

echo "Waiting for PostgreSQL to start at $DB_HOST:$DB_PORT"

while ! nc -z $DB_HOST $DB_PORT; do
  sleep 0.5
done

echo "PostgreSQL started. Executing application command: $UVICORN_CMD"
# Use exec to replace the shell process with the uvicorn process
exec $UVICORN_CMD