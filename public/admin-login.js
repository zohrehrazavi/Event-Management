// Admin Login JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.querySelector('.login-btn');

    // Handle form submission
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();
        
        if (!username || !password) {
            showError('Please fill in all fields');
            return;
        }
        
        // Show loading state
        setLoadingState(true);
        
        try {
            const response = await fetch('/api/admin/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Login successful
                showSuccess('Login successful! Redirecting...');
                setTimeout(() => {
                    window.location.href = '/admin.html';
                }, 1500);
            } else {
                // Login failed
                showError(data.error || 'Invalid username or password');
            }
        } catch (error) {
            console.error('Login error:', error);
            showError('Connection error. Please try again.');
        } finally {
            setLoadingState(false);
        }
    });

    // Clear error on input
    usernameInput.addEventListener('input', clearError);
    passwordInput.addEventListener('input', clearError);
});

// Toggle password visibility
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleBtn = document.querySelector('.toggle-password i');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleBtn.className = 'fas fa-eye-slash';
    } else {
        passwordInput.type = 'password';
        toggleBtn.className = 'fas fa-eye';
    }
}

// Show error message
function showError(message) {
    clearError();
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <span>${message}</span>
    `;
    
    const form = document.getElementById('loginForm');
    form.insertBefore(errorDiv, form.firstChild);
}

// Clear error message
function clearError() {
    const errorMessage = document.querySelector('.error-message');
    if (errorMessage) {
        errorMessage.remove();
    }
}

// Show success message
function showSuccess(message) {
    clearError();
    
    const successDiv = document.createElement('div');
    successDiv.className = 'error-message';
    successDiv.style.background = '#e8f5e8';
    successDiv.style.borderColor = '#b3e6b3';
    successDiv.style.color = '#2d5a2d';
    successDiv.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
    `;
    
    const form = document.getElementById('loginForm');
    form.insertBefore(successDiv, form.firstChild);
}

// Set loading state
function setLoadingState(loading) {
    const loginBtn = document.querySelector('.login-btn');
    const btnText = loginBtn.querySelector('span') || loginBtn;
    
    if (loading) {
        loginBtn.classList.add('loading');
        loginBtn.disabled = true;
        btnText.innerHTML = '<i class="fas fa-spinner"></i> Signing In...';
    } else {
        loginBtn.classList.remove('loading');
        loginBtn.disabled = false;
        btnText.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign In';
    }
} 