const request = require('supertest');
const { Pool } = require('pg');
const path = require('path');

// Import the server app
let app;
let pool;

// Test data
const testEvent = {
  title: 'Test Event with Custom Fields',
  description: 'A test event to verify custom fields functionality',
  event_date: '2024-12-25',
  event_time: '10:00:00',
  location: 'Test Location',
  max_attendees: 100,
  custom_fields: {
    'Company Name': 'text',
    'Phone Number': 'tel',
    'Job Title': 'text',
    'Years of Experience': 'text',
    'Dietary Requirements': 'textarea',
    'LinkedIn Profile': 'url'
  },
  allow_documents: true,
  allowed_file_types: '.pdf,.doc,.docx',
  max_file_size: 5,
  max_files: 3
};

const simpleEvent = {
  title: 'Simple Test Event',
  description: 'A test event without custom fields',
  event_date: '2024-12-26',
  event_time: '14:00:00',
  location: 'Simple Location',
  max_attendees: 50,
  custom_fields: {},
  allow_documents: false
};

describe('Custom Fields Functionality', () => {
  beforeAll(async () => {
    // Import the server app
    const serverPath = path.join(__dirname, '..', 'server.js');
    const serverModule = require(serverPath);
    app = serverModule.app || serverModule;
    
    // Setup test database connection
    pool = new Pool({
      connectionString: process.env.DATABASE_URL
    });
    
    // Clean up test data
    await pool.query('DELETE FROM attendees WHERE event_id IN (SELECT id FROM events WHERE title LIKE \'%Test%\')');
    await pool.query('DELETE FROM events WHERE title LIKE \'%Test%\'');
  });

  afterAll(async () => {
    // Clean up test data
    await pool.query('DELETE FROM attendees WHERE event_id IN (SELECT id FROM events WHERE title LIKE \'%Test%\')');
    await pool.query('DELETE FROM events WHERE title LIKE \'%Test%\'');
    await pool.end();
  });

  describe('Event Creation with Custom Fields', () => {
    test('should create an event with custom fields', async () => {
      const response = await request(app)
        .post('/api/admin/events')
        .field('title', testEvent.title)
        .field('description', testEvent.description)
        .field('event_date', testEvent.event_date)
        .field('event_time', testEvent.event_time)
        .field('location', testEvent.location)
        .field('max_attendees', testEvent.max_attendees)
        .field('custom_fields', JSON.stringify(testEvent.custom_fields))
        .field('allow_documents', testEvent.allow_documents)
        .field('allowed_file_types', testEvent.allowed_file_types)
        .field('max_file_size', testEvent.max_file_size)
        .field('max_files', testEvent.max_files);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe(testEvent.title);
      expect(response.body.custom_fields).toEqual(testEvent.custom_fields);
      expect(response.body.allow_documents).toBe(testEvent.allow_documents);
    });

    test('should create an event without custom fields', async () => {
      const response = await request(app)
        .post('/api/admin/events')
        .field('title', simpleEvent.title)
        .field('description', simpleEvent.description)
        .field('event_date', simpleEvent.event_date)
        .field('event_time', simpleEvent.event_time)
        .field('location', simpleEvent.location)
        .field('max_attendees', simpleEvent.max_attendees)
        .field('custom_fields', JSON.stringify(simpleEvent.custom_fields))
        .field('allow_documents', simpleEvent.allow_documents);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe(simpleEvent.title);
      expect(response.body.custom_fields).toEqual({});
      expect(response.body.allow_documents).toBe(simpleEvent.allow_documents);
    });
  });

  describe('Event Retrieval with Custom Fields', () => {
    let eventWithCustomFields;
    let eventWithoutCustomFields;

    beforeAll(async () => {
      // Create test events
      const response1 = await request(app)
        .post('/api/admin/events')
        .field('title', testEvent.title)
        .field('description', testEvent.description)
        .field('event_date', testEvent.event_date)
        .field('event_time', testEvent.event_time)
        .field('location', testEvent.location)
        .field('max_attendees', testEvent.max_attendees)
        .field('custom_fields', JSON.stringify(testEvent.custom_fields))
        .field('allow_documents', testEvent.allow_documents)
        .field('allowed_file_types', testEvent.allowed_file_types)
        .field('max_file_size', testEvent.max_file_size)
        .field('max_files', testEvent.max_files);

      const response2 = await request(app)
        .post('/api/admin/events')
        .field('title', simpleEvent.title)
        .field('description', simpleEvent.description)
        .field('event_date', simpleEvent.event_date)
        .field('event_time', simpleEvent.event_time)
        .field('location', simpleEvent.location)
        .field('max_attendees', simpleEvent.max_attendees)
        .field('custom_fields', JSON.stringify(simpleEvent.custom_fields))
        .field('allow_documents', simpleEvent.allow_documents);

      eventWithCustomFields = response1.body;
      eventWithoutCustomFields = response2.body;
    });

    test('should retrieve event with custom fields correctly', async () => {
      const response = await request(app)
        .get(`/api/events/${eventWithCustomFields.id}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(eventWithCustomFields.id);
      expect(response.body.title).toBe(testEvent.title);
      expect(response.body.custom_fields).toEqual(testEvent.custom_fields);
      expect(Object.keys(response.body.custom_fields)).toHaveLength(6);
      expect(response.body.custom_fields).toHaveProperty('Company Name');
      expect(response.body.custom_fields).toHaveProperty('Phone Number');
      expect(response.body.custom_fields).toHaveProperty('Job Title');
      expect(response.body.custom_fields).toHaveProperty('Years of Experience');
      expect(response.body.custom_fields).toHaveProperty('Dietary Requirements');
      expect(response.body.custom_fields).toHaveProperty('LinkedIn Profile');
    });

    test('should retrieve event without custom fields correctly', async () => {
      const response = await request(app)
        .get(`/api/events/${eventWithoutCustomFields.id}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(eventWithoutCustomFields.id);
      expect(response.body.title).toBe(simpleEvent.title);
      expect(response.body.custom_fields).toEqual({});
      expect(Object.keys(response.body.custom_fields)).toHaveLength(0);
    });

    test('should return 404 for non-existent event', async () => {
      const response = await request(app)
        .get('/api/events/99999');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Event Registration with Custom Fields', () => {
    let eventId;

    beforeAll(async () => {
      // Create a test event
      const response = await request(app)
        .post('/api/admin/events')
        .field('title', 'Registration Test Event')
        .field('description', 'Test event for registration')
        .field('event_date', '2024-12-27')
        .field('event_time', '15:00:00')
        .field('location', 'Test Location')
        .field('max_attendees', 10)
        .field('custom_fields', JSON.stringify({
          'Company Name': 'text',
          'Phone Number': 'tel',
          'Job Title': 'text'
        }))
        .field('allow_documents', true)
        .field('allowed_file_types', '.pdf,.doc')
        .field('max_file_size', 2)
        .field('max_files', 1);

      eventId = response.body.id;
    });

    test('should register user with custom fields data', async () => {
      const registrationData = {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@test.com',
        phone: '123-456-7890',
        company: 'Test Company',
        position: 'Developer',
        custom_data: JSON.stringify({
          'Company Name': 'Test Corp',
          'Phone Number': '555-123-4567',
          'Job Title': 'Senior Developer'
        })
      };

      const response = await request(app)
        .post(`/api/events/${eventId}/register`)
        .field('first_name', registrationData.first_name)
        .field('last_name', registrationData.last_name)
        .field('email', registrationData.email)
        .field('custom_data', registrationData.custom_data);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body.email).toBe(registrationData.email);
      expect(response.body.custom_data).toEqual({
        'Company Name': 'Test Corp',
        'Phone Number': '555-123-4567',
        'Job Title': 'Senior Developer'
      });
    });

    test('should prevent duplicate registration', async () => {
      const registrationData = {
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'jane.smith@test.com',
        custom_data: JSON.stringify({
          'Company Name': 'Another Corp',
          'Phone Number': '555-987-6543',
          'Job Title': 'Manager'
        })
      };

      // First registration
      await request(app)
        .post(`/api/events/${eventId}/register`)
        .field('first_name', registrationData.first_name)
        .field('last_name', registrationData.last_name)
        .field('email', registrationData.email)
        .field('custom_data', registrationData.custom_data);

      // Duplicate registration attempt
      const response = await request(app)
        .post(`/api/events/${eventId}/register`)
        .field('first_name', registrationData.first_name)
        .field('last_name', registrationData.last_name)
        .field('email', registrationData.email)
        .field('custom_data', registrationData.custom_data);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Already registered');
    });

    test('should handle registration without custom fields', async () => {
      // Create a simple event without custom fields
      const simpleEventResponse = await request(app)
        .post('/api/admin/events')
        .field('title', 'Simple Registration Test')
        .field('description', 'Simple test event')
        .field('event_date', '2024-12-28')
        .field('event_time', '16:00:00')
        .field('location', 'Simple Location')
        .field('max_attendees', 5)
        .field('custom_fields', JSON.stringify({}))
        .field('allow_documents', false);

      const simpleEventId = simpleEventResponse.body.id;

      const response = await request(app)
        .post(`/api/events/${simpleEventId}/register`)
        .field('first_name', 'Bob')
        .field('last_name', 'Wilson')
        .field('email', 'bob.wilson@test.com');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body.email).toBe('bob.wilson@test.com');
      expect(response.body.custom_data).toEqual({});
    });
  });

  describe('Event Update with Custom Fields', () => {
    let eventId;

    beforeAll(async () => {
      // Create a test event
      const response = await request(app)
        .post('/api/admin/events')
        .field('title', 'Update Test Event')
        .field('description', 'Test event for updates')
        .field('event_date', '2024-12-29')
        .field('event_time', '17:00:00')
        .field('location', 'Update Location')
        .field('max_attendees', 20)
        .field('custom_fields', JSON.stringify({
          'Name': 'text',
          'Email': 'email'
        }))
        .field('allow_documents', false);

      eventId = response.body.id;
    });

    test('should update event with new custom fields', async () => {
      const updatedCustomFields = {
        'Full Name': 'text',
        'Email Address': 'email',
        'Phone Number': 'tel',
        'Company': 'text',
        'Position': 'text'
      };

      const response = await request(app)
        .put(`/api/admin/events/${eventId}`)
        .field('title', 'Updated Test Event')
        .field('description', 'Updated test event')
        .field('event_date', '2024-12-30')
        .field('event_time', '18:00:00')
        .field('location', 'Updated Location')
        .field('max_attendees', 25)
        .field('custom_fields', JSON.stringify(updatedCustomFields))
        .field('allow_documents', true)
        .field('allowed_file_types', '.pdf,.doc,.docx')
        .field('max_file_size', 3)
        .field('max_files', 2);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(eventId);
      expect(response.body.title).toBe('Updated Test Event');
      expect(response.body.custom_fields).toEqual(updatedCustomFields);
      expect(Object.keys(response.body.custom_fields)).toHaveLength(5);
      expect(response.body.allow_documents).toBe(true);
    });

    test('should update event to remove custom fields', async () => {
      const response = await request(app)
        .put(`/api/admin/events/${eventId}`)
        .field('title', 'No Custom Fields Event')
        .field('description', 'Event without custom fields')
        .field('event_date', '2024-12-31')
        .field('event_time', '19:00:00')
        .field('location', 'No Fields Location')
        .field('max_attendees', 10)
        .field('custom_fields', JSON.stringify({}))
        .field('allow_documents', false);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(eventId);
      expect(response.body.title).toBe('No Custom Fields Event');
      expect(response.body.custom_fields).toEqual({});
      expect(Object.keys(response.body.custom_fields)).toHaveLength(0);
      expect(response.body.allow_documents).toBe(false);
    });
  });

  describe('Custom Fields Validation', () => {
    test('should handle invalid custom fields JSON', async () => {
      const response = await request(app)
        .post('/api/admin/events')
        .field('title', 'Invalid JSON Test')
        .field('description', 'Test with invalid JSON')
        .field('event_date', '2024-12-25')
        .field('event_time', '10:00:00')
        .field('location', 'Test Location')
        .field('max_attendees', 10)
        .field('custom_fields', 'invalid json string')
        .field('allow_documents', false);

      expect(response.status).toBe(200);
      expect(response.body.custom_fields).toEqual({});
    });

    test('should handle empty custom fields', async () => {
      const response = await request(app)
        .post('/api/admin/events')
        .field('title', 'Empty Fields Test')
        .field('description', 'Test with empty fields')
        .field('event_date', '2024-12-25')
        .field('event_time', '10:00:00')
        .field('location', 'Test Location')
        .field('max_attendees', 10)
        .field('custom_fields', '')
        .field('allow_documents', false);

      expect(response.status).toBe(200);
      expect(response.body.custom_fields).toEqual({});
    });
  });
}); 