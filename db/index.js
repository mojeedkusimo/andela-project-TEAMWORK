const { Client } = require("pg");

const client = new Client({
    // connectionString: "postgresql:mojeedkusimo:root@localhost/andela-teamwork" //linux connection
    connectionString: "postgresql:mojeedkusimo:root@localhost/andela_teamwork" //windows connection
});

client.connect();

module.exports = client;