const { JSDOM } = require('jsdom');

describe('Dynamic Form Generation Tests', () => {
  let dom;
  let document;
  let window;

  beforeEach(() => {
    dom = new JSDOM(`
      <!DOCTYPE html>
      <html>
        <head></head>
        <body>
          <div id="dynamicFieldsContainer"></div>
          <form id="registrationForm">
            <div id="dynamicFieldsContainer"></div>
            <button type="submit">Register</button>
          </form>
        </body>
      </html>
    `);
    document = dom.window.document;
    window = dom.window;
  });

  describe('Field Generation', () => {
    test('should generate text input fields', () => {
      const event = {
        custom_fields: {
          'Full Name': 'text',
          'Email': 'email',
          'Phone': 'tel'
        }
      };

      // Mock the populateAllFields function
      const populateAllFields = (eventData) => {
        const container = document.getElementById('dynamicFieldsContainer');
        container.innerHTML = '';

        Object.entries(eventData.custom_fields).forEach(([fieldName, fieldType]) => {
          const fieldDiv = document.createElement('div');
          fieldDiv.className = 'form-group';
          
          const label = document.createElement('label');
          label.textContent = fieldName;
          label.setAttribute('for', `field_${fieldName.toLowerCase().replace(/\s+/g, '_')}`);
          
          const input = document.createElement('input');
          input.type = fieldType;
          input.id = `field_${fieldName.toLowerCase().replace(/\s+/g, '_')}`;
          input.name = `field_${fieldName.toLowerCase().replace(/\s+/g, '_')}`;
          
          fieldDiv.appendChild(label);
          fieldDiv.appendChild(input);
          container.appendChild(fieldDiv);
        });
      };

      populateAllFields(event);

      const container = document.getElementById('dynamicFieldsContainer');
      expect(container.children.length).toBe(3);
      
      const firstField = container.children[0];
      expect(firstField.className).toBe('form-group');
      expect(firstField.querySelector('label').textContent).toBe('Full Name');
      expect(firstField.querySelector('input').type).toBe('text');
    });

    test('should generate textarea fields', () => {
      const event = {
        custom_fields: {
          'Description': 'textarea',
          'Comments': 'textarea'
        }
      };

      const populateAllFields = (eventData) => {
        const container = document.getElementById('dynamicFieldsContainer');
        container.innerHTML = '';

        Object.entries(eventData.custom_fields).forEach(([fieldName, fieldType]) => {
          const fieldDiv = document.createElement('div');
          fieldDiv.className = 'form-group';
          
          const label = document.createElement('label');
          label.textContent = fieldName;
          
          if (fieldType === 'textarea') {
            const textarea = document.createElement('textarea');
            textarea.id = `field_${fieldName.toLowerCase().replace(/\s+/g, '_')}`;
            textarea.name = `field_${fieldName.toLowerCase().replace(/\s+/g, '_')}`;
            textarea.rows = 3;
            
            fieldDiv.appendChild(label);
            fieldDiv.appendChild(textarea);
          }
          
          container.appendChild(fieldDiv);
        });
      };

      populateAllFields(event);

      const container = document.getElementById('dynamicFieldsContainer');
      expect(container.children.length).toBe(2);
      
      const textareas = container.querySelectorAll('textarea');
      expect(textareas.length).toBe(2);
      expect(textareas[0].rows).toBe(3);
    });

    test('should generate upload fields with configuration', () => {
      const event = {
        custom_fields: {
          'Resume': {
            type: 'upload',
            maxSize: 5,
            required: true
          },
          'Photo': {
            type: 'upload',
            maxSize: 2,
            required: false
          }
        }
      };

      const populateAllFields = (eventData) => {
        const container = document.getElementById('dynamicFieldsContainer');
        container.innerHTML = '';

        Object.entries(eventData.custom_fields).forEach(([fieldName, fieldConfig]) => {
          const fieldDiv = document.createElement('div');
          fieldDiv.className = 'form-group';
          
          const label = document.createElement('label');
          label.textContent = fieldName;
          
          if (fieldConfig.type === 'upload') {
            const uploadArea = document.createElement('div');
            uploadArea.className = 'custom-upload-area';
            uploadArea.id = `customUploadArea_field_${fieldName.toLowerCase().replace(/\s+/g, '_')}`;
            
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.id = `field_${fieldName.toLowerCase().replace(/\s+/g, '_')}`;
            fileInput.name = `custom_file_${fieldName}`;
            fileInput.setAttribute('data-max-size', fieldConfig.maxSize);
            if (fieldConfig.required) {
              fileInput.required = true;
            }
            
            const fileList = document.createElement('div');
            fileList.className = 'file-list';
            fileList.id = `fileList_field_${fieldName.toLowerCase().replace(/\s+/g, '_')}`;
            
            uploadArea.appendChild(fileInput);
            uploadArea.appendChild(fileList);
            fieldDiv.appendChild(label);
            fieldDiv.appendChild(uploadArea);
          }
          
          container.appendChild(fieldDiv);
        });
      };

      populateAllFields(event);

      const container = document.getElementById('dynamicFieldsContainer');
      expect(container.children.length).toBe(2);
      
      const uploadAreas = container.querySelectorAll('.custom-upload-area');
      expect(uploadAreas.length).toBe(2);
      
      const fileInputs = container.querySelectorAll('input[type="file"]');
      expect(fileInputs.length).toBe(2);
      expect(fileInputs[0].getAttribute('data-max-size')).toBe('5');
      expect(fileInputs[0].required).toBe(true);
      expect(fileInputs[1].getAttribute('data-max-size')).toBe('2');
      expect(fileInputs[1].required).toBe(false);
    });
  });

  describe('Form Data Collection', () => {
    test('should collect data from dynamic fields', () => {
      // Set up form with dynamic fields
      const container = document.getElementById('dynamicFieldsContainer');
      container.innerHTML = `
        <div class="form-group">
          <label>Full Name</label>
          <input type="text" id="field_full_name" name="field_full_name" value="John Doe">
        </div>
        <div class="form-group">
          <label>Email</label>
          <input type="email" id="field_email" name="field_email" value="john@example.com">
        </div>
        <div class="form-group">
          <label>Comments</label>
          <textarea id="field_comments" name="field_comments">Test comment</textarea>
        </div>
      `;

      const collectFormData = () => {
        const formData = new FormData();
        const customData = {};
        
        // Collect data from dynamic fields
        const inputs = container.querySelectorAll('input, textarea');
        inputs.forEach(input => {
          if (input.type === 'file') {
            // Handle file inputs
            if (input.files && input.files.length > 0) {
              customData[input.name.replace('custom_file_', '')] = Array.from(input.files);
            }
          } else {
            // Handle regular inputs
            const fieldName = input.name.replace('field_', '');
            const displayName = fieldName.split('_').map(word => 
              word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ');
            customData[displayName] = input.value;
          }
        });
        
        formData.append('custom_data', JSON.stringify(customData));
        return formData;
      };

      const formData = collectFormData();
      const customData = JSON.parse(formData.get('custom_data'));

      expect(customData).toHaveProperty('Full Name', 'John Doe');
      expect(customData).toHaveProperty('Email', 'john@example.com');
      expect(customData).toHaveProperty('Comments', 'Test comment');
    });

    test('should handle empty fields', () => {
      const container = document.getElementById('dynamicFieldsContainer');
      container.innerHTML = `
        <div class="form-group">
          <label>Name</label>
          <input type="text" id="field_name" name="field_name" value="">
        </div>
        <div class="form-group">
          <label>Email</label>
          <input type="email" id="field_email" name="field_email" value="">
        </div>
      `;

      const collectFormData = () => {
        const formData = new FormData();
        const customData = {};
        
        const inputs = container.querySelectorAll('input, textarea');
        inputs.forEach(input => {
          const fieldName = input.name.replace('field_', '');
          const displayName = fieldName.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ');
          customData[displayName] = input.value;
        });
        
        formData.append('custom_data', JSON.stringify(customData));
        return formData;
      };

      const formData = collectFormData();
      const customData = JSON.parse(formData.get('custom_data'));

      expect(customData).toHaveProperty('Name', '');
      expect(customData).toHaveProperty('Email', '');
    });
  });

  describe('Field Validation', () => {
    test('should validate required fields', () => {
      const event = {
        custom_fields: {
          'Full Name': { type: 'text', required: true },
          'Email': { type: 'email', required: true },
          'Phone': { type: 'tel', required: false }
        }
      };

      const validateForm = (eventData) => {
        const container = document.getElementById('dynamicFieldsContainer');
        const errors = [];
        
        Object.entries(eventData.custom_fields).forEach(([fieldName, fieldConfig]) => {
          const fieldId = `field_${fieldName.toLowerCase().replace(/\s+/g, '_')}`;
          const field = container.querySelector(`#${fieldId}`);
          
          if (fieldConfig.required && (!field || !field.value.trim())) {
            errors.push(`${fieldName} is required`);
          }
        });
        
        return errors;
      };

      // Test with empty form
      let errors = validateForm(event);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors).toContain('Full Name is required');
      expect(errors).toContain('Email is required');

      // Test with filled form
      const container = document.getElementById('dynamicFieldsContainer');
      container.innerHTML = `
        <input type="text" id="field_full_name" value="John Doe">
        <input type="email" id="field_email" value="john@example.com">
        <input type="tel" id="field_phone" value="">
      `;

      errors = validateForm(event);
      expect(errors.length).toBe(0);
    });

    test('should validate email format', () => {
      const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
      };

      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('')).toBe(false);
    });

    test('should validate file size for upload fields', () => {
      const validateFileSize = (file, maxSizeMB) => {
        const maxSizeBytes = maxSizeMB * 1024 * 1024;
        return file.size <= maxSizeBytes;
      };

      // Mock file object
      const mockFile = {
        size: 2 * 1024 * 1024, // 2MB
        name: 'test.pdf'
      };

      expect(validateFileSize(mockFile, 5)).toBe(true); // 2MB < 5MB
      expect(validateFileSize(mockFile, 1)).toBe(false); // 2MB > 1MB
    });
  });

  describe('Field Type Handling', () => {
    test('should handle mixed field types', () => {
      const event = {
        custom_fields: {
          'Name': 'text',
          'Email': 'email',
          'Phone': 'tel',
          'Comments': 'textarea',
          'Resume': { type: 'upload', maxSize: 5, required: true },
          'Agree to Terms': 'checkbox'
        }
      };

      const generateFields = (eventData) => {
        const container = document.getElementById('dynamicFieldsContainer');
        container.innerHTML = '';

        Object.entries(eventData.custom_fields).forEach(([fieldName, fieldConfig]) => {
          const fieldDiv = document.createElement('div');
          fieldDiv.className = 'form-group';
          
          const label = document.createElement('label');
          label.textContent = fieldName;
          
          let input;
          if (typeof fieldConfig === 'string') {
            if (fieldConfig === 'textarea') {
              input = document.createElement('textarea');
              input.rows = 3;
            } else if (fieldConfig === 'checkbox') {
              input = document.createElement('input');
              input.type = 'checkbox';
            } else {
              input = document.createElement('input');
              input.type = fieldConfig;
            }
          } else if (fieldConfig.type === 'upload') {
            input = document.createElement('input');
            input.type = 'file';
            input.setAttribute('data-max-size', fieldConfig.maxSize);
            if (fieldConfig.required) {
              input.required = true;
            }
          }
          
          if (input) {
            input.id = `field_${fieldName.toLowerCase().replace(/\s+/g, '_')}`;
            input.name = `field_${fieldName.toLowerCase().replace(/\s+/g, '_')}`;
            fieldDiv.appendChild(label);
            fieldDiv.appendChild(input);
          }
          
          container.appendChild(fieldDiv);
        });
      };

      generateFields(event);

      const container = document.getElementById('dynamicFieldsContainer');
      expect(container.children.length).toBe(6);
      
      const textInputs = container.querySelectorAll('input[type="text"]');
      const emailInputs = container.querySelectorAll('input[type="email"]');
      const telInputs = container.querySelectorAll('input[type="tel"]');
      const textareas = container.querySelectorAll('textarea');
      const fileInputs = container.querySelectorAll('input[type="file"]');
      const checkboxes = container.querySelectorAll('input[type="checkbox"]');

      expect(textInputs.length).toBe(1);
      expect(emailInputs.length).toBe(1);
      expect(telInputs.length).toBe(1);
      expect(textareas.length).toBe(1);
      expect(fileInputs.length).toBe(1);
      expect(checkboxes.length).toBe(1);
    });
  });
}); 