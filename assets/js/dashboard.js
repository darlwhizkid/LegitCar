// Dashboard JavaScript - Propamit with Smart User Experience
class PropamitDashboard {
  constructor() {
    this.apiBaseUrl = window.location.hostname === 'localhost' ? 'http://localhost:3000/api' : '/api';
    this.token = localStorage.getItem('userToken');
    this.user = null;
    this.applications = [];
    this.isNewUser = false;
    this.userStats = {
      loginCount: 0,
      profileComplete: false,
      firstLogin: null,
      lastLogin: null
    };
    
    this.init();
  }

  async init() {
    console.log('Initializing Propamit Dashboard...');
    
    // Check authentication
    if (!this.token) {
      this.redirectToLogin();
      return;
    }

    try {
      // Show loading
      this.showLoading();
      
      // Verify token and get user data
      await this.verifyAuthentication();
      
      // Determine if user is new
      this.checkUserStatus();
      
      // Setup UI
      this.setupEventListeners();
      this.setupMobileHandlers();
      
      // Load dashboard data based on user status
      await this.loadDashboardData();
      
      // Show appropriate welcome experience
      this.setupWelcomeExperience();
      
      // Hide loading
      this.hideLoading();
      
      console.log('Dashboard initialized successfully');
      
    } catch (error) {
      console.error('Dashboard initialization failed:', error);
      this.handleAuthError();
    }
  }

  async verifyAuthentication() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Authentication failed');
      }

      const data = await response.json();
      this.user = data.user;
      
      // Get user stats from backend
      if (data.user.stats) {
        this.userStats = {
          loginCount: data.user.stats.loginCount || 0,
          profileComplete: this.checkProfileCompleteness(data.user),
          firstLogin: data.user.stats.firstLogin,
          lastLogin: data.user.stats.lastLogin
        };
      }
      
      // Update UI with user data
      this.updateUserInterface();
      
      console.log('Authentication verified:', this.user);
      console.log('User stats:', this.userStats);
      
    } catch (error) {
      console.error('Auth verification failed:', error);
      
      // Fallback to localStorage data for demo
      const userName = localStorage.getItem('userName');
      const userEmail = localStorage.getItem('userEmail');
      const registrationTime = localStorage.getItem('registrationTime');
      
      if (userName && userEmail) {
        this.user = { 
          name: userName, 
          email: userEmail,
          phone: localStorage.getItem('userPhone') || '',
          address: localStorage.getItem('userAddress') || '',
          createdAt: registrationTime || new Date().toISOString()
        };
        
        // Demo stats for new users
        this.userStats = {
          loginCount: parseInt(localStorage.getItem('loginCount') || '1'),
          profileComplete: this.checkProfileCompleteness(this.user),
          firstLogin: registrationTime || new Date().toISOString(),
          lastLogin: new Date().toISOString()
        };
        
        this.updateUserInterface();
        console.log('Using fallback user data');
      } else {
        throw error;
      }
    }
  }

  checkUserStatus() {
    // Determine if user is new (first time login or registered recently)
    const now = new Date();
    const registrationDate = new Date(this.user.createdAt || now);
    const daysSinceRegistration = (now - registrationDate) / (1000 * 60 * 60 * 24);
    
    this.isNewUser = (
      this.userStats.loginCount <= 2 || // First or second login
      daysSinceRegistration <= 1 || // Registered within last 24 hours
      !this.userStats.profileComplete // Profile not complete
    );
    
    console.log('User status check:', {
      isNewUser: this.isNewUser,
      loginCount: this.userStats.loginCount,
      daysSinceRegistration: daysSinceRegistration.toFixed(1),
      profileComplete: this.userStats.profileComplete
    });
  }

  checkProfileCompleteness(user) {
    const requiredFields = ['name', 'email', 'phone'];
    const optionalFields = ['address', 'dateOfBirth'];
    
    const requiredComplete = requiredFields.every(field => user[field] && user[field].trim());
    const optionalComplete = optionalFields.some(field => user[field] && user[field].trim());
    
    return requiredComplete && optionalComplete;
  }

  updateUserInterface() {
    // Update user name and email
    const userNameEl = document.getElementById('userName');
    const userEmailEl = document.getElementById('userEmail');

    if (userNameEl && this.user.name) {
      userNameEl.textContent = this.user.name;
    }

    if (userEmailEl && this.user.email) {
      userEmailEl.textContent = this.user.email;
    }
  }

  setupWelcomeExperience() {
    const welcomeMessageEl = document.getElementById('welcomeMessage');
    const welcomeSection = document.querySelector('.welcome-section');
    const dashboardContainer = document.querySelector('.dashboard-container');
    
    // Add profile complete class to body/container for styling
    if (this.userStats.profileComplete) {
      if (dashboardContainer) {
        dashboardContainer.classList.add('profile-complete');
      }
      document.body.classList.add('profile-complete');
    }
    
    if (this.isNewUser) {
      // New user experience
      if (welcomeMessageEl) {
        const firstName = this.user.name.split(' ')[0];
        if (this.userStats.profileComplete) {
          welcomeMessageEl.textContent = `Congratulations, ${firstName}!`;
        } else {
          welcomeMessageEl.textContent = `Welcome, ${firstName}!`;
        }
      }
      
      // Add new user welcome content
      this.addNewUserWelcome();
      
      // Show profile completion prompt (only if not complete)
      if (!this.userStats.profileComplete) {
        this.showProfileCompletionPrompt();
      }
      
    } else {
      // Returning user experience
      if (welcomeMessageEl) {
        const firstName = this.user.name.split(' ')[0];
        const timeOfDay = this.getTimeOfDay();
        
        if (this.userStats.profileComplete) {
          welcomeMessageEl.textContent = `${timeOfDay}, ${firstName}!`;
        } else {
          welcomeMessageEl.textContent = `${timeOfDay}, ${firstName}!`;
        }
      }
    }
  }

  addNewUserWelcome() {
    const welcomeSection = document.querySelector('.welcome-section');
    if (!welcomeSection) return;
    
    // Update welcome text for new users
    const welcomeText = welcomeSection.querySelector('.welcome-text p');
    if (welcomeText) {
      welcomeText.textContent = "Let's get you started with your first application. Complete your profile for a smoother experience.";
    }
    
    // Add getting started steps
    const gettingStartedHTML = `
      <div class="getting-started-section">
        <h3>🚀 Getting Started</h3>
        <div class="steps-container">
          <div class="step-item ${this.userStats.profileComplete ? 'completed' : ''}">
            <div class="step-number">1</div>
            <div class="step-content">
              <h4>Complete Your Profile</h4>
              <p>Add your personal information for faster processing</p>
              ${!this.userStats.profileComplete ? '<a href="profile.html" class="step-action">Complete Now</a>' : '<span class="step-done">✓ Completed</span>'}
            </div>
          </div>
          
          <div class="step-item">
            <div class="step-number">2</div>
            <div class="step-content">
              <h4>Submit Your First Application</h4>
              <p>Choose from vehicle registration, renewals, or transfers</p>
              <a href="new-application.html" class="step-action">Start Application</a>
            </div>
          </div>
          
          <div class="step-item">
            <div class="step-number">3</div>
            <div class="step-content">
              <h4>Track Your Progress</h4>
              <p>Monitor your application status in real-time</p>
              <span class="step-info">Available after submission</span>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Insert after welcome section
    welcomeSection.insertAdjacentHTML('afterend', gettingStartedHTML);
  }

  showProfileCompletionPrompt() {
    if (this.userStats.profileComplete) return;
    
    const completionPercentage = this.calculateProfileCompletion();
    
    const promptHTML = `
      <div class="profile-completion-card dashboard-card">
        <div class="card-header">
          <h3>Complete Your Profile</h3>
          <span class="completion-percentage">${completionPercentage}% Complete</span>
        </div>
        <div class="card-content">
          <div class="completion-bar">
            <div class="completion-progress" style="width: ${completionPercentage}%"></div>
          </div>
          <p>Complete your profile to unlock all features and speed up your applications.</p>
          <div class="missing-fields">
            ${this.getMissingFieldsHTML()}
          </div>
          <a href="profile.html" class="btn btn-primary">
            <i class="fas fa-user-edit"></i>
            Complete Profile
          </a>
        </div>
      </div>
    `;
    
    // Insert at the beginning of dashboard content
    const dashboardContent = document.querySelector('.dashboard-content');
    const statsGrid = document.querySelector('.stats-grid');
    
    if (dashboardContent && statsGrid) {
      statsGrid.insertAdjacentHTML('beforebegin', promptHTML);
    }
  }

  calculateProfileCompletion() {
    const fields = {
      name: this.user.name,
      email: this.user.email,
      phone: this.user.phone,
      address: this.user.address,
      dateOfBirth: this.user.dateOfBirth
    };
    
    const completedFields = Object.values(fields).filter(value => value && value.trim()).length;
    return Math.round((completedFields / Object.keys(fields).length) * 100);
  }

  getMissingFieldsHTML() {
    const missingFields = [];
    
    if (!this.user.phone) missingFields.push('Phone Number');
    if (!this.user.address) missingFields.push('Address');
    if (!this.user.dateOfBirth) missingFields.push('Date of Birth');
    
    if (missingFields.length === 0) return '';
    
    return `
      <div class="missing-fields-list">
        <strong>Missing:</strong> ${missingFields.join(', ')}
      </div>
    `;
  }

  getTimeOfDay() {
    const hour = new Date().getHours();
    
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }

  async loadDashboardData() {
    try {
      console.log('Loading dashboard data...');
      
      if (this.isNewUser) {
        // New users get clean dashboard
        this.applications = [];
        console.log('New user - showing clean dashboard');
      } else {
        // Existing users get their data
        await this.loadApplicationsFromBackend();
      }
      
    } catch (error) {
      console.error('Backend data loading failed:', error);
      
      if (!this.isNewUser) {
        // Only load demo data for existing users
        this.loadDemoData();
      }
    }
    
    // Update UI with loaded data
    this.updateDashboardStats();
    this.displayRecentApplications();
  }

  async loadApplicationsFromBackend() {
    const response = await fetch(`${this.apiBaseUrl}/applications`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      this.applications = data.applications || [];
      console.log('Applications loaded from backend:', this.applications);
    } else {
      throw new Error('Failed to load applications from backend');
    }
  }

  loadDemoData() {
    // Only for existing users - demo applications data
    this.applications = [
      {
        _id: 'APP001',
        applicationId: 'VR-2024-001',
        type: 'Vehicle Registration',
        status: 'pending',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: 'APP002',
        applicationId: 'DR-2024-002',
        type: 'Document Renewal',
        status: 'approved',
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        updatedAt: new Date(Date.now() - 43200000).toISOString()
      }
    ];
    
    console.log('Demo data loaded for existing user:', this.applications);
  }

  updateDashboardStats() {
    const stats = {
      total: this.applications.length,
      pending: this.applications.filter(app => app.status === 'pending').length,
      approved: this.applications.filter(app => app.status === 'approved').length,
      processing: this.applications.filter(app => app.status === 'processing').length
    };

    // Update stat cards
    this.updateElement('totalApplications', stats.total);
    this.updateElement('pendingApplications', stats.pending);
    this.updateElement('approvedApplications', stats.approved);
    this.updateElement('processingApplications', stats.processing);

    // Update messages badge
    this.updateElement('messagesBadge', this.isNewUser ? 0 : Math.floor(Math.random() * 3));

    console.log('Dashboard stats updated:', stats);
  }

  displayRecentApplications() {
    const container = document.getElementById('recentApplications');
    if (!container) return;

    if (this.applications.length === 0) {
      container.innerHTML = this.getEmptyApplicationsHTML();
      return;
    }

    // Sort by date and take first 5
    const recentApps = this.applications
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    const applicationsHTML = recentApps.map(app => `
      <div class="application-item fade-in">
        <div class="application-info">
          <h4>${app.type || 'Application'}</h4>
          <p>ID: ${app.applicationId || app._id}</p>
          <span class="application-date">${this.formatDate(app.createdAt)}</span>
        </div>
        <span class="status-badge ${app.status}">${app.status}</span>
      </div>
    `).join('');

    container.innerHTML = applicationsHTML;
  }

  getEmptyApplicationsHTML() {
    if (this.isNewUser) {
      return `
        <div class="empty-state new-user">
          <div class="welcome-illustration">
            <i class="fas fa-rocket"></i>
          </div>
          <h3>Ready to Get Started?</h3>
          <p>You haven't submitted any applications yet. Let's create your first one!</p>
          <div class="empty-actions">
            <a href="new-application.html" class="btn btn-primary">
              <i class="fas fa-plus"></i>
              Create First Application
            </a>
            <a href="profile.html" class="btn btn-outline">
              <i class="fas fa-user"></i>
              Complete Profile First
            </a>
          </div>
        </div>
      `;
    } else {
      return `
        <div class="empty-state">
          <i class="fas fa-file-alt"></i>
          <h3>No Recent Applications</h3>
          <p>Your recent applications will appear here</p>
          <a href="new-application.html" class="btn btn-primary">
            <i class="fas fa-plus"></i>
            New Application
          </a>
        </div>
      `;
    }
  }

  setupEventListeners() {
    // Sidebar toggle
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    const mobileOverlay = document.getElementById('mobileOverlay');

    if (sidebarToggle && sidebar) {
      sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('active');
        mobileOverlay.classList.toggle('active');
      });
    }

        // Sidebar close
    const sidebarClose = document.getElementById('sidebarClose');
    if (sidebarClose) {
      sidebarClose.addEventListener('click', () => {
        sidebar.classList.remove('active');
        mobileOverlay.classList.remove('active');
      });
    }

    // Mobile overlay click
    if (mobileOverlay) {
      mobileOverlay.addEventListener('click', () => {
        sidebar.classList.remove('active');
        mobileOverlay.classList.remove('active');
      });
    }

    // User menu toggle
    const userMenuToggle = document.getElementById('userMenuToggle');
    const userDropdown = document.getElementById('userDropdown');

    if (userMenuToggle && userDropdown) {
      userMenuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        userDropdown.classList.toggle('active');
      });

      // Close dropdown when clicking outside
      document.addEventListener('click', (e) => {
        if (!userMenuToggle.contains(e.target) && !userDropdown.contains(e.target)) {
          userDropdown.classList.remove('active');
        }
      });
    }

    // Logout buttons
    const logoutButtons = document.querySelectorAll('#logoutBtn, #headerLogoutBtn');
    logoutButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleLogout();
      });
    });

    // Application tracking
    const trackBtn = document.getElementById('trackBtn');
    const trackingInput = document.getElementById('trackingInput');

    if (trackBtn && trackingInput) {
      trackBtn.addEventListener('click', () => {
        this.trackApplication();
      });

      trackingInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.trackApplication();
        }
      });
    }

    // Navigation items active state
    this.setActiveNavItem();
  }

  setupMobileHandlers() {
    // Handle window resize
    window.addEventListener('resize', () => {
      const sidebar = document.getElementById('sidebar');
      const mobileOverlay = document.getElementById('mobileOverlay');
      
      if (window.innerWidth > 768) {
        if (sidebar) sidebar.classList.remove('active');
        if (mobileOverlay) mobileOverlay.classList.remove('active');
      }
    });

    // Handle escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const sidebar = document.getElementById('sidebar');
        const mobileOverlay = document.getElementById('mobileOverlay');
        const userDropdown = document.getElementById('userDropdown');
        
        if (sidebar && sidebar.classList.contains('active')) {
          sidebar.classList.remove('active');
          mobileOverlay.classList.remove('active');
        }
        
        if (userDropdown && userDropdown.classList.contains('active')) {
          userDropdown.classList.remove('active');
        }
      }
    });
  }

  setActiveNavItem() {
    const currentPage = window.location.pathname.split('/').pop() || 'dashboard.html';
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
      item.classList.remove('active');
      if (item.getAttribute('href') === currentPage) {
        item.classList.add('active');
      }
    });
  }

  async trackApplication() {
    const trackingInput = document.getElementById('trackingInput');
    const trackingResult = document.getElementById('trackingResult');
    const trackingError = document.getElementById('trackingError');
    
    if (!trackingInput) return;
    
    const applicationId = trackingInput.value.trim();
    
    if (!applicationId) {
      this.showNotification('Please enter an application ID', 'warning');
      return;
    }

    try {
      // Hide previous results
      if (trackingResult) trackingResult.style.display = 'none';
      if (trackingError) trackingError.style.display = 'none';

      // Try to find in backend first
      let application = await this.findApplicationInBackend(applicationId);
      
      // Fallback to local data
      if (!application) {
        application = this.applications.find(app => 
          app.applicationId === applicationId || app._id === applicationId
        );
      }

      if (application) {
        this.displayTrackingResult(application);
        this.showNotification('Application found successfully', 'success');
      } else {
        this.displayTrackingError();
        this.showNotification('Application not found', 'error');
      }

    } catch (error) {
      console.error('Tracking error:', error);
      this.displayTrackingError();
      this.showNotification('Error tracking application', 'error');
    }
  }

  async findApplicationInBackend(applicationId) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/applications/${applicationId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        return data.application;
      }
    } catch (error) {
      console.error('Backend tracking failed:', error);
    }
    
    return null;
  }

  displayTrackingResult(application) {
    const trackingResult = document.getElementById('trackingResult');
    if (!trackingResult) return;

    // Update result fields
    this.updateElement('resultAppId', application.applicationId || application._id);
    this.updateElement('resultAppType', application.type || 'N/A');
    this.updateElement('resultAppStatus', application.status || 'N/A');
    this.updateElement('resultAppDate', this.formatDate(application.createdAt));

    // Show result
    trackingResult.style.display = 'block';
  }

  displayTrackingError() {
    const trackingError = document.getElementById('trackingError');
    if (trackingError) {
      trackingError.style.display = 'block';
    }
  }

  async handleLogout() {
    try {
      // Show loading
      this.showLoading();

      // Try to call backend logout
      try {
        await fetch(`${this.apiBaseUrl}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
          }
        });
      } catch (error) {
        console.error('Backend logout failed:', error);
      }

      // Clear local storage
      localStorage.clear();
      
      // Show success message
      this.showNotification('Logged out successfully', 'success');
      
      // Redirect after short delay
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1000);

    } catch (error) {
      console.error('Logout error:', error);
      
      // Force logout
      localStorage.clear();
      window.location.href = 'index.html';
    }
  }

  redirectToLogin() {
    console.log('No authentication token, redirecting to login');
    window.location.href = 'login.html';
  }

  handleAuthError() {
    console.error('Authentication error, clearing storage and redirecting');
    localStorage.clear();
    this.showNotification('Session expired. Please login again.', 'error');
    
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 2000);
  }

  // Utility Methods
  updateElement(id, value) {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = value;
    }
  }

  formatDate(dateString) {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  }

  showLoading() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
      loadingOverlay.classList.add('active');
    }
  }

  hideLoading() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
      loadingOverlay.classList.remove('active');
    }
  }

  showNotification(message, type = 'info', title = null) {
    const container = document.getElementById('notificationContainer');
    if (!container) return;

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    // Get icon based on type
    const icons = {
      success: 'fas fa-check-circle',
      error: 'fas fa-exclamation-circle',
      warning: 'fas fa-exclamation-triangle',
      info: 'fas fa-info-circle'
    };

    notification.innerHTML = `
      <div class="notification-icon">
        <i class="${icons[type] || icons.info}"></i>
      </div>
      <div class="notification-content">
        ${title ? `<div class="notification-title">${title}</div>` : ''}
        <div class="notification-message">${message}</div>
      </div>
      <button class="notification-close">
        <i class="fas fa-times"></i>
      </button>
    `;

    // Add to container
    container.appendChild(notification);

    // Show notification
    setTimeout(() => {
      notification.classList.add('show');
    }, 100);

    // Auto-hide after 5 seconds
    const autoHideTimer = setTimeout(() => {
      this.hideNotification(notification);
    }, 5000);

    // Close button
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
      clearTimeout(autoHideTimer);
      this.hideNotification(notification);
    });

    return notification;
  }

  hideNotification(notification) {
    notification.classList.remove('show');
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.propamitDashboard = new PropamitDashboard();
});

// Export for potential use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PropamitDashboard;
}
