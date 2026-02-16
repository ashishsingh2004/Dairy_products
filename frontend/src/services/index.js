import api from './api';

// Auth Services
export const authService = {
    register: async (userData) => {
        const response = await api.post('/auth/register', userData);
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data));
        }
        return response.data;
    },

    login: async (credentials) => {
        const response = await api.post('/auth/login', credentials);
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data));
        }
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    getProfile: async () => {
        const response = await api.get('/auth/profile');
        return response.data;
    },

    updateProfile: async (userData) => {
        const response = await api.put('/auth/profile', userData);
        return response.data;
    },
};

// Product Services
export const productService = {
    getAll: async (filters = {}) => {
        const queryString = new URLSearchParams(filters).toString();
        const response = await api.get(`/products?${queryString}`);
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/products/${id}`);
        return response.data;
    },

    create: async (formData) => {
        const response = await api.post('/products', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    update: async (id, formData) => {
        const response = await api.put(`/products/${id}`, formData);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/products/${id}`);
        return response.data;
    },

    addReview: async (id, review) => {
        const response = await api.post(`/products/${id}/review`, review);
        return response.data;
    },
};

// Order Services
export const orderService = {
    createRazorpayOrder: async (amount) => {
        const response = await api.post('/orders/create-razorpay-order', { amount });
        return response.data;
    },

    verifyPayment: async (paymentData) => {
        const response = await api.post('/orders/verify-payment', paymentData);
        return response.data;
    },

    create: async (orderData) => {
        const response = await api.post('/orders', orderData);
        return response.data;
    },

    getAll: async () => {
        const response = await api.get('/orders');
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/orders/${id}`);
        return response.data;
    },

    updateStatus: async (id, statusData) => {
        const response = await api.put(`/orders/${id}/status`, statusData);
        return response.data;
    },
};

// Cow Trading Services
export const cowService = {
    getAll: async (filters = {}) => {
        const queryString = new URLSearchParams(filters).toString();
        const response = await api.get(`/cows?${queryString}`);
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/cows/${id}`);
        return response.data;
    },

    create: async (formData) => {
        const response = await api.post('/cows', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    update: async (id, formData) => {
        const response = await api.put(`/cows/${id}`, formData);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/cows/${id}`);
        return response.data;
    },
};

// AI Chat Services
export const chatService = {
    sendMessage: async (message) => {
        const response = await api.post('/chat', { message });
        return response.data;
    },

    clearHistory: async () => {
        const response = await api.delete('/chat/history');
        return response.data;
    },
};

// Admin Services
export const adminService = {
    getUsers: async (filters = {}) => {
        const queryString = new URLSearchParams(filters).toString();
        const response = await api.get(`/admin/users?${queryString}`);
        return response.data;
    },

    updateUserStatus: async (userId, isActive) => {
        const response = await api.put(`/admin/users/${userId}/status`, { isActive });
        return response.data;
    },

    verifyKYC: async (userId, kycStatus) => {
        const response = await api.put(`/admin/users/${userId}/kyc`, { kycStatus });
        return response.data;
    },

    getPendingProducts: async () => {
        const response = await api.get('/admin/products/pending');
        return response.data;
    },

    approveProduct: async (productId, status) => {
        const response = await api.put(`/admin/products/${productId}/approve`, { status });
        return response.data;
    },

    getPendingCertifications: async () => {
        const response = await api.get('/admin/certifications/pending');
        return response.data;
    },

    getAnalytics: async () => {
        const response = await api.get('/admin/analytics');
        return response.data;
    },
};
