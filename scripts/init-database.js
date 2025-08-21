const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function initDatabase() {
    const client = await pool.connect();
    
    try {
        // Create tables
        await client.query(`
            CREATE TABLE IF NOT EXISTS events (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                agenda TEXT,
                event_date DATE NOT NULL,
                event_time TIME NOT NULL,
                location VARCHAR(255),
                max_attendees INTEGER DEFAULT 100,
                current_attendees INTEGER DEFAULT 0,
                event_kv VARCHAR(500),
                custom_fields JSONB DEFAULT '{}',
                access_code VARCHAR(255),
                is_exclusive BOOLEAN DEFAULT false,
                allow_documents BOOLEAN DEFAULT false,
                allowed_file_types TEXT[],
                max_file_size INTEGER DEFAULT 5,
                max_files INTEGER DEFAULT 5,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS attendees (
                id SERIAL PRIMARY KEY,
                event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
                first_name VARCHAR(255),
                last_name VARCHAR(255),
                email VARCHAR(255),
                phone VARCHAR(50),
                company VARCHAR(255),
                position VARCHAR(255),
                custom_data JSONB DEFAULT '{}',
                documents TEXT[],
                registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS vendors (
                id SERIAL PRIMARY KEY,
                event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                contact_person VARCHAR(255),
                contact_email VARCHAR(255),
                contact_phone VARCHAR(50),
                booth_number VARCHAR(50),
                services TEXT[],
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

        // Insert sample admin only
        await client.query(`
            INSERT INTO admins (username, password_hash, email)
            VALUES ($1, $2, $3)
            ON CONFLICT (username) DO NOTHING
        `, ['admin', 'admin123', 'admin@eventhub.com']);

        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    } finally {
        client.release();
    }
}

initDatabase().catch(console.error); 