// Create this new file for API configuration
const API_CONFIG = {
  BASE_URL: window.location.hostname === 'localhost' 
    ? 'http://localhost:3000' 
    : 'https://your-api-domain.com',
  ENDPOINTS: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    PROFILE: '/api/user/profile',
    APPLICATIONS: '/api/applications',
    UPLOAD: '/api/upload'
  }
};

// API helper functions
class ApiService {
  static async request(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      ...options
    };
    
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, config);
      
      if (response.status === 401) {
        // Token expired, redirect to login
        localStorage.clear();
        window.location.href = 'login.html';
        return;
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
}