'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui';
import { bookingsApi, venuesApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/Toast';

interface Booking {
    _id: string;
    user: { _id: string; name: string; email: string; phone?: string };
    venue: { _id: string; name: string };
    bookingDate: string;
    startTime: string;
    endTime: string;
    purpose: string;
    expectedGuests: number;
    totalAmount: number;
    status: 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'completed';
    createdAt: string;
}

interface Venue {
    _id: string;
    name: string;
}

export default function BookingRequestsPage() {
    const router = useRouter();
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();
    const { showToast } = useToast();

    const [bookings, setBookings] = useState<Booking[]>([]);
    const [venues, setVenues] = useState<Venue[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedVenue, setSelectedVenue] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/signin');
        }
    }, [authLoading, isAuthenticated, router]);

    useEffect(() => {
        if (isAuthenticated && user) {
            fetchVenues();
        }
    }, [isAuthenticated, user]);

    useEffect(() => {
        if (venues.length > 0) {
            fetchBookings();
        }
    }, [venues, selectedVenue]);

    const fetchVenues = async () => {
        if (!user?._id) return;
        try {
            const data = await venuesApi.getUserVenues(user._id) as { venues?: Venue[] } | Venue[];
            setVenues(Array.isArray(data) ? data : data.venues || []);
        } catch (error) {
            console.error('Failed to fetch venues:', error);
        }
    };

    const fetchBookings = async () => {
        setIsLoading(true);
        try {
            let allBookings: Booking[] = [];

            if (selectedVenue === 'all') {
                for (const venue of venues) {
                    const data = await bookingsApi.getVenueBookings(venue._id) as Booking[];
                    allBookings = [...allBookings, ...(data || [])];
                }
            } else {
                const data = await bookingsApi.getVenueBookings(selectedVenue) as Booking[];
                allBookings = data || [];
            }

            allBookings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setBookings(allBookings);
        } catch (error) {
            console.error('Failed to fetch bookings:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusUpdate = async (bookingId: string, status: 'accepted' | 'rejected') => {
        setProcessingId(bookingId);
        try {
            await bookingsApi.updateStatus(bookingId, status);
            showToast(`Booking ${status}!`, 'success');
            fetchBookings();
        } catch (error) {
            console.error('Failed to update booking:', error);
            showToast('Failed to update booking status', 'error');
        } finally {
            setProcessingId(null);
        }
    };

    const filteredBookings = bookings.filter(b =>
        statusFilter === 'all' || b.status === statusFilter
    );

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric'
        });
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency', currency: 'INR', maximumFractionDigits: 0
        }).format(price);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            case 'accepted': return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'rejected': return 'bg-red-500/20 text-red-400 border-red-500/30';
            case 'cancelled': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
            default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        }
    };

    if (authLoading) {
        return (
            <DashboardLayout>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="animate-spin w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto py-8 px-4">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Booking Requests</h1>
                    <p className="text-gray-400">Manage incoming booking requests for your venues</p>
                </div>

                <div className="flex flex-wrap gap-4 mb-6">
                    <select
                        value={selectedVenue}
                        onChange={(e) => setSelectedVenue(e.target.value)}
                        className="px-4 py-2 bg-black/40 border border-white/10 rounded-lg text-white"
                    >
                        <option value="all">All Venues</option>
                        {venues.map(v => (
                            <option key={v._id} value={v._id}>{v.name}</option>
                        ))}
                    </select>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 bg-black/40 border border-white/10 rounded-lg text-white"
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="accepted">Accepted</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                        <div className="text-2xl font-bold text-yellow-400">
                            {bookings.filter(b => b.status === 'pending').length}
                        </div>
                        <div className="text-sm text-gray-400">Pending</div>
                    </div>
                    <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                        <div className="text-2xl font-bold text-green-400">
                            {bookings.filter(b => b.status === 'accepted').length}
                        </div>
                        <div className="text-sm text-gray-400">Accepted</div>
                    </div>
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                        <div className="text-2xl font-bold text-red-400">
                            {bookings.filter(b => b.status === 'rejected').length}
                        </div>
                        <div className="text-sm text-gray-400">Rejected</div>
                    </div>
                    <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-4">
                        <div className="text-2xl font-bold text-violet-400">
                            {formatPrice(bookings.filter(b => b.status === 'accepted').reduce((sum, b) => sum + b.totalAmount, 0))}
                        </div>
                        <div className="text-sm text-gray-400">Revenue</div>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full" />
                    </div>
                ) : filteredBookings.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                        No booking requests found
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredBookings.map(booking => (
                            <div key={booking._id} className="bg-white/[0.02] border border-white/[0.08] rounded-xl p-6">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
                                                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                            </span>
                                            <span className="text-gray-500 text-sm">{formatDate(booking.createdAt)}</span>
                                        </div>

                                        <h3 className="text-lg font-semibold text-white mb-1">
                                            {booking.venue?.name || 'Venue'}
                                        </h3>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                            <div>
                                                <span className="text-gray-500">Date:</span>
                                                <span className="text-white ml-2">{formatDate(booking.bookingDate)}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Time:</span>
                                                <span className="text-white ml-2">{booking.startTime} - {booking.endTime}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Guests:</span>
                                                <span className="text-white ml-2">{booking.expectedGuests}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Amount:</span>
                                                <span className="text-white ml-2">{formatPrice(booking.totalAmount)}</span>
                                            </div>
                                        </div>

                                        {booking.purpose && (
                                            <p className="text-gray-400 text-sm mt-2">
                                                <span className="text-gray-500">Purpose:</span> {booking.purpose}
                                            </p>
                                        )}

                                        <div className="mt-3 pt-3 border-t border-white/10">
                                            <span className="text-gray-500 text-sm">Customer: </span>
                                            <span className="text-white text-sm">{booking.user?.name}</span>
                                            <span className="text-gray-500 text-sm ml-3">{booking.user?.email}</span>
                                        </div>
                                    </div>

                                    {booking.status === 'pending' && (
                                        <div className="flex gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleStatusUpdate(booking._id, 'rejected')}
                                                disabled={processingId === booking._id}
                                            >
                                                Reject
                                            </Button>
                                            <Button
                                                size="sm"
                                                onClick={() => handleStatusUpdate(booking._id, 'accepted')}
                                                disabled={processingId === booking._id}
                                            >
                                                {processingId === booking._id ? 'Processing...' : 'Accept'}
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
