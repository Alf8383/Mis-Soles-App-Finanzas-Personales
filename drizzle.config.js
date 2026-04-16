module.exports = {
  schema: "./src/lib/db/schema/index.js",
  out: "./src/lib/db/migrations",
  dialect: "sqlite",
  dbCredentials: {
    url: "./src/lib/db/mis-soles.db",
  },
};
