import api from './api';

export const communityService = {
  getCommunities: (page = 1) => api.get(`/api/communities?page=${page}`),
  getCommunity: (slug) => api.get(`/api/communities/${slug}`),
  createCommunity: (formData) => {
    return api.post('/api/communities', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  joinCommunity: (slug) => api.post(`/api/communities/${slug}/join`),
  leaveCommunity: (slug) => api.post(`/api/communities/${slug}/leave`),
};
