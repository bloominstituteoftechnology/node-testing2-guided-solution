module.exports = {
  development: {
    client: 'sqlite3',
    useNullAsDefault: true,
    migrations: { directory: './data/migrations' },
    seeds: { directory: './data/seeds' },
    connection: {
      filename: './data/hobbits.db3',
    },
  },
  testing: {
    client: 'sqlite3',
    useNullAsDefault: true,
    migrations: { directory: './data/migrations' },
    seeds: { directory: './data/seeds' },
    connection: {
      filename: './data/test.db3',
    },
  },
  production: {
    client: "pg",
    connection: process.env.DATABASE_URL || "postgresql://postgres@localhost/hobbits",
    pool: {
      min: 2,
      max: 10,
    },
    migrations: { directory: "./data/migrations" },
    seeds: { directory: "./data/seeds" },
  },
};
