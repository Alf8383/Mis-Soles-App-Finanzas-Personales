import * as SQLite from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { Platform } from "react-native";

import * as schema from "./schema";

const DATABASE_NAME = Platform.OS === "web" ? ":memory:" : "mis-soles.db";

let sqliteInstance;
let sqliteInstancePromise;
let drizzleInstance;

export function getSQLiteDatabase() {
  if (!sqliteInstance) {
    sqliteInstance = SQLite.openDatabaseSync(DATABASE_NAME);
  }

  return sqliteInstance;
}

export async function getSQLiteDatabaseAsync() {
  if (sqliteInstance) {
    return sqliteInstance;
  }

  if (!sqliteInstancePromise) {
    sqliteInstancePromise = SQLite.openDatabaseAsync(DATABASE_NAME).then((database) => {
      sqliteInstance = database;
      return database;
    });
  }

  return sqliteInstancePromise;
}

export function getDb() {
  if (!drizzleInstance) {
    drizzleInstance = drizzle(getSQLiteDatabase(), { schema });
  }

  return drizzleInstance;
}
