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

# Create a PostgreSQL database migration script
RUN echo '#!/bin/sh\n\
if [ -n "$DATABASE_URL" ]; then\n\
  echo "Running database migrations..."\n\
  npx tsx scripts/migrate-to-db.ts\n\
else\n\
  echo "DATABASE_URL not set, skipping migrations"\n\
fi\n\
exec "$@"' > /app/docker-entrypoint.sh && chmod +x /app/docker-entrypoint.sh

# Expose the port the app runs on
EXPOSE 5000

# Set the entry point script
ENTRYPOINT ["/app/docker-entrypoint.sh"]

# Start the application
CMD ["npm", "run", "dev"]