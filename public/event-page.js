

let currentEvent = null;
let selectedFiles = [];

// DOM elements (will be initialized after DOM loads)
let registrationForm = null;
let fileUploadArea = null;
let fileList = null;
let documentsInput = null;

// File upload limits
const MAX_FILES = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB per file
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    try {
        // Initialize DOM elements
        registrationForm = document.getElementById('registrationForm');
        fileUploadArea = document.getElementById('fileUploadArea');
        fileList = document.getElementById('fileList');
        documentsInput = document.getElementById('documents');
        
        loadEventDetails();
        setupEventListeners();
    } catch (error) {
        console.error('Error initializing event page:', error);
    }
});

// Setup event listeners
function setupEventListeners() {
    // File upload handling
    if (fileUploadArea && documentsInput) {
        fileUploadArea.addEventListener('click', () => documentsInput.click());
        fileUploadArea.addEventListener('dragover', handleDragOver);
        fileUploadArea.addEventListener('drop', handleDrop);
        documentsInput.addEventListener('change', handleFileSelect);
    }
    
    // Form submission
    if (registrationForm) {
        registrationForm.addEventListener('submit', handleRegistration);
    }
}

// Load event details from API
async function loadEventDetails() {
    // Get event ID from URL path
    const pathParts = window.location.pathname.split('/');
    const eventId = pathParts[pathParts.length - 1];
    
    // If no event ID or eventId is not a number, try to load the first available event
    if (!eventId || isNaN(eventId)) {
        try {
            const response = await fetch('/api/events');
            if (response.ok) {
                const events = await response.json();
                if (events.length > 0) {
                    const firstEvent = events[0];
                    window.history.replaceState(null, '', `/event.html/${firstEvent.id}`);
                    await loadEventDetails();
                    return;
                }
            }
        } catch (error) {
            console.error('Error loading events list:', error);
        }
        displayError('No events available. Please check back later.');
        return;
    }
    
    try {
        const response = await fetch(`/api/events/${eventId}`);
        
        if (!response.ok) {
            throw new Error('Event not found');
        }
        
        const event = await response.json();
        currentEvent = event;
        
        displayEventDetails(event);
    } catch (error) {
        console.error('Error loading event:', error);
        displayError('Failed to load event details. Please try again later.');
    }
}

// Display event details in the page
function displayEventDetails(event) {
    // Event banner/KV
    const eventBanner = document.querySelector('.event-banner');
    if (event.event_kv && event.event_kv.trim()) {
        eventBanner.style.backgroundImage = `url(${event.event_kv})`;
        eventBanner.style.display = 'block';
        eventBanner.style.backgroundSize = 'cover';
        eventBanner.style.backgroundPosition = 'center';
        eventBanner.style.backgroundRepeat = 'no-repeat';
    } else {
        eventBanner.style.display = 'none';
    }
    
    // Event title and basic info
    document.getElementById('eventTitle').textContent = event.title;
    document.getElementById('eventDescription').textContent = event.description;
    document.getElementById('eventDateTime').textContent = formatEventDate(event.event_date, event.event_time);
    document.getElementById('eventLocation').textContent = event.location;
    document.getElementById('eventAttendees').textContent = `${event.attendee_count || 0} / ${event.max_attendees}`;
    document.getElementById('eventDuration').textContent = calculateEventDuration(event.agenda);
    
    // Event agenda - display from database
    const agendaList = document.getElementById('eventAgenda');
    if (event.agenda && event.agenda.trim()) {
        // Parse the agenda text and create agenda items
        const agendaLines = event.agenda.split('\n').filter(line => line.trim());
        agendaList.innerHTML = agendaLines.map(line => {
            // Try to extract time and content from the line
            const timeMatch = line.match(/^(\d{1,2}:\d{2}\s*(?:AM|PM)?)/i);
            const time = timeMatch ? timeMatch[1] : '';
            const content = timeMatch ? line.substring(timeMatch[0].length).replace(/^[\s\-]+/, '') : line;
            
            return `
                <div class="agenda-item">
                    <div class="agenda-time">${time}</div>
                    <div class="agenda-content">
                        <h4>${content}</h4>
                        <p>${content} session details</p>
                    </div>
                </div>
            `;
        }).join('');
    } else {
        // Default agenda if no custom agenda is provided
        agendaList.innerHTML = `
            <div class="agenda-item">
                <div class="agenda-time">09:00 AM</div>
                <div class="agenda-content">
                    <h4>Registration & Welcome Coffee</h4>
                    <p>Check-in and networking with fellow attendees</p>
                </div>
            </div>
            <div class="agenda-item">
                <div class="agenda-time">09:30 AM</div>
                <div class="agenda-content">
                    <h4>Opening Remarks</h4>
                    <p>Welcome and introduction to the event</p>
                </div>
            </div>
            <div class="agenda-item">
                <div class="agenda-time">10:00 AM</div>
                <div class="agenda-content">
                    <h4>Main Session</h4>
                    <p>Core content and presentations</p>
                </div>
            </div>
            <div class="agenda-item">
                <div class="agenda-time">12:00 PM</div>
                <div class="agenda-content">
                    <h4>Lunch Break</h4>
                    <p>Networking lunch with participants</p>
                </div>
            </div>
            <div class="agenda-item">
                <div class="agenda-time">01:30 PM</div>
                <div class="agenda-content">
                    <h4>Workshop Session</h4>
                    <p>Interactive workshop and hands-on activities</p>
                </div>
            </div>
            <div class="agenda-item">
                <div class="agenda-time">04:00 PM</div>
                <div class="agenda-content">
                    <h4>Closing & Networking</h4>
                    <p>Wrap-up and continued networking</p>
                </div>
            </div>
        `;
    }
    
    // Detailed event information
    document.getElementById('eventFullDateTime').textContent = formatEventDate(event.event_date, event.event_time);
    document.getElementById('eventFullLocation').textContent = event.location;
    document.getElementById('eventCapacity').textContent = `${event.attendee_count || 0} / ${event.max_attendees} attendees`;
    document.getElementById('eventFullCategory').textContent = event.event_kv && event.event_kv.theme ? event.event_kv.theme : 'Professional Event';
    
    // Populate ALL fields dynamically based on admin configuration
    populateAllFields(event);
    
    // Enable registration form
    enableRegistrationForm();
}

// Enable registration form
function enableRegistrationForm() {
    const form = document.getElementById('registrationForm');
    const inputs = form.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        input.disabled = false;
    });
    
    // Create or update the register button
    let registerButton = form.querySelector('.register-button');
    if (!registerButton) {
        registerButton = document.createElement('button');
        registerButton.type = 'submit';
        registerButton.className = 'register-button';
        form.appendChild(registerButton);
    }
    
    registerButton.disabled = false;
    registerButton.innerHTML = '<i class="fas fa-check"></i> Register for Event';
}

// Format event date and time
function formatEventDate(date, time) {
    if (!date) return 'Date not set';
    
    try {
        // Handle different date formats
        let eventDate;
        if (typeof date === 'string') {
            // If date is already a full ISO string
            if (date.includes('T')) {
                eventDate = new Date(date);
            } else {
                // If date is just a date string, combine with time
                const dateTimeString = time ? `${date}T${time}` : `${date}T00:00:00`;
                eventDate = new Date(dateTimeString);
            }
        } else {
            eventDate = new Date(date);
        }
        
        // Check if date is valid
        if (isNaN(eventDate.getTime())) {
            return 'Invalid date';
        }
        
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric'
        };
        
        let formattedDate = eventDate.toLocaleDateString('en-US', options);
        
        // Add time if available
        if (time) {
            const timeOptions = { hour: '2-digit', minute: '2-digit' };
            const formattedTime = new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', timeOptions);
            formattedDate += ` at ${formattedTime}`;
        }
        
        return formattedDate;
    } catch (error) {
        console.error('Error formatting date:', error);
        return 'Invalid date';
    }
}

// Calculate event duration from agenda
function calculateEventDuration(agenda) {
    if (!agenda || !agenda.trim()) {
        return '3 hours'; // Default duration
    }
    
    try {
        const agendaLines = agenda.split('\n').filter(line => line.trim());
        if (agendaLines.length < 2) {
            return '3 hours'; // Default if not enough agenda items
        }
        
        // Extract times from agenda
        const times = [];
        agendaLines.forEach(line => {
            const timeMatch = line.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
            if (timeMatch) {
                let hour = parseInt(timeMatch[1]);
                const minute = parseInt(timeMatch[2]);
                const period = timeMatch[3] ? timeMatch[3].toUpperCase() : '';
                
                // Convert to 24-hour format
                if (period === 'PM' && hour !== 12) hour += 12;
                if (period === 'AM' && hour === 12) hour = 0;
                
                times.push(hour * 60 + minute); // Convert to minutes
            }
        });
        
        if (times.length < 2) {
            return '3 hours'; // Default if not enough times
        }
        
        // Calculate duration
        const startTime = Math.min(...times);
        const endTime = Math.max(...times);
        const durationMinutes = endTime - startTime;
        
        if (durationMinutes <= 0) {
            return '3 hours'; // Default if invalid duration
        }
        
        const hours = Math.floor(durationMinutes / 60);
        const minutes = durationMinutes % 60;
        
        if (hours === 0) {
            return `${minutes} minutes`;
        } else if (minutes === 0) {
            return `${hours} hour${hours !== 1 ? 's' : ''}`;
        } else {
            return `${hours} hour${hours !== 1 ? 's' : ''} ${minutes} minutes`;
        }
    } catch (error) {
        console.error('Error calculating duration:', error);
        return '3 hours'; // Default on error
    }
}

// Populate ALL fields dynamically based on admin configuration
function populateAllFields(event) {
    const container = document.getElementById('dynamicFieldsContainer');
    
    let allFieldsHTML = '';
    
    // Add custom fields defined by admin
    if (event.custom_fields && Object.keys(event.custom_fields).length > 0) {
        Object.entries(event.custom_fields).forEach(([fieldName, fieldConfig]) => {
            const fieldId = `field_${fieldName.toLowerCase().replace(/\s+/g, '_')}`;
            
            let inputHTML = '';
            let isRequired = false;
            
            // Handle both old format (string) and new format (object)
            const fieldType = typeof fieldConfig === 'string' ? fieldConfig : fieldConfig.type;
            
            switch (fieldType) {
                case 'email':
                    inputHTML = `<input type="email" id="${fieldId}" name="${fieldId}" required />`;
                    isRequired = true;
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
                case 'upload':
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
                    break;
                default: // text
                    inputHTML = `<input type="text" id="${fieldId}" name="${fieldId}" />`;
            }
            
            allFieldsHTML += `
                <div class="form-group">
                    <label for="${fieldId}" ${isRequired ? 'class="required"' : ''}>${fieldName}</label>
                    ${inputHTML}
                </div>
            `;
        });
    } else {
        // If no custom fields defined, show a message
        allFieldsHTML = `
            <div class="form-group">
                <p class="no-fields-message">No registration fields have been configured for this event.</p>
            </div>
        `;
    }
    
    // Add document upload if enabled
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
    
    // Set up event listeners for custom upload fields
    setupCustomUploadFields();
}

// Set up custom upload fields
function setupCustomUploadFields() {
    if (!currentEvent || !currentEvent.custom_fields) return;
    
    Object.entries(currentEvent.custom_fields).forEach(([fieldName, fieldConfig]) => {
        const fieldType = typeof fieldConfig === 'string' ? fieldConfig : fieldConfig.type;
        
        if (fieldType === 'upload') {
            const fieldId = `field_${fieldName.toLowerCase().replace(/\s+/g, '_')}`;
            const fileInput = document.getElementById(fieldId);
            const uploadArea = document.getElementById(`customUploadArea_${fieldId}`);
            const fileList = document.getElementById(`fileList_${fieldId}`);
            
            if (fileInput && uploadArea && fileList) {
                // Set up drag and drop
                uploadArea.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    uploadArea.classList.add('drag-over');
                });
                
                uploadArea.addEventListener('dragleave', (e) => {
                    e.preventDefault();
                    uploadArea.classList.remove('drag-over');
                });
                
                uploadArea.addEventListener('drop', (e) => {
                    e.preventDefault();
                    uploadArea.classList.remove('drag-over');
                    const files = Array.from(e.dataTransfer.files);
                    processCustomUploadFiles(files, fieldId, fieldConfig);
                });
                
                // Set up click to browse
                uploadArea.addEventListener('click', (e) => {
                    // Don't trigger if clicking on the file input itself
                    if (e.target !== fileInput) {
                        fileInput.click();
                    }
                });
                
                // Set up file selection
                fileInput.addEventListener('change', (e) => {
                    const files = Array.from(e.target.files);
                    processCustomUploadFiles(files, fieldId, fieldConfig);
                });
            }
        }
    });
}

// Process custom upload files with validation
function processCustomUploadFiles(files, fieldId, fieldConfig) {
    const maxSize = fieldConfig.maxSize || 5;
    const maxSizeBytes = maxSize * 1024 * 1024; // Convert MB to bytes
    const allowedTypes = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.gif'];
    
    const validFiles = files.filter(file => {
        // Check file type
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
        if (!allowedTypes.includes(fileExtension)) {
            showNotification(`File type not allowed: ${file.name}. Allowed types: ${allowedTypes.join(', ')}`, 'error');
            return false;
        }
        
        // Check file size
        if (file.size > maxSizeBytes) {
            showNotification(`File too large: ${file.name} (max ${maxSize}MB)`, 'error');
            return false;
        }
        
        return true;
    });
    
    // Update file list display
    updateCustomFileList(fieldId, validFiles);
}

// Update custom file list display
function updateCustomFileList(fieldId, files) {
    const fileList = document.getElementById(`fileList_${fieldId}`);
    if (!fileList) return;
    
    if (files.length === 0) {
        fileList.innerHTML = '<p class="no-files">No files selected</p>';
        return;
    }
    
    fileList.innerHTML = files.map((file, index) => `
        <div class="file-item">
            <i class="fas fa-file"></i>
            <span class="file-name">${file.name}</span>
            <span class="file-size">${formatFileSize(file.size)}</span>
            <button type="button" class="remove-file" onclick="removeCustomFile('${fieldId}', ${index})">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');
}

// Remove custom file
function removeCustomFile(fieldId, index) {
    const fileInput = document.getElementById(fieldId);
    if (fileInput) {
        // Create a new FileList without the removed file
        const dt = new DataTransfer();
        const files = Array.from(fileInput.files);
        files.splice(index, 1);
        files.forEach(file => dt.items.add(file));
        fileInput.files = dt.files;
        
        // Update display
        updateCustomFileList(fieldId, files);
    }
}

// Make function globally accessible
window.removeCustomFile = removeCustomFile;

// Handle file drag over
function handleDragOver(e) {
    e.preventDefault();
    fileUploadArea.classList.add('drag-over');
}

// Handle file drop
function handleDrop(e) {
    e.preventDefault();
    fileUploadArea.classList.remove('drag-over');
    
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
}

// Handle file selection
function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    processFiles(files);
}

// Process selected files
function processFiles(files) {
    const validFiles = files.filter(file => {
        // Check file type
        if (!ALLOWED_TYPES.includes(file.type)) {
            showNotification(`File type not allowed: ${file.name}`, 'error');
            return false;
        }
        
        // Check file size
        if (file.size > MAX_FILE_SIZE) {
            showNotification(`File too large: ${file.name} (max 10MB)`, 'error');
            return false;
        }
        
        return true;
    });
    
    // Check total number of files
    if (selectedFiles.length + validFiles.length > MAX_FILES) {
        showNotification(`Maximum ${MAX_FILES} files allowed`, 'error');
        return;
    }
    
    // Add valid files to selection
    selectedFiles = [...selectedFiles, ...validFiles];
    updateFileList();
}

// Update file list display
function updateFileList() {
    if (!fileList) return; // Don't update if fileList doesn't exist
    
    if (selectedFiles.length === 0) {
        fileList.innerHTML = '<p class="no-files">No files selected</p>';
        return;
    }
    
    fileList.innerHTML = selectedFiles.map((file, index) => `
        <div class="file-item">
            <i class="fas fa-file"></i>
            <span class="file-name">${file.name}</span>
            <span class="file-size">${formatFileSize(file.size)}</span>
            <button type="button" class="remove-file" onclick="removeFile(${index})">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');
}

// Remove file from selection
function removeFile(index) {
    selectedFiles.splice(index, 1);
    updateFileList();
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Handle registration form submission
async function handleRegistration(e) {
    e.preventDefault();
    
    const formData = new FormData();
    
    // Add all dynamic fields
    const customData = {};
    const customFiles = {};
    
    if (currentEvent.custom_fields) {
        Object.entries(currentEvent.custom_fields).forEach(([fieldName, fieldConfig]) => {
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
    }
    
    if (Object.keys(customData).length > 0) {
        formData.append('custom_data', JSON.stringify(customData));
    }
    
    // Add custom upload files
    Object.entries(customFiles).forEach(([fieldName, files]) => {
        files.forEach(file => {
            formData.append(`custom_file_${fieldName}`, file);
        });
    });
    
    // Add general document files
    selectedFiles.forEach(file => {
        formData.append('documents', file);
    });
    
    // Show loading state
    const submitButton = registrationForm.querySelector('.register-button');
    const originalText = submitButton.innerHTML;
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registering...';
    
    try {
        const response = await fetch(`/api/events/${currentEvent.id}/register`, {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showNotification('Registration successful! You will receive a confirmation email soon.', 'success');
            registrationForm.reset();
            selectedFiles = [];
            updateFileList();
        } else {
            showNotification(result.error || 'Registration failed. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showNotification('Registration failed. Please check your connection and try again.', 'error');
    } finally {
        // Reset button state
        submitButton.disabled = false;
        submitButton.innerHTML = originalText;
    }
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'error' ? 'exclamation-circle' : type === 'success' ? 'check-circle' : 'info-circle'}"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'error' ? '#ff4757' : type === 'success' ? '#2ed573' : '#ff6b6b'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        z-index: 3000;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        max-width: 400px;
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Display error message
function displayError(message) {
    const mainContent = document.querySelector('.event-content');
    mainContent.innerHTML = `
        <div class="error-container">
            <i class="fas fa-exclamation-triangle"></i>
            <h2>Error</h2>
            <p>${message}</p>
            <a href="/" class="back-button">
                <i class="fas fa-arrow-left"></i>
                Back to Events
            </a>
        </div>
    `;
} 