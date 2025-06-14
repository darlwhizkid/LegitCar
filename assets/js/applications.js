// Applications Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
  console.log('Applications page loaded');
  
  // Authentication check using correct localStorage keys
  const token = localStorage.getItem('userToken');
  const userEmail = localStorage.getItem('userEmail');
  const userName = localStorage.getItem('userName');
  
  if (!token) {
    console.log('No token found, redirecting to login');
    window.location.href = 'login.html';
    return;
  }
  
  // Update user info in header
  const userNameElement = document.getElementById('userName');
  const userEmailElement = document.getElementById('userEmail');
  
  if (userNameElement && userName) {
    userNameElement.textContent = userName;
  }
  
  if (userEmailElement && userEmail) {
    userEmailElement.textContent = userEmail;
  }
  
  // DOM Elements
  const applicationsList = document.getElementById('applicationsList');
  const applicationsLoading = document.getElementById('applicationsLoading');
  const noApplications = document.getElementById('noApplications');
  const applicationSearch = document.getElementById('applicationSearch');
  const statusFilter = document.getElementById('statusFilter');
  const dateFilter = document.getElementById('dateFilter');
  const totalApplicationsEl = document.getElementById('totalApplications');
  const pendingApplicationsEl = document.getElementById('pendingApplications');
  const approvedApplicationsEl = document.getElementById('approvedApplications');
  const paginationContainer = document.getElementById('paginationContainer');
  const currentPageEl = document.getElementById('currentPage');
  const totalPagesEl = document.getElementById('totalPages');
  const prevPageBtn = document.getElementById('prevPage');
  const nextPageBtn = document.getElementById('nextPage');
  const applicationModal = document.getElementById('applicationModal');
  const closeModal = document.getElementById('closeModal');
  const closeModalBtn = document.getElementById('closeModalBtn');
  
  // State management
  let allApplications = [];
  let filteredApplications = [];
  let currentPage = 1;
  const itemsPerPage = 6;
  
  // User menu functionality
  const userMenuToggle = document.getElementById('userMenuToggle');
  const userDropdown = document.getElementById('userDropdown');
  
  if (userMenuToggle && userDropdown) {
    userMenuToggle.addEventListener('click', function() {
      userDropdown.classList.toggle('active');
    });
    
    document.addEventListener('click', function(event) {
      if (!userMenuToggle.contains(event.target) && !userDropdown.contains(event.target)) {
        userDropdown.classList.remove('active');
      }
    });
  }
  
  // Logout functionality
  const logoutBtn = document.getElementById('logoutBtn');
  const headerLogoutBtn = document.getElementById('headerLogoutBtn');
  
  function handleLogout(e) {
    e.preventDefault();
    
    // Clear authentication data
    localStorage.removeItem('userToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('isAuthenticated');
    
    // Redirect to homepage
    window.location.href = 'index.html';
  }
  
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }
  
  if (headerLogoutBtn) {
    headerLogoutBtn.addEventListener('click', handleLogout);
  }
  
  // Sidebar functionality
  const sidebarToggle = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('sidebar');
  const sidebarClose = document.getElementById('sidebarClose');
  const mobileOverlay = document.getElementById('mobileOverlay');
  
  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', function() {
      sidebar.classList.add('active');
      if (mobileOverlay) {
        mobileOverlay.classList.add('active');
      }
    });
  }
  
  if (sidebarClose && sidebar) {
    sidebarClose.addEventListener('click', function() {
      sidebar.classList.remove('active');
      if (mobileOverlay) {
        mobileOverlay.classList.remove('active');
      }
    });
  }
  
  if (mobileOverlay && sidebar) {
    mobileOverlay.addEventListener('click', function() {
      sidebar.classList.remove('active');
      mobileOverlay.classList.remove('active');
    });
  }
  
  // API Configuration
  const API_BASE_URL = 'http://localhost:3000/api'; // Your backend URL
  
  // API Functions
  async function fetchApplications() {
    try {
      const response = await fetch(`${API_BASE_URL}/applications`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          // Token expired or invalid
          handleLogout({ preventDefault: () => {} });
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.applications || [];
    } catch (error) {
      console.error('Error fetching applications:', error);
      showNotification('Failed to load applications. Please try again.', 'error');
      return [];
    }
  }
  
  async function fetchApplicationDetails(applicationId) {
    try {
      const response = await fetch(`${API_BASE_URL}/applications/${applicationId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.application;
    } catch (error) {
      console.error('Error fetching application details:', error);
      showNotification('Failed to load application details.', 'error');
      return null;
    }
  }
  
  // Initialize page
  async function initializePage() {
    showLoading();
    allApplications = await fetchApplications();
    
    if (allApplications.length === 0) {
      showEmptyState();
    } else {
      filteredApplications = [...allApplications];
      updateStats();
      renderApplications();
      setupPagination();
      hideLoading();
    }
  }
  
  // Show/Hide states
  function showLoading() {
    applicationsLoading.style.display = 'flex';
    applicationsList.style.display = 'none';
    noApplications.style.display = 'none';
    paginationContainer.style.display = 'none';
  }
  
  function hideLoading() {
    applicationsLoading.style.display = 'none';
    applicationsList.style.display = 'grid';
    paginationContainer.style.display = 'flex';
  }
  
  function showEmptyState() {
    applicationsLoading.style.display = 'none';
    applicationsList.style.display = 'none';
    noApplications.style.display = 'flex';
    paginationContainer.style.display = 'none';
  }
  
  // Update statistics
  function updateStats() {
    const total = allApplications.length;
    const pending = allApplications.filter(app => app.status === 'pending').length;
    const approved = allApplications.filter(app => app.status === 'approved').length;
    
    if (totalApplicationsEl) totalApplicationsEl.textContent = total;
    if (pendingApplicationsEl) pendingApplicationsEl.textContent = pending;
    if (approvedApplicationsEl) approvedApplicationsEl.textContent = approved;
  }
  
  // Render applications
  function renderApplications() {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const applicationsToShow = filteredApplications.slice(startIndex, endIndex);
    
    if (applicationsToShow.length === 0 && filteredApplications.length === 0) {
      showEmptyState();
      return;
    }
    
    applicationsList.innerHTML = '';
    
    applicationsToShow.forEach((application, index) => {
      const applicationCard = createApplicationCard(application, index);
      applicationsList.appendChild(applicationCard);
    });
    
    hideLoading();
  }
  
  // Create application card
  function createApplicationCard(application, index) {
    const card = document.createElement('div');
    card.className = 'application-card';
    card.style.animationDelay = `${index * 0.1}s`;
    
    const statusClass = `status-${application.status.toLowerCase().replace(' ', '-')}`;
    const formattedDate = new Date(application.createdAt || application.submissionDate).toLocaleDateString();
    
    card.innerHTML = `
      <div class="application-header">
        <div>
          <div class="application-id">#${application.id || application._id}</div>
          <div class="application-type">${application.type || 'Vehicle Registration'}</div>
        </div>
        <span class="status-badge ${statusClass}">${application.status}</span>
      </div>
      
      <div class="application-details">
        <div class="detail-item">
          <span class="detail-label">Vehicle:</span>
          <span class="detail-value">${application.vehicleInfo?.make || 'N/A'} ${application.vehicleInfo?.model || ''}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Year:</span>
          <span class="detail-value">${application.vehicleInfo?.year || 'N/A'}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Documents:</span>
          <span class="detail-value">${application.documents?.length || 0} files</span>
        </div>
      </div>
      
      <div class="application-footer">
        <span class="application-date">Submitted: ${formattedDate}</span>
        <button class="view-details-btn" onclick="openApplicationModal('${application.id || application._id}')">
          View Details
        </button>
      </div>
    `;
    
    // Add click handler for the entire card
    card.addEventListener('click', (e) => {
      if (!e.target.classList.contains('view-details-btn')) {
        openApplicationModal(application.id || application._id);
      }
    });
    
    return card;
  }
  
  // Open application modal
  window.openApplicationModal = async function(applicationId) {
    const application = allApplications.find(app => (app.id || app._id) === applicationId);
    
    if (!application) {
      showNotification('Application not found', 'error');
      return;
    }
    
    // Populate modal with application data
    document.getElementById('modalAppId').textContent = `#${application.id || application._id}`;
    document.getElementById('modalAppType').textContent = application.type || 'Vehicle Registration';
    document.getElementById('modalAppDate').textContent = new Date(application.createdAt || application.submissionDate).toLocaleDateString();
    
    const statusBadge = document.getElementById('modalAppStatus');
    const statusClass = `status-${application.status.toLowerCase().replace(' ', '-')}`;
    statusBadge.className = `detail-value status-badge ${statusClass}`;
    statusBadge.textContent = application.status;
    
    // Vehicle information
    const vehicleInfo = application.vehicleInfo || {};
    document.getElementById('modalVehicleInfo').textContent = 
      `${vehicleInfo.make || 'N/A'} ${vehicleInfo.model || ''} (${vehicleInfo.year || 'N/A'})`;
    
    // Documents
    const documentsContainer = document.getElementById('modalDocuments');
    if (application.documents && application.documents.length > 0) {
      documentsContainer.innerHTML = application.documents.map(doc => `
        <div class="document-item">
          <i class="fas fa-file-alt"></i>
          <span>${doc.name || doc.filename || 'Document'}</span>
        </div>
      `).join('');
    } else {
      documentsContainer.innerHTML = '<span>No documents uploaded</span>';
    }
    
    // Notes
    document.getElementById('modalNotes').textContent = application.notes || 'No additional notes';
    
    // Timeline
    renderTimeline(application);
    
    // Show modal
    applicationModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  };
  
  // Render timeline
  function renderTimeline(application) {
    const timelineContainer = document.getElementById('modalTimeline');
    
    // Default timeline based on status
    let timelineItems = [
      {
        title: 'Application Submitted',
        description: 'Your application has been received and is being processed',
        date: new Date(application.createdAt || application.submissionDate).toLocaleDateString(),
        status: 'completed'
      }
    ];
    
    // Add status-specific timeline items
    switch (application.status.toLowerCase()) {
      case 'pending':
        timelineItems.push({
          title: 'Under Review',
          description: 'Your application is currently being reviewed by our team',
          date: 'In Progress',
          status: 'current'
        });
        break;
        
      case 'in-progress':
        timelineItems.push(
          {
            title: 'Document Verification',
            description: 'Your documents are being verified',
            date: 'In Progress',
            status: 'completed'
          },
          {
            title: 'Processing',
            description: 'Your application is being processed',
            date: 'Current',
            status: 'current'
          }
        );
        break;
        
      case 'approved':
        timelineItems.push(
          {
            title: 'Document Verification',
            description: 'Your documents have been verified successfully',
            date: 'Completed',
            status: 'completed'
          },
          {
            title: 'Application Approved',
            description: 'Your application has been approved',
            date: application.approvedDate || 'Recently',
            status: 'completed'
          }
        );
        break;
        
      case 'rejected':
        timelineItems.push({
          title: 'Application Rejected',
          description: application.rejectionReason || 'Please contact support for more information',
          date: application.rejectedDate || 'Recently',
          status: 'completed'
        });
        break;
    }
    
    timelineContainer.innerHTML = timelineItems.map(item => `
      <div class="timeline-item ${item.status}">
        <div class="timeline-content">
          <div class="timeline-title">${item.title}</div>
          <div class="timeline-description">${item.description}</div>
          <div class="timeline-date">${item.date}</div>
        </div>
      </div>
    `).join('');
  }
  
  // Close modal
  function closeApplicationModal() {
    applicationModal.classList.remove('active');
    document.body.style.overflow = '';
  }
  
  if (closeModal) {
    closeModal.addEventListener('click', closeApplicationModal);
  }
  
  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeApplicationModal);
  }
  
  // Close modal when clicking outside
  applicationModal.addEventListener('click', function(e) {
    if (e.target === applicationModal) {
      closeApplicationModal();
    }
  });
  
  // Track application button
  const trackAppBtn = document.getElementById('trackAppBtn');
  if (trackAppBtn) {
    trackAppBtn.addEventListener('click', function() {
      // You can implement tracking functionality here
      showNotification('Tracking feature coming soon!', 'info');
    });
  }
  
  // Search functionality
  if (applicationSearch) {
    applicationSearch.addEventListener('input', function() {
      const searchTerm = this.value.toLowerCase().trim();
      filterApplications();
    });
  }
  
  // Filter functionality
  if (statusFilter) {
    statusFilter.addEventListener('change', filterApplications);
  }
  
  if (dateFilter) {
    dateFilter.addEventListener('change', filterApplications);
  }
  
  // Filter applications
  function filterApplications() {
    const searchTerm = applicationSearch.value.toLowerCase().trim();
    const statusValue = statusFilter.value;
    const dateValue = dateFilter.value;
    
    filteredApplications = allApplications.filter(application => {
      // Search filter
      const matchesSearch = !searchTerm || 
        (application.id || application._id).toString().toLowerCase().includes(searchTerm) ||
        (application.type || '').toLowerCase().includes(searchTerm) ||
        (application.vehicleInfo?.make || '').toLowerCase().includes(searchTerm) ||
        (application.vehicleInfo?.model || '').toLowerCase().includes(searchTerm);
      
      // Status filter
      const matchesStatus = statusValue === 'all' || application.status === statusValue;
      
      // Date filter
      let matchesDate = true;
      if (dateValue !== 'all') {
        const appDate = new Date(application.createdAt || application.submissionDate);
        const now = new Date();
        
        switch (dateValue) {
          case 'today':
            matchesDate = appDate.toDateString() === now.toDateString();
            break;
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            matchesDate = appDate >= weekAgo;
            break;
          case 'month':
            const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
            matchesDate = appDate >= monthAgo;
            break;
          case 'year':
            const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
            matchesDate = appDate >= yearAgo;
            break;
        }
      }
      
      return matchesSearch && matchesStatus && matchesDate;
    });
    
    currentPage = 1;
    renderApplications();
    setupPagination();
  }
  
  // Pagination
  function setupPagination() {
    const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);
    
    if (totalPages <= 1) {
      paginationContainer.style.display = 'none';
      return;
    }
    
    paginationContainer.style.display = 'flex';
    currentPageEl.textContent = currentPage;
    totalPagesEl.textContent = totalPages;
    
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages;
  }
  
  // Pagination event listeners
  if (prevPageBtn) {
    prevPageBtn.addEventListener('click', function() {
      if (currentPage > 1) {
        currentPage--;
        renderApplications();
        setupPagination();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }
  
  if (nextPageBtn) {
    nextPageBtn.addEventListener('click', function() {
      const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);
      if (currentPage < totalPages) {
        currentPage++;
        renderApplications();
        setupPagination();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }
  
  // Notification system
  function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notif => notif.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <span>${message}</span>
        <button class="notification-close">&times;</button>
      </div>
    `;
    
    // Add styles if they don't exist
    if (!document.querySelector('#notification-styles')) {
      const styles = document.createElement('style');
      styles.id = 'notification-styles';
      styles.textContent = `
        .notification {
          position: fixed;
          top: 20px;
          right: 20px;
          padding: 15px 20px;
          border-radius: 8px;
          color: white;
          font-weight: 500;
          z-index: 10000;
          transform: translateX(400px);
          transition: transform 0.3s ease;
          max-width: 300px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .notification.success { background-color: #10b981; }
        .notification.error { background-color: #ef4444; }
        .notification.info { background-color: #3b82f6; }
        .notification.warning { background-color: #f59e0b; }
        .notification.show { transform: translateX(0); }
        .notification-content { display: flex; justify-content: space-between; align-items: center; }
        .notification-close { 
          background: none; 
          border: none; 
          color: white; 
          font-size: 18px; 
          cursor: pointer; 
          margin-left: 10px;
          padding: 0;
          line-height: 1;
        }
        .notification-close:hover { opacity: 0.8; }
      `;
      document.head.appendChild(styles);
    }
    
    document.body.appendChild(notification);
    
    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
      notification.classList.remove('show');
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    });
    
    // Show notification
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Hide notification after 5 seconds
    setTimeout(() => {
      if (notification.classList.contains('show')) {
        notification.classList.remove('show');
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 300);
      }
    }, 5000);
  }
  
  // Set current year in footer
  const currentYearElement = document.getElementById('currentYear');
  if (currentYearElement) {
    currentYearElement.textContent = new Date().getFullYear();
  }
  
  // Initialize the page
  initializePage();
  
  console.log('Applications page initialized successfully');
});