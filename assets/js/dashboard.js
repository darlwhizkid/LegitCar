// Enhanced Dashboard JavaScript with real API calls (continued)

    // Update timeline
    const timeline = document.getElementById('appTimeline');
    const timelineHTML = application.timeline.map(item => `
      <div class="timeline-item">
        <div class="timeline-date">${new Date(item.date).toLocaleDateString()}</div>
        <div class="timeline-content">
          <h4>${item.status.charAt(0).toUpperCase() + item.status.slice(1)}</h4>
          <p>${item.message}</p>
        </div>
      </div>
    `).join('');
    
    timeline.innerHTML = timelineHTML;
  }

  // New Application Modal
  const newAppBtn = document.getElementById('newAppBtn');
  const newApplicationModal = document.getElementById('newApplicationModal');
  const closeNewAppModal = document.getElementById('closeNewAppModal');
  const submitApplicationBtn = document.getElementById('submitApplicationBtn');

  if (newAppBtn) {
    newAppBtn.addEventListener('click', () => {
      newApplicationModal.style.display = 'block';
    });
  }

  if (closeNewAppModal) {
    closeNewAppModal.addEventListener('click', () => {
      newApplicationModal.style.display = 'none';
    });
  }

  if (submitApplicationBtn) {
    submitApplicationBtn.addEventListener('click', async () => {
      const formData = {
        type: document.getElementById('applicationType').value,
        vehicleInfo: {
          make: document.getElementById('vehicleMake').value,
          model: document.getElementById('vehicleModel').value,
          year: document.getElementById('vehicleYear').value,
          vin: document.getElementById('vehicleVin').value,
          color: document.getElementById('vehicleColor').value
        }
      };

      // Validate form
      if (!formData.type || !formData.vehicleInfo.make || !formData.vehicleInfo.model) {
        showNotification('Please fill in all required fields', 'error');
        return;
      }

      try {
        submitApplicationBtn.disabled = true;
        submitApplicationBtn.textContent = 'Submitting...';

        const result = await apiCall('createApplication', formData);
        
        if (result.success) {
          showNotification('Application submitted successfully!', 'success');
          newApplicationModal.style.display = 'none';
          
          // Reset form
          document.getElementById('newApplicationForm').reset();
          
          // Refresh dashboard
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        }
      } catch (error) {
        showNotification('Failed to submit application', 'error');
      } finally {
        submitApplicationBtn.disabled = false;
        submitApplicationBtn.textContent = 'Submit Application';
      }
    });
  }

  // Support Modal
  const supportBtn = document.getElementById('supportBtn');
  const supportModal = document.getElementById('supportModal');
  const closeSupportModal = document.getElementById('closeSupportModal');
  const submitSupportBtn = document.getElementById('submitSupportBtn');

  if (supportBtn) {
    supportBtn.addEventListener('click', () => {
      supportModal.style.display = 'block';
    });
  }

  if (closeSupportModal) {
    closeSupportModal.addEventListener('click', () => {
      supportModal.style.display = 'none';
    });
  }

  if (submitSupportBtn) {
    submitSupportBtn.addEventListener('click', async () => {
      const subject = document.getElementById('supportSubject').value.trim();
      const message = document.getElementById('supportMessage').value.trim();

      if (!subject || !message) {
        showNotification('Please fill in all fields', 'error');
        return;
      }

      try {
        submitSupportBtn.disabled = true;
        submitSupportBtn.textContent = 'Sending...';

        const result = await apiCall('submitSupport', { subject, message });
        
        if (result.success) {
          showNotification('Support request submitted successfully!', 'success');
          supportModal.style.display = 'none';
          
          // Reset form
          document.getElementById('supportForm').reset();
        }
      } catch (error) {
        showNotification('Failed to submit support request', 'error');
      } finally {
        submitSupportBtn.disabled = false;
        submitSupportBtn.textContent = 'Send Message';
      }
    });
  }

  // Logout functionality
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.clear();
      window.location.href = 'index.html';
    });
  }

  // Close modals when clicking outside
  window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
      e.target.style.display = 'none';
    }
  });

  // API call helper function
  async function apiCall(action, data = {}) {
    const token = localStorage.getItem('userToken');
    
    const response = await fetch('/api/dashboard', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ action, ...data })
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'API call failed');
    }

    return result;
  }

  // Utility functions
  function showLoading(show) {
    const loader = document.getElementById('dashboardLoader');
    if (loader) {
      loader.style.display = show ? 'block' : 'none';
    }
  }

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
    
    document.body.appendChild(notification);
    
    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
      notification.remove();
    });
    
    // Show notification
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 5000);
  }

  // Load additional data on page load
  loadMessages();
  loadApplications();

  async function loadMessages() {
    try {
      const result = await apiCall('getMessages');
      if (result.success) {
        updateMessagesUI(result.data);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  }

  async function loadApplications() {
    try {
      const result = await apiCall('getApplications');
      if (result.success) {
        updateApplicationsUI(result.data);
      }
    } catch (error) {
      console.error('Failed to load applications:', error);
    }
  }

  function updateMessagesUI(messages) {
    const messagesList = document.getElementById('messagesList');
    if (!messagesList) return;

    if (messages.length === 0) {
      messagesList.innerHTML = '<p class="no-messages">No messages to display.</p>';
      return;
    }

    const messagesHTML = messages.slice(0, 5).map(msg => `
      <div class="message-item ${msg.isRead ? 'read' : 'unread'}">
        <div class="message-content">
          <h4>${msg.subject}</h4>
          <p>${msg.message.substring(0, 100)}${msg.message.length > 100 ? '...' : ''}</p>
          <small>${new Date(msg.createdAt).toLocaleDateString()}</small>
        </div>
        ${!msg.isRead ? '<div class="unread-indicator"></div>' : ''}
      </div>
    `).join('');

    messagesList.innerHTML = messagesHTML;
  }

  function updateApplicationsUI(applications) {
    const applicationsList = document.getElementById('applicationsList');
    if (!applicationsList) return;

    if (applications.length === 0) {
      applicationsList.innerHTML = '<p class="no-applications">No applications submitted yet.</p>';
      return;
    }

    const applicationsHTML = applications.slice(0, 5).map(app => `
      <div class="application-item">
        <div class="application-content">
          <h4>Application ${app.applicationId}</h4>
          <p>Type: ${app.type.replace('_', ' ').toUpperCase()}</p>
          <p>Status: <span class="status-${app.status}">${app.status.charAt(0).toUpperCase() + app.status.slice(1)}</span></p>
          <small>Submitted: ${new Date(app.submittedAt).toLocaleDateString()}</small>
        </div>
      </div>
    `).join('');

    applicationsList.innerHTML = applicationsHTML;
  }
});