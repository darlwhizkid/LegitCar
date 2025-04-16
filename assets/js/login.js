// Login Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
  console.log("Login script loaded");
  
  // Check if user is already authenticated
  const isAuthenticated = localStorage.getItem('isAuthenticated');
  if (isAuthenticated) {
    // Redirect to dashboard if already logged in
    window.location.href = 'dashboard.html';
    return;
  }
  
  // Get modal elements
  const authModal = document.getElementById('authModal');
  const closeModal = document.getElementById('closeModal');
  const loginButton = document.getElementById('loginButton');
  const mobileLoginButton = document.getElementById('mobileLoginButton');
  
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
  
  // Show modal when login button is clicked
  if (loginButton) {
    loginButton.addEventListener('click', function() {
      authModal.style.display = 'flex';
    });
  }
  
  // Show modal when mobile login button is clicked
  if (mobileLoginButton) {
    mobileLoginButton.addEventListener('click', function() {
      authModal.style.display = 'flex';
    });
  }
  
  // Close modal when close button is clicked
  if (closeModal) {
    closeModal.addEventListener('click', function() {
      authModal.style.display = 'none';
    });
  }
  
  // Close modal when clicking outside the modal content
  window.addEventListener('click', function(event) {
    if (event.target === authModal) {
      authModal.style.display = 'none';
    }
  });
  
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
      
      // Clear error after 3 seconds
      setTimeout(() => {
        errorMessage.textContent = '';
        errorMessage.style.display = 'none';
        formGroup.classList.remove('error');
      }, 3000);
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
  
  // Handle login form submission
  if (loginSubmitBtn) {
    loginSubmitBtn.addEventListener('click', function() {
      if (!loginEmail || !loginPassword) {
        console.error("Login form elements not found");
        return;
      }
      
      const email = loginEmail.value.trim();
      const password = loginPassword.value;
      
      // Basic validation
      if (!email) {
        showError(loginEmail, 'Please enter your email');
        return;
      }
      
      if (!password) {
        showError(loginPassword, 'Please enter your password');
        return;
      }
      
      console.log("Logging in with:", email);
      
      // Check if this user exists in localStorage
      let existingUserData = getUserByEmail(email);
      
      if (existingUserData) {
        // In a real app, you would verify the password here
        console.log("User found, logging in with existing data");
      } else {
        // Create a new user if not found
        console.log("Creating new user");
        existingUserData = {
          email: email,
          name: email.split('@')[0], // Use part of email as name initially
          isNewUser: true
        };
        
        // Save new user
        saveUser(existingUserData);
      }
      
      // Set authentication state
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('currentUser', JSON.stringify(existingUserData));
      
      // Close modal
      if (authModal) {
        authModal.style.display = 'none';
      }
      
      // Redirect to dashboard
      window.location.href = 'dashboard.html';
    });
  }
  
  // Register form submission
  if (registerSubmitBtn) {
    registerSubmitBtn.addEventListener('click', function() {
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
        // For demo purposes, we'll create a new user
        // In a real app, you would call your API here
        const userData = {
          name: nameInput.value,
          email: emailInput.value,
          phone: phoneInput.value,
          isNewUser: true
        };
        
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('currentUser', JSON.stringify(userData));
        
        // Save to users array
        saveUser(userData);
        
        // Close modal
        if (authModal) {
          authModal.style.display = 'none';
        }
        
        // Redirect to dashboard
        window.location.href = 'dashboard.html';
      }
    });
  }
  
  // Reset password form submission
  if (resetSubmitBtn) {
    resetSubmitBtn.addEventListener('click', function() {
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
        // In a real app, you would call your API to send a reset link
        alert(`Password reset link sent to ${emailInput.value}. Please check your email.`);
        
        // Return to login form
        forgotPasswordForm.classList.remove('active');
        loginForm.classList.add('active');
      }
    });
  }
  
  // Function to get user by email from localStorage
  function getUserByEmail(email) {
    // Get all users from localStorage
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Find user with matching email
    return users.find(user => user.email === email);
  }
  
  // Function to save user to localStorage
  function saveUser(userData) {
    // Get existing users
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Check if user already exists
    const existingUserIndex = users.findIndex(user => user.email === userData.email);
    
    if (existingUserIndex >= 0) {
      // Update existing user
      users[existingUserIndex] = userData;
    } else {
      // Add new user
      users.push(userData);
    }
    
    // Save updated users array
    localStorage.setItem('users', JSON.stringify(users));
  }
  
  // Social login buttons (these would connect to OAuth providers in a real implementation)
  const socialButtons = document.querySelectorAll('.social-button');
  if (socialButtons) {
    socialButtons.forEach(button => {
      button.addEventListener('click', function() {
        const provider = this.classList.contains('google') ? 'Google' : 'Facebook';
        
        // Store authentication data in localStorage
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('currentUser', JSON.stringify({
          name: `${provider} User`,
          email: `user@${provider.toLowerCase()}.example.com`,
          isNewUser: true
        }));
        
        // Close modal
        if (authModal) {
          authModal.style.display = 'none';
        }
        
        // Redirect to dashboard
        window.location.href = 'dashboard.html';
      });
    });
  }
  
  // Add a direct login link for testing
  const directLoginLink = document.getElementById('directLoginLink');
  if (directLoginLink) {
    directLoginLink.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Set authentication state
      localStorage.setItem('isAuthenticated', 'true');
      
      // Create demo user
      const demoUser = {
        email: 'demo@example.com',
        name: 'Demo User',
        isNewUser: true
      };
      
      // Save user data
      localStorage.setItem('currentUser', JSON.stringify(demoUser));
      
      // Redirect to dashboard
      window.location.href = 'dashboard.html';
    });
  }
  
  // Also check if there's a standalone login button
  const standaloneLoginButton = document.querySelector('.login-button:not(#loginForm .login-button)');
  if (standaloneLoginButton && standaloneLoginButton !== loginButton) {
    standaloneLoginButton.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Create a simple user for demo purposes
      const demoUser = {
        email: 'user@example.com',
        name: 'Demo User',
        isNewUser: true
      };
      
      // Set authentication state
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('currentUser', JSON.stringify(demoUser));
      
      // Redirect to dashboard
      window.location.href = 'dashboard.html';
    });
  }
});
