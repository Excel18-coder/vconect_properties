import axios from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Debug logging
if (typeof window !== 'undefined') {
    console.log('🔍 API Configuration:');
    console.log('  NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
    console.log('  Final baseURL:', baseURL);
}

const api = axios.create({
    baseURL: baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add the auth token to every request
api.interceptors.request.use(
    (config) => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('vconect_token') : null;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle errors
api.interceptors.response.use(
    (response) => response.data,
    (error) => {
        if (error.response?.status === 401) {
            // Handle unauthorized (optional: logout user or redirect to login)
            if (typeof window !== 'undefined') {
                localStorage.removeItem('vconect_token');
                // window.location.href = '/auth/signin';
            }
        }
        return Promise.reject(error.response?.data || error.message);
    }
);

export default api;
