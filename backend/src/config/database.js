const { Client } = require('pg');
const config = require('./config');

// Database connection configuration
const client = new Client({
    user: config.DB_USER,
    host: 'localhost',
    database: config.DB_NAME,
    password: config.DB_PASSWORD,
    port: 5432,
});

// check conn
const checkConn = async () => {
    try {
        await client.connect();
        console.log('conn database success');
    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }
}
checkConn();

module.exports = client;
