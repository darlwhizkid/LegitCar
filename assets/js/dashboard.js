// Dashboard JavaScript - Propamit with Smart User Experience
class PropamitDashboard {
  constructor() {
    this.apiBaseUrl = API_CONFIG.BASE_URL + '/api'; // Use centralized config
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
    if (!this.token || !propamitAPI.isAuthenticated()) {
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
      
      // Load user applications
      await this.loadUserApplications();
      
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
      const response = await ApiService.get('/auth/me');
      this.user = response.user;
      
      // Get user stats from backend
      if (response.user.stats) {
        this.userStats = {
          loginCount: response.user.stats.loginCount || 0,
          profileComplete: response.user.stats.profileComplete || false,
          firstLogin: response.user.stats.firstLogin,
          lastLogin: response.user.stats.lastLogin
        };
      }
      
    } catch (error) {
      console.error('Authentication verification failed:', error);
      throw error;
    }
  }

  async loadUserApplications() {
    try {
      const response = await ApplicationTracker.getUserApplications();
      this.applications = response.applications || [];
      this.updateApplicationsDisplay();
    } catch (error) {
      console.error('Failed to load applications:', error);
    }
  }

  updateApplicationsDisplay() {
    // Update application statistics
    const totalApps = this.applications.length;
    const pendingApps = this.applications.filter(app => app.status === 'pending' || app.status === 'submitted').length;
    const approvedApps = this.applications.filter(app => app.status === 'approved').length;

    // Update UI elements
    const totalAppsEl = document.getElementById('totalApplications');
    const pendingAppsEl = document.getElementById('pendingApplications');
    const approvedAppsEl = document.getElementById('approvedApplications');

    if (totalAppsEl) totalAppsEl.textContent = totalApps;
    if (pendingAppsEl) pendingAppsEl.textContent = pendingApps;
    if (approvedAppsEl) approvedAppsEl.textContent = approvedApps;

    // Display recent applications
    this.displayRecentApplications();
  }

  displayRecentApplications() {
    const recentAppsContainer = document.getElementById('recentApplications');
    if (!recentAppsContainer) return;

    const recentApps = this.applications
      .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
      .slice(0, 5);

    if (recentApps.length === 0) {
      recentAppsContainer.innerHTML = '<p class="no-applications">No applications found. <a href="apply.html">Submit your first application</a></p>';
      return;
    }

    recentAppsContainer.innerHTML = recentApps.map(app => `
      <div class="application-item" data-id="${app.id || app._id}">
        <div class="app-info">
          <h4>${app.type || 'Application'}</h4>
          <p class="app-id">ID: ${app.trackingNumber || app.id || app._id}</p>
          <p class="app-date">Submitted: ${new Date(app.submittedAt).toLocaleDateString()}</p>
        </div>
        <div class="app-status">
          <span class="status-badge status-${app.status}">${app.status}</span>
          <button class="track-btn" onclick="dashboard.trackApplication('${app.id || app._id}')">
            Track
          </button>
        </div>
      </div>
    `).join('');
  }

  async trackApplication(applicationId) {
    try {
      const trackingData = await ApplicationTracker.trackApplication(applicationId);
      this.showTrackingModal(trackingData);
    } catch (error) {
      console.error('Failed to track application:', error);
      this.showNotification('Failed to load tracking information', 'error');
    }
  }

  showTrackingModal(trackingData) {
    // Create and show tracking modal
    const modal = document.createElement('div');
    modal.className = 'modal tracking-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>Application Tracking</h3>
          <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
        </div>
        <div class="modal-body">
          <div class="tracking-info">
            <h4>Application ID: ${trackingData.trackingNumber || trackingData.id}</h4>
            <p><strong>Status:</strong> <span class="status-badge status-${trackingData.status}">${trackingData.status}</span></p>
            <p><strong>Submitted:</strong> ${new Date(trackingData.submittedAt).toLocaleString()}</p>
            ${trackingData.lastUpdated ? `<p><strong>Last Updated:</strong> ${new Date(trackingData.lastUpdated).toLocaleString()}</p>` : ''}
          </div>
          <div class="tracking-timeline">
            <h5>Progress Timeline</h5>
            ${this.generateTimelineHTML(trackingData.timeline || [])}
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'flex';
  }

  generateTimelineHTML(timeline) {
    if (!timeline.length) {
      return '<p>No timeline data available</p>';
    }

    return timeline.map(item => `
      <div class="timeline-item">
        <div class="timeline-date">${new Date(item.date).toLocaleString()}</div>
        <div class="timeline-content">
          <h6>${item.title}</h6>
          <p>${item.description}</p>
        </div>
      </div>
    `).join('');
  }

  // Loading and UI methods
  showLoading() {
    const loadingEl = document.getElementById('dashboardLoading');
    if (loadingEl) {
      loadingEl.style.display = 'flex';
    }
  }

  hideLoading() {
    const loadingEl = document.getElementById('dashboardLoading');
    if (loadingEl) {
      loadingEl.style.display = 'none';
    }
  }

  // Check if user is new based on login count and profile completion
  checkUserStatus() {
    this.isNewUser = this.userStats.loginCount <= 1 || !this.userStats.profileComplete;
  }

  // Setup welcome experience for new users
  setupWelcomeExperience() {
    if (this.isNewUser) {
      this.showWelcomeModal();
    }
    
    // Update user info in header
    this.updateUserInterface();
  }

  showWelcomeModal() {
    const modal = document.createElement('div');
    modal.className = 'modal welcome-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>Welcome to Propamit!</h3>
        </div>
        <div class="modal-body">
          <div class="welcome-content">
            <h4>Hello ${this.user.name}!</h4>
            <p>Welcome to your Propamit dashboard. Here's what you can do:</p>
            <ul>
              <li>Submit new applications</li>
              <li>Track your application progress</li>
              <li>Upload and manage documents</li>
              <li>Receive important messages</li>
              <li>Update your profile settings</li>
            </ul>
            <div class="welcome-actions">
              <button class="btn btn-primary" onclick="this.closest('.modal').remove(); window.location.href='apply.html'">
                Start New Application
              </button>
              <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">
                Explore Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'flex';
  }

  // Update user interface elements
  updateUserInterface() {
    const userNameEl = document.getElementById('userName');
    const userEmailEl = document.getElementById('userEmail');
    
    if (userNameEl && this.user.name) {
      userNameEl.textContent = this.user.name;
    }
    
    if (userEmailEl && this.user.email) {
      userEmailEl.textContent = this.user.email;
    }
  }

  // Load dashboard data
  async loadDashboardData() {
    try {
      // Load recent activities, notifications, etc.
      await this.loadRecentActivities();
      await this.loadNotifications();
      await this.loadQuickStats();
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  }

  async loadRecentActivities() {
    try {
      const response = await ApiService.get('/user/activities');
      const activities = response.activities || [];
      this.displayRecentActivities(activities);
    } catch (error) {
      console.error('Failed to load recent activities:', error);
    }
  }

  displayRecentActivities(activities) {
    const activitiesContainer = document.getElementById('recentActivities');
    if (!activitiesContainer) return;

    if (activities.length === 0) {
      activitiesContainer.innerHTML = '<p class="no-activities">No recent activities</p>';
      return;
    }

    activitiesContainer.innerHTML = activities.slice(0, 5).map(activity => `
      <div class="activity-item">
        <div class="activity-icon">
          <i class="fas fa-${this.getActivityIcon(activity.type)}"></i>
        </div>
        <div class="activity-content">
          <p class="activity-text">${activity.description}</p>
          <span class="activity-time">${Utils.formatDate(activity.createdAt)}</span>
        </div>
      </div>
    `).join('');
  }

  getActivityIcon(type) {
    const icons = {
      'application': 'file-alt',
      'document': 'upload',
      'message': 'envelope',
      'profile': 'user',
      'login': 'sign-in-alt'
    };
    return icons[type] || 'info-circle';
  }

  async loadNotifications() {
    try {
      const response = await ApiService.get('/user/notifications');
      const notifications = response.notifications || [];
      this.displayNotifications(notifications);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  }

  displayNotifications(notifications) {
    const notificationsContainer = document.getElementById('notifications');
    if (!notificationsContainer) return;

    const unreadNotifications = notifications.filter(n => !n.read);
    
    // Update notification badge
    const notificationBadge = document.getElementById('notificationBadge');
    if (notificationBadge) {
      notificationBadge.textContent = unreadNotifications.length;
      notificationBadge.style.display = unreadNotifications.length > 0 ? 'block' : 'none';
    }

    if (notifications.length === 0) {
      notificationsContainer.innerHTML = '<p class="no-notifications">No notifications</p>';
      return;
    }

    notificationsContainer.innerHTML = notifications.slice(0, 5).map(notification => `
      <div class="notification-item ${notification.read ? '' : 'unread'}">
        <div class="notification-content">
          <h5>${notification.title}</h5>
          <p>${notification.message}</p>
          <span class="notification-time">${Utils.formatDate(notification.createdAt)}</span>
        </div>
        ${!notification.read ? '<div class="unread-indicator"></div>' : ''}
      </div>
    `).join('');
  }

  async loadQuickStats() {
    try {
      const response = await ApiService.get('/user/stats');
      const stats = response.stats || {};
      this.displayQuickStats(stats);
    } catch (error) {
      console.error('Failed to load quick stats:', error);
    }
  }

  displayQuickStats(stats) {
    // Update various stat elements
    const elements = {
      'totalDocuments': stats.totalDocuments || 0,
      'unreadMessages': stats.unreadMessages || 0,
      'profileCompletion': stats.profileCompletion || 0
    };

    Object.keys(elements).forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        element.textContent = elements[id];
      }
    });
  }

  // Event listeners setup
  setupEventListeners() {
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

    // Logout functionality
    const logoutBtns = document.querySelectorAll('.logout-btn');
    logoutBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleLogout();
      });
    });

    // Quick action buttons
    const quickActionBtns = document.querySelectorAll('.quick-action-btn');
    quickActionBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = btn.dataset.action;
        this.handleQuickAction(action);
      });
    });
  }

  setupMobileHandlers() {
    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    
    if (mobileMenuBtn && mobileMenu) {
      mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('active');
      });
    }

    // Mobile sidebar toggle
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    
    if (sidebarToggle && sidebar) {
      sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('mobile-active');
      });
    }

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
      if (mobileMenu && !mobileMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
        mobileMenu.classList.remove('active');
      }
      
      if (sidebar && !sidebar.contains(e.target) && !sidebarToggle.contains(e.target)) {
        sidebar.classList.remove('mobile-active');
      }
    });

    // Handle mobile responsive cards
    this.handleMobileCards();
  }

  handleMobileCards() {
    const cards = document.querySelectorAll('.dashboard-card');
    cards.forEach(card => {
      card.addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
          // Add mobile interaction for cards
          card.classList.toggle('mobile-expanded');
        }
      });
    });
  }

  // Quick action handler
  handleQuickAction(action) {
    switch (action) {
      case 'new-application':
        window.location.href = 'apply.html';
        break;
      case 'upload-document':
        window.location.href = 'documents.html';
        break;
      case 'view-messages':
        window.location.href = 'messages.html';
        break;
      case 'update-profile':
        window.location.href = 'profile.html';
        break;
      case 'view-settings':
        window.location.href = 'settings.html';
        break;
      default:
        console.log('Unknown quick action:', action);
    }
  }

  // Logout handler
  async handleLogout() {
    try {
      // Show confirmation dialog
      const confirmed = await this.showConfirmDialog(
        'Logout Confirmation',
        'Are you sure you want to logout?'
      );
      
      if (!confirmed) return;

      // Show loading
      this.showNotification('Logging out...', 'info');
      
      // Call logout API
      await propamitAPI.logout();
      
      // Redirect to login
      this.redirectToLogin();
      
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if API call fails
      localStorage.clear();
      this.redirectToLogin();
    }
  }

  // Utility methods
  showNotification(message, type = 'info', duration = 5000) {
    Utils.showNotification(message, type, duration);
  }

  async showConfirmDialog(title, message) {
    return new Promise((resolve) => {
      const modal = document.createElement('div');
      modal.className = 'modal confirm-modal';
      modal.innerHTML = `
        <div class="modal-content">
          <div class="modal-header">
            <h3>${title}</h3>
          </div>
          <div class="modal-body">
            <p>${message}</p>
            <div class="modal-actions">
              <button class="btn btn-secondary cancel-btn">Cancel</button>
              <button class="btn btn-primary confirm-btn">Confirm</button>
            </div>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
      modal.style.display = 'flex';
      
      const cancelBtn = modal.querySelector('.cancel-btn');
      const confirmBtn = modal.querySelector('.confirm-btn');
      
      cancelBtn.addEventListener('click', () => {
        modal.remove();
        resolve(false);
      });
      
      confirmBtn.addEventListener('click', () => {
        modal.remove();
        resolve(true);
      });
    });
  }

  // Error handlers
  redirectToLogin() {
    window.location.href = 'login.html';
  }

  handleAuthError() {
    console.error('Authentication error - clearing storage and redirecting');
    localStorage.clear();
    this.redirectToLogin();
  }

  // Refresh dashboard data
  async refreshDashboard() {
    try {
      this.showLoading();
      await this.loadUserApplications();
      await this.loadDashboardData();
      this.showNotification('Dashboard refreshed successfully', 'success');
    } catch (error) {
      console.error('Failed to refresh dashboard:', error);
      this.showNotification('Failed to refresh dashboard', 'error');
    } finally {
      this.hideLoading();
    }
  }

  // Search functionality
  setupSearchFunctionality() {
    const searchInput = document.getElementById('dashboardSearch');
    if (!searchInput) return;

    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        this.performSearch(e.target.value);
      }, 300);
    });
  }

  performSearch(query) {
    if (!query.trim()) {
      this.clearSearchResults();
      return;
    }

    // Search through applications
    const filteredApplications = this.applications.filter(app => 
      app.type?.toLowerCase().includes(query.toLowerCase()) ||
      app.trackingNumber?.toLowerCase().includes(query.toLowerCase()) ||
      app.status?.toLowerCase().includes(query.toLowerCase())
    );

    this.displaySearchResults(filteredApplications, query);
  }

  displaySearchResults(results, query) {
    const searchResultsContainer = document.getElementById('searchResults');
    if (!searchResultsContainer) return;

    if (results.length === 0) {
      searchResultsContainer.innerHTML = `
        <div class="search-no-results">
          <p>No results found for "${query}"</p>
        </div>
      `;
      return;
    }

    searchResultsContainer.innerHTML = `
      <div class="search-results-header">
        <h4>Search Results (${results.length})</h4>
        <button class="clear-search-btn" onclick="dashboard.clearSearchResults()">Clear</button>
      </div>
      <div class="search-results-list">
        ${results.map(app => `
          <div class="search-result-item" onclick="dashboard.trackApplication('${app.id || app._id}')">
            <div class="result-info">
              <h5>${app.type || 'Application'}</h5>
              <p>ID: ${app.trackingNumber || app.id || app._id}</p>
              <span class="status-badge status-${app.status}">${app.status}</span>
            </div>
            <div class="result-date">
              ${Utils.formatDate(app.submittedAt)}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  clearSearchResults() {
    const searchInput = document.getElementById('dashboardSearch');
    const searchResultsContainer = document.getElementById('searchResults');
    
    if (searchInput) searchInput.value = '';
    if (searchResultsContainer) searchResultsContainer.innerHTML = '';
  }

  // Application status update handler
  async updateApplicationStatus(applicationId, newStatus) {
    try {
      await ApplicationTracker.updateApplicationStatus(applicationId, newStatus);
      await this.loadUserApplications(); // Refresh applications
      this.showNotification('Application status updated successfully', 'success');
    } catch (error) {
      console.error('Failed to update application status:', error);
      this.showNotification('Failed to update application status', 'error');
    }
  }

  // Export dashboard data
  async exportDashboardData() {
    try {
      const data = {
        user: this.user,
        applications: this.applications,
        stats: this.userStats,
        exportDate: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `propamit-dashboard-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      URL.revokeObjectURL(url);
      this.showNotification('Dashboard data exported successfully', 'success');
    } catch (error) {
      console.error('Failed to export dashboard data:', error);
      this.showNotification('Failed to export dashboard data', 'error');
    }
  }

  // Keyboard shortcuts
  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + shortcuts
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'n':
            e.preventDefault();
            this.handleQuickAction('new-application');
            break;
          case 'u':
            e.preventDefault();
            this.handleQuickAction('upload-document');
            break;
          case 'm':
            e.preventDefault();
            this.handleQuickAction('view-messages');
            break;
          case 'r':
            e.preventDefault();
            this.refreshDashboard();
            break;
        }
      }
      
      // Escape key to close modals
      if (e.key === 'Escape') {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => modal.remove());
      }
    });
  }

  // Initialize dashboard features
  initializeFeatures() {
    this.setupSearchFunctionality();
    this.setupKeyboardShortcuts();
    
    // Auto-refresh every 5 minutes
    setInterval(() => {
      this.refreshDashboard();
    }, 5 * 60 * 1000);
  }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Make dashboard globally available
  window.dashboard = new PropamitDashboard();
  
  // Initialize additional features after dashboard is loaded
  setTimeout(() => {
    if (window.dashboard) {
      window.dashboard.initializeFeatures();
    }
  }, 1000);
});

// Handle page visibility change to refresh data when user returns
document.addEventListener('visibilitychange', function() {
  if (!document.hidden && window.dashboard) {
    window.dashboard.refreshDashboard();
  }
});

// Handle online/offline status
window.addEventListener('online', function() {
  if (window.dashboard) {
    window.dashboard.showNotification('Connection restored', 'success');
    window.dashboard.refreshDashboard();
  }
});

window.addEventListener('offline', function() {
  if (window.dashboard) {
    window.dashboard.showNotification('Connection lost. Some features may not work.', 'warning');
  }
});
