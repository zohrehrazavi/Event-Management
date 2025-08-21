// Event Manager JavaScript
let isEditMode = false;
let currentEventId = null;

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    setupImageUpload();
    checkEditMode();
});

// Setup event listeners
function setupEventListeners() {
    const form = document.getElementById('eventForm');
    const isExclusiveCheckbox = document.getElementById('isExclusive');
    
    // Form submission
    form.addEventListener('submit', handleFormSubmit);
    
    // Exclusive event toggle
    isExclusiveCheckbox.addEventListener('change', function() {
        const accessCodeGroup = document.getElementById('accessCodeGroup');
        accessCodeGroup.style.display = this.checked ? 'block' : 'none';
    });
    
    // Document upload toggle
    const allowDocumentsCheckbox = document.getElementById('allowDocuments');
    if (allowDocumentsCheckbox) {
        allowDocumentsCheckbox.addEventListener('change', function() {
            const documentSettings = document.getElementById('documentSettings');
            documentSettings.style.display = this.checked ? 'block' : 'none';
        });
    }
    
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('eventDate').value = today;
}

// Setup image upload functionality
function setupImageUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('eventKVFile');
    const imagePreview = document.getElementById('imagePreview');
    const previewImage = document.getElementById('previewImage');
    const removeImage = document.getElementById('removeImage');
    
    // Click to upload
    uploadArea.addEventListener('click', () => fileInput.click());
    
    // File selection
    fileInput.addEventListener('change', handleFileSelect);
    
    // Drag and drop
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    
    // Remove image
    removeImage.addEventListener('click', removeSelectedImage);
}

// Handle file selection
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        validateAndPreviewFile(file);
    }
}

// Handle drag over
function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('dragover');
}

// Handle drag leave
function handleDragLeave(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
}

// Handle drop
function handleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        validateAndPreviewFile(files[0]);
    }
}

// Validate and preview file
function validateAndPreviewFile(file) {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    
    if (!allowedTypes.includes(file.type)) {
        showNotification('Please select a valid image file (JPG, PNG, GIF)', 'error');
        return;
    }
    
    if (file.size > maxSize) {
        showNotification('File size must be less than 5MB', 'error');
        return;
    }
    
    // Preview image
    const reader = new FileReader();
    reader.onload = function(e) {
        const previewImage = document.getElementById('previewImage');
        const imagePreview = document.getElementById('imagePreview');
        const uploadArea = document.getElementById('uploadArea');
        
        previewImage.src = e.target.result;
        imagePreview.style.display = 'block';
        uploadArea.style.display = 'none';
    };
    reader.readAsDataURL(file);
}

// Remove selected image
function removeSelectedImage() {
    const imagePreview = document.getElementById('imagePreview');
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('eventKVFile');
    const previewImage = document.getElementById('previewImage');
    
    imagePreview.style.display = 'none';
    uploadArea.style.display = 'block';
    fileInput.value = '';
    previewImage.src = '';
}

// Check if we're in edit mode
function checkEditMode() {
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('edit');
    
    if (eventId) {
        isEditMode = true;
        currentEventId = eventId;
        loadEventForEdit(eventId);
    }
}

// Load event for editing
async function loadEventForEdit(eventId) {
    try {
        const response = await fetch(`/api/events/${eventId}`);
        if (!response.ok) {
            throw new Error('Event not found');
        }
        
        const event = await response.json();
        populateForm(event);
        
        // Update page title and description
        document.getElementById('pageTitle').textContent = 'Edit Event';
        document.getElementById('pageDescription').textContent = 'Update the event details below';
        document.getElementById('submitBtn').innerHTML = '<i class="fas fa-save"></i> Update Event';
        
    } catch (error) {
        console.error('Error loading event:', error);
        showNotification('Error loading event details', 'error');
        setTimeout(() => {
            window.location.href = '/admin.html';
        }, 2000);
    }
}

// Populate form with event data
function populateForm(event) {
    document.getElementById('eventId').value = event.id;
    document.getElementById('eventTitle').value = event.title || '';
    document.getElementById('eventDescription').value = event.description || '';
    document.getElementById('eventAgenda').value = event.agenda || '';
    document.getElementById('eventDate').value = event.event_date ? event.event_date.split('T')[0] : '';
    document.getElementById('eventTime').value = event.event_time || '';
    document.getElementById('eventLocation').value = event.location || '';
    document.getElementById('maxAttendees').value = event.max_attendees || 100;
    document.getElementById('eventKV').value = event.event_kv || '';
    document.getElementById('isExclusive').checked = event.is_exclusive || false;
    document.getElementById('accessCode').value = event.access_code || '';
    
    // Show/hide access code group
    const accessCodeGroup = document.getElementById('accessCodeGroup');
    accessCodeGroup.style.display = event.is_exclusive ? 'block' : 'none';
    
    // Document upload settings
    document.getElementById('allowDocuments').checked = event.allow_documents !== false; // Default to true
    document.getElementById('allowedFileTypes').value = event.allowed_file_types || '.pdf,.doc,.docx,.jpg,.jpeg,.png,.gif';
    document.getElementById('maxFileSize').value = event.max_file_size || 10;
    document.getElementById('maxFiles').value = event.max_files || 5;
    
    // Show/hide document settings
    const documentSettings = document.getElementById('documentSettings');
    documentSettings.style.display = event.allow_documents !== false ? 'block' : 'none';
    
    // Show existing image if available
    if (event.event_kv && event.event_kv.startsWith('/uploads/')) {
        const previewImage = document.getElementById('previewImage');
        const imagePreview = document.getElementById('imagePreview');
        const uploadArea = document.getElementById('uploadArea');
        
        previewImage.src = event.event_kv;
        imagePreview.style.display = 'block';
        uploadArea.style.display = 'none';
    }
    
    // Populate custom fields
    if (event.custom_fields) {
        populateCustomFields(event.custom_fields);
    }
}

// Populate custom fields
function populateCustomFields(customFields) {
    const container = document.getElementById('customFieldsContainer');
    container.innerHTML = '';
    
    Object.entries(customFields).forEach(([name, type]) => {
        addCustomField(name, type);
    });
}

// Handle form submission
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const submitBtn = document.getElementById('submitBtn');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
    submitBtn.disabled = true;
    
    try {
        const formData = new FormData(e.target);
        
        // Add custom fields
        const customFields = {};
        const fieldNames = document.querySelectorAll('.field-name');
        const fieldTypes = document.querySelectorAll('.field-type');
        
        fieldNames.forEach((nameInput, index) => {
            if (nameInput.value.trim()) {
                customFields[nameInput.value.trim()] = fieldTypes[index].value;
            }
        });
        
        formData.append('custom_fields', JSON.stringify(customFields));
        
        // Determine URL and method
        const url = isEditMode ? `/api/admin/events/${currentEventId}` : '/api/admin/events';
        const method = isEditMode ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            body: formData
        });
        
        if (response.ok) {
            const message = isEditMode ? 'Event updated successfully!' : 'Event created successfully!';
            showNotification(message, 'success');
            
            // Redirect back to admin dashboard
            setTimeout(() => {
                window.location.href = '/admin.html';
            }, 1500);
        } else {
            const error = await response.json();
            showNotification(error.error || 'Failed to save event', 'error');
        }
    } catch (error) {
        console.error('Error saving event:', error);
        showNotification('Failed to save event', 'error');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Add custom field
function addCustomField(name = '', type = 'text') {
    const container = document.getElementById('customFieldsContainer');
    const fieldRow = document.createElement('div');
    fieldRow.className = 'custom-field-row';
    fieldRow.innerHTML = `
        <input type="text" class="field-name" placeholder="Field name (e.g., Company, Phone)" value="${name}">
        <select class="field-type">
            <option value="text" ${type === 'text' ? 'selected' : ''}>Text</option>
            <option value="email" ${type === 'email' ? 'selected' : ''}>Email</option>
            <option value="tel" ${type === 'tel' ? 'selected' : ''}>Phone</option>
            <option value="url" ${type === 'url' ? 'selected' : ''}>Website</option>
            <option value="textarea" ${type === 'textarea' ? 'selected' : ''}>Long Text</option>
        </select>
        <button type="button" class="remove-field" onclick="removeCustomField(this)">
            <i class="fas fa-trash"></i>
        </button>
    `;
    container.appendChild(fieldRow);
}

// Remove custom field
function removeCustomField(button) {
    button.closest('.custom-field-row').remove();
}

// Cancel form
function cancelForm() {
    if (confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
        window.location.href = '/admin.html';
    }
}

// Show notification
function showNotification(message, type = 'info') {
    const container = document.getElementById('notificationContainer');
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    container.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
} 