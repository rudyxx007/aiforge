    #!/bin/bash
    
    # This is the command that starts your Python application
    UVICORN_CMD="python -m uvicorn app.main:app --host 0.0.0.0 --port 8000"
    
    # Check if the KUBERNETES_SERVICE_HOST variable exists.
    # This variable is *only* set inside a Kubernetes pod.
    if [ -n "$KUBERNETES_SERVICE_HOST" ]; then
      # --- We are in GKE (PRODUCTION) ---
      echo "Running in GKE. Bypassing wait script."
      # The Cloud SQL Proxy sidecar will handle the DB connection.
      # Just execute the main application command.
      exec $UVICORN_CMD
    else
      # --- We are in Docker Compose (LOCAL) ---
      DB_HOST="postgres-db"
      DB_PORT="5432"
    
      echo "Running locally. Waiting for PostgreSQL to start at $DB_HOST:$DB_PORT..."
    
      # Loop until netcat (nc) can successfully connect to the local DB
      while ! nc -z $DB_HOST $DB_PORT; do
        echo "Database not ready. Retrying in 1 second..."
        sleep 1
      done
    
      echo "PostgreSQL started. Executing application command: $UVICORN_CMD"
      exec $UVICORN_CMD
    fi
    

