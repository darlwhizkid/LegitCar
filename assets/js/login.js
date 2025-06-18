// Login Page JavaScript - Production Ready

// Wait for API_CONFIG to be loaded
function waitForConfig() {
  return new Promise((resolve) => {
    if (window.API_CONFIG && window.AuthHelper) {
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
    
    isAuthenticated: () => AuthHelper.isAuthenticated(),

    login: async (credentials) => {
      try {
        Utils.showLoading('Signing you in...');
        
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

        // Store authentication data using AuthHelper
        AuthHelper.setAuth(data);
        
        Utils.hideLoading();
        Utils.showNotification('Login successful! Welcome back.', 'success');

        return { success: true, message: data.message || 'Login successful', user: data.user };
      } catch (error) {
        Utils.hideLoading();
        console.error('Login API error:', error);
        Utils.showNotification(error.message || 'Login failed. Please try again.', 'error');
        throw new Error(error.message || 'Network error occurred');
      }
    },

    register: async (userData) => {
      try {
        Utils.showLoading('Creating your account...');
        
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

        Utils.hideLoading();
        Utils.showNotification('Account created successfully! Please login to continue.', 'success');

        return { success: true, message: data.message || 'Registration successful' };
      } catch (error) {
        Utils.hideLoading();
        console.error('Registration API error:', error);
        Utils.showNotification(error.message || 'Registration failed. Please try again.', 'error');
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
        
        Utils.showNotification('Logged out successfully', 'info');
      } catch (error) {
        console.error('Logout API error:', error);
      } finally {
        // Clear storage using AuthHelper
        AuthHelper.clearAuth();
      }
    },

    resetPassword: async (email) => {
      try {
        Utils.showLoading('Sending reset link...');
        
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

        Utils.hideLoading();
        Utils.showNotification('Password reset link sent to your email', 'success');

        return { success: true, message: data.message };
      } catch (error) {
        Utils.hideLoading();
        console.error('Reset password error:', error);
        Utils.showNotification(error.message || 'Failed to send reset link', 'error');
        throw error;
      }
    }
  };

  // Make propamitAPI globally available
  window.propamitAPI = propamitAPI;
  console.log('Enhanced propamitAPI initialized successfully');
});

document.addEventListener('DOMContentLoaded', function() {
  console.log("Login script loaded");
  
  // Initialize password visibility toggles FIRST
  initializePasswordToggles();
  
  // Get the login/register buttons (for navigation)
  const loginButton = document.getElementById('loginButton');
  const mobileLoginButton = document.getElementById('mobileLoginButton');
  
  // Add click handler to desktop login button
  if (loginButton) {
    loginButton.addEventListener('click', function(e) {
      e.preventDefault();
      window.location.href = 'login.html';
    });
  }
  
  // Add click handler to mobile login button
  if (mobileLoginButton) {
    mobileLoginButton.addEventListener('click', function(e) {
      e.preventDefault();
      window.location.href = 'login.html';
    });
  }
  
  // Check if user is already authenticated
  if (propamitAPI.isAuthenticated()) {
    // Redirect to dashboard if already logged in
    console.log("User already authenticated, redirecting to dashboard");
    window.location.href = 'dashboard.html';
    return;
  }

  // DOM Elements - with null checks
  const loginTabBtn = document.getElementById('loginTabBtn');
  const registerTabBtn = document.getElementById('registerTabBtn');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const forgotPasswordForm = document.getElementById('forgotPasswordForm');
  const forgotPasswordLink = document.getElementById('forgotPasswordLink');
  const backToLoginBtn = document.getElementById('backToLoginBtn');
  const loginSubmitBtn = document.getElementById('loginSubmitBtn');
  const registerSubmitBtn = document.getElementById('registerSubmitBtn');
  const resetSubmitBtn = document.getElementById('resetSubmitBtn');

  // Only proceed if we have the main form elements
  if (!loginForm && !registerForm) {
    console.log("Login/Register forms not found on this page");
    return;
  }

  // Password visibility toggle functionality
  function initializePasswordToggles() {
    console.log('Initializing password toggles...');
    
    // Find all password toggle buttons (including hidden ones)
    const passwordToggles = document.querySelectorAll('.password-toggle');
    
    passwordToggles.forEach((toggle, index) => {
      // Skip if already initialized
      if (toggle.hasAttribute('data-toggle-initialized')) {
        return;
      }
      
      console.log(`Setting up toggle ${index + 1}`);
      
      // Mark as initialized
      toggle.setAttribute('data-toggle-initialized', 'true');
      
      toggle.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('Password toggle clicked');
        
        // Find the password input in the same container
        const container = this.closest('.password-input-group');
        const passwordInput = container ? container.querySelector('input[type="password"], input[type="text"]') : null;
        
        if (passwordInput) {
          // Toggle password visibility
          const isPassword = passwordInput.type === 'password';
          passwordInput.type = isPassword ? 'text' : 'password';
          
          // Update the eye icon
          const eyeIcon = this.querySelector('i');
          if (eyeIcon) {
            if (isPassword) {
              // Show password - change to eye-slash
              eyeIcon.classList.remove('fa-eye');
              eyeIcon.classList.add('fa-eye-slash');
              this.title = 'Hide password';
            } else {
              // Hide password - change to eye
              eyeIcon.classList.remove('fa-eye-slash');
              eyeIcon.classList.add('fa-eye');
              this.title = 'Show password';
            }
          }
          
          console.log(`Password ${isPassword ? 'shown' : 'hidden'} for input: ${passwordInput.id}`);
        } else {
          console.error('Password input not found for toggle');
        }
      });
      
      // Set initial title
      toggle.title = 'Show password';
    });
    
    console.log(`Initialized ${passwordToggles.length} password toggles`);
  }

  // Tab switching
  if (loginTabBtn && registerTabBtn) {
    loginTabBtn.addEventListener('click', function() {
      switchTab('login');
    });

    registerTabBtn.addEventListener('click', function() {
      switchTab('register');
    });
  }

  function switchTab(tab) {
    // Clear all forms
    clearAllErrors();
    
    if (tab === 'login' && loginForm && registerForm) {
      if (loginTabBtn) loginTabBtn.classList.add('active');
      if (registerTabBtn) registerTabBtn.classList.remove('active');
      loginForm.classList.add('active');
      registerForm.classList.remove('active');
      if (forgotPasswordForm) forgotPasswordForm.classList.remove('active');
    } else if (tab === 'register' && loginForm && registerForm) {
      if (registerTabBtn) registerTabBtn.classList.add('active');
      if (loginTabBtn) loginTabBtn.classList.remove('active');
      registerForm.classList.add('active');
      loginForm.classList.remove('active');
      if (forgotPasswordForm) forgotPasswordForm.classList.remove('active');
    }

    // Re-initialize password toggles after tab switch with a longer delay
    setTimeout(() => {
      // Remove all initialization markers
      const allToggles = document.querySelectorAll('.password-toggle');
      allToggles.forEach(toggle => {
        toggle.removeAttribute('data-toggle-initialized');
      });
      
      initializePasswordToggles();
      console.log(`Password toggles re-initialized for ${tab} tab`);
    }, 200);
  }

  // Forgot password flow
  if (forgotPasswordLink && forgotPasswordForm && loginForm) {
    forgotPasswordLink.addEventListener('click', function(e) {
      e.preventDefault();
      loginForm.classList.remove('active');
      forgotPasswordForm.classList.add('active');
    });
  }

  if (backToLoginBtn && forgotPasswordForm && loginForm) {
    backToLoginBtn.addEventListener('click', function() {
      forgotPasswordForm.classList.remove('active');
      loginForm.classList.add('active');
    });
  }

  // Form validation helpers
  function showError(input, message) {
    if (!input) return;
    
    const formGroup = input.closest('.form-group');
    if (formGroup) {
      formGroup.classList.add('error');
      
      let errorMessage = formGroup.querySelector('.error-message');
      if (!errorMessage) {
        // Create error message element if it doesn't exist
        errorMessage = document.createElement('div');
        errorMessage.className = 'error-message';
        errorMessage.style.cssText = 'color: #dc3545; font-size: 12px; margin-top: 5px; display: block;';
        formGroup.appendChild(errorMessage);
      }
      
      errorMessage.textContent = message;
      errorMessage.style.display = 'block';
    }
  }

  function clearErrors(form) {
    if (!form) return;
    
    const errorGroups = form.querySelectorAll('.form-group.error');
    errorGroups.forEach(group => {
      group.classList.remove('error');
      const errorMessage = group.querySelector('.error-message');
      if (errorMessage) {
        errorMessage.textContent = '';
        errorMessage.style.display = 'none';
      }
    });
  }

  function clearAllErrors() {
    if (loginForm) clearErrors(loginForm);
    if (registerForm) clearErrors(registerForm);
    if (forgotPasswordForm) clearErrors(forgotPasswordForm);
  }

  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  }

  function validatePassword(password) {
    return password && password.length >= 8;
  }

  function validatePasswordMatch(password, confirmPassword) {
    return password === confirmPassword;
  }

  function validatePhone(phone) {
    const re = /^(\+234|0)[0-9]{10}$/;
    return re.test(phone);
  }

  function showNotification(message, type = 'success') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notif => notif.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <span>${message}</span>
        <button class="notification-close">&times;</button>
      </div>
    `;
    
    // Add styles if they don't exist
    if (!document.querySelector('#notification-styles')) {
      const styles = document.createElement('style');
      styles.id = 'notification-styles';
      styles.textContent = `
        .notification {
          position: fixed;
          top: 20px;
          right: 20px;
          padding: 15px 20px;
          border-radius: 5px;
          color: white;
          font-weight: 500;
          z-index: 10000;
          transform: translateX(400px);
          transition: transform 0.3s ease;
          max-width: 300px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .notification.success { background-color: #28a745; }
        .notification.error { background-color: #dc3545; }
        .notification.show { transform: translateX(0); }
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

  // Login form submission
  if (loginSubmitBtn) {
    loginSubmitBtn.addEventListener('click', async function(e) {
      e.preventDefault();
      
      const emailInput = document.getElementById('loginEmail');
      const passwordInput = document.getElementById('loginPassword');
      
      if (!emailInput || !passwordInput) {
        console.error('Login form inputs not found');
        return;
      }
      
      let isValid = true;
      
      clearErrors(loginForm);
      
      if (!emailInput.value.trim()) {
        showError(emailInput, 'Email is required');
        isValid = false;
      } else if (!validateEmail(emailInput.value)) {
        showError(emailInput, 'Please enter a valid email');
        isValid = false;
      }
      
      if (!passwordInput.value.trim()) {
        showError(passwordInput, 'Password is required');
        isValid = false;
      }
      
      if (isValid) {
        try {
          // Disable button and show loading
          loginSubmitBtn.disabled = true;
          loginSubmitBtn.textContent = 'Logging in...';
          
          const response = await propamitAPI.login({
            email: emailInput.value,
            password: passwordInput.value
          });

          if (response.success) {
            showNotification('Login successful! Redirecting...', 'success');
            
            // Redirect to dashboard after short delay
            setTimeout(() => {
              window.location.href = 'dashboard.html';
            }, 1500);
          }
        } catch (error) {
          console.error('Login error:', error);
          showError(passwordInput, error.message || 'Login failed');
          showNotification(error.message || 'Login failed', 'error');
        } finally {
          // Re-enable button
          loginSubmitBtn.disabled = false;
          loginSubmitBtn.textContent = 'Login';
        }
      }
    });
  }

  // Register form submission
  if (registerSubmitBtn) {
    registerSubmitBtn.addEventListener('click', async function(e) {
      e.preventDefault();
      
      const nameInput = document.getElementById('registerName');
      const emailInput = document.getElementById('registerEmail');
      const passwordInput = document.getElementById('registerPassword');
      const confirmPasswordInput = document.getElementById('confirmPassword');
      const phoneInput = document.getElementById('registerPhone');
      const agreeTerms = document.getElementById('agreeTerms');
      
      let isValid = true;
      
      clearErrors(registerForm);
      
      if (nameInput && !nameInput.value.trim()) {
        showError(nameInput, 'Name is required');
        isValid = false;
      }
      
      if (!emailInput || !emailInput.value.trim()) {
        showError(emailInput, 'Email is required');
        isValid = false;
      } else if (!validateEmail(emailInput.value)) {
        showError(emailInput, 'Please enter a valid email');
        isValid = false;
      }
      
      if (!passwordInput || !passwordInput.value.trim()) {
        showError(passwordInput, 'Password is required');
        isValid = false;
      } else if (!validatePassword(passwordInput.value)) {
        showError(passwordInput, 'Password must be at least 8 characters');
        isValid = false;
      }
      
      // Password confirmation validation
      if (!confirmPasswordInput || !confirmPasswordInput.value.trim()) {
        showError(confirmPasswordInput, 'Please confirm your password');
        isValid = false;
      } else if (passwordInput && passwordInput.value && !validatePasswordMatch(passwordInput.value, confirmPasswordInput.value)) {
        showError(confirmPasswordInput, 'Passwords do not match');
        isValid = false;
      }
      
      if (phoneInput && phoneInput.value.trim() && !validatePhone(phoneInput.value)) {
        showError(phoneInput, 'Please enter a valid Nigerian phone number');
        isValid = false;
      }
      
      if (agreeTerms && !agreeTerms.checked) {
        showError(agreeTerms, 'You must agree to the terms and conditions');
        isValid = false;
      }
      
      if (isValid) {
        try {
          // Disable button and show loading
          registerSubmitBtn.disabled = true;
          registerSubmitBtn.textContent = 'Creating Account...';
          
          const userData = {
            name: nameInput ? nameInput.value : '',
            email: emailInput.value,
            password: passwordInput.value
          };
          
          if (phoneInput && phoneInput.value.trim()) {
            userData.phone = phoneInput.value;
          }
          
          const response = await propamitAPI.register(userData);

          if (response.success) {
            if (response.requiresVerification) {
              // Show email verification message
              showNotification('Account created! Please check your email to verify your account before logging in.', 'success');
              
              // Switch to login tab after delay
              setTimeout(() => {
                switchTab('login');
                // Pre-fill email in login form
                const loginEmailInput = document.getElementById('loginEmail');
                if (loginEmailInput) {
                  loginEmailInput.value = emailInput.value;
                }
              }, 3000);
            } else {
              // Direct login (fallback)
              showNotification('Account created successfully! Redirecting...', 'success');
              setTimeout(() => {
                window.location.href = 'dashboard.html';
              }, 1500);
            }
          }
        } catch (error) {
          console.error('Registration error:', error);
          showError(emailInput, error.message || 'Registration failed');
          showNotification(error.message || 'Registration failed', 'error');
        } finally {
          // Re-enable button
          registerSubmitBtn.disabled = false;
          registerSubmitBtn.textContent = 'Register';
        }
      }
    });
  }

  // Reset password form submission
  if (resetSubmitBtn) {
    resetSubmitBtn.addEventListener('click', async function(e) {
      e.preventDefault();
      
      const emailInput = document.getElementById('resetEmail');
      
      if (!emailInput) {
        console.error('Reset email input not found');
        return;
      }
      
      let isValid = true;
      
      clearErrors(forgotPasswordForm);
      
      if (!emailInput.value.trim()) {
        showError(emailInput, 'Email is required');
        isValid = false;
      } else if (!validateEmail(emailInput.value)) {
        showError(emailInput, 'Please enter a valid email');
        isValid = false;
      }
      
      if (isValid) {
        try {
          // Disable button and show loading
          resetSubmitBtn.disabled = true;
          resetSubmitBtn.textContent = 'Sending Reset Link...';
          
          const response = await propamitAPI.forgotPassword(emailInput.value);

          if (response.success) {
            showNotification('Password reset link sent! Check your email.', 'success');
            
            // Return to login form after delay
            setTimeout(() => {
              if (forgotPasswordForm && loginForm) {
                forgotPasswordForm.classList.remove('active');
                loginForm.classList.add('active');
                emailInput.value = '';
              }
            }, 2000);
          }
        } catch (error) {
          console.error('Password reset error:', error);
          showError(emailInput, error.message || 'Failed to send reset link');
          showNotification(error.message || 'Failed to send reset link', 'error');
        } finally {
          // Re-enable button
          resetSubmitBtn.disabled = false;
          resetSubmitBtn.textContent = 'Send Reset Link';
        }
      }
    });
  }

  // Real-time password confirmation validation
  const passwordInput = document.getElementById('registerPassword');
  const confirmPasswordInput = document.getElementById('confirmPassword');
  
  if (passwordInput && confirmPasswordInput) {
    function checkPasswordMatch() {
      const password = passwordInput.value;
      const confirmPassword = confirmPasswordInput.value;
      
      if (confirmPassword && password !== confirmPassword) {
        showError(confirmPasswordInput, 'Passwords do not match');
      } else if (confirmPassword && password === confirmPassword) {
        // Clear the error if passwords match
        const formGroup = confirmPasswordInput.closest('.form-group');
        if (formGroup) {
          formGroup.classList.remove('error');
          const errorMessage = formGroup.querySelector('.error-message');
          if (errorMessage) {
            errorMessage.style.display = 'none';
          }
        }
      }
    }
    
    passwordInput.addEventListener('input', checkPasswordMatch);
    confirmPasswordInput.addEventListener('input', checkPasswordMatch);
  }

  // Terms checkbox for register form
  const agreeTerms = document.getElementById('agreeTerms');
  if (agreeTerms && registerSubmitBtn) {
    agreeTerms.addEventListener('change', function() {
      registerSubmitBtn.disabled = !this.checked;
    });
    
    // Initially disable register button if terms checkbox exists
    registerSubmitBtn.disabled = true;
  }

  // Enter key support for forms
  function addEnterKeySupport(form, submitButton) {
    if (!form || !submitButton) return;
    
    form.addEventListener('keypress', function(e) {
      if (e.key === 'Enter' && !submitButton.disabled) {
        e.preventDefault();
        submitButton.click();
      }
    });
  }

  if (loginForm && loginSubmitBtn) {
    addEnterKeySupport(loginForm, loginSubmitBtn);
  }

  if (registerForm && registerSubmitBtn) {
    addEnterKeySupport(registerForm, registerSubmitBtn);
  }

  if (forgotPasswordForm && resetSubmitBtn) {
    addEnterKeySupport(forgotPasswordForm, resetSubmitBtn);
  }

  // Initialize social buttons
  initializeSocialButtons();

  // Initialize the page - show login tab by default
  if (loginForm && registerForm) {
    switchTab('login');
  }

  console.log("Login script initialization complete");
});

// Social login functionality for production
function initializeSocialButtons() {
  // Handle social buttons in login form
  const loginSocialButtons = document.querySelectorAll('#loginForm .social-button');
  loginSocialButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      const provider = this.classList.contains('google') ? 'google' : 'facebook';
      handleSocialAuth(provider, 'login');
    });
  });
  
  // Handle social buttons in register form
  const registerSocialButtons = document.querySelectorAll('#registerForm .social-button');
  registerSocialButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      const provider = this.classList.contains('google') ? 'google' : 'facebook';
      handleSocialAuth(provider, 'register');
    });
  });
}

// Enhanced social login with popup handling
async function handleSocialAuth(provider, action) {
  const providerName = provider.charAt(0).toUpperCase() + provider.slice(1);
  
  try {
    // Show loading notification
    showNotification(`Connecting to ${providerName}...`, 'success');
    
    // Disable all social buttons temporarily
    const allSocialButtons = document.querySelectorAll('.social-button');
    allSocialButtons.forEach(btn => {
      btn.disabled = true;
      btn.style.opacity = '0.6';
    });
    
    // Create OAuth URL
    const oauthURL = `${propamitAPI.baseURL}/auth/${provider}?action=${action}&redirect=${encodeURIComponent(window.location.origin + '/auth-callback.html')}`;
    
    // Open popup window
    const popup = window.open(
      oauthURL,
      `${provider}Auth`,
      'width=500,height=600,scrollbars=yes,resizable=yes'
    );
    
    // Listen for popup messages
    const handleMessage = (event) => {
      if (event.origin !== window.location.origin) return;
      
      window.removeEventListener('message', handleMessage);
      
      if (event.data.success) {
        showNotification(`${providerName} ${action} successful! Redirecting...`, 'success');
        setTimeout(() => {
          window.location.href = 'dashboard.html';
        }, 1500);
      } else {
        throw new Error(event.data.error || `${providerName} authentication failed`);
      }
    };
    
    window.addEventListener('message', handleMessage);
    
    // Check if popup was closed manually
    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed);
        window.removeEventListener('message', handleMessage);
        
        // Re-enable buttons
        allSocialButtons.forEach(btn => {
          btn.disabled = false;
          btn.style.opacity = '1';
        });
        
        showNotification('Authentication cancelled', 'error');
      }
    }, 1000);
    
  } catch (error) {
    console.error(`${providerName} ${action} error:`, error);
    showNotification(error.message || `${providerName} ${action} failed`, 'error');
    
    // Re-enable social buttons on error
    setTimeout(() => {
      const allSocialButtons = document.querySelectorAll('.social-button');
      allSocialButtons.forEach(btn => {
        btn.disabled = false;
        btn.style.opacity = '1';
      });
    }, 1000);
  }
}

// Production debugging function (only for development)
function debugLoginScript() {
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return; // Don't run debug in production
  }
  
  console.log('=== Login Script Debug Info ===');
  console.log('API Base URL:', propamitAPI.baseURL);
  console.log('Login form exists:', !!document.getElementById('loginForm'));
  console.log('Register form exists:', !!document.getElementById('registerForm'));
  console.log('Login button exists:', !!document.getElementById('loginSubmitBtn'));
  console.log('Register button exists:', !!document.getElementById('registerSubmitBtn'));
  console.log('Password fields found:', document.querySelectorAll('input[type="password"]').length);
  console.log('Password toggles found:', document.querySelectorAll('.password-toggle').length);
  console.log('Current page URL:', window.location.href);
  console.log('User authenticated:', propamitAPI.isAuthenticated());
  console.log('================================');
}

// Call debug function only in development
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  setTimeout(debugLoginScript, 1000);
}
