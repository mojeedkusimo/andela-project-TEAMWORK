const { Client } = require("pg");
require("dotenv").config();
const LOCAL_DB_CON = process.env.LOCAL_DB_CON;
const DATABASE_URL = process.env.DATABASE_URL;

const client = new Client({
    connectionString: DATABASE_URL || LOCAL_DB_CON
});

client.connect();

module.exports = client;