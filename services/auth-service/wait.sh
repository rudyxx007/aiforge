#!/bin/bash

# --- Configuration ---
DB_HOST="postgres-db"
DB_PORT="5432"
# This is the correct, standard command to run your server
UVICORN_CMD="python -m uvicorn app.main:app --host 0.0.0.0 --port 8000"

# --- Wait Loop ---
echo "Waiting for PostgreSQL to start at $DB_HOST:$DB_PORT..."

# Use netcat (nc) to check if the port is open.
# We installed 'netcat-openbsd' for this purpose.
while ! nc -z $DB_HOST $DB_PORT; do
  echo "Database not ready. Retrying in 1 second..."
  sleep 1
done

# --- Start Server ---
echo "PostgreSQL started. Executing application command: $UVICORN_CMD"
# Use 'exec' to replace the script process with the Uvicorn server
exec $UVICORN_CMD

