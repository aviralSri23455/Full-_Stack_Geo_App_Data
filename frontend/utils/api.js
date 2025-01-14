import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'; // Replace with your backend URL

// Axios instance for centralized API configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// User Authentication APIs
export const registerUser = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const loginUser = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const logoutUser = async () => {
  try {
    const response = await api.post('/auth/logout');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// File Upload APIs
export const uploadFile = async (fileData) => {
  try {
    const formData = new FormData();
    formData.append('file', fileData);

    const response = await api.post('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Fetch Uploaded Files
export const fetchUploadedFiles = async () => {
  try {
    const response = await api.get('/files');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Geospatial Data APIs
export const fetchGeoJSONData = async (fileId) => {
  try {
    const response = await api.get(`/files/geojson/${fileId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Save Custom Shapes
export const saveCustomShape = async (shapeData) => {
  try {
    const response = await api.post('/shapes/save', shapeData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Fetch Custom Shapes
export const fetchCustomShapes = async () => {
  try {
    const response = await api.get('/shapes');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export default api;
