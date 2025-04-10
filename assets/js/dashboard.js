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
  
  // Update user greeting
  const userGreeting = document.getElementById('userGreeting');
  if (userGreeting && userData) {
    userGreeting.textContent = `Welcome, ${userData.name}`;
  }
  
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
      localStorage.removeItem('currentUser');
      
      // Redirect to home page
      window.location.href = 'index.html';
    });
  }
  
  // Show/hide new user message
  const newUserMessage = document.getElementById('newUserMessage');
  const activityList = document.getElementById('activityList');
  
  if (newUserMessage && activityList && userData) {
    if (userData.isNewUser) {
      newUserMessage.style.display = 'flex';
    } else {
      newUserMessage.style.display = 'none';
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
