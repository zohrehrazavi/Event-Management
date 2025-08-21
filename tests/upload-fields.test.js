const { JSDOM } = require('jsdom');

describe('Upload Fields Functionality', () => {
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

  describe('Upload Field Generation', () => {
    test('should generate upload field with configuration', () => {
      const populateAllFields = (event) => {
        const container = document.getElementById('dynamicFieldsContainer');
        
        let allFieldsHTML = '';
        
        if (event.custom_fields && Object.keys(event.custom_fields).length > 0) {
          Object.entries(event.custom_fields).forEach(([fieldName, fieldConfig]) => {
            const fieldId = `field_${fieldName.toLowerCase().replace(/\s+/g, '_')}`;
            
            let inputHTML = '';
            let isRequired = false;
            
            // Handle both old format (string) and new format (object)
            const fieldType = typeof fieldConfig === 'string' ? fieldConfig : fieldConfig.type;
            
            if (fieldType === 'upload') {
              // Handle upload field with configuration
              const maxSize = fieldConfig.maxSize || 5;
              const required = fieldConfig.required || false;
              isRequired = required;
              
              inputHTML = `
                <div class="file-upload-area custom-upload-area" id="customUploadArea_${fieldId}">
                  <i class="fas fa-cloud-upload-alt"></i>
                  <p>Drag and drop files here or click to browse</p>
                  <input
                    type="file"
                    id="${fieldId}"
                    name="${fieldId}"
                    ${required ? 'required' : ''}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                    data-max-size="${maxSize}"
                  />
                </div>
                <div id="fileList_${fieldId}" class="file-list"></div>
              `;
            }
            
            allFieldsHTML += `
              <div class="form-group">
                <label for="${fieldId}" ${isRequired ? 'class="required"' : ''}>${fieldName}</label>
                ${inputHTML}
              </div>
            `;
          });
        }
        
        container.innerHTML = allFieldsHTML;
      };

      const testEvent = {
        custom_fields: {
          'Resume': {
            type: 'upload',
            maxSize: 10,
            required: true
          },
          'Portfolio': {
            type: 'upload',
            maxSize: 5,
            required: false
          }
        }
      };

      populateAllFields(testEvent);

      const container = document.getElementById('dynamicFieldsContainer');
      const formGroups = container.querySelectorAll('.form-group');
      
      expect(formGroups).toHaveLength(2);
      
      // Check Resume field
      const resumeField = container.querySelector('#field_resume');
      expect(resumeField).toBeTruthy();
      expect(resumeField.type).toBe('file');
      expect(resumeField.required).toBe(true);
      expect(resumeField.getAttribute('data-max-size')).toBe('10');
      
      // Check Portfolio field
      const portfolioField = container.querySelector('#field_portfolio');
      expect(portfolioField).toBeTruthy();
      expect(portfolioField.type).toBe('file');
      expect(portfolioField.required).toBe(false);
      expect(portfolioField.getAttribute('data-max-size')).toBe('5');
      
      // Check labels
      const resumeLabel = container.querySelector('label[for="field_resume"]');
      expect(resumeLabel).toBeTruthy();
      expect(resumeLabel.textContent).toBe('Resume');
      expect(resumeLabel.className).toContain('required');
      
      const portfolioLabel = container.querySelector('label[for="field_portfolio"]');
      expect(portfolioLabel).toBeTruthy();
      expect(portfolioLabel.textContent).toBe('Portfolio');
      expect(portfolioLabel.className).not.toContain('required');
    });

    test('should handle mixed field types with upload fields', () => {
      const populateAllFields = (event) => {
        const container = document.getElementById('dynamicFieldsContainer');
        
        let allFieldsHTML = '';
        
        if (event.custom_fields && Object.keys(event.custom_fields).length > 0) {
          Object.entries(event.custom_fields).forEach(([fieldName, fieldConfig]) => {
            const fieldId = `field_${fieldName.toLowerCase().replace(/\s+/g, '_')}`;
            
            let inputHTML = '';
            let isRequired = false;
            
            // Handle both old format (string) and new format (object)
            const fieldType = typeof fieldConfig === 'string' ? fieldConfig : fieldConfig.type;
            
            switch (fieldType) {
              case 'text':
                inputHTML = `<input type="text" id="${fieldId}" name="${fieldId}" />`;
                break;
              case 'email':
                inputHTML = `<input type="email" id="${fieldId}" name="${fieldId}" required />`;
                isRequired = true;
                break;
              case 'upload':
                const maxSize = fieldConfig.maxSize || 5;
                const required = fieldConfig.required || false;
                isRequired = required;
                
                inputHTML = `
                  <div class="file-upload-area custom-upload-area" id="customUploadArea_${fieldId}">
                    <i class="fas fa-cloud-upload-alt"></i>
                    <p>Drag and drop files here or click to browse</p>
                    <input
                      type="file"
                      id="${fieldId}"
                      name="${fieldId}"
                      ${required ? 'required' : ''}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                      data-max-size="${maxSize}"
                    />
                  </div>
                  <div id="fileList_${fieldId}" class="file-list"></div>
                `;
                break;
            }
            
            allFieldsHTML += `
              <div class="form-group">
                <label for="${fieldId}" ${isRequired ? 'class="required"' : ''}>${fieldName}</label>
                ${inputHTML}
              </div>
            `;
          });
        }
        
        container.innerHTML = allFieldsHTML;
      };

      const testEvent = {
        custom_fields: {
          'Full Name': 'text',
          'Email': 'email',
          'Resume': {
            type: 'upload',
            maxSize: 10,
            required: true
          }
        }
      };

      populateAllFields(testEvent);

      const container = document.getElementById('dynamicFieldsContainer');
      const formGroups = container.querySelectorAll('.form-group');
      
      expect(formGroups).toHaveLength(3);
      
      // Check text field
      const nameField = container.querySelector('#field_full_name');
      expect(nameField).toBeTruthy();
      expect(nameField.type).toBe('text');
      
      // Check email field
      const emailField = container.querySelector('#field_email');
      expect(emailField).toBeTruthy();
      expect(emailField.type).toBe('email');
      expect(emailField.required).toBe(true);
      
      // Check upload field
      const resumeField = container.querySelector('#field_resume');
      expect(resumeField).toBeTruthy();
      expect(resumeField.type).toBe('file');
      expect(resumeField.required).toBe(true);
    });
  });

  describe('Form Submission with Upload Fields', () => {
    test('should collect upload field files correctly', () => {
      const handleRegistration = (e) => {
        e.preventDefault();
        
        const formData = new FormData();
        
        // Add all dynamic fields
        const customData = {};
        const customFiles = {};
        
        const testEvent = {
          custom_fields: {
            'Resume': {
              type: 'upload',
              maxSize: 10,
              required: true
            },
            'Portfolio': {
              type: 'upload',
              maxSize: 5,
              required: false
            },
            'Company': 'text'
          }
        };
        
        Object.entries(testEvent.custom_fields).forEach(([fieldName, fieldConfig]) => {
          const fieldId = `field_${fieldName.toLowerCase().replace(/\s+/g, '_')}`;
          const fieldElement = document.getElementById(fieldId);
          
          if (fieldElement) {
            // Handle both old format (string) and new format (object)
            const fieldType = typeof fieldConfig === 'string' ? fieldConfig : fieldConfig.type;
            
            if (fieldType === 'upload') {
              // Handle upload fields
              if (fieldElement.files && fieldElement.files.length > 0) {
                // Add files to custom files object
                customFiles[fieldName] = Array.from(fieldElement.files);
              }
            } else {
              // Handle regular fields
              const fieldValue = fieldElement.value;
              if (fieldValue && fieldValue.trim()) {
                customData[fieldName] = fieldValue;
              }
            }
          }
        });
        
        if (Object.keys(customData).length > 0) {
          formData.append('custom_data', JSON.stringify(customData));
        }
        
        // Add custom upload files
        Object.entries(customFiles).forEach(([fieldName, files]) => {
          files.forEach(file => {
            formData.append(`custom_file_${fieldName}`, file);
          });
        });
        
        return formData;
      };

      // Set up form with upload fields
      const container = document.getElementById('dynamicFieldsContainer');
      container.innerHTML = `
        <div class="form-group">
          <label for="field_resume" class="required">Resume</label>
          <div class="file-upload-area custom-upload-area">
            <input type="file" id="field_resume" name="field_resume" required />
          </div>
        </div>
        <div class="form-group">
          <label for="field_portfolio">Portfolio</label>
          <div class="file-upload-area custom-upload-area">
            <input type="file" id="field_portfolio" name="field_portfolio" />
          </div>
        </div>
        <div class="form-group">
          <label for="field_company">Company</label>
          <input type="text" id="field_company" name="field_company" value="Test Corp" />
        </div>
      `;

      // Mock file objects
      const mockResumeFile = new File(['resume content'], 'resume.pdf', { type: 'application/pdf' });
      const mockPortfolioFile = new File(['portfolio content'], 'portfolio.pdf', { type: 'application/pdf' });
      
      // Set files on input elements
      const resumeInput = document.getElementById('field_resume');
      const portfolioInput = document.getElementById('field_portfolio');
      
      Object.defineProperty(resumeInput, 'files', {
        value: [mockResumeFile],
        writable: true
      });
      
      Object.defineProperty(portfolioInput, 'files', {
        value: [mockPortfolioFile],
        writable: true
      });

      const mockEvent = { preventDefault: jest.fn() };
      const formData = handleRegistration(mockEvent);
      
      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(formData.get('custom_data')).toBe(JSON.stringify({ 'Company': 'Test Corp' }));
      expect(formData.get('custom_file_Resume')).toBe(mockResumeFile);
      expect(formData.get('custom_file_Portfolio')).toBe(mockPortfolioFile);
    });

    test('should handle empty upload fields', () => {
      const handleRegistration = (e) => {
        e.preventDefault();
        
        const formData = new FormData();
        
        const customData = {};
        const customFiles = {};
        
        const testEvent = {
          custom_fields: {
            'Resume': {
              type: 'upload',
              maxSize: 10,
              required: false
            }
          }
        };
        
        Object.entries(testEvent.custom_fields).forEach(([fieldName, fieldConfig]) => {
          const fieldId = `field_${fieldName.toLowerCase().replace(/\s+/g, '_')}`;
          const fieldElement = document.getElementById(fieldId);
          
          if (fieldElement) {
            const fieldType = typeof fieldConfig === 'string' ? fieldConfig : fieldConfig.type;
            
            if (fieldType === 'upload') {
              if (fieldElement.files && fieldElement.files.length > 0) {
                customFiles[fieldName] = Array.from(fieldElement.files);
              }
            }
          }
        });
        
        if (Object.keys(customData).length > 0) {
          formData.append('custom_data', JSON.stringify(customData));
        }
        
        Object.entries(customFiles).forEach(([fieldName, files]) => {
          files.forEach(file => {
            formData.append(`custom_file_${fieldName}`, file);
          });
        });
        
        return formData;
      };

      // Set up form with empty upload field
      const container = document.getElementById('dynamicFieldsContainer');
      container.innerHTML = `
        <div class="form-group">
          <label for="field_resume">Resume</label>
          <div class="file-upload-area custom-upload-area">
            <input type="file" id="field_resume" name="field_resume" />
          </div>
        </div>
      `;

      const mockEvent = { preventDefault: jest.fn() };
      const formData = handleRegistration(mockEvent);
      
      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(formData.get('custom_data')).toBeNull();
      expect(formData.get('custom_file_Resume')).toBeNull();
    });
  });

  describe('Upload Field Configuration', () => {
    test('should handle upload field configuration correctly', () => {
      const validateUploadConfig = (fieldConfig) => {
        if (fieldConfig.type !== 'upload') {
          return false;
        }
        
        const maxSize = fieldConfig.maxSize || 5;
        const required = fieldConfig.required || false;
        
        return {
          isValid: true,
          maxSize: maxSize,
          required: required
        };
      };

      // Test valid upload config
      const validConfig = {
        type: 'upload',
        maxSize: 10,
        required: true
      };
      
      const result = validateUploadConfig(validConfig);
      expect(result.isValid).toBe(true);
      expect(result.maxSize).toBe(10);
      expect(result.required).toBe(true);

      // Test upload config with defaults
      const defaultConfig = {
        type: 'upload'
      };
      
      const defaultResult = validateUploadConfig(defaultConfig);
      expect(defaultResult.isValid).toBe(true);
      expect(defaultResult.maxSize).toBe(5);
      expect(defaultResult.required).toBe(false);

      // Test non-upload config
      const textConfig = 'text';
      const textResult = validateUploadConfig(textConfig);
      expect(textResult).toBe(false);
    });
  });
}); 