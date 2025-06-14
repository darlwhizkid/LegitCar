// New Application Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
  console.log('New Application page loaded');
  
  // Authentication check - Updated to match login.js token storage
  const token = localStorage.getItem('userToken'); // Changed from 'token' to 'userToken'
  const userEmail = localStorage.getItem('userEmail');
  const userName = localStorage.getItem('userName');
  
  if (!token) {
    console.log('No token found, redirecting to login');
    // Clear any partial auth data
    localStorage.removeItem('userToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('userPicture');
    localStorage.removeItem('loginProvider');
    
    window.location.href = 'login.html';
    return;
  }
  
  // Create user data object from stored values
  const userData = {
    name: userName || 'User',
    email: userEmail || '',
    phone: localStorage.getItem('userPhone') || ''
  };
  
  // Update user info in header
  const userName_element = document.getElementById('userName');
  const userEmail_element = document.getElementById('userEmail');
  
  if (userName_element) userName_element.textContent = userData.name;
  if (userEmail_element) userEmail_element.textContent = userData.email;
  
  // Update user greeting
  const userGreeting = document.getElementById('userGreeting');
  if (userGreeting) {
    userGreeting.textContent = `Welcome, ${userData.name}`;
  }
  
  // Global variables
  let currentStep = 1;
  let selectedApplicationType = null;
  let formData = new FormData();
  let uploadedFiles = {};
  
  // DOM Elements
  const applicationTypeSection = document.getElementById('applicationTypeSection');
  const applicationFormSection = document.getElementById('applicationFormSection');
  const applicationTypeCards = document.querySelectorAll('.application-type-card');
  const changeTypeBtn = document.getElementById('changeTypeBtn');
  const selectedTypeTitle = document.getElementById('selectedTypeTitle');
  const selectedTypeDescription = document.getElementById('selectedTypeDescription');
  const selectedTypeIcon = document.querySelector('.selected-type-icon i');
  const progressFill = document.getElementById('progressFill');
  const applicationForm = document.getElementById('applicationForm');
  const successModal = document.getElementById('successModal');
  const applicationReference = document.getElementById('applicationReference');
  
  // Sidebar functionality
  const sidebarToggle = document.getElementById('sidebarToggle');
  const sidebarClose = document.getElementById('sidebarClose');
  const sidebar = document.getElementById('sidebar');
  const mobileOverlay = document.getElementById('mobileOverlay');
  
  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', function() {
      sidebar.classList.add('active');
      mobileOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  }
  
  if (sidebarClose) {
    sidebarClose.addEventListener('click', closeSidebar);
  }
  
  if (mobileOverlay) {
    mobileOverlay.addEventListener('click', closeSidebar);
  }
  
  function closeSidebar() {
    sidebar.classList.remove('active');
    mobileOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }
  
  // User menu functionality
  const userMenuToggle = document.getElementById('userMenuToggle');
  const userDropdown = document.getElementById('userDropdown');
  
  if (userMenuToggle) {
    userMenuToggle.addEventListener('click', function() {
      userDropdown.classList.toggle('active');
    });
  }
  
  // Close dropdown when clicking outside
  document.addEventListener('click', function(event) {
    if (userMenuToggle && userDropdown && 
        !userMenuToggle.contains(event.target) && 
        !userDropdown.contains(event.target)) {
      userDropdown.classList.remove('active');
    }
  });
  
  // Logout functionality
  const logoutButtons = document.querySelectorAll('#logoutBtn, #headerLogoutBtn');
  logoutButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      // Clear ALL authentication data to match login.js
      localStorage.removeItem('userToken');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userName');
      localStorage.removeItem('userPhone');
      localStorage.removeItem('userPicture');
      localStorage.removeItem('loginProvider');
      window.location.href = 'index.html';
    });
  });
  
  // Application type selection
  applicationTypeCards.forEach(card => {
    card.addEventListener('click', function() {
      const type = this.dataset.type;
      selectApplicationType(type, this);
    });
  });
  
  function selectApplicationType(type, cardElement) {
    // Remove previous selection
    applicationTypeCards.forEach(card => card.classList.remove('selected'));
    
    // Add selection to clicked card
    cardElement.classList.add('selected');
    
    selectedApplicationType = type;
    
    // Update form header
    const typeInfo = getApplicationTypeInfo(type);
    if (selectedTypeTitle) selectedTypeTitle.textContent = typeInfo.title;
    if (selectedTypeDescription) selectedTypeDescription.textContent = typeInfo.description;
    if (selectedTypeIcon) selectedTypeIcon.className = typeInfo.icon;
    
    // Show continue button or auto-proceed
    setTimeout(() => {
      showApplicationForm();
    }, 500);
  }
  
  function getApplicationTypeInfo(type) {
    const types = {
      'vehicle-registration': {
        title: 'Vehicle Registration',
        description: 'Register a new vehicle or renew existing registration',
        icon: 'fas fa-car'
      },
      'ownership-transfer': {
        title: 'Change of Ownership',
        description: 'Transfer vehicle ownership to a new owner',
        icon: 'fas fa-exchange-alt'
      },
      'license-renewal': {
        title: 'License Renewal',
        description: 'Renew your vehicle license',
        icon: 'fas fa-id-card'
      },
      'documentation': {
        title: 'Documentation Services',
        description: 'Get vehicle documentation and certificates',
        icon: 'fas fa-file-alt'
      },
      'drivers-license': {
        title: "Driver's License",
        description: 'Apply for or renew your driver\'s license',
        icon: 'fas fa-id-badge'
      },
      'accessories': {
        title: 'Vehicle Accessories',
        description: 'Order license plates, stickers, and other accessories',
        icon: 'fas fa-tags'
      }
    };
    
    return types[type] || types['vehicle-registration'];
  }
  
  function showApplicationForm() {
    if (applicationTypeSection) applicationTypeSection.style.display = 'none';
    if (applicationFormSection) applicationFormSection.style.display = 'block';
    
    // Pre-fill owner information with user data
    const ownerName = document.getElementById('ownerName');
    const ownerEmail = document.getElementById('ownerEmail');
    const ownerPhone = document.getElementById('ownerPhone');
    
    if (ownerName) ownerName.value = userData.name || '';
    if (ownerEmail) ownerEmail.value = userData.email || '';
    if (ownerPhone) ownerPhone.value = userData.phone || '';
  }
  
  // Change type button
  if (changeTypeBtn) {
    changeTypeBtn.addEventListener('click', function() {
      if (applicationFormSection) applicationFormSection.style.display = 'none';
      if (applicationTypeSection) applicationTypeSection.style.display = 'block';
      
      // Reset form
      resetForm();
    });
  }
  
  function resetForm() {
    currentStep = 1;
    selectedApplicationType = null;
    formData = new FormData();
    uploadedFiles = {};
    
    // Reset form fields
    if (applicationForm) applicationForm.reset();
    
    // Reset progress
    updateProgress();
    
    // Show first step
    document.querySelectorAll('.form-step').forEach(step => step.classList.remove('active'));
    const firstStep = document.getElementById('step1');
    if (firstStep) firstStep.classList.add('active');
  }
  
  // Step navigation
  const nextStepButtons = document.querySelectorAll('.next-step-btn');
  const prevStepButtons = document.querySelectorAll('.prev-step-btn');
  
  nextStepButtons.forEach(button => {
    button.addEventListener('click', function() {
      if (validateCurrentStep()) {
        nextStep();
      }
    });
  });
  
  prevStepButtons.forEach(button => {
    button.addEventListener('click', function() {
      prevStep();
    });
  });
  
  function nextStep() {
    if (currentStep < 4) {
      // Hide current step
      const currentStepElement = document.getElementById(`step${currentStep}`);
      if (currentStepElement) currentStepElement.classList.remove('active');
      
      // Update progress
      currentStep++;
      updateProgress();
      
      // Show next step
      const nextStepElement = document.getElementById(`step${currentStep}`);
      if (nextStepElement) nextStepElement.classList.add('active');
      
      // Special handling for review step
      if (currentStep === 4) {
        populateReviewSection();
      }
      
      // Scroll to top
      const dashboardContent = document.querySelector('.dashboard-content');
      if (dashboardContent) dashboardContent.scrollTop = 0;
    }
  }
  
  function prevStep() {
    if (currentStep > 1) {
      // Hide current step
      const currentStepElement = document.getElementById(`step${currentStep}`);
      if (currentStepElement) currentStepElement.classList.remove('active');
      
      // Update progress
      currentStep--;
      updateProgress();
      
      // Show previous step
      const prevStepElement = document.getElementById(`step${currentStep}`);
      if (prevStepElement) prevStepElement.classList.add('active');
      
      // Scroll to top
      const dashboardContent = document.querySelector('.dashboard-content');
      if (dashboardContent) dashboardContent.scrollTop = 0;
    }
  }
  
  function updateProgress() {
    const progressSteps = document.querySelectorAll('.progress-step');
    const progressFill = document.getElementById('progressFill');
    
    // Update step indicators
    progressSteps.forEach((step, index) => {
      const stepNumber = index + 1;
      
      if (stepNumber < currentStep) {
        step.classList.add('completed');
        step.classList.remove('active');
      } else if (stepNumber === currentStep) {
        step.classList.add('active');
        step.classList.remove('completed');
      } else {
        step.classList.remove('active', 'completed');
      }
    });
    
    // Update progress bar
    if (progressFill) {
      const progressPercentage = ((currentStep - 1) / 3) * 100;
      progressFill.style.width = `${progressPercentage}%`;
    }
  }
  
  // Form validation
  function validateCurrentStep() {
    const currentStepElement = document.getElementById(`step${currentStep}`);
    if (!currentStepElement) return false;
    
    const requiredFields = currentStepElement.querySelectorAll('[required]');
    let isValid = true;
    
    // Clear previous errors
    currentStepElement.querySelectorAll('.form-group, .document-upload-item, .terms-agreement').forEach(group => {
      group.classList.remove('error');
      const errorElement = group.querySelector('.field-error');
      if (errorElement) errorElement.style.display = 'none';
    });
    
    // Validate required fields
    requiredFields.forEach(field => {
      if (!field.value || !field.value.trim()) {
        showFieldError(field, 'This field is required');
        isValid = false;
      } else {
        // Additional validation based on field type
        if (field.type === 'email' && !validateEmail(field.value)) {
          showFieldError(field, 'Please enter a valid email address');
          isValid = false;
        } else if (field.type === 'tel' && !validatePhone(field.value)) {
          showFieldError(field, 'Please enter a valid phone number');
          isValid = false;
        } else if (field.name === 'vehicleYear') {
          const year = parseInt(field.value);
          const currentYear = new Date().getFullYear();
          if (year < 1900 || year > currentYear + 1) {
            showFieldError(field, 'Please enter a valid year');
            isValid = false;
          }
        }
      }
    });
    
    // Step-specific validation
    if (currentStep === 2) {
      // Validate file uploads
      const requiredUploads = ['proofOwnership', 'validId', 'insurance'];
      requiredUploads.forEach(uploadId => {
        const fileInput = document.getElementById(uploadId);
        if (fileInput && !fileInput.files.length && !uploadedFiles[uploadId]) {
          showFieldError(fileInput, 'Please upload this required document');
          isValid = false;
        }
      });
    } else if (currentStep === 4) {
      // Validate terms agreement
      const agreeTerms = document.getElementById('agreeTerms');
      if (agreeTerms && !agreeTerms.checked) {
        showFieldError(agreeTerms, 'You must agree to the terms and conditions');
        isValid = false;
      }
    }
    
    return isValid;
  }
  
  function showFieldError(field, message) {
    const formGroup = field.closest('.form-group') || 
                     field.closest('.document-upload-item') || 
                     field.closest('.terms-agreement');
    
    if (formGroup) {
      formGroup.classList.add('error');
      const errorElement = formGroup.querySelector('.field-error');
      if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
      }
    }
  }
  
  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }
  
  function validatePhone(phone) {
    const re = /^(\+234|0)[0-9]{10}$/;
    return re.test(phone.replace(/\s/g, ''));
  }
  
  // File upload handling
  const fileInputs = document.querySelectorAll('input[type="file"]');
  fileInputs.forEach(input => {
    input.addEventListener('change', handleFileUpload);
    
    // Drag and drop functionality
    const uploadArea = input.closest('.upload-area');
    if (uploadArea) {
      uploadArea.addEventListener('dragover', handleDragOver);
      uploadArea.addEventListener('dragleave', handleDragLeave);
      uploadArea.addEventListener('drop', handleFileDrop);
    }
  });
  
  function validateFile(file) {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    
    if (file.size > maxSize) {
      showNotification('File size must be less than 5MB', 'error');
      return false;
    }
    
    if (!allowedTypes.includes(file.type)) {
      showNotification('Only PDF, JPG, and PNG files are allowed', 'error');
      return false;
    }
    
    return true;
  }
  
  function showFilePreview(previewContainer, files) {
    previewContainer.innerHTML = '';
    
    files.forEach((file, index) => {
      const filePreview = document.createElement('div');
      filePreview.className = 'file-preview';
      filePreview.innerHTML = `
        <i class="fas fa-file-${getFileIcon(file.type)}"></i>
        <span>${file.name}</span>
        <i class="fas fa-times remove-file" data-index="${index}"></i>
      `;
      
      // Add remove functionality
      const removeBtn = filePreview.querySelector('.remove-file');
      removeBtn.addEventListener('click', function() {
        removeFile(previewContainer, index);
      });
      
      previewContainer.appendChild(filePreview);
    });
  }
  
  function getFileIcon(fileType) {
    if (fileType === 'application/pdf') return 'pdf';
    if (fileType.startsWith('image/')) return 'image';
    return 'alt';
  }
  
  function removeFile(previewContainer, index) {
    const filePreview = previewContainer.children[index];
    if (filePreview) {
      filePreview.remove();
      
      // Update stored files
      const inputId = previewContainer.closest('.upload-area').querySelector('input').id;
      if (uploadedFiles[inputId]) {
        uploadedFiles[inputId].splice(index, 1);
        
        if (uploadedFiles[inputId].length === 0) {
          delete uploadedFiles[inputId];
          
          // Reset upload area
          const uploadArea = previewContainer.closest('.upload-area');
          const uploadContent = uploadArea.querySelector('.upload-content');
          if (uploadContent) uploadContent.style.display = 'block';
          previewContainer.style.display = 'none';
          
          const status = document.getElementById(inputId + 'Status');
          if (status) {
            status.textContent = 'Required';
            status.className = 'upload-status';
          }
        }
      }
    }
  }
  
  function handleDragOver(event) {
    event.preventDefault();
    event.currentTarget.classList.add('dragover');
  }
  
  function handleDragLeave(event) {
    event.preventDefault();
    event.currentTarget.classList.remove('dragover');
  }
  
  function handleFileDrop(event) {
    event.preventDefault();
    event.currentTarget.classList.remove('dragover');
    
    const files = event.dataTransfer.files;
    const input = event.currentTarget.querySelector('input[type="file"]');
    
    if (input) {
      // Create a new FileList and assign to input
      const dataTransfer = new DataTransfer();
      for (let file of files) {
        dataTransfer.items.add(file);
      }
      input.files = dataTransfer.files;
      
      // Trigger change event
      input.dispatchEvent(new Event('change'));
    }
  }
  
  function handleFileUpload(event) {
    const input = event.target;
    const files = input.files;
    
    if (files.length > 0) {
      const uploadArea = input.closest('.upload-area');
      const preview = uploadArea ? uploadArea.querySelector('.upload-preview') : null;
      const status = document.getElementById(input.id + 'Status');
      
      // Validate file size and type
      let validFiles = [];
      for (let file of files) {
        if (validateFile(file)) {
          validFiles.push(file);
        }
      }
      
      if (validFiles.length > 0) {
        // Store files
        uploadedFiles[input.id] = validFiles;
        
        // Update UI
        if (preview) {
          showFilePreview(preview, validFiles);
          const uploadContent = uploadArea.querySelector('.upload-content');
          if (uploadContent) uploadContent.style.display = 'none';
          preview.style.display = 'flex';
        }
        
        if (status) {
          status.textContent = 'Uploaded';
          status.className = 'upload-status completed';
        }
      }
    }
  }
  
  // Review section population
  function populateReviewSection() {
    populateVehicleReview();
    populateOwnerReview();
    populateDocumentsReview();
    populatePaymentReview();
  }
  
  function populateVehicleReview() {
    const vehicleReview = document.getElementById('vehicleReview');
    if (!vehicleReview) return;
    
    const vehicleData = {
      'Make': getFieldValue('vehicleMake'),
      'Model': getFieldValue('vehicleModel'),
      'Year': getFieldValue('vehicleYear'),
      'Color': getFieldValue('vehicleColor'),
      'Engine Number': getFieldValue('engineNumber'),
      'Chassis Number': getFieldValue('chassisNumber'),
      'Registration Number': getFieldValue('registrationNumber')
    };
    
    populateReviewContent(vehicleReview, vehicleData);
  }
  
  function populateOwnerReview() {
    const ownerReview = document.getElementById('ownerReview');
    if (!ownerReview) return;
    
    const ownerData = {
      'Full Name': getFieldValue('ownerName'),
      'Email': getFieldValue('ownerEmail'),
      'Phone': getFieldValue('ownerPhone'),
      'Address': getFieldValue('ownerAddress'),
      'State': getFieldValue('ownerState'),
      'LGA': getFieldValue('ownerLga')
    };
    
    populateReviewContent(ownerReview, ownerData);
  }
  
  function populateDocumentsReview() {
    const documentsReview = document.getElementById('documentsReview');
    if (!documentsReview) return;
    
    const documentsList = documentsReview.querySelector('.documents-list');
    if (!documentsList) return;
    
    documentsList.innerHTML = '';
    
    const documentTypes = {
      'proofOwnership': 'Proof of Ownership',
      'validId': 'Valid ID',
      'insurance': 'Insurance Certificate',
      'roadworthiness': 'Roadworthiness Certificate',
      'customsPapers': 'Customs Papers'
    };
    
    Object.keys(documentTypes).forEach(docId => {
      if (uploadedFiles[docId] && uploadedFiles[docId].length > 0) {
        const docItem = document.createElement('div');
        docItem.className = 'document-item';
        docItem.innerHTML = `
          <i class="fas fa-file-check"></i>
          <span>${documentTypes[docId]}</span>
        `;
        documentsList.appendChild(docItem);
      }
    });
  }
  
  function populatePaymentReview() {
    const paymentReview = document.getElementById('paymentReview');
    if (!paymentReview) return;
    
    const paymentData = {
      'Payment Method': getSelectedPaymentMethod(),
      'Processing Fee': '₦5,000',
      'Service Fee': '₦2,500',
      'Total Amount': '₦7,500'
    };
    
    populateReviewContent(paymentReview, paymentData);
  }
  
  function getFieldValue(fieldId) {
    const field = document.getElementById(fieldId);
    return field ? field.value || 'Not provided' : 'Not provided';
  }
  
  function getSelectedPaymentMethod() {
    const selectedPayment = document.querySelector('input[name="paymentMethod"]:checked');
    if (selectedPayment) {
      const label = selectedPayment.closest('.payment-option').querySelector('span');
      return label ? label.textContent : 'Not selected';
    }
    return 'Not selected';
  }
  
  function populateReviewContent(container, data) {
    const reviewContent = container.querySelector('.review-content');
    if (!reviewContent) return;
    
    reviewContent.innerHTML = '';
    
    Object.entries(data).forEach(([label, value]) => {
      if (value && value !== 'Not provided') {
        const reviewItem = document.createElement('div');
        reviewItem.className = 'review-item';
        reviewItem.innerHTML = `
          <span class="review-label">${label}:</span>
          <span class="review-value">${value}</span>
        `;
        reviewContent.appendChild(reviewItem);
      }
    });
  }
  
  // Edit section buttons
  const editSectionButtons = document.querySelectorAll('.edit-section-btn');
  editSectionButtons.forEach(button => {
    button.addEventListener('click', function() {
      const targetStep = parseInt(this.dataset.step);
      if (targetStep && targetStep !== currentStep) {
        // Hide current step
        document.getElementById(`step${currentStep}`).classList.remove('active');
        
        // Update progress
        currentStep = targetStep;
        updateProgress();
        
        // Show target step
        document.getElementById(`step${currentStep}`).classList.add('active');
        
        // Scroll to top
        const dashboardContent = document.querySelector('.dashboard-content');
        if (dashboardContent) dashboardContent.scrollTop = 0;
      }
    });
  });
  
  // Submit application
  const submitBtn = document.getElementById('submitApplicationBtn');
  if (submitBtn) {
    submitBtn.addEventListener('click', function() {
      if (validateCurrentStep()) {
        submitApplication();
      }
    });
  }
  
  function submitApplication() {
    const submitBtn = document.getElementById('submitApplicationBtn');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.classList.add('loading');
      submitBtn.textContent = 'Submitting...';
    }
    
    // Simulate API call
    setTimeout(() => {
      // Generate application reference
      const reference = generateApplicationReference();
      
      // Show success modal
      showSuccessModal(reference);
      
      // Reset button
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.classList.remove('loading');
        submitBtn.textContent = 'Submit Application';
      }
    }, 2000);
  }
  
  function generateApplicationReference() {
    const prefix = selectedApplicationType ? selectedApplicationType.toUpperCase().substring(0, 3) : 'APP';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  }
  
  function showSuccessModal(reference) {
    if (successModal) {
      successModal.classList.add('active');
      document.body.style.overflow = 'hidden';
      
      if (applicationReference) {
        applicationReference.textContent = reference;
      }
    }
  }
  
  // Success modal actions
  const viewApplicationBtn = document.getElementById('viewApplicationBtn');
  const newApplicationBtn = document.getElementById('newApplicationBtn');
  const closeModalBtn = document.getElementById('closeModalBtn');
  
  if (viewApplicationBtn) {
    viewApplicationBtn.addEventListener('click', function() {
      window.location.href = 'applications.html';
    });
  }
  
  if (newApplicationBtn) {
    newApplicationBtn.addEventListener('click', function() {
      closeSuccessModal();
      resetForm();
      if (applicationFormSection) applicationFormSection.style.display = 'none';
      if (applicationTypeSection) applicationTypeSection.style.display = 'block';
    });
  }
  
  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeSuccessModal);
  }
  
  // Close modal when clicking outside
  if (successModal) {
    successModal.addEventListener('click', function(event) {
      if (event.target === successModal) {
        closeSuccessModal();
      }
    });
  }
  
  function closeSuccessModal() {
    if (successModal) {
      successModal.classList.remove('active');
      document.body.style.overflow = '';
    }
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
          max-width: 350px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .notification.success { background-color: #10b981; }
        .notification.error { background-color: #ef4444; }
        .notification.warning { background-color: #f59e0b; }
        .notification.info { background-color: #3b82f6; }
        .notification.show { transform: translateX(0); }
        .notification-content { 
          display: flex; 
          justify-content: space-between; 
          align-items: center; 
          gap: 12px;
        }
        .notification-close { 
          background: none; 
          border: none; 
          color: white; 
          font-size: 18px; 
          cursor: pointer; 
          padding: 0;
          line-height: 1;
          opacity: 0.8;
        }
        .notification-close:hover { opacity: 1; }
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
  updateProgress();
  
  console.log('New Application page initialized successfully');
});

// Add this function after the existing validation functions

function validatePasswordMatch(password, confirmPassword) {
  return password === confirmPassword;
}

// Add this function to initialize social login buttons
function initializeSocialButtons() {
  const socialButtons = document.querySelectorAll('.social-button');
  
  socialButtons.forEach(button => {
    button.addEventListener('click', async function(e) {
      e.preventDefault();
      
      const provider = this.classList.contains('google') ? 'google' : 'facebook';
      const isRegisterForm = this.closest('#registerForm') !== null;
      const action = isRegisterForm ? 'register' : 'login';
      
      try {
        // Disable button and show loading
        this.disabled = true;
        const originalText = this.innerHTML;
        this.innerHTML = `<i class="fas fa-spinner fa-spin"></i> <span>Connecting...</span>`;
        
        // Check if propamitAPI exists and has socialLogin method
        if (typeof propamitAPI !== 'undefined' && propamitAPI.socialLogin) {
          const response = await propamitAPI.socialLogin(provider, action);
          
          if (response.success) {
            showNotification(`${action === 'login' ? 'Login' : 'Registration'} successful! Redirecting...`, 'success');
            
            setTimeout(() => {
              window.location.href = 'dashboard.html';
            }, 1500);
          }
        } else {
          throw new Error('Social login not available');
        }
      } catch (error) {
        console.error(`${provider} ${action} error:`, error);
        showNotification(error.message || `${provider} ${action} failed`, 'error');
      } finally {
        // Re-enable button
        this.disabled = false;
        const icon = provider === 'google' ? 'fab fa-google' : 'fab fa-facebook-f';
        const text = provider.charAt(0).toUpperCase() + provider.slice(1);
        this.innerHTML = `<i class="${icon}"></i> <span>${text}</span>`;
      }
    });
  });
}

// Add this function to handle real-time form validation
function setupRealTimeValidation() {
  const formInputs = document.querySelectorAll('input, select, textarea');
  
  formInputs.forEach(input => {
    input.addEventListener('blur', function() {
      validateSingleField(this);
    });
    
    input.addEventListener('input', function() {
      // Clear error state when user starts typing
      const formGroup = this.closest('.form-group');
      if (formGroup && formGroup.classList.contains('error')) {
        formGroup.classList.remove('error');
        const errorElement = formGroup.querySelector('.field-error');
        if (errorElement) errorElement.style.display = 'none';
      }
    });
  });
}

function validateSingleField(field) {
  if (!field.required && !field.value.trim()) return true;
  
  let isValid = true;
  let errorMessage = '';
  
  if (field.required && !field.value.trim()) {
    isValid = false;
    errorMessage = 'This field is required';
  } else if (field.type === 'email' && field.value && !validateEmail(field.value)) {
    isValid = false;
    errorMessage = 'Please enter a valid email address';
  } else if (field.type === 'tel' && field.value && !validatePhone(field.value)) {
    isValid = false;
    errorMessage = 'Please enter a valid phone number';
  } else if (field.name === 'vehicleYear' && field.value) {
    const year = parseInt(field.value);
    const currentYear = new Date().getFullYear();
    if (year < 1900 || year > currentYear + 1) {
      isValid = false;
      errorMessage = 'Please enter a valid year';
    }
  } else if (field.name === 'confirmPassword' && field.value) {
    const passwordField = document.getElementById('registerPassword');
    if (passwordField && !validatePasswordMatch(passwordField.value, field.value)) {
      isValid = false;
      errorMessage = 'Passwords do not match';
    }
  }
  
  if (!isValid) {
    showFieldError(field, errorMessage);
  }
  
  return isValid;
}

// Add this function to handle auto-save functionality
function setupAutoSave() {
  const formInputs = document.querySelectorAll('input, select, textarea');
  
  formInputs.forEach(input => {
    input.addEventListener('change', function() {
      saveFormData();
    });
  });
}

function saveFormData() {
  const formData = {};
  const formInputs = document.querySelectorAll('input, select, textarea');
  
  formInputs.forEach(input => {
    if (input.type === 'checkbox') {
      formData[input.id] = input.checked;
    } else if (input.type === 'radio') {
      if (input.checked) {
        formData[input.name] = input.value;
      }
    } else {
      formData[input.id] = input.value;
    }
  });
  
  localStorage.setItem('applicationFormData', JSON.stringify(formData));
}

function loadFormData() {
  const savedData = localStorage.getItem('applicationFormData');
  if (savedData) {
    try {
      const formData = JSON.parse(savedData);
      
      Object.keys(formData).forEach(key => {
        const input = document.getElementById(key);
        if (input) {
          if (input.type === 'checkbox') {
            input.checked = formData[key];
          } else if (input.type === 'radio') {
            if (input.value === formData[key]) {
              input.checked = true;
            }
          } else {
            input.value = formData[key];
          }
        }
      });
    } catch (error) {
      console.error('Error loading saved form data:', error);
    }
  }
}

function clearSavedFormData() {
  localStorage.removeItem('applicationFormData');
}

// Add this to the DOMContentLoaded event listener, after the existing initialization
// setupRealTimeValidation();
// setupAutoSave();
// loadFormData();

// Add this function to handle form submission with better error handling
async function submitApplicationWithAPI() {
  const submitBtn = document.getElementById('submitApplicationBtn');
  
  try {
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.classList.add('loading');
      submitBtn.textContent = 'Submitting...';
    }
    
    // Collect all form data
    const applicationData = collectFormData();
    
    // Here you would make the actual API call
    // const response = await fetch('/api/applications', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${localStorage.getItem('token')}`
    //   },
    //   body: JSON.stringify(applicationData)
    // });
    
    // For now, simulate the API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate application reference
    const reference = generateApplicationReference();
    
    // Clear saved form data on successful submission
    clearSavedFormData();
    
    // Show success modal
    showSuccessModal(reference);
    
    showNotification('Application submitted successfully!', 'success');
    
  } catch (error) {
    console.error('Application submission error:', error);
    showNotification('Failed to submit application. Please try again.', 'error');
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.classList.remove('loading');
      submitBtn.textContent = 'Submit Application';
    }
  }
}

function collectFormData() {
  const data = {
    applicationType: selectedApplicationType,
    vehicleInfo: {
      make: getFieldValue('vehicleMake'),
      model: getFieldValue('vehicleModel'),
      year: getFieldValue('vehicleYear'),
      color: getFieldValue('vehicleColor'),
      engineNumber: getFieldValue('engineNumber'),
      chassisNumber: getFieldValue('chassisNumber'),
      registrationNumber: getFieldValue('registrationNumber')
    },
    ownerInfo: {
      name: getFieldValue('ownerName'),
      email: getFieldValue('ownerEmail'),
      phone: getFieldValue('ownerPhone'),
      address: getFieldValue('ownerAddress'),
      state: getFieldValue('ownerState'),
      lga: getFieldValue('ownerLga')
    },
    documents: uploadedFiles,
    paymentMethod: getSelectedPaymentMethod(),
    submittedAt: new Date().toISOString()
  };
  
  return data;
}

// Add keyboard shortcuts for better UX
document.addEventListener('keydown', function(event) {
  // Ctrl/Cmd + Enter to proceed to next step
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
    event.preventDefault();
    const nextBtn = document.querySelector('.next-step-btn:not([style*="display: none"])');
    if (nextBtn && !nextBtn.disabled) {
      nextBtn.click();
    }
  }
  
  // Escape to close modals
  if (event.key === 'Escape') {
    const activeModal = document.querySelector('.modal.active');
    if (activeModal) {
      closeSuccessModal();
    }
  }
});