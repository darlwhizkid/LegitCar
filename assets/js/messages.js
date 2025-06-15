// Messages Page JavaScript - Propamit
document.addEventListener('DOMContentLoaded', function() {
  console.log('Messages page loading...');
  
  // Check authentication
  const token = localStorage.getItem('userToken');
  const userEmail = localStorage.getItem('userEmail');
  const userName = localStorage.getItem('userName');
  
  if (!token) {
    console.log('No token found, redirecting to login');
    window.location.href = 'login.html';
    return;
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
  
  // Global variables
  let currentMessages = [];
  let selectedMessage = null;
  let currentFilter = 'all';
  
  // DOM Elements
  const messageList = document.getElementById('messageList');
  const messagesLoading = document.getElementById('messagesLoading');
  const noMessages = document.getElementById('noMessages');
  const messageEmptyState = document.getElementById('messageEmptyState');
  const messageView = document.getElementById('messageView');
  const messageSearch = document.getElementById('messageSearch');
  const filterButtons = document.querySelectorAll('.filter-btn');
  const composeBtn = document.getElementById('composeBtn');
  const composeModal = document.getElementById('composeModal');
  const closeComposeModal = document.getElementById('closeComposeModal');
  const cancelComposeBtn = document.getElementById('cancelComposeBtn');
  const sendMessageBtn = document.getElementById('sendMessageBtn');
  const replyBtn = document.getElementById('replyBtn');
  const replyForm = document.getElementById('replyForm');
  const cancelReplyBtn = document.getElementById('cancelReplyBtn');
  const sendReplyBtn = document.getElementById('sendReplyBtn');
  const markImportantBtn = document.getElementById('markImportantBtn');
  const archiveBtn = document.getElementById('archiveBtn');
  const deleteBtn = document.getElementById('deleteBtn');
  
  // Stats elements
  const totalMessagesElement = document.getElementById('totalMessages');
  const unreadMessagesElement = document.getElementById('unreadMessages');
  const importantMessagesElement = document.getElementById('importantMessages');
  const archivedMessagesElement = document.getElementById('archivedMessages');
  const messagesBadge = document.getElementById('messagesBadge');
  
  // Initialize page
  init();
  
  async function init() {
    try {
      await loadMessages();
      setupEventListeners();
      updateStats();
    } catch (error) {
      console.error('Error initializing messages page:', error);
      showNotification('Error loading messages', 'error');
    }
  }
  
  // Load messages from backend
  async function loadMessages() {
    try {
      showLoading(true);
      
      // Mock API call - replace with actual backend endpoint
      const response = await fetch('/api/messages', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to load messages');
      }
      
      const data = await response.json();
      currentMessages = data.messages || [];
      
      renderMessages();
      showLoading(false);
      
    } catch (error) {
      console.error('Error loading messages:', error);
      
      // Use mock data for development
      currentMessages = getMockMessages();
      renderMessages();
      showLoading(false);
    }
  }
  
  // Mock messages data for development
  function getMockMessages() {
    return [
      {
        id: 1,
        sender: 'Support Team',
        subject: 'Welcome to Propamit',
        preview: 'Thank you for joining Propamit. Here\'s everything you need to know to get started...',
        body: 'Dear ' + (userName || 'User') + ',\n\nWelcome to Propamit! We\'re excited to have you on board.\n\nHere are some quick tips to get you started:\n\n1. Complete your profile information\n2. Upload your documents\n3. Start your first application\n\nIf you have any questions, don\'t hesitate to reach out to our support team.\n\nBest regards,\nThe Propamit Team',
        date: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        read: false,
        important: false,
        archived: false,
        tags: ['welcome', 'getting-started'],
        attachments: []
      },
      {
        id: 2,
        sender: 'Administrator',
        subject: 'Document Verification Update',
        preview: 'Your submitted documents have been reviewed. Please check the status in your dashboard...',
        body: 'Hello,\n\nWe have completed the review of your submitted documents.\n\nStatus: Approved\n\nYou can now proceed with your application. All documents have been verified and are ready for processing.\n\nNext steps:\n- Review your application details\n- Submit any additional required information\n- Track your application progress\n\nThank you for your patience.',
        date: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        read: true,
        important: true,
        archived: false,
        tags: ['documents', 'verification'],
        attachments: [
          {
            name: 'verification_report.pdf',
            size: '245 KB',
            type: 'pdf'
          }
        ]
      },
      {
        id: 3,
        sender: 'Billing Department',
        subject: 'Payment Confirmation',
        preview: 'Your payment has been successfully processed. Transaction ID: TXN123456789...',
        body: 'Dear Customer,\n\nThis is to confirm that your payment has been successfully processed.\n\nTransaction Details:\n- Amount: ₦25,000.00\n- Transaction ID: TXN123456789\n- Date: ' + new Date().toLocaleDateString() + '\n- Method: Bank Transfer\n\nYour application will now proceed to the next stage. You will receive updates as your application progresses.\n\nThank you for choosing Propamit.',
        date: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
        read: true,
        important: false,
        archived: false,
        tags: ['payment', 'billing'],
        attachments: [
          {
            name: 'payment_receipt.pdf',
            size: '156 KB',
            type: 'pdf'
          }
        ]
      },
      {
        id: 4,
        sender: 'Support Team',
        subject: 'Application Status Update',
        preview: 'Your vehicle registration application #VR2024001 has been updated...',
        body: 'Hello,\n\nWe wanted to update you on the status of your vehicle registration application.\n\nApplication ID: VR2024001\nCurrent Status: In Progress\nEstimated Completion: 5-7 business days\n\nWhat\'s happening now:\n- Documents are being processed\n- Verification with relevant authorities\n- Final review and approval\n\nWe\'ll notify you immediately once your application is complete.\n\nBest regards,\nPropamit Support Team',
        date: new Date(Date.now() - 432000000).toISOString(), // 5 days ago
        read: false,
        important: true,
        archived: false,
        tags: ['application', 'status-update'],
        attachments: []
      },
      {
        id: 5,
        sender: 'System Notification',
        subject: 'Security Alert: New Login Detected',
        preview: 'We detected a new login to your account from a new device...',
        body: 'Security Alert\n\nWe detected a new login to your Propamit account:\n\nDevice: Chrome on Windows\nLocation: Lagos, Nigeria\nTime: ' + new Date(Date.now() - 86400000).toLocaleString() + '\n\nIf this was you, you can ignore this message. If you don\'t recognize this activity, please:\n\n1. Change your password immediately\n2. Review your account activity\n3. Contact our support team\n\nYour account security is important to us.\n\nPropamit Security Team',
        date: new Date(Date.now() - 518400000).toISOString(), // 6 days ago
        read: true,
        important: false,
        archived: true,
        tags: ['security', 'login'],
        attachments: []
      }
    ];
  }

  function setupEventListeners() {
    // Sidebar toggle
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    const mobileOverlay = document.getElementById('mobileOverlay');
    
    if (sidebarToggle) {
      sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('active');
        mobileOverlay.classList.toggle('active');
      });
    }
    
    // Search functionality
    if (messageSearch) {
      messageSearch.addEventListener('input', handleSearch);
    }
    
    // Filter buttons
    filterButtons.forEach(btn => {
      btn.addEventListener('click', handleFilter);
    });
    
    // Compose modal
    if (composeBtn) {
      composeBtn.addEventListener('click', openComposeModal);
    }
    
    if (closeComposeModal) {
      closeComposeModal.addEventListener('click', closeComposeModalHandler);
    }
    
    if (cancelComposeBtn) {
      cancelComposeBtn.addEventListener('click', closeComposeModalHandler);
    }
    
    if (sendMessageBtn) {
      sendMessageBtn.addEventListener('click', sendMessage);
    }
    
    // Reply functionality
    if (replyBtn) {
      replyBtn.addEventListener('click', showReplyForm);
    }
    
    if (cancelReplyBtn) {
      cancelReplyBtn.addEventListener('click', hideReplyForm);
    }
    
    if (sendReplyBtn) {
      sendReplyBtn.addEventListener('click', sendReply);
    }
    
    // Message actions
    if (markImportantBtn) {
      markImportantBtn.addEventListener('click', toggleImportant);
    }
    
    if (archiveBtn) {
      archiveBtn.addEventListener('click', archiveMessage);
    }
    
    if (deleteBtn) {
      deleteBtn.addEventListener('click', deleteMessage);
    }
    
    // Logout functionality
    const logoutBtn = document.getElementById('logoutBtn');
    const headerLogoutBtn = document.getElementById('headerLogoutBtn');
    
    if (logoutBtn) {
      logoutBtn.addEventListener('click', handleLogout);
    }
    
    if (headerLogoutBtn) {
      headerLogoutBtn.addEventListener('click', handleLogout);
    }
    
    // User menu toggle
    const userMenuToggle = document.getElementById('userMenuToggle');
    const userDropdown = document.getElementById('userDropdown');
    
    if (userMenuToggle) {
      userMenuToggle.addEventListener('click', () => {
        userDropdown.classList.toggle('show');
      });
    }
    
    // Close modal when clicking outside
    if (composeModal) {
      composeModal.addEventListener('click', function(e) {
        if (e.target === composeModal) {
          closeComposeModalHandler();
        }
      });
    }
  }

  function showLoading(show = true) {
    if (messagesLoading) {
      messagesLoading.style.display = show ? 'block' : 'none';
    }
    if (messageList && show) {
      messageList.style.display = 'none';
    }
  }

  function showNotification(message, type = 'info') {
    // Create notification element if it doesn't exist
    let notification = document.querySelector('.notification');
    if (!notification) {
      notification = document.createElement('div');
      notification.className = 'notification';
      document.body.appendChild(notification);
    }
    
    notification.textContent = message;
    notification.className = `notification ${type} show`;
    
    setTimeout(() => {
      notification.classList.remove('show');
    }, 3000);
  }

  function renderMessages() {
    if (!messageList) return;
    
    const filteredMessages = getFilteredMessages();
    
    if (filteredMessages.length === 0) {
      showEmptyState();
      return;
    }
    
    messageList.innerHTML = '';
    
    filteredMessages.forEach(message => {
      const messageElement = createMessageElement(message);
      messageList.appendChild(messageElement);
    });
    
    hideEmptyState();
  }

  function getFilteredMessages() {
    let filtered = currentMessages;
    
    // Apply filter
    if (currentFilter !== 'all') {
      filtered = filtered.filter(message => {
        switch (currentFilter) {
          case 'unread':
            return !message.read;
          case 'important':
            return message.important;
          case 'archived':
            return message.archived;
          default:
            return true;
        }
      });
    }
    
    // Apply search
    const searchTerm = messageSearch ? messageSearch.value.toLowerCase() : '';
    if (searchTerm) {
      filtered = filtered.filter(message => 
        message.subject.toLowerCase().includes(searchTerm) ||
        message.sender.toLowerCase().includes(searchTerm) ||
        message.preview.toLowerCase().includes(searchTerm)
      );
    }
    
    return filtered;
  }

  function createMessageElement(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message-item ${!message.read ? 'unread' : ''} ${message.important ? 'important' : ''}`;
    messageDiv.dataset.messageId = message.id;
    
    const date = new Date(message.date);
    const formattedDate = formatDate(date);
    
    messageDiv.innerHTML = `
      <div class="message-sender">${escapeHtml(message.sender)}</div>
      <div class="message-subject">${escapeHtml(message.subject)}</div>
      <div class="message-preview">${escapeHtml(message.preview)}</div>
      <div class="message-date">${formattedDate}</div>
      ${message.attachments && message.attachments.length > 0 ? '<div class="message-attachment-icon"><i class="fas fa-paperclip"></i></div>' : ''}
    `;
    
    messageDiv.addEventListener('click', () => selectMessage(message));
    
    return messageDiv;
  }

  function updateStats() {
    const total = currentMessages.length;
    const unread = currentMessages.filter(m => !m.read).length;
    const important = currentMessages.filter(m => m.important).length;
    const archived = currentMessages.filter(m => m.archived).length;
    
    if (totalMessagesElement) totalMessagesElement.textContent = total;
    if (unreadMessagesElement) unreadMessagesElement.textContent = unread;
    if (importantMessagesElement) importantMessagesElement.textContent = important;
    if (archivedMessagesElement) archivedMessagesElement.textContent = archived;
    if (messagesBadge) messagesBadge.textContent = unread;
  }

  function showEmptyState() {
    if (noMessages) {
      noMessages.style.display = 'block';
    }
    if (messageList) {
      messageList.style.display = 'none';
    }
  }

  function hideEmptyState() {
    if (noMessages) {
      noMessages.style.display = 'none';
    }
    if (messageList) {
      messageList.style.display = 'block';
    }
  }

  // Event handler functions
  function handleSearch() {
    renderMessages();
  }

  function handleFilter(e) {
    filterButtons.forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');
    currentFilter = e.target.dataset.filter;
    renderMessages();
  }

  function openComposeModal() {
    if (composeModal) {
      composeModal.style.display = 'block';
    }
  }

  function closeComposeModalHandler() {
    if (composeModal) {
      composeModal.style.display = 'none';
    }
    // Reset form
    const form = document.getElementById('composeForm');
    if (form) {
      form.reset();
    }
  }

  function sendMessage() {
    const to = document.getElementById('composeTo').value;
    const subject = document.getElementById('composeSubject').value;
    const message = document.getElementById('composeMessage').value;
    
    if (!to || !subject || !message) {
      showNotification('Please fill in all required fields', 'error');
      return;
    }
    
    // Here you would send the message to the backend
    showNotification('Message sent successfully!', 'success');
    closeComposeModalHandler();
  }

  function selectMessage(message) {
    selectedMessage = message;
    
    // Mark as read if unread
    if (!message.read) {
      message.read = true;
      updateStats();
    }
    
    // Update UI
    document.querySelectorAll('.message-item').forEach(item => {
      item.classList.remove('selected');
    });
    
    const messageElement = document.querySelector(`[data-message-id="${message.id}"]`);
    if (messageElement) {
      messageElement.classList.add('selected');
      messageElement.classList.remove('unread');
    }
    
    displayMessage(message);
  }

  function displayMessage(message) {
    const messageSubject = document.getElementById('messageSubject');
    const messageSender = document.getElementById('messageSender');
    const messageDate = document.getElementById('messageDate');
    const messageBody = document.getElementById('messageBody');
    const messageTags = document.getElementById('messageTags');
    const messageAttachments = document.getElementById('messageAttachments');
    const attachmentList = document.getElementById('attachmentList');
    
    if (messageSubject) messageSubject.textContent = message.subject;
    if (messageSender) messageSender.textContent = message.sender;
    if (messageDate) messageDate.textContent = formatDate(new Date(message.date));
    if (messageBody) messageBody.innerHTML = escapeHtml(message.body).replace(/\n/g, '<br>');
    
    // Handle tags
    if (messageTags && message.tags) {
      messageTags.innerHTML = message.tags.map(tag => 
        `<span class="message-tag">${escapeHtml(tag)}</span>`
      ).join('');
    }
    
    // Handle attachments
    if (messageAttachments && attachmentList) {
      if (message.attachments && message.attachments.length > 0) {
        attachmentList.innerHTML = message.attachments.map(att => `
          <div class="attachment-item">
            <i class="fas fa-file"></i>
            <span class="attachment-name">${escapeHtml(att.name)}</span>
            <span class="attachment-size">(${att.size})</span>
          </div>
        `).join('');
        messageAttachments.style.display = 'block';
      } else {
        messageAttachments.style.display = 'none';
      }
    }
    
    // Update action buttons
    updateActionButtons(message);
    
    // Show message view
    if (messageEmptyState) messageEmptyState.style.display = 'none';
    if (messageView) messageView.style.display = 'block';
  }

  function updateActionButtons(message) {
    if (markImportantBtn) {
      markImportantBtn.innerHTML = message.important ? 
        '<i class="fas fa-star"></i>' : '<i class="far fa-star"></i>';
    }
  }

  // Action handlers
  function showReplyForm() {
    if (replyForm) {
      replyForm.style.display = 'block';
    }
  }

  function hideReplyForm() {
    if (replyForm) {
      replyForm.style.display = 'none';
    }
    const replyText = document.getElementById('replyText');
    if (replyText) {
      replyText.value = '';
    }
  }

  function sendReply() {
    const replyText = document.getElementById('replyText');
    if (!replyText || !replyText.value.trim()) {
      showNotification('Please enter a reply message', 'error');
      return;
    }
    
    showNotification('Reply sent successfully!', 'success');
    hideReplyForm();
  }

  function toggleImportant() {
    if (!selectedMessage) return;
    
    selectedMessage.important = !selectedMessage.important;
    updateActionButtons(selectedMessage);
    updateStats();
    renderMessages();
    
    showNotification(
      selectedMessage.important ? 'Message marked as important' : 'Message unmarked as important',
      'success'
    );
  }

  function archiveMessage() {
    if (!selectedMessage) return;
    
    selectedMessage.archived = !selectedMessage.archived;
    updateStats();
    renderMessages();
    
    showNotification(
      selectedMessage.archived ? 'Message archived' : 'Message unarchived',
      'success'
    );
  }

  function deleteMessage() {
    if (!selectedMessage) return;
    
    if (confirm('Are you sure you want to delete this message?')) {
      currentMessages = currentMessages.filter(m => m.id !== selectedMessage.id);
      selectedMessage = null;
      
      if (messageView) messageView.style.display = 'none';
      if (messageEmptyState) messageEmptyState.style.display = 'block';
      
      updateStats();
      renderMessages();
      showNotification('Message deleted successfully', 'success');
    }
  }

  function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
      localStorage.clear();
      window.location.href = 'login.html';
    }
  }

  // Utility functions
  function formatDate(date) {
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return `${days} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
});