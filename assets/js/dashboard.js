// Dashboard JavaScript

document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM fully loaded');
  
  // Check if user is authenticated - using token consistently
  const token = localStorage.getItem('token');
  const currentUser = localStorage.getItem('currentUser');
  
  // Only proceed if both token and user data exist
  if (!token || !currentUser) {
    // Clear any partial auth data
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isAuthenticated');
    
    // Redirect to login page
    window.location.href = 'login.html';
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
      
      // Clear ALL authentication data
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
      localStorage.removeItem('isAuthenticated');
      
      // Redirect to homepage instead of login page
      window.location.href = 'index.html';
    });
  }
  
  // Also update any other logout buttons
  const logoutBtns = document.querySelectorAll('.logout-btn');
  if (logoutBtns.length > 0) {
    logoutBtns.forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Clear ALL authentication data
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('isAuthenticated');
        
        // Redirect to homepage instead of login page
        window.location.href = 'index.html';
      });
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
  
  // Track Application and Support Modal Functionality
  const trackAppBtn = document.getElementById('trackAppBtn');
  const trackApplicationModal = document.getElementById('trackApplicationModal');
  const closeTrackModal = document.getElementById('closeTrackModal');
  const trackApplicationBtn = document.getElementById('trackApplicationBtn');
  const applicationIdInput = document.getElementById('applicationIdInput');
  const trackingResult = document.getElementById('trackingResult');
  const trackingError = document.getElementById('trackingError');
  
  // Support Modal
  const contactSupportBtn = document.getElementById('contactSupportBtn');
  const supportModal = document.getElementById('supportModal');
  const closeSupportModal = document.getElementById('closeSupportModal');
  const supportForm = document.getElementById('supportForm');
  const startChatBtn = document.getElementById('startChatBtn');
  
  console.log('Track button:', trackAppBtn);
  console.log('Track modal:', trackApplicationModal);
  console.log('Support button:', contactSupportBtn);
  console.log('Support modal:', supportModal);
  
  // Open Track Application Modal
  if (trackAppBtn) {
    trackAppBtn.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('Track button clicked');
      if (trackApplicationModal) {
        trackApplicationModal.style.display = 'block';
        // Reset the form
        if (applicationIdInput) applicationIdInput.value = '';
        if (trackingResult) trackingResult.style.display = 'none';
        if (trackingError) trackingError.style.display = 'none';
      }
    });
  }
  
  // Close Track Application Modal
  if (closeTrackModal) {
    closeTrackModal.addEventListener('click', function() {
      if (trackApplicationModal) {
        trackApplicationModal.style.display = 'none';
      }
    });
  }
  
  // Track Application Button Click
  if (trackApplicationBtn) {
    trackApplicationBtn.addEventListener('click', function() {
      const appId = applicationIdInput.value.trim();
      
      if (!appId) {
        alert('Please enter an application ID');
        return;
      }
      
      // Get user data
      const userData = JSON.parse(localStorage.getItem('currentUser')) || {};
      const userEmail = userData.email;
      
      // Get applications from localStorage
      let applications = [];
      if (userEmail) {
        const storedApplications = localStorage.getItem(`applications_${userEmail}`);
        if (storedApplications) {
          try {
            applications = JSON.parse(storedApplications);
          } catch (e) {
            console.error('Error parsing stored applications:', e);
          }
        }
      }
      
      // Find the application with the given ID
      const application = applications.find(app => app.id === appId);
      
      if (application) {
        // Show the result
        if (trackingResult) {
          trackingResult.style.display = 'block';
        }
        if (trackingError) {
          trackingError.style.display = 'none';
        }
        
        // Update the result with application details
        document.getElementById('resultAppId').textContent = application.id;
        document.getElementById('resultAppType').textContent = application.type;
        document.getElementById('resultAppDate').textContent = application.date;
        
        // Set status with appropriate styling
        const statusElement = document.getElementById('resultAppStatus');
        statusElement.textContent = application.status.charAt(0).toUpperCase() + application.status.slice(1);
        
        // Add status class for styling
        statusElement.className = ''; // Clear previous classes
        statusElement.classList.add('status', `status-${application.status}`);
        
        // Generate timeline
        const timelineContainer = document.getElementById('appTimeline');
        timelineContainer.innerHTML = ''; // Clear previous timeline
        
        if (application.timeline && application.timeline.length > 0) {
          application.timeline.forEach((item, index) => {
            const timelineItem = document.createElement('div');
            timelineItem.className = 'timeline-item';
            
            const timelineIcon = document.createElement('div');
            timelineIcon.className = 'timeline-icon';
            timelineIcon.innerHTML = '<i class="fas fa-circle"></i>';
            
            const timelineContent = document.createElement('div');
            timelineContent.className = 'timeline-content';
            
            const timelineDate = document.createElement('div');
            timelineDate.className = 'timeline-date';
            timelineDate.textContent = item.date;
            
            const timelineTitle = document.createElement('h4');
            timelineTitle.textContent = item.title;
            
            const timelineDesc = document.createElement('p');
            timelineDesc.textContent = item.description;
            
            timelineContent.appendChild(timelineDate);
            timelineContent.appendChild(timelineTitle);
            timelineContent.appendChild(timelineDesc);
            
            timelineItem.appendChild(timelineIcon);
            timelineItem.appendChild(timelineContent);
            
            timelineContainer.appendChild(timelineItem);
          });
        } else {
          timelineContainer.innerHTML = '<p>No timeline information available.</p>';
        }
      } else {
        // Show error message
        if (trackingResult) {
          trackingResult.style.display = 'none';
        }
        if (trackingError) {
          trackingError.style.display = 'block';
        }
      }
    });
  }
  
  // Open Support Modal
  if (contactSupportBtn) {
    contactSupportBtn.addEventListener('click', function(e) {
      e.preventDefault();
      if (supportModal) {
        supportModal.style.display = 'block';
      }
    });
  }
  
  // Close Support Modal
  if (closeSupportModal) {
    closeSupportModal.addEventListener('click', function() {
      if (supportModal) {
        supportModal.style.display = 'none';
      }
    });
  }
  
  // Support Form Submission
  if (supportForm) {
    supportForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const subject = document.getElementById('supportSubject').value;
      const message = document.getElementById('supportMessage').value;
      
      if (!subject || !message) {
        alert('Please fill in all fields');
        return;
      }
      
      // Here you would typically send the support request to a server
      // For now, we'll just show a success message
      alert('Your support request has been submitted. We will get back to you shortly.');
      
      // Reset the form
      supportForm.reset();
      
      // Close the modal
      if (supportModal) {
        supportModal.style.display = 'none';
      }
    });
  }
  
  // Start Chat Button
  if (startChatBtn) {
    startChatBtn.addEventListener('click', function() {
      alert('Live chat feature coming soon!');
    });
  }
  
  // Close modals when clicking outside
  window.addEventListener('click', function(event) {
    if (event.target === trackApplicationModal) {
      trackApplicationModal.style.display = 'none';
    }
    if (event.target === supportModal) {
      supportModal.style.display = 'none';
    }
  });
});

// Load user applications
function loadUserApplications() {
  const userData = JSON.parse(localStorage.getItem('currentUser')) || {};
  const userEmail = userData.email;
  if (!userEmail) return [];
  
  const storedApplications = localStorage.getItem(`applications_${userEmail}`);
  if (storedApplications) {
    try {
      return JSON.parse(storedApplications);
    } catch (e) {
      console.error('Error parsing stored applications:', e);
      return [];
    }
  }
  return [];
}

// Update dashboard statistics
function updateDashboardStats() {
  const applications = loadUserApplications();
  
  // Update total applications count
  const totalAppsElement = document.querySelector('.dashboard-card:nth-child(1) .card-value');
  if (totalAppsElement) {
    totalAppsElement.textContent = applications.length;
  }
  
  // Update approved applications count
  const approvedAppsElement = document.querySelector('.dashboard-card:nth-child(2) .card-value');
  if (approvedAppsElement) {
    const approvedCount = applications.filter(app => app.status === 'approved').length;
    approvedAppsElement.textContent = approvedCount;
  }
  
  // Update pending applications count
  const pendingAppsElement = document.querySelector('.dashboard-card:nth-child(3) .card-value');
  if (pendingAppsElement) {
    const pendingCount = applications.filter(app => 
      app.status === 'pending' || app.status === 'in-progress'
    ).length;
    pendingAppsElement.textContent = pendingCount;
  }
  
  // Update activity list
  updateActivityList(applications);
}

// Update activity list
function updateActivityList(applications) {
  const activityList = document.getElementById('activityList');
  const noActivity = document.querySelector('.no-activity');
  
  if (!activityList) return;
  
  if (applications.length === 0) {
    if (noActivity) {
      noActivity.style.display = 'block';
    }
    return;
  }
  
  // Hide no activity message
  if (noActivity) {
    noActivity.style.display = 'none';
  }
  
  // Sort applications by date (newest first)
  const sortedApps = [...applications].sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  );
  
  // Take only the 5 most recent applications
  const recentApps = sortedApps.slice(0, 5);
  
  // Clear existing activity items
  activityList.innerHTML = '';
  
  // Create activity items
  recentApps.forEach(app => {
    const activityItem = document.createElement('div');
    activityItem.className = 'activity-item';
    
    const statusClass = `status-${app.status}`;
    const formattedDate = new Date(app.date).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
    
    activityItem.innerHTML = `
      <div class="activity-icon ${statusClass}">
        <i class="fas fa-file-alt"></i>
      </div>
      <div class="activity-content">
        <div class="activity-title">
          ${app.type} - ${app.id}
          <span class="activity-date">${formattedDate}</span>
        </div>
        <div class="activity-status">
          Status: <span class="${statusClass}">${capitalizeFirstLetter(app.status)}</span>
        </div>
      </div>
    `;
    
    activityList.appendChild(activityItem);
  });
}

// Helper function to capitalize first letter
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// Call the update function when the page loads
document.addEventListener('DOMContentLoaded', function() {
  updateDashboardStats();
});