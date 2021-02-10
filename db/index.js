const { Client } = require("pg");
require("dotenv").config();
const DB_CON = process.env.DB_CON;

const client = new Client({
    connectionString: DB_CON
});

client.connect();

module.exports = client;