// Login Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
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
  
  // Tab switching
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
  
  // Forgot password flow
  forgotPasswordLink.addEventListener('click', function(e) {
    e.preventDefault();
    loginForm.classList.remove('active');
    forgotPasswordForm.classList.add('active');
  });
  
  backToLoginBtn.addEventListener('click', function() {
    forgotPasswordForm.classList.remove('active');
    loginForm.classList.add('active');
  });
  
  // Password visibility toggles
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
  
  // Terms checkbox for register form
  agreeTerms.addEventListener('change', function() {
    registerSubmitBtn.disabled = !this.checked;
  });
  
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
  document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
  
    if (loginForm) {
      loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
      
        // Get form data
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
      
        // Perform login validation (this is a simplified example)
        // In a real application, you would validate against a server
      
        // Check if this user exists in localStorage
        const existingUserData = getUserByEmail(email);
      
        if (existingUserData) {
          // In a real app, you would verify the password here
          // For this example, we'll just assume it's correct
        
          // Set authentication state
          localStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('currentUser', JSON.stringify(existingUserData));
        
          // Redirect to dashboard
          window.location.href = 'dashboard.html';
        } else {
          // Create a new user if not found
          const newUser = {
            email: email,
            name: email.split('@')[0], // Use part of email as name initially
            isNewUser: true
          };
        
          // Save new user
          saveUser(newUser);
        
          // Set authentication state
          localStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('currentUser', JSON.stringify(newUser));
        
          // Redirect to dashboard
          window.location.href = 'dashboard.html';
        }
      });
    }
  });

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
  // Register form submission
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
      
      // Redirect to dashboard
      window.location.href = 'dashboard.html';
    }
  });
  
  // Reset password form submission
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
  
  // Social login buttons (these would connect to OAuth providers in a real implementation)
  const socialButtons = document.querySelectorAll('.social-button');
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
      
      // Redirect to dashboard
      window.location.href = 'dashboard.html';
    });
  });
});
// Add this to your login.js file to validate password confirmation
document.addEventListener('DOMContentLoaded', function() {
  // Get tab elements
  const loginTab = document.getElementById('loginTab');
  const registerTab = document.getElementById('registerTab');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  
  // Tab switching
  if (loginTab && registerTab) {
    loginTab.addEventListener('click', function() {
      loginTab.classList.add('active');
      registerTab.classList.remove('active');
      loginForm.style.display = 'block';
      registerForm.style.display = 'none';
    });
    
    registerTab.addEventListener('click', function() {
      registerTab.classList.add('active');
      loginTab.classList.remove('active');
      registerForm.style.display = 'block';
      loginForm.style.display = 'none';
    });
  }
  
  // Password confirmation validation
  const registerPassword = document.getElementById('registerPassword');
  const confirmPassword = document.getElementById('confirmPassword');
  
  if (confirmPassword && registerPassword) {
    confirmPassword.addEventListener('input', function() {
      if (this.value !== registerPassword.value) {
        this.setCustomValidity('Passwords do not match');
        const errorMessage = this.closest('.form-group').querySelector('.error-message');
        if (errorMessage) {
          errorMessage.textContent = 'Passwords do not match';
          errorMessage.style.display = 'block';
        }
      } else {
        this.setCustomValidity('');
        const errorMessage = this.closest('.form-group').querySelector('.error-message');
        if (errorMessage) {
          errorMessage.textContent = '';
          errorMessage.style.display = 'none';
        }
      }
    });
    
    registerPassword.addEventListener('input', function() {
      if (confirmPassword.value && this.value !== confirmPassword.value) {
        confirmPassword.setCustomValidity('Passwords do not match');
        const errorMessage = confirmPassword.closest('.form-group').querySelector('.error-message');
        if (errorMessage) {
          errorMessage.textContent = 'Passwords do not match';
          errorMessage.style.display = 'block';
        }
      } else if (confirmPassword.value) {
        confirmPassword.setCustomValidity('');
        const errorMessage = confirmPassword.closest('.form-group').querySelector('.error-message');
        if (errorMessage) {
          errorMessage.textContent = '';
          errorMessage.style.display = 'none';
        }
      }
    });
  }
  
  // Social login buttons
  const googleBtn = document.querySelector('.social-button.google');
  const facebookBtn = document.querySelector('.social-button.facebook');
  
  if (googleBtn) {
    googleBtn.addEventListener('click', function() {
      // Mock Google login
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('currentUser', JSON.stringify({
        name: 'Google User',
        email: 'user@google.example.com'
      }));
      window.location.href = 'dashboard.html';
    });
  }
  
  if (facebookBtn) {
    facebookBtn.addEventListener('click', function() {
      // Mock Facebook login
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('currentUser', JSON.stringify({
        name: 'Facebook User',
        email: 'user@facebook.example.com'
      }));
      window.location.href = 'dashboard.html';
    });
  }
});
