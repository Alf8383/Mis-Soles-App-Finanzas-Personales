import { getSQLiteDatabase } from "./client";

const APP_META_SQL = `
CREATE TABLE IF NOT EXISTS app_meta (
  key TEXT PRIMARY KEY NOT NULL,
  value TEXT,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO app_meta (key, value, updated_at)
VALUES ('schema_version', '0000_app_meta', CURRENT_TIMESTAMP);
`;

export async function runMigrations() {
  const db = getSQLiteDatabase();
  await db.execAsync(APP_META_SQL);
}
