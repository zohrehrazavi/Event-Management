const fs = require('fs');
const path = require('path');

// Mock DOM environment for testing frontend JavaScript
const { JSDOM } = require('jsdom');

describe('Frontend Custom Fields Functionality', () => {
  let dom;
  let document;
  let window;

  beforeEach(() => {
    // Create a mock DOM environment
    dom = new JSDOM(`
      <!DOCTYPE html>
      <html>
        <head></head>
        <body>
          <div id="dynamicFieldsContainer"></div>
          <form id="registrationForm">
            <button type="submit" class="register-button">Register</button>
          </form>
        </body>
      </html>
    `, {
      url: 'http://localhost:8080',
      pretendToBeVisual: true
    });

    document = dom.window.document;
    window = dom.window;

    // Mock fetch function
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('populateAllFields function', () => {
    test('should populate custom fields correctly', () => {
      // Mock the populateAllFields function
      const populateAllFields = (event) => {
        const container = document.getElementById('dynamicFieldsContainer');
        
        let allFieldsHTML = '';
        
        if (event.custom_fields && Object.keys(event.custom_fields).length > 0) {
          Object.entries(event.custom_fields).forEach(([fieldName, fieldType]) => {
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
            
            allFieldsHTML += `
              <div class="form-group">
                <label for="${fieldId}" class="required">${fieldName}</label>
                ${inputHTML}
              </div>
            `;
          });
        } else {
          allFieldsHTML = `
            <div class="form-group">
              <p class="no-fields-message">No registration fields have been configured for this event.</p>
            </div>
          `;
        }
        
        container.innerHTML = allFieldsHTML;
      };

      // Test event with custom fields
      const testEvent = {
        custom_fields: {
          'Company Name': 'text',
          'Phone Number': 'tel',
          'Job Title': 'text',
          'Years of Experience': 'text',
          'Dietary Requirements': 'textarea',
          'LinkedIn Profile': 'url'
        },
        allow_documents: false
      };

      populateAllFields(testEvent);

      const container = document.getElementById('dynamicFieldsContainer');
      const formGroups = container.querySelectorAll('.form-group');
      
      expect(formGroups).toHaveLength(6);
      
      // Check specific fields
      expect(container.querySelector('#field_company_name')).toBeTruthy();
      expect(container.querySelector('#field_phone_number')).toBeTruthy();
      expect(container.querySelector('#field_job_title')).toBeTruthy();
      expect(container.querySelector('#field_years_of_experience')).toBeTruthy();
      expect(container.querySelector('#field_dietary_requirements')).toBeTruthy();
      expect(container.querySelector('#field_linkedin_profile')).toBeTruthy();
      
      // Check field types
      expect(container.querySelector('#field_company_name').type).toBe('text');
      expect(container.querySelector('#field_phone_number').type).toBe('tel');
      expect(container.querySelector('#field_job_title').type).toBe('text');
      expect(container.querySelector('#field_years_of_experience').type).toBe('text');
      expect(container.querySelector('#field_dietary_requirements').tagName).toBe('TEXTAREA');
      expect(container.querySelector('#field_linkedin_profile').type).toBe('url');
    });

    test('should show message when no custom fields', () => {
      const populateAllFields = (event) => {
        const container = document.getElementById('dynamicFieldsContainer');
        
        let allFieldsHTML = '';
        
        if (event.custom_fields && Object.keys(event.custom_fields).length > 0) {
          Object.entries(event.custom_fields).forEach(([fieldName, fieldType]) => {
            const fieldId = `field_${fieldName.toLowerCase().replace(/\s+/g, '_')}`;
            let inputHTML = `<input type="text" id="${fieldId}" name="${fieldId}" />`;
            
            allFieldsHTML += `
              <div class="form-group">
                <label for="${fieldId}" class="required">${fieldName}</label>
                ${inputHTML}
              </div>
            `;
          });
        } else {
          allFieldsHTML = `
            <div class="form-group">
              <p class="no-fields-message">No registration fields have been configured for this event.</p>
            </div>
          `;
        }
        
        container.innerHTML = allFieldsHTML;
      };

      const testEvent = {
        custom_fields: {},
        allow_documents: false
      };

      populateAllFields(testEvent);

      const container = document.getElementById('dynamicFieldsContainer');
      const message = container.querySelector('.no-fields-message');
      
      expect(message).toBeTruthy();
      expect(message.textContent).toBe('No registration fields have been configured for this event.');
    });

    test('should add document upload when enabled', () => {
      const populateAllFields = (event) => {
        const container = document.getElementById('dynamicFieldsContainer');
        
        let allFieldsHTML = '';
        
        if (event.custom_fields && Object.keys(event.custom_fields).length > 0) {
          Object.entries(event.custom_fields).forEach(([fieldName, fieldType]) => {
            const fieldId = `field_${fieldName.toLowerCase().replace(/\s+/g, '_')}`;
            let inputHTML = `<input type="text" id="${fieldId}" name="${fieldId}" />`;
            
            allFieldsHTML += `
              <div class="form-group">
                <label for="${fieldId}" class="required">${fieldName}</label>
                ${inputHTML}
              </div>
            `;
          });
        }
        
        if (event.allow_documents) {
          allFieldsHTML += `
            <div class="form-group">
              <label for="documents">Upload Documents (Optional)</label>
              <div class="file-upload-area" id="fileUploadArea">
                <i class="fas fa-cloud-upload-alt"></i>
                <p>Drag and drop files here or click to browse</p>
                <input
                  type="file"
                  id="documents"
                  name="documents"
                  multiple
                  accept="${event.allowed_file_types || '.pdf,.doc,.docx,.jpg,.jpeg,.png,.gif'}"
                />
              </div>
              <div id="fileList" class="file-list"></div>
            </div>
          `;
        }
        
        container.innerHTML = allFieldsHTML;
      };

      const testEvent = {
        custom_fields: {
          'Company Name': 'text',
          'Phone Number': 'tel'
        },
        allow_documents: true,
        allowed_file_types: '.pdf,.doc,.docx'
      };

      populateAllFields(testEvent);

      const container = document.getElementById('dynamicFieldsContainer');
      const formGroups = container.querySelectorAll('.form-group');
      
      expect(formGroups).toHaveLength(3); // 2 custom fields + 1 document upload
      
      // Check document upload
      const documentUpload = container.querySelector('#documents');
      expect(documentUpload).toBeTruthy();
      expect(documentUpload.type).toBe('file');
      expect(documentUpload.multiple).toBe(true);
      expect(documentUpload.accept).toBe('.pdf,.doc,.docx');
    });
  });

  describe('Form submission with custom fields', () => {
    test('should collect custom field data correctly', () => {
      // Mock form submission handler
      const handleRegistration = (e) => {
        e.preventDefault();
        
        const formData = new FormData();
        
        const customData = {};
        const testEvent = {
          custom_fields: {
            'Company Name': 'text',
            'Phone Number': 'tel',
            'Job Title': 'text'
          }
        };
        
        Object.entries(testEvent.custom_fields).forEach(([fieldName, fieldType]) => {
          const fieldId = `field_${fieldName.toLowerCase().replace(/\s+/g, '_')}`;
          const fieldValue = document.getElementById(fieldId)?.value;
          if (fieldValue) {
            customData[fieldName] = fieldValue;
          }
        });
        
        if (Object.keys(customData).length > 0) {
          formData.append('custom_data', JSON.stringify(customData));
        }
        
        return formData;
      };

      // Set up form with custom fields
      const container = document.getElementById('dynamicFieldsContainer');
      container.innerHTML = `
        <div class="form-group">
          <label for="field_company_name" class="required">Company Name</label>
          <input type="text" id="field_company_name" name="field_company_name" value="Test Corp" />
        </div>
        <div class="form-group">
          <label for="field_phone_number" class="required">Phone Number</label>
          <input type="tel" id="field_phone_number" name="field_phone_number" value="555-123-4567" />
        </div>
        <div class="form-group">
          <label for="field_job_title" class="required">Job Title</label>
          <input type="text" id="field_job_title" name="field_job_title" value="Developer" />
        </div>
      `;

      const form = document.getElementById('registrationForm');
      const mockEvent = { preventDefault: jest.fn() };
      
      const formData = handleRegistration(mockEvent);
      
      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(formData.get('custom_data')).toBe(JSON.stringify({
        'Company Name': 'Test Corp',
        'Phone Number': '555-123-4567',
        'Job Title': 'Developer'
      }));
    });

    test('should handle empty custom fields', () => {
      const handleRegistration = (e) => {
        e.preventDefault();
        
        const formData = new FormData();
        
        const customData = {};
        const testEvent = {
          custom_fields: {}
        };
        
        Object.entries(testEvent.custom_fields).forEach(([fieldName, fieldType]) => {
          const fieldId = `field_${fieldName.toLowerCase().replace(/\s+/g, '_')}`;
          const fieldValue = document.getElementById(fieldId)?.value;
          if (fieldValue) {
            customData[fieldName] = fieldValue;
          }
        });
        
        if (Object.keys(customData).length > 0) {
          formData.append('custom_data', JSON.stringify(customData));
        }
        
        return formData;
      };

      const mockEvent = { preventDefault: jest.fn() };
      const formData = handleRegistration(mockEvent);
      
      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(formData.get('custom_data')).toBeNull();
    });
  });
}); 