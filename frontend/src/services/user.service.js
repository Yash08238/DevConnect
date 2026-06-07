import api from './api';

export const userService = {
  getSuggestedUsers: () => api.get('/api/users/suggested'),
  getUserProfile: (username) => api.get(`/api/users/${username}`),
  updateProfile: (data) => api.put('/api/users/profile', data),
  uploadAvatar: (formData) => {
    return api.post('/api/users/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  followUser: (id) => api.post(`/api/users/${id}/follow`),
  unfollowUser: (id) => api.post(`/api/users/${id}/unfollow`),
  getFollowers: (username) => api.get(`/api/users/${username}/followers`),
  getFollowing: (username) => api.get(`/api/users/${username}/following`),
};
