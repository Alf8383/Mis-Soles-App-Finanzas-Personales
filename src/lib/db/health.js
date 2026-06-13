import { Platform } from "react-native";

import { getSQLiteDatabaseAsync } from "./client";

export async function getDatabaseHealth() {
  if (Platform.OS === "web") {
    return {
      ready: true,
      databaseName: "web-memory",
    };
  }

  const db = await getSQLiteDatabaseAsync();
  const result = await db.getFirstAsync(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'app_meta';"
  );

  return {
    ready: Boolean(result?.name),
    databaseName: "mis-soles.db",
  };
}
