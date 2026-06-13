import { Platform } from "react-native";

import { getSQLiteDatabaseAsync } from "./client";

const APP_META_SQL = `
CREATE TABLE IF NOT EXISTS app_meta (
  key TEXT PRIMARY KEY NOT NULL,
  value TEXT,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO app_meta (key, value, updated_at)
VALUES ('schema_version', '0000_app_meta', CURRENT_TIMESTAMP);
`;

let migrationPromise;

export async function runMigrations() {
  if (Platform.OS === "web") {
    return;
  }

  if (!migrationPromise) {
    migrationPromise = getSQLiteDatabaseAsync().then((db) => db.execAsync(APP_META_SQL));
  }

  await migrationPromise;
}
