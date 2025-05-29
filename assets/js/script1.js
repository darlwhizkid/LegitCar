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

// Handle logout - Updated to use real API
async function handleLogout() {
  try {
    await propamitAPI.logout();
    updateAuthUI();
    window.location.href = 'index.html';
  } catch (error) {
    console.error('Logout error:', error);
    // Force logout even if API call fails
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isAuthenticated');
    updateAuthUI();
    window.location.href = 'index.html';
  }
}

// Update UI based on authentication status - Updated to use real API
function updateAuthUI() {
  const isAuthenticated = propamitAPI.isAuthenticated();
  const user = propamitAPI.getCurrentUser();
  
  if (isAuthenticated && user) {
    if (usernameElement) {
      usernameElement.textContent = user.name;
    }
    
    if (loginButtonElement) {
      loginButtonElement.style.display = 'none';
    }
    if (userDropdown) {
      userDropdown.style.display = 'block';
    }
    
    if (mobileAuthSection) {
      mobileAuthSection.style.display = 'none';
    }
    if (mobileUserSection) {
      mobileUserSection.style.display = 'block';
    }
  } else {
    if (loginButtonElement) {
      loginButtonElement.style.display = 'block';
    }
    if (userDropdown) {
      userDropdown.style.display = 'none';
    }
    
    if (mobileAuthSection) {
      mobileAuthSection.style.display = 'block';
    }
    if (mobileUserSection) {
      mobileUserSection.style.display = 'none';
    }
  }
}

// Function to check if user is logged in - Updated to use real API
function isUserLoggedIn() {
  return propamitAPI.isAuthenticated();
}

// Function to show login notification
function showLoginNotification() {
  alert('Please login first to access this feature.');
}

// Event Listeners
console.log('Script1.js loaded');

document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, setting up handlers');
  
  // Initialize date display
  updateDateDisplay();
  
  // Initialize auth UI
  updateAuthUI();
  
  // Mobile menu toggle
  if (menuButton) {
    menuButton.addEventListener('click', toggleMenu);
  }
  
  // Mobile dropdown toggle
  if (mobileServicesDropdown) {
    mobileServicesDropdown.addEventListener('click', toggleMobileDropdown);
  }
  
  // Logout functionality
  logoutButtons.forEach(button => {
    button.addEventListener('click', handleLogout);
  });

  // Login button click handlers
  if (loginButton) {
    loginButton.addEventListener('click', function() {
      window.location.href = 'login.html';
    });
  }
  
  if (mobileLoginButton) {
    mobileLoginButton.addEventListener('click', function() {
      window.location.href = 'login.html';
    });
  }
  
  // Get Started button functionality
  const getStartedButton = document.querySelector('.call-to-action');
  if (getStartedButton) {
    getStartedButton.addEventListener('click', function() {
      if (isUserLoggedIn()) {
        window.location.href = 'dashboard.html';
      } else {
        window.location.href = 'login.html';
      }
    });
  }
  
  // Track Application functionality
  const trackLinks = document.querySelectorAll('a[href="#track"]');
  
  trackLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopImmediatePropagation();
      
      if (!isUserLoggedIn()) {
        showLoginNotification();
        setTimeout(() => {
          window.location.href = 'login.html';
        }, 1000);
      } else {
        window.location.href = 'track-application.html';
      }
      
      return false;
    });
  });

  // Feature cards animation on scroll
  const featureCards = document.querySelectorAll('.feature-card');
  
  function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }
  
  function checkCards() {
    featureCards.forEach(card => {
      if (isInViewport(card)) {
        card.classList.add('visible');
      }
    });
  }
  
  window.addEventListener('scroll', checkCards);
  checkCards();

  // Testimonial cards animation on scroll
  const testimonialCards = document.querySelectorAll('.testimonial-card');
  
  function checkTestimonials() {
    testimonialCards.forEach(card => {
      if (isInViewport(card)) {
        card.classList.add('visible');
      }
    });
  }
  
  window.addEventListener('scroll', checkTestimonials);
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
  
  if (scrollButton) {
    // Set current year in footer
    const currentYearElement = document.getElementById('currentYear');
    if (currentYearElement) {
      currentYearElement.textContent = new Date().getFullYear();
    }
    
    function toggleScrollButtonVisibility() {
      if (window.pageYOffset > 300) {
        scrollButton.classList.add('visible');
      } else {
        scrollButton.classList.remove('visible');
      }
    }
    
    function scrollToTop() {
      const icon = scrollButton.querySelector('i');
      icon.classList.remove('fa-arrow-up');
      icon.classList.add('fa-car');
      
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      
      setTimeout(function() {
        icon.classList.remove('fa-car');
        icon.classList.add('fa-arrow-up');
      }, 1000);
    }
    
    window.addEventListener('scroll', toggleScrollButtonVisibility);
    scrollButton.addEventListener('click', scrollToTop);
    toggleScrollButtonVisibility();
  }
});
