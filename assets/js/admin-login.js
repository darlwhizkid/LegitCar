// Admin Login JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('adminLoginForm');
    const passwordToggle = document.querySelector('.password-toggle');
    
    // Password toggle functionality
    if (passwordToggle) {
        passwordToggle.addEventListener('click', function() {
            const passwordInput = document.getElementById('adminPassword');
            const icon = this.querySelector('i');
            
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                passwordInput.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    }
    
    // Login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('adminEmail').value.trim();
            const password = document.getElementById('adminPassword').value;
            
            if (!email || !password) {
                showNotification('Please fill in all fields', 'error');
                return;
            }
            
            // Show loading state
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
            
            try {
                // For now, use hardcoded admin credentials
                // Replace this with actual API call to your backend
                if (await authenticateAdmin(email, password)) {
                    // Store admin session
                    localStorage.setItem('adminToken', 'admin-token-' + Date.now());
                    localStorage.setItem('adminUser', JSON.stringify({
                        email: email,
                        name: 'Administrator',
                        loginTime: new Date().toISOString()
                    }));
                    
                    showNotification('Login successful! Redirecting...', 'success');
                    
                    // Redirect to admin dashboard
                    setTimeout(() => {
                        window.location.href = 'admin-dashboard.html';
                    }, 1500);
                } else {
                    throw new Error('Invalid credentials');
                }
                
            } catch (error) {
                console.error('Admin login error:', error);
                showNotification('Invalid email or password', 'error');
            } finally {
                // Reset button state
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        });
    }
});

// Admin authentication function
async function authenticateAdmin(email, password) {
    try {
        // Try to authenticate with your backend first
        const response = await fetch('https://propamit-backend.vercel.app/api/admin/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        if (response.ok) {
            const data = await response.json();
            return data.success;
        }
    } catch (error) {
        console.log('Backend not available, using fallback authentication');
    }
    
    // Fallback: Hardcoded admin credentials (CHANGE THESE!)
    const adminCredentials = [
        { email: 'admin@propamit.com', password: 'admin123' },
        { email: 'darlingtonodom@gmail.com', password: 'Coldwizkid' }, // Your email
        { email: 'support@propamit.com', password: 'support123' }
    ];
    
    return adminCredentials.some(admin => 
        admin.email === email && admin.password === password
    );
}

// Notification function
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.admin-notification');
    existingNotifications.forEach(notif => notif.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `admin-notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Add styles if they don't exist
    if (!document.querySelector('#admin-notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'admin-notification-styles';
        styles.textContent = `
            .admin-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                border-radius: 8px;
                color: white;
                font-weight: 500;
                z-index: 10000;
                transform: translateX(400px);
                transition: transform 0.3s ease;
                max-width: 350px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            }
            .admin-notification.success { background-color: #10b981; }
            .admin-notification.error { background-color: #ef4444; }
            .admin-notification.info { background-color: #3b82f6; }
            .admin-notification.warning { background-color: #f59e0b; }
            .admin-notification.show { transform: translateX(0); }
            .notification-content { display: flex; justify-content: space-between; align-items: center; }
            .notification-close { 
                background: none; 
                border: none; 
                color: white; 
                font-size: 18px; 
                cursor: pointer; 
                margin-left: 10px;
                padding: 0;
                line-height: 1;
            }
            .notification-close:hover { opacity: 0.8; }
        `;
        document.head.appendChild(styles);
    }
    
    document.body.appendChild(notification);
    
    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    });
    
    // Show notification
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Hide notification after 5 seconds
    setTimeout(() => {
        if (notification.classList.contains('show')) {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }
    }, 5000);
}