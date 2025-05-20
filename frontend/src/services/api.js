import axios from 'axios';
import BASE_URL from '../config';

const api = axios.create({
  baseURL: BASE_URL,
});

export const register = (data) => api.post('/api/inscription', data);
export default api;