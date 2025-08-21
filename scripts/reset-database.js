const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function resetDatabase() {
    const client = await pool.connect();
    
    try {
        // Drop existing tables in correct order (due to foreign key constraints)
        await client.query('DROP TABLE IF EXISTS attendees CASCADE');
        await client.query('DROP TABLE IF EXISTS vendors CASCADE');
        await client.query('DROP TABLE IF EXISTS events CASCADE');
        await client.query('DROP TABLE IF EXISTS admins CASCADE');
        
        console.log('Existing tables dropped successfully');
        
        // Create tables with new schema
                       await client.query(`
                   CREATE TABLE IF NOT EXISTS events (
                       id SERIAL PRIMARY KEY,
                       title VARCHAR(255) NOT NULL,
                       description TEXT,
                       event_date DATE NOT NULL,
                       event_time TIME NOT NULL,
                       location VARCHAR(255),
                       max_attendees INTEGER DEFAULT 100,
                       event_kv JSONB DEFAULT '{}',
                       access_code VARCHAR(255),
                       is_exclusive BOOLEAN DEFAULT false,
                       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                   )
               `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS attendees (
                id SERIAL PRIMARY KEY,
                event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                phone VARCHAR(50),
                company VARCHAR(255),
                position VARCHAR(255),
                documents TEXT[],
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS vendors (
                id SERIAL PRIMARY KEY,
                event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                contact_email VARCHAR(255),
                contact_phone VARCHAR(50),
                website VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS admins (
                id SERIAL PRIMARY KEY,
                username VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                email VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log('Tables created successfully');
    } catch (error) {
        console.error('Error resetting database:', error);
        throw error;
    } finally {
        client.release();
    }
}

resetDatabase().catch(console.error); 