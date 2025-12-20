'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui';
import { bookingsApi } from '@/lib/api';

type BookingStatus = 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled';

interface Booking {
    _id: string;
    venue: {
        _id: string;
        name: string;
        images?: string[];
    };
    date: string;
    timeSlot: string;
    eventType: string;
    guestCount: number;
    status: string;
    totalAmount: number;
}

export default function BookingsPage() {
    const router = useRouter();
    const { isAuthenticated, isLoading, user } = useAuth();
    const [statusFilter, setStatusFilter] = useState<BookingStatus>('all');
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/signin');
        }
    }, [isLoading, isAuthenticated, router]);

    useEffect(() => {
        const fetchBookings = async () => {
            if (!user?._id) return;
            try {
                setLoading(true);
                const data = await bookingsApi.getUserBookings(user._id) as Booking[];
                setBookings(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load bookings');
            } finally {
                setLoading(false);
            }
        };

        if (isAuthenticated && user?._id) {
            fetchBookings();
        }
    }, [isAuthenticated, user?._id]);

    if (isLoading || !isAuthenticated) {
        return (
            <DashboardLayout>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="animate-spin w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full" />
                </div>
            </DashboardLayout>
        );
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const filteredBookings = statusFilter === 'all'
        ? bookings
        : bookings.filter((b) => b.status === statusFilter);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed':
                return 'bg-green-500/20 text-green-400 border-green-500/20';
            case 'pending':
                return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20';
            case 'completed':
                return 'bg-blue-500/20 text-blue-400 border-blue-500/20';
            case 'cancelled':
                return 'bg-red-500/20 text-red-400 border-red-500/20';
            default:
                return 'bg-gray-500/20 text-gray-400 border-gray-500/20';
        }
    };

    const handleCancelBooking = async (bookingId: string) => {
        try {
            await bookingsApi.cancel(bookingId);
            setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, status: 'cancelled' } : b));
        } catch (err) {
            console.error('Failed to cancel booking:', err);
        }
    };

    return (
        <DashboardLayout>
            <div className="p-6 lg:p-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">My Bookings</h1>
                    <p className="text-gray-400">Manage your venue bookings and reservations</p>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 mb-8 flex-wrap">
                    {(['all', 'pending', 'confirmed', 'completed', 'cancelled'] as BookingStatus[]).map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-all duration-200 ${statusFilter === status
                                ? 'bg-white text-black shadow-lg shadow-white/10'
                                : 'bg-white/[0.04] text-gray-400 hover:bg-white/[0.08] hover:text-white border border-white/[0.08]'
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex items-center justify-center py-16">
                        <div className="animate-spin w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full" />
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="text-center py-16">
                        <p className="text-red-400 mb-4">{error}</p>
                        <Button onClick={() => window.location.reload()}>Try Again</Button>
                    </div>
                )}

                {/* Bookings List */}
                {!loading && !error && (
                    <div className="space-y-4">
                        {filteredBookings.map((booking) => (
                            <div
                                key={booking._id}
                                className="bg-white/[0.02] backdrop-blur-sm border border-white/[0.08] rounded-2xl overflow-hidden hover:bg-white/[0.04] hover:border-white/[0.12] transition-all duration-300"
                            >
                                <div className="flex flex-col md:flex-row">
                                    {/* Venue Image */}
                                    <div className="md:w-48 h-32 md:h-auto bg-gradient-to-br from-violet-500/30 to-blue-500/30 flex items-center justify-center">
                                        {booking.venue?.images?.[0] ? (
                                            <img src={booking.venue.images[0]} alt={booking.venue.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <svg className="w-12 h-12 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                            </svg>
                                        )}
                                    </div>

                                    {/* Booking Details */}
                                    <div className="flex-1 p-5">
                                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                            <div>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-lg font-semibold text-white">{booking.venue?.name || 'Venue'}</h3>
                                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize border ${getStatusColor(booking.status)}`}>
                                                        {booking.status}
                                                    </span>
                                                </div>
                                                <div className="space-y-1 text-sm">
                                                    <div className="flex items-center gap-2 text-gray-400">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                        {formatDate(booking.date)} • {booking.timeSlot}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-gray-500">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        </svg>
                                                        {booking.guestCount} guests • {booking.eventType}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <p className="text-xs text-gray-500 mb-1">Total Amount</p>
                                                <p className="text-xl font-bold text-white">₹{booking.totalAmount?.toLocaleString() || 0}</p>
                                            </div>
                                        </div>

                                        <div className="mt-4 pt-4 border-t border-white/[0.05] flex flex-wrap gap-3">
                                            <Button variant="secondary" size="sm">View Details</Button>
                                            {booking.status === 'pending' && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-400 hover:text-red-300"
                                                    onClick={() => handleCancelBooking(booking._id)}
                                                >
                                                    Cancel
                                                </Button>
                                            )}
                                            {booking.status === 'confirmed' && (
                                                <Button variant="ghost" size="sm">Contact Venue</Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && filteredBookings.length === 0 && (
                    <div className="text-center py-16">
                        <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
                        </svg>
                        <h3 className="text-xl font-semibold text-white mb-2">No bookings found</h3>
                        <p className="text-gray-400 mb-6">
                            {statusFilter === 'all'
                                ? 'Start exploring venues to make your first booking!'
                                : `No ${statusFilter} bookings at the moment.`}
                        </p>
                        <Button onClick={() => router.push('/venues')}>Browse Venues</Button>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
