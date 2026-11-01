import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE,
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

