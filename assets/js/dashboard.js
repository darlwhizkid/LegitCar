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
  
  // Set current year in footer
  const currentYearElement = document.getElementById('currentYear');
  if (currentYearElement) {
    currentYearElement.textContent = new Date().getFullYear();
  }
  
  // IMPROVED SIDEBAR TOGGLE FUNCTIONALITY
  // This approach uses event delegation to ensure the toggle works
  // even when the DOM changes or content is loaded dynamically
  
  // First, make sure we have a sidebar toggle button
  let sidebarToggle = document.querySelector('.sidebar-toggle');
  const sidebar = document.querySelector('.dashboard-sidebar');
  
  // If no toggle exists but we have a sidebar, create a toggle button
  if (!sidebarToggle && sidebar) {
    sidebarToggle = document.createElement('button');
    sidebarToggle.className = 'sidebar-toggle';
    sidebarToggle.innerHTML = '<span></span><span></span><span></span>';
    document.querySelector('.dashboard-header .container').appendChild(sidebarToggle);
  }
  
  // Use event delegation on the document body for the sidebar toggle
  document.body.addEventListener('click', function(event) {
    // Check if the clicked element is the sidebar toggle or inside it
    if (event.target.closest('.sidebar-toggle')) {
      event.preventDefault();
      if (sidebar) {
        sidebar.classList.toggle('active');
        console.log('Sidebar toggle clicked via delegation');
      }
    }
    
    // Close sidebar when clicking outside on mobile
    if (window.innerWidth <= 992) {
      const clickedInsideSidebar = event.target.closest('.dashboard-sidebar');
      const clickedOnToggle = event.target.closest('.sidebar-toggle');
      
      if (!clickedInsideSidebar && !clickedOnToggle && sidebar && sidebar.classList.contains('active')) {
        sidebar.classList.remove('active');
      }
    }
  });
  
  // Navigation active state with improved event delegation
  document.body.addEventListener('click', function(event) {
    const navLink = event.target.closest('.sidebar-nav a');
    
    if (navLink) {
      // Only handle hash links
      if (navLink.getAttribute('href').startsWith('#')) {
        event.preventDefault();
        
        // Remove active class from all links
        document.querySelectorAll('.sidebar-nav a').forEach(link => {
          link.parentElement.classList.remove('active');
        });
        
        // Add active class to clicked link
        navLink.parentElement.classList.add('active');
        
        // Get the target section ID
        const targetId = navLink.getAttribute('href').substring(1);
        
        // Hide all sections
        document.querySelectorAll('.dashboard-main > div[id]').forEach(section => {
          section.style.display = 'none';
        });
        
        // Show the target section
        const targetSection = document.getElementById(targetId);
        if (targetSection) {
          targetSection.style.display = 'block';
        }
      }
    }
  });
  
  // Make sure the sidebar toggle is visible on mobile
  function updateToggleVisibility() {
    if (sidebarToggle) {
      if (window.innerWidth <= 992) {
        sidebarToggle.style.display = 'block';
      } else {
        sidebarToggle.style.display = 'none';
        // On desktop, always show sidebar
        if (sidebar) {
          sidebar.classList.add('active');
        }
      }
    }
  }
  
  // Update toggle visibility on resize
  window.addEventListener('resize', updateToggleVisibility);
  
  // Initialize on page load
  updateToggleVisibility();
  
  // Handle profile link specifically
  const profileLinks = document.querySelectorAll('a[href="#profile"]');
  profileLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      // Make sure the sidebar toggle still works after loading profile
      setTimeout(function() {
        updateToggleVisibility();
      }, 100);
    });
  });
});