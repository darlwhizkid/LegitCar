document.addEventListener('DOMContentLoaded', function() {
  // Get current year for footer
  document.getElementById('currentYear').textContent = new Date().getFullYear();
  
  // User menu toggle
  const userMenuToggle = document.getElementById('userMenuToggle');
  const userDropdownMenu = document.getElementById('userDropdownMenu');
  
  userMenuToggle.addEventListener('click', function() {
    userDropdownMenu.classList.toggle('active');
  });
  
  // Close dropdown when clicking outside
  document.addEventListener('click', function(event) {
    if (!userMenuToggle.contains(event.target) && !userDropdownMenu.contains(event.target)) {
      userDropdownMenu.classList.remove('active');
    }
  });
  
  // Sidebar toggle functionality
  const sidebarToggle = document.querySelector('.sidebar-toggle');
  const dashboardContainer = document.querySelector('.dashboard-container');
  
  sidebarToggle.addEventListener('click', function() {
    dashboardContainer.classList.toggle('sidebar-collapsed');
  });
  
  // Modal functionality
  const modal = document.getElementById('confirmationModal');
  const deleteAccountBtn = document.getElementById('deleteAccountBtn');
  const cancelAction = document.getElementById('cancelAction');
  const confirmAction = document.getElementById('confirmAction');
  const closeModal = document.querySelector('.close-modal');
  const modalMessage = document.getElementById('modalMessage');
  
  // Open modal for delete account
  deleteAccountBtn.addEventListener('click', function() {
    modalMessage.textContent = 'Are you sure you want to delete your account? This action cannot be undone.';
    modal.style.display = 'block';
    
    // Set up confirm action for delete account
    confirmAction.onclick = function() {
      // Here you would typically make an API call to delete the account
      alert('Account deletion request submitted.');
      modal.style.display = 'none';
    };
  });
  
  // Close modal when clicking cancel
  cancelAction.addEventListener('click', function() {
    modal.style.display = 'none';
  });
  
  // Close modal when clicking X
  closeModal.addEventListener('click', function() {
    modal.style.display = 'none';
  });
  
  // Close modal when clicking outside
  window.addEventListener('click', function(event) {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  });
  
  // Save changes button
  const saveChangesBtn = document.getElementById('saveChangesBtn');
  saveChangesBtn.addEventListener('click', function() {
    // Validate form
    if (validateForm()) {
      // Here you would typically make an API call to save the settings
      showNotification('Settings saved successfully!', 'success');
    }
  });
  
  // Cancel button
  const cancelBtn = document.getElementById('cancelBtn');
  cancelBtn.addEventListener('click', function() {
    // Reset form or redirect
    if (confirm('Discard changes?')) {
      window.location.reload();
    }
  });
  
  // Logout functionality
  const logoutBtn = document.getElementById('logoutBtn');
  logoutBtn.addEventListener('click', function(e) {
    e.preventDefault();
    
    // Here you would typically make an API call to logout
    modalMessage.textContent = 'Are you sure you want to log out?';
    modal.style.display = 'block';
    
    // Set up confirm action for logout
    confirmAction.onclick = function() {
      window.location.href = 'login.html';
    };
  });
  
  // Form validation
  function validateForm() {
    const email = document.getElementById('email').value;
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    // Check if changing password
    if (newPassword || confirmPassword) {
      if (!currentPassword) {
        showNotification('Please enter your current password.', 'error');
        return false;
      }
      
      if (newPassword !== confirmPassword) {
        showNotification('New passwords do not match.', 'error');
        return false;
      }
      
      if (newPassword.length < 8) {
        showNotification('Password must be at least 8 characters long.', 'error');
        return false;
      }
    }
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showNotification('Please enter a valid email address.', 'error');
      return false;
    }
    
    return true;
  }
  
  // Notification function
  function showNotification(message, type) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
      <span>${message}</span>
      <button class="notification-close">×</button>
    `;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
      notification.classList.add('show');
    }, 10);
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 5000);
    
    // Close button
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
      notification.classList.remove('show');
      setTimeout(() => {
        notification.remove();
      }, 300);
    });
  }
  
  // Add notification styles dynamically
  const style = document.createElement('style');
  style.textContent = `
    .notification {
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 20px;
      border-radius: 5px;
      color: white;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
      transform: translateX(120%);
      transition: transform 0.3s ease;
      z-index: 1001;
    }
    
    .notification.show {
      transform: translateX(0);
    }
    
    .notification.success {
      background-color: #4CAF50;
    }
    
    .notification.error {
      background-color: #F44336;
    }
    
    .notification-close {
      background: none;
      border: none;
      color: white;
      font-size: 20px;
      cursor: pointer;
      margin-left: 15px;
    }
  `;
  document.head.appendChild(style);
});