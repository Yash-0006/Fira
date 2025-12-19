// API Client for FIRA Backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface RequestOptions extends RequestInit {
    token?: string;
}

class ApiError extends Error {
    constructor(public status: number, message: string) {
        super(message);
        this.name = 'ApiError';
    }
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { token, ...fetchOptions } = options;

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    // Get token from localStorage if not provided
    if (!token && typeof window !== 'undefined') {
        const storedToken = localStorage.getItem('fira_token');
        if (storedToken) {
            (headers as Record<string, string>)['Authorization'] = `Bearer ${storedToken}`;
        }
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...fetchOptions,
        headers,
    });

    const data = await response.json();

    if (!response.ok) {
        throw new ApiError(response.status, data.error || 'Something went wrong');
    }

    return data;
}

// Auth API
export const authApi = {
    register: (data: { email: string; password: string; name: string; role?: string }) =>
        request<{ success: boolean; message: string; email: string }>('/auth/register', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    verifyOTP: (data: { email: string; code: string }) =>
        request<{ user: unknown; token: string; message: string }>('/auth/verify-otp', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    resendOTP: (data: { email: string }) =>
        request<{ success: boolean; message: string; cooldownSeconds: number }>('/auth/resend-otp', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    login: (data: { email: string; password: string }) =>
        request<{ user: unknown; token: string }>('/auth/login', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    logout: () =>
        request<{ message: string }>('/auth/logout', {
            method: 'POST',
        }),

    getMe: () => request<{ user: unknown }>('/auth/me'),
};

// Users API
export const usersApi = {
    getProfile: (id: string) => request(`/users/${id}`),
    updateProfile: (id: string, data: unknown) =>
        request(`/users/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),
    followUser: (id: string) =>
        request(`/users/${id}/follow`, {
            method: 'POST',
        }),
    unfollowUser: (id: string) =>
        request(`/users/${id}/unfollow`, {
            method: 'POST',
        }),
};

// Venues API
export const venuesApi = {
    getAll: (params?: Record<string, string>) => {
        const query = params ? '?' + new URLSearchParams(params).toString() : '';
        return request(`/venues${query}`);
    },
    getNearby: (lat: number, lng: number, radius?: number) => {
        const params = new URLSearchParams({
            lat: lat.toString(),
            lng: lng.toString(),
            ...(radius && { radius: radius.toString() }),
        });
        return request(`/venues/nearby?${params}`);
    },
    getById: (id: string) => request(`/venues/${id}`),
    create: (data: unknown) =>
        request('/venues', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
    update: (id: string, data: unknown) =>
        request(`/venues/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),
    delete: (id: string) =>
        request(`/venues/${id}`, {
            method: 'DELETE',
        }),
    updateAvailability: (id: string, data: unknown) =>
        request(`/venues/${id}/availability`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),
    updateStatus: (id: string, status: string) =>
        request(`/venues/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status }),
        }),
};

// Events API
export const eventsApi = {
    getAll: (params?: Record<string, string>) => {
        const query = params ? '?' + new URLSearchParams(params).toString() : '';
        return request(`/events${query}`);
    },
    getUpcoming: (params?: Record<string, string>) => {
        const query = params ? '?' + new URLSearchParams(params).toString() : '';
        return request(`/events/upcoming${query}`);
    },
    getById: (id: string) => request(`/events/${id}`),
    create: (data: unknown) =>
        request('/events', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
    update: (id: string, data: unknown) =>
        request(`/events/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),
    delete: (id: string) =>
        request(`/events/${id}`, {
            method: 'DELETE',
        }),
    cancel: (id: string) =>
        request(`/events/${id}/cancel`, {
            method: 'POST',
        }),
    requestAccess: (id: string, data: { code: string; userId: string }) =>
        request(`/events/${id}/access`, {
            method: 'POST',
            body: JSON.stringify(data),
        }),
    handleAccessRequest: (eventId: string, requestId: string, status: string) =>
        request(`/events/${eventId}/access/${requestId}`, {
            method: 'PUT',
            body: JSON.stringify({ status }),
        }),
};

// Bookings API
export const bookingsApi = {
    getAll: (params?: Record<string, string>) => {
        const query = params ? '?' + new URLSearchParams(params).toString() : '';
        return request(`/bookings${query}`);
    },
    getById: (id: string) => request(`/bookings/${id}`),
    create: (data: unknown) =>
        request('/bookings', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
    updateStatus: (id: string, status: string, reason?: string) =>
        request(`/bookings/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status, reason }),
        }),
    cancel: (id: string) =>
        request(`/bookings/${id}/cancel`, {
            method: 'POST',
        }),
};

// Tickets API
export const ticketsApi = {
    getAll: (params?: Record<string, string>) => {
        const query = params ? '?' + new URLSearchParams(params).toString() : '';
        return request(`/tickets${query}`);
    },
    getById: (id: string) => request(`/tickets/${id}`),
    purchase: (data: { eventId: string; quantity: number; ticketType?: string }) =>
        request('/tickets', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
    validate: (ticketId: string) =>
        request(`/tickets/${ticketId}/validate`, {
            method: 'POST',
        }),
    checkIn: (ticketId: string) =>
        request(`/tickets/${ticketId}/checkin`, {
            method: 'POST',
        }),
};

// Payments API
export const paymentsApi = {
    getAll: (params?: Record<string, string>) => {
        const query = params ? '?' + new URLSearchParams(params).toString() : '';
        return request(`/payments${query}`);
    },
    getById: (id: string) => request(`/payments/${id}`),
    initiatePayment: (data: unknown) =>
        request('/payments/initiate', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
    verifyPayment: (data: unknown) =>
        request('/payments/verify', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
    requestRefund: (id: string) =>
        request(`/payments/${id}/refund`, {
            method: 'POST',
        }),
};

// Notifications API
export const notificationsApi = {
    getAll: () => request('/notifications'),
    markAsRead: (id: string) =>
        request(`/notifications/${id}/read`, {
            method: 'PUT',
        }),
    markAllAsRead: () =>
        request('/notifications/read-all', {
            method: 'PUT',
        }),
};

// Verification API
export const verificationApi = {
    getAll: () => request('/verification'),
    getById: (id: string) => request(`/verification/${id}`),
    apply: (data: unknown) =>
        request('/verification/apply', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
    review: (id: string, data: { status: string; notes?: string }) =>
        request(`/verification/${id}/review`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),
};

export { ApiError };
