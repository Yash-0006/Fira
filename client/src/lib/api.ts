// API Client for FIRA Backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

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

// Brands API
export const brandsApi = {
    getAll: (params?: Record<string, string>) => {
        const query = params ? '?' + new URLSearchParams(params).toString() : '';
        return request(`/brands${query}`);
    },
    getById: (id: string) => request(`/brands/${id}`),
    getMyProfile: (userId: string) => request(`/brands/my-profile?userId=${userId}`),
    create: (data: unknown) =>
        request('/brands', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
    update: (id: string, data: unknown) =>
        request(`/brands/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),
    getPosts: (id: string, params?: Record<string, string>) => {
        const query = params ? '?' + new URLSearchParams(params).toString() : '';
        return request(`/brands/${id}/posts${query}`);
    },
    createPost: (id: string, data: unknown) =>
        request(`/brands/${id}/posts`, {
            method: 'POST',
            body: JSON.stringify(data),
        }),
    getEvents: (id: string) => request(`/brands/${id}/events`),
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
    getUserVenues: (userId: string) => request(`/venues?owner=${userId}`),
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
    getUserEvents: (userId: string) => request(`/events?organizer=${userId}`),
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
    getUserBookings: (userId: string) => request(`/bookings/user/${userId}`),
    getVenueBookings: (venueId: string) => request(`/bookings/venue/${venueId}`),
    getById: (id: string) => request(`/bookings/${id}`),
    create: (data: unknown) =>
        request('/bookings', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
    update: (id: string, data: unknown) =>
        request(`/bookings/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),
    updateStatus: (id: string, status: string, reason?: string) =>
        request(`/bookings/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status, reason }),
        }),
    cancel: (id: string, reason?: string) =>
        request(`/bookings/${id}/cancel`, {
            method: 'POST',
            body: JSON.stringify({ reason }),
        }),
};

// Tickets API
export const ticketsApi = {
    getAll: (params?: Record<string, string>) => {
        const query = params ? '?' + new URLSearchParams(params).toString() : '';
        return request(`/tickets${query}`);
    },
    getUserTickets: (userId: string) => request(`/tickets/user/${userId}`),
    getEventTickets: (eventId: string) => request(`/tickets/event/${eventId}`),
    getById: (id: string) => request(`/tickets/${id}`),
    purchase: (data: { eventId: string; quantity: number; ticketType?: string; userId: string }) =>
        request('/tickets', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
    validate: (ticketId: string, qrCode: string) =>
        request(`/tickets/${ticketId}/validate`, {
            method: 'POST',
            body: JSON.stringify({ qrCode }),
        }),
    cancel: (ticketId: string) =>
        request(`/tickets/${ticketId}/cancel`, {
            method: 'POST',
        }),
};

// Payments API
export const paymentsApi = {
    getAll: (params?: Record<string, string>) => {
        const query = params ? '?' + new URLSearchParams(params).toString() : '';
        return request(`/payments${query}`);
    },
    getUserPayments: (userId: string) => request(`/payments/user/${userId}`),
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
    requestRefund: (id: string, data?: unknown) =>
        request(`/payments/${id}/refund`, {
            method: 'POST',
            body: JSON.stringify(data || {}),
        }),
    getPayouts: (params?: Record<string, string>) => {
        const query = params ? '?' + new URLSearchParams(params).toString() : '';
        return request(`/payments/payouts/all${query}`);
    },
};

// Notifications API
export const notificationsApi = {
    getAll: (userId?: string) => {
        const query = userId ? `?userId=${userId}` : '';
        return request(`/notifications${query}`);
    },
    getUserNotifications: (userId: string) => request(`/notifications?userId=${userId}`),
    getUnreadCount: (userId: string) => request<{ count: number }>(`/notifications/unread?userId=${userId}`),
    getById: (id: string) => request(`/notifications/${id}`),
    markAsRead: (id: string) =>
        request(`/notifications/${id}/read`, {
            method: 'PUT',
        }),
    markAllAsRead: (userId: string) =>
        request('/notifications/read-all', {
            method: 'PUT',
            body: JSON.stringify({ userId }),
        }),
    delete: (id: string) =>
        request(`/notifications/${id}`, {
            method: 'DELETE',
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

// Upload API (uses FormData, not JSON)
export const uploadApi = {
    single: async (file: File, folder = 'events'): Promise<{ url: string; publicId: string }> => {
        const formData = new FormData();
        formData.append('image', file);
        formData.append('folder', folder);

        const token = typeof window !== 'undefined' ? localStorage.getItem('fira_token') : null;
        const headers: HeadersInit = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}/upload/single`, {
            method: 'POST',
            headers,
            body: formData,
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Upload failed');
        }

        return response.json();
    },
    multiple: async (files: File[], folder = 'events'): Promise<{ images: { url: string; publicId: string }[] }> => {
        const formData = new FormData();
        files.forEach(file => formData.append('images', file));
        formData.append('folder', folder);

        const token = typeof window !== 'undefined' ? localStorage.getItem('fira_token') : null;
        const headers: HeadersInit = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}/upload/multiple`, {
            method: 'POST',
            headers,
            body: formData,
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Upload failed');
        }

        return response.json();
    },
    delete: async (publicId: string): Promise<{ success: boolean }> => {
        return request('/upload/delete', {
            method: 'DELETE',
            body: JSON.stringify({ publicId }),
        });
    },
};

export { ApiError };
