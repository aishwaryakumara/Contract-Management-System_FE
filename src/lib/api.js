// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * API Client with automatic token handling
 */
export const apiClient = {
  /**
   * Make an API request with automatic token injection
   */
  async request(endpoint, options = {}) {
    // Get token from localStorage
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    // Prepare headers
    const headers = {
      ...options.headers,
    };
    
    // Add Authorization header if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Add Content-Type for JSON requests (unless it's FormData)
    if (options.body && !(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });
      
      const data = await response.json();
      
      // Handle unauthorized responses
      if (response.status === 401) {
        // Clear token and redirect to login
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      }
      
      return {
        success: response.ok,
        status: response.status,
        data: data,
      };
    } catch (error) {
      console.error('API Request Error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  },
  
  /**
   * GET request
   */
  async get(endpoint) {
    return this.request(endpoint, {
      method: 'GET',
    });
  },
  
  /**
   * POST request
   */
  async post(endpoint, body) {
    return this.request(endpoint, {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  },
  
  /**
   * PUT request
   */
  async put(endpoint, body) {
    return this.request(endpoint, {
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  },
  
  /**
   * DELETE request
   */
  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  },
};

/**
 * Auth API calls
 */
export const authAPI = {
  async login(email, password) {
    return apiClient.post('/auth/login', { email, password });
  },
  
  async getCurrentUser() {
    return apiClient.get('/auth/me');
  },
};

/**
 * Contracts API calls
 */
export const contractsAPI = {
  async getAll() {
    return apiClient.get('/contracts');
  },
  
  async getById(id) {
    return apiClient.get(`/contracts/${id}`);
  },
  
  async create(formData) {
    return apiClient.post('/contracts', formData);
  },
  
  async update(id, formData) {
    return apiClient.put(`/contracts/${id}`, formData);
  },
  
  async uploadDocument(contractId, formData) {
    return apiClient.post(`/contracts/${contractId}/documents`, formData);
  },
  
  async renew(contractId, formData) {
    return apiClient.post(`/contracts/${contractId}/renew`, formData);
  },
  
  async extractData(formData) {
    return apiClient.post('/contracts/extract', formData);
  },
  
  async getHistory(contractId) {
    return apiClient.get(`/contracts/${contractId}/history`);
  },
};

/**
 * Documents API calls
 */
export const documentsAPI = {
  async delete(documentId) {
    return apiClient.delete(`/documents/${documentId}`);
  },
  
  async download(documentId, filename) {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      
      const response = await fetch(`${API_BASE_URL}/documents/${documentId}/download`, {
        method: 'GET',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      
      if (!response.ok) {
        // Try to get error message
        let errorMsg = 'Download failed';
        try {
          const error = await response.json();
          errorMsg = error.error || errorMsg;
        } catch (e) {
          errorMsg = `Download failed (${response.status})`;
        }
        console.error('Download error:', errorMsg, 'Status:', response.status);
        throw new Error(errorMsg);
      }
      
      // Get the blob
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      return { success: true };
    } catch (error) {
      console.error('Download error:', error);
      return { success: false, error: error.message };
    }
  },
};

/**
 * Lookup APIs - Contract Types and Statuses
 */
export const lookupsAPI = {
  async getContractTypes() {
    return apiClient.get('/contract-types');
  },
  
  async getContractStatuses() {
    return apiClient.get('/contract-status');
  },
};
