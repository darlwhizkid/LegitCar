// Profile Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
  console.log('Page loaded');
  
  // Consistent authentication check - using the same keys as login.js
  const token = localStorage.getItem('userToken');
  const userEmail = localStorage.getItem('userEmail');
  const userName = localStorage.getItem('userName');
  
  // Only proceed if token exists
  if (!token) {
    // Clear any partial auth data
    localStorage.removeItem('userToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('isAuthenticated');
    
    // Redirect to login page
    window.location.href = 'login.html';
    return;
  }
  
  // Create user data object
  const userData = {
    name: userName || 'User',
    email: userEmail || ''
  };
  
  // Update user info in header
  const userNameElement = document.getElementById('userName');
  const userEmailElement = document.getElementById('userEmail');
  
  if (userNameElement && userData.name) {
    userNameElement.textContent = userData.name;
  }
  
  if (userEmailElement && userData.email) {
    userEmailElement.textContent = userData.email;
  }
  
  // User menu toggle
  const userMenuToggle = document.getElementById('userMenuToggle');
  const userDropdown = document.getElementById('userDropdown');
  
  if (userMenuToggle && userDropdown) {
    userMenuToggle.addEventListener('click', function() {
      userDropdown.classList.toggle('active');
    });
    
    // Close dropdown when clicking outside
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
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
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
  
  // Sidebar toggle functionality
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
  
  // Profile form functionality
  const profileForm = document.getElementById('profileForm');
  const profilePictureInput = document.getElementById('profilePicture');
  const profilePicturePreview = document.getElementById('profilePicturePreview');
  
  // Load existing profile data
  loadProfileData();
  
  // Profile picture upload
  if (profilePictureInput && profilePicturePreview) {
    profilePictureInput.addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (file) {
        // Validate file size (2MB max)
        if (file.size > 2 * 1024 * 1024) {
          showNotification('File size must be less than 2MB', 'error');
          return;
        }
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
          showNotification('Please select a valid image file', 'error');
          return;
        }
        
        // Preview the image
        const reader = new FileReader();
        reader.onload = function(e) {
          profilePicturePreview.src = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    });
  }
  
  // Form submission
  if (profileForm) {
    profileForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Validate required fields
      const requiredFields = [
        'profileName',
        'profileEmail',
        'profilePhone',
        'profileAddress',
        'nokName',
        'nokRelationship',
        'nokPhone',
        'nokAddress'
      ];
      
      let isValid = true;
      
      requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field && !field.value.trim()) {
          showFieldError(field, 'This field is required');
          isValid = false;
        } else if (field) {
          clearFieldError(field);
        }
      });
      
      // Validate email format
      const emailField = document.getElementById('profileEmail');
      if (emailField && emailField.value && !isValidEmail(emailField.value)) {
        showFieldError(emailField, 'Please enter a valid email address');
        isValid = false;
      }
      
      // Validate phone format
      const phoneField = document.getElementById('profilePhone');
      if (phoneField && phoneField.value && !isValidPhone(phoneField.value)) {
        showFieldError(phoneField, 'Please enter a valid phone number');
        isValid = false;
      }
      
      const nokPhoneField = document.getElementById('nokPhone');
      if (nokPhoneField && nokPhoneField.value && !isValidPhone(nokPhoneField.value)) {
        showFieldError(nokPhoneField, 'Please enter a valid phone number');
        isValid = false;
      }
      
      if (isValid) {
        saveProfile();
      }
    });
  }
  
  function loadProfileData() {
    // Load profile data from localStorage or API
    const profileData = JSON.parse(localStorage.getItem('profileData') || '{}');
    
    // Populate form fields
    const fields = [
      'profileName', 'profileEmail', 'profilePhone', 'profileDob',
      'profileAddress', 'profileCity', 'profileState', 'profileGender',
      'profileNin', 'nokName', 'nokRelationship', 'nokPhone',
      'nokEmail', 'nokAddress', 'profileOccupation', 'profileBio'
    ];
    
    fields.forEach(fieldId => {
      const field = document.getElementById(fieldId);
      const dataKey = fieldId.replace('profile', '').replace('nok', 'nextOfKin').toLowerCase();
      
      if (field && profileData[dataKey]) {
        field.value = profileData[dataKey];
      }
    });
    
    // Load profile picture if exists
    if (profileData.profilePicture && profilePicturePreview) {
      profilePicturePreview.src = profileData.profilePicture;
    }
    
    // If no profile data exists, populate with user data from registration
    if (Object.keys(profileData).length === 0 && userData) {
      if (userData.name) document.getElementById('profileName').value = userData.name;
      if (userData.email) document.getElementById('profileEmail').value = userData.email;
      if (userData.phone) document.getElementById('profilePhone').value = userData.phone;
    }
  }
  
  function saveProfile() {
    // Show loading state
    const submitBtn = profileForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
    submitBtn.disabled = true;
    
    // Collect form data
    const formData = new FormData(profileForm);
    const profileData = {};
    
    for (let [key, value] of formData.entries()) {
      profileData[key] = value;
    }
    
    // Handle profile picture
    if (profilePicturePreview.src && !profilePicturePreview.src.includes('default-avatar')) {
      profileData.profilePicture = profilePicturePreview.src;
    }
    
    // Simulate API call
    setTimeout(() => {
      try {
        // Save to localStorage (in real app, this would be an API call)
        localStorage.setItem('profileData', JSON.stringify(profileData));
        
        // Update current user data
        const updatedUserData = {
          ...userData,
          name: profileData.name,
          email: profileData.email,
          phone: profileData.phone
        };
        localStorage.setItem('currentUser', JSON.stringify(updatedUserData));
        
        // Update header display
        if (userName) userName.textContent = profileData.name;
        if (userEmail) userEmail.textContent = profileData.email;
        
        showNotification('Profile saved successfully!', 'success');
        
      } catch (error) {
        console.error('Error saving profile:', error);
        showNotification('Error saving profile. Please try again.', 'error');
      } finally {
        // Reset button state
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
      }
    }, 1500);
  }
  
  function showFieldError(field, message) {
    // Remove existing error
    clearFieldError(field);
    
    // Add error class
    field.classList.add('error');
    
    // Create error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    errorDiv.style.cssText = 'color: #ef4444; font-size: 12px; margin-top: 4px;';
    
    // Insert after field
    field.parentNode.insertBefore(errorDiv, field.nextSibling);
  }
  
  function clearFieldError(field) {
    field.classList.remove('error');
    const errorDiv = field.parentNode.querySelector('.field-error');
    if (errorDiv) {
      errorDiv.remove();
    }
  }
  
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  function isValidPhone(phone) {
    const phoneRegex = /^(\+234|0)[0-9]{10}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }
  
  function showNotification(message, type = 'success') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notif => notif.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <div class="notification-icon">
          <i class="fas ${type === 'success' ? 'fa-check' : 'fa-exclamation-triangle'}"></i>
        </div>
        <div class="notification-text">${message}</div>
        <button class="notification-close">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `;
    
    // Add styles if they don't exist
    if (!document.querySelector('#notification-styles')) {
      const styles = document.createElement('style');
      styles.id = 'notification-styles';
      styles.textContent = `
        .notification {
          position: fixed;
          top: 24px;
          right: 24px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          padding: 16px;
          z-index: 1100;
          transform: translateX(400px);
          transition: all 0.3s ease;
          max-width: 350px;
          min-width: 300px;
        }
        .notification.show { transform: translateX(0); }
        .notification.success { border-left: 4px solid #10b981; }
        .notification.error { border-left: 4px solid #ef4444; }
        .notification-content { display: flex; align-items: flex-start; gap: 12px; }
        .notification-icon { 
          width: 24px; height: 24px; border-radius: 50%; 
          display: flex; align-items: center; justify-content: center; 
          font-size: 12px; flex-shrink: 0; 
        }
        .notification.success .notification-icon { background: #d1fae5; color: #10b981; }
        .notification.error .notification-icon { background: #fee2e2; color: #ef4444; }
        .notification-text { 
          flex: 1; font-size: 14px; color: #334155; 
          font-weight: 500; line-height: 1.4; 
        }
        .notification-close { 
          background: none; border: none; color: #94a3b8; 
          cursor: pointer; padding: 4px; border-radius: 6px; 
          transition: all 0.2s ease; display: flex; 
          align-items: center; justify-content: center; 
          width: 24px; height: 24px; 
        }
        .notification-close:hover { color: #64748b; background: #f1f5f9; }
        .form-input.error { border-color: #ef4444; }
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
});
