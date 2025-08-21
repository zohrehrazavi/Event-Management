// Global variables
let allEvents = [];

// DOM elements
const eventsGrid = document.getElementById('eventsGrid');

// Load events when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadEvents();
    
    // Add search input event listener
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            searchEvents();
        });
    }
});

// Load events from API
async function loadEvents() {
    try {
        const response = await fetch('/api/events');
        const events = await response.json();
        allEvents = events;
        displayEvents(events);
    } catch (error) {
        console.error('Error loading events:', error);
        displayError('Failed to load events. Please try again later.');
    }
}

// Display events in the grid
function displayEvents(events) {
    const eventsGrid = document.getElementById('eventsGrid');
    
    if (!events || events.length === 0) {
        eventsGrid.innerHTML = `
            <div class="no-events">
                <i class="fas fa-calendar-times"></i>
                <h3>No events found</h3>
                <p>Try adjusting your search criteria or check back later for new events.</p>
            </div>
        `;
        return;
    }
    
    eventsGrid.innerHTML = events.map(event => `
        <div class="event-card">
            <div class="event-header">
                <h3 class="event-title">${event.title}</h3>
                <span class="event-date">${formatEventDate(event.event_date, event.event_time)}</span>
            </div>
            
            <p class="event-description">${event.description}</p>
            
            <div class="event-details">
                <div class="event-detail">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${event.location}</span>
                </div>
                <div class="event-detail">
                    <i class="fas fa-users"></i>
                    <span>${event.attendee_count || 0} registered / ${event.max_attendees} max</span>
                </div>
            </div>
            
            <div class="event-stats">
                <div class="attendee-count">
                    <i class="fas fa-check-circle"></i>
                    <span>${event.attendee_count || 0} attendees</span>
                </div>
                ${event.is_exclusive ? `
                    <div class="exclusive-event-controls" data-event-id="${event.id}">
                        <div class="access-code-input-group" style="display: none;">
                            <input 
                                type="text" 
                                class="access-code-input" 
                                placeholder="Enter access code"
                            />
                            <button class="verify-access-btn" onclick="verifyAccessCode(${event.id})">
                                <i class="fas fa-unlock"></i>
                                Verify
                            </button>
                        </div>
                        <div class="access-error" style="display: none;">
                            <i class="fas fa-exclamation-circle"></i>
                            <span>Invalid access code</span>
                        </div>
                        <button class="register-button exclusive" onclick="showAccessCodeInput(${event.id})">
                            <i class="fas fa-lock"></i>
                            Enter Access Code
                        </button>
                    </div>
                ` : `
                    <a href="/event/${event.id}" class="register-button">
                        Register Now
                    </a>
                `}
            </div>
        </div>
    `).join('');
}

// Search events
function searchEvents() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    
    if (!searchTerm) {
        displayEvents(allEvents);
        return;
    }
    
    const filteredEvents = allEvents.filter(event => 
        event.title.toLowerCase().includes(searchTerm) ||
        event.description.toLowerCase().includes(searchTerm) ||
        event.location.toLowerCase().includes(searchTerm)
    );
    
    displayEvents(filteredEvents);
}

// Format event date and time
function formatEventDate(date, time) {
    const eventDate = new Date(date + 'T' + time);
    const options = { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return eventDate.toLocaleDateString('en-US', options);
}

// Display error message
function displayError(message) {
    const eventsGrid = document.getElementById('eventsGrid');
    eventsGrid.innerHTML = `
        <div class="no-events">
            <i class="fas fa-exclamation-triangle"></i>
            <h3>Error</h3>
            <p>${message}</p>
        </div>
    `;
}

// Show access code input for exclusive events
function showAccessCodeInput(eventId) {
    const exclusiveControls = document.querySelector(`.exclusive-event-controls[data-event-id="${eventId}"]`);
    const accessInputGroup = exclusiveControls.querySelector('.access-code-input-group');
    const accessButton = exclusiveControls.querySelector('.register-button.exclusive');
    const accessInput = exclusiveControls.querySelector('.access-code-input');
    const accessError = exclusiveControls.querySelector('.access-error');
    
    // Hide the button and show the input
    accessButton.style.display = 'none';
    accessButton.classList.add('hidden');
    
    accessInputGroup.style.display = 'flex';
    accessError.style.display = 'none'; // Hide any previous error
    accessInput.focus();
    
    // Add Enter key listener
    accessInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            verifyAccessCode(eventId);
        }
    });
    
    // Add click outside listener to hide input and show button
    const clickOutsideHandler = function(e) {
        // Check if click is outside the access code input group and not on the original button
        if (!accessInputGroup.contains(e.target) && !accessButton.contains(e.target)) {
            // Hide the input and show the button
            accessInputGroup.style.display = 'none';
            accessButton.style.display = 'flex';
            accessButton.classList.remove('hidden');
            accessError.style.display = 'none';
            accessInput.value = ''; // Clear the input
            
            // Remove the click outside listener
            document.removeEventListener('click', clickOutsideHandler);
        }
    };
    
    // Add the click outside listener with a small delay to avoid immediate trigger
    setTimeout(() => {
        document.addEventListener('click', clickOutsideHandler);
    }, 100);
}

// Verify access code for exclusive events
async function verifyAccessCode(eventId) {
    const exclusiveControls = document.querySelector(`.exclusive-event-controls[data-event-id="${eventId}"]`);
    const accessInput = exclusiveControls.querySelector('.access-code-input');
    const accessError = exclusiveControls.querySelector('.access-error');
    const accessCode = accessInput.value.trim();
    
    if (!accessCode) {
        showAccessError(exclusiveControls, 'Please enter an access code');
        return;
    }
    
    try {
        const response = await fetch(`/api/events/${eventId}/verify-access`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ accessCode })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            // Hide error if visible
            accessError.style.display = 'none';
            
            // Show success and redirect to event page
            showNotification('Access granted! Redirecting to event page...', 'success');
            
            // Redirect to event page after a short delay
            setTimeout(() => {
                window.location.href = `/event/${eventId}`;
            }, 1500);
            
        } else {
            showAccessError(exclusiveControls, result.error || 'Invalid access code');
        }
    } catch (error) {
        console.error('Error verifying access code:', error);
        showAccessError(exclusiveControls, 'Error verifying access code. Please try again.');
    }
}

// Show access error with shake animation
function showAccessError(exclusiveControls, message) {
    const accessError = exclusiveControls.querySelector('.access-error');
    const errorSpan = accessError.querySelector('span');
    errorSpan.textContent = message;
    accessError.style.display = 'flex';
    
    // Add shake animation
    accessError.style.animation = 'none';
    accessError.offsetHeight; // Trigger reflow
    accessError.style.animation = 'shake 0.5s ease-in-out';
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'error' ? 'exclamation-circle' : type === 'success' ? 'check-circle' : 'info-circle'}"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add styles
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
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
} 