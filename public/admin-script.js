// Admin Dashboard JavaScript
let currentEvents = [];
let currentAttendees = [];
let currentVendors = [];
let currentEventId = null;

// DOM elements
const pageTitle = document.getElementById('pageTitle');
const pageDescription = document.getElementById('pageDescription');
const navItems = document.querySelectorAll('.nav-item');
const contentSections = document.querySelectorAll('.content-section');

// Initialize admin dashboard
document.addEventListener('DOMContentLoaded', function() {
    setupNavigation();
    loadEvents();
    setupEventListeners();
});

// Setup navigation
function setupNavigation() {
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all nav items
            navItems.forEach(nav => nav.classList.remove('active'));
            
            // Add active class to clicked item
            this.classList.add('active');
            
            // Show corresponding section
            const section = this.getAttribute('data-section');
            showSection(section);
        });
    });
}

// Show section
function showSection(sectionName) {
    // Hide all sections
    contentSections.forEach(section => section.classList.remove('active'));
    
    // Show target section
    const targetSection = document.getElementById(sectionName);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Update page title and description
    updatePageInfo(sectionName);
    
    // Load section-specific data
    switch(sectionName) {
        case 'events':
            loadEvents();
            break;
        case 'attendees':
            loadAttendees();
            break;
        case 'vendors':
            loadVendors();
            break;
        case 'analytics':
            loadAnalytics();
            break;
    }
}

// Update page information
function updatePageInfo(section) {
    const titles = {
        events: 'Event Management',
        attendees: 'Attendee Management',
        vendors: 'Vendor Management',
        analytics: 'Analytics & Reports'
    };
    
    const descriptions = {
        events: 'Create and manage your events',
        attendees: 'View and manage event attendees',
        vendors: 'Manage vendors for your events',
        analytics: 'View analytics and generate reports'
    };
    
    pageTitle.textContent = titles[section] || 'Event Management';
    pageDescription.textContent = descriptions[section] || 'Create and manage your events';
}

// Setup event listeners
function setupEventListeners() {

    

    
    // Add vendor form
    const addVendorForm = document.getElementById('addVendorForm');
    if (addVendorForm) {
        addVendorForm.addEventListener('submit', handleAddVendor);
    }
    
    // Tab functionality
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tab = this.getAttribute('data-tab');
            switchTab(tab);
        });
    });
    

}





// Load events
async function loadEvents() {
    try {
        const response = await fetch('/api/admin/events');
        currentEvents = await response.json();
        displayEventsTable(currentEvents);
    } catch (error) {
        console.error('Error loading events:', error);
        showNotification('Error loading events', 'error');
    }
}

// Display events table
function displayEventsTable(events) {
    const tbody = document.getElementById('eventsTableBody');
    
    tbody.innerHTML = events.map(event => `
        <tr>
            <td>
                <div>
                    <strong>${event.title}</strong>
                    <br>
                    <small>${event.description || 'No description'}</small>
                </div>
            </td>
            <td>
                <div>
                    <strong>${formatDate(event.event_date)}</strong>
                    <br>
                    <small>${formatTime(event.event_time)}</small>
                </div>
            </td>
            <td>${event.location || 'TBD'}</td>
            <td>
                <strong>${event.current_attendees}</strong>
                ${event.max_attendees ? `/ ${event.max_attendees}` : ''}
            </td>
            <td>
                <span class="status-badge ${getEventStatus(event)}">
                    ${getEventStatusText(event)}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-primary" onclick="viewEventDetails(${event.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-secondary" onclick="editEvent(${event.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger" onclick="deleteEvent(${event.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Load attendees
async function loadAttendees() {
    try {
        const response = await fetch('/api/admin/attendees');
        currentAttendees = await response.json();
        displayAttendeesTable(currentAttendees);
        populateEventFilter();
    } catch (error) {
        console.error('Error loading attendees:', error);
        showNotification('Error loading attendees', 'error');
    }
}

// Display attendees table
function displayAttendeesTable(attendees) {
    const tbody = document.getElementById('attendeesTableBody');
    
    tbody.innerHTML = attendees.map(attendee => {
        // Get display name from custom data or standard fields
        let displayName = 'Anonymous';
        if (attendee.first_name && attendee.last_name) {
            displayName = `${attendee.first_name} ${attendee.last_name}`;
        } else if (attendee.first_name) {
            displayName = attendee.first_name;
        } else if (attendee.custom_data) {
            const customData = typeof attendee.custom_data === 'string' ? JSON.parse(attendee.custom_data) : attendee.custom_data;
            displayName = customData['Full Name'] || customData['Name'] || customData['First Name'] || 'Anonymous';
        }
        
        // Get email from custom data or standard field
        let displayEmail = attendee.email || 'No email';
        if (!displayEmail || displayEmail === 'No email') {
            if (attendee.custom_data) {
                const customData = typeof attendee.custom_data === 'string' ? JSON.parse(attendee.custom_data) : attendee.custom_data;
                displayEmail = customData['Email'] || customData['Email Address'] || 'No email';
            }
        }
        
        return `
            <tr>
                <td>
                    <strong>${displayName}</strong>
                </td>
                <td>${displayEmail}</td>
                <td>${getEventTitle(attendee.event_id)}</td>
                <td>${attendee.company || 'N/A'}</td>
                <td>${formatDate(attendee.registration_date)}</td>
                <td>
                    ${attendee.documents && attendee.documents.length > 0 
                        ? `<span class="document-count">${attendee.documents.length} files</span>`
                        : 'No documents'
                    }
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-primary" onclick="viewAttendeeDetails(${attendee.id})">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-danger" onclick="deleteAttendee(${attendee.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// Load vendors
async function loadVendors() {
    try {
        const response = await fetch('/api/admin/vendors');
        currentVendors = await response.json();
        displayVendorsGrid(currentVendors);
        populateVendorEventSelect();
    } catch (error) {
        console.error('Error loading vendors', error);
        showNotification('Error loading vendors', 'error');
    }
}

// Display vendors grid
function displayVendorsGrid(vendors) {
    const grid = document.getElementById('vendorsGrid');
    
    grid.innerHTML = vendors.map(vendor => `
        <div class="vendor-card">
            <div class="vendor-header">
                <h3 class="vendor-name">${vendor.name}</h3>
                <span class="vendor-event">${getEventTitle(vendor.event_id)}</span>
            </div>
            <p class="vendor-description">${vendor.description || 'No description available'}</p>
            <div class="vendor-details">
                ${vendor.contact_person ? `
                    <div class="vendor-detail">
                        <i class="fas fa-user"></i>
                        <span>${vendor.contact_person}</span>
                    </div>
                ` : ''}
                ${vendor.contact_email ? `
                    <div class="vendor-detail">
                        <i class="fas fa-envelope"></i>
                        <span>${vendor.contact_email}</span>
                    </div>
                ` : ''}
                ${vendor.contact_phone ? `
                    <div class="vendor-detail">
                        <i class="fas fa-phone"></i>
                        <span>${vendor.contact_phone}</span>
                    </div>
                ` : ''}
                ${vendor.booth_number ? `
                    <div class="vendor-detail">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>Booth ${vendor.booth_number}</span>
                    </div>
                ` : ''}
            </div>
            <div class="action-buttons">
                <button class="btn btn-primary" onclick="viewVendorDetails(${vendor.id})">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-secondary" onclick="editVendor(${vendor.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger" onclick="deleteVendor(${vendor.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// Load analytics
async function loadAnalytics() {
    try {
        // This would typically load chart data
        // For now, we'll show placeholder charts
        showAnalyticsPlaceholder();
    } catch (error) {
        console.error('Error loading analytics:', error);
        showNotification('Error loading analytics', 'error');
    }
}

// Show analytics placeholder
function showAnalyticsPlaceholder() {
    const eventChart = document.getElementById('eventChart');
    const registrationChart = document.getElementById('registrationChart');
    
    if (eventChart) {
        eventChart.getContext('2d').fillText('Event Performance Chart', 10, 50);
    }
    
    if (registrationChart) {
        registrationChart.getContext('2d').fillText('Registration Trends Chart', 10, 50);
    }
}



function openAddVendorModal() {
    document.getElementById('addVendorModal').classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeAddVendorModal() {
    document.getElementById('addVendorModal').classList.remove('show');
    document.body.style.overflow = 'auto';
    document.getElementById('addVendorForm').reset();
}



// Handle add vendor
async function handleAddVendor(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const vendorData = Object.fromEntries(formData.entries());
    
    // Convert services string to array
    if (vendorData.services) {
        vendorData.services = vendorData.services.split(',').map(s => s.trim()).filter(s => s);
    }
    
    try {
        const response = await fetch('/api/admin/vendors', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(vendorData)
        });
        
        if (response.ok) {
            showNotification('Vendor added successfully!', 'success');
            closeAddVendorModal();
            loadVendors();
            loadDashboardData();
        } else {
            const error = await response.json();
            showNotification(error.error || 'Failed to add vendor', 'error');
        }
    } catch (error) {
        console.error('Error adding vendor:', error);
        showNotification('Failed to add vendor', 'error');
    }
}

// Custom field functions
function addCustomField() {
    const container = document.getElementById('customFieldsContainer');
    const fieldDiv = document.createElement('div');
    fieldDiv.className = 'custom-field';
    fieldDiv.innerHTML = `
        <input type="text" placeholder="Field Name" class="field-name">
        <select class="field-type">
            <option value="text">Text</option>
            <option value="email">Email</option>
            <option value="number">Number</option>
            <option value="select">Dropdown</option>
        </select>
        <button type="button" class="remove-field" onclick="removeCustomField(this)">
            <i class="fas fa-trash"></i>
        </button>
    `;
    container.appendChild(fieldDiv);
}

function removeCustomField(button) {
    button.parentElement.remove();
}

// Populate event filter
function populateEventFilter() {
    const filter = document.getElementById('eventFilter');
    if (!filter) return;
    
    const options = currentEvents.map(event => 
        `<option value="${event.id}">${event.title}</option>`
    ).join('');
    
    filter.innerHTML = '<option value="">All Events</option>' + options;
}

// Populate vendor event select
function populateVendorEventSelect() {
    const select = document.getElementById('vendorEvent');
    if (!select) return;
    
    const options = currentEvents.map(event => 
        `<option value="${event.id}">${event.title}</option>`
    ).join('');
    
    select.innerHTML = '<option value="">Select Event</option>' + options;
}

// Filter attendees
function filterAttendees() {
    const eventId = document.getElementById('eventFilter').value;
    const filtered = eventId 
        ? currentAttendees.filter(attendee => attendee.event_id == eventId)
        : currentAttendees;
    
    displayAttendeesTable(filtered);
}

// View event details
async function viewEventDetails(eventId) {
    currentEventId = eventId;
    
    try {
        const [event, attendees, vendors] = await Promise.all([
            fetch(`/api/events/${eventId}`).then(res => res.json()),
            fetch(`/api/events/${eventId}/attendees`).then(res => res.json()),
            fetch(`/api/events/${eventId}/vendors`).then(res => res.json())
        ]);
        
        // Populate modal
        document.getElementById('eventDetailsTitle').textContent = event.title;
        document.getElementById('eventDetailsName').textContent = event.title;
        document.getElementById('eventDetailsDate').textContent = formatDate(event.event_date);
        document.getElementById('eventDetailsDescription').textContent = event.description || 'No description';
        document.getElementById('eventDetailsLocation').textContent = event.location || 'TBD';
        document.getElementById('eventDetailsAttendees').textContent = `${Array.isArray(attendees) ? attendees.length : 0} attendees`;
        document.getElementById('eventDetailsVendors').textContent = `${Array.isArray(vendors) ? vendors.length : 0} vendors`;
        document.getElementById('eventKVUpdate').value = event.event_kv || '';
        
        // Populate attendees tab
        const attendeesList = document.getElementById('eventAttendeesList');
        if (attendees && Array.isArray(attendees)) {
            attendeesList.innerHTML = attendees.length > 0 ? attendees.map(attendee => {
                // Get display name from custom data or standard fields
                let displayName = 'Anonymous';
                if (attendee.first_name && attendee.last_name) {
                    displayName = `${attendee.first_name} ${attendee.last_name}`;
                } else if (attendee.first_name) {
                    displayName = attendee.first_name;
                } else if (attendee.custom_data) {
                    const customData = typeof attendee.custom_data === 'string' ? JSON.parse(attendee.custom_data) : attendee.custom_data;
                    displayName = customData['Full Name'] || customData['Name'] || customData['First Name'] || 'Anonymous';
                }
                
                // Get email from custom data or standard field
                let displayEmail = attendee.email || 'No email';
                if (!displayEmail || displayEmail === 'No email') {
                    if (attendee.custom_data) {
                        const customData = typeof attendee.custom_data === 'string' ? JSON.parse(attendee.custom_data) : attendee.custom_data;
                        displayEmail = customData['Email'] || customData['Email Address'] || 'No email';
                    }
                }
                
                return `
                    <div class="list-item">
                        <div class="list-item-info">
                            <h4>${displayName}</h4>
                            <p>${displayEmail} • ${attendee.company || 'No company'}</p>
                        </div>
                        <span>${formatDate(attendee.registration_date)}</span>
                    </div>
                `;
            }).join('') : '<div class="list-item"><p>No attendees registered yet</p></div>';
        } else {
            attendeesList.innerHTML = '<div class="list-item"><p>Error loading attendees</p></div>';
        }
        
        // Populate vendors tab
        const vendorsList = document.getElementById('eventVendorsList');
        if (vendors && Array.isArray(vendors)) {
            vendorsList.innerHTML = vendors.length > 0 ? vendors.map(vendor => `
                <div class="list-item">
                    <div class="list-item-info">
                        <h4>${vendor.name}</h4>
                        <p>${vendor.description || 'No description'}</p>
                    </div>
                    <span>${vendor.booth_number ? `Booth ${vendor.booth_number}` : 'No booth'}</span>
                </div>
            `).join('') : '<div class="list-item"><p>No vendors assigned yet</p></div>';
        } else {
            vendorsList.innerHTML = '<div class="list-item"><p>Error loading vendors</p></div>';
        }
        
        // Show modal
        document.getElementById('eventDetailsModal').classList.add('show');
        document.body.style.overflow = 'hidden';
        
    } catch (error) {
        console.error('Error loading event details:', error);
        showNotification('Error loading event details', 'error');
    }
}

// Close event details modal
function closeEventDetailsModal() {
    document.getElementById('eventDetailsModal').classList.remove('show');
    document.body.style.overflow = 'auto';
}

// Switch tabs
function switchTab(tabName) {
    // Remove active class from all tabs and panels
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));
    
    // Add active class to selected tab and panel
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(`${tabName}Tab`).classList.add('active');
}

// Update event KV
async function updateEventKV() {
    const kvUrl = document.getElementById('eventKVUpdate').value;
    
    try {
        const response = await fetch(`/api/events/${currentEventId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ event_kv: kvUrl })
        });
        
        if (response.ok) {
            showNotification('Event KV updated successfully!', 'success');
        } else {
            showNotification('Failed to update event KV', 'error');
        }
    } catch (error) {
        console.error('Error updating event KV:', error);
        showNotification('Failed to update event KV', 'error');
    }
}

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatTime(timeString) {
    return timeString.substring(0, 5);
}

function getEventStatus(event) {
    const eventDate = new Date(event.event_date);
    const today = new Date();
    
    if (eventDate < today) return 'completed';
    if (eventDate.getTime() - today.getTime() < 7 * 24 * 60 * 60 * 1000) return 'upcoming';
    return 'active';
}

function getEventStatusText(event) {
    const status = getEventStatus(event);
    const statusTexts = {
        active: 'Active',
        upcoming: 'Upcoming',
        completed: 'Completed'
    };
    return statusTexts[status];
}

function getAttendancePercentage(event) {
    if (!event.max_attendees) return 0;
    return Math.round((event.current_attendees / event.max_attendees) * 100);
}

function getEventTitle(eventId) {
    const event = currentEvents.find(e => e.id == eventId);
    return event ? event.title : 'Unknown Event';
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'error' ? 'exclamation-circle' : 'check-circle'}"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'error' ? '#f56565' : '#48bb78'};
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

// Add CSS for notifications
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    .notification button {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        margin-left: auto;
    }
    
    .attendance-bar {
        width: 100px;
        height: 8px;
        background: #e2e8f0;
        border-radius: 4px;
        overflow: hidden;
    }
    
    .bar-fill {
        height: 100%;
        background: linear-gradient(135deg, #667eea, #764ba2);
        transition: width 0.3s ease;
    }
    
    .document-count {
        background: #667eea;
        color: white;
        padding: 0.25rem 0.5rem;
        border-radius: 10px;
        font-size: 0.8rem;
    }
`;
document.head.appendChild(notificationStyles);

// View attendee details
function viewAttendeeDetails(attendeeId) {
    const attendee = currentAttendees.find(a => a.id === attendeeId);
    if (attendee) {
        alert(`Attendee Details:\nName: ${attendee.first_name} ${attendee.last_name}\nEmail: ${attendee.email}\nCompany: ${attendee.company || 'N/A'}\nPhone: ${attendee.phone || 'N/A'}`);
    }
}

// Edit vendor
function editVendor(vendorId) {
    const vendor = currentVendors.find(v => v.id === vendorId);
    if (vendor) {
        alert(`Edit Vendor:\nName: ${vendor.name}\nContact: ${vendor.contact_person || 'N/A'}\nEmail: ${vendor.contact_email || 'N/A'}`);
        // TODO: Implement edit modal
    }
}

// Delete event
function deleteEvent(eventId) {
    if (confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
        fetch(`/api/admin/events/${eventId}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (response.ok) {
                showNotification('Event deleted successfully', 'success');
                loadEvents();
            } else {
                return response.json();
            }
        })
        .then(data => {
            if (data && data.error) {
                showNotification(data.error, 'error');
            }
        })
        .catch(error => {
            console.error('Error deleting event:', error);
            showNotification('Failed to delete event', 'error');
        });
    }
}

// Delete vendor
function deleteVendor(vendorId) {
    if (confirm('Are you sure you want to delete this vendor?')) {
        // TODO: Implement delete API call
        showNotification('Vendor deleted successfully', 'success');
        loadVendors();
    }
}

// Delete attendee
function deleteAttendee(attendeeId) {
    if (confirm('Are you sure you want to delete this attendee?')) {
        // TODO: Implement delete API call
        showNotification('Attendee deleted successfully', 'success');
        loadAttendees();
    }
}

// Edit event
function editEvent(eventId) {
    // Redirect to event manager page with edit parameter
    window.location.href = `/event-manager?edit=${eventId}`;
}

// Update event KV
function updateEventKV() {
    const eventKV = document.getElementById('eventKVUpdate').value;
    if (!eventKV) {
        showNotification('Please enter an event KV URL', 'error');
        return;
    }
    
    if (!currentEventId) {
        showNotification('No event selected', 'error');
        return;
    }
    
    fetch(`/api/admin/events/${currentEventId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ event_kv: eventKV })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            showNotification(data.error, 'error');
        } else {
            showNotification('Event KV updated successfully', 'success');
            closeEventDetailsModal();
        }
    })
    .catch(error => {
        console.error('Error updating event KV:', error);
        showNotification('Error updating event KV', 'error');
    });
}

