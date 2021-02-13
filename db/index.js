const { Client } = require("pg");
require("dotenv").config();
const LOCAL_DB_CON = process.env.LOCAL_DB_CON;

const client = new Client({
    connectionString: LOCAL_DB_CON || DATABASE_URL
});

client.connect();

module.exports = client;