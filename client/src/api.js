import axios from 'axios';

function getApiBaseUrl() {
  if (typeof window !== 'undefined') {
    // If deployed on Vercel or any HTTPS site, use relative /api on the same domain
    if (window.location.hostname.includes('vercel.app') || window.location.protocol === 'https:') {
      return '/api';
    }
    // If accessing from another LAN device (e.g. phone on same Wi-Fi)
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      return `http://${window.location.hostname}:5000/api`;
    }
  }

  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && envUrl.trim() && !envUrl.includes('localhost')) {
    return envUrl;
  }

  // Local development fallback (Vite proxy forwards /api to backend port 5000)
  return '/api';
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
