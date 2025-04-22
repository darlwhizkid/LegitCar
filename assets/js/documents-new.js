// Documents Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
  // Check if user is authenticated
  const isAuthenticated = localStorage.getItem('isAuthenticated');
  if (!isAuthenticated) {
    // Redirect to home page if not authenticated
    window.location.href = 'index.html';
    return;
  }
  
  // Get user data
  const userData = JSON.parse(localStorage.getItem('currentUser')) || {};
  
  // Update user greeting
  const userGreeting = document.getElementById('userGreeting');
  if (userGreeting && userData) {
    userGreeting.textContent = `Welcome, ${userData.name || 'User'}`;
  }
  
  // Set current year in footer
  const currentYearElement = document.getElementById('currentYear');
  if (currentYearElement) {
    currentYearElement.textContent = new Date().getFullYear();
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
  
  // Mobile sidebar toggle functionality
  const sidebarToggle = document.getElementById('sidebarToggle');
  const sidebar = document.querySelector('.sidebar');
  
  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', function() {
      sidebar.classList.toggle('active');
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
  
  // Sample documents data (in a real app, this would come from an API)
  const sampleDocuments = [
    {
      id: 1,
      name: 'Vehicle Registration Certificate',
      type: 'vehicle',
      fileType: 'pdf',
      size: '1.2 MB',
      date: '2023-06-15',
      description: 'Official vehicle registration certificate issued by the DMV.',
      relatedApplication: 'APP-123456'
    },
    {
      id: 2,
      name: 'Driver\'s License',
      type: 'identification',
      fileType: 'jpg',
      size: '850 KB',
      date: '2023-05-20',
      description: 'Valid driver\'s license.',
      relatedApplication: ''
    },
    {
      id: 3,
      name: 'Insurance Policy',
      type: 'insurance',
      fileType: 'pdf',
      size: '2.5 MB',
      date: '2023-06-10',
      description: 'Comprehensive auto insurance policy document.',
      relatedApplication: 'APP-789012'
    },
    {
      id: 4,
      name: 'Vehicle Inspection Report',
      type: 'vehicle',
      fileType: 'pdf',
      size: '1.8 MB',
      date: '2023-06-05',
      description: 'Annual vehicle inspection report.',
      relatedApplication: 'APP-123456'
    },
    {
      id: 5,
      name: 'Proof of Address',
      type: 'identification',
      fileType: 'jpg',
      size: '950 KB',
      date: '2023-05-15',
      description: 'Utility bill showing current address.',
      relatedApplication: ''
    },
    {
      id: 6,
      name: 'Vehicle Title',
      type: 'vehicle',
      fileType: 'pdf',
      size: '1.1 MB',
      date: '2023-04-20',
      description: 'Original vehicle title document.',
      relatedApplication: 'APP-345678'
    }
  ];
  
  // Store documents in localStorage if not already present
  if (!localStorage.getItem(`documents_${userData.email}`)) {
    localStorage.setItem(`documents_${userData.email}`, JSON.stringify(sampleDocuments));
  }
  
  // Get documents from localStorage
  let documents = [];
  try {
    documents = JSON.parse(localStorage.getItem(`documents_${userData.email}`)) || [];
  } catch (e) {
    console.error('Error parsing documents:', e);
    documents = [];
  }
  
  // Populate documents grid
  function populateDocumentsGrid(filteredDocuments = null) {
    const documentsGrid = document.getElementById('documentsGrid');
    if (!documentsGrid) return;
    
    // Clear existing documents
    documentsGrid.innerHTML = '';
    
    // Use filtered documents if provided, otherwise use all documents
    const documentsToShow = filteredDocuments || documents;
    
    if (documentsToShow.length === 0) {
      // Show empty state
      document.getElementById('emptyDocuments').style.display = 'flex';
      documentsGrid.style.display = 'none';
      document.getElementById('documentsList').style.display = 'none';
      return;
    }
    
    // Hide empty state
    document.getElementById('emptyDocuments').style.display = 'none';
    documentsGrid.style.display = 'grid';
    
    // Sort documents by date (newest first)
    documentsToShow.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Add documents to the grid
    documentsToShow.forEach(document => {
      const documentCard = createDocumentCard(document);
      documentsGrid.appendChild(documentCard);
    });
  }
  
  // Create document card element
  function createDocumentCard(document) {
    const documentCard = document.createElement('div');
    documentCard.className = 'document-card';
    documentCard.dataset.id = document.id;
    
    let iconClass = 'fa-file';
    if (document.fileType === 'pdf') iconClass = 'fa-file-pdf';
    else if (document.fileType === 'doc' || document.fileType === 'docx') iconClass = 'fa-file-word';
    else if (document.fileType === 'xls' || document.fileType === 'xlsx') iconClass = 'fa-file-excel';
    else if (document.fileType === 'jpg' || document.fileType === 'jpeg' || document.fileType === 'png') iconClass = 'fa-file-image';
    
    const date = new Date(document.date);
    const formattedDate = date.toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'short', 
      day: 'numeric' 
    });
    
    documentCard.innerHTML = `
      <div class="document-preview">
        <i class="fas ${iconClass}"></i>
      </div>
      <div class="document-info">
        <h3 class="document-name">${document.name}</h3>
        <div class="document-meta">
          <span class="document-type ${document.type}">${capitalizeFirstLetter(document.type)}</span>
          <span class="document-date">${formattedDate}</span>
        </div>
        <div class="document-actions">
          <button class="document-btn preview-btn" title="Preview">
            <i class="fas fa-eye"></i>
          </button>
          <button class="document-btn download-btn" title="Download">
            <i class="fas fa-download"></i>
          </button>
          <button class="document-btn delete-btn" title="Delete">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `;
    
    // Add click event to preview button
    documentCard.querySelector('.preview-btn').addEventListener('click', function(e) {
      e.stopPropagation();
      showDocumentPreview(document.id);
    });
    
    // Add click event to download button
    documentCard.querySelector('.download-btn').addEventListener('click', function(e) {
      e.stopPropagation();
      downloadDocument(document.id);
    });
    
    // Add click event to delete button
    documentCard.querySelector('.delete-btn').addEventListener('click', function(e) {
      e.stopPropagation();
      deleteDocument(document.id);
    });
    
    // Add click event to card to preview document
    documentCard.addEventListener('click', function() {
      showDocumentPreview(document.id);
    });
    
    return documentCard;
  }
  
  // Populate documents list
  function populateDocumentsList(filteredDocuments = null) {
    const documentsListBody = document.getElementById('documentsListBody');
    if (!documentsListBody) return;
    
    // Clear existing documents
    documentsListBody.innerHTML = '';
    
    // Use filtered documents if provided, otherwise use all documents
    const documentsToShow = filteredDocuments || documents;
    
    if (documentsToShow.length === 0) {
      // Show empty state
      document.getElementById('emptyDocuments').style.display = 'flex';
      document.getElementById('documentsGrid').style.display = 'none';
      document.getElementById('documentsList').style.display = 'none';
      return;
    }
    
    // Hide empty state
    document.getElementById('emptyDocuments').style.display = 'none';
    document.getElementById('documentsList').style.display = 'table';
    
    // Sort documents by date (newest first)
    documentsToShow.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Add documents to the list
    documentsToShow.forEach(document => {
      const row = document.createElement('tr');
      row.dataset.id = document.id;
      
      let iconClass = 'fa-file';
      if (document.fileType === 'pdf') iconClass = 'fa-file-pdf';
      else if (document.fileType === 'doc' || document.fileType === 'docx') iconClass = 'fa-file-word';
      else if (document.fileType === 'xls' || document.fileType === 'xlsx') iconClass = 'fa-file-excel';
      else if (document.fileType === 'jpg' || document.fileType === 'jpeg' || document.fileType === 'png') iconClass = 'fa-file-image';
      
      const date = new Date(document.date);
      const formattedDate = date.toLocaleDateString('en-US', { 
        year: 'numeric',
        month: 'short', 
        day: 'numeric' 
      });
      
      row.innerHTML = `
        <td>
          <div style="display: flex; align-items: center; gap: 10px;">
            <i class="fas ${iconClass}"></i>
            ${document.name}
          </div>
        </td>
        <td><span class="document-type ${document.type}">${capitalizeFirstLetter(document.type)}</span></td>
        <td>${document.size}</td>
                <td>${formattedDate}</td>
        <td>
          <div class="document-actions">
            <button class="document-btn preview-btn" title="Preview">
              <i class="fas fa-eye"></i>
            </button>
            <button class="document-btn download-btn" title="Download">
              <i class="fas fa-download"></i>
            </button>
            <button class="document-btn delete-btn" title="Delete">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </td>
      `;
      
      // Add click event to preview button
      row.querySelector('.preview-btn').addEventListener('click', function() {
        showDocumentPreview(document.id);
      });
      
      // Add click event to download button
      row.querySelector('.download-btn').addEventListener('click', function() {
        downloadDocument(document.id);
      });
      
      // Add click event to delete button
      row.querySelector('.delete-btn').addEventListener('click', function() {
        deleteDocument(document.id);
      });
      
      documentsListBody.appendChild(row);
    });
  }
  
  // Show document preview
  function showDocumentPreview(documentId) {
    const document = documents.find(doc => doc.id === documentId);
    if (!document) return;
    
    // Update preview modal content
    const previewModal = document.getElementById('previewModal');
    const previewDocumentName = document.getElementById('previewDocumentName');
    const previewDocumentType = document.getElementById('previewDocumentType');
    const previewDocumentSize = document.getElementById('previewDocumentSize');
    const previewDocumentDate = document.getElementById('previewDocumentDate');
    const previewDocumentDescription = document.getElementById('previewDocumentDescription');
    const documentPreview = document.getElementById('documentPreview');
    
    if (previewDocumentName) previewDocumentName.textContent = document.name;
    if (previewDocumentType) previewDocumentType.textContent = capitalizeFirstLetter(document.type);
    if (previewDocumentSize) previewDocumentSize.textContent = document.size;
    
    const date = new Date(document.date);
    const formattedDate = date.toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'long', 
      day: 'numeric' 
    });
    if (previewDocumentDate) previewDocumentDate.textContent = formattedDate;
    
    if (previewDocumentDescription) {
      previewDocumentDescription.textContent = document.description || 'No description available';
    }
    
    // Set preview content based on file type
    if (documentPreview) {
      let previewContent = '';
      
      if (document.fileType === 'jpg' || document.fileType === 'jpeg' || document.fileType === 'png') {
        // For image files, show a placeholder image
        previewContent = `<img src="assets/images/document-placeholder.jpg" alt="${document.name}">`;
      } else if (document.fileType === 'pdf') {
        // For PDF files, show a PDF icon
        previewContent = `
          <div style="text-align: center;">
            <i class="fas fa-file-pdf" style="font-size: 100px; color: #e74c3c;"></i>
            <p>PDF Document Preview</p>
          </div>
        `;
      } else {
        // For other file types, show a generic file icon
        let iconClass = 'fa-file';
        if (document.fileType === 'doc' || document.fileType === 'docx') iconClass = 'fa-file-word';
        else if (document.fileType === 'xls' || document.fileType === 'xlsx') iconClass = 'fa-file-excel';
        
        previewContent = `
          <div style="text-align: center;">
            <i class="fas ${iconClass}" style="font-size: 100px; color: #3498db;"></i>
            <p>${document.fileType.toUpperCase()} Document Preview</p>
          </div>
        `;
      }
      
      documentPreview.innerHTML = previewContent;
    }
    
    // Set download button action
    const downloadDocumentBtn = document.getElementById('downloadDocumentBtn');
    if (downloadDocumentBtn) {
      downloadDocumentBtn.onclick = function() {
        downloadDocument(document.id);
      };
    }
    
    // Set delete button action
    const deleteDocumentBtn = document.getElementById('deleteDocumentBtn');
    if (deleteDocumentBtn) {
      deleteDocumentBtn.onclick = function() {
        // Close modal first
        previewModal.style.display = 'none';
        // Then delete document
        deleteDocument(document.id);
      };
    }
    
    // Show preview modal
    if (previewModal) {
      previewModal.style.display = 'block';
    }
  }
  
  // Download document
  function downloadDocument(documentId) {
    const document = documents.find(doc => doc.id === documentId);
    if (!document) return;
    
    // In a real app, this would trigger a file download
    alert(`Downloading ${document.name}...`);
  }
  
  // Delete document
  function deleteDocument(documentId) {
    // Confirm deletion
    if (confirm('Are you sure you want to delete this document?')) {
      // Remove document from array
      documents = documents.filter(doc => doc.id !== documentId);
      
      // Update in localStorage
      localStorage.setItem(`documents_${userData.email}`, JSON.stringify(documents));
      
      // Update UI based on current view
      const gridViewBtn = document.getElementById('gridViewBtn');
      if (gridViewBtn.classList.contains('active')) {
        populateDocumentsGrid();
      } else {
        populateDocumentsList();
      }
    }
  }
  
  // Filter documents
  function filterDocuments() {
    const documentTypeFilter = document.getElementById('documentTypeFilter').value;
    const dateFilter = document.getElementById('dateFilter').value;
    
    let filteredDocuments = [...documents];
    
    // Apply document type filter
    if (documentTypeFilter !== 'all') {
      filteredDocuments = filteredDocuments.filter(doc => doc.type === documentTypeFilter);
    }
    
    // Apply date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      if (dateFilter === 'recent') {
        // Last 30 days
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);
        
        filteredDocuments = filteredDocuments.filter(doc => {
          const docDate = new Date(doc.date);
          return docDate >= thirtyDaysAgo;
        });
      } else if (dateFilter === 'month') {
        // This month
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        
        filteredDocuments = filteredDocuments.filter(doc => {
          const docDate = new Date(doc.date);
          return docDate >= firstDayOfMonth;
        });
      } else if (dateFilter === 'year') {
        // This year
        const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
        
        filteredDocuments = filteredDocuments.filter(doc => {
          const docDate = new Date(doc.date);
          return docDate >= firstDayOfYear;
        });
      }
    }
    
    // Update UI based on current view
    const gridViewBtn = document.getElementById('gridViewBtn');
    if (gridViewBtn.classList.contains('active')) {
      populateDocumentsGrid(filteredDocuments);
    } else {
      populateDocumentsList(filteredDocuments);
    }
  }
  
  // Search documents
  function searchDocuments(query) {
    if (!query) {
      // If search query is empty, show all documents
      const gridViewBtn = document.getElementById('gridViewBtn');
      if (gridViewBtn.classList.contains('active')) {
        populateDocumentsGrid();
      } else {
        populateDocumentsList();
      }
      return;
    }
    
    query = query.toLowerCase();
    const filteredDocuments = documents.filter(doc => 
      doc.name.toLowerCase().includes(query) || 
      doc.description.toLowerCase().includes(query) ||
      doc.type.toLowerCase().includes(query)
    );
    
    // Update UI based on current view
    const gridViewBtn = document.getElementById('gridViewBtn');
    if (gridViewBtn.classList.contains('active')) {
      populateDocumentsGrid(filteredDocuments);
    } else {
      populateDocumentsList(filteredDocuments);
    }
  }
  
  // Initialize documents display
  populateDocumentsGrid();
  
  // View toggle functionality
  const gridViewBtn = document.getElementById('gridViewBtn');
  const listViewBtn = document.getElementById('listViewBtn');
  const documentsGrid = document.getElementById('documentsGrid');
  const documentsList = document.getElementById('documentsList');
  
  if (gridViewBtn) {
    gridViewBtn.addEventListener('click', function() {
      gridViewBtn.classList.add('active');
      listViewBtn.classList.remove('active');
      documentsGrid.style.display = 'grid';
      documentsList.style.display = 'none';
    });
  }
  
  if (listViewBtn) {
    listViewBtn.addEventListener('click', function() {
      listViewBtn.classList.add('active');
      gridViewBtn.classList.remove('active');
      documentsList.style.display = 'table';
      documentsGrid.style.display = 'none';
      
      // Populate list view if it's empty
      if (document.getElementById('documentsListBody').children.length === 0) {
        populateDocumentsList();
      }
    });
  }
  
  // Filter functionality
  const documentTypeFilter = document.getElementById('documentTypeFilter');
  const dateFilter = document.getElementById('dateFilter');
  
  if (documentTypeFilter) {
    documentTypeFilter.addEventListener('change', filterDocuments);
  }
  
  if (dateFilter) {
    dateFilter.addEventListener('change', filterDocuments);
  }
  
  // Clear filters button
  const clearFiltersBtn = document.getElementById('clearFiltersBtn');
  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener('click', function() {
      documentTypeFilter.value = 'all';
      dateFilter.value = 'all';
      
      // Update UI based on current view
      const gridViewBtn = document.getElementById('gridViewBtn');
      if (gridViewBtn.classList.contains('active')) {
        populateDocumentsGrid();
      } else {
        populateDocumentsList();
      }
    });
  }
  
  // Search functionality
  const documentSearch = document.getElementById('documentSearch');
  const searchBtn = document.getElementById('searchBtn');
  
  if (searchBtn) {
    searchBtn.addEventListener('click', function() {
      searchDocuments(documentSearch.value);
    });
  }
  
  if (documentSearch) {
    documentSearch.addEventListener('keyup', function(e) {
      if (e.key === 'Enter') {
        searchDocuments(this.value);
      }
    });
  }
  
  // Upload document functionality
  const uploadDocBtn = document.getElementById('uploadDocBtn');
  const uploadModal = document.getElementById('uploadModal');
  const closeUploadModal = document.getElementById('closeUploadModal');
  const cancelUploadBtn = document.getElementById('cancelUploadBtn');
  const uploadForm = document.getElementById('uploadForm');
  const emptyStateUploadBtn = document.getElementById('emptyStateUploadBtn');
  
  // Load user applications for the related application dropdown
  function loadUserApplications() {
    const relatedApplicationSelect = document.getElementById('relatedApplication');
    if (!relatedApplicationSelect) return;
    
    // Clear existing options except the first one
    while (relatedApplicationSelect.options.length > 1) {
      relatedApplicationSelect.remove(1);
    }
    
    // Get user applications from localStorage
    const userApplications = JSON.parse(localStorage.getItem(`applications_${userData.email}`)) || [];
    
    // Add applications to dropdown
    userApplications.forEach(app => {
      const option = document.createElement('option');
      option.value = app.id;
      option.textContent = `${app.type} (${app.id})`;
      relatedApplicationSelect.appendChild(option);
    });
  }
  
  if (uploadDocBtn) {
    uploadDocBtn.addEventListener('click', function() {
      // Load user applications
      loadUserApplications();
      
      // Show upload modal
      uploadModal.style.display = 'block';
    });
  }
  
  if (emptyStateUploadBtn) {
    emptyStateUploadBtn.addEventListener('click', function() {
      // Load user applications
      loadUserApplications();
      
      // Show upload modal
      uploadModal.style.display = 'block';
    });
  }
  
  if (closeUploadModal) {
    closeUploadModal.addEventListener('click', function() {
      uploadModal.style.display = 'none';
    });
  }
  
  if (cancelUploadBtn) {
    cancelUploadBtn.addEventListener('click', function() {
      uploadModal.style.display = 'none';
    });
  }
  
  // Close modal when clicking outside
  window.addEventListener('click', function(event) {
    if (event.target === uploadModal) {
      uploadModal.style.display = 'none';
    }
    
    if (event.target === document.getElementById('previewModal')) {
      document.getElementById('previewModal').style.display = 'none';
    }
  });
  
  if (uploadForm) {
    uploadForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const documentName = document.getElementById('documentName').value;
      const documentType = document.getElementById('documentType').value;
      const documentFile = document.getElementById('documentFile').files[0];
      const documentDescription = document.getElementById('documentDescription').value;
      const relatedApplication = document.getElementById('relatedApplication').value;
      
      if (!documentName || !documentType || !documentFile) {
        alert('Please fill in all required fields.');
        return;
      }
      
      // Get file extension
      const fileExtension = documentFile.name.split('.').pop().toLowerCase();
      
      // Create new document object
      const newDocument = {
        id: Date.now(), // Use timestamp as ID
        name: documentName,
        type: documentType,
        fileType: fileExtension,
        size: formatFileSize(documentFile.size),
        date: new Date().toISOString().split('T')[0], // Current date in YYYY-MM-DD format
        description: documentDescription,
        relatedApplication: relatedApplication
      };
      
      // Add document to array
      documents.push(newDocument);
      
      // Update in localStorage
      localStorage.setItem(`documents_${userData.email}`, JSON.stringify(documents));
      
      // Update UI based on current view
      const gridViewBtn = document.getElementById('gridViewBtn');
      if (gridViewBtn.classList.contains('active')) {
        populateDocumentsGrid();
      } else {
        populateDocumentsList();
      }
      
            // Reset form
            uploadForm.reset();
      
            // Close modal
            uploadModal.style.display = 'none';
          });
        }
        
        // Helper function to format file size
        function formatFileSize(bytes) {
          if (bytes === 0) return '0 Bytes';
          
          const k = 1024;
          const sizes = ['Bytes', 'KB', 'MB', 'GB'];
          const i = Math.floor(Math.log(bytes) / Math.log(k));
          
          return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
        }
        
        // Helper function to capitalize first letter
        function capitalizeFirstLetter(string) {
          return string.charAt(0).toUpperCase() + string.slice(1);
        }
        
        // Close preview modal
        const closePreviewModal = document.getElementById('closePreviewModal');
        if (closePreviewModal) {
          closePreviewModal.addEventListener('click', function() {
            document.getElementById('previewModal').style.display = 'none';
          });
        }
        
        // Update unread messages badge
        function updateUnreadBadge() {
          const unreadBadge = document.getElementById('unreadBadge');
          if (!unreadBadge) return;
          
          // Get messages from localStorage
          let messages = [];
          try {
            messages = JSON.parse(localStorage.getItem(`messages_${userData.email}`)) || [];
          } catch (e) {
            console.error('Error parsing messages:', e);
            messages = [];
          }
          
          // Count unread messages
          const unreadCount = messages.filter(msg => !msg.isRead).length;
          
          // Update badge
          if (unreadCount > 0) {
            unreadBadge.textContent = unreadCount;
            unreadBadge.style.display = 'inline';
          } else {
            unreadBadge.style.display = 'none';
          }
        }
        
        // Call updateUnreadBadge on page load
        updateUnreadBadge();
      });
      
