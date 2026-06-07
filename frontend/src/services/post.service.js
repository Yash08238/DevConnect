import api from './api';

export const postService = {
  getPosts: (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return api.get(`/api/posts?${params}`);
  },
  getPost: (id) => api.get(`/api/posts/${id}`),
  createPost: (formData) => {
    return api.post('/api/posts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  updatePost: (id, data) => api.put(`/api/posts/${id}`, data),
  deletePost: (id) => api.delete(`/api/posts/${id}`),
  likePost: (id) => api.post(`/api/posts/${id}/like`),
  unlikePost: (id) => api.post(`/api/posts/${id}/unlike`),
  bookmarkPost: (id) => api.post(`/api/posts/${id}/bookmark`),
  unbookmarkPost: (id) => api.post(`/api/posts/${id}/unbookmark`),
};
