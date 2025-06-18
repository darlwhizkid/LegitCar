// Login Page JavaScript - Production Ready

// Wait for API_CONFIG to be loaded
function waitForConfig() {
  return new Promise((resolve) => {
    if (window.API_CONFIG) {
      resolve();
    } else {
      setTimeout(() => waitForConfig().then(resolve), 100);
    }
  });
}

// Initialize propamitAPI after config is loaded
let propamitAPI = null;

// Initialize API when config is ready
waitForConfig().then(() => {
  propamitAPI = {
    baseURL: API_CONFIG.BASE_URL,
    
    isAuthenticated: () => {
      const token = localStorage.getItem('userToken');
      const expiry = localStorage.getItem('tokenExpiry');
      
      if (!token || !expiry) return false;
      
      // Check if token is expired
      if (new Date().getTime() > parseInt(expiry)) {
        localStorage.removeItem('userToken');
        localStorage.removeItem('tokenExpiry');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userName');
        return false;
      }
      
      return true;
    },

    login: async (credentials) => {
      try {
        const response = await fetch(`${propamitAPI.baseURL}${API_CONFIG.ENDPOINTS.LOGIN}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({action: "login", ...credentials})
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Login failed');
        }

        // Store authentication data
        if (data.token) {
          localStorage.setItem('userToken', data.token);
          localStorage.setItem('userEmail', data.user.email);
          localStorage.setItem('userName', data.user.name);
          
          // Set token expiry (e.g., 24 hours from now)
          const expiry = new Date().getTime() + (24 * 60 * 60 * 1000);
          localStorage.setItem('tokenExpiry', expiry.toString());
        }

        return { success: true, message: data.message || 'Login successful', user: data.user };
      } catch (error) {
        console.error('Login API error:', error);
        throw new Error(error.message || 'Network error occurred');
      }
    },

    register: async (userData) => {
      try {
        const response = await fetch(`${propamitAPI.baseURL}${API_CONFIG.ENDPOINTS.REGISTER}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({action: "register", ...userData})
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Registration failed');
        }

        return { success: true, message: data.message || 'Registration successful' };
      } catch (error) {
        console.error('Registration API error:', error);
        throw new Error(error.message || 'Network error occurred');
      }
    },

    logout: async () => {
      try {
        const token = localStorage.getItem('userToken');
        if (token) {
          await fetch(`${propamitAPI.baseURL}${API_CONFIG.ENDPOINTS.LOGOUT}`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
        }
      } catch (error) {
        console.error('Logout API error:', error);
      } finally {
        // Clear storage regardless of API call success
        localStorage.removeItem('userToken');
        localStorage.removeItem('tokenExpiry');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userName');
        localStorage.removeItem('userId');
        localStorage.removeItem('lastApplicationId');
      }
    },

    resetPassword: async (email) => {
      try {
        const response = await fetch(`${propamitAPI.baseURL}/api/auth/reset-password`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ email })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to send reset link');
        }

        return { success: true, message: data.message };
      } catch (error) {
        console.error('Reset password error:', error);
        throw error;
      }
    }
  };

  // Make propamitAPI globally available
  window.propamitAPI = propamitAPI;
  console.log('propamitAPI initialized successfully');
  
  // Initialize the login page functionality after API is ready
  initializeLoginPage();
});

// Login page functionality
function initializeLoginPage() {
  console.log('Initializing login page...');
  
  // Check if already authenticated
  if (propamitAPI && propamitAPI.isAuthenticated()) {
    console.log('User already authenticated, redirecting to dashboard');
    window.location.href = 'dashboard.html';
    return;
  }

  // DOM Elements
  const loginTabBtn = document.getElementById('loginTabBtn');
  const registerTabBtn = document.getElementById('registerTabBtn');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const forgotPasswordForm = document.getElementById('forgotPasswordForm');
  
  // Form submit buttons
  const loginSubmitBtn = document.getElementById('loginSubmitBtn');
  const registerSubmitBtn = document.getElementById('registerSubmitBtn');
  const resetSubmitBtn = document.getElementById('resetSubmitBtn');
  
  // Links
  const forgotPasswordLink = document.getElementById('forgotPasswordLink');
  const backToLoginBtn = document.getElementById('backToLoginBtn');
  
  // Password toggle buttons
  const passwordToggles = document.querySelectorAll('.password-toggle');
  
  // Terms checkbox
  const agreeTerms = document.getElementById('agreeTerms');

  // Tab switching functionality
  if (loginTabBtn && registerTabBtn) {
    loginTabBtn.addEventListener('click', () => {
      switchTab('login');
    });

    registerTabBtn.addEventListener('click', () => {
      switchTab('register');
    });
  }

  // Switch tab function
  function switchTab(tab) {
    // Remove active classes
    document.querySelectorAll('.auth-tab').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
    
    if (tab === 'login') {
      loginTabBtn.classList.add('active');
      loginForm.classList.add('active');
    } else if (tab === 'register') {
      registerTabBtn.classList.add('active');
      registerForm.classList.add('active');
    }
    
    // Clear any error messages
    clearErrors();
  }

  // Password toggle functionality
  passwordToggles.forEach(toggle => {
    toggle.addEventListener('click', function() {
      const passwordInput = this.parentElement.querySelector('input[type="password"], input[type="text"]');
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
  });

  // Terms checkbox functionality
  if (agreeTerms && registerSubmitBtn) {
    agreeTerms.addEventListener('change', function() {
      registerSubmitBtn.disabled = !this.checked;
    });
  }

  // Login form submission
  if (loginSubmitBtn) {
    loginSubmitBtn.addEventListener('click', async function(e) {
      e.preventDefault();
      
      const email = document.getElementById('loginEmail').value.trim();
      const password = document.getElementById('loginPassword').value;
      
      // Clear previous errors
      clearErrors();
      
      // Validate inputs
      if (!email || !password) {
        showError('loginEmail', 'Please fill in all fields');
        return;
      }
      
      if (!isValidEmail(email)) {
        showError('loginEmail', 'Please enter a valid email address');
        return;
      }
      
      try {
        // Show loading state
        loginSubmitBtn.disabled = true;
        loginSubmitBtn.textContent = 'Signing in...';
        
        const result = await propamitAPI.login({ email, password });
        
        if (result.success) {
          showNotification('Login successful! Redirecting...', 'success');
          setTimeout(() => {
            window.location.href = 'dashboard.html';
          }, 1500);
        }
      } catch (error) {
        showError('loginPassword', error.message);
        showNotification(error.message, 'error');
      } finally {
        // Reset button state
        loginSubmitBtn.disabled = false;
        loginSubmitBtn.textContent = 'Login';
      }
    });
  }

  // Register form submission
  if (registerSubmitBtn) {
    registerSubmitBtn.addEventListener('click', async function(e) {
      e.preventDefault();
      
      const name = document.getElementById('registerName').value.trim();
      const email = document.getElementById('registerEmail').value.trim();
      const password = document.getElementById('registerPassword').value;
      const confirmPassword = document.getElementById('confirmPassword').value;
      const phone = document.getElementById('registerPhone').value.trim();
      const agreed = document.getElementById('agreeTerms').checked;
      
      // Clear previous errors
      clearErrors();
      
      // Validate inputs
      let hasError = false;
      
      if (!name) {
        showError('registerName', 'Full name is required');
        hasError = true;
      }
      
      if (!email) {
        showError('registerEmail', 'Email is required');
        hasError = true;
      } else if (!isValidEmail(email)) {
        showError('registerEmail', 'Please enter a valid email address');
        hasError = true;
      }
      
      if (!password) {
        showError('registerPassword', 'Password is required');
        hasError = true;
      } else if (password.length < 6) {
        showError('registerPassword', 'Password must be at least 6 characters');
        hasError = true;
      }
      
      if (password !== confirmPassword) {
        showError('confirmPassword', 'Passwords do not match');
        hasError = true;
      }
      
      if (!phone) {
        showError('registerPhone', 'Phone number is required');
        hasError = true;
      }
      
      if (!agreed) {
        showError('agreeTerms', 'You must agree to the terms and conditions');
        hasError = true;
      }
      
      if (hasError) return;
      
      try {
        // Show loading state
        registerSubmitBtn.disabled = true;
        registerSubmitBtn.textContent = 'Creating Account...';
        
        const result = await propamitAPI.register({
          name,
          email,
          password,
          phone
        });
        
        if (result.success) {
          showNotification('Account created successfully! Please login to continue.', 'success');
          setTimeout(() => {
            switchTab('login');
            // Pre-fill email in login form
            document.getElementById('loginEmail').value = email;
          }, 2000);
        }
      } catch (error) {
        showError('registerEmail', error.message);
        showNotification(error.message, 'error');
      } finally {
        // Reset button state
        registerSubmitBtn.disabled = false;
        registerSubmitBtn.textContent = 'Register';
      }
    });
  }

  // Forgot password functionality
  if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Hide other forms
      document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
      forgotPasswordForm.classList.add('active');
    });
  }

  if (backToLoginBtn) {
    backToLoginBtn.addEventListener('click', function(e) {
      e.preventDefault();
      switchTab('login');
    });
  }

  // Reset password form submission
  if (resetSubmitBtn) {
    resetSubmitBtn.addEventListener('click', async function(e) {
      e.preventDefault();
      
      const email = document.getElementById('resetEmail').value.trim();
      
      clearErrors();
      
      if (!email) {
        showError('resetEmail', 'Email is required');
        return;
      }
      
      if (!isValidEmail(email)) {
        showError('resetEmail', 'Please enter a valid email address');
        return;
      }
      
      try {
        resetSubmitBtn.disabled = true;
        resetSubmitBtn.textContent = 'Sending...';
        
        const result = await propamitAPI.resetPassword(email);
        
        if (result.success) {
          showNotification('Password reset link sent to your email', 'success');
          setTimeout(() => {
            switchTab('login');
          }, 2000);
        }
      } catch (error) {
        showError('resetEmail', error.message);
        showNotification(error.message, 'error');
      } finally {
        resetSubmitBtn.disabled = false;
        resetSubmitBtn.textContent = 'Send Reset Link';
      }
    });
  }

  // Social login buttons (placeholder functionality)
  const socialButtons = document.querySelectorAll('.social-button');
  socialButtons.forEach(button => {
    button.addEventListener('click', function() {
      const provider = this.classList.contains('google') ? 'Google' : 'Facebook';
      showNotification(`${provider} login will be available soon`, 'info');
    });
  });

  console.log('Login page initialized successfully');
}

// Helper functions
function showError(fieldId, message) {
  const field = document.getElementById(fieldId);
  if (field) {
    const errorElement = field.parentElement.querySelector('.error-message');
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = 'block';
    }
    field.classList.add('error');
  }
}

function clearErrors() {
  document.querySelectorAll('.error-message').forEach(error => {
    error.textContent = '';
    error.style.display = 'none';
  });
  document.querySelectorAll('.error').forEach(field => {
    field.classList.remove('error');
  });
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function showNotification(message, type = 'info') {
  // Use Utils if available, otherwise create simple notification
  if (window.Utils && window.Utils.showNotification) {
    window.Utils.showNotification(message, type);
  } else {
    // Simple fallback notification
    const notification = document.createElement('div');
    notification.className = `simple-notification notification-${type}`;
    notification.textContent = message;
    
    const colors = {
      success: '#4caf50',
      error: '#f44336',
      warning: '#ff9800',
      info: '#2196f3'
    };
    
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${colors[type] || colors.info};
      color: white;
      padding: 15px 20px;
      border-radius: 5px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      max-width: 400px;
      font-family: 'Poppins', sans-serif;
      font-size: 14px;
      animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 5000);
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, waiting for API config...');
  
  // If propamitAPI is already available, initialize immediately
  if (window.propamitAPI) {
    initializeLoginPage();
  }
  // Otherwise, the initialization will happen when waitForConfig resolves
});
