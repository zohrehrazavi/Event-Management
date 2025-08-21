const { app } = require('../server');
const request = require('supertest');

describe('Flexible Database Schema Tests', () => {
  let testEventId;

  beforeAll(async () => {
    // Create a test event with custom fields
    const eventData = {
      title: 'Test Dynamic Event',
      description: 'Testing flexible schema',
      event_date: '2024-12-25',
      event_time: '14:00',
      location: 'Test Location',
      max_attendees: 50,
      custom_fields: JSON.stringify({
        'Full Name': 'text',
        'Email Address': 'email',
        'Company': 'text',
        'Phone Number': 'tel',
        'Resume': 'upload'
      })
    };

    try {
      const eventResponse = await request(app)
        .post('/api/admin/events')
        .send(eventData);

      testEventId = eventResponse.body.id;
    } catch (error) {
      // If event creation fails, use a default test ID
      testEventId = 1;
    }
  });

  describe('Dynamic Form Registration', () => {
    test('should register with custom fields only', async () => {
      const registrationData = {
        custom_data: JSON.stringify({
          'Full Name': 'John Doe',
          'Email Address': 'john@example.com',
          'Company': 'Test Corp',
          'Phone Number': '+1234567890'
        })
      };

      const response = await request(app)
        .post(`/api/events/${testEventId}/register`)
        .send(registrationData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body.event_id).toBe(testEventId);
      expect(response.body.custom_data).toHaveProperty('Full Name', 'John Doe');
      expect(response.body.custom_data).toHaveProperty('Email Address', 'john@example.com');
      expect(response.body.custom_data).toHaveProperty('Company', 'Test Corp');
      expect(response.body.custom_data).toHaveProperty('Phone Number', '+1234567890');
    });

    test('should handle registration with minimal data', async () => {
      const registrationData = {
        custom_data: JSON.stringify({
          'Name': 'Jane Smith'
        })
      };

      const response = await request(app)
        .post(`/api/events/${testEventId}/register`)
        .send(registrationData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body.custom_data).toHaveProperty('Name', 'Jane Smith');
    });

    test('should handle registration with no custom data', async () => {
      const registrationData = {
        custom_data: ''
      };

      const response = await request(app)
        .post(`/api/events/${testEventId}/register`)
        .send(registrationData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body.custom_data).toEqual({});
    });

    test('should extract standard fields from custom data', async () => {
      const registrationData = {
        custom_data: JSON.stringify({
          'Full Name': 'Alice Johnson',
          'Email': 'alice@example.com',
          'Phone': '+1987654321',
          'Company': 'Tech Inc',
          'Position': 'Developer'
        })
      };

      const response = await request(app)
        .post(`/api/events/${testEventId}/register`)
        .send(registrationData);

      expect(response.status).toBe(200);
      expect(response.body.first_name).toBe('Alice Johnson');
      expect(response.body.email).toBe('alice@example.com');
      expect(response.body.phone).toBe('+1987654321');
      expect(response.body.company).toBe('Tech Inc');
      expect(response.body.position).toBe('Developer');
    });

    test('should handle different field name variations', async () => {
      const registrationData = {
        custom_data: JSON.stringify({
          'Name': 'Bob Wilson',
          'Email Address': 'bob@example.com',
          'Phone Number': '+1122334455'
        })
      };

      const response = await request(app)
        .post(`/api/events/${testEventId}/register`)
        .send(registrationData);

      expect(response.status).toBe(200);
      expect(response.body.first_name).toBe('Bob Wilson');
      expect(response.body.email).toBe('bob@example.com');
      expect(response.body.phone).toBe('+1122334455');
    });
  });

  describe('Admin API Tests', () => {
    test('should get all attendees with flexible field display', async () => {
      const response = await request(app)
        .get('/api/admin/attendees');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      
      if (response.body.length > 0) {
        const attendee = response.body[0];
        expect(attendee).toHaveProperty('event_id');
        expect(attendee).toHaveProperty('custom_data');
        expect(attendee).toHaveProperty('registration_date');
      }
    });

    test('should get event attendees', async () => {
      const response = await request(app)
        .get(`/api/events/${testEventId}/attendees`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    test('should get event details with attendee count', async () => {
      const response = await request(app)
        .get(`/api/events/${testEventId}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', testEventId);
      expect(response.body).toHaveProperty('title', 'Test Dynamic Event');
      expect(response.body).toHaveProperty('custom_fields');
    });
  });

  describe('Field Name Flexibility', () => {
    test('should handle various name field formats', async () => {
      const testCases = [
        { field: 'Full Name', expected: 'John Doe' },
        { field: 'Name', expected: 'Jane Smith' },
        { field: 'First Name', expected: 'Alice Johnson' },
        { field: 'Complete Name', expected: 'Bob Wilson' }
      ];

      for (const testCase of testCases) {
        const registrationData = {
          custom_data: JSON.stringify({
            [testCase.field]: testCase.expected
          })
        };

        const response = await request(app)
          .post(`/api/events/${testEventId}/register`)
          .send(registrationData);

        expect(response.status).toBe(200);
        expect(response.body.custom_data).toHaveProperty(testCase.field, testCase.expected);
      }
    });

    test('should handle various email field formats', async () => {
      const testCases = [
        { field: 'Email', expected: 'test1@example.com' },
        { field: 'Email Address', expected: 'test2@example.com' },
        { field: 'E-mail', expected: 'test3@example.com' },
        { field: 'Contact Email', expected: 'test4@example.com' }
      ];

      for (const testCase of testCases) {
        const registrationData = {
          custom_data: JSON.stringify({
            [testCase.field]: testCase.expected
          })
        };

        const response = await request(app)
          .post(`/api/events/${testEventId}/register`)
          .send(registrationData);

        expect(response.status).toBe(200);
        expect(response.body.custom_data).toHaveProperty(testCase.field, testCase.expected);
      }
    });
  });

  describe('Upload Field Integration', () => {
    test('should handle registration with upload fields', async () => {
      const registrationData = {
        custom_data: JSON.stringify({
          'Full Name': 'Upload Test User',
          'Email': 'upload@example.com',
          'Resume': ['resume.pdf']
        })
      };

      const response = await request(app)
        .post(`/api/events/${testEventId}/register`)
        .send(registrationData);

      expect(response.status).toBe(200);
      expect(response.body.custom_data).toHaveProperty('Resume');
      expect(Array.isArray(response.body.custom_data.Resume)).toBe(true);
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid JSON in custom_data', async () => {
      const registrationData = {
        custom_data: 'invalid json string'
      };

      const response = await request(app)
        .post(`/api/events/${testEventId}/register`)
        .send(registrationData);

      expect(response.status).toBe(200);
      expect(response.body.custom_data).toEqual({});
    });

    test('should handle non-existent event', async () => {
      const registrationData = {
        custom_data: JSON.stringify({
          'Name': 'Test User'
        })
      };

      const response = await request(app)
        .post('/api/events/99999/register')
        .send(registrationData);

      expect(response.status).toBe(404);
    });
  });
}); 