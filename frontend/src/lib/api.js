import axios from 'axios';

// Create a configured Axios instance
const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api', // FastAPI Backend URL
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to automatically attach the JWT token if it exists
api.interceptors.request.use(
    (config) => {
        // Look for the token in localStorage
        const token = localStorage.getItem('finance_buddy_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Disabling browser cache universally for API calls
        config.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
        config.headers['Pragma'] = 'no-cache';
        config.headers['Expires'] = '0';

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
