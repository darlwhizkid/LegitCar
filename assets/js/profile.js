// Profile Page JavaScript
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
  
  // Fill profile form with user data
  function fillProfileForm() {
    const profileForm = document.getElementById('profileForm');
    if (!profileForm) return;
    
    // Get form fields
    const nameInput = document.getElementById('fullName');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const addressInput = document.getElementById('address');
    const cityInput = document.getElementById('city');
    const stateInput = document.getElementById('state');
    const zipInput = document.getElementById('zip');
    const countryInput = document.getElementById('country');
    
    // Fill form fields with user data
    if (nameInput && userData.name) nameInput.value = userData.name;
    if (emailInput && userData.email) emailInput.value = userData.email;
    if (phoneInput && userData.phone) phoneInput.value = userData.phone;
    if (addressInput && userData.address) addressInput.value = userData.address;
    if (cityInput && userData.city) cityInput.value = userData.city;
    if (stateInput && userData.state) stateInput.value = userData.state;
    if (zipInput && userData.zip) zipInput.value = userData.zip;
    if (countryInput && userData.country) countryInput.value = userData.country;
  }
  
  // Handle profile form submission
  const profileForm = document.getElementById('profileForm');
  if (profileForm) {
    profileForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Get form data
      const formData = new FormData(this);
      
      // Update user data
      userData.name = formData.get('fullName');
      userData.email = formData.get('email');
      userData.phone = formData.get('phone');
      userData.address = formData.get('address');
      userData.city = formData.get('city');
      userData.state = formData.get('state');
      userData.zip = formData.get('zip');
      userData.country = formData.get('country');
      
      // Save updated user data to localStorage
      localStorage.setItem('currentUser', JSON.stringify(userData));
      
      // Show success message
      showNotification('Profile updated successfully!', 'success');
      
      // Update user greeting
      if (userGreeting) {
        userGreeting.textContent = `Welcome, ${userData.name || 'User'}`;
      }
    });
  }
  
  // Handle password change form submission
  const passwordForm = document.getElementById('passwordForm');
  if (passwordForm) {
    passwordForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Get form data
      const currentPassword = document.getElementById('currentPassword').value;
      const newPassword = document.getElementById('newPassword').value;
      const confirmPassword = document.getElementById('confirmPassword').value;
      
      // Validate form data
      if (!currentPassword || !newPassword || !confirmPassword) {
        showNotification('Please fill in all fields.', 'error');
        return;
      }
      
      if (newPassword !== confirmPassword) {
        showNotification('New passwords do not match.', 'error');
        return;
      }
      
      if (newPassword.length < 8) {
        showNotification('Password must be at least 8 characters long.', 'error');
        return;
      }
      
      // In a real app, this would send the password change request to the server
      // For this demo, we'll just show a success message
      
      // Reset form
      this.reset();
      
      // Show success message
      showNotification('Password changed successfully!', 'success');
    });
  }
  
  // Handle notification preferences form submission
  const notificationForm = document.getElementById('notificationForm');
  if (notificationForm) {
    notificationForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Get form data
      const emailNotifications = document.getElementById('emailNotifications').checked;
      const smsNotifications = document.getElementById('smsNotifications').checked;
      const appNotifications = document.getElementById('appNotifications').checked;
      
      // Update user data
      userData.notifications = {
        email: emailNotifications,
        sms: smsNotifications,
        app: appNotifications
      };
      
      // Save updated user data to localStorage
      localStorage.setItem('currentUser', JSON.stringify(userData));
      
      // Show success message
      showNotification('Notification preferences updated successfully!', 'success');
    });
  }
  
  // Fill notification preferences form with user data
  function fillNotificationForm() {
    const notificationForm = document.getElementById('notificationForm');
    if (!notificationForm) return;
    
    // Get form fields
    const emailNotifications = document.getElementById('emailNotifications');
    const smsNotifications = document.getElementById('smsNotifications');
    const appNotifications = document.getElementById('appNotifications');
    
    // Fill form fields with user data
    if (userData.notifications) {
      if (emailNotifications) emailNotifications.checked = userData.notifications.email !== false;
      if (smsNotifications) smsNotifications.checked = userData.notifications.sms !== false;
      if (appNotifications) appNotifications.checked = userData.notifications.app !== false;
    } else {
      // Default to checked if no preferences are set
      if (emailNotifications) emailNotifications.checked = true;
      if (smsNotifications) smsNotifications.checked = true;
      if (appNotifications) appNotifications.checked = true;
    }
  }
  
  // Show notification
  function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <span>${message}</span>
        <button class="close-notification">&times;</button>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Add close button functionality
    const closeBtn = notification.querySelector('.close-notification');
    closeBtn.addEventListener('click', function() {
      notification.remove();
    });
    
    // Auto-remove after 5 seconds
    setTimeout(function() {
      notification.remove();
    }, 5000);
  }
  
  // Tab switching functionality
  const profileTabs = document.querySelectorAll('.profile-tab');
  const profileSections = document.querySelectorAll('.profile-section');
  
  profileTabs.forEach(tab => {
    tab.addEventListener('click', function() {
      // Remove active class from all tabs
      profileTabs.forEach(t => t.classList.remove('active'));
      
      // Add active class to clicked tab
      this.classList.add('active');
      
      /      // Hide all sections
      profileSections.forEach(section => {
        section.style.display = 'none';
      });
      
      // Show the corresponding section
      const targetId = this.getAttribute('data-target');
      const targetSection = document.getElementById(targetId);
      if (targetSection) {
        targetSection.style.display = 'block';
      }
    });
  });
  
  // Handle profile picture upload
  const profilePictureUpload = document.getElementById('profilePictureUpload');
  const profilePicture = document.getElementById('profilePicture');
  const uploadProfilePictureBtn = document.getElementById('uploadProfilePictureBtn');
  
  if (profilePictureUpload && profilePicture) {
    // Set profile picture from localStorage if available
    if (userData.profilePicture) {
      profilePicture.src = userData.profilePicture;
    }
    
    // Handle file selection
    profilePictureUpload.addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (!file) return;
      
      // Check file type
      if (!file.type.match('image.*')) {
        showNotification('Please select an image file.', 'error');
        return;
      }
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showNotification('Image size should not exceed 5MB.', 'error');
        return;
      }
      
      // Read file as data URL
      const reader = new FileReader();
      reader.onload = function(e) {
        // Update profile picture
        profilePicture.src = e.target.result;
        
        // Save to localStorage
        userData.profilePicture = e.target.result;
        localStorage.setItem('currentUser', JSON.stringify(userData));
        
        // Show success message
        showNotification('Profile picture updated successfully!', 'success');
      };
      reader.readAsDataURL(file);
    });
    
    // Handle upload button click
    if (uploadProfilePictureBtn) {
      uploadProfilePictureBtn.addEventListener('click', function() {
        profilePictureUpload.click();
      });
    }
  }
  
  // Handle delete account button
  const deleteAccountBtn = document.getElementById('deleteAccountBtn');
  if (deleteAccountBtn) {
    deleteAccountBtn.addEventListener('click', function() {
      // Show confirmation dialog
      if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
        // In a real app, this would send a delete request to the server
        
        // Clear all user data from localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('isAuthenticated');
        
        // Redirect to home page
        window.location.href = 'index.html';
      }
    });
  }
  
  // Initialize forms
  fillProfileForm();
  fillNotificationForm();
  
  // Show the first tab by default
  if (profileTabs.length > 0) {
    profileTabs[0].click();
  }
  
  // Handle vehicle management
  const vehiclesContainer = document.getElementById('vehiclesContainer');
  const addVehicleBtn = document.getElementById('addVehicleBtn');
  const addVehicleModal = document.getElementById('addVehicleModal');
  const closeVehicleModal = document.getElementById('closeVehicleModal');
  const vehicleForm = document.getElementById('vehicleForm');
  
  // Load user vehicles
  function loadUserVehicles() {
    if (!vehiclesContainer) return;
    
    // Get user vehicles from localStorage
    const userVehicles = userData.vehicles || [];
    
    // Clear existing vehicles
    vehiclesContainer.innerHTML = '';
    
    if (userVehicles.length === 0) {
      // Show empty state
      vehiclesContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">
            <i class="fas fa-car"></i>
          </div>
          <h3>No Vehicles Added</h3>
          <p>You haven't added any vehicles yet. Click the "Add Vehicle" button to get started.</p>
        </div>
      `;
      return;
    }
    
    // Add vehicles to the container
    userVehicles.forEach((vehicle, index) => {
      const vehicleCard = document.createElement('div');
      vehicleCard.className = 'vehicle-card';
      vehicleCard.dataset.index = index;
      
      vehicleCard.innerHTML = `
        <div class="vehicle-header">
          <h3>${vehicle.make} ${vehicle.model}</h3>
          <div class="vehicle-actions">
            <button class="edit-vehicle-btn" title="Edit Vehicle">
              <i class="fas fa-edit"></i>
            </button>
            <button class="delete-vehicle-btn" title="Delete Vehicle">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
        <div class="vehicle-details">
          <div class="vehicle-detail">
            <span class="detail-label">Year:</span>
            <span class="detail-value">${vehicle.year}</span>
          </div>
          <div class="vehicle-detail">
            <span class="detail-label">License Plate:</span>
            <span class="detail-value">${vehicle.licensePlate}</span>
          </div>
          <div class="vehicle-detail">
            <span class="detail-label">VIN:</span>
            <span class="detail-value">${vehicle.vin}</span>
          </div>
          <div class="vehicle-detail">
            <span class="detail-label">Color:</span>
            <span class="detail-value">${vehicle.color}</span>
          </div>
        </div>
      `;
      
      // Add event listeners for edit and delete buttons
      const editBtn = vehicleCard.querySelector('.edit-vehicle-btn');
      const deleteBtn = vehicleCard.querySelector('.delete-vehicle-btn');
      
      editBtn.addEventListener('click', function() {
        editVehicle(index);
      });
      
      deleteBtn.addEventListener('click', function() {
        deleteVehicle(index);
      });
      
      vehiclesContainer.appendChild(vehicleCard);
    });
  }
  
  // Add vehicle button
  if (addVehicleBtn) {
    addVehicleBtn.addEventListener('click', function() {
      // Reset form
      if (vehicleForm) vehicleForm.reset();
      
      // Set form mode to add
      vehicleForm.dataset.mode = 'add';
      vehicleForm.dataset.index = '';
      
      // Update modal title
      document.getElementById('vehicleModalTitle').textContent = 'Add Vehicle';
      
      // Show modal
      addVehicleModal.style.display = 'block';
    });
  }
  
  // Close vehicle modal
  if (closeVehicleModal) {
    closeVehicleModal.addEventListener('click', function() {
      addVehicleModal.style.display = 'none';
    });
  }
  
  // Close modal when clicking outside
  window.addEventListener('click', function(event) {
    if (event.target === addVehicleModal) {
      addVehicleModal.style.display = 'none';
    }
  });
  
  // Handle vehicle form submission
  if (vehicleForm) {
    vehicleForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Get form data
      const make = document.getElementById('vehicleMake').value;
      const model = document.getElementById('vehicleModel').value;
      const year = document.getElementById('vehicleYear').value;
      const licensePlate = document.getElementById('vehicleLicensePlate').value;
      const vin = document.getElementById('vehicleVIN').value;
      const color = document.getElementById('vehicleColor').value;
      
      // Create vehicle object
      const vehicle = {
        make,
        model,
        year,
        licensePlate,
        vin,
        color
      };
      
      // Initialize vehicles array if it doesn't exist
      if (!userData.vehicles) {
        userData.vehicles = [];
      }
      
      // Check if we're adding or editing
      const mode = vehicleForm.dataset.mode;
      if (mode === 'edit') {
        // Get the index of the vehicle to edit
        const index = parseInt(vehicleForm.dataset.index);
        
        // Update the vehicle
        userData.vehicles[index] = vehicle;
        
        // Show success message
        showNotification('Vehicle updated successfully!', 'success');
      } else {
        // Add the vehicle
        userData.vehicles.push(vehicle);
        
        // Show success message
        showNotification('Vehicle added successfully!', 'success');
      }
      
      // Save updated user data to localStorage
      localStorage.setItem('currentUser', JSON.stringify(userData));
      
      // Close modal
      addVehicleModal.style.display = 'none';
      
      // Reload vehicles
      loadUserVehicles();
    });
  }
  
  // Edit vehicle
  function editVehicle(index) {
    // Get the vehicle
    const vehicle = userData.vehicles[index];
    
    // Set form values
    document.getElementById('vehicleMake').value = vehicle.make;
    document.getElementById('vehicleModel').value = vehicle.model;
    document.getElementById('vehicleYear').value = vehicle.year;
    document.getElementById('vehicleLicensePlate').value = vehicle.licensePlate;
    document.getElementById('vehicleVIN').value = vehicle.vin;
    document.getElementById('vehicleColor').value = vehicle.color;
    
    // Set form mode to edit
    vehicleForm.dataset.mode = 'edit';
    vehicleForm.dataset.index = index;
    
    // Update modal title
    document.getElementById('vehicleModalTitle').textContent = 'Edit Vehicle';
    
    // Show modal
    addVehicleModal.style.display = 'block';
  }
  
  // Delete vehicle
  function deleteVehicle(index) {
    // Show confirmation dialog
    if (confirm('Are you sure you want to delete this vehicle?')) {
      // Remove the vehicle
      userData.vehicles.splice(index, 1);
      
      // Save updated user data to localStorage
      localStorage.setItem('currentUser', JSON.stringify(userData));
      
      // Reload vehicles
      loadUserVehicles();
      
      // Show success message
      showNotification('Vehicle deleted successfully!', 'success');
    }
  }
  
  // Load user vehicles on page load
  loadUserVehicles();
});

