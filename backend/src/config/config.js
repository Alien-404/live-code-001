require('dotenv').config();

const config = {
    PORT: parseInt(process.env.PORT) || 3000,
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_NAME: process.env.DB_NAME
}

for (const [key, value] of Object.entries(config)) {
    if (value === null || value === undefined) {
        console.error(`configuration error ${key} is missing`);
        process.exit(1);
    }
}

module.exports = config;