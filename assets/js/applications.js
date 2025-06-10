// Applications Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
  console.log('Page loaded');
  
  // Consistent authentication check
  const token = localStorage.getItem('token');
  const currentUser = localStorage.getItem('currentUser');
  
  // Only proceed if both token and user data exist
  if (!token || !currentUser) {
    // Clear any partial auth data
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isAuthenticated');
    
    // Redirect directly to login page, not index.html
    window.location.href = 'login.html';
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
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
      localStorage.removeItem('isAuthenticated');
      
      // Redirect to home page
      window.location.href = 'index.html';
    });
  }
  
  // Mobile sidebar toggle functionality
  const sidebarToggle = document.getElementById('sidebarToggle');
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
  
  // Sample applications data (in a real app, this would come from an API)
  const sampleApplications = [
    {
      id: 'APP-001',
      type: 'Vehicle Registration',
      date: '2023-05-15',
      status: 'approved',
      vehicleInfo: 'Toyota Camry 2020, Black, VIN: 1HGBH41JXMN109186',
      documents: [
        { name: 'Proof of Ownership', type: 'pdf' },
        { name: 'ID Card', type: 'jpg' },
        { name: 'Insurance Certificate', type: 'pdf' }
      ],
      notes: 'Registration completed successfully.',
      timeline: [
        { date: '2023-05-10', title: 'Application Submitted', description: 'Your application has been received and is being processed.' },
        { date: '2023-05-12', title: 'Document Verification', description: 'Your documents are being verified by our team.' },
        { date: '2023-05-14', title: 'Payment Confirmed', description: 'Your payment has been confirmed.' },
        { date: '2023-05-15', title: 'Application Approved', description: 'Your vehicle registration has been approved.' }
      ]
    },
    {
      id: 'APP-002',
      type: 'Change of Ownership',
      date: '2023-06-02',
      status: 'pending',
      vehicleInfo: 'Honda Accord 2018, Silver, VIN: 2HGFC2F74LH123456',
      documents: [
        { name: 'Sales Agreement', type: 'pdf' },
        { name: 'Previous Owner ID', type: 'jpg' },
        { name: 'New Owner ID', type: 'jpg' }
      ],
      notes: 'Awaiting document verification.',
      timeline: [
        { date: '2023-06-02', title: 'Application Submitted', description: 'Your application has been received and is being processed.' },
        { date: '2023-06-03', title: 'Document Verification', description: 'Your documents are being verified by our team.' }
      ]
    },
    {
      id: 'APP-003',
      type: 'License Renewal',
      date: '2023-06-10',
      status: 'in-progress',
      vehicleInfo: 'Ford Explorer 2019, Blue, VIN: 1FMSK8DH3LGB12345',
      documents: [
        { name: 'Expired License', type: 'jpg' },
        { name: 'Proof of Address', type: 'pdf' },
        { name: 'Passport Photo', type: 'jpg' }
      ],
      notes: 'Processing payment.',
      timeline: [
        { date: '2023-06-10', title: 'Application Submitted', description: 'Your application has been received and is being processed.' },
        { date: '2023-06-12', title: 'Document Verification', description: 'Your documents have been verified.' },
        { date: '2023-06-14', title: 'Payment Processing', description: 'Your payment is being processed.' }
      ]
    }
  ];
  
  // Get DOM elements
  const applicationsList = document.getElementById('applicationsList');
  const noApplications = document.getElementById('noApplications');
  const applicationModal = document.getElementById('applicationModal');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const closeModalX = document.querySelector('.close-modal');
  const trackAppBtn = document.getElementById('trackAppBtn');
  const applicationSearch = document.getElementById('applicationSearch');
  const searchBtn = document.getElementById('searchBtn');
  const statusFilter = document.getElementById('statusFilter');
  const dateFilter = document.getElementById('dateFilter');
  const prevPageBtn = document.getElementById('prevPage');
  const nextPageBtn = document.getElementById('nextPage');
  const currentPageElement = document.getElementById('currentPage');
  const totalPagesElement = document.getElementById('totalPages');
  
  // Pagination state
  let currentPage = 1;
  const itemsPerPage = 6;
  let filteredApplications = [...sampleApplications];
      // Initialize the page
      initializeApplicationsPage();

      // Function to initialize the applications page
      function initializeApplicationsPage() {
        // Get user-specific applications instead of sample data
        const userEmail = userData.email;
        let userApplications = [];
  
        if (userEmail) {
          const storedApplications = localStorage.getItem(`applications_${userEmail}`);
          if (storedApplications) {
            try {
              userApplications = JSON.parse(storedApplications);
            } catch (e) {
              console.error('Error parsing stored applications:', e);
            }
          }
        }
  
        // Use user applications instead of sample data
        filteredApplications = [...userApplications];
  
        // Check if user has any applications
        if (userApplications.length === 0) {
          showNoApplications();
        } else {
          hideNoApplications();
          renderApplications();
          setupPagination();
        }
  
        // Add event listeners
        setupEventListeners();
      }

      // Function to show "No Applications" message
  function showNoApplications() {
    if (noApplications) {
      noApplications.style.display = 'flex';
    }
    if (applicationsList) {
      applicationsList.style.display = 'none';
    }
  }
  
  // Function to hide "No Applications" message
  function hideNoApplications() {
    if (noApplications) {
      noApplications.style.display = 'none';
    }
    if (applicationsList) {
      applicationsList.style.display = 'grid';
    }
  }
  
  // Function to render applications
  function renderApplications() {
    if (!applicationsList) return;
    
    // Clear the applications list
    applicationsList.innerHTML = '';
    
    // Calculate pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedApplications = filteredApplications.slice(startIndex, endIndex);
    
    // If no applications after filtering, show no applications message
    if (paginatedApplications.length === 0) {
      showNoApplications();
      return;
    }
    
    // Hide no applications message
    hideNoApplications();
    
    // Create application cards
    paginatedApplications.forEach(app => {
      const card = createApplicationCard(app);
      applicationsList.appendChild(card);
    });
  }
  
  // Function to create an application card
  function createApplicationCard(app) {
    const card = document.createElement('div');
    card.className = 'application-card';
    
    // Format date
    const formattedDate = formatDate(app.date);
    
    card.innerHTML = `
      <div class="card-header">
        <span class="app-type">${app.type}</span>
        <span class="status-badge status-${app.status}">${capitalizeFirstLetter(app.status)}</span>
      </div>
      <div class="card-body">
        <div class="card-info">
          <div class="info-row">
            <div class="info-label">Application ID:</div>
            <div class="info-value">${app.id}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Date:</div>
            <div class="info-value">${formattedDate}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Vehicle:</div>
            <div class="info-value">${app.vehicleInfo.split(',')[0]}</div>
          </div>
        </div>
        <div class="card-actions">
          <button class="view-details-btn" data-app-id="${app.id}">View Details</button>
          <button class="track-app-btn" data-app-id="${app.id}">Track Application</button>
        </div>
      </div>
    `;
    
    // Add event listeners to buttons
    const viewDetailsBtn = card.querySelector('.view-details-btn');
    const trackAppBtn = card.querySelector('.track-app-btn');
    
    viewDetailsBtn.addEventListener('click', function() {
      openApplicationModal(app);
    });
    
    trackAppBtn.addEventListener('click', function() {
      // In a real app, this would navigate to a tracking page
      alert(`Tracking application ${app.id}`);
    });
    
    return card;
  }
  
  // Function to open application modal
  function openApplicationModal(app) {
    // Populate modal with application details
    document.getElementById('modalAppId').textContent = app.id;
    document.getElementById('modalAppType').textContent = app.type;
    document.getElementById('modalAppDate').textContent = formatDate(app.date);
    
    const statusElement = document.getElementById('modalAppStatus');
    statusElement.textContent = capitalizeFirstLetter(app.status);
    statusElement.className = 'detail-value status-badge status-' + app.status;
    
    document.getElementById('modalVehicleInfo').textContent = app.vehicleInfo;
    
    // Populate documents
    const documentsContainer = document.getElementById('modalDocuments');
    documentsContainer.innerHTML = '';
    
    app.documents.forEach(doc => {
      const docElement = document.createElement('div');
      docElement.className = 'document-item';
      
      const iconClass = doc.type === 'pdf' ? 'fa-file-pdf' : 'fa-file-image';
      
      docElement.innerHTML = `
        <i class="fas ${iconClass}"></i>
        <span>${doc.name}</span>
      `;
      
      documentsContainer.appendChild(docElement);
    });
    
    document.getElementById('modalNotes').textContent = app.notes;
    
    // Populate timeline
    const timelineContainer = document.getElementById('modalTimeline');
    timelineContainer.innerHTML = '';
    
    app.timeline.forEach((item, index) => {
      const timelineItem = document.createElement('div');
      timelineItem.className = 'timeline-item';
      
      // Mark the last item as active
      if (index === app.timeline.length - 1) {
        timelineItem.classList.add('active');
      }
      
      timelineItem.innerHTML = `
        <div class="timeline-date">${formatDate(item.date)}</div>
        <div class="timeline-title">${item.title}</div>
        <div class="timeline-description">${item.description}</div>
      `;
      
      timelineContainer.appendChild(timelineItem);
    });
    
    // Show the modal
    applicationModal.style.display = 'block';
    
    // Prevent body scrolling when modal is open
    document.body.style.overflow = 'hidden';
  }
  
  // Function to close application modal
  function closeApplicationModal() {
    applicationModal.style.display = 'none';
    
    // Restore body scrolling
    document.body.style.overflow = 'auto';
  }
  
  // Function to setup pagination
  function setupPagination() {
    const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);
    
    if (currentPageElement) {
      currentPageElement.textContent = currentPage;
    }
    
    if (totalPagesElement) {
      totalPagesElement.textContent = totalPages;
    }
    
    // Update pagination buttons state
    if (prevPageBtn) {
      prevPageBtn.disabled = currentPage === 1;
    }
    
    if (nextPageBtn) {
      nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;
    }
  }
  
  // Function to setup event listeners
  function setupEventListeners() {
    // Close modal buttons
    if (closeModalBtn) {
      closeModalBtn.addEventListener('click', closeApplicationModal);
    }
    
    if (closeModalX) {
      closeModalX.addEventListener('click', closeApplicationModal);
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
      if (event.target === applicationModal) {
        closeApplicationModal();
      }
    });
    
    // Track application button in modal
    if (trackAppBtn) {
      trackAppBtn.addEventListener('click', function() {
        const appId = document.getElementById('modalAppId').textContent;
        alert(`Tracking application ${appId}`);
        closeApplicationModal();
      });
    }
    
    // Search functionality
    if (searchBtn && applicationSearch) {
      searchBtn.addEventListener('click', function() {
        filterApplications();
      });
      
      applicationSearch.addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
          filterApplications();
        }
      });
    }
    
    // Filter dropdowns
    if (statusFilter) {
      statusFilter.addEventListener('change', filterApplications);
    }
    
    if (dateFilter) {
      dateFilter.addEventListener('change', filterApplications);
    }
    
    // Pagination buttons
    if (prevPageBtn) {
      prevPageBtn.addEventListener('click', function() {
        if (currentPage > 1) {
          currentPage--;
          renderApplications();
          setupPagination();
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
        }
      });
    }
  }
  
  // Function to filter applications
  function filterApplications() {
    const searchTerm = applicationSearch ? applicationSearch.value.toLowerCase() : '';
    const statusValue = statusFilter ? statusFilter.value : 'all';
    const dateValue = dateFilter ? dateFilter.value : 'all';
    
    // Reset to first page when filtering
    currentPage = 1;
    
    // Filter by search term, status, and date
    filteredApplications = sampleApplications.filter(app => {
      // Search term filter
      const matchesSearch = 
        app.id.toLowerCase().includes(searchTerm) ||
        app.type.toLowerCase().includes(searchTerm) ||
        app.vehicleInfo.toLowerCase().includes(searchTerm);
      
      // Status filter
      const matchesStatus = statusValue === 'all' || app.status === statusValue;
      
      // Date filter
      let matchesDate = true;
      if (dateValue !== 'all') {
        const appDate = new Date(app.date);
        const today = new Date();
        
        switch (dateValue) {
          case 'today':
            matchesDate = isSameDay(appDate, today);
            break;
          case 'week':
            matchesDate = isThisWeek(appDate, today);
            break;
          case 'month':
            matchesDate = isSameMonth(appDate, today);
            break;
          case 'year':
            matchesDate = isSameYear(appDate, today);
            break;
        }
      }
      
      return matchesSearch && matchesStatus && matchesDate;
    });
    
    // Render filtered applications
    renderApplications();
    setupPagination();
  }
  
  // Helper function: Format date
  function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  }
  
  // Helper function: Capitalize first letter
  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
  
  // Helper function: Check if two dates are the same day
  function isSameDay(date1, date2) {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  }
  
  // Helper function: Check if a date is in the current week
  function isThisWeek(date, currentDate) {
    const oneDay = 24 * 60 * 60 * 1000;
    const firstDayOfWeek = new Date(currentDate);
    firstDayOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    firstDayOfWeek.setHours(0, 0, 0, 0);
    
    const lastDayOfWeek = new Date(firstDayOfWeek);
    lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);
    lastDayOfWeek.setHours(23, 59, 59, 999);
    
    return date >= firstDayOfWeek && date <= lastDayOfWeek;
  }
  
  // Helper function: Check if two dates are in the same month
  function isSameMonth(date1, date2) {
    return date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  }
  
  // Helper function: Check if two dates are in the same year
  function isSameYear(date1, date2) {
    return date1.getFullYear() === date2.getFullYear();
  }
  
  // Load user applications from localStorage if available
  function loadUserApplications() {
    // In a real app, this would fetch from an API
    // For now, we'll use the sample data
    
    // Check if we have applications in localStorage
    const userEmail = userData.email;
    if (!userEmail) return sampleApplications;
    
    const storedApplications = localStorage.getItem(`applications_${userEmail}`);
    if (storedApplications) {
      try {
        return JSON.parse(storedApplications);
      } catch (e) {
        console.error('Error parsing stored applications:', e);
      }
    }
    
    return sampleApplications;
  }
  
  // Save applications to localStorage
  function saveUserApplications(applications) {
    const userEmail = userData.email;
    if (!userEmail) return;
    
    localStorage.setItem(`applications_${userEmail}`, JSON.stringify(applications));
  }
});