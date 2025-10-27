#!/bin/bash
# wait.sh

# Reads the DB_HOST variable from the environment
# (This will be "postgres-db" locally, and "postgres-gke-service" in GKE)
DB_HOST=${DB_HOST}
DB_PORT=5432
UVICORN_CMD="python -m uvicorn app.main:app --host 0.0.0.0 --port 8000"

echo "Waiting for PostgreSQL to start at $DB_HOST:$DB_PORT..."

# Loop until netcat (nc) can connect to the database
while ! nc -z $DB_HOST $DB_PORT; do
  echo "Database not ready. Retrying in 1 second..."
  sleep 1
done

echo "PostgreSQL started. Executing application command: $UVICORN_CMD"
# Replace this shell process with the Uvicorn process
exec $UVICORN_CMD