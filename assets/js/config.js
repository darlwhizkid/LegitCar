// API Configuration for Propamit
const API_CONFIG = {
  BASE_URL: window.location.hostname === 'localhost' 
    ? 'http://localhost:3000' 
    : 'https://propamit-backend.vercel.app',
  ENDPOINTS: {
    LOGIN: '/api/auth',
    REGISTER: '/api/auth',
    LOGOUT: '/api/auth/logout',
    PROFILE: '/api/user/profile',
    APPLICATIONS: '/api/applications',
    DOCUMENTS: '/api/documents',
    MESSAGES: '/api/messages',
    UPLOAD: '/api/upload',
    TRACK_APPLICATION: '/api/applications/track'
  }
};

// Enhanced API Service with improved error handling
class ApiService {
  static async request(endpoint, options = {}) {
    const token = localStorage.getItem('userToken');
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      ...options
    };
    
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, config);
      
      if (response.status === 401) {
        // Token expired, clear storage and redirect to login
        localStorage.removeItem('userToken');
        localStorage.removeItem('tokenExpiry');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userName');
        localStorage.removeItem('userId');
        localStorage.removeItem('lastApplicationId');
        
        // Only redirect if not already on login page
        if (!window.location.pathname.includes('login.html')) {
          window.location.href = 'login.html';
        }
        return;
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }
  
  static async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }
  
  static async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
  
  static async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }
  
  static async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // File upload method for handling multipart/form-data
  static async uploadFile(endpoint, formData) {
    const token = localStorage.getItem('userToken');
    
    const config = {
      method: 'POST',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` })
        // Don't set Content-Type for FormData, let browser set it with boundary
      },
      body: formData
    };
    
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, config);
      
      if (response.status === 401) {
        localStorage.removeItem('userToken');
        localStorage.removeItem('tokenExpiry');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userName');
        localStorage.removeItem('userId');
        localStorage.removeItem('lastApplicationId');
        
        if (!window.location.pathname.includes('login.html')) {
          window.location.href = 'login.html';
        }
        return;
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('File Upload Error:', error);
      throw error;
    }
  }
}

// Application tracking service
class ApplicationTracker {
  static async createApplication(applicationData) {
    try {
      const response = await ApiService.post(API_CONFIG.ENDPOINTS.APPLICATIONS, {
        ...applicationData,
        status: 'submitted',
        submittedAt: new Date().toISOString()
      });
      
      if (response.success && response.application) {
        // Store application ID for tracking
        const applicationId = response.application.id || response.application._id;
        const trackingNumber = response.application.trackingNumber || applicationId;
        
        localStorage.setItem('lastApplicationId', applicationId);
        localStorage.setItem('lastTrackingNumber', trackingNumber);
        
        return {
          success: true,
          applicationId: applicationId,
          trackingNumber: trackingNumber,
          message: 'Application submitted successfully'
        };
      }
      
      throw new Error(response.message || 'Failed to create application');
    } catch (error) {
      console.error('Application creation error:', error);
      throw error;
    }
  }
  
  static async trackApplication(applicationId) {
    try {
      const response = await ApiService.get(`${API_CONFIG.ENDPOINTS.TRACK_APPLICATION}/${applicationId}`);
      return response;
    } catch (error) {
      console.error('Application tracking error:', error);
      throw error;
    }
  }
  
  static async trackByNumber(trackingNumber) {
    try {
      const response = await ApiService.get(`${API_CONFIG.ENDPOINTS.TRACK_APPLICATION}/number/${trackingNumber}`);
      return response;
    } catch (error) {
      console.error('Application tracking by number error:', error);
      throw error;
    }
  }
  
  static async getUserApplications() {
    try {
      const response = await ApiService.get(API_CONFIG.ENDPOINTS.APPLICATIONS);
      return response;
    } catch (error) {
      console.error('Get applications error:', error);
      throw error;
    }
  }

  static async updateApplicationStatus(applicationId, status, notes = '') {
    try {
      const response = await ApiService.put(`${API_CONFIG.ENDPOINTS.APPLICATIONS}/${applicationId}/status`, {
        status,
        notes,
        updatedAt: new Date().toISOString()
      });
      return response;
    } catch (error) {
      console.error('Update application status error:', error);
      throw error;
    }
  }

  static async deleteApplication(applicationId) {
    try {
      const response = await ApiService.delete(`${API_CONFIG.ENDPOINTS.APPLICATIONS}/${applicationId}`);
      return response;
    } catch (error) {
      console.error('Delete application error:', error);
      throw error;
    }
  }
}

// Document management service
class DocumentService {
  static async uploadDocument(file, documentType, applicationId = null) {
    try {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('type', documentType);
      if (applicationId) {
        formData.append('applicationId', applicationId);
      }
      
      const response = await ApiService.uploadFile(API_CONFIG.ENDPOINTS.DOCUMENTS, formData);
      return response;
    } catch (error) {
      console.error('Document upload error:', error);
      throw error;
    }
  }

  static async getUserDocuments() {
    try {
      const response = await ApiService.get(API_CONFIG.ENDPOINTS.DOCUMENTS);
      return response;
    } catch (error) {
      console.error('Get documents error:', error);
      throw error;
    }
  }

  static async deleteDocument(documentId) {
    try {
      const response = await ApiService.delete(`${API_CONFIG.ENDPOINTS.DOCUMENTS}/${documentId}`);
      return response;
    } catch (error) {
      console.error('Delete document error:', error);
      throw error;
    }
  }
}

// Message service
class MessageService {
  static async getUserMessages() {
    try {
      const response = await ApiService.get(API_CONFIG.ENDPOINTS.MESSAGES);
      return response;
    } catch (error) {
      console.error('Get messages error:', error);
      throw error;
    }
  }

  static async sendMessage(messageData) {
    try {
      const response = await ApiService.post(`${API_CONFIG.ENDPOINTS.MESSAGES}/send`, messageData);
      return response;
    } catch (error) {
      console.error('Send message error:', error);
      throw error;
    }
  }

  static async markMessageAsRead(messageId) {
    try {
      const response = await ApiService.put(`${API_CONFIG.ENDPOINTS.MESSAGES}/${messageId}/read`, {
        readAt: new Date().toISOString()
      });
      return response;
    } catch (error) {
      console.error('Mark message as read error:', error);
      throw error;
    }
  }
}

// Utility functions
const Utils = {
  // Generate unique tracking number
  generateTrackingNumber: () => {
    const prefix = 'PM'; // Propamit prefix
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    return `${prefix}${timestamp}${random}`;
  },

  // Format date for display
  formatDate: (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  // Validate file type and size
  validateFile: (file, maxSize = 10 * 1024 * 1024) => { // 10MB default
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(file.type)) {
      throw new Error('File type not allowed. Please upload PDF, DOC, DOCX, or image files.');
    }

    if (file.size > maxSize) {
      throw new Error(`File size too large. Maximum size is ${maxSize / (1024 * 1024)}MB.`);
    }

    return true;
  },

  // Show notification with enhanced styling
  showNotification: (message, type = 'info', duration = 5000) => {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.propamit-notification');
    existingNotifications.forEach(notification => notification.remove());

    const notification = document.createElement('div');
    notification.className = `propamit-notification notification-${type}`;
    
    // Icon based on type
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };
    
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-icon">${icons[type] || icons.info}</span>
        <span class="notification-message">${message}</span>
        <button class="notification-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
      </div>
    `;
    
    // Enhanced styles
    const colors = {
      success: { bg: '#4caf50', border: '#45a049' },
      error: { bg: '#f44336', border: '#da190b' },
      warning: { bg: '#ff9800', border: '#f57c00' },
      info: { bg: '#2196f3', border: '#0b7dda' }
    };
    
    const color = colors[type] || colors.info;
    
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${color.bg};
      border-left: 4px solid ${color.border};
      color: white;
      padding: 15px 20px;
      border-radius: 5px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      max-width: 400px;
      min-width: 300px;
      font-family: 'Poppins', sans-serif;
      font-size: 14px;
      animation: slideInRight 0.3s ease-out;
      transition: all 0.3s ease;
    `;
    
    // Add CSS animation if not exists
    if (!document.getElementById('propamit-notification-styles')) {
      const style = document.createElement('style');
      style.id = 'propamit-notification-styles';
      style.textContent = `
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
        .propamit-notification .notification-content {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .propamit-notification .notification-icon {
          font-weight: bold;
          font-size: 16px;
        }
        .propamit-notification .notification-message {
          flex: 1;
        }
        .propamit-notification .notification-close {
          background: none;
          border: none;
          color: white;
          font-size: 18px;
          cursor: pointer;
          padding: 0;
          margin-left: 10px;
          opacity: 0.8;
          transition: opacity 0.2s;
        }
        .propamit-notification .notification-close:hover {
          opacity: 1;
        }
      `;
      document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Auto remove after duration
    setTimeout(() => {
      if (notification.parentElement) {
        notification.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => notification.remove(), 300);
      }
    }, duration);
  },

  // Loading spinner utility
  showLoading: (message = 'Loading...') => {
    const existingLoader = document.getElementById('propamit-loader');
    if (existingLoader) existingLoader.remove();

    const loader = document.createElement('div');
    loader.id = 'propamit-loader';
    loader.innerHTML = `
      <div class="loader-backdrop">
        <div class="loader-content">
          <div class="loader-spinner"></div>
          <div class="loader-message">${message}</div>
        </div>
      </div>
    `;

    loader.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 99999;
    `;

    // Add loader styles if not exists
    if (!document.getElementById('propamit-loader-styles')) {
      const style = document.createElement('style');
      style.id = 'propamit-loader-styles';
      style.textContent = `
        .loader-backdrop {
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          height: 100%;
        }
        .loader-content {
          background: white;
          padding: 30px;
          border-radius: 10px;
          text-align: center;
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        }
        .loader-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #2196f3;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 15px;
        }
        .loader-message {
          font-family: 'Poppins', sans-serif;
          color: #333;
          font-size: 16px;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(loader);
    return loader;
  },

  hideLoading: () => {
    const loader = document.getElementById('propamit-loader');
    if (loader) loader.remove();
  },

  // Format currency
  formatCurrency: (amount, currency = 'NGN') => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: currency
    }).format(amount);
  },

  // Debounce function for search inputs
  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Copy to clipboard
  copyToClipboard: async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      Utils.showNotification('Copied to clipboard!', 'success', 2000);
      return true;
    } catch (err) {
      console.error('Failed to copy: ', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        Utils.showNotification('Copied to clipboard!', 'success', 2000);
        return true;
      } catch (fallbackErr) {
        Utils.showNotification('Failed to copy to clipboard', 'error');
        return false;
      } finally {
        document.body.removeChild(textArea);
      }
    }
  },

  // Validate email
  validateEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Validate phone number (Nigerian format)
  validatePhone: (phone) => {
    const phoneRegex = /^(\+234|234|0)?[789][01]\d{8}$/;
    return phoneRegex.test(phone.replace(/\s+/g, ''));
  },

  // Format phone number
  formatPhone: (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('234')) {
      return `+${cleaned}`;
    } else if (cleaned.startsWith('0')) {
      return `+234${cleaned.substring(1)}`;
    }
    return `+234${cleaned}`;
  }
};

// Authentication helper
const AuthHelper = {
  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('userToken');
    const expiry = localStorage.getItem('tokenExpiry');
    
    if (!token || !expiry) return false;
    
    // Check if token is expired
    if (new Date().getTime() > parseInt(expiry)) {
      AuthHelper.clearAuth();
      return false;
    }
    
    return true;
  },

  // Get current user info
  getCurrentUser: () => {
    if (!AuthHelper.isAuthenticated()) return null;
    
    return {
      email: localStorage.getItem('userEmail'),
      name: localStorage.getItem('userName'),
      id: localStorage.getItem('userId'),
      token: localStorage.getItem('userToken')
    };
  },

  // Clear authentication data
  clearAuth: () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('tokenExpiry');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('userId');
    localStorage.removeItem('lastApplicationId');
    localStorage.removeItem('lastTrackingNumber');
  },

  // Set authentication data
  setAuth: (userData) => {
    if (userData.token) {
      localStorage.setItem('userToken', userData.token);
      
      // Set token expiry (24 hours from now)
      const expiry = new Date().getTime() + (24 * 60 * 60 * 1000);
      localStorage.setItem('tokenExpiry', expiry.toString());
    }
    
    if (userData.user) {
      localStorage.setItem('userEmail', userData.user.email);
      localStorage.setItem('userName', userData.user.name);
      localStorage.setItem('userId', userData.user.id || userData.user._id);
    }
  },

  // Redirect to login if not authenticated
  requireAuth: () => {
    if (!AuthHelper.isAuthenticated()) {
      window.location.href = 'login.html';
      return false;
    }
    return true;
  }
};

// Make everything globally available
window.API_CONFIG = {
  BASE_URL: 'https://propamit-backend.vercel.app',
  ENDPOINTS: {
    LOGIN: '/api/auth',
    REGISTER: '/api/auth',
    LOGOUT: '/api/auth/logout',
    PROFILE: '/api/user/profile',
    APPLICATIONS: '/api/applications',
    DOCUMENTS: '/api/documents',
    MESSAGES: '/api/messages',
    UPLOAD: '/api/upload',
    TRACK_APPLICATION: '/api/applications/track'
  }
};

window.ApiService = ApiService;
window.ApplicationTracker = ApplicationTracker;
window.DocumentService = DocumentService;
window.MessageService = MessageService;
window.Utils = Utils;
window.AuthHelper = AuthHelper;

// Export for use in other modules (if using modules)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    API_CONFIG,
    ApiService,
    ApplicationTracker,
    DocumentService,
    MessageService,
    Utils,
    AuthHelper
  };
}

console.log('API Config loaded:', window.API_CONFIG);
console.log('Available services: ApiService, ApplicationTracker, DocumentService, MessageService, Utils, AuthHelper');