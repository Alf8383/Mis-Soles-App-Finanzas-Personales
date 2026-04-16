import * as SQLite from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";

import * as schema from "./schema";

let sqliteInstance;
let drizzleInstance;

export function getSQLiteDatabase() {
  if (!sqliteInstance) {
    sqliteInstance = SQLite.openDatabaseSync("mis-soles.db");
  }

  return sqliteInstance;
}

export function getDb() {
  if (!drizzleInstance) {
    drizzleInstance = drizzle(getSQLiteDatabase(), { schema });
  }

  return drizzleInstance;
}
