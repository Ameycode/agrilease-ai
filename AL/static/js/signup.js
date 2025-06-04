document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('signupForm');
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    const toggleButtons = document.querySelectorAll('.toggle-password');

    // Toggle password visibility
    toggleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const input = this.previousElementSibling;
            const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
            input.setAttribute('type', type);
            this.classList.toggle('fa-eye');
            this.classList.toggle('fa-eye-slash');
        });
    });

    // Form validation
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Reset error states
        clearErrors();

        // Get form values
        const name = document.getElementById('name').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm_password').value;

        // Validate inputs
        let isValid = true;

        // Name validation
        if (name.length < 2) {
            showError('name', 'Name must be at least 2 characters long');
            isValid = false;
        }

        // Phone validation
        if (!/^[0-9]{10}$/.test(phone)) {
            showError('phone', 'Please enter a valid 10-digit phone number');
            isValid = false;
        }

        // Password validation
        if (password.length < 8) {
            showError('password', 'Password must be at least 8 characters long');
            isValid = false;
        }

        // Confirm password validation
        if (password !== confirmPassword) {
            showError('confirm_password', 'Passwords do not match');
            isValid = false;
        }

        if (!isValid) return;

        // Show loading state
        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.innerHTML;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';
        submitButton.disabled = true;

        try {
            // Send data to server
            const response = await fetch('/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name,
                    phone,
                    password
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Show success message
                showNotification('Account created successfully! Redirecting...', 'success');
                
                // Redirect to login page after 2 seconds
                setTimeout(() => {
                    window.location.href = '/login';
                }, 2000);
            } else {
                // Show error message
                showNotification(data.message || 'An error occurred. Please try again.', 'error');
            }
        } catch (error) {
            showNotification('An error occurred. Please try again.', 'error');
        } finally {
            // Reset button state
            submitButton.innerHTML = originalText;
            submitButton.disabled = false;
        }
    });

    // Helper functions
    function showError(fieldId, message) {
        const inputGroup = document.getElementById(fieldId).closest('.input-group');
        inputGroup.classList.add('error');
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        inputGroup.parentNode.appendChild(errorDiv);
    }

    function clearErrors() {
        document.querySelectorAll('.error-message').forEach(error => error.remove());
        document.querySelectorAll('.input-group.error').forEach(input => input.classList.remove('error'));
    }

    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}); 