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
  if (userGreeting) {
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
  
  // Handle profile picture preview
  const profilePictureInput = document.getElementById('profilePicture');
  const profilePicturePreview = document.getElementById('profilePicturePreview');
  
  if (profilePictureInput && profilePicturePreview) {
    // Show existing profile picture if available
    if (userData.profilePicture) {
      profilePicturePreview.src = userData.profilePicture;
    }
    
    // Handle file selection
    profilePictureInput.addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (file) {
        // Check file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
          alert('File size exceeds 2MB. Please choose a smaller image.');
          return;
        }
        
        const reader = new FileReader();
        reader.onload = function(event) {
          profilePicturePreview.src = event.target.result;
        };
        reader.readAsDataURL(file);
      }
    });
  }
  
  // Handle profile form
  const profileForm = document.getElementById('profileForm');
  if (profileForm) {
    // Populate form with existing data
    populateProfileForm(userData);
    
    // Handle form submission
    profileForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Get all form data
      const updatedUserData = {
        ...userData,
        name: document.getElementById('profileName').value.trim(),
        email: document.getElementById('profileEmail').value.trim(),
        phone: document.getElementById('profilePhone').value.trim(),
        address: document.getElementById('profileAddress').value.trim(),
        dob: document.getElementById('profileDob').value,
        city: document.getElementById('profileCity').value.trim(),
        state: document.getElementById('profileState').value.trim(),
        gender: document.getElementById('profileGender').value,
        nin: document.getElementById('profileNin').value.trim(),
        occupation: document.getElementById('profileOccupation').value.trim(),
        bio: document.getElementById('profileBio').value.trim(),
        
        // Next of kin information
        nokName: document.getElementById('nokName').value.trim(),
        nokRelationship: document.getElementById('nokRelationship').value,
        nokPhone: document.getElementById('nokPhone').value.trim(),
        nokEmail: document.getElementById('nokEmail').value.trim(),
        nokAddress: document.getElementById('nokAddress').value.trim(),
        
        // Profile picture (if changed)
        profilePicture: profilePicturePreview.src
      };
      
      // Save updated user data to currentUser
      localStorage.setItem('currentUser', JSON.stringify(updatedUserData));
      
      // IMPORTANT: Add this code to also save to the users array
      saveUserToUsersArray(updatedUserData);
      
      // Show success message
      alert('Profile updated successfully!');
      
      // Redirect back to dashboard
      window.location.href = 'dashboard.html';
    });

function saveUserToUsersArray(userData) {
  // Get existing users
  const users = JSON.parse(localStorage.getItem('users')) || [];
  
  // Find the index of the current user
  const userIndex = users.findIndex(user => user.email === userData.email);
  
  if (userIndex >= 0) {
    // Update existing user
    users[userIndex] = userData;
  } else {
    // Add as new user
    users.push(userData);
  }
  
  // Save updated users array
  localStorage.setItem('users', JSON.stringify(users));
}  }
});

function populateProfileForm(userData) {
  // Populate personal information
  if (userData.name) document.getElementById('profileName').value = userData.name;
  if (userData.email) document.getElementById('profileEmail').value = userData.email;
  if (userData.phone) document.getElementById('profilePhone').value = userData.phone;
  if (userData.address) document.getElementById('profileAddress').value = userData.address;
  if (userData.dob) document.getElementById('profileDob').value = userData.dob;
  if (userData.city) document.getElementById('profileCity').value = userData.city;
  if (userData.state) document.getElementById('profileState').value = userData.state;
  if (userData.gender) document.getElementById('profileGender').value = userData.gender;
  if (userData.nin) document.getElementById('profileNin').value = userData.nin;
  if (userData.occupation) document.getElementById('profileOccupation').value = userData.occupation;
  if (userData.bio) document.getElementById('profileBio').value = userData.bio;
  
  // Populate next of kin information
  if (userData.nokName) document.getElementById('nokName').value = userData.nokName;
  if (userData.nokRelationship) document.getElementById('nokRelationship').value = userData.nokRelationship;
  if (userData.nokPhone) document.getElementById('nokPhone').value = userData.nokPhone;
  if (userData.nokEmail) document.getElementById('nokEmail').value = userData.nokEmail;
  if (userData.nokAddress) document.getElementById('nokAddress').value = userData.nokAddress;
}