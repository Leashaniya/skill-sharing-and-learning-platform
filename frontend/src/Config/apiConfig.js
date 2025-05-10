import axios from "axios";

// Create the API instance
export const API_BASE_URL = 'http://localhost:5454';

// Create axios instance with default config
export const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000, // 30 seconds timeout
    maxContentLength: 50 * 1024 * 1024, // 50MB max content length
    maxBodyLength: 50 * 1024 * 1024, // 50MB max body length
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
});

// Add request interceptor to handle authentication
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("jwt");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Handle FormData content type
    if (config.data instanceof FormData) {
        config.headers['Content-Type'] = 'multipart/form-data';
        // Remove any existing boundary as axios will set it automatically
        delete config.headers['boundary'];
    }
    
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Add response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 415) {
            console.error('Content Type Error:', {
                sentContentType: error.config?.headers['Content-Type'],
                data: error.config?.data,
                isFormData: error.config?.data instanceof FormData
            });
        }
        
        // Handle chunked encoding errors
        if (error.message === 'Network Error' && error.code === 'ERR_NETWORK') {
            console.error('Network Error Details:', {
                url: error.config?.url,
                method: error.config?.method,
                headers: error.config?.headers,
                timeout: error.config?.timeout
            });
        }
        
        console.error('API Error:', error.response?.data || error.message);
        throw error;
    }
);

