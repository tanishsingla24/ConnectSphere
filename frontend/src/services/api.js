// Default /api uses Vite dev proxy → backend :5000 (works with https:// on LAN)
const API_URL = import.meta.env.VITE_API_URL || '/api';

// Debug: Log the API URL being used
console.log('API_URL loaded:', API_URL);
console.log('Environment:', import.meta.env.MODE);

/**
 * Make API request with token
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} Response data
 */
const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // Check if response has content before parsing JSON
    const contentType = response.headers.get('content-type');
    let data = {};

    if (contentType && contentType.includes('application/json')) {
      const text = await response.text();
      if (text) {
        data = JSON.parse(text);
      }
    } else {
      const text = await response.text();
      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          data = { message: text };
        }
      }
    }

    if (!response.ok) {
      throw new Error(data.message || `HTTP Error: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

/**
 * Authentication API calls
 */
export const authAPI = {
  /**
   * Register a new user
   * @param {Object} userData - { email, password, fullName, interests }
   * @returns {Promise<Object>} { token, user }
   */
  register: async (userData) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  /**
   * Login user
   * @param {string} email
   * @param {string} password
   * @returns {Promise<Object>} { token, user }
   */
  login: async (email, password) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  /**
   * Get current user profile
   * @returns {Promise<Object>} { user }
   */
  getCurrentUser: async () => {
    return apiRequest('/auth/me');
  },

  /**
   * Update user profile
   * @param {Object} userData - { fullName, interests }
   * @returns {Promise<Object>} { user }
   */
  updateProfile: async (userData) => {
    return apiRequest('/auth/me', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },
};

/**
 * Health check
 */
export const healthCheck = async () => {
  try {
    return await apiRequest('/health');
  } catch (error) {
    return null;
  }
};

export const callsAPI = {
  history: async () => {
    return apiRequest('/calls/history');
  },
};

export default { authAPI, healthCheck, callsAPI, apiRequest };
