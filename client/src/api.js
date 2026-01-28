const API_URL = import.meta.env.VITE_API_URL || '/api';

class API {
  constructor() {
    this.baseURL = API_URL;
  }

  getHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers
      }
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth endpoints
  async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  }

  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  // Orphanage endpoints
  async getOrphanages(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`/orphanages?${params}`);
  }

  async getOrphanage(id) {
    return this.request(`/orphanages/${id}`);
  }

  async createOrphanage(data) {
    return this.request('/orphanages', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateOrphanageStatus(id, status, notes) {
    return this.request(`/orphanages/${id}/verify`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes })
    });
  }

  async getStats() {
    return this.request('/orphanages/stats/overview');
  }

  // Document endpoints
  async uploadDocument(formData) {
    const token = localStorage.getItem('token');
    return fetch(`${this.baseURL}/documents/upload`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` })
      },
      body: formData
    }).then(res => res.json());
  }

  async getDocuments(orphanageId) {
    return this.request(`/documents/orphanage/${orphanageId}`);
  }

  async verifyDocument(id, status, rejectionReason) {
    return this.request(`/documents/${id}/verify`, {
      method: 'PATCH',
      body: JSON.stringify({ status, rejection_reason: rejectionReason })
    });
  }

  async getPendingDocuments() {
    return this.request('/documents/pending');
  }
}

export default new API();
