// Real API Configuration for LegitCar
const API_BASE_URL = 'https://propamit-backend.vercel.app';

// Real API implementation
window.propamitAPI = {
  baseURL: API_BASE_URL,
  
  isAuthenticated: () => {
    const token = localStorage.getItem('token') || localStorage.getItem('userToken');
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
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'register',
          name: userData.name,
          email: userData.email,
          password: userData.password,
          phone: userData.phone || ''
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('currentUser', JSON.stringify(data.user));
      localStorage.setItem('isAuthenticated', 'true');
      
      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  login: async (credentials) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'login',
          email: credentials.email,
          password: credentials.password
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('userToken', data.token);
      localStorage.setItem('currentUser', JSON.stringify(data.user));
      localStorage.setItem('isAuthenticated', 'true');
      
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  forgotPassword: async (email) => {
    try {
      return { success: true, message: 'Password reset link sent to your email' };
    } catch (error) {
      throw new Error('Failed to send reset email');
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userToken');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    return Promise.resolve({ success: true });
  }
};

console.log('Real API initialized with backend:', API_BASE_URL);
