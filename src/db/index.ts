import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

let cachedDb: NodePgDatabase<typeof schema> | null = null;
let cachedPool: Pool | null = null;

/**
 * Returns a Drizzle PostgreSQL instance when DATABASE_URL is configured.
 * Returns null in local-only mode so builds, tests, and offline dev run cleanly
 * without requiring a live PostgreSQL database.
 */
export function getDb(): NodePgDatabase<typeof schema> | null {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    return null;
  }

  if (!cachedDb) {
    cachedPool = new Pool({
      connectionString,
      max: 5,
    });
    cachedDb = drizzle(cachedPool, { schema });
  }

  return cachedDb;
}

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}
