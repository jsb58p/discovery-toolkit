import { createClient } from "@libsql/client";

// Requires two environment variables set in Vercel project settings:
//   TURSO_DATABASE_URL  - e.g. libsql://your-db-name-yourorg.turso.io
//   TURSO_AUTH_TOKEN    - generated via `turso db tokens create <db-name>`
let client;

export function getDb() {
  if (!client) {
    if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
      throw new Error(
        "Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN environment variables."
      );
    }
    client = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
  return client;
}

let schemaReady = false;

export async function ensureSchema() {
  if (schemaReady) return;
  const db = getDb();
  await db.execute(`
    CREATE TABLE IF NOT EXISTS opportunities (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      employee TEXT NOT NULL,
      department TEXT,
      task TEXT NOT NULL,
      current_workflow TEXT,
      pain_point TEXT,
      software TEXT,
      minutes_per_occurrence REAL,
      frequency TEXT,
      hours_per_week REAL,
      requires_human_judgment TEXT,
      ai_solution TEXT,
      recommended_tool TEXT,
      implementation_idea TEXT,
      impact_score INTEGER,
      effort_score INTEGER,
      priority TEXT,
      estimated_annual_hours_saved REAL,
      status TEXT DEFAULT 'Needs Discussion',
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);
  schemaReady = true;
}
