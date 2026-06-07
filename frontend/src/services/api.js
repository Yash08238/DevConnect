import axios from 'axios';

export const api = axios.create({
  baseURL: '', // Vite proxy handles routing
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Authorization header if token exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response interceptor for automatic silent token refresh on 401
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    // Avoid loops and only refresh for auth errors on non-refresh routes
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/api/auth/refresh-token') &&
      !originalRequest.url.includes('/api/auth/login')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await axios.post('/api/auth/refresh-token');
        if (res.data?.success && res.data.data?.accessToken) {
          const newToken = res.data.data.accessToken;
          localStorage.setItem('token', newToken);
          api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
          processQueue(null, newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (err) {
        processQueue(err, null);
        localStorage.removeItem('token');
        // Dispatch custom event to notify AuthContext to log out
        window.dispatchEvent(new Event('auth_session_expired'));
      } finally {
        isRefreshing = false;
      }
    }

    const message = error.response?.data?.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

// Auth Service
api.register = (data) => api.post('/api/auth/register', data);
api.login = (data) => api.post('/api/auth/login', data);
api.logout = () => api.post('/api/auth/logout');
api.getMe = () => api.get('/api/auth/me');
api.forgotPassword = (email) => api.post('/api/auth/forgot-password', { email });
api.resetPassword = (token, password) => api.post(`/api/auth/reset-password/${token}`, { password });

// User Service
api.getSuggestedUsers = () => api.get('/api/users/suggested');
api.getUserProfile = (username) => api.get(`/api/users/${username}`);
api.updateProfile = (data) => api.put('/api/users/profile', data);
api.uploadAvatar = (formData) => api.post('/api/users/avatar', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
api.followUser = (id) => api.post(`/api/users/${id}/follow`);
api.unfollowUser = (id) => api.post(`/api/users/${id}/unfollow`);
api.getFollowers = (username) => api.get(`/api/users/${username}/followers`);
api.getFollowing = (username) => api.get(`/api/users/${username}/following`);

// Post Service
api.getPosts = (typeOrFilters = {}, pageNum) => {
  let paramsObj = {};
  if (typeof typeOrFilters === 'string') {
    paramsObj.type = typeOrFilters;
    if (pageNum) paramsObj.page = pageNum;
  } else {
    paramsObj = typeOrFilters;
  }
  const params = new URLSearchParams(paramsObj).toString();
  return api.get(`/api/posts?${params}`);
};
api.getPost = (id) => api.get(`/api/posts/${id}`);
api.createPost = (formData) => api.post('/api/posts', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
api.updatePost = (id, data) => api.put(`/api/posts/${id}`, data);
api.deletePost = (id) => api.delete(`/api/posts/${id}`);
api.likePost = (id) => api.post(`/api/posts/${id}/like`);
api.unlikePost = (id) => api.post(`/api/posts/${id}/unlike`);
api.bookmarkPost = (id) => api.post(`/api/posts/${id}/bookmark`);
api.unbookmarkPost = (id) => api.post(`/api/posts/${id}/unbookmark`);

// Comment Service
api.getComments = (postId) => api.get(`/api/comments/post/${postId}`);
api.createComment = (postId, data) => api.post(`/api/comments/post/${postId}`, data);
api.updateComment = (commentId, data) => api.put(`/api/comments/${commentId}`, data);
api.deleteComment = (commentId) => api.delete(`/api/comments/${commentId}`);

// Community Service
api.getCommunities = (page = 1) => api.get(`/api/communities?page=${page}`);
api.getCommunity = (slug) => api.get(`/api/communities/${slug}`);
api.createCommunity = (formData) => api.post('/api/communities', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
api.joinCommunity = (slug) => api.post(`/api/communities/${slug}/join`);
api.leaveCommunity = (slug) => api.post(`/api/communities/${slug}/leave`);

// Job Service
api.getJobs = (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  return api.get(`/api/jobs?${params}`);
};
api.getJob = (id) => api.get(`/api/jobs/${id}`);
api.createJob = (formData) => api.post('/api/jobs', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
api.applyJob = (id) => api.post(`/api/jobs/${id}/apply`);

// Notification Service
api.getNotifications = () => api.get('/api/notifications');
api.markNotificationsRead = () => api.put('/api/notifications/read');

// Search Service
api.search = (query) => api.get('/api/search', { params: { q: query } });

export default api;
