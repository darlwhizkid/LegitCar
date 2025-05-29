// API Configuration and Service
class PropamitAPI {
  constructor() {
    this.baseURL = 'http://localhost:3000/api';
    this.token = localStorage.getItem('token');
  }

  // Set authorization header
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  // Generic API call method
  async apiCall(endpoint, options = {}) {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const config = {
        headers: this.getHeaders(),
        ...options
      };

      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Authentication methods
  async register(userData) {
    const response = await this.apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });

    if (response.success) {
      this.token = response.token;
      localStorage.setItem('token', response.token);
      localStorage.setItem('currentUser', JSON.stringify(response.user));
    }

    return response;
  }

  async login(credentials) {
    const response = await this.apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });

    if (response.success) {
      this.token = response.token;
      localStorage.setItem('token', response.token);
      localStorage.setItem('currentUser', JSON.stringify(response.user));
    }

    return response;
  }

  async logout() {
    try {
      await this.apiCall('/auth/logout', {
        method: 'POST'
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.token = null;
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
      localStorage.removeItem('isAuthenticated');
    }
  }

  async getMe() {
    return await this.apiCall('/auth/me');
  }

  async updateProfile(userData) {
    return await this.apiCall('/auth/updatedetails', {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
  }

  async updatePassword(passwordData) {
    return await this.apiCall('/auth/updatepassword', {
      method: 'PUT',
      body: JSON.stringify(passwordData)
    });
  }

  async forgotPassword(email) {
    return await this.apiCall('/auth/forgotpassword', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  }

  // Application methods
  async createApplication(applicationData) {
    return await this.apiCall('/applications', {
      method: 'POST',
      body: JSON.stringify(applicationData)
    });
  }

  async getMyApplications(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/applications?${queryString}` : '/applications';
    return await this.apiCall(endpoint);
  }

  async getApplication(id) {
    return await this.apiCall(`/applications/${id}`);
  }

  async trackApplication(applicationNumber) {
    return await this.apiCall(`/applications/track/${applicationNumber}`);
  }

  async addNote(applicationId, message) {
    return await this.apiCall(`/applications/${applicationId}/notes`, {
      method: 'POST',
      body: JSON.stringify({ message })
    });
  }

  // File upload methods
  async uploadDocument(applicationId, file, documentName) {
    const formData = new FormData();
    formData.append('document', file);
    if (documentName) {
      formData.append('documentName', documentName);
    }

    const headers = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseURL}/upload/document/${applicationId}`, {
      method: 'POST',
      headers,
      body: formData
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Upload failed');
    }

    return data;
  }

  // Utility methods
  isAuthenticated() {
    return !!this.token && !!localStorage.getItem('currentUser');
  }

  getCurrentUser() {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
  }
}

// Create global API instance
window.propamitAPI = new PropamitAPI();