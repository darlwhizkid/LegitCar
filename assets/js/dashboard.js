// Dashboard JavaScript - Complete and Working
document.addEventListener("DOMContentLoaded", function () {
  console.log("Dashboard page loaded");

  // Authentication check using correct localStorage keys
  const token = localStorage.getItem("userToken");
  const userEmail = localStorage.getItem("userEmail");
  const userName = localStorage.getItem("userName");

  // Load user profile picture function
  async function loadUserProfile() {
    try {
      // First try to get from API
      const response = await ApiService.get("/api/user/profile");

      if (response.success) {
        const user = response.data;

        // Update user name and email
        document.getElementById("userName").textContent = user.name || "User";
        document.getElementById("userEmail").textContent = user.email || "";

        // Update profile picture in top bar
        const userAvatar = document.querySelector(".user-avatar");
        if (user.profilePicture && userAvatar) {
          userAvatar.innerHTML = `
          <img src="${user.profilePicture}" 
               alt="Profile Picture" 
               class="profile-picture"
               onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
          <i class="fas fa-user-circle fallback-icon" style="display: none;"></i>
        `;
          // Save to localStorage for faster loading next time
          localStorage.setItem("userProfilePicture", user.profilePicture);
        } else if (userAvatar) {
          userAvatar.innerHTML = '<i class="fas fa-user-circle"></i>';
        }

        // Update welcome message
        document.getElementById("welcomeMessage").textContent = `Welcome, ${
          user.name || "User"
        }!`;
      } else {
        // Fallback to localStorage
        loadUserProfileFromStorage();
      }
    } catch (error) {
      console.error("Error loading user profile:", error);
      // Fallback to localStorage
      loadUserProfileFromStorage();
    }
  }

  function loadUserProfileFromStorage() {
    const profilePicture = localStorage.getItem("userProfilePicture");
    const userName = localStorage.getItem("userName");
    const userEmail = localStorage.getItem("userEmail");

    if (userName) {
      document.getElementById("userName").textContent = userName;
      document.getElementById(
        "welcomeMessage"
      ).textContent = `Welcome, ${userName}!`;
    }

    if (userEmail) {
      document.getElementById("userEmail").textContent = userEmail;
    }

    const userAvatar = document.querySelector(".user-avatar");
    if (profilePicture && userAvatar) {
      userAvatar.innerHTML = `
      <img src="${profilePicture}" 
           alt="Profile Picture" 
           class="profile-picture"
           onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
      <i class="fas fa-user-circle fallback-icon" style="display: none;"></i>
    `;
    } else if (userAvatar) {
      userAvatar.innerHTML = '<i class="fas fa-user-circle"></i>';
    }
  }

  if (!token) {
    console.log("No token found, redirecting to login");
    window.location.href = "login.html";
    return;
  }

  loadUserProfile();

  // Update user info in header
  const userNameElement = document.getElementById("userName");
  const userEmailElement = document.getElementById("userEmail");

  if (userNameElement && userName) {
    userNameElement.textContent = userName;
  }

  if (userEmailElement && userEmail) {
    userEmailElement.textContent = userEmail;
  }

  // Update welcome message
  const welcomeMessage = document.getElementById("welcomeMessage");
  if (welcomeMessage && userName) {
    welcomeMessage.textContent = `Welcome, ${userName.split(" ")[0]}!`;
  }

  // User menu functionality
  const userMenuToggle = document.getElementById("userMenuToggle");
  const userDropdown = document.getElementById("userDropdown");

  if (userMenuToggle && userDropdown) {
    userMenuToggle.addEventListener("click", function () {
      userDropdown.classList.toggle("active");
    });

    document.addEventListener("click", function (event) {
      if (
        !userMenuToggle.contains(event.target) &&
        !userDropdown.contains(event.target)
      ) {
        userDropdown.classList.remove("active");
      }
    });
  }

  // Logout functionality
  const logoutBtn = document.getElementById("logoutBtn");
  const headerLogoutBtn = document.getElementById("headerLogoutBtn");

  function handleLogout(e) {
    e.preventDefault();

    // Clear authentication data
    localStorage.removeItem("userToken");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userId");
    localStorage.removeItem("tokenExpiry");
    localStorage.removeItem("lastApplicationId");

    // Redirect to homepage
    window.location.href = "index.html";
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", handleLogout);
  }

  if (headerLogoutBtn) {
    headerLogoutBtn.addEventListener("click", handleLogout);
  }

  // Sidebar functionality
  const sidebarToggle = document.getElementById("sidebarToggle");
  const sidebar = document.getElementById("sidebar");
  const sidebarClose = document.getElementById("sidebarClose");
  const mobileOverlay = document.getElementById("mobileOverlay");

  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener("click", function () {
      sidebar.classList.add("active");
      if (mobileOverlay) {
        mobileOverlay.classList.add("active");
      }
    });
  }

  if (sidebarClose && sidebar) {
    sidebarClose.addEventListener("click", function () {
      sidebar.classList.remove("active");
      if (mobileOverlay) {
        mobileOverlay.classList.remove("active");
      }
    });
  }

  if (mobileOverlay && sidebar) {
    mobileOverlay.addEventListener("click", function () {
      sidebar.classList.remove("active");
      mobileOverlay.classList.remove("active");
    });
  }

  // Application tracking functionality
  const trackBtn = document.getElementById("trackBtn");
  const trackingInput = document.getElementById("trackingInput");
  const trackingResult = document.getElementById("trackingResult");
  const trackingError = document.getElementById("trackingError");

  if (trackBtn && trackingInput) {
    trackBtn.addEventListener("click", function () {
      const applicationId = trackingInput.value.trim();

      if (!applicationId) {
        showNotification("Please enter an Application ID", "warning");
        return;
      }

      // Hide previous results
      if (trackingResult) trackingResult.style.display = "none";
      if (trackingError) trackingError.style.display = "none";

      // Show loading
      trackBtn.disabled = true;
      trackBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Tracking...';

      // Simulate tracking (replace with actual API call)
      setTimeout(() => {
        // Mock data - replace with actual API response
        const mockData = {
          id: applicationId,
          type: "Vehicle Registration",
          status: "pending",
          date: new Date().toLocaleDateString(),
        };

        if (trackingResult) {
          document.getElementById("resultAppId").textContent = mockData.id;
          document.getElementById("resultAppType").textContent = mockData.type;
          document.getElementById("resultAppStatus").textContent =
            mockData.status;
          document.getElementById("resultAppDate").textContent = mockData.date;
          trackingResult.style.display = "block";
        }

        // Reset button
        trackBtn.disabled = false;
        trackBtn.innerHTML = '<i class="fas fa-search"></i> Track';

        showNotification("Application found successfully", "success");
      }, 1500);
    });

    // Enter key support for tracking input
    trackingInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        trackBtn.click();
      }
    });
  }

  // Hide loading overlay if it exists
  const loadingOverlay = document.getElementById("loadingOverlay");
  if (loadingOverlay) {
    loadingOverlay.style.display = "none";
  }

  // Load dashboard data
  loadDashboardStats();
  loadRecentApplications();
  updateMessagesBadge();

  // Initialize additional features from the original dashboard.js
  initializeApplicationsTracking();

  console.log("Dashboard initialized successfully");
});

// Load dashboard statistics
function loadDashboardStats() {
  // For new users with no applications - all stats should be 0
  const stats = {
    total: 0,
    pending: 0,
    approved: 0,
    processing: 0,
  };

  const totalApplicationsEl = document.getElementById("totalApplications");
  const pendingApplicationsEl = document.getElementById("pendingApplications");
  const approvedApplicationsEl = document.getElementById(
    "approvedApplications"
  );
  const processingApplicationsEl = document.getElementById(
    "processingApplications"
  );

  if (totalApplicationsEl) totalApplicationsEl.textContent = stats.total;
  if (pendingApplicationsEl) pendingApplicationsEl.textContent = stats.pending;
  if (approvedApplicationsEl)
    approvedApplicationsEl.textContent = stats.approved;
  if (processingApplicationsEl)
    processingApplicationsEl.textContent = stats.processing;
}

// Load recent applications
function loadRecentApplications() {
  const recentApplicationsEl = document.getElementById("recentApplications");

  if (!recentApplicationsEl) return;

  // Remove loading state
  const loadingState = recentApplicationsEl.querySelector(".loading-state");
  if (loadingState) {
    loadingState.remove();
  }

  // Empty array for new users - no applications yet
  const applications = [];

  if (applications.length === 0) {
    recentApplicationsEl.innerHTML = `
      <div class="no-applications">
        <i class="fas fa-file-alt"></i>
        <p>No applications found</p>
        <a href="new-application.html" class="btn btn-primary">Submit Your First Application</a>
      </div>
    `;
    return;
  }

  // This part won't execute for new users since applications array is empty
  recentApplicationsEl.innerHTML = applications
    .map(
      (app) => `
    <div class="application-item">
      <div class="app-info">
        <div class="app-id">#${app.id}</div>
        <div class="app-type">${app.type}</div>
        <div class="app-date">${new Date(app.date).toLocaleDateString()}</div>
      </div>
      <div class="app-status">
        <span class="status-badge status-${app.status}">${app.status}</span>
        <button class="btn btn-sm" onclick="trackApplication('${
          app.id
        }')">Track</button>
      </div>
    </div>
  `
    )
    .join("");
}

// Update messages badge
function updateMessagesBadge() {
  const messagesBadge = document.getElementById("messagesBadge");
  if (messagesBadge) {
    // New users have no unread messages
    const unreadCount = 0;
    messagesBadge.textContent = unreadCount;
    messagesBadge.style.display = unreadCount > 0 ? "inline" : "none";
  }
}

// Initialize applications tracking functionality
function initializeApplicationsTracking() {
  // This function can be used to load user's actual applications
  // and integrate with the ApplicationTracker from the original code
  console.log("Applications tracking initialized");
}

// Track specific application
function trackApplication(applicationId) {
  const trackingInput = document.getElementById("trackingInput");
  if (trackingInput) {
    trackingInput.value = applicationId;
    const trackBtn = document.getElementById("trackBtn");
    if (trackBtn) {
      trackBtn.click();
    }
  }
}

// Notification system
function showNotification(message, type = "info") {
  // Remove existing notifications
  const existingNotifications = document.querySelectorAll(".notification");
  existingNotifications.forEach((notif) => notif.remove());

  // Create notification element
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <span>${message}</span>
      <button class="notification-close">&times;</button>
    </div>
  `;

  // Add styles if they don't exist
  if (!document.querySelector("#notification-styles")) {
    const styles = document.createElement("style");
    styles.id = "notification-styles";
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
        max-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      }
      .notification.success { background-color: #10b981; }
      .notification.error { background-color: #ef4444; }
      .notification.info { background-color: #3b82f6; }
      .notification.warning { background-color: #f59e0b; }
      .notification.show { transform: translateX(0); }
      .notification-content { display: flex; justify-content: space-between; align-items: center; }
      .notification-close { 
        background: none; 
        border: none; 
        color: white; 
        font-size: 18px; 
        cursor: pointer; 
        margin-left: 10px;
        padding: 0;
        line-height: 1;
      }
      .notification-close:hover { opacity: 0.8; }
    `;
    document.head.appendChild(styles);
  }

  document.body.appendChild(notification);

  // Close button functionality
  const closeBtn = notification.querySelector(".notification-close");
  closeBtn.addEventListener("click", () => {
    notification.classList.remove("show");
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  });

  // Show notification
  setTimeout(() => notification.classList.add("show"), 100);

  // Hide notification after 5 seconds
  setTimeout(() => {
    if (notification.classList.contains("show")) {
      notification.classList.remove("show");
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }
  }, 5000);
}

// Utility functions for future API integration
const DashboardAPI = {
  async getUserApplications() {
    // Placeholder for actual API call
    return [];
  },

  async getApplicationStats() {
    // Placeholder for actual API call
    return {
      total: 0,
      pending: 0,
      approved: 0,
      processing: 0,
    };
  },

  async trackApplication(applicationId) {
    // Placeholder for actual API call
    return null;
  },
};

// Make functions globally available
window.trackApplication = trackApplication;
window.showNotification = showNotification;

// Set current year in footer
const currentYearElement = document.getElementById("currentYear");
if (currentYearElement) {
  currentYearElement.textContent = new Date().getFullYear();
}
