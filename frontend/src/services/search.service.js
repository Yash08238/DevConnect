import { api } from './api';

export const searchService = {
  search: (query) => api.get('/api/search', { params: { q: query } }),
};
