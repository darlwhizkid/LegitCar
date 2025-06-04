// Real API implementation for production
window.propamitAPI = {
  baseURL: '/api',
  
  isAuthenticated: () => {
    const token = localStorage.getItem('userToken');
    if (!token) return false;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp > Date.now() / 1000;
    } catch {
      return false;
    }
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
  },

  register: async (userData) => {
    const response = await fetch(`${window.propamitAPI.baseURL}/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'register',
        ...userData
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }

    return data;
  },

  login: async (credentials) => {
    const response = await fetch(`${window.propamitAPI.baseURL}/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'login',
        ...credentials
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    // Store auth data
    localStorage.setItem('userToken', data.token);
    localStorage.setItem('currentUser', JSON.stringify(data.user));

    return data;
  },

  forgotPassword: async (email) => {
    const response = await fetch(`${window.propamitAPI.baseURL}/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'forgot-password',
        email
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to send reset email');
    }

    return data;
  },

  logout: () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('currentUser');
    return Promise.resolve({ success: true });
  }
};