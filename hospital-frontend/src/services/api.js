// src/services/api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    // Debug log để kiểm tra request
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, {
        headers: config.headers,
        data: config.data
    });
    return config;
});

// Response interceptor for error handling
// src/services/api.js - Thêm debug cho login response
api.interceptors.response.use(
    (response) => {
        // Debug đặc biệt cho login API
        if (response.config.url?.includes('/auth/login')) {
            console.log('=== LOGIN API RESPONSE ===');
            console.log('Full response:', response);
            console.log('Response data:', response.data);
            console.log('User in response:', response.data.user);
            console.log('Reference ID in response:', response.data.user?.reference_id);
        }
        return response;
    },
    (error) => {
        console.error(`API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
            status: error.response?.status,
            message: error.response?.data?.message,
            error: error.message
        });

        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);


// Auth APIs
export const authAPI = {
    login: (data) => api.post('/auth/login', data),
    register: (data) => api.post('/auth/register', data),
    getMe: () => api.get('/auth/me'),
    logout: () => api.get('/auth/logout'),
    changePassword: (data) => api.put('/auth/change-password', data),
};

// Department APIs
export const departmentAPI = {
    getAll: () => api.get('/departments'),
    getById: (id) => api.get(`/departments/${id}`),
    create: (data) => api.post('/departments', data),
    update: (id, data) => api.put(`/departments/${id}`, data),
    delete: (id) => api.delete(`/departments/${id}`),
};

// Doctor APIs
export const doctorAPI = {
    getAll: (params) => api.get('/doctors', { params }),
    getById: (id) => api.get(`/doctors/${id}`),
    getByDepartment: (departmentId, params) => api.get(`/doctors/department/${departmentId}`, { params }),
    create: (data) => api.post('/doctors', data),
    update: (id, data) => api.put(`/doctors/${id}`, data),
    delete: (id) => api.delete(`/doctors/${id}`),
    getProfile: (id) => api.get(`/doctors/${id}`, {
        params: {
            isReference: true,
            include: 'appointments,stats,department'
        }
    }),
    updateProfile: (id, data) => api.put(`/doctors/profile/${id}`, data),
    getAppointments: (id, params) => api.get(`/appointments`, {
        params: {
            doctor_id: id,
            include: 'patient,medical_record',
            ...params
        }
    }),
    confirmAppointment: (id, status) => api.put(`/appointments/${id}/status`, { status }),
    createMedicalRecord: (data) => api.post('/medical-records', data),
    updateMedicalRecord: (id, data) => api.put(`/medical-records/${id}`, data),
    getMedicalRecords: (params) => api.get('/medical-records', { params }),
    getStats: (id) => api.get(`/doctors/${id}/stats`)
};

// Patient APIs
export const patientAPI = {
    getAll: (params) => api.get('/patients', { params }),
    getById: (id) => api.get(`/patients/${id}`),
    create: (data) => api.post('/patients', data),
    update: (id, data) => api.put(`/patients/${id}`, data),
    delete: (id) => api.delete(`/patients/${id}`),
    // Thêm API cho patient profile management
    updateProfile: (id, data) => api.put(`/patients/${id}/profile`, data),
    getProfile: (id) => api.get(`/patients/${id}/profile`),
};

// Appointment APIs
export const appointmentAPI = {
    getAll: (params) => api.get('/appointments', { params }),
    getById: (id) => api.get(`/appointments/${id}`),
    create: (data) => api.post('/appointments', data),
    update: (id, data) => api.put(`/appointments/${id}`, data),
    delete: (id) => api.delete(`/appointments/${id}`),
    getByPatient: (patientId, params) => api.get(`/appointments/patient/${patientId}`, { params }),
    getByDoctor: (doctorId, params) => api.get(`/appointments/doctor/${doctorId}`, { params }),
    getByDate: (date, params) => api.get(`/appointments/date/${date}`, { params }),
    // Thêm API cho appointment management
    cancel: (id) => api.put(`/appointments/${id}/cancel`),
    confirm: (id) => api.put(`/appointments/${id}/confirm`),
    reschedule: (id, data) => api.put(`/appointments/${id}/reschedule`, data),
};

// Medical Record APIs
export const medicalRecordAPI = {
    getAll: (params) => api.get('/medical-records', { params }),
    getById: (id) => api.get(`/medical-records/${id}`),
    create: (data) => api.post('/medical-records', data),
    update: (id, data) => api.put(`/medical-records/${id}`, data),
    delete: (id) => api.delete(`/medical-records/${id}`),
    getByPatient: (patientId, params) => api.get(`/medical-records/patient/${patientId}`, { params }),
    getByDoctor: (doctorId, params) => api.get(`/medical-records/doctor/${doctorId}`, { params }),
    // Thêm API cho medical record management
    download: (id) => api.get(`/medical-records/${id}/download`, { responseType: 'blob' }),
    getLatest: (patientId) => api.get(`/medical-records/patient/${patientId}/latest`),
};

// Payment APIs
export const paymentAPI = {
    getAll: (params) => api.get('/payments', { params }),
    getById: (id) => api.get(`/payments/${id}`),
    create: (data) => api.post('/payments', data),
    update: (id, data) => api.put(`/payments/${id}`, data),
    delete: (id) => api.delete(`/payments/${id}`),
    getByPatient: (patientId, params) => api.get(`/payments/patient/${patientId}`, { params }),
    getByAppointment: (appointmentId) => api.get(`/payments/appointment/${appointmentId}`),
    // Thêm API cho payment processing
    processPayment: (id, data) => api.post(`/payments/${id}/process`, data),
    downloadInvoice: (id) => api.get(`/payments/${id}/invoice`, { responseType: 'blob' }),
    getStats: (patientId) => api.get(`/payments/patient/${patientId}/stats`),
    // Payment methods
    getPaymentMethods: () => api.get('/payments/methods'),
    createPaymentIntent: (data) => api.post('/payments/intent', data),
};

// Review APIs
export const reviewAPI = {
    getAll: (params) => api.get('/reviews', { params }),
    getById: (id) => api.get(`/reviews/${id}`),
    create: (data) => api.post('/reviews', data),
    update: (id, data) => api.put(`/reviews/${id}`, data),
    delete: (id) => api.delete(`/reviews/${id}`),
    getByDoctor: (doctorId, params) => api.get(`/reviews/doctor/${doctorId}`, { params }),
    getByPatient: (patientId, params) => api.get(`/reviews/patient/${patientId}`, { params }),
    // Thêm API cho review management
    like: (id) => api.post(`/reviews/${id}/like`),
    unlike: (id) => api.delete(`/reviews/${id}/like`),
};

// Blog APIs (nếu có tính năng blog/tin tức)
export const blogAPI = {
    getAll: (params) => api.get('/blogs', { params }),
    getById: (id) => api.get(`/blogs/${id}`),
    create: (data) => api.post('/blogs', data),
    update: (id, data) => api.put(`/blogs/${id}`, data),
    delete: (id) => api.delete(`/blogs/${id}`),
    getPublished: (params) => api.get('/blogs/published', { params }),
    getByCategory: (category, params) => api.get(`/blogs/category/${category}`, { params }),
};

// Notification APIs
export const notificationAPI = {
    getAll: (params) => api.get('/notifications', { params }),
    getById: (id) => api.get(`/notifications/${id}`),
    create: (data) => api.post('/notifications', data),
    update: (id, data) => api.put(`/notifications/${id}`, data),
    delete: (id) => api.delete(`/notifications/${id}`),
    getByUser: (userId, params) => api.get(`/notifications/user/${userId}`, { params }),
    markAsRead: (id) => api.put(`/notifications/${id}/read`),
    markAllAsRead: (userId) => api.put(`/notifications/user/${userId}/read-all`),
    getUnreadCount: (userId) => api.get(`/notifications/user/${userId}/unread-count`),
};

// Dashboard APIs
export const dashboardAPI = {
    getPatientStats: (patientId) => api.get(`/dashboard/patient/${patientId}/stats`),
    getDoctorStats: (doctorId) => api.get(`/dashboard/doctor/${doctorId}/stats`),
    getAdminStats: () => api.get('/dashboard/admin/stats'),
    getRecentActivities: (userId, params) => api.get(`/dashboard/user/${userId}/activities`, { params }),
};

// File Upload APIs
export const uploadAPI = {
    uploadAvatar: (file) => {
        const formData = new FormData();
        formData.append('avatar', file);
        return api.post('/upload/avatar', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },
    uploadDocument: (file, type) => {
        const formData = new FormData();
        formData.append('document', file);
        formData.append('type', type);
        return api.post('/upload/document', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },
    deleteFile: (fileId) => api.delete(`/upload/${fileId}`),
};

// Search APIs
export const searchAPI = {
    searchDoctors: (query, params) => api.get('/search/doctors', { params: { q: query, ...params } }),
    searchAppointments: (query, params) => api.get('/search/appointments', { params: { q: query, ...params } }),
    searchPatients: (query, params) => api.get('/search/patients', { params: { q: query, ...params } }),
    globalSearch: (query, params) => api.get('/search/global', { params: { q: query, ...params } }),
};

// Settings APIs
export const settingsAPI = {
    getAll: () => api.get('/settings'),
    getByKey: (key) => api.get(`/settings/${key}`),
    update: (key, value) => api.put(`/settings/${key}`, { value }),
    getUserSettings: (userId) => api.get(`/settings/user/${userId}`),
    updateUserSettings: (userId, data) => api.put(`/settings/user/${userId}`, data),
};

// Export default api instance
export default api;
