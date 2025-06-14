// Messages Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
  console.log('Page loaded');
  
  // Consistent authentication check
  const token = localStorage.getItem('token');
  const currentUser = localStorage.getItem('currentUser');
  
  if (!token || !currentUser) {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isAuthenticated');
    window.location.href = 'login.html';
    return;
  }
  
  const userData = JSON.parse(localStorage.getItem('currentUser')) || {};
  
  // Update user greeting
  const userGreeting = document.getElementById('userGreeting');
  if (userGreeting && userData) {
    userGreeting.textContent = `Welcome, ${userData.name || 'User'}`;
  }
  
  // Set current year
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
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
      localStorage.removeItem('isAuthenticated');
      window.location.href = 'index.html';
    });
  }

  // Sidebar toggle
  const sidebarToggle = document.querySelector('.sidebar-toggle');
  const dashboardContainer = document.querySelector('.dashboard-container');
  
  if (sidebarToggle && dashboardContainer) {
    sidebarToggle.addEventListener('click', function() {
      dashboardContainer.classList.toggle('sidebar-collapsed');
    });
  }

  // Messages functionality
  const messagesList = document.getElementById('messagesList');
  const messageView = document.getElementById('messageView');
  const searchInput = document.getElementById('searchInput');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const composeBtn = document.getElementById('composeBtn');
  const composeModal = document.getElementById('composeModal');
  const closeComposeModal = document.getElementById('closeComposeModal');
  const cancelCompose = document.getElementById('cancelCompose');
  const sendMessage = document.getElementById('sendMessage');

  let currentFilter = 'all';
  let selectedMessage = null;

  // Sample messages data
  const messagesData = [
    {
      id: 1,
      sender: 'Support Team',
      email: 'support@propamit.com',
      subject: 'Application Status Update',
      preview: 'Your vehicle registration application has been processed and approved...',
      content: 'Dear User,\n\nWe are pleased to inform you that your vehicle registration application has been processed and approved. Your documents are ready for collection.\n\nBest regards,\nSupport Team',
      time: '2 hours ago',
      unread: true,
      important: false,
      tags: ['Application', 'Approved']
    },
    {
      id: 2,
      sender: 'Admin',
      email: 'admin@propamit.com',
      subject: 'System Maintenance Notice',
      preview: 'Scheduled maintenance will be performed on our systems this weekend...',
      content: 'Dear User,\n\nWe will be performing scheduled maintenance on our systems this weekend from 2:00 AM to 6:00 AM. During this time, some services may be temporarily unavailable.\n\nWe apologize for any inconvenience.\n\nBest regards,\nAdmin Team',
      time: '1 day ago',
      unread: false,
      important: true,
      tags: ['System', 'Maintenance']
    },
    {
      id: 3,
      sender: 'Billing',
      email: 'billing@propamit.com',
      subject: 'Payment Confirmation',
      preview: 'Thank you for your payment. Your transaction has been completed successfully...',
      content: 'Dear User,\n\nThank you for your payment of ₦15,000 for vehicle registration services. Your transaction has been completed successfully.\n\nTransaction ID: TXN123456789\n\nBest regards,\nBilling Department',
      time: '3 days ago',
      unread: true,
      important: false,
      tags: ['Payment', 'Confirmed']
    },
    {
      id: 4,
      sender: 'Support Team',
      email: 'support@propamit.com',
      subject: 'Welcome to Propamit',
      preview: 'Welcome to Propamit! We are excited to have you on board...',
      content: 'Dear User,\n\nWelcome to Propamit! We are excited to have you on board. Our platform makes vehicle documentation simple and efficient.\n\nIf you have any questions, please don\'t hesitate to contact us.\n\nBest regards,\nSupport Team',
      time: '1 week ago',
      unread: false,
      important: false,
      tags: ['Welcome']
    }
  ];

  let currentMessages = messagesData;

  function renderMessagesList() {
    if (!messagesList) return;

    let filteredMessages = currentMessages;

    if (currentFilter === 'unread') {
      filteredMessages = currentMessages.filter(msg => msg.unread);
    } else if (currentFilter === 'important') {
      filteredMessages = currentMessages.filter(msg => msg.important);
    }

    if (filteredMessages.length === 0) {
      messagesList.innerHTML = `
        <div class="no-messages">
          <div class="no-messages-icon">
            <i class="fas fa-inbox"></i>
          </div>
          <h3>No messages found</h3>
          <p>There are no messages matching your current filter.</p>
        </div>
      `;
      return;
    }

    messagesList.innerHTML = filteredMessages.map(message => `
      <div class="message-item ${message.unread ? 'unread' : ''}" data-id="${message.id}">
        <div class="message-header">
          <div class="message-sender">
            ${message.sender}
            ${message.important ? '<i class="fas fa-star" style="color: #f59e0b;"></i>' : ''}
          </div>
          <div class="message-time">${message.time}</div>
        </div>
        <div class="message-subject">${message.subject}</div>
        <div class="message-preview">${message.preview}</div>
        <div class="message-indicators">
          ${message.important ? '<div class="message-indicator important"><i class="fas fa-star"></i></div>' : ''}
        </div>
      </div>
    `).join('');

    // Add click handlers
    document.querySelectorAll('.message-item').forEach(item => {
      item.addEventListener('click', function() {
        const messageId = parseInt(this.dataset.id);
        selectMessage(messageId);
      });
    });
  }

  function selectMessage(messageId) {
    const message = messagesData.find(msg => msg.id === messageId);
    if (!message) return;

    selectedMessage = message;

    // Mark as read
    if (message.unread) {
      message.unread = false;
      updateUnreadBadge();
      renderMessagesList();
    }

    // Update active state
    document.querySelectorAll('.message-item').forEach(item => {
      item.classList.remove('active');
    });
    document.querySelector(`[data-id="${messageId}"]`).classList.add('active');

    // Show message content
    messageView.innerHTML = `
      <div class="message-content active">
        <div class="message-content-header">
          <div class="message-actions">
            <button class="action-btn" onclick="replyToMessage()" title="Reply">
              <i class="fas fa-reply"></i>
            </button>
            <button class="action-btn" onclick="toggleImportant()" title="Mark Important">
              <i class="fas fa-star ${message.important ? 'active' : ''}"></i>
            </button>
            <button class="action-btn danger" onclick="deleteMessage()" title="Delete">
              <i class="fas fa-trash"></i>
            </button>
          </div>
          
          <div class="message-info">
            <div class="sender-avatar">${message.sender.charAt(0)}</div>
            <div class="sender-details">
              <h3>${message.sender}</h3>
              <p class="sender-email">${message.email}</p>
            </div>
            <div class="message-date">${message.time}</div>
          </div>
        </div>
        
        <div class="message-content-body">
          <h2 class="message-subject-display">${message.subject}</h2>
          
          <div class="message-tags">
            ${message.tags.map(tag => `<span class="message-tag ${tag.toLowerCase()}">${tag}</span>`).join('')}
          </div>
          
          <div class="message-text">
            ${message.content.split('\n').map(line => `<p>${line}</p>`).join('')}
          </div>
        </div>
        
        <div class="reply-section">
          <button class="btn btn-primary" onclick="showReplyForm()">
            <i class="fas fa-reply"></i>
            Reply
          </button>
          
          <div class="reply-form" id="replyForm">
            <textarea class="reply-textarea" placeholder="Type your reply here..." id="replyTextarea"></textarea>
            <div class="reply-actions">
              <button class="btn btn-secondary" onclick="hideReplyForm()">Cancel</button>
              <button class="btn btn-primary" onclick="sendReply()">
                <i class="fas fa-paper-plane"></i>
                Send Reply
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function updateUnreadBadge() {
    const unreadCount = messagesData.filter(msg => msg.unread).length;
    const badge = document.getElementById('unreadBadge');
    if (badge) {
      if (unreadCount > 0) {
        badge.textContent = unreadCount;
        badge.style.display = 'inline-block';
      } else {
        badge.style.display = 'none';
      }
    }

    // Update filter counts
    const allCount = messagesData.length;
    const importantCount = messagesData.filter(msg => msg.important).length;
    
    document.querySelector('[data-filter="all"] .count').textContent = allCount;
    document.querySelector('[data-filter="unread"] .count').textContent = unreadCount;
    document.querySelector('[data-filter="important"] .count').textContent = importantCount;
  }

  // Filter functionality
  filterBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      filterBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      currentFilter = this.dataset.filter;
      renderMessagesList();
    });
  });

  // Search functionality
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      const searchTerm = this.value.toLowerCase();
      
      if (searchTerm === '') {
        currentMessages = messagesData;
      } else {
        currentMessages = messagesData.filter(message => 
          message.sender.toLowerCase().includes(searchTerm) ||
          message.subject.toLowerCase().includes(searchTerm) ||
          message.content.toLowerCase().includes(searchTerm)
        );
      }
      
      renderMessagesList();
    });
  }

  // Compose modal functionality
  if (composeBtn && composeModal) {
    composeBtn.addEventListener('click', function() {
      composeModal.classList.add('active');
    });
  }

  if (closeComposeModal) {
    closeComposeModal.addEventListener('click', function() {
      composeModal.classList.remove('active');
    });
  }

  if (cancelCompose) {
    cancelCompose.addEventListener('click', function() {
      composeModal.classList.remove('active');
    });
  }

  // Close modal when clicking outside
  if (composeModal) {
    composeModal.addEventListener('click', function(e) {
      if (e.target === composeModal) {
        composeModal.classList.remove('active');
      }
    });
  }

  // Send message functionality
  if (sendMessage) {
    sendMessage.addEventListener('click', function() {
      const recipient = document.getElementById('recipientSelect').value;
      const subject = document.getElementById('messageSubject').value;
      const priority = document.getElementById('messagePriority').value;
      const content = document.getElementById('messageContent').value;

      if (!recipient || !subject || !content) {
        showNotification('Please fill in all required fields', 'error');
        return;
      }

      // Simulate sending message
      showNotification('Message sent successfully!', 'success');
      
      // Clear form
      document.getElementById('recipientSelect').value = '';
      document.getElementById('messageSubject').value = '';
      document.getElementById('messagePriority').value = 'normal';
      document.getElementById('messageContent').value = '';
      
      // Close modal
      composeModal.classList.remove('active');
    });
  }

  // Global functions for message actions
  window.replyToMessage = function() {
    showReplyForm();
  };

  window.toggleImportant = function() {
    if (selectedMessage) {
      selectedMessage.important = !selectedMessage.important;
      selectMessage(selectedMessage.id);
      renderMessagesList();
      showNotification(
        selectedMessage.important ? 'Message marked as important' : 'Message unmarked as important',
        'success'
      );
    }
  };

  window.deleteMessage = function() {
    if (selectedMessage && confirm('Are you sure you want to delete this message?')) {
      const index = messagesData.findIndex(msg => msg.id === selectedMessage.id);
      if (index > -1) {
        messagesData.splice(index, 1);
        currentMessages = messagesData;
        renderMessagesList();
        updateUnreadBadge();
        
        // Show placeholder
        messageView.innerHTML = `
          <div class="message-placeholder">
            <div class="placeholder-icon">
              <i class="fas fa-envelope-open"></i>
            </div>
            <h3>Select a message to read</h3>
            <p>Choose a message from the list to view its contents</p>
          </div>
        `;
        
        selectedMessage = null;
        showNotification('Message deleted successfully', 'success');
      }
    }
  };

  window.showReplyForm = function() {
    const replyForm = document.getElementById('replyForm');
    if (replyForm) {
      replyForm.classList.add('active');
      document.getElementById('replyTextarea').focus();
    }
  };

  window.hideReplyForm = function() {
    const replyForm = document.getElementById('replyForm');
    if (replyForm) {
      replyForm.classList.remove('active');
      document.getElementById('replyTextarea').value = '';
    }
  };

  window.sendReply = function() {
    const replyText = document.getElementById('replyTextarea').value;
    
    if (!replyText.trim()) {
      showNotification('Please enter a reply message', 'error');
      return;
    }

    // Simulate sending reply
    showNotification('Reply sent successfully!', 'success');
    hideReplyForm();
  };

  // Notification function
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
          <i class="fas ${type === 'success' ? 'fa-check' : type === 'error' ? 'fa-times' : 'fa-info'}"></i>
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
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
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
        .notification.warning { border-left: 4px solid #f59e0b; }
        .notification.info { border-left: 4px solid #2563eb; }
        .notification-content { display: flex; align-items: flex-start; gap: 12px; }
        .notification-icon { width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; flex-shrink: 0; }
        .notification.success .notification-icon { background: #d1fae5; color: #10b981; }
        .notification.error .notification-icon { background: #fee2e2; color: #ef4444; }
        .notification.warning .notification-icon { background: #fef3c7; color: #f59e0b; }
        .notification.info .notification-icon { background: #dbeafe; color: #2563eb; }
        .notification-text { flex: 1; font-size: 14px; color: #334155; font-weight: 500; line-height: 1.4; }
        .notification-close { background: none; border: none; color: #94a3b8; cursor: pointer; padding: 4px; border-radius: 6px; transition: all 0.2s ease; display: flex; align-items: center; justify-content: center; width: 24px; height: 24px; }
        .notification-close:hover { color: #64748b; background: #f1f5f9; }
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

  // Initialize
  renderMessagesList();
  updateUnreadBadge();
});