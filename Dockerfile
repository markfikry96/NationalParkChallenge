# Use Node.js 20 as our base image
FROM node:20-slim

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application code
COPY . .

# Create the entrypoint script using printf to avoid heredoc parsing issues
RUN printf '#!/bin/sh\nif [ -n "$DATABASE_URL" ]; then\n  echo "Waiting for PostgreSQL to be ready..."\n  timeout 30s sh -c "until pg_isready -h $PGHOST -p $PGPORT -U $PGUSER; do sleep 1; done"\n  echo "Running database migrations..."\n  npx drizzle-kit push:pg\n  npx tsx scripts/migrate-to-db.ts\nelse\n  echo "DATABASE_URL not set, skipping migrations"\nfi\nexec "$@"\n' > /app/docker-entrypoint.sh && chmod +x /app/docker-entrypoint.sh

# Install PostgreSQL client and dos2unix (optional) to ensure Unix line endings
RUN apt-get update && apt-get install -y postgresql-client dos2unix && \
    dos2unix /app/docker-entrypoint.sh && \
    rm -rf /var/lib/apt/lists/*

# Expose the port the app runs on
EXPOSE 5000

# Set the entry point script
ENTRYPOINT ["/app/docker-entrypoint.sh"]

# Start the application
CMD ["npm", "run", "dev"]
