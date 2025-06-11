// Dashboard JavaScript - Propamit with Backend Integration
class PropamitDashboard {
  constructor() {
    this.apiBaseUrl = window.location.hostname === 'localhost' ? 'http://localhost:3000/api' : '/api';
    this.token = localStorage.getItem('userToken');
    this.user = null;
    this.applications = [];
    
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
      
      // Setup UI
      this.setupEventListeners();
      this.setupMobileHandlers();
      
      // Load dashboard data
      await this.loadDashboardData();
      
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
      
      // Update UI with user data
      this.updateUserInterface();
      
      console.log('Authentication verified:', this.user);
      
    } catch (error) {
      console.error('Auth verification failed:', error);
      
      // Fallback to localStorage data for demo
      const userName = localStorage.getItem('userName');
      const userEmail = localStorage.getItem('userEmail');
      
      if (userName && userEmail) {
        this.user = { name: userName, email: userEmail };
        this.updateUserInterface();
        console.log('Using fallback user data');
      } else {
        throw error;
      }
    }
  }

  updateUserInterface() {
    // Update user name and email
    const userNameEl = document.getElementById('userName');
    const userEmailEl = document.getElementById('userEmail');
    const welcomeMessageEl = document.getElementById('welcomeMessage');

    if (userNameEl && this.user.name) {
      userNameEl.textContent = this.user.name;
    }

    if (userEmailEl && this.user.email) {
      userEmailEl.textContent = this.user.email;
    }

    if (welcomeMessageEl && this.user.name) {
      welcomeMessageEl.textContent = `Welcome back, ${this.user.name.split(' ')[0]}!`;
    }
  }

  async loadDashboardData() {
    try {
      console.log('Loading dashboard data...');
      
      // Try to load from backend
      await this.loadApplicationsFromBackend();
      
    } catch (error) {
      console.error('Backend data loading failed, using demo data:', error);
      
      // Use demo data as fallback
      this.loadDemoData();
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
    // Demo applications data
    this.applications = [
      {
        _id: 'APP001',
        applicationId: 'VR-2024-001',
        type: 'Vehicle Registration',
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: 'APP002',
        applicationId: 'DR-2024-002',
        type: 'Document Renewal',
        status: 'approved',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 43200000).toISOString()
      },
      {
        _id: 'APP003',
        applicationId: 'OT-2024-003',
        type: 'Ownership Transfer',
        status: 'processing',
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString()
      },
      {
        _id: 'APP004',
        applicationId: 'DL-2024-004',
        type: 'Driver License',
        status: 'rejected',
        createdAt: new Date(Date.now() - 259200000).toISOString(),
        updatedAt: new Date(Date.now() - 172800000).toISOString()
      }
    ];
    
    console.log('Demo data loaded:', this.applications);
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

    // Update messages badge (demo)
    this.updateElement('messagesBadge', Math.floor(Math.random() * 5));

    console.log('Dashboard stats updated:', stats);
  }

  displayRecentApplications() {
    const container = document.getElementById('recentApplications');
    if (!container) return;

    // Sort by date and take first 5
    const recentApps = this.applications
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    if (recentApps.length === 0) {
      container.innerHTML = this.getEmptyApplicationsHTML();
      return;
    }

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
    return `
      <div class="empty-state">
        <i class="fas fa-file-alt"></i>
        <h3>No Applications Yet</h3>
        <p>Start by creating your first application</p>
        <a href="new-application.html" class="btn btn-primary">
          <i class="fas fa-plus"></i>
          New Application
        </a>
      </div>
    `;
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
