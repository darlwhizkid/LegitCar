// Documents Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
  console.log('Documents page loaded');
  
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
  const documentsGrid = document.getElementById('documentsGrid');
  const documentsList = document.getElementById('documentsList');
  const documentsLoading = document.getElementById('documentsLoading');
  const noDocuments = document.getElementById('noDocuments');
  const documentSearch = document.getElementById('documentSearch');
  const documentTypeFilter = document.getElementById('documentTypeFilter');
  const dateFilter = document.getElementById('dateFilter');
  const totalDocumentsEl = document.getElementById('totalDocuments');
  const verifiedDocumentsEl = document.getElementById('verifiedDocuments');
  const pendingDocumentsEl = document.getElementById('pendingDocuments');
  const uploadDocBtn = document.getElementById('uploadDocBtn');
  const emptyStateUploadBtn = document.getElementById('emptyStateUploadBtn');
  const gridViewBtn = document.getElementById('gridViewBtn');
  const listViewBtn = document.getElementById('listViewBtn');
  
  // Modal elements
  const uploadModal = document.getElementById('uploadModal');
  const previewModal = document.getElementById('previewModal');
  const closeUploadModal = document.getElementById('closeUploadModal');
  const closePreviewModal = document.getElementById('closePreviewModal');
  const cancelUploadBtn = document.getElementById('cancelUploadBtn');
  const submitUploadBtn = document.getElementById('submitUploadBtn');
  const closePreviewBtn = document.getElementById('closePreviewBtn');
  
  // Sidebar and user menu elements
  const sidebar = document.getElementById('sidebar');
  const sidebarToggle = document.getElementById('sidebarToggle');
  const sidebarClose = document.getElementById('sidebarClose');
  const mobileOverlay = document.getElementById('mobileOverlay');
  const userMenuToggle = document.getElementById('userMenuToggle');
  const userDropdown = document.getElementById('userDropdown');
  const logoutBtns = document.querySelectorAll('#logoutBtn, #headerLogoutBtn');
  
  // Current state
  let currentView = 'grid';
  let currentDocuments = [];
  let filteredDocuments = [];
  
  // Initialize page
  function initializePage() {
    setupEventListeners();
    loadDocuments();
    updateStats();
  }
  
  // Setup event listeners
  function setupEventListeners() {
    // Sidebar functionality
    if (sidebarToggle) {
      sidebarToggle.addEventListener('click', toggleSidebar);
    }
    
    if (sidebarClose) {
      sidebarClose.addEventListener('click', closeSidebar);
    }
    
    if (mobileOverlay) {
      mobileOverlay.addEventListener('click', closeSidebar);
    }
    
    // User menu functionality
    if (userMenuToggle) {
      userMenuToggle.addEventListener('click', toggleUserMenu);
    }
    
    // Close user menu when clicking outside
    document.addEventListener('click', function(event) {
      if (userDropdown && !userMenuToggle.contains(event.target) && !userDropdown.contains(event.target)) {
        userDropdown.classList.remove('active');
      }
    });
    
    // Logout functionality
    logoutBtns.forEach(btn => {
      btn.addEventListener('click', handleLogout);
    });
    
    // Search and filter functionality
    if (documentSearch) {
      documentSearch.addEventListener('input', handleSearch);
    }
    
    if (documentTypeFilter) {
      documentTypeFilter.addEventListener('change', handleFilter);
    }
    
    if (dateFilter) {
      dateFilter.addEventListener('change', handleFilter);
    }
    
    // View toggle functionality
    if (gridViewBtn) {
      gridViewBtn.addEventListener('click', () => switchView('grid'));
    }
    
    if (listViewBtn) {
      listViewBtn.addEventListener('click', () => switchView('list'));
    }
    
    // Upload functionality - Simple and working
    if (uploadDocBtn) {
      uploadDocBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('Upload button clicked');
        
        // Create file input directly
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.pdf,.jpg,.jpeg,.png,.doc,.docx';
        fileInput.style.display = 'none';
        
        fileInput.addEventListener('change', function(e) {
          const file = e.target.files[0];
          if (file) {
            console.log('File selected:', file.name);
            processFileUpload(file);
          }
          // Clean up
          document.body.removeChild(fileInput);
        });
        
        // Add to DOM and trigger click
        document.body.appendChild(fileInput);
        fileInput.click();
      });
    }
    
    if (emptyStateUploadBtn) {
      emptyStateUploadBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('Empty state upload button clicked');
        
        // Create file input directly
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.pdf,.jpg,.jpeg,.png,.doc,.docx';
        fileInput.style.display = 'none';
        
        fileInput.addEventListener('change', function(e) {
          const file = e.target.files[0];
          if (file) {
            console.log('File selected:', file.name);
            processFileUpload(file);
          }
          // Clean up
          document.body.removeChild(fileInput);
        });
        
        // Add to DOM and trigger click
        document.body.appendChild(fileInput);
        fileInput.click();
      });
    }
    
    // Modal functionality
    if (closeUploadModal) {
      closeUploadModal.addEventListener('click', closeUploadModalHandler);
    }
    
    if (cancelUploadBtn) {
      cancelUploadBtn.addEventListener('click', closeUploadModalHandler);
    }
    
    if (submitUploadBtn) {
      submitUploadBtn.addEventListener('click', handleUpload);
    }
    
    if (closePreviewModal) {
      closePreviewModal.addEventListener('click', closePreviewModalHandler);
    }
    
    if (closePreviewBtn) {
      closePreviewBtn.addEventListener('click', closePreviewModalHandler);
    }
    
    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
      if (event.target === uploadModal) {
        closeUploadModalHandler();
      }
      if (event.target === previewModal) {
        closePreviewModalHandler();
      }
    });
  }
  
  // Sidebar functions
  function toggleSidebar() {
    if (sidebar) {
      sidebar.classList.toggle('active');
    }
    if (mobileOverlay) {
      mobileOverlay.classList.toggle('active');
    }
  }
  
  function closeSidebar() {
    if (sidebar) {
      sidebar.classList.remove('active');
    }
    if (mobileOverlay) {
      mobileOverlay.classList.remove('active');
    }
  }
  
  // User menu functions
  function toggleUserMenu() {
    if (userDropdown) {
      userDropdown.classList.toggle('active');
    }
  }
  
  // Logout function
  function handleLogout() {
    localStorage.clear();
    window.location.href = 'index.html';
  }
  
  // Load documents - Show empty state for new users
  function loadDocuments() {
    // Show loading state
    if (documentsLoading) {
      documentsLoading.style.display = 'block';
    }
    if (noDocuments) {
      noDocuments.style.display = 'none';
    }
    if (documentsGrid) {
      documentsGrid.style.display = 'none';
    }
    if (documentsList) {
      documentsList.style.display = 'none';
    }
    
    // Simulate API call
    setTimeout(() => {
      // For new users, start with empty documents array
      currentDocuments = [];
      filteredDocuments = [...currentDocuments];
      
      if (documentsLoading) {
        documentsLoading.style.display = 'none';
      }
      
      if (filteredDocuments.length === 0) {
        showEmptyState();
      } else {
        renderDocuments();
      }
    }, 1000);
  }
  
  // Update statistics
  function updateStats() {
    const total = currentDocuments.length;
    const verified = currentDocuments.filter(doc => doc.status === 'verified').length;
    const pending = currentDocuments.filter(doc => doc.status === 'pending').length;
    
    if (totalDocumentsEl) totalDocumentsEl.textContent = total;
    if (verifiedDocumentsEl) verifiedDocumentsEl.textContent = verified;
    if (pendingDocumentsEl) pendingDocumentsEl.textContent = pending;
  }
  
  // Show empty state
  function showEmptyState() {
    if (noDocuments) {
      noDocuments.style.display = 'block';
    }
    if (documentsGrid) {
      documentsGrid.style.display = 'none';
    }
    if (documentsList) {
      documentsList.style.display = 'none';
    }
  }
  
  // Render documents
  function renderDocuments() {
    if (currentView === 'grid') {
      renderGridView();
    } else {
      renderListView();
    }
  }
  
  // Render grid view
  function renderGridView() {
    if (!documentsGrid || !documentsList) return;
    
    documentsGrid.style.display = 'grid';
    documentsList.style.display = 'none';
    
    documentsGrid.innerHTML = filteredDocuments.map(doc => `
      <div class="document-card" onclick="openPreviewModal('${doc.id}')">
        <div class="document-icon ${doc.fileType}">
          <i class="fas ${getFileIcon(doc.fileType)}"></i>
        </div>
        <div class="document-name">${doc.name}</div>
        <div class="document-type">${doc.type}</div>
        <div class="document-meta">
          <span>${doc.size}</span>
          <span>${formatDate(doc.uploadDate)}</span>
        </div>
        <div class="document-status ${doc.status}">${doc.status}</div>
        <div class="document-actions" onclick="event.stopPropagation()">
          <button class="action-btn primary" onclick="downloadDocument('${doc.id}')" title="Download">
            <i class="fas fa-download"></i>
          </button>
          <button class="action-btn" onclick="openPreviewModal('${doc.id}')" title="Preview">
            <i class="fas fa-eye"></i>
          </button>
          <button class="action-btn danger" onclick="deleteDocument('${doc.id}')" title="Delete">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `).join('');
  }
  
  // Render list view
  function renderListView() {
    if (!documentsGrid || !documentsList) return;
    
    const documentsListBody = document.getElementById('documentsListBody');
    if (!documentsListBody) return;
    
    documentsGrid.style.display = 'none';
    documentsList.style.display = 'block';
    
    documentsListBody.innerHTML = filteredDocuments.map(doc => `
      <tr onclick="openPreviewModal('${doc.id}')" style="cursor: pointer;">
        <td>
          <div class="list-document-name">
            <i class="fas ${getFileIcon(doc.fileType)}" style="margin-right: 0.5rem; color: ${getFileColor(doc.fileType)};"></i>
            ${doc.name}
          </div>
        </td>
        <td style="text-transform: capitalize;">${doc.type}</td>
        <td>${doc.size}</td>
        <td>${formatDate(doc.uploadDate)}</td>
        <td><span class="document-status ${doc.status}">${doc.status}</span></td>
        <td onclick="event.stopPropagation()">
          <div class="list-actions">
            <button class="list-action-btn primary" onclick="downloadDocument('${doc.id}')" title="Download">
              <i class="fas fa-download"></i>
            </button>
            <button class="list-action-btn" onclick="openPreviewModal('${doc.id}')" title="Preview">
              <i class="fas fa-eye"></i>
            </button>
            <button class="list-action-btn danger" onclick="deleteDocument('${doc.id}')" title="Delete">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  }
  
  // Switch view
  function switchView(view) {
    currentView = view;
    
    if (gridViewBtn) {
      gridViewBtn.classList.toggle('active', view === 'grid');
    }
    if (listViewBtn) {
      listViewBtn.classList.toggle('active', view === 'list');
    }
    
    if (filteredDocuments.length > 0) {
      renderDocuments();
    }
  }
  
  // Handle search
  function handleSearch() {
    if (documentSearch) {
      const searchTerm = documentSearch.value.toLowerCase();
      applyFilters(searchTerm);
    }
  }
  
  // Handle filters
  function handleFilter() {
    const searchTerm = documentSearch ? documentSearch.value.toLowerCase() : '';
    applyFilters(searchTerm);
  }
  
  // Apply filters
  function applyFilters(searchTerm = '') {
    const typeFilter = documentTypeFilter ? documentTypeFilter.value : 'all';
    const dateFilterValue = dateFilter ? dateFilter.value : 'all';
    
    filteredDocuments = currentDocuments.filter(doc => {
      // Search filter
      const matchesSearch = searchTerm === '' || 
        doc.name.toLowerCase().includes(searchTerm) ||
        doc.type.toLowerCase().includes(searchTerm) ||
        (doc.description && doc.description.toLowerCase().includes(searchTerm));
      
      // Type filter
      const matchesType = typeFilter === 'all' || doc.type === typeFilter;
      
      // Date filter
      const matchesDate = filterByDate(doc.uploadDate, dateFilterValue);
      
      return matchesSearch && matchesType && matchesDate;
    });
    
    if (filteredDocuments.length === 0) {
      showEmptyState();
    } else {
      renderDocuments();
    }
  }
  
  // Filter by date
  function filterByDate(docDate, filter) {
    if (filter === 'all') return true;
    
    const today = new Date();
    const documentDate = new Date(docDate);
    
    switch (filter) {
      case 'today':
        return documentDate.toDateString() === today.toDateString();
      case 'week':
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        return documentDate >= weekAgo;
      case 'month':
        return documentDate.getMonth() === today.getMonth() && 
               documentDate.getFullYear() === today.getFullYear();
      case 'year':
        return documentDate.getFullYear() === today.getFullYear();
      default:
        return true;
    }
  }
  
  // Modal functions
  function openUploadModal() {
    console.log('Opening upload modal'); // Debug log
    
    if (uploadModal) {
      uploadModal.style.display = 'block';
      document.body.style.overflow = 'hidden';
      console.log('Modal opened successfully');
    } else {
      console.error('Upload modal not found');
      // Fallback: create a simple file input
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = '.pdf,.jpg,.jpeg,.png,.doc,.docx';
      fileInput.multiple = false;
      
      fileInput.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
          console.log('File selected:', file.name);
          handleFileUpload(file);
        }
      };
      
      fileInput.click();
    }
  }
    function closeUploadModalHandler() {
      if (uploadModal) {
        uploadModal.style.display = 'none';
        document.body.style.overflow = '';
        resetUploadForm();
      }
    }
  
    function openPreviewModal(documentId) {
      const document = currentDocuments.find(doc => doc.id === documentId);
      if (!document || !previewModal) return;
    
      // Populate preview modal
      const previewDocumentName = document.getElementById('previewDocumentName');
      const previewDocumentType = document.getElementById('previewDocumentType');
      const previewDocumentSize = document.getElementById('previewDocumentSize');
      const previewDocumentDate = document.getElementById('previewDocumentDate');
      const previewDocumentStatus = document.getElementById('previewDocumentStatus');
      const previewDocumentDescription = document.getElementById('previewDocumentDescription');
    
      if (previewDocumentName) previewDocumentName.textContent = document.name;
      if (previewDocumentType) previewDocumentType.textContent = document.type;
      if (previewDocumentSize) previewDocumentSize.textContent = document.size;
      if (previewDocumentDate) previewDocumentDate.textContent = formatDate(document.uploadDate);
      if (previewDocumentStatus) {
        previewDocumentStatus.textContent = document.status;
        previewDocumentStatus.className = `detail-value status-badge ${document.status}`;
      }
      if (previewDocumentDescription) {
        previewDocumentDescription.textContent = document.description || 'No description provided';
      }
    
      previewModal.style.display = 'block';
      document.body.style.overflow = 'hidden';
    }
  
    function closePreviewModalHandler() {
      if (previewModal) {
        previewModal.style.display = 'none';
        document.body.style.overflow = '';
      }
    }
  
    // Upload functions
    function handleUpload() {
      const form = document.getElementById('uploadForm');
      if (!form || !submitUploadBtn) return;
    
      const formData = new FormData(form);
    
      // Basic validation
      const documentName = formData.get('documentName');
      const documentType = formData.get('documentType');
      const documentFile = formData.get('documentFile');
    
      if (!documentName || !documentType || !documentFile.name) {
        showNotification('Please fill in all required fields', 'error');
        return;
      }
    
      // Simulate upload
      submitUploadBtn.disabled = true;
      submitUploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
    
      setTimeout(() => {
        // Create new document
        const newDocument = {
          id: 'DOC' + String(currentDocuments.length + 1).padStart(3, '0'),
          name: documentName,
          type: documentType,
          size: formatFileSize(documentFile.size),
          uploadDate: new Date().toISOString().split('T')[0],
          status: 'pending',
          description: formData.get('documentDescription') || '',
          fileType: getFileTypeFromMime(documentFile.type)
        };
      
        currentDocuments.unshift(newDocument);
        filteredDocuments = [...currentDocuments];
      
        updateStats();
        renderDocuments();
        closeUploadModalHandler();
      
        showNotification('Document uploaded successfully!', 'success');
      
        submitUploadBtn.disabled = false;
        submitUploadBtn.innerHTML = 'Upload Document';
      }, 2000);
    }
  
    function resetUploadForm() {
      const form = document.getElementById('uploadForm');
      if (form) {
        form.reset();
      }
    }
  
    // Document actions
    function downloadDocument(documentId) {
      const document = currentDocuments.find(doc => doc.id === documentId);
      if (document) {
        showNotification(`Downloading ${document.name}...`, 'info');
        // In a real app, this would trigger an actual download
      }
    }
  
    function deleteDocument(documentId) {
      if (confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
        currentDocuments = currentDocuments.filter(doc => doc.id !== documentId);
        filteredDocuments = filteredDocuments.filter(doc => doc.id !== documentId);
      
        updateStats();
      
        if (filteredDocuments.length === 0) {
          showEmptyState();
        } else {
          renderDocuments();
        }
      
        showNotification('Document deleted successfully', 'success');
      }
    }
  
    // Utility functions
    function getFileIcon(fileType) {
      switch (fileType) {
        case 'pdf':
          return 'fa-file-pdf';
        case 'image':
          return 'fa-file-image';
        case 'doc':
          return 'fa-file-word';
        default:
          return 'fa-file';
      }
    }
  
    function getFileColor(fileType) {
      switch (fileType) {
        case 'pdf':
          return '#dc2626';
        case 'image':
          return '#2563eb';
        case 'doc':
          return '#059669';
        default:
          return '#6b7280';
      }
    }
  
    function getFileTypeFromMime(mimeType) {
      if (mimeType.startsWith('image/')) return 'image';
      if (mimeType === 'application/pdf') return 'pdf';
      if (mimeType.includes('word') || mimeType.includes('document')) return 'doc';
      return 'other';
    }
  
    function formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  
    function formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
  
    function showNotification(message, type = 'info') {
      // Remove existing notifications
      const existingNotifications = document.querySelectorAll('.notification');
      existingNotifications.forEach(notif => notif.remove());
    
      // Create notification
      const notification = document.createElement('div');
      notification.className = `notification ${type}`;
      notification.innerHTML = `
        <div class="notification-content">
          <span>${message}</span>
          <button class="notification-close">&times;</button>
        </div>
      `;
    
      // Add notification styles if they don't exist
      if (!document.querySelector('#notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
          .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 6px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            transform: translateX(400px);
            transition: transform 0.3s ease;
            max-width: 350px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          }
          .notification.success { background-color: #059669; }
          .notification.error { background-color: #dc2626; }
          .notification.info { background-color: #2563eb; }
          .notification.warning { background-color: #d97706; }
          .notification.show { transform: translateX(0); }
          .notification-content { display: flex; justify-content: space-between; align-items: center; }
          .notification-close { 
            background: none; 
            border: none; 
            color: white; 
            font-size: 18px; 
            cursor: pointer; 
            margin-left: 15px;
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
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          notification.classList.remove('show');
          setTimeout(() => {
            if (notification.parentNode) {
              notification.parentNode.removeChild(notification);
            }
          }, 300);
        });
      }
    
      // Show notification
      setTimeout(() => notification.classList.add('show'), 100);
    
      // Auto-hide after 5 seconds
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
  
    // Make functions globally available for onclick handlers
    window.openPreviewModal = openPreviewModal;
    window.downloadDocument = downloadDocument;
    window.deleteDocument = deleteDocument;
  
    // Initialize the page
    initializePage();
  
    console.log('Documents page loaded successfully');
});