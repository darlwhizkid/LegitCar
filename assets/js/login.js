// Login Page JavaScript

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
  const token = localStorage.getItem('token');
  const currentUser = localStorage.getItem('currentUser');
  
  // Only redirect if both token and user data exist
  if (token && currentUser) {
    // Redirect to dashboard if already logged in
    window.location.href = 'dashboard.html';
    return;
  }
  
  // If we're here, we don't have valid authentication
  // Clear any partial authentication data to be safe
  if (!token || !currentUser) {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isAuthenticated');
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
  const agreeTerms = document.getElementById('agreeTerms');
  const passwordToggles = document.querySelectorAll('.password-toggle');
  
  // Login form elements
  const loginEmail = document.getElementById('loginEmail');
  const loginPassword = document.getElementById('loginPassword');
  
  // Tab switching
  if (loginTabBtn && registerTabBtn) {
    loginTabBtn.addEventListener('click', function() {
      loginTabBtn.classList.add('active');
      registerTabBtn.classList.remove('active');
      loginForm.classList.add('active');
      registerForm.classList.remove('active');
      forgotPasswordForm.classList.remove('active');
    });
    
    registerTabBtn.addEventListener('click', function() {
      registerTabBtn.classList.add('active');
      loginTabBtn.classList.remove('active');
      registerForm.classList.add('active');
      loginForm.classList.remove('active');
      forgotPasswordForm.classList.remove('active');
    });
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
  
  // Password visibility toggles
  if (passwordToggles) {
    passwordToggles.forEach(toggle => {
      toggle.addEventListener('click', function() {
        const passwordField = this.previousElementSibling;
        const icon = this.querySelector('i');
        
        if (passwordField.type === 'password') {
          passwordField.type = 'text';
          icon.classList.remove('fa-eye');
          icon.classList.add('fa-eye-slash');
        } else {
          passwordField.type = 'password';
          icon.classList.remove('fa-eye-slash');
          icon.classList.add('fa-eye');
        }
      });
    });
  }
  
  // Terms checkbox for register form
  if (agreeTerms && registerSubmitBtn) {
    agreeTerms.addEventListener('change', function() {
      registerSubmitBtn.disabled = !this.checked;
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
  
  // API call helper function
  async function callAPI(data) {
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  }
  
  // Handle login form submission
  if (loginSubmitBtn) {
    loginSubmitBtn.addEventListener('click', async function() {
      if (!loginEmail || !loginPassword) {
        console.error("Login form elements not found");
        return;
      }
      
      const email = loginEmail.value.trim();
      const password = loginPassword.value;
      
      // Clear previous errors
      clearErrors(loginForm);
      
      // Basic validation
      if (!email) {
        showError(loginEmail, 'Please enter your email');
        return;
      }
      
      if (!validateEmail(email)) {
        showError(loginEmail, 'Please enter a valid email address');
        return;
      }
      
      if (!password) {
        showError(loginPassword, 'Please enter your password');
        return;
      }
      
      // Show loading state
      loginSubmitBtn.textContent = 'Logging in...';
      loginSubmitBtn.disabled = true;
      
      // Call API for login
      const result = await callAPI({
        action: 'login',
        email: email,
        password: password
      });
      
      // Reset button state
      loginSubmitBtn.textContent = 'Login';
      loginSubmitBtn.disabled = false;
      
      if (result.success) {
        // Store token and user data
        localStorage.setItem('token', result.token);
        localStorage.setItem('currentUser', JSON.stringify(result.user));
        
        // Redirect to dashboard
        window.location.href = 'dashboard.html';
      } else {
        // Show error message
        showError(loginEmail, result.message || 'Invalid email or password');
      }
    });
  }
  
  // Register form submission
  if (registerSubmitBtn) {
    registerSubmitBtn.addEventListener('click', async function() {
      const nameInput = document.getElementById('registerName');
      const emailInput = document.getElementById('registerEmail');
      const passwordInput = document.getElementById('registerPassword');
      const confirmPasswordInput = document.getElementById('confirmPassword');
      const phoneInput = document.getElementById('registerPhone');
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
      
      if (confirmPasswordInput && confirmPasswordInput.value !== passwordInput.value) {
        showError(confirmPasswordInput, 'Passwords do not match');
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
        showError(agreeTerms, 'You must agree to the terms');
        isValid = false;
      }
      
      if (isValid) {
        // Show loading state
        registerSubmitBtn.textContent = 'Registering...';
        registerSubmitBtn.disabled = true;
        
        // Call API for registration
        const result = await callAPI({
          action: 'register',
          name: nameInput.value.trim(),
          email: emailInput.value.trim(),
          password: passwordInput.value,
          phone: phoneInput.value.trim()
        });
        
        // Reset button state
        registerSubmitBtn.textContent = 'Register';
        registerSubmitBtn.disabled = !agreeTerms.checked;
        
        if (result.success) {
          // Store the registered email
          const registeredEmail = emailInput.value.trim();
          
          // Clear all input fields manually
          const inputs = registerForm.querySelectorAll('input');
          inputs.forEach(input => {
            if (input.type === 'checkbox') {
              input.checked = false;
            } else {
              input.value = '';
            }
          });
          
          // Show success message
          alert('Registration successful! You can now log in with your credentials.');
          
          // Switch to login tab
          loginTabBtn.classList.add('active');
          registerTabBtn.classList.remove('active');
          loginForm.classList.add('active');
          registerForm.classList.remove('active');
          forgotPasswordForm.classList.remove('active');
          
          // Pre-fill the login form with the registered email
          if (loginEmail) {
            loginEmail.value = registeredEmail;
          }
          
          // Focus on the password field
          if (loginPassword) {
            loginPassword.focus();
          }
        } else {
          // Show error message
          showError(emailInput, result.message || 'Registration failed. Please try again.');
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
        // Show loading state
        resetSubmitBtn.textContent = 'Sending...';
        resetSubmitBtn.disabled = true;
        
        // Call API for password reset
        const result = await callAPI({
          action: 'resetPassword',
          email: emailInput.value.trim()
        });
        
        // Reset button state
        resetSubmitBtn.textContent = 'Send Reset Link';
        resetSubmitBtn.disabled = false;
        
        if (result.success) {
          // Show success message
          alert(`Password reset link sent to ${emailInput.value}. Please check your email.`);
          
          // Reset form
          forgotPasswordForm.reset();
          
          // Return to login form
          forgotPasswordForm.classList.remove('active');
          loginForm.classList.add('active');
        } else {
          // Show error message
          showError(emailInput, result.message || 'No account found with this email');
        }
      }
    });
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
