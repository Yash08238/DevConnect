import api from './api';

export const notificationService = {
  getNotifications: () => api.get('/api/notifications'),
  markNotificationsRead: () => api.put('/api/notifications/read'),
};
