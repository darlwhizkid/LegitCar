// Dashboard JavaScript

document.addEventListener('DOMContentLoaded', function() {
  // Check if user is authenticated
  const isAuthenticated = localStorage.getItem('isAuthenticated');
  if (!isAuthenticated) {
    // Redirect to home page if not authenticated
    window.location.href = 'index.html';
    return;
  }
  
  // Get user data
  const userData = JSON.parse(localStorage.getItem('currentUser'));
  
  // Update user greeting and profile picture
  updateUserInterface(userData);
  
  // User menu toggle
  const userMenuToggle = document.getElementById('userMenuToggle');
  const userDropdownMenu = document.getElementById('userDropdownMenu');
  
  if (userMenuToggle && userDropdownMenu) {
    userMenuToggle.addEventListener('click', function() {
      userDropdownMenu.classList.toggle('active');
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(event) {
      if (!userMenuToggle.contains(event.target) && !userDropdownMenu.contains(event.target)) {
        userDropdownMenu.classList.remove('active');
      }
    });
  }
    // Logout functionality
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', function(e) {
        e.preventDefault();
      
        // Clear authentication data
        localStorage.removeItem('isAuthenticated');
      
        // Redirect to home page
        window.location.href = 'index.html';
      });
    }
  // Show/hide new user message based on profile completion
  const newUserMessage = document.getElementById('newUserMessage');
  const activityList = document.getElementById('activityList');
  
  if (newUserMessage && activityList && userData) {
    // Check if profile is complete
    const isProfileComplete = checkProfileCompletion(userData);
    
    if (!isProfileComplete) {
      newUserMessage.style.display = 'flex';
      if (activityList) {
        activityList.style.display = 'none';
      }
    } else {
      newUserMessage.style.display = 'none';
      if (activityList) {
        activityList.style.display = 'block';
      }
    }
  }
  
  // Mobile sidebar toggle functionality
  const sidebarToggle = document.querySelector('.sidebar-toggle');
  const sidebar = document.querySelector('.dashboard-sidebar');
  
  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', function() {
      sidebar.classList.toggle('active');
      console.log('Sidebar toggle clicked'); // For debugging
    });
    
    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', function(event) {
      if (window.innerWidth <= 992) {
        if (!sidebar.contains(event.target) && !sidebarToggle.contains(event.target)) {
          sidebar.classList.remove('active');
        }
      }
    });
  }
  
  // Set current year in footer
  const currentYearElement = document.getElementById('currentYear');
  if (currentYearElement) {
    currentYearElement.textContent = new Date().getFullYear();
  }
  
  // Navigation active state
  const navLinks = document.querySelectorAll('.sidebar-nav a');
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      // Only prevent default for hash links
      if (this.getAttribute('href').startsWith('#')) {
        e.preventDefault();
        
        // Remove active class from all links
        navLinks.forEach(navLink => {
          navLink.parentElement.classList.remove('active');
        });
        
        // Add active class to clicked link
        this.parentElement.classList.add('active');
      }
    });
  });
});

// Function to update user interface with user data
function updateUserInterface(userData) {
  if (!userData) return;
  
  // Update user greeting
  const userGreeting = document.getElementById('userGreeting');
  if (userGreeting) {
    userGreeting.textContent = `Welcome, ${userData.name || 'User'}`;
  }
  
  // Update profile picture if available
  if (userData.profilePicture) {
    // Find all user avatar elements and update them
    const userAvatars = document.querySelectorAll('.user-avatar, .user-menu-toggle i.fa-user-circle');
    userAvatars.forEach(avatar => {
      if (avatar.tagName.toLowerCase() === 'img') {
        avatar.src = userData.profilePicture;
      } else {
        // For icon elements, replace with an image
        const img = document.createElement('img');
        img.src = userData.profilePicture;
        img.alt = 'User Avatar';
        img.className = 'user-avatar';
        img.style.width = '30px';
        img.style.height = '30px';
        img.style.borderRadius = '50%';
        img.style.objectFit = 'cover';
        
        // Replace the icon with the image
        avatar.parentNode.replaceChild(img, avatar);
      }
    });
  }
}

// Function to check if profile is complete
function checkProfileCompletion(userData) {
  // Define required fields for a complete profile
  const requiredFields = ['name', 'email', 'phone', 'address', 'nokName', 'nokRelationship', 'nokPhone', 'nokAddress'];
  
  // Check if all required fields exist and are not empty
  return requiredFields.every(field => 
    userData.hasOwnProperty(field) && 
    userData[field] && 
    userData[field].toString().trim() !== ''
  );
}