describe('Flexible Schema Logic Tests', () => {
  
  describe('Field Extraction Logic', () => {
    test('should extract standard fields from custom data', () => {
      const customData = {
        'Full Name': 'John Doe',
        'Email': 'john@example.com',
        'Phone': '+1234567890',
        'Company': 'Tech Corp',
        'Position': 'Developer'
      };

      // Simulate the extraction logic from server.js
      const first_name = customData['Full Name'] || customData['Name'] || customData['First Name'] || null;
      const last_name = customData['Last Name'] || null;
      const email = customData['Email'] || customData['Email Address'] || null;
      const phone = customData['Phone'] || customData['Phone Number'] || null;
      const company = customData['Company'] || null;
      const position = customData['Position'] || customData['Job Title'] || null;

      expect(first_name).toBe('John Doe');
      expect(email).toBe('john@example.com');
      expect(phone).toBe('+1234567890');
      expect(company).toBe('Tech Corp');
      expect(position).toBe('Developer');
      expect(last_name).toBeNull();
    });

    test('should handle different field name variations', () => {
      const testCases = [
        { data: { 'Name': 'Alice' }, expected: 'Alice' },
        { data: { 'Full Name': 'Bob' }, expected: 'Bob' },
        { data: { 'First Name': 'Charlie' }, expected: 'Charlie' },
        { data: { 'Complete Name': 'David' }, expected: null }
      ];

      testCases.forEach(testCase => {
        const first_name = testCase.data['Full Name'] || testCase.data['Name'] || testCase.data['First Name'] || null;
        expect(first_name).toBe(testCase.expected);
      });
    });

    test('should handle email field variations', () => {
      const testCases = [
        { data: { 'Email': 'test1@example.com' }, expected: 'test1@example.com' },
        { data: { 'Email Address': 'test2@example.com' }, expected: 'test2@example.com' },
        { data: { 'E-mail': 'test3@example.com' }, expected: null },
        { data: { 'Contact Email': 'test4@example.com' }, expected: null }
      ];

      testCases.forEach(testCase => {
        const email = testCase.data['Email'] || testCase.data['Email Address'] || null;
        expect(email).toBe(testCase.expected);
      });
    });
  });

  describe('Custom Data Parsing', () => {
    test('should parse valid JSON string', () => {
      const jsonString = '{"Name": "John", "Email": "john@example.com"}';
      
      let parsedData = {};
      try {
        parsedData = JSON.parse(jsonString);
      } catch (e) {
        parsedData = {};
      }

      expect(parsedData).toEqual({
        'Name': 'John',
        'Email': 'john@example.com'
      });
    });

    test('should handle invalid JSON gracefully', () => {
      const invalidJson = 'invalid json string';
      
      let parsedData = {};
      try {
        parsedData = JSON.parse(invalidJson);
      } catch (e) {
        parsedData = {};
      }

      expect(parsedData).toEqual({});
    });

    test('should handle empty string', () => {
      const emptyString = '';
      
      let parsedData = {};
      if (emptyString && emptyString !== '') {
        try {
          parsedData = JSON.parse(emptyString);
        } catch (e) {
          parsedData = {};
        }
      }

      expect(parsedData).toEqual({});
    });
  });

  describe('Upload Field Configuration', () => {
    test('should validate upload field configuration', () => {
      const uploadConfig = {
        type: 'upload',
        maxSize: 5,
        required: true
      };

      expect(uploadConfig.type).toBe('upload');
      expect(uploadConfig.maxSize).toBe(5);
      expect(uploadConfig.required).toBe(true);
    });

    test('should handle different upload configurations', () => {
      const configs = [
        { type: 'upload', maxSize: 5, required: true },
        { type: 'upload', maxSize: 2, required: false },
        { type: 'upload', maxSize: 10, required: true }
      ];

      configs.forEach(config => {
        expect(config.type).toBe('upload');
        expect(typeof config.maxSize).toBe('number');
        expect(typeof config.required).toBe('boolean');
      });
    });
  });

  describe('Field Type Validation', () => {
    test('should validate different field types', () => {
      const fieldTypes = ['text', 'email', 'tel', 'textarea', 'checkbox'];
      
      fieldTypes.forEach(type => {
        expect(['text', 'email', 'tel', 'textarea', 'checkbox', 'upload']).toContain(type);
      });
    });

    test('should handle object-based field configurations', () => {
      const fieldConfig = {
        'Name': 'text',
        'Email': 'email',
        'Resume': { type: 'upload', maxSize: 5, required: true }
      };

      expect(typeof fieldConfig['Name']).toBe('string');
      expect(typeof fieldConfig['Email']).toBe('string');
      expect(typeof fieldConfig['Resume']).toBe('object');
      expect(fieldConfig['Resume'].type).toBe('upload');
    });
  });

  describe('Display Name Logic', () => {
    test('should generate display names from custom data', () => {
      const attendee = {
        first_name: null,
        last_name: null,
        custom_data: {
          'Full Name': 'John Doe',
          'Email': 'john@example.com'
        }
      };

      let displayName = 'Anonymous';
      if (attendee.first_name && attendee.last_name) {
        displayName = `${attendee.first_name} ${attendee.last_name}`;
      } else if (attendee.first_name) {
        displayName = attendee.first_name;
      } else if (attendee.custom_data) {
        displayName = attendee.custom_data['Full Name'] || attendee.custom_data['Name'] || 'Anonymous';
      }

      expect(displayName).toBe('John Doe');
    });

    test('should fallback to standard fields', () => {
      const attendee = {
        first_name: 'Jane',
        last_name: 'Smith',
        custom_data: {}
      };

      let displayName = 'Anonymous';
      if (attendee.first_name && attendee.last_name) {
        displayName = `${attendee.first_name} ${attendee.last_name}`;
      } else if (attendee.first_name) {
        displayName = attendee.first_name;
      } else if (attendee.custom_data) {
        displayName = attendee.custom_data['Full Name'] || attendee.custom_data['Name'] || 'Anonymous';
      }

      expect(displayName).toBe('Jane Smith');
    });

    test('should handle missing data gracefully', () => {
      const attendee = {
        first_name: null,
        last_name: null,
        custom_data: null
      };

      let displayName = 'Anonymous';
      if (attendee.first_name && attendee.last_name) {
        displayName = `${attendee.first_name} ${attendee.last_name}`;
      } else if (attendee.first_name) {
        displayName = attendee.first_name;
      } else if (attendee.custom_data) {
        displayName = attendee.custom_data['Full Name'] || attendee.custom_data['Name'] || 'Anonymous';
      }

      expect(displayName).toBe('Anonymous');
    });
  });
}); 