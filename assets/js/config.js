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
        window.location.href = 'login.html';
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
        window.location.href = 'login.html';
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

  // Show notification
  showNotification: (message, type = 'info', duration = 5000) => {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-message">${message}</span>
        <button class="notification-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after duration
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, duration);
  }
};

// Export for use in other modules (if using modules)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    API_CONFIG,
    ApiService,
    ApplicationTracker,
    DocumentService,
    MessageService,
    Utils
  };
}
