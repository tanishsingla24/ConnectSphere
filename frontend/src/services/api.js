const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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

    const data = await response.json();

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

export default { authAPI, healthCheck, apiRequest };
