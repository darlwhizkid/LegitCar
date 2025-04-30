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
  
  // Get all registered users or initialize empty array
  function getRegisteredUsers() {
    const users = localStorage.getItem('registeredUsers');
    return users ? JSON.parse(users) : [];
  }
  
  // Save a new user to localStorage
  function saveUser(userData) {
    const users = getRegisteredUsers();
    users.push(userData);
    localStorage.setItem('registeredUsers', JSON.stringify(users));
  }
  
  // Check if a user exists by email
  function userExists(email) {
    const users = getRegisteredUsers();
    return users.some(user => user.email.toLowerCase() === email.toLowerCase());
  }
  
  // Get user by email and password
  function getUserByCredentials(email, password) {
    const users = getRegisteredUsers();
    return users.find(user => 
      user.email.toLowerCase() === email.toLowerCase() && 
      user.password === password
    );
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
      
      // Check if user exists and password matches
      const user = getUserByCredentials(email, password);
      
      if (!user) {
        showError(loginEmail, 'Invalid email or password');
        return;
      }
      
      // Set authentication state
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('currentUser', JSON.stringify(user));
      
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
      } else if (userExists(emailInput.value)) {
        showError(emailInput, 'This email is already registered');
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
      
      console.log("Form validation result:", isValid);
      
      if (isValid) {
        // Create new user object
        const userData = {
          name: nameInput.value.trim(),
          email: emailInput.value.trim(),
          password: passwordInput.value, // In a real app, this should be hashed
          phone: phoneInput.value.trim(),
          isNewUser: true,
          createdAt: new Date().toISOString()
        };
        
        // Save user to localStorage
        saveUser(userData);
        
        // Store the registered email
        const registeredEmail = emailInput.value.trim();
        
        // Reset form
        registerForm.reset();
        
        // Show success message - this should block execution until dismissed
        alert('Registration successful! You can now log in with your credentials.');
        
        // After alert is dismissed, this code will run
        console.log("Alert dismissed, switching tabs now");
        
        // Switch to login tab
        if (loginTabBtn && registerTabBtn && loginForm && registerForm) {
          loginTabBtn.classList.add('active');
          registerTabBtn.classList.remove('active');
          loginForm.classList.add('active');
          registerForm.classList.remove('active');
          
          // Pre-fill the login form with the registered email
          if (loginEmail) {
            loginEmail.value = registeredEmail;
          }
          
          // Focus on the password field
          if (loginPassword) {
            loginPassword.focus();
          }
        } else {
          console.error("One or more tab elements not found");
        }
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
      } else if (!userExists(emailInput.value)) {
        showError(emailInput, 'No account found with this email');
        isValid = false;
      }
      
      if (isValid) {
        // In a real app, you would call your API to send a reset link
        alert(`Password reset link sent to ${emailInput.value}. Please check your email.`);
        
        // Reset form
        forgotPasswordForm.reset();
        
        // Return to login form
        forgotPasswordForm.classList.remove('active');
        loginForm.classList.add('active');
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
