// Messages Page JavaScript
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
  const sidebar = document.querySelector('.sidebar');
  
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
  
  // Sample messages data (in a real app, this would come from an API)
  const sampleMessages = [
    {
      id: 1,
      subject: 'Application Status Update',
      sender: 'LegitCar Support',
      content: 'Your vehicle registration application (APP-123456) has been approved. You can now proceed to the next step.',
      date: '2023-06-15',
      isRead: false,
      isImportant: true,
      tags: ['application'],
      attachments: [
        { name: 'approval_letter.pdf', size: '245 KB', type: 'pdf' }
      ]
    },
    {
      id: 2,
      subject: 'Welcome to LegitCar',
      sender: 'LegitCar Team',
      content: 'Thank you for registering with LegitCar. We are excited to have you on board. This platform will help you manage all your vehicle-related applications and documentation.',
      date: '2023-06-10',
      isRead: true,
      isImportant: false,
      tags: ['general'],
      attachments: []
    },
    {
      id: 3,
      subject: 'Document Verification Required',
      sender: 'Verification Department',
      content: 'We need additional documentation for your recent application. Please upload a clear copy of your proof of ownership document.',
      date: '2023-06-12',
      isRead: false,
      isImportant: false,
      tags: ['urgent', 'application'],
      attachments: []
    },
    {
      id: 4,
      subject: 'Payment Confirmation',
      sender: 'Billing Department',
      content: 'This is to confirm that we have received your payment of ₦15,000 for the vehicle registration application. Your receipt is attached.',
      date: '2023-06-08',
      isRead: true,
      isImportant: false,
      tags: ['payment'],
      attachments: [
        { name: 'receipt_123456.pdf', size: '120 KB', type: 'pdf' }
      ]
    },
    {
      id: 5,
      subject: 'System Maintenance Notice',
      sender: 'LegitCar Admin',
      content: 'Our system will be undergoing maintenance on June 20, 2023, from 2:00 AM to 5:00 AM. During this time, the platform may be temporarily unavailable.',
      date: '2023-06-05',
      isRead: true,
      isImportant: false,
      tags: ['system'],
      attachments: []
    }
  ];
  
  // Store messages in localStorage if not already present
  if (!localStorage.getItem(`messages_${userData.email}`)) {
    localStorage.setItem(`messages_${userData.email}`, JSON.stringify(sampleMessages));
  }
  
  // Get messages from localStorage
  let messages = [];
  try {
    messages = JSON.parse(localStorage.getItem(`messages_${userData.email}`)) || [];
  } catch (e) {
    console.error('Error parsing messages:', e);
    messages = [];
  }
  
  // Update unread badge
  function updateUnreadBadge() {
    const unreadBadge = document.getElementById('unreadBadge');
    if (unreadBadge) {
      const unreadCount = messages.filter(msg => !msg.isRead).length;
      unreadBadge.textContent = unreadCount;
      
      if (unreadCount === 0) {
        unreadBadge.style.display = 'none';
      } else {
        unreadBadge.style.display = 'inline';
      }
    }
  }
  
  // Populate message list
  function populateMessageList(filteredMessages = null) {
    const messageList = document.getElementById('messageList');
    if (!messageList) return;
    
    // Clear existing messages
    messageList.innerHTML = '';
    
    // Use filtered messages if provided, otherwise use all messages
    const messagesToShow = filteredMessages || messages;
    
    if (messagesToShow.length === 0) {
      messageList.innerHTML = '<div class="no-messages">No messages found</div>';
      return;
    }
    
    // Sort messages by date (newest first)
    messagesToShow.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Add messages to the list
    messagesToShow.forEach(message => {
      const messageItem = document.createElement('div');
      messageItem.className = `message-item${message.isRead ? '' : ' unread'}`;
      messageItem.dataset.id = message.id;
      
      const date = new Date(message.date);
      const formattedDate = date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
      
      messageItem.innerHTML = `
        <div class="message-preview">
          <h3>${message.subject}</h3>
          <p>${message.sender}</p>
        </div>
        <div class="message-meta">
          <span class="message-date">${formattedDate}</span>
          <div class="message-indicators">
            ${message.attachments.length > 0 ? '<i class="fas fa-paperclip"></i>' : ''}
            ${message.isImportant ? '<i class="fas fa-star"></i>' : ''}
          </div>
        </div>
      `;
      
      // Add click event to show message
      messageItem.addEventListener('click', function() {
        showMessage(message.id);
        
        // Remove active class from all messages
        document.querySelectorAll('.message-item').forEach(item => {
          item.classList.remove('active');
        });
        
        // Add active class to clicked message
        this.classList.add('active');
      });
      
      messageList.appendChild(messageItem);
    });
  }
  
  // Show message content
  function showMessage(messageId) {
    const message = messages.find(msg => msg.id === messageId);
    if (!message) return;
    
    // Update message as read
    if (!message.isRead) {
      message.isRead = true;
      
      // Update in localStorage
      localStorage.setItem(`messages_${userData.email}`, JSON.stringify(messages));
      
      // Update unread badge
      updateUnreadBadge();
      
      // Update message item in list
      const messageItem = document.querySelector(`.message-item[data-id="${messageId}"]`);
      if (messageItem) {
        messageItem.classList.remove('unread');
      }
    }
    
    // Hide empty state and show message view
    document.getElementById('emptyMessage').style.display = 'none';
    document.getElementById('messageView').style.display = 'block';
    
    // Update message content
    document.getElementById('messageSubject').textContent = message.subject;
    document.getElementById('senderName').textContent = message.sender;
    
    const date = new Date(message.date);
    const formattedDate = date.toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'long', 
      day: 'numeric' 
    });
    document.getElementById('messageDate').textContent = formattedDate;
    
    // Update message body
    document.getElementById('messageBody').textContent = message.content;
    
    // Update message tags
    const tagsContainer = document.getElementById('messageTags');
    tagsContainer.innerHTML = '';
    
    message.tags.forEach(tag => {
      const tagElement = document.createElement('span');
      tagElement.className = `message-tag ${tag}`;
      tagElement.textContent = tag.charAt(0).toUpperCase() + tag.slice(1);
      tagsContainer.appendChild(tagElement);
    });
    
    // Update attachments
    const attachmentsContainer = document.getElementById('messageAttachments');
    attachmentsContainer.innerHTML = '';
    
    if (message.attachments.length > 0) {
      message.attachments.forEach(attachment => {
        const attachmentItem = document.createElement('div');
        attachmentItem.className = 'attachment-item';
        
        let iconClass = 'fa-file';
        if (attachment.type === 'pdf') iconClass = 'fa-file-pdf';
        else if (attachment.type === 'doc' || attachment.type === 'docx') iconClass = 'fa-file-word';
        else if (attachment.type === 'xls' || attachment.type === 'xlsx') iconClass = 'fa-file-excel';
        else if (attachment.type === 'jpg' || attachment.type === 'png') iconClass = 'fa-file-image';
        
        attachmentItem.innerHTML = `
          <div class="attachment-icon">
            <i class="fas ${iconClass}"></i>
          </div>
          <div class="attachment-info">
            <div class="attachment-name">${attachment.name}</div>
            <div class="attachment-meta">${attachment.size}</div>
          </div>
          <div class="attachment-actions">
            <button class="attachment-btn" title="Download">
              <i class="fas fa-download"></i>
            </button>
          </div>
        `;
        
        attachmentsContainer.appendChild(attachmentItem);
      });
    } else {
      attachmentsContainer.style.display = 'none';
    }
    
    // Update mark as read/unread button
    const markReadBtn = document.getElementById('markReadBtn');
    if (markReadBtn) {
      markReadBtn.innerHTML = message.isRead ? 
        '<i class="fas fa-envelope"></i>' : 
        '<i class="fas fa-envelope-open"></i>';
      markReadBtn.title = message.isRead ? 'Mark as Unread' : 'Mark as Read';
    }
    
    // Update mark as important button
    const markImportantBtn = document.getElementById('markImportantBtn');
    if (markImportantBtn) {
      markImportantBtn.innerHTML = message.isImportant ? 
        '<i class="fas fa-star"></i>' : 
        '<i class="far fa-star"></i>';
      markImportantBtn.title = message.isImportant ? 'Remove from Important' : 'Mark as Important';
      
      if (message.isImportant) {
          markImportantBtn.classList.add('active');
        } else {
          markImportantBtn.classList.remove('active');
        }
      }
    }
    
    // Filter messages
    function filterMessages(filter) {
      let filteredMessages;
      
      switch (filter) {
        case 'unread':
          filteredMessages = messages.filter(msg => !msg.isRead);
          break;
        case 'important':
          filteredMessages = messages.filter(msg => msg.isImportant);
          break;
        default:
          filteredMessages = messages;
      }
      
      populateMessageList(filteredMessages);
    }
    
    // Initialize message list
    populateMessageList();
    updateUnreadBadge();
    
    // Filter buttons functionality
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
      button.addEventListener('click', function() {
        // Remove active class from all filter buttons
        filterButtons.forEach(btn => btn.classList.remove('active'));
        
        // Add active class to clicked button
        this.classList.add('active');
        
        // Filter messages
        const filter = this.getAttribute('data-filter');
        filterMessages(filter);
      });
    });
    
    // Search functionality
    const searchInput = document.getElementById('messageSearch');
    const searchBtn = document.getElementById('searchBtn');
    
    function searchMessages(query) {
      if (!query) {
        populateMessageList();
        return;
      }
      
      query = query.toLowerCase();
      const filteredMessages = messages.filter(msg => 
        msg.subject.toLowerCase().includes(query) || 
        msg.sender.toLowerCase().includes(query) || 
        msg.content.toLowerCase().includes(query)
      );
      
      populateMessageList(filteredMessages);
    }
    
    if (searchBtn) {
      searchBtn.addEventListener('click', function() {
        searchMessages(searchInput.value);
      });
    }
    
    if (searchInput) {
      searchInput.addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
          searchMessages(this.value);
        }
      });
    }
    
        // Mark as read/unread functionality
        const markReadBtn = document.getElementById('markReadBtn');
        if (markReadBtn) {
          markReadBtn.addEventListener('click', function() {
            const activeMessageItem = document.querySelector('.message-item.active');
            if (!activeMessageItem) return;
            
            const messageId = parseInt(activeMessageItem.dataset.id);
            const message = messages.find(msg => msg.id === messageId);
            
            if (message) {
              // Toggle read status
              message.isRead = !message.isRead;
              
              // Update UI
              if (message.isRead) {
                activeMessageItem.classList.remove('unread');
                this.innerHTML = '<i class="fas fa-envelope"></i>';
                this.title = 'Mark as Unread';
              } else {
                activeMessageItem.classList.add('unread');
                this.innerHTML = '<i class="fas fa-envelope-open"></i>';
                this.title = 'Mark as Read';
              }
              
              // Update in localStorage
              localStorage.setItem(`messages_${userData.email}`, JSON.stringify(messages));
              
              // Update unread badge
              updateUnreadBadge();
            }
          });
        }
        
        // Mark as important functionality
        const markImportantBtn = document.getElementById('markImportantBtn');
        if (markImportantBtn) {
          markImportantBtn.addEventListener('click', function() {
            const activeMessageItem = document.querySelector('.message-item.active');
            if (!activeMessageItem) return;
            
            const messageId = parseInt(activeMessageItem.dataset.id);
            const message = messages.find(msg => msg.id === messageId);
            
            if (message) {
              // Toggle important status
              message.isImportant = !message.isImportant;
              
              // Update UI
              if (message.isImportant) {
                this.innerHTML = '<i class="fas fa-star"></i>';
                this.title = 'Remove from Important';
                this.classList.add('active');
                
                // Add star icon to message item
                const indicators = activeMessageItem.querySelector('.message-indicators');
                if (indicators && !indicators.querySelector('.fa-star')) {
                  const starIcon = document.createElement('i');
                  starIcon.className = 'fas fa-star';
                  indicators.appendChild(starIcon);
                }
              } else {
                this.innerHTML = '<i class="far fa-star"></i>';
                this.title = 'Mark as Important';
                this.classList.remove('active');
                
                // Remove star icon from message item
                const starIcon = activeMessageItem.querySelector('.message-indicators .fa-star');
                if (starIcon) {
                  starIcon.remove();
                }
              }
              
              // Update in localStorage
              localStorage.setItem(`messages_${userData.email}`, JSON.stringify(messages));
            }
          });
        }
        
        // Delete message functionality
        const deleteMessageBtn = document.getElementById('deleteMessageBtn');
        if (deleteMessageBtn) {
          deleteMessageBtn.addEventListener('click', function() {
            const activeMessageItem = document.querySelector('.message-item.active');
            if (!activeMessageItem) return;
            
            const messageId = parseInt(activeMessageItem.dataset.id);
            
            // Confirm deletion
            if (confirm('Are you sure you want to delete this message?')) {
              // Remove message from array
              messages = messages.filter(msg => msg.id !== messageId);
              
              // Update in localStorage
              localStorage.setItem(`messages_${userData.email}`, JSON.stringify(messages));
              
              // Remove message item from UI
              activeMessageItem.remove();
              
              // Show empty state if no messages left
              if (messages.length === 0) {
                document.getElementById('messageList').innerHTML = '<div class="no-messages">No messages found</div>';
              }
              
              // Hide message view and show empty state
              document.getElementById('messageView').style.display = 'none';
              document.getElementById('emptyMessage').style.display = 'flex';
              
              // Update unread badge
              updateUnreadBadge();
            }
          });
        }
        
        // Reply functionality
        const replyBtn = document.getElementById('replyBtn');
        const replyForm = document.getElementById('replyForm');
        const cancelReplyBtn = document.getElementById('cancelReplyBtn');
        const sendReplyBtn = document.getElementById('sendReplyBtn');
        
        if (replyBtn) {
          replyBtn.addEventListener('click', function() {
            replyForm.style.display = 'block';
            document.getElementById('replyMessage').focus();
          });
        }
        
        if (cancelReplyBtn) {
          cancelReplyBtn.addEventListener('click', function() {
            replyForm.style.display = 'none';
            document.getElementById('replyMessage').value = '';
          });
        }
        
        if (sendReplyBtn) {
          sendReplyBtn.addEventListener('click', function() {
            const replyMessage = document.getElementById('replyMessage').value;
            if (!replyMessage.trim()) {
              alert('Please enter a reply message.');
              return;
            }
            
            const activeMessageItem = document.querySelector('.message-item.active');
            if (!activeMessageItem) return;
            
            const messageId = parseInt(activeMessageItem.dataset.id);
            const originalMessage = messages.find(msg => msg.id === messageId);
            
            if (originalMessage) {
              // In a real app, this would send the reply to the server
              alert('Your reply has been sent.');
              
              // Clear and hide reply form
              document.getElementById('replyMessage').value = '';
              replyForm.style.display = 'none';
            }
          });
        }
        
        // Compose message functionality
        const composeBtn = document.getElementById('composeBtn');
        const composeModal = document.getElementById('composeModal');
        const closeComposeModal = document.getElementById('closeComposeModal');
        const cancelComposeBtn = document.getElementById('cancelComposeBtn');
        const composeForm = document.getElementById('composeForm');
        
        // Load user applications for the related application dropdown
        function loadUserApplications() {
          const relatedApplicationSelect = document.getElementById('relatedApplication');
          if (!relatedApplicationSelect) return;
          
          // Clear existing options except the first one
          while (relatedApplicationSelect.options.length > 1) {
            relatedApplicationSelect.remove(1);
          }
          
          // Get user applications from localStorage
          const userApplications = JSON.parse(localStorage.getItem(`applications_${userData.email}`)) || [];
          
          // Add applications to dropdown
          userApplications.forEach(app => {
            const option = document.createElement('option');
            option.value = app.id;
            option.textContent = `${app.type} (${app.id})`;
            relatedApplicationSelect.appendChild(option);
          });
        }
        
        if (composeBtn) {
          composeBtn.addEventListener('click', function() {
            // Load user applications
            loadUserApplications();
            
            // Show compose modal
            composeModal.style.display = 'block';
          });
        }
        
        if (closeComposeModal) {
          closeComposeModal.addEventListener('click', function() {
            composeModal.style.display = 'none';
          });
        }
        
        if (cancelComposeBtn) {
          cancelComposeBtn.addEventListener('click', function() {
            composeModal.style.display = 'none';
          });
        }
        
        // Close modal when clicking outside
        window.addEventListener('click', function(event) {
          if (event.target === composeModal) {
            composeModal.style.display = 'none';
          }
        });
        
        if (composeForm) {
          composeForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const recipient = document.getElementById('messageRecipient').value;
            const subject = document.getElementById('messageSubjectInput').value;
            const content = document.getElementById('messageContent').value;
            const relatedApplication = document.getElementById('relatedApplication').value;
            
            if (!recipient || !subject || !content) {
              alert('Please fill in all required fields.');
              return;
            }
            
            // In a real app, this would send the message to the server
            alert('Your message has been sent.');
            
            // Reset form and close modal
            composeForm.reset();
            composeModal.style.display = 'none';
          });
        }
    });
    
