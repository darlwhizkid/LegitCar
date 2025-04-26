// New Application Page JavaScript
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
  const sidebar = document.querySelector('.dashboard-sidebar');
  
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
  
  // Application type selection
  const applicationTypeCards = document.querySelectorAll('.application-type-card');
  const applicationForm = document.getElementById('applicationForm');
  const formTitle = document.getElementById('formTitle');
  let selectedApplicationType = '';
  
  // Get all form containers
  const vehicleRegistrationForm = document.getElementById('vehicleRegistrationForm');
  const ownershipTransferForm = document.getElementById('ownershipTransferForm');
  const licenseRenewalForm = document.getElementById('licenseRenewalForm');
  const documentationForm = document.getElementById('documentationForm');
  const driversLicenseForm = document.getElementById('driversLicenseForm');
  const accessoriesForm = document.getElementById('accessoriesForm');
  const maritimeRegistrationForm = document.getElementById('maritimeRegistrationForm');
  const aviationDocumentationForm = document.getElementById('aviationDocumentationForm');
  
  // Function to hide all forms
  function hideAllForms() {
    const allForms = [
      vehicleRegistrationForm,
      ownershipTransferForm,
      licenseRenewalForm,
      documentationForm,
      driversLicenseForm,
      accessoriesForm,
      maritimeRegistrationForm,
      aviationDocumentationForm
    ];
    
    allForms.forEach(form => {
      if (form) form.style.display = 'none';
    });
  }
  
  applicationTypeCards.forEach(card => {
    card.addEventListener('click', function() {
      // Remove selected class from all cards
      applicationTypeCards.forEach(c => c.classList.remove('selected'));
      
      // Add selected class to clicked card
      this.classList.add('selected');
      
      // Get application type
      selectedApplicationType = this.getAttribute('data-type');
      
      // Update form title
      if (formTitle) {
        formTitle.textContent = this.querySelector('h3').textContent + ' Application';
      }
      
      // Show application form container
      if (applicationForm) {
        applicationForm.style.display = 'block';
        
        // Hide all forms first
        hideAllForms();
        
        // Show the appropriate form based on selected type
        switch (selectedApplicationType) {
          case 'vehicle-registration':
            if (vehicleRegistrationForm) vehicleRegistrationForm.style.display = 'block';
            break;
          case 'ownership-transfer':
            if (ownershipTransferForm) ownershipTransferForm.style.display = 'block';
            break;
          case 'license-renewal':
            if (licenseRenewalForm) licenseRenewalForm.style.display = 'block';
            break;
          case 'documentation':
            if (documentationForm) documentationForm.style.display = 'block';
            break;
          case 'drivers-license':
            if (driversLicenseForm) driversLicenseForm.style.display = 'block';
            break;
          case 'accessories':
            if (accessoriesForm) accessoriesForm.style.display = 'block';
            break;
          case 'maritime-registration':
            if (maritimeRegistrationForm) maritimeRegistrationForm.style.display = 'block';
            break;
          case 'aviation-documentation':
            if (aviationDocumentationForm) aviationDocumentationForm.style.display = 'block';
            break;
        }
        
        // Scroll to form
        applicationForm.scrollIntoView({ behavior: 'smooth' });
      }
      
      // Update fees based on application type
      updateFees(selectedApplicationType);
      
      // Pre-fill owner information
      prefillOwnerInfo();
    });
  });
  
  // Function to update fees based on application type
  function updateFees(applicationType) {
    const applicationFeeElement = document.getElementById('applicationFee');
    const processingFeeElement = document.getElementById('processingFee');
    const totalFeeElement = document.getElementById('totalFee');
    
    let applicationFee = 5000; // Default fee
    
    // Set application fee based on type
    switch (applicationType) {
      case 'vehicle-registration':
        applicationFee = 5000;
        break;
      case 'ownership-transfer':
        applicationFee = 7500;
        break;
      case 'license-renewal':
        applicationFee = 3000;
        break;
      case 'documentation':
        applicationFee = 4000;
        break;
      case 'drivers-license':
        applicationFee = 6500;
        break;
      case 'accessories':
        applicationFee = 2000;
        break;
    }
    
    const processingFee = 1000; // Fixed processing fee
    const totalFee = applicationFee + processingFee;
    
    // Update fee display
    if (applicationFeeElement) {
      applicationFeeElement.textContent = `₦${applicationFee.toLocaleString()}.00`;
    }
    
    if (processingFeeElement) {
      processingFeeElement.textContent = `₦${processingFee.toLocaleString()}.00`;
    }
    
    if (totalFeeElement) {
      totalFeeElement.textContent = `₦${totalFee.toLocaleString()}.00`;
    }
  }
  
  // Add document button
  const addDocumentBtns = document.querySelectorAll('.add-document-btn');
  addDocumentBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const documentUploadList = this.previousElementSibling;
      
      if (documentUploadList) {
        const newDocItem = document.createElement('div');
        newDocItem.className = 'document-upload-item';
        
        const docCount = documentUploadList.querySelectorAll('.document-upload-item').length + 1;
        
        newDocItem.innerHTML = `
          <label for="additionalDoc${docCount}">Additional Document ${docCount}</label>
          <input type="file" id="additionalDoc${docCount}" name="additionalDoc${docCount}" accept=".pdf,.jpg,.jpeg,.png">
        `;
        
        documentUploadList.appendChild(newDocItem);
      }
    });
  });
  
  // Cancel application buttons
  const cancelApplicationBtns = document.querySelectorAll('.cancel-application-btn');
  cancelApplicationBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      // Hide application form
      if (applicationForm) {
        applicationForm.style.display = 'none';
      }
      
      // Remove selected class from all cards
      applicationTypeCards.forEach(card => card.classList.remove('selected'));
      
      // Reset all forms
      const allForms = document.querySelectorAll('.application-form');
      allForms.forEach(form => {
        if (form) form.reset();
      });
      
      // Scroll to application types
      document.querySelector('.application-types').scrollIntoView({ behavior: 'smooth' });
    });
  });
  
  // Submit application forms
  const applicationForms = document.querySelectorAll('.application-form');
  applicationForms.forEach(form => {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Get form data
      const formData = new FormData(this);
      
      // Create application object
      const newApplication = {
        id: generateApplicationId(),
        type: getApplicationTypeName(selectedApplicationType),
        date: new Date().toISOString().split('T')[0], // Current date in YYYY-MM-DD format
        status: 'pending',
        vehicleInfo: getVehicleInfo(selectedApplicationType, formData),
        documents: getDocumentsList(selectedApplicationType),
        notes: 'Application submitted and awaiting review.',
        timeline: [
          { 
            date: new Date().toISOString().split('T')[0], 
            title: 'Application Submitted', 
            description: 'Your application has been received and is being processed.' 
          }
        ]
      };
      
      // Save application to localStorage
      saveApplication(newApplication);
      
      // Show success modal
      showSuccessModal(newApplication.id);
    });
  });
  
  // Function to get vehicle info based on application type
  function getVehicleInfo(applicationType, formData) {
    switch (applicationType) {
      case 'vehicle-registration':
        return `${formData.get('vehicleMake')} ${formData.get('vehicleModel')} ${formData.get('vehicleYear')}, ${formData.get('vehicleColor')}, VIN: ${formData.get('vehicleVIN')}`;
      
      case 'ownership-transfer':
        return `${formData.get('vehicleMake')} ${formData.get('vehicleModel')}, From: ${formData.get('currentOwnerName')} To: ${formData.get('newOwnerName')}`;
      
      case 'license-renewal':
        return `License Number: ${formData.get('licenseNumber')}, Expiry: ${formData.get('expiryDate')}`;
      
      case 'documentation':
        return `Document Type: ${formData.get('documentType')}, Vehicle: ${formData.get('vehicleDetails')}`;
      
      case 'drivers-license':
        return `License Type: ${formData.get('licenseType')}, Applicant: ${formData.get('applicantName')}`;
      
      case 'accessories':
        return `Accessory: ${formData.get('accessoryType')}, Quantity: ${formData.get('quantity')}`;
      
      default:
        return 'No vehicle information available';
    }
  }
  
  // Function to get documents list based on application type
  function getDocumentsList(applicationType) {
    const commonDocs = [
      { name: 'ID Card', type: 'jpg' }
    ];
    
    switch (applicationType) {
      case 'vehicle-registration':
        return [
          ...commonDocs,
          { name: 'Proof of Ownership', type: 'pdf' },
          { name: 'Insurance Certificate', type: 'pdf' }
        ];
      
      case 'ownership-transfer':
        return [
          ...commonDocs,
          { name: 'Current Vehicle Registration', type: 'pdf' },
          { name: 'Sales Agreement', type: 'pdf' },
          { name: 'Transfer Form', type: 'pdf' }
        ];
      
      case 'license-renewal':
        return [
          ...commonDocs,
          { name: 'Expired License', type: 'jpg' },
          { name: 'Passport Photograph', type: 'jpg' }
        ];
      
      case 'documentation':
        return [
          ...commonDocs,
          { name: 'Supporting Documents', type: 'pdf' }
        ];
      
      case 'drivers-license':
        return [
          ...commonDocs,
          { name: 'Passport Photograph', type: 'jpg' },
          { name: 'Proof of Address', type: 'pdf' },
          { name: 'Medical Certificate', type: 'pdf' }
        ];
      
      case 'accessories':
        return [
          ...commonDocs,
          { name: 'Payment Receipt', type: 'pdf' }
        ];
      
      default:
        return commonDocs;
    }
  }
  
  // Function to generate application ID
  function generateApplicationId() {
    const prefix = 'APP';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}-${timestamp}-${random}`;
  }
  
  // Function to get application type name
  function getApplicationTypeName(type) {
    switch (type) {
      case 'vehicle-registration':
        return 'Vehicle Registration';
      case 'ownership-transfer':
        return 'Change of Ownership';
      case 'license-renewal':
        return 'License Renewal';
      case 'documentation':
        return 'Documentation Services';
      case 'drivers-license':
        return 'Driver\'s License';
      case 'accessories':
        return 'Vehicle Accessories';
      default:
        return 'Unknown Application';
    }
  }
  
  // Function to save application to localStorage
  function saveApplication(application) {
    const userEmail = userData.email;
    if (!userEmail) return;
    
    // Get existing applications
    let applications = [];
    const storedApplications = localStorage.getItem(`applications_${userEmail}`);
    
    if (storedApplications) {
      try {
        applications = JSON.parse(storedApplications);
      } catch (e) {
        console.error('Error parsing stored applications:', e);
      }
    }
    
    // Add new application
    applications.push(application);
    
    // Save updated applications
    localStorage.setItem(`applications_${userEmail}`, JSON.stringify(applications));
  }
  
  // Function to show success modal
  function showSuccessModal(applicationId) {
    const successModal = document.getElementById('successModal');
    const successAppId = document.getElementById('successAppId');
    const closeModalBtn = document.querySelector('.close-modal');
    const viewApplicationsBtn = document.getElementById('viewApplicationsBtn');
    const newApplicationBtn = document.getElementById('newApplicationBtn');
    
    // Set application ID in modal
    if (successAppId) {
      successAppId.textContent = applicationId;
    }
    
    // Show modal
    if (successModal) {
      successModal.style.display = 'block';
    }
    
    // Close modal button
    if (closeModalBtn) {
      closeModalBtn.addEventListener('click', function() {
        successModal.style.display = 'none';
      });
    }
    
    // View applications button
    if (viewApplicationsBtn) {
      viewApplicationsBtn.addEventListener('click', function() {
        window.location.href = 'applications.html';
      });
    }
    
    // New application button
    if (newApplicationBtn) {
      newApplicationBtn.addEventListener('click', function() {
        // Hide modal
        successModal.style.display = 'none';
        
        // Reset forms
        const allForms = document.querySelectorAll('.application-form');
        allForms.forEach(form => {
          if (form) form.reset();
        });
        
        // Hide application form
        if (applicationForm) {
          applicationForm.style.display = 'none';
        }
        
        // Remove selected class from all cards
        applicationTypeCards.forEach(card => card.classList.remove('selected'));
        
        // Scroll to application types
        document.querySelector('.application-types').scrollIntoView({ behavior: 'smooth' });
      });
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
      if (event.target === successModal) {
        successModal.style.display = 'none';
      }
    });
  }
  
  // Pre-fill owner information from user data
  function prefillOwnerInfo() {
    // For vehicle registration form
    const ownerName = document.getElementById('ownerName');
    const ownerEmail = document.getElementById('ownerEmail');
    const ownerPhone = document.getElementById('ownerPhone');
    const ownerAddress = document.getElementById('ownerAddress');
    
    // For ownership transfer form
    const newOwnerName = document.getElementById('newOwnerName');
    const newOwnerEmail = document.getElementById('newOwnerEmail');
    const newOwnerPhone = document.getElementById('newOwnerPhone');
    
    // For license renewal form
    const applicantName = document.getElementById('applicantName');
    const applicantEmail = document.getElementById('applicantEmail');
    const applicantPhone = document.getElementById('applicantPhone');
    
    // For driver's license form
    const dlApplicantName = document.getElementById('dlApplicantName');
    const dlApplicantEmail = document.getElementById('dlApplicantEmail');
    const dlApplicantPhone = document.getElementById('dlApplicantPhone');
    
    // For documentation form
    const requestorName = document.getElementById('requestorName');
    const requestorEmail = document.getElementById('requestorEmail');
    const requestorPhone = document.getElementById('requestorPhone');
    
    // For accessories form
    const customerName = document.getElementById('customerName');
    const customerEmail = document.getElementById('customerEmail');
    const customerPhone = document.getElementById('customerPhone');
    
    // Fill in the data if available
    if (userData.name) {
      if (ownerName) ownerName.value = userData.name;
      if (newOwnerName) newOwnerName.value = userData.name;
      if (applicantName) applicantName.value = userData.name;
      if (dlApplicantName) dlApplicantName.value = userData.name;
      if (requestorName) requestorName.value = userData.name;
      if (customerName) customerName.value = userData.name;
    }
    
    if (userData.email) {
      if (ownerEmail) ownerEmail.value = userData.email;
      if (newOwnerEmail) newOwnerEmail.value = userData.email;
      if (applicantEmail) applicantEmail.value = userData.email;
      if (dlApplicantEmail) dlApplicantEmail.value = userData.email;
      if (requestorEmail) requestorEmail.value = userData.email;
      if (customerEmail) customerEmail.value = userData.email;
    }
    
    if (userData.phone) {
      if (ownerPhone) ownerPhone.value = userData.phone;
      if (newOwnerPhone) newOwnerPhone.value = userData.phone;
      if (applicantPhone) applicantPhone.value = userData.phone;
      if (dlApplicantPhone) dlApplicantPhone.value = userData.phone;
      if (requestorPhone) requestorPhone.value = userData.phone;
      if (customerPhone) customerPhone.value = userData.phone;
    }
    
    if (userData.address && ownerAddress) {
      ownerAddress.value = userData.address;
    }
  }
});      
