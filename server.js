const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const session = require('express-session');
const multer = require('multer');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/event_management',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:8080',
  credentials: true
}));
app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// File upload configuration
const storage = multer.memoryStorage(); // Use memory storage for now

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit for images
  fileFilter: (req, file, cb) => {
    // Only allow image files for event KV
    if (file.fieldname === 'eventKVFile') {
      const allowedTypes = /jpeg|jpg|png|gif/;
      const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = /^image\/(jpeg|jpg|png|gif)$/.test(file.mimetype);
      
      if (mimetype && extname) {
        return cb(null, true);
      } else {
        cb(new Error('Only image files (JPG, PNG, GIF) are allowed!'));
      }
    } else {
      cb(null, true); // Allow other fields
    }
  }
});

// Database initialization
const initDatabase = async () => {
  try {
    const client = await pool.connect();
    
    // Create tables
            await client.query(`
            CREATE TABLE IF NOT EXISTS events (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                event_date DATE NOT NULL,
                event_time TIME NOT NULL,
                location VARCHAR(255),
                max_attendees INTEGER DEFAULT 100,
                current_attendees INTEGER DEFAULT 0,
                event_kv JSONB DEFAULT '{}',
                custom_fields JSONB DEFAULT '{}',
                access_code VARCHAR(255),
                is_exclusive BOOLEAN DEFAULT false,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

            await client.query(`
            CREATE TABLE IF NOT EXISTS attendees (
                id SERIAL PRIMARY KEY,
                event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
                first_name VARCHAR(255) NOT NULL,
                last_name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                phone VARCHAR(50),
                company VARCHAR(255),
                position VARCHAR(255),
                custom_data JSONB DEFAULT '{}',
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
        username VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    client.release();
    console.log('Database initialized successfully');
  } catch (err) {
    console.error('Database initialization error:', err);
  }
};

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/admin-login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin-login.html'));
});

app.get('/event-manager', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'event-manager.html'));
});

// Serve static files
app.use(express.static('public'));

// Serve individual event page
app.get('/event/:id(\\d+)', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'event.html'));
});

// Also serve event.html with ID for compatibility
app.get('/event.html/:id(\\d+)', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'event.html'));
});

// Serve event.html without ID (for testing)
app.get('/event.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'event.html'));
});

// Serve test page for custom fields
app.get('/test-custom-fields', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'test-custom-fields.html'));
});

// API Routes
app.get('/api/events', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM events ORDER BY event_date DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT e.*, COUNT(a.id) as attendee_count 
      FROM events e 
      LEFT JOIN attendees a ON e.id = a.event_id 
      WHERE e.id = $1 
      GROUP BY e.id
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    const event = result.rows[0];
    
    // Parse custom_fields if it's a string
    if (event.custom_fields && typeof event.custom_fields === 'string') {
      try {
        event.custom_fields = JSON.parse(event.custom_fields);
      } catch (e) {
        console.error('Error parsing custom_fields:', e);
        event.custom_fields = {};
      }
    }
    
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/events', async (req, res) => {
  try {
    const { title, description, event_date, event_time, location, max_attendees, event_kv, custom_fields } = req.body;
    const result = await pool.query(
      'INSERT INTO events (title, description, event_date, event_time, location, max_attendees, event_kv, custom_fields) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [title, description, event_date, event_time, location, max_attendees, event_kv, custom_fields]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/events/:id/register', upload.array('documents', 5), async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, email, phone, company, position, custom_data } = req.body;
    
    // Check if event exists and has capacity
    const eventResult = await pool.query(`
      SELECT e.*, COUNT(a.id) as attendee_count 
      FROM events e 
      LEFT JOIN attendees a ON e.id = a.event_id 
      WHERE e.id = $1 
      GROUP BY e.id
    `, [id]);
    
    if (eventResult.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    const event = eventResult.rows[0];
    if (event.max_attendees && event.attendee_count >= event.max_attendees) {
      return res.status(400).json({ error: 'Event is full' });
    }
    
    // Check if user already registered
    const existingRegistration = await pool.query(
      'SELECT * FROM attendees WHERE event_id = $1 AND email = $2',
      [id, email]
    );
    
    if (existingRegistration.rows.length > 0) {
      return res.status(400).json({ error: 'Already registered for this event' });
    }
    
    // Save documents
    const documents = req.files ? req.files.map(file => file.filename) : [];
    
    // Parse custom_data if it's a string
    let parsedCustomData = {};
    if (custom_data && custom_data !== '') {
      try {
        parsedCustomData = typeof custom_data === 'string' ? JSON.parse(custom_data) : custom_data;
      } catch (e) {
        console.error('Error parsing custom_data:', e);
        parsedCustomData = {};
      }
    }
    
    // Register attendee
    const attendeeResult = await pool.query(
      'INSERT INTO attendees (event_id, first_name, last_name, email, phone, company, position, custom_data, documents) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [id, first_name, last_name, email, phone, company, position, parsedCustomData, documents]
    );
    
    res.json(attendeeResult.rows[0]);
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Admin Authentication
app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Check if admin exists
    const result = await pool.query('SELECT * FROM admins WHERE username = $1', [username]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    
    const admin = result.rows[0];
    
    // Verify password (in production, use bcrypt)
    if (password !== admin.password_hash) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    
    // Set session
    req.session.adminId = admin.id;
    req.session.adminUsername = admin.username;
    
    res.json({ success: true, message: 'Login successful' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



app.get('/api/admin/events', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT e.*, COUNT(a.id) as attendee_count 
      FROM events e 
      LEFT JOIN attendees a ON e.id = a.event_id 
      GROUP BY e.id 
      ORDER BY e.event_date DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/attendees', async (req, res) => {
  try {
    const { event_id } = req.query;
    let query = `
      SELECT a.*, e.title as event_title 
      FROM attendees a 
      LEFT JOIN events e ON a.event_id = e.id
    `;
    let params = [];
    
    if (event_id) {
      query += ' WHERE a.event_id = $1';
      params.push(event_id);
    }
    
    query += ' ORDER BY a.created_at DESC';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/vendors', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT v.*, e.title as event_title 
      FROM vendors v 
      LEFT JOIN events e ON v.event_id = e.id 
      ORDER BY v.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/events', upload.single('eventKVFile'), async (req, res) => {
  // Handle Multer errors
  if (req.fileValidationError) {
    return res.status(400).json({ error: req.fileValidationError });
  }
  
  if (req.fileError) {
    return res.status(400).json({ error: req.fileError.message });
  }
  
  try {
    const { 
      title, 
      description, 
      agenda,
      event_date, 
      event_time, 
      location, 
      max_attendees, 
      event_kv, 
      custom_fields,
      is_exclusive,
      access_code,
      allow_documents,
      allowed_file_types,
      max_file_size,
      max_files
    } = req.body;
    
    let finalEventKV = null;
    
    // Handle file upload first (priority)
    if (req.file) {
      // Ensure uploads directory exists
      const uploadsDir = path.join(__dirname, 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      
      const fileName = `${Date.now()}-${req.file.originalname}`;
      const filePath = path.join(uploadsDir, fileName);
      
      // Save file
      fs.writeFileSync(filePath, req.file.buffer);
      finalEventKV = `/uploads/${fileName}`;
    } else if (event_kv) {
      // Use URL if no file was uploaded
      finalEventKV = event_kv;
    }
    
    // Parse custom_fields if it's a string
    let parsedCustomFields = {};
    if (custom_fields && custom_fields !== '') {
      try {
        parsedCustomFields = typeof custom_fields === 'string' ? JSON.parse(custom_fields) : custom_fields;
      } catch (e) {
        console.error('Error parsing custom_fields:', e);
        parsedCustomFields = {};
      }
    }
    
    // Convert boolean fields
    const isExclusive = is_exclusive === 'true' || is_exclusive === true;
    const allowDocuments = allow_documents === 'true' || allow_documents === true;
    
    const result = await pool.query(
      `INSERT INTO events (
        title, description, agenda, event_date, event_time, location, 
        max_attendees, event_kv, custom_fields, is_exclusive, access_code,
        allow_documents, allowed_file_types, max_file_size, max_files
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *`,
      [title, description, agenda, event_date, event_time, location, max_attendees, finalEventKV, parsedCustomFields, isExclusive, access_code, allowDocuments, allowed_file_types, max_file_size, max_files]
    );
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error creating event:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/vendors', async (req, res) => {
  try {
    const { 
      event_id, 
      name, 
      contact_person, 
      contact_email, 
      contact_phone, 
      booth_number, 
      description, 
      services 
    } = req.body;
    
    const result = await pool.query(
      `INSERT INTO vendors (
        event_id, name, contact_person, contact_email, 
        contact_phone, booth_number, description, services
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [event_id, name, contact_person, contact_email, contact_phone, booth_number, description, services]
    );
    
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'DELETE FROM events WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json({ message: 'Event deleted successfully' });
  } catch (err) {
    console.error('Error deleting event:', err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/events/:id', upload.single('eventKVFile'), async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      title, 
      description, 
      agenda,
      event_date, 
      event_time, 
      location, 
      max_attendees, 
      event_kv, 
      custom_fields,
      is_exclusive,
      access_code,
      allow_documents,
      allowed_file_types,
      max_file_size,
      max_files
    } = req.body;
    
    let finalEventKV = null;
    
    // Handle file upload first (priority)
    if (req.file) {
      // Ensure uploads directory exists
      const uploadsDir = path.join(__dirname, 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      
      const fileName = `${Date.now()}-${req.file.originalname}`;
      const filePath = path.join(uploadsDir, fileName);
      
      // Save file
      fs.writeFileSync(filePath, req.file.buffer);
      finalEventKV = `/uploads/${fileName}`;
    } else if (event_kv) {
      // Use URL if no file was uploaded
      finalEventKV = event_kv;
    }
    
    // Parse custom_fields if it's a string
    let parsedCustomFields = {};
    if (custom_fields && custom_fields !== '') {
      try {
        parsedCustomFields = typeof custom_fields === 'string' ? JSON.parse(custom_fields) : custom_fields;
      } catch (e) {
        console.error('Error parsing custom_fields:', e);
        parsedCustomFields = {};
      }
    }
    
    // Convert boolean fields
    const isExclusive = is_exclusive === 'true' || is_exclusive === true;
    const allowDocuments = allow_documents === 'true' || allow_documents === true;
    
    const result = await pool.query(
      `UPDATE events SET 
        title = $1, description = $2, agenda = $3, event_date = $4, event_time = $5, 
        location = $6, max_attendees = $7, event_kv = $8, custom_fields = $9, 
        is_exclusive = $10, access_code = $11, allow_documents = $12, 
        allowed_file_types = $13, max_file_size = $14, max_files = $15
       WHERE id = $16 RETURNING *`,
      [title, description, agenda, event_date, event_time, location, max_attendees, finalEventKV, parsedCustomFields, isExclusive, access_code, allowDocuments, allowed_file_types, max_file_size, max_files, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating event:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM events WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/events/:id/attendees', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM attendees WHERE event_id = $1 ORDER BY registration_date DESC',
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/events/:id/vendors', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM vendors WHERE event_id = $1 ORDER BY created_at DESC',
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Verify access code for exclusive events
app.post('/api/events/:id/verify-access', async (req, res) => {
  try {
    const { id } = req.params;
    const { accessCode } = req.body;
    
    // Check if event exists and is exclusive
    const eventResult = await pool.query('SELECT * FROM events WHERE id = $1', [id]);
    if (eventResult.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    const event = eventResult.rows[0];
    
    // If event is not exclusive, allow access
    if (!event.is_exclusive) {
      return res.json({ success: true, message: 'Access granted' });
    }
    
    // Check if access code is provided
    if (!accessCode) {
      return res.status(400).json({ error: 'Access code is required for this event' });
    }
    
    // Verify access code
    if (event.access_code && event.access_code === accessCode) {
      res.json({ success: true, message: 'Access granted' });
    } else {
      res.status(401).json({ error: 'Invalid access code' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/events/:id/vendors', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, contact_person, contact_email, contact_phone, booth_number, services } = req.body;
    const result = await pool.query(
      'INSERT INTO vendors (event_id, name, description, contact_person, contact_email, contact_phone, booth_number, services) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [id, name, description, contact_person, contact_email, contact_phone, booth_number, services]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all attendees
app.get('/api/attendees', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT a.*, e.title as event_title 
      FROM attendees a 
      JOIN events e ON a.event_id = e.id 
      ORDER BY a.registration_date DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all vendors
app.get('/api/vendors', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT v.*, e.title as event_title 
      FROM vendors v 
      JOIN events e ON v.event_id = e.id 
      ORDER BY v.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update event KV
app.patch('/api/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { event_kv } = req.body;
    const result = await pool.query(
      'UPDATE events SET event_kv = $1 WHERE id = $2 RETURNING *',
      [event_kv, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Export app for testing
module.exports = { app };

// Initialize database and start server
if (require.main === module) {
  initDatabase().then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  });
} 