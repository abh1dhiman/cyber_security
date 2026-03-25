// frontend/src/services/api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const scanService = {
  // Start a new scan
  startScan: async (targetUrl) => {
    try {
      const response = await api.post('/scans', { target_url: targetUrl });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get scan status
  getScanStatus: async (scanId) => {
    try {
      const response = await api.get(`/scans/${scanId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get all scans
  getAllScans: async () => {
    try {
      const response = await api.get('/scans');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete a scan
  deleteScan: async (scanId) => {
    try {
      const response = await api.delete(`/scans/${scanId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};