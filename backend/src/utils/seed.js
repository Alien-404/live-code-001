const { Client } = require('pg');
const config = require('../config/conifg');

// Database connection configuration
const client = new Client({
    user: config.DB_USER,
    host: 'localhost',
    database: config.DB_NAME,
    password: config.DB_PASSWORD,
    port: 5432,
});

async function seedDatabase() {
    try {
        await client.connect();

        // seed data
        const data = [
            { level: 'FU', keterangan: 'Field Underwriter', urutan: 4 },
            { level: 'UM', keterangan: 'Unit Manajer', urutan: 3 },
            { level: 'SM', keterangan: 'Sales Manajer', urutan: 2 },
            { level: 'RM', keterangan: 'Regional Manajer', urutan: 1 },
        ];

        const insertQuery = `
        INSERT INTO dbbril_agen (level, keterangan, urutan)
        VALUES
        ($1, $2, $3)
        RETURNING id;
      `;

        await client.query('BEGIN');

        for (let i = 0; i < data.length; i++) {
            const { level, keterangan, urutan } = data[i];
            await client.query(insertQuery, [level, keterangan, urutan]);
        }

        await client.query('COMMIT');
        console.log('Data inserted successfully.');

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error inserting data:', error);
    } finally {
        // Close the database connection
        await client.end();
    }
}

seedDatabase();