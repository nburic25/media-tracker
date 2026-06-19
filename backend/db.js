// uzme se Pool iz pg
const { Pool } = require("pg");

// napravi se konekcija
const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "media_tracker",
    password: "nikola05",
    port: 5432,
});

// omoguci se drugima da koriste
module.exports = pool;