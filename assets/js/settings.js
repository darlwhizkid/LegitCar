// Settings Page JavaScript - Propamit
document.addEventListener('DOMContentLoaded', function() {
  console.log('Settings page loading...');
  
  // Authentication check using consistent token key
  const token = localStorage.getItem('userToken');
  const userEmail = localStorage.getItem('userEmail');
  const userName = localStorage.getItem('userName');
  
  if (!token) {
    console.log('No token found, redirecting to login');
    window.location.href = 'login.html';
    return;
  }
  
  // Initialize page
  initializePage();
  initializeTabSystem();
  initializeFormHandlers();
  initializeToggleSwitches();
  initializePasswordToggles();
  initializeModals();
  initializeUserInterface();
  loadUserData();
  
  console.log('Settings page loaded successfully');
  
  // ===== PAGE INITIALIZATION =====
  function initializePage() {
    // Set current year
    const currentYearElement = document.getElementById('currentYear');
    if (currentYearElement) {
      currentYearElement.textContent = new Date().getFullYear();
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
  }
  
  // ===== TAB SYSTEM =====
  function initializeTabSystem() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
      button.addEventListener('click', function() {
        const targetTab = this.getAttribute('data-tab');
        
        // Remove active class from all tabs and contents
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        
        // Add active class to clicked tab and corresponding content
        this.classList.add('active');
        const targetContent = document.getElementById(targetTab);
        if (targetContent) {
          targetContent.classList.add('active');
        }
        
        // Update URL hash without scrolling
        history.replaceState(null, null, `#${targetTab}`);
      });
    });
    
    // Handle initial tab from URL hash
    const hash = window.location.hash.substring(1);
    if (hash && document.getElementById(hash)) {
      const targetButton = document.querySelector(`[data-tab="${hash}"]`);
      if (targetButton) {
        targetButton.click();
      }
    }
  }
  
  // ===== FORM HANDLERS =====
  function initializeFormHandlers() {
    const forms = document.querySelectorAll('.settings-form');
    let hasUnsavedChanges = false;
    
    forms.forEach(form => {
      const inputs = form.querySelectorAll('input, select, textarea');
      
      inputs.forEach(input => {
        input.addEventListener('input', function() {
          hasUnsavedChanges = true;
          updateSaveButton();
          validateField(this);
        });
        
        input.addEventListener('blur', function() {
          validateField(this);
        });
      });
    });
    
    // Save changes button
    const saveBtn = document.getElementById('saveChangesBtn');
    if (saveBtn) {
      saveBtn.addEventListener('click', function() {
        if (validateAllForms()) {
          saveSettings();
        }
      });
    }
    
    // Cancel changes button
    const cancelBtn = document.getElementById('cancelBtn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', function() {
        if (hasUnsavedChanges) {
          showModal('Discard Changes', 'Are you sure you want to discard all unsaved changes?', function() {
            loadUserData();
            hasUnsavedChanges = false;
            updateSaveButton();
          });
        }
      });
    }
    
    function updateSaveButton() {
      if (saveBtn) {
        saveBtn.disabled = !hasUnsavedChanges;
        if (hasUnsavedChanges) {
          saveBtn.classList.add('has-changes');
          if (cancelBtn) cancelBtn.style.display = 'inline-flex';
        } else {
          saveBtn.classList.remove('has-changes');
          if (cancelBtn) cancelBtn.style.display = 'none';
        }
      }
    }
    
    // Warn before leaving page with unsaved changes
    window.addEventListener('beforeunload', function(e) {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    });
  }
  
  // ===== TOGGLE SWITCHES =====
  function initializeToggleSwitches() {
    const toggles = document.querySelectorAll('.toggle-switch input');
    
    toggles.forEach(toggle => {
      toggle.addEventListener('change', function() {
        const settingName = this.id;
        const isEnabled = this.checked;
        
        console.log(`Setting ${settingName} changed to:`, isEnabled);
        
        // Save setting immediately for toggles
        saveToggleSetting(settingName, isEnabled);
        
        // Show feedback
        showNotification(`${getSettingDisplayName(settingName)} ${isEnabled ? 'enabled' : 'disabled'}`, 'success');
      });
    });
  }
  
  // ===== PASSWORD TOGGLES =====
  function initializePasswordToggles() {
    const passwordToggles = document.querySelectorAll('.password-toggle');
    
    passwordToggles.forEach(toggle => {
      toggle.addEventListener('click', function(e) {
        e.preventDefault();
        
        const passwordInput = this.parentElement.querySelector('input[type="password"], input[type="text"]');
        const icon = this.querySelector('i');
        
        if (passwordInput) {
          if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
          } else {
            passwordInput.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
          }
        }
      });
    });
  }
  
  // ===== MODAL SYSTEM =====
  function initializeModals() {
    const modalOverlay = document.getElementById('modalOverlay');
    const modalClose = document.getElementById('modalClose');
    const cancelAction = document.getElementById('cancelAction');
    
    if (modalClose) {
      modalClose.addEventListener('click', closeModal);
    }
    
    if (cancelAction) {
      cancelAction.addEventListener('click', closeModal);
    }
    
    if (modalOverlay) {
      modalOverlay.addEventListener('click', function(e) {
        if (e.target === modalOverlay) {
          closeModal();
        }
      });
    }
    
    // Escape key to close modal
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && modalOverlay && modalOverlay.classList.contains('active')) {
        closeModal();
      }
    });
  }
  
  // ===== USER INTERFACE =====
  function initializeUserInterface() {
    // Sidebar toggle
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    const mobileOverlay = document.getElementById('mobileOverlay');
    
    if (sidebarToggle && sidebar) {
      sidebarToggle.addEventListener('click', function() {
        sidebar.classList.toggle('active');
        if (mobileOverlay) {
          mobileOverlay.classList.toggle('active');
        }
      });
    }
    
    // Close sidebar on mobile overlay click
    if (mobileOverlay) {
      mobileOverlay.addEventListener('click', function() {
        if (sidebar) sidebar.classList.remove('active');
        mobileOverlay.classList.remove('active');
      });
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
    const logoutButtons = document.querySelectorAll('#logoutBtn, #headerLogoutBtn');
    logoutButtons.forEach(button => {
      button.addEventListener('click', function(e) {
        e.preventDefault();
        showModal('Confirm Logout', 'Are you sure you want to log out?', function() {
          localStorage.clear();
          window.location.href = 'index.html';
        });
      });
    });
    
    // Special action buttons
    initializeActionButtons();
  }
  
  // ===== ACTION BUTTONS =====
  function initializeActionButtons() {
    // Change password button
    const changePasswordBtn = document.getElementById('changePasswordBtn');
    if (changePasswordBtn) {
      changePasswordBtn.addEventListener('click', function() {
        handlePasswordChange();
      });
    }
    
    // Download data button
    const downloadDataBtn = document.getElementById('downloadDataBtn');
    if (downloadDataBtn) {
      downloadDataBtn.addEventListener('click', function() {
        showModal('Download Data', 'Your data download will be prepared and sent to your email address. This may take a few minutes.', function() {
          showNotification('Data download request submitted. You will receive an email shortly.', 'success');
        });
      });
    }
    
    // Delete account button
    const deleteAccountBtn = document.getElementById('deleteAccountBtn');
    if (deleteAccountBtn) {
      deleteAccountBtn.addEventListener('click', function() {
        showModal('Delete Account', 'This action cannot be undone. All your data will be permanently deleted. Are you absolutely sure?', function() {
          showModal('Final Confirmation', 'Type "DELETE" to confirm account deletion:', function() {
            showNotification('Account deletion request submitted. You will receive a confirmation email.', 'warning');
          }, true);
        });
      });
    }
  }
  
  // ===== DATA MANAGEMENT =====
  function loadUserData() {
    // Load user data from localStorage or API
    const userData = {
      fullName: userName || '',
      email: userEmail || '',
      phone: localStorage.getItem('userPhone') || '',
      dateOfBirth: localStorage.getItem('userDateOfBirth') || '',
      address: localStorage.getItem('userAddress') || '',
      language: localStorage.getItem('userLanguage') || 'en'
    };
    
    // Populate form fields
    Object.keys(userData).forEach(key => {
      const field = document.getElementById(key);
      if (field && userData[key]) {
        field.value = userData[key];
      }
    });
    
    // Load toggle settings
    const toggleSettings = {
      applicationUpdates: localStorage.getItem('setting_applicationUpdates') === 'true',
      documentReminders: localStorage.getItem('setting_documentReminders') === 'true',
      marketingEmails: localStorage.getItem('setting_marketingEmails') === 'true',
      weeklySummary: localStorage.getItem('setting_weeklySummary') === 'true',
      smsUpdates: localStorage.getItem('setting_smsUpdates') === 'true',
      appointmentSms: localStorage.getItem('setting_appointmentSms') === 'true',
      sms2fa: localStorage.getItem('setting_sms2fa') === 'true',
      email2fa: localStorage.getItem('setting_email2fa') === 'true',
      loginNotifications: localStorage.getItem('setting_loginNotifications') !== 'false',
      dataAnalytics: localStorage.getItem('setting_dataAnalytics') === 'true',
      profileVisibility: localStorage.getItem('setting_profileVisibility') === 'true',
      thirdPartyAccess: localStorage.getItem('setting_thirdPartyAccess') === 'true'
    };
    
    Object.keys(toggleSettings).forEach(key => {
      const toggle = document.getElementById(key);
      if (toggle) {
        toggle.checked = toggleSettings[key];
      }
    });
    
    // Update profile completion
    updateProfileCompletion();
  }
  
  function saveSettings() {
    showLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      try {
        // Save form data
        const formData = {
          fullName: document.getElementById('fullName')?.value || '',
          email: document.getElementById('email')?.value || '',
          phone: document.getElementById('phone')?.value || '',
          dateOfBirth: document.getElementById('dateOfBirth')?.value || '',
          address: document.getElementById('address')?.value || '',
          language: document.getElementById('language')?.value || 'en'
        };
        
        // Save to localStorage (in real app, this would be an API call)
        Object.keys(formData).forEach(key => {
          if (formData[key]) {
            localStorage.setItem(`user${key.charAt(0).toUpperCase() + key.slice(1)}`, formData[key]);
          }
        });
        
        showLoading(false);
        showNotification('Settings saved successfully!', 'success');
        
        // Reset unsaved changes flag
        const saveBtn = document.getElementById('saveChangesBtn');
        const cancelBtn = document.getElementById('cancelBtn');
        if (saveBtn) {
          saveBtn.disabled = true;
          saveBtn.classList.remove('has-changes');
        }
        if (cancelBtn) {
          cancelBtn.style.display = 'none';
        }
        
        // Update profile completion
        updateProfileCompletion();
        
      } catch (error) {
        showLoading(false);
        showNotification('Failed to save settings. Please try again.', 'error');
        console.error('Save error:', error);
      }
    }, 1000);
  }
  
  function saveToggleSetting(settingName, value) {
    localStorage.setItem(`setting_${settingName}`, value.toString());
  }
  
  // ===== VALIDATION =====
  function validateField(field) {
    const value = field.value.trim();
    const fieldType = field.type;
    const fieldName = field.id;
    
    clearFieldError(field);
    
    // Required field validation
    if (field.hasAttribute('required') && !value) {
      showFieldError(field, 'This field is required');
      return false;
    }
    
    // Email validation
    if (fieldType === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        showFieldError(field, 'Please enter a valid email address');
        return false;
      }
    }
    
    // Phone validation
    if (fieldName === 'phone' && value) {
      const phoneRegex = /^(\+234|0)[0-9]{10}$/;
      if (!phoneRegex.test(value)) {
        showFieldError(field, 'Please enter a valid Nigerian phone number');
        return false;
      }
    }
    
    // Password validation
    if (fieldType === 'password' && value) {
      if (value.length < 8) {
        showFieldError(field, 'Password must be at least 8 characters long');
        return false;
      }
      
      // Check password confirmation
      if (fieldName === 'confirmPassword') {
        const newPassword = document.getElementById('newPassword')?.value;
        if (newPassword && value !== newPassword) {
          showFieldError(field, 'Passwords do not match');
          return false;
        }
      }
    }
    
    // Mark field as valid
    field.closest('.form-group')?.classList.add('success');
    return true;
  }
  
  function validateAllForms() {
    const forms = document.querySelectorAll('.settings-form');
    let isValid = true;
    
    forms.forEach(form => {
      const inputs = form.querySelectorAll('input, select, textarea');
      inputs.forEach(input => {
        if (!validateField(input)) {
          isValid = false;
        }
      });
    });
    
    return isValid;
  }
  
  function showFieldError(field, message) {
    const formGroup = field.closest('.form-group');
    if (formGroup) {
      formGroup.classList.add('error');
      formGroup.classList.remove('success');
      
      let errorElement = formGroup.querySelector('.error-message');
      if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        formGroup.appendChild(errorElement);
      }
      errorElement.textContent = message;
    }
  }
  
  function clearFieldError(field) {
    const formGroup = field.closest('.form-group');
    if (formGroup) {
      formGroup.classList.remove('error', 'success');
      const errorElement = formGroup.querySelector('.error-message');
      if (errorElement) {
        errorElement.textContent = '';
      }
    }
  }
  
  // ===== PASSWORD CHANGE =====
  function handlePasswordChange() {
    const currentPassword = document.getElementById('currentPassword')?.value;
    const newPassword = document.getElementById('newPassword')?.value;
    const confirmPassword = document.getElementById('confirmPassword')?.value;
    
    // Validate passwords
    if (!currentPassword) {
      showNotification('Please enter your current password', 'error');
      return;
    }
    
    if (!newPassword) {
      showNotification('Please enter a new password', 'error');
      return;
    }
    
    if (newPassword.length < 8) {
      showNotification('New password must be at least 8 characters long', 'error');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      showNotification('New passwords do not match', 'error');
      return;
    }
    
    if (currentPassword === newPassword) {
      showNotification('New password must be different from current password', 'error');
      return;
    }
    
    // Show confirmation modal
    showModal('Change Password', 'Are you sure you want to change your password?', function() {
      changePassword(currentPassword, newPassword);
    });
  }
  
  function changePassword(currentPassword, newPassword) {
    showLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      try {
        // In a real app, this would be an API call
        // For now, we'll just simulate success
        
        showLoading(false);
        showNotification('Password changed successfully!', 'success');
        
        // Clear password fields
        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';
        
      } catch (error) {
        showLoading(false);
        showNotification('Failed to change password. Please try again.', 'error');
        console.error('Password change error:', error);
      }
    }, 1500);
  }
  
  // ===== PROFILE COMPLETION =====
  function updateProfileCompletion() {
    const requiredFields = ['fullName', 'email', 'phone', 'dateOfBirth', 'address'];
    const completedFields = [];
    const missingFields = [];
    
    requiredFields.forEach(fieldId => {
      const field = document.getElementById(fieldId);
      const value = field?.value?.trim();
      
      if (value) {
        completedFields.push(fieldId);
      } else {
        missingFields.push(getFieldDisplayName(fieldId));
      }
    });
    
    const completionPercentage = Math.round((completedFields.length / requiredFields.length) * 100);
    
    // Update completion display
    const percentageElement = document.getElementById('completionPercentage');
    const progressElement = document.getElementById('completionProgress');
    const missingFieldsElement = document.getElementById('missingFields');
    
    if (percentageElement) {
      percentageElement.textContent = `${completionPercentage}%`;
    }
    
    if (progressElement) {
      progressElement.style.width = `${completionPercentage}%`;
    }
    
    if (missingFieldsElement) {
      if (missingFields.length > 0) {
        missingFieldsElement.innerHTML = `<strong>Missing:</strong> ${missingFields.join(', ')}`;
        missingFieldsElement.style.display = 'block';
      } else {
        missingFieldsElement.style.display = 'none';
      }
    }
  }
  
  // ===== UTILITY FUNCTIONS =====
  function showModal(title, message, onConfirm, requireInput = false) {
    const modalOverlay = document.getElementById('modalOverlay');
    const modalTitle = document.getElementById('modalTitle');
    const modalMessage = document.getElementById('modalMessage');
    const confirmAction = document.getElementById('confirmAction');
    
    if (modalTitle) modalTitle.textContent = title;
    if (modalMessage) {
      if (requireInput) {
        modalMessage.innerHTML = `
          <p>${message}</p>
          <input type="text" id="confirmInput" placeholder="Type DELETE to confirm" style="width: 100%; padding: 0.5rem; margin-top: 1rem; border: 2px solid #e5e7eb; border-radius: 6px;">
        `;
      } else {
        modalMessage.textContent = message;
      }
    }
    
    if (modalOverlay) {
      modalOverlay.classList.add('active');
    }
    
    // Set up confirm action
    if (confirmAction) {
      confirmAction.onclick = function() {
        if (requireInput) {
          const input = document.getElementById('confirmInput');
          if (input && input.value === 'DELETE') {
            closeModal();
            if (onConfirm) onConfirm();
          } else {
            showNotification('Please type "DELETE" to confirm', 'error');
            return;
          }
        } else {
          closeModal();
          if (onConfirm) onConfirm();
        }
      };
    }
  }
  
  function closeModal() {
    const modalOverlay = document.getElementById('modalOverlay');
    if (modalOverlay) {
      modalOverlay.classList.remove('active');
    }
  }
  
  function showLoading(show) {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
      if (show) {
        loadingOverlay.classList.add('active');
      } else {
        loadingOverlay.classList.remove('active');
      }
    }
  }
  
  function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notif => notif.remove());
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    // Get icon based on type
    let icon = 'fas fa-info-circle';
    switch (type) {
      case 'success': icon = 'fas fa-check-circle'; break;
      case 'error': icon = 'fas fa-exclamation-circle'; break;
      case 'warning': icon = 'fas fa-exclamation-triangle'; break;
    }
    
    notification.innerHTML = `
      <div class="notification-content">
        <i class="${icon} notification-icon"></i>
        <span class="notification-text">${message}</span>
        <button class="notification-close">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Auto-hide after 5 seconds
    const autoHideTimer = setTimeout(() => {
      hideNotification(notification);
    }, 5000);
    
    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
      clearTimeout(autoHideTimer);
      hideNotification(notification);
    });
  }
  
  function hideNotification(notification) {
    notification.classList.remove('show');
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }
  
  function getSettingDisplayName(settingId) {
    const displayNames = {
      applicationUpdates: 'Application Updates',
      documentReminders: 'Document Reminders',
      marketingEmails: 'Marketing Emails',
      weeklySummary: 'Weekly Summary',
      smsUpdates: 'SMS Updates',
      appointmentSms: 'Appointment SMS',
      sms2fa: 'SMS Two-Factor Authentication',
      email2fa: 'Email Two-Factor Authentication',
      loginNotifications: 'Login Notifications',
      dataAnalytics: 'Data Analytics',
      profileVisibility: 'Profile Visibility',
      thirdPartyAccess: 'Third-party Access'
    };
    
    return displayNames[settingId] || settingId;
  }
  
  function getFieldDisplayName(fieldId) {
    const displayNames = {
      fullName: 'Full Name',
      email: 'Email Address',
      phone: 'Phone Number',
      dateOfBirth: 'Date of Birth',
      address: 'Address',
      language: 'Language'
    };
    
    return displayNames[fieldId] || fieldId;
  }
  
  // ===== KEYBOARD SHORTCUTS =====
  document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + S to save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      const saveBtn = document.getElementById('saveChangesBtn');
      if (saveBtn && !saveBtn.disabled) {
        saveBtn.click();
      }
    }
    
    // Ctrl/Cmd + Z to cancel changes
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
      e.preventDefault();
      const cancelBtn = document.getElementById('cancelBtn');
      if (cancelBtn && cancelBtn.style.display !== 'none') {
        cancelBtn.click();
      }
    }
  });
  
  // ===== RESPONSIVE BEHAVIOR =====
  function handleResponsiveChanges() {
    const sidebar = document.getElementById('sidebar');
    const mobileOverlay = document.getElementById('mobileOverlay');
    
    if (window.innerWidth > 768) {
      // Desktop view
      if (sidebar) sidebar.classList.remove('active');
      if (mobileOverlay) mobileOverlay.classList.remove('active');
    }
  }
  
  window.addEventListener('resize', handleResponsiveChanges);
  
  // ===== ACCESSIBILITY IMPROVEMENTS =====
  
  // Focus management for modals
  const modalOverlay = document.getElementById('modalOverlay');
  if (modalOverlay) {
    modalOverlay.addEventListener('transitionend', function() {
      if (this.classList.contains('active')) {
        // Focus first focusable element in modal
        const focusableElements = this.querySelectorAll('button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusableElements.length > 0) {
          focusableElements[0].focus();
        }
      }
    });
  }
  
  // Announce changes to screen readers
  function announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.style.cssText = 'position: absolute; left: -10000px; width: 1px; height: 1px; overflow: hidden;';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }
  
  // ===== FOOTER CONTACT SUPPORT FIX =====
  // Fix for Contact Support being covered by sidebar
  function adjustFooterForSidebar() {
    const footer = document.querySelector('.dashboard-footer');
    const sidebar = document.getElementById('sidebar');
    
    if (footer && sidebar) {
      // Add padding to footer to account for sidebar
      if (window.innerWidth > 768) {
        footer.style.paddingLeft = '280px'; // Sidebar width + some padding
      } else {
        footer.style.paddingLeft = '0';
      }
    }
  }
  
  // Apply footer fix on load and resize
  adjustFooterForSidebar();
  window.addEventListener('resize', adjustFooterForSidebar);
  
  // ===== INITIALIZATION COMPLETE =====
  console.log('Settings page fully initialized');
});

// ===== GLOBAL ERROR HANDLER =====
window.addEventListener('error', function(e) {
  console.error('Settings page error:', e.error);
  // You could send this to an error reporting service
});

// ===== SERVICE WORKER REGISTRATION (Optional) =====
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.js')
      .then(function(registration) {
        console.log('ServiceWorker registration successful');
      })
      .catch(function(err) {
        console.log('ServiceWorker registration failed');
      });
  });
}