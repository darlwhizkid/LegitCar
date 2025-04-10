// DOM Elements
const menuButton = document.getElementById('menuButton');
const mobileMenu = document.getElementById('mobileMenu');
const servicesDropdown = document.getElementById('servicesDropdown');
const mobileServicesDropdown = document.getElementById('mobileServicesDropdown');
const mobileDropdownMenu = document.getElementById('mobileDropdownMenu');
const loginButton = document.getElementById('loginButton');
const mobileLoginButton = document.getElementById('mobileLoginButton');
const userSection = document.getElementById('userSection');
const userDropdown = document.getElementById('userDropdown');
const loginButtonElement = document.getElementById('loginButton');
const usernameElement = document.getElementById('username');
const mobileAuthSection = document.getElementById('mobileAuthSection');
const mobileUserSection = document.getElementById('mobileUserSection');
const logoutButtons = document.querySelectorAll('.logout-btn');

// Date display
function updateDateDisplay() {
  const date = new Date();
  const day = date.getDate();
  const month = date.toLocaleString('default', { month: 'short' });
  const year = date.getFullYear();
  
  document.getElementById('dayNumber').textContent = day;
  document.getElementById('month').textContent = month;
  document.getElementById('year').textContent = year;
}

// Toggle mobile menu
function toggleMenu() {
  menuButton.classList.toggle('open');
  mobileMenu.classList.toggle('open');
}

// Toggle mobile dropdown
function toggleMobileDropdown() {
  mobileDropdownMenu.classList.toggle('open');
  const icon = mobileServicesDropdown.querySelector('.fa-caret-down');
  icon.classList.toggle('rotate');
}

// Handle logout
function handleLogout() {
  localStorage.removeItem('isAuthenticated');
  localStorage.removeItem('currentUser');
  updateAuthUI();
  window.location.href = '/';
}

// Update UI based on authentication status
function updateAuthUI() {
  const isAuthenticated = localStorage.getItem('isAuthenticated');
  
  if (isAuthenticated) {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (user) {
      usernameElement.textContent = user.name;
    }
    
    loginButtonElement.style.display = 'none';
    userDropdown.style.display = 'block';
    
    mobileAuthSection.style.display = 'none';
    mobileUserSection.style.display = 'block';
  } else {
    loginButtonElement.style.display = 'block';
    userDropdown.style.display = 'none';
    
    mobileAuthSection.style.display = 'block';
    mobileUserSection.style.display = 'none';
  }
}

// Mock authentication function (to be replaced with your actual auth logic)
function mockLogin(username, password) {
  // This is just a placeholder for demonstration
  localStorage.setItem('isAuthenticated', 'true');
  localStorage.setItem('currentUser', JSON.stringify({
    name: username,
    email: username + '@example.com'
  }));
  updateAuthUI();
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
  // Initialize date display
  updateDateDisplay();
  
  // Initialize auth UI
  updateAuthUI();
  
  // Mobile menu toggle
  menuButton.addEventListener('click', toggleMenu);
  
  // Mobile dropdown toggle
  mobileServicesDropdown.addEventListener('click', toggleMobileDropdown);
  
  // Logout functionality
  logoutButtons.forEach(button => {
    button.addEventListener('click', handleLogout);
  });

  // Feature cards animation on scroll
  const featureCards = document.querySelectorAll('.feature-card');
  
  // Simple function to check if an element is in viewport
  function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }
  
  // Function to add animation class when element is in viewport
  function checkCards() {
    featureCards.forEach(card => {
      if (isInViewport(card)) {
        card.classList.add('visible');
      }
    });
  }
  
  // Check on scroll
  window.addEventListener('scroll', checkCards);
  
  // Check on initial load
  checkCards();

  // Testimonial cards animation on scroll
  const testimonialCards = document.querySelectorAll('.testimonial-card');
  
  // Function to add animation class when element is in viewport
  function checkTestimonials() {
    testimonialCards.forEach(card => {
      if (isInViewport(card)) {
        card.classList.add('visible');
      }
    });
  }
  
  // Check on scroll
  window.addEventListener('scroll', checkTestimonials);
  
  // Check on initial load
  checkTestimonials();

  // FAQ accordion functionality
  const faqButtons = document.querySelectorAll('.question-button');
  
  faqButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Close all other FAQ items
      faqButtons.forEach(otherButton => {
        if (otherButton !== button) {
          otherButton.classList.remove('open');
          otherButton.querySelector('i').classList.remove('fa-minus');
          otherButton.querySelector('i').classList.add('fa-plus');
          otherButton.nextElementSibling.classList.remove('open');
        }
      });
      
      // Toggle current FAQ item
      this.classList.toggle('open');
      const answerContainer = this.nextElementSibling;
      answerContainer.classList.toggle('open');
      
      // Toggle icon
      const icon = this.querySelector('i');
      if (answerContainer.classList.contains('open')) {
        icon.classList.remove('fa-plus');
        icon.classList.add('fa-minus');
      } else {
        icon.classList.remove('fa-minus');
        icon.classList.add('fa-plus');
      }
    });
  });

  // Scroll to top button functionality
  const scrollButton = document.getElementById('scrollButton');
  let isScrolling = false;
  
  // Set current year in footer
  document.getElementById('currentYear').textContent = new Date().getFullYear();
  
  // Toggle scroll button visibility based on scroll position
  function toggleScrollButtonVisibility() {
    if (window.pageYOffset > 300) {
      scrollButton.classList.add('visible');
    } else {
      scrollButton.classList.remove('visible');
    }
  }
  
  // Scroll to top function
  function scrollToTop() {
    isScrolling = true;
    
    // Change icon to car while scrolling
    const icon = scrollButton.querySelector('i');
    icon.classList.remove('fa-arrow-up');
    icon.classList.add('fa-car');
    
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    
    // Change icon back to arrow after scrolling
    setTimeout(function() {
      isScrolling = false;
      icon.classList.remove('fa-car');
      icon.classList.add('fa-arrow-up');
    }, 1000);
  }
  
  // Add event listeners
  window.addEventListener('scroll', toggleScrollButtonVisibility);
  scrollButton.addEventListener('click', scrollToTop);
  
  // Initialize button visibility
  toggleScrollButtonVisibility();
});

// Add these functions to your script1.js file

// Open auth modal
function openAuthModal() {
  window.location.href = 'login.html';
}

// Close auth modal
function closeAuthModal() {
    const authModal = document.getElementById('authModal');
    if (authModal) {
      authModal.classList.remove('active');
      document.body.style.overflow = ''; // Restore scrolling
    }
  }
  
  // Add this to your DOMContentLoaded event handler
  document.addEventListener('DOMContentLoaded', function() {
    // ... existing code ...
    
    // Auth modal elements
    const authModal = document.getElementById('authModal');
    const closeModal = document.getElementById('closeModal');
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
    
    // Login button click handlers
    if (loginButton) {
      loginButton.addEventListener('click', openAuthModal);
    }
    
    if (mobileLoginButton) {
      mobileLoginButton.addEventListener('click', openAuthModal);
    }
    
    // Get Started button functionality
    const getStartedButton = document.querySelector('.call-to-action');
    if (getStartedButton) {
      getStartedButton.addEventListener('click', function() {
        // Check if user is authenticated
        const isAuthenticated = localStorage.getItem('isAuthenticated');
        
        if (isAuthenticated) {
          // Redirect to dashboard
          window.location.href = 'dashboard.html';
        } else {
          // Redirect to login page
          window.location.href = 'login.html';
        }
      });
    }
    
    // Track Application button
    const trackAppButton = document.querySelector('.track-application-btn');
    if (trackAppButton) {
      trackAppButton.addEventListener('click', function() {
        // Check if user is authenticated
        const isAuthenticated = localStorage.getItem('isAuthenticated');
        
        if (isAuthenticated) {
          // Redirect to dashboard
          window.location.href = 'dashboard.html';
        } else {
          // Redirect to login page
          window.location.href = 'login.html';
        }
      });
    }
    
    // Close modal when clicking the close button
    if (closeModal) {
      closeModal.addEventListener('click', closeAuthModal);
    }
    
    // Close modal when clicking outside the modal content
    if (authModal) {
      authModal.addEventListener('click', function(e) {
        if (e.target === authModal) {
          closeAuthModal();
        }
      });
    }
    
    // Tab switching
    if (loginTabBtn) {
      loginTabBtn.addEventListener('click', function() {
        loginTabBtn.classList.add('active');
        registerTabBtn.classList.remove('active');
        loginForm.classList.add('active');
        registerForm.classList.remove('active');
        forgotPasswordForm.classList.remove('active');
      });
    }
    
    if (registerTabBtn) {
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
    
    // Login form submission
    if (loginSubmitBtn) {
      loginSubmitBtn.addEventListener('click', function() {
              // Login form submission (continued)
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
        // For demo purposes, we'll use the mock login
        // In a real app, you would call your API here
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('currentUser', JSON.stringify({
          name: emailInput.value.split('@')[0],
          email: emailInput.value,
          isNewUser: false
        }));
        
        // Update UI and redirect to dashboard
        updateAuthUI();
        closeAuthModal();
        window.location.href = 'dashboard.html';
      }
    });
  }
  
  // Register form submission
  if (registerSubmitBtn) {
    registerSubmitBtn.addEventListener('click', function() {
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
        
        // Update UI and redirect to dashboard
        updateAuthUI();
        closeAuthModal();
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
});


  
