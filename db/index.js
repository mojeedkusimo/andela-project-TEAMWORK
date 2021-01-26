const { Client } = require("pg");

const client = new Client({
    connectionString: "postgresql:mojeedkusimo:root@localhost/andela-teamwork"
});

client.connect();

module.exports = client;