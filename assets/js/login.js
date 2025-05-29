// Login Page JavaScript - Updated to use real API

document.addEventListener('DOMContentLoaded', function() {
  // Get the login/register buttons
  const loginButton = document.getElementById('loginButton');
  const mobileLoginButton = document.getElementById('mobileLoginButton');
  
  // Add click handler to desktop login button
  if (loginButton) {
    loginButton.addEventListener('click', function(e) {
      window.location.href = 'login.html';
    });
  }
  
  // Add click handler to mobile login button
  if (mobileLoginButton) {
    mobileLoginButton.addEventListener('click', function(e) {
      window.location.href = 'login.html';
    });
  }
  
  console.log("Login script loaded");
  
  // Check if user is already authenticated
  if (propamitAPI.isAuthenticated()) {
    // Redirect to dashboard if already logged in
    window.location.href = 'dashboard.html';
    return;
  }

  // DOM Elements
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

  // Tab switching
  if (loginTabBtn) {
    loginTabBtn.addEventListener('click', function() {
      switchTab('login');
    });
  }

  if (registerTabBtn) {
    registerTabBtn.addEventListener('click', function() {
      switchTab('register');
    });
  }

  function switchTab(tab) {
    // Clear all forms
    clearAllErrors();
    
    if (tab === 'login') {
      loginTabBtn.classList.add('active');
      registerTabBtn.classList.remove('active');
      loginForm.classList.add('active');
      registerForm.classList.remove('active');
      forgotPasswordForm.classList.remove('active');
    } else if (tab === 'register') {
      registerTabBtn.classList.add('active');
      loginTabBtn.classList.remove('active');
      registerForm.classList.add('active');
      loginForm.classList.remove('active');
      forgotPasswordForm.classList.remove('active');
    }
  }

  // Forgot password flow
  if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener('click', function(e) {
      e.preventDefault();
      loginForm.classList.remove('active');
      forgotPasswordForm.classList.add('active');
    });
  }

  if (backToLoginBtn) {
    backToLoginBtn.addEventListener('click', function() {
      forgotPasswordForm.classList.remove('active');
      loginForm.classList.add('active');
    });
  }

  // Form validation helpers
  function showError(input, message) {
    const formGroup = input.closest('.form-group');
    formGroup.classList.add('error');
    
    const errorMessage = formGroup.querySelector('.error-message');
    if (errorMessage) {
      errorMessage.textContent = message;
      errorMessage.style.display = 'block';
    }
  }

  function clearErrors(form) {
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
    clearErrors(loginForm);
    clearErrors(registerForm);
    clearErrors(forgotPasswordForm);
  }

  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  }

  function validatePassword(password) {
    return password.length >= 8;
  }

  function validatePhone(phone) {
    const re = /^(\+234|0)[0-9]{10}$/;
    return re.test(phone);
  }

  function showNotification(message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Hide notification after 3 seconds
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => document.body.removeChild(notification), 300);
    }, 3000);
  }

  // Login form submission
  if (loginSubmitBtn) {
    loginSubmitBtn.addEventListener('click', async function() {
      const emailInput = document.getElementById('loginEmail');
      const passwordInput = document.getElementById('loginPassword');
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
            }, 1000);
          }
        } catch (error) {
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
    registerSubmitBtn.addEventListener('click', async function() {
      const nameInput = document.getElementById('registerName');
      const emailInput = document.getElementById('registerEmail');
      const passwordInput = document.getElementById('registerPassword');
      const phoneInput = document.getElementById('registerPhone');
      const agreeTerms = document.getElementById('agreeTerms');
      let isValid = true;
      
      clearErrors(registerForm);
      
      if (!nameInput.value.trim()) {
        showError(nameInput, 'Name is required');
        isValid = false;
      }
      
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
      } else if (!validatePassword(passwordInput.value)) {
        showError(passwordInput, 'Password must be at least 8 characters');
        isValid = false;
      }
      
      if (!phoneInput.value.trim()) {
        showError(phoneInput, 'Phone number is required');
        isValid = false;
      } else if (!validatePhone(phoneInput.value)) {
        showError(phoneInput, 'Please enter a valid Nigerian phone number');
        isValid = false;
      }
      
      if (!agreeTerms.checked) {
        showError(agreeTerms, 'You must agree to the terms and conditions');
        isValid = false;
      }
      
      if (isValid) {
        try {
          // Disable button and show loading
          registerSubmitBtn.disabled = true;
          registerSubmitBtn.textContent = 'Creating Account...';
          
          const response = await propamitAPI.register({
            name: nameInput.value,
            email: emailInput.value,
            password: passwordInput.value,
            phone: phoneInput.value
          });

          if (response.success) {
            showNotification('Account created successfully! Redirecting...', 'success');
            
            // Redirect to dashboard after short delay
            setTimeout(() => {
              window.location.href = 'dashboard.html';
            }, 1000);
          }
        } catch (error) {
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
    resetSubmitBtn.addEventListener('click', async function() {
      const emailInput = document.getElementById('resetEmail');
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
              forgotPasswordForm.classList.remove('active');
              loginForm.classList.add('active');
              emailInput.value = '';
            }, 2000);
          }
        } catch (error) {
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

  // Terms checkbox for register form
  const agreeTerms = document.getElementById('agreeTerms');
  if (agreeTerms && registerSubmitBtn) {
    agreeTerms.addEventListener('change', function() {
      registerSubmitBtn.disabled = !this.checked;
    });
    
    // Initially disable register button
    registerSubmitBtn.disabled = true;
  }

  // Enter key support for forms
  function addEnterKeySupport(form, submitButton) {
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
  
  // Social login buttons (these would connect to OAuth providers in a real implementation)
  const socialButtons = document.querySelectorAll('.social-button');
  if (socialButtons) {
    socialButtons.forEach(button => {
      button.addEventListener('click', function() {
        alert('Social login is not implemented in this demo. Please use email registration.');
      });
    });
  }
});
