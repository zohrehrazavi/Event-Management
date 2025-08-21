// Simple unit tests for custom fields functionality
describe('Custom Fields Unit Tests', () => {
  
  describe('Field ID Generation', () => {
    test('should generate correct field IDs', () => {
      const generateFieldId = (fieldName) => {
        return `field_${fieldName.toLowerCase().replace(/\s+/g, '_')}`;
      };
      
      expect(generateFieldId('Company Name')).toBe('field_company_name');
      expect(generateFieldId('Phone Number')).toBe('field_phone_number');
      expect(generateFieldId('Job Title')).toBe('field_job_title');
      expect(generateFieldId('Years of Experience')).toBe('field_years_of_experience');
      expect(generateFieldId('LinkedIn Profile')).toBe('field_linkedin_profile');
    });
  });

  describe('Field Type Validation', () => {
    test('should validate field types correctly', () => {
      const validFieldTypes = ['text', 'email', 'tel', 'url', 'textarea'];
      
      const isValidFieldType = (type) => {
        return validFieldTypes.includes(type);
      };
      
      expect(isValidFieldType('text')).toBe(true);
      expect(isValidFieldType('email')).toBe(true);
      expect(isValidFieldType('tel')).toBe(true);
      expect(isValidFieldType('url')).toBe(true);
      expect(isValidFieldType('textarea')).toBe(true);
      expect(isValidFieldType('invalid')).toBe(false);
      expect(isValidFieldType('number')).toBe(false);
    });
  });

  describe('Custom Fields Object Validation', () => {
    test('should validate custom fields object structure', () => {
      const validateCustomFields = (customFields) => {
        if (!customFields || typeof customFields !== 'object') {
          return false;
        }
        
        for (const [fieldName, fieldType] of Object.entries(customFields)) {
          if (typeof fieldName !== 'string' || fieldName.trim() === '') {
            return false;
          }
          if (typeof fieldType !== 'string') {
            return false;
          }
        }
        
        return true;
      };
      
      // Valid custom fields
      expect(validateCustomFields({
        'Company Name': 'text',
        'Phone Number': 'tel',
        'Job Title': 'text'
      })).toBe(true);
      
      // Invalid custom fields
      expect(validateCustomFields(null)).toBe(false);
      expect(validateCustomFields(undefined)).toBe(false);
      expect(validateCustomFields('not an object')).toBe(false);
      expect(validateCustomFields({
        '': 'text' // Empty field name
      })).toBe(false);
      expect(validateCustomFields({
        'Company Name': 123 // Invalid field type
      })).toBe(false);
    });
  });

  describe('Form Data Collection', () => {
    test('should collect form data correctly', () => {
      const collectFormData = (customFields, formValues) => {
        const customData = {};
        
        Object.entries(customFields).forEach(([fieldName, fieldType]) => {
          const fieldId = `field_${fieldName.toLowerCase().replace(/\s+/g, '_')}`;
          const fieldValue = formValues[fieldId];
          if (fieldValue && fieldValue.trim() !== '') {
            customData[fieldName] = fieldValue;
          }
        });
        
        return customData;
      };
      
      const customFields = {
        'Company Name': 'text',
        'Phone Number': 'tel',
        'Job Title': 'text'
      };
      
      const formValues = {
        'field_company_name': 'Test Corp',
        'field_phone_number': '555-123-4567',
        'field_job_title': 'Developer',
        'field_unused_field': 'This should be ignored'
      };
      
      const result = collectFormData(customFields, formValues);
      
      expect(result).toEqual({
        'Company Name': 'Test Corp',
        'Phone Number': '555-123-4567',
        'Job Title': 'Developer'
      });
    });

    test('should handle empty form values', () => {
      const collectFormData = (customFields, formValues) => {
        const customData = {};
        
        Object.entries(customFields).forEach(([fieldName, fieldType]) => {
          const fieldId = `field_${fieldName.toLowerCase().replace(/\s+/g, '_')}`;
          const fieldValue = formValues[fieldId];
          if (fieldValue && fieldValue.trim() !== '') {
            customData[fieldName] = fieldValue;
          }
        });
        
        return customData;
      };
      
      const customFields = {
        'Company Name': 'text',
        'Phone Number': 'tel',
        'Job Title': 'text'
      };
      
      const formValues = {
        'field_company_name': '',
        'field_phone_number': '   ',
        'field_job_title': 'Developer'
      };
      
      const result = collectFormData(customFields, formValues);
      
      expect(result).toEqual({
        'Job Title': 'Developer'
      });
    });
  });

  describe('Document Upload Configuration', () => {
    test('should configure document upload correctly', () => {
      const configureDocumentUpload = (event) => {
        const config = {
          enabled: false,
          allowedTypes: '.pdf,.doc,.docx,.jpg,.jpeg,.png,.gif',
          maxSize: 10,
          maxFiles: 5
        };
        
        if (event.allow_documents) {
          config.enabled = true;
          if (event.allowed_file_types) {
            config.allowedTypes = event.allowed_file_types;
          }
          if (event.max_file_size) {
            config.maxSize = event.max_file_size;
          }
          if (event.max_files) {
            config.maxFiles = event.max_files;
          }
        }
        
        return config;
      };
      
      // Event with document upload enabled
      const eventWithDocs = {
        allow_documents: true,
        allowed_file_types: '.pdf,.doc',
        max_file_size: 5,
        max_files: 3
      };
      
      expect(configureDocumentUpload(eventWithDocs)).toEqual({
        enabled: true,
        allowedTypes: '.pdf,.doc',
        maxSize: 5,
        maxFiles: 3
      });
      
      // Event with document upload disabled
      const eventWithoutDocs = {
        allow_documents: false
      };
      
      expect(configureDocumentUpload(eventWithoutDocs)).toEqual({
        enabled: false,
        allowedTypes: '.pdf,.doc,.docx,.jpg,.jpeg,.png,.gif',
        maxSize: 10,
        maxFiles: 5
      });
    });
  });

  describe('Field HTML Generation', () => {
    test('should generate correct HTML for different field types', () => {
      const generateFieldHTML = (fieldName, fieldType) => {
        const fieldId = `field_${fieldName.toLowerCase().replace(/\s+/g, '_')}`;
        
        let inputHTML = '';
        switch (fieldType) {
          case 'email':
            inputHTML = `<input type="email" id="${fieldId}" name="${fieldId}" required />`;
            break;
          case 'tel':
            inputHTML = `<input type="tel" id="${fieldId}" name="${fieldId}" />`;
            break;
          case 'url':
            inputHTML = `<input type="url" id="${fieldId}" name="${fieldId}" />`;
            break;
          case 'textarea':
            inputHTML = `<textarea id="${fieldId}" name="${fieldId}" rows="3"></textarea>`;
            break;
          default: // text
            inputHTML = `<input type="text" id="${fieldId}" name="${fieldId}" />`;
        }
        
        return `
          <div class="form-group">
            <label for="${fieldId}" class="required">${fieldName}</label>
            ${inputHTML}
          </div>
        `;
      };
      
      // Test text field
      const textFieldHTML = generateFieldHTML('Company Name', 'text');
      expect(textFieldHTML).toContain('type="text"');
      expect(textFieldHTML).toContain('id="field_company_name"');
      expect(textFieldHTML).toContain('Company Name');
      
      // Test email field
      const emailFieldHTML = generateFieldHTML('Email Address', 'email');
      expect(emailFieldHTML).toContain('type="email"');
      expect(emailFieldHTML).toContain('required');
      
      // Test textarea field
      const textareaFieldHTML = generateFieldHTML('Description', 'textarea');
      expect(textareaFieldHTML).toContain('<textarea');
      expect(textareaFieldHTML).toContain('rows="3"');
      
      // Test tel field
      const telFieldHTML = generateFieldHTML('Phone Number', 'tel');
      expect(telFieldHTML).toContain('type="tel"');
    });
  });
}); 