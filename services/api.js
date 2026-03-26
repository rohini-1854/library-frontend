import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'; // NestJS on port 4000

const api = axios.create({
    baseURL: API_URL,
});

export const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
};

export const register = async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
};

// Books API
export const getBooks = async () => {
    const response = await api.get('/books');
    return response.data;
};

export const createBook = async (bookData) => {
    const response = await api.post('/books', bookData);
    return response.data;
};

export const updateBook = async (id, bookData) => {
    const response = await api.patch(`/books/${id}`, bookData);
    return response.data;
};

export const deleteBook = async (id) => {
    const response = await api.delete(`/books/${id}`);
    return response.data;
};

// Transactions API
export const issueBook = async (bookId, userId) => {
    const response = await api.post('/transactions/issue', { bookId, userId });
    return response.data;
};

export const reserveBook = async (bookId, userId) => {
    const response = await api.post('/transactions/reserve', { bookId, userId });
    return response.data;
};

export const returnBook = async (id) => {
    const response = await api.post(`/transactions/return/${id}`);
    return response.data;
};

export const reportLostBook = async (id) => {
    const response = await api.post(`/transactions/report-lost/${id}`);
    return response.data;
};

export const getHistory = async (userId = null) => {
    const url = userId ? `/transactions/history/${userId}` : '/transactions/history';
    const response = await api.get(url);
    return response.data;
};

export const getTransactions = async (userId) => {
    const response = await api.get(`/transactions/history/${userId}`);
    return response.data;
};

export const payFine = async (id) => {
    const response = await api.post(`/transactions/pay-fine/${id}`);
    return response.data;
};

export const getUsers = async () => {
    const response = await api.get('/auth/users'); // Assuming we add this endpoint
    return response.data;
};

export const getProfile = async (id) => {
    const response = await api.get(`/auth/profile/${id}`);
    return response.data;
};

export const updateMembership = async (id, data) => {
    const response = await api.post(`/auth/membership/${id}`, data);
    return response.data;
};

export const deleteUser = async (id) => {
    const response = await api.delete(`/auth/user/${id}`);
    return response.data;
};

// Registration Flow API
export const verifyLocation = async (id, lat, lng, gpsAddress = '') => {
    const response = await api.post(`/auth/registration/step1/${id}`, { lat, lng, gpsAddress });
    return response.data;
};

export const submitPersonalDetails = async (id, details) => {
    const response = await api.post(`/auth/registration/step2/${id}`, details);
    return response.data;
};

export const submitDocuments = async (id, docs) => {
    const response = await api.post(`/auth/registration/step3/${id}`, docs);
    return response.data;
};

export const completeRegistration = async (id, paymentData) => {
    const response = await api.post(`/auth/registration/step4/${id}`, paymentData);
    return response.data;
};

// Feedback API
export const submitFeedback = async (data) => {
    const response = await api.post('/feedback', data);
    return response.data;
};

export const getAllFeedback = async () => {
    const response = await api.get('/feedback');
    return response.data;
};

export const getPublicFeedback = async () => {
    const response = await api.get('/feedback/public');
    return response.data;
};

export const updateFeedbackStatus = async (id, status) => {
    const response = await api.patch(`/feedback/${id}/status`, { status });
    return response.data;
};

// Settings API
export const getSettings = async (key = 'library_config') => {
    const response = await api.get(`/settings/${key}`);
    return response.data;
};

export const updateSettings = async (value, key = 'library_config') => {
    const response = await api.patch(`/settings/${key}`, { value });
    return response.data;
};



export const searchGoogleBooks = async (query) => {
    try {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

        const response = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=${query}&key=${apiKey}&maxResults=20`);
        return response.data;
    } catch (error) {
        console.error("Error fetching books from Google:", error);
        return { items: [] };
    }
};

export default api;
