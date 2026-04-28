import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api'
});

export function setAuthToken(token) {
  if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;
  else delete api.defaults.headers.common.Authorization;
}

export async function login(email, password) {
  const response = await api.post('/login', { email, password });
  return response.data;
}

export async function fetchLogs() {
  const response = await api.get('/logs');
  return response.data;
}

export async function fetchSummary() {
  const response = await api.get('/summary');
  return response.data;
}

export async function createLog(payload) {
  const response = await api.post('/log-workout', payload);
  return response.data;
}

export async function editLog(rowNumber, payload) {
  const response = await api.put(`/logs/${rowNumber}`, payload);
  return response.data;
}

export async function removeLog(rowNumber) {
  const response = await api.delete(`/logs/${rowNumber}`);
  return response.data;
}

export function getExportUrl() {
  return `${api.defaults.baseURL}/export-data`;
}

export default api;
