// frontend/services/api.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('userToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error("[API Error]", error.response.status, error.response.data);
    } else if (error.request) {
      console.error("[API Network Error] Could not reach server at " + API_URL);
      console.error("1. Check if Laptop and Phone are on same Wi-Fi.");
      console.error("2. Check if Firewall is blocking Port 8000.");
    } else {
      console.error("[API Error]", error.message);
    }
    return Promise.reject(error);
  }
);
// --- 1. AUTH & FARMER ---
export const AuthAPI = {
  signup: async (userData: any) => {
    const response = await api.post('/auth/signup', userData);
    return response.data;
  },
  login: async (credentials: any) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  getUser: async (userId: number) => {
    const response = await api.get(`/auth/user/${userId}`);
    return response.data;
  },
};

export const CollectorAPI = {
  getStats: async (userId: number) => {
    try {
      const res = await api.get(`/farmers/${userId}/stats`);
      return res.data;
    } catch (e) { return { batches: 0, tokens: 0, zone: "Offline" }; }
  },
  uploadBatch: async (formData: FormData) => {
    const response = await api.post('/batches/create', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  getHistory: async (userId: number) => {
    const res = await api.get(`/batches/farmer/${userId}`);
    return res.data;
  }
};

// --- 2. REGULATOR (Government) ---
export const RegulatorAPI = {
  getMapData: async () => {
    try {
      const res = await api.get('/regulator/map-data');
      return res.data;
    } catch (e) {
      console.error("Map Fetch Error", e);
      return [];
    }
  },
  getAlerts: async () => (await api.get('/regulator/alerts')).data,
  getThresholds: async () => (await api.get('/regulator/thresholds')).data,
  setThresholds: async (payload: { max_harvest_limit: string; banned_regions?: string }) => {
    return (await api.post('/regulator/thresholds', null, { params: payload })).data;
  },
  updateThresholds: async (payload: { max_harvest_limit: number; banned_regions?: string }) => {
    return (await api.post('/regulator/thresholds', null, { params: payload })).data;
  },
  exportData: async () => `${API_URL}/regulator/export`,
  sendMessage: async (payload: { farmer_id: number; message: string; priority?: string }) => {
    return (await api.post('/regulator/message', null, { params: payload })).data;
  },
  getMessages: async () => (await api.get('/regulator/messages')).data,
};

// --- 3. PROCESSOR (Lab) ---
export const ProcessorAPI = {
  getBatch: async (batchId: string) => (await api.get(`/batches/${batchId}`)).data,
  uploadReport: async (batchId: string, formData: FormData) => {
    return (await api.post(`/processor/lab-report/${batchId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })).data;
  },
    saveGrading: async (batchId: string, gradingData: any) => {
    return (await api.post(`/processor/save-grading/${batchId}`, gradingData)).data;
  },

  updateStatus: async (batchId: string, status: string) => {
    return (await api.put(`/processor/status/${batchId}`, null, { params: { status } })).data;
  }
};

// --- 4. CONSUMER (Public) ---
export const ConsumerAPI = {
  getStory: async (batchId: string) => {
    try {
      const res = await api.get(`/consumer/story/${batchId}`);
      return res.data;
    } catch (e) {
      console.error("Story Error", e);
      return null;
    }
  }
};

// Surplus/NGO Actions
export const SurplusAPI = {
  getAvailable: async () => (await api.get('/surplus/available')).data,
    getClaimed: async () => (await api.get('/surplus/claimed')).data,
  donateBatch: async (batchId: string) => (await api.post(`/surplus/donate/${batchId}`)).data,
  scanExpiring: async () => (await api.post('/surplus/scan-expiring')).data,
  claimBatch: async (batchId: string, ngoId: number) => (await api.post(`/surplus/claim/${batchId}?ngo_id=${ngoId}`)).data,
};

export const AiAPI = {
  analyzeImage: async (formData: FormData) => (await api.post('/ai/analyze', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
  })).data,
  analyzeBatch: async (batchId: string) => (await api.post(`/ai/analyze-batch/${batchId}`)).data,
};

export const NotificationsAPI = {
  getForUser: async (userId: number) => (await api.get(`/farmers/${userId}/notifications`)).data,
};

// --- Blockchain (TraceRoots contract) ---
export const BlockchainAPI = {
  verifyBatch: async (batchId: string) => (await api.get(`/blockchain/batch/${batchId}`)).data,
  registerBatch: async (batchId: string) => (await api.post(`/blockchain/register/${batchId}`)).data,
};

export default api;
