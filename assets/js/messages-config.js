// Messages Configuration
const MESSAGES_CONFIG = {
  // API endpoints (for future implementation)
  API_BASE_URL: '/api/v1',
  ENDPOINTS: {
    MESSAGES: '/messages',
    SEND_MESSAGE: '/messages/send',
    MARK_READ: '/messages/mark-read',
    DELETE_MESSAGE: '/messages/delete',
    UPLOAD_ATTACHMENT: '/messages/upload'
  },
  
  // UI Configuration
  MESSAGES_PER_PAGE: 50,
  AUTO_REFRESH_INTERVAL: 30000, // 30 seconds
  NOTIFICATION_DURATION: 5000, // 5 seconds
  
  // File upload limits
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_FILE_TYPES: [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ],
  
  // Message categories
  MESSAGE_TYPES: {
    SYSTEM: 'system',
    SUPPORT: 'support',
    NOTIFICATION: 'notification',
    APPLICATION_UPDATE: 'application_update',
    BILLING: 'billing',
    MARKETING: 'marketing'
  },
  
  // Priority levels
  PRIORITY_LEVELS: {
    LOW: 'low',
    NORMAL: 'normal',
    HIGH: 'high',
    URGENT: 'urgent'
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MESSAGES_CONFIG;
}