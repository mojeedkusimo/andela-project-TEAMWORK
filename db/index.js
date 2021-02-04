const { Client } = require("pg");

const client = new Client({
    connectionString: "postgresql:mojeedkusimo:root@localhost/andela_teamwork"
});

client.connect();

module.exports = client;