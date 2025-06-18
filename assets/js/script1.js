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

// Create mobile menu overlay
let mobileMenuOverlay = null;

// Initialize mobile menu overlay
function createMobileMenuOverlay() {
  if (!mobileMenuOverlay) {
    mobileMenuOverlay = document.createElement('div');
    mobileMenuOverlay.className = 'mobile-menu-overlay';
    mobileMenuOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      z-index: 999;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
    `;
    document.body.appendChild(mobileMenuOverlay);
    
    // Close menu when overlay is clicked
    mobileMenuOverlay.addEventListener('click', closeMobileMenu);
  }
}

// Toggle mobile menu
function toggleMenu() {
  console.log('Toggle menu clicked');
  
  if (!menuButton || !mobileMenu) {
    console.error('Menu button or mobile menu not found');
    return;
  }
  
  const isOpen = mobileMenu.classList.contains('open');
  
  if (isOpen) {
    closeMobileMenu();
  } else {
    openMobileMenu();
  }
}

// Open mobile menu
function openMobileMenu() {
  console.log('Opening mobile menu');
  
  if (menuButton) menuButton.classList.add('open');
  if (mobileMenu) mobileMenu.classList.add('open');
  
  // Create and show overlay
  createMobileMenuOverlay();
  if (mobileMenuOverlay) {
    mobileMenuOverlay.style.opacity = '1';
    mobileMenuOverlay.style.visibility = 'visible';
  }
  
  // Prevent body scroll
  document.body.style.overflow = 'hidden';
}

// Close mobile menu
function closeMobileMenu() {
  console.log('Closing mobile menu');
  
  if (menuButton) menuButton.classList.remove('open');
  if (mobileMenu) mobileMenu.classList.remove('open');
  
  // Hide overlay
  if (mobileMenuOverlay) {
    mobileMenuOverlay.style.opacity = '0';
    mobileMenuOverlay.style.visibility = 'hidden';
  }
  
  // Restore body scroll
  document.body.style.overflow = '';
  
  // Close any open dropdowns
  if (mobileDropdownMenu) {
    mobileDropdownMenu.classList.remove('open');
  }
  
  // Reset dropdown icon
  const dropdownIcon = mobileServicesDropdown?.querySelector('.fa-caret-down');
  if (dropdownIcon) {
    dropdownIcon.classList.remove('rotate');
  }
}

// Toggle mobile dropdown
function toggleMobileDropdown() {
  console.log('Toggle mobile dropdown clicked');
  
  if (!mobileDropdownMenu) {
    console.error('Mobile dropdown menu not found');
    return;
  }
  
  mobileDropdownMenu.classList.toggle('open');
  
  const icon = mobileServicesDropdown?.querySelector('.fa-caret-down');
  if (icon) {
    icon.classList.toggle('rotate');
  }
}

// Date display function - FIXED
function updateDateDisplay() {
  const date = new Date();
  const day = date.getDate();
  const month = date.toLocaleString('default', { month: 'short' });
  const year = date.getFullYear();
  
  const dayElement = document.getElementById('dayNumber');
  const monthElement = document.getElementById('month');
  const yearElement = document.getElementById('year');
  
  console.log('Updating date display:', { day, month, year });
  console.log('Elements found:', { dayElement, monthElement, yearElement });
  
  if (dayElement) {
    dayElement.textContent = day;
    console.log('Day updated to:', day);
  } else {
    console.error('Day element not found');
  }
  
  if (monthElement) {
    monthElement.textContent = month;
    console.log('Month updated to:', month);
  } else {
    console.error('Month element not found');
  }
  
  if (yearElement) {
    yearElement.textContent = year;
    console.log('Year updated to:', year);
  } else {
    console.error('Year element not found');
  }
}

// Handle logout
async function handleLogout() {
  try {
    // Close mobile menu first
    closeMobileMenu();
    
    // Check if propamitAPI exists
    if (typeof propamitAPI !== 'undefined' && propamitAPI.logout) {
      await propamitAPI.logout();
    } else {
      // Fallback logout
      localStorage.removeItem('userToken');
      localStorage.removeItem('currentUser');
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userName');
      localStorage.removeItem('userPicture');
    }
    
    updateAuthUI();
    window.location.href = 'index.html';
  } catch (error) {
    console.error('Logout error:', error);
    // Force logout even if API call fails
    localStorage.clear();
    updateAuthUI();
    window.location.href = 'index.html';
  }
}

// Wait for propamitAPI to be available
function waitForAPI() {
  return new Promise((resolve) => {
    if (window.propamitAPI) {
      resolve();
    } else {
      setTimeout(() => waitForAPI().then(resolve), 100);
    }
  });
}

// Update UI based on authentication status
function updateAuthUI() {
  if (!window.propamitAPI) {
    console.warn('propamitAPI not available yet');
    return;
  }

  let isAuthenticated = propamitAPI.isAuthenticated();
  let user = propamitAPI.getCurrentUser ? propamitAPI.getCurrentUser() : null;
  
  // Update desktop UI
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
  } else {
    if (loginButtonElement) {
      loginButtonElement.style.display = 'block';
    }
    if (userDropdown) {
      userDropdown.style.display = 'none';
    }
  }
  
  // Update mobile UI
  if (isAuthenticated && user) {
    if (mobileAuthSection) {
      mobileAuthSection.style.display = 'none';
    }
    if (mobileUserSection) {
      mobileUserSection.style.display = 'block';
      const mobileUsername = mobileUserSection.querySelector('#mobileUsername');
      if (mobileUsername) {
        mobileUsername.textContent = user.name;
      }
    }
  } else {
    if (mobileAuthSection) {
      mobileAuthSection.style.display = 'block';
    }
    if (mobileUserSection) {
      mobileUserSection.style.display = 'none';
    }
  }
}

// Function to check if user is logged in
function isUserLoggedIn() {
  if (!window.propamitAPI) {
    return false;
  }
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
  
  // Initialize date display FIRST
  updateDateDisplay();
  
  // Initialize auth UI
  updateAuthUI();
  
  // Mobile menu toggle
  if (menuButton) {
    console.log('Menu button found, adding click handler');
    menuButton.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      console.log('Menu button clicked');
      toggleMenu();
    });
  } else {
    console.error('Menu button not found! Looking for element with ID: menuButton');
  }
  
  // Mobile dropdown toggle
  if (mobileServicesDropdown) {
    mobileServicesDropdown.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      toggleMobileDropdown();
    });
  }
  
  // Handle escape key
  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && mobileMenu?.classList.contains('open')) {
      closeMobileMenu();
    }
  });
  
  // Logout functionality
  logoutButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      handleLogout();
    });
  });

  // Login button click handlers
  if (loginButton) {
    loginButton.addEventListener('click', function(e) {
      e.preventDefault();
      window.location.href = 'login.html';
    });
  }
  
  if (mobileLoginButton) {
    mobileLoginButton.addEventListener('click', function(e) {
      e.preventDefault();
      closeMobileMenu();
      window.location.href = 'login.html';
    });
  }
  
  // Get Started button functionality
  const getStartedButton = document.querySelector('.call-to-action');
  if (getStartedButton) {
    getStartedButton.addEventListener('click', function(e) {
      e.preventDefault();
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
      if (icon) {
        icon.classList.remove('fa-arrow-up');
        icon.classList.add('fa-car');
      }
      
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      
      setTimeout(function() {
        if (icon) {
          icon.classList.remove('fa-car');
          icon.classList.add('fa-arrow-up');
        }
      }, 1000);
    }
    
    window.addEventListener('scroll', toggleScrollButtonVisibility);
    scrollButton.addEventListener('click', scrollToTop);
    toggleScrollButtonVisibility();
  }
});
