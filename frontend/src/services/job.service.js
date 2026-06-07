import api from './api';

export const jobService = {
  getJobs: (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return api.get(`/api/jobs?${params}`);
  },
  getJob: (id) => api.get(`/api/jobs/${id}`),
  createJob: (formData) => {
    return api.post('/api/jobs', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  applyJob: (id) => api.post(`/api/jobs/${id}/apply`),
};
