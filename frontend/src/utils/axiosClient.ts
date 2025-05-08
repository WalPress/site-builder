import axios, { AxiosInstance } from 'axios';

// Define your API's base URL
// Replace with your actual API base URL or ensure VITE_API_BASE_URL is set in your .env file
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.example.com/v1';

const axiosClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    // You can add other default headers here, e.g., Authorization tokens if static
  },
});

// Optional: You can add interceptors for request and response handling
// For example, to automatically add an auth token to requests
axiosClient.interceptors.request.use(
  (config) => {
    // const token = localStorage.getItem('authToken'); // Example: get token from storage
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// For example, to handle global errors or refresh tokens on 401 responses
axiosClient.interceptors.response.use(
  (response) => {
    // Any status code that lie within the range of 2xx cause this function to trigger
    return response;
  },
  (error) => {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // if (error.response && error.response.status === 401) {
    //   // Handle unauthorized errors, e.g., redirect to login or refresh token
    //   console.error('Unauthorized, logging out...');
    //   // window.location.href = '/login'; 
    // }
    return Promise.reject(error);
  }
);

export default axiosClient;
