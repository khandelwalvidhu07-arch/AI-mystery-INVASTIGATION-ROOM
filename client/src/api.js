import axios from 'axios';

function getApiBaseUrl() {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && envUrl.trim()) {
    // If accessing from another LAN device and envUrl is hardcoded to localhost, adapt to current hostname
    if (typeof window !== 'undefined' && window.location.hostname && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      if (envUrl.includes('localhost') || envUrl.includes('127.0.0.1')) {
        return `http://${window.location.hostname}:5000/api`;
      }
    }
    return envUrl;
  }

  if (typeof window !== 'undefined' && window.location.hostname) {
    return `http://${window.location.hostname}:5000/api`;
  }
  return 'http://localhost:5000/api';
}

export const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json'
  }
});

export const getCases = () => api.get('/cases').then(res => res.data);
export const createCase = (data) => api.post('/cases', data).then(res => res.data);
export const getCase = (id) => api.get(`/cases/${id}`).then(res => res.data);
export const discoverClue = (caseId, clueId) => api.post(`/cases/${caseId}/clues/${clueId}/discover`).then(res => res.data);
export const requestHint = (caseId) => api.post(`/cases/${caseId}/hints`).then(res => res.data);
export const submitAccusation = (caseId, suspectId) => api.post(`/cases/${caseId}/accuse`, { suspectId }).then(res => res.data);
export const getCaseResult = (caseId) => api.get(`/cases/${caseId}/result`).then(res => res.data);
