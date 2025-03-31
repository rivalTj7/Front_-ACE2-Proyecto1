import axios from 'axios';


const API_URL = 'http://localhost:8080';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});


api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error('API Error:', error.response.data);
      
      if (error.response.status === 403) {
        console.error('Acceso denegado');
      }
    }
    return Promise.reject(error);
  }
);

export default api;