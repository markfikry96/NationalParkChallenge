import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { pgTable } from 'drizzle-orm/pg-core';
import { parks, matchups, users } from '../shared/schema';

// Check for database URL
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Create postgres client
const client = postgres(process.env.DATABASE_URL);

// Create drizzle database instance
export const db = drizzle(client, {
  schema: { 
    parks, 
    matchups,
    users 
  },
});

// Export tables for ease of use
export const parksTable = parks;
export const matchupsTable = matchups;
export const usersTable = users;