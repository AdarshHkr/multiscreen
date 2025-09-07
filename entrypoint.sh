#!/bin/sh
# Exit immediately if a command exits with a non-zero status.
set -e

# --- Debugging Step ---
# Print the DATABASE_URL to the container logs to verify it's being passed correctly.
echo "--- Docker Entrypoint ---"
echo "DATABASE_URL is: '$DATABASE_URL'"
echo "-------------------------"

# Run the Prisma migrations
echo "Running database migrations..."
npx prisma migrate deploy

# Start the main application
echo "Starting the application..."
exec "$@"