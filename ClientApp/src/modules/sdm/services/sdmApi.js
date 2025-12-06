/**
 * API service for SDM (System Design Model) operations
 */

const API_BASE = '/api/sdm';

export const sdmApi = {
  /**
   * Get all SDMs
   */
  async getAll() {
    const response = await fetch(API_BASE);
    if (!response.ok) {
      throw new Error('Failed to fetch SDMs');
    }
    return response.json();
  },

  /**
   * Get a single SDM by ID with its elements and connections
   */
  async getById(id) {
    const response = await fetch(`${API_BASE}/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch SDM');
    }
    return response.json();
  },

  /**
   * Create a new SDM
   */
  async create(name) {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });
    if (!response.ok) {
      throw new Error('Failed to create SDM');
    }
    return response.json();
  },

  /**
   * Update SDM name
   */
  async update(id, name) {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });
    if (!response.ok) {
      throw new Error('Failed to update SDM');
    }
    // 204 No Content or empty body - don't try to parse JSON
    const contentType = response.headers.get('content-type');
    if (response.status === 204 || !contentType || !contentType.includes('application/json')) {
      return null;
    }
    return response.json();
  },

  /**
   * Delete an SDM
   */
  async delete(id) {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      throw new Error('Failed to delete SDM');
    }
    return response.ok;
  },

  /**
   * Save element to SDM
   */
  async saveElement(sdmId, element) {
    const response = await fetch(`${API_BASE}/${sdmId}/elements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(element)
    });
    if (!response.ok) {
      throw new Error('Failed to save element');
    }
    // 204 No Content or empty body - don't try to parse JSON
    const contentType = response.headers.get('content-type');
    if (response.status === 204 || !contentType || !contentType.includes('application/json')) {
      return null;
    }
    return response.json();
  },

  /**
   * Save connection to SDM
   */
  async saveConnection(sdmId, connection) {
    const response = await fetch(`${API_BASE}/${sdmId}/connections`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(connection)
    });
    if (!response.ok) {
      throw new Error('Failed to save connection');
    }
    // 204 No Content or empty body - don't try to parse JSON
    const contentType = response.headers.get('content-type');
    if (response.status === 204 || !contentType || !contentType.includes('application/json')) {
      return null;
    }
    return response.json();
  },

  /**
   * Save entire SDM state (elements and connections)
   */
  async saveState(sdmId, elements, connections) {
    const response = await fetch(`${API_BASE}/${sdmId}/state`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ elements, connections })
    });
    if (!response.ok) {
      throw new Error('Failed to save SDM state');
    }
    // 204 No Content or empty body - don't try to parse JSON
    const contentType = response.headers.get('content-type');
    if (response.status === 204 || !contentType || !contentType.includes('application/json')) {
      return null;
    }
    return response.json();
  }
};
