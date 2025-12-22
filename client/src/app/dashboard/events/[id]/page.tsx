'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui';
import { eventsApi, ticketsApi } from '@/lib/api';
import { Event, User, Venue } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/Toast';

interface Ticket {
    _id: string;
    ticketId: string;
    user: {
        _id: string;
        name: string;
        email: string;
    };
    quantity: number;
    price: number;
    status: string;
    purchaseDate: string;
    isUsed: boolean;
}

export default function DashboardEventDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { isAuthenticated, isLoading: authLoading, user } = useAuth();
    const { showToast } = useToast();
    const [event, setEvent] = useState<Event | null>(null);
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [copiedCode, setCopiedCode] = useState(false);
    const [copiedLink, setCopiedLink] = useState(false);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/signin');
        }
    }, [authLoading, isAuthenticated, router]);

    useEffect(() => {
        if (params.id && isAuthenticated) {
            fetchEvent(params.id as string);
            fetchTickets(params.id as string);
        }
    }, [params.id, isAuthenticated]);

    const fetchEvent = async (id: string) => {
        try {
            setIsLoading(true);
            const data = await eventsApi.getById(id);
            setEvent(data as Event);
        } catch (error) {
            console.error('Failed to fetch event:', error);
            showToast('Failed to load event', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchTickets = async (eventId: string) => {
        try {
            const data = await ticketsApi.getEventTickets(eventId);
            setTickets(data as Ticket[]);
        } catch (error) {
            console.error('Failed to fetch tickets:', error);
        }
    };

    const copyToClipboard = (text: string, type: 'code' | 'link') => {
        navigator.clipboard.writeText(text);
        if (type === 'code') {
            setCopiedCode(true);
            setTimeout(() => setCopiedCode(false), 2000);
        } else {
            setCopiedLink(true);
            setTimeout(() => setCopiedLink(false), 2000);
        }
        showToast(`${type === 'code' ? 'Access code' : 'Event link'} copied!`, 'success');
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatPrice = (price: number) => {
        if (price === 0) return 'Free';
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(price);
    };

    if (authLoading || !isAuthenticated) {
        return (
            <DashboardLayout>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="animate-spin w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full" />
                </div>
            </DashboardLayout>
        );
    }

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="p-6 lg:p-8">
                    <div className="animate-pulse">
                        <div className="h-64 bg-white/5 rounded-2xl mb-8" />
                        <div className="h-8 bg-white/5 rounded w-1/3 mb-4" />
                        <div className="h-4 bg-white/5 rounded w-full mb-2" />
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (!event) {
        return (
            <DashboardLayout>
                <div className="p-6 lg:p-8 flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-white mb-2">Event not found</h1>
                        <p className="text-gray-400 mb-6">The event you&apos;re looking for doesn&apos;t exist.</p>
                        <Button onClick={() => router.push('/dashboard/events')}>Back to Events</Button>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    const organizer = event.organizer as User;
    const venue = event.venue as Venue;
    const spotsLeft = event.maxAttendees - event.currentAttendees;
    const ticketsSold = tickets.reduce((sum, t) => sum + t.quantity, 0);
    const totalRevenue = tickets.reduce((sum, t) => sum + t.price, 0);
    const eventLink = typeof window !== 'undefined' ? `${window.location.origin}/events/${event._id}` : '';

    return (
        <DashboardLayout>
            <div className="p-6 lg:p-8">
                {/* Header */}
                <div className="flex items-start justify-between mb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Link href="/dashboard/events" className="text-gray-400 hover:text-white transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </Link>
                            <h1 className="text-3xl font-bold text-white">Manage Event</h1>
                        </div>
                        <p className="text-gray-400">View bookings and manage your event</p>
                    </div>
                    <div className="flex gap-3">
                        <Link href={`/events/${event._id}`} target="_blank">
                            <Button variant="secondary">View Public Page</Button>
                        </Link>
                    </div>
                </div>

                {/* Hero Image */}
                <div className="relative h-[300px] rounded-2xl overflow-hidden mb-8">
                    {event.images && event.images.length > 0 ? (
                        <img src={event.images[0]} alt={event.name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-violet-500/30 to-pink-500/30 flex items-center justify-center">
                            <svg className="w-24 h-24 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                    )}

                    {/* Badges */}
                    <div className="absolute top-4 left-4 flex gap-2">
                        {event.eventType === 'private' && (
                            <span className="px-3 py-1.5 rounded-full bg-violet-500/30 backdrop-blur-sm border border-violet-500/30 text-violet-200 text-sm font-medium flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                Private Event
                            </span>
                        )}
                        <span className="px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-sm text-white text-sm capitalize">
                            {event.category}
                        </span>
                        <span className={`px-3 py-1.5 rounded-full backdrop-blur-sm text-sm capitalize ${event.status === 'upcoming' ? 'bg-green-500/30 text-green-200' :
                                event.status === 'ongoing' ? 'bg-blue-500/30 text-blue-200' :
                                    event.status === 'completed' ? 'bg-gray-500/30 text-gray-200' :
                                        'bg-red-500/30 text-red-200'
                            }`}>
                            {event.status}
                        </span>
                    </div>

                    {/* Date Banner */}
                    <div className="absolute bottom-4 left-4 px-4 py-3 rounded-xl bg-black/70 backdrop-blur-sm border border-white/10">
                        <div className="text-violet-400 text-sm font-medium">{formatDate(event.date)}</div>
                        <div className="text-white text-lg font-semibold">{event.startTime} - {event.endTime}</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Title */}
                        <div>
                            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">{event.name}</h2>
                            {venue && typeof venue === 'object' && (
                                <p className="text-gray-400 flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    </svg>
                                    {venue.name} • {venue.address?.city}
                                </p>
                            )}
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl p-4">
                                <div className="text-2xl font-bold text-white">{ticketsSold}</div>
                                <div className="text-gray-400 text-sm">Tickets Sold</div>
                            </div>
                            <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl p-4">
                                <div className="text-2xl font-bold text-white">{spotsLeft}</div>
                                <div className="text-gray-400 text-sm">Spots Left</div>
                            </div>
                            <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl p-4">
                                <div className="text-2xl font-bold text-green-400">{formatPrice(totalRevenue)}</div>
                                <div className="text-gray-400 text-sm">Total Revenue</div>
                            </div>
                            <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl p-4">
                                <div className="text-2xl font-bold text-white">{event.maxAttendees}</div>
                                <div className="text-gray-400 text-sm">Max Capacity</div>
                            </div>
                        </div>

                        {/* Private Event Access */}
                        {event.eventType === 'private' && (
                            <div className="bg-violet-500/10 border border-violet-500/30 rounded-2xl p-6">
                                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                    Private Event Access
                                </h3>
                                <p className="text-gray-400 text-sm mb-4">Share these details with your invited guests only.</p>

                                <div className="space-y-4">
                                    {/* Access Code */}
                                    <div className="bg-black/30 rounded-xl p-4">
                                        <div className="text-gray-400 text-xs mb-1">Access Code</div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-2xl font-mono font-bold text-violet-400 tracking-wider">
                                                {event.privateCode || 'N/A'}
                                            </span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => event.privateCode && copyToClipboard(event.privateCode, 'code')}
                                            >
                                                {copiedCode ? 'Copied!' : 'Copy'}
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Event Link */}
                                    <div className="bg-black/30 rounded-xl p-4">
                                        <div className="text-gray-400 text-xs mb-1">Event Link</div>
                                        <div className="flex items-center justify-between gap-4">
                                            <span className="text-white text-sm truncate flex-1">
                                                {eventLink}
                                            </span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => copyToClipboard(eventLink, 'link')}
                                            >
                                                {copiedLink ? 'Copied!' : 'Copy Link'}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Attendees / Tickets */}
                        <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-6">
                            <h3 className="text-lg font-semibold text-white mb-4">Attendees ({tickets.length})</h3>

                            {tickets.length === 0 ? (
                                <div className="text-center py-8">
                                    <svg className="w-12 h-12 text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <p className="text-gray-400">No bookings yet</p>
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                                    {tickets.map((ticket) => (
                                        <div key={ticket._id} className="flex items-center justify-between p-4 bg-black/30 rounded-xl border border-white/5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white font-medium">
                                                    {ticket.user?.name?.charAt(0).toUpperCase() || '?'}
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium">{ticket.user?.name || 'Unknown'}</p>
                                                    <p className="text-gray-500 text-sm">{ticket.user?.email || 'No email'}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-white font-medium">{ticket.quantity} ticket{ticket.quantity > 1 ? 's' : ''}</p>
                                                <p className="text-gray-400 text-sm">{formatPrice(ticket.price)}</p>
                                            </div>
                                            <span className={`px-2 py-1 rounded text-xs ${ticket.isUsed ? 'bg-gray-500/20 text-gray-400' :
                                                    ticket.status === 'active' ? 'bg-green-500/20 text-green-400' :
                                                        'bg-red-500/20 text-red-400'
                                                }`}>
                                                {ticket.isUsed ? 'Used' : ticket.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Description */}
                        <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-6">
                            <h3 className="text-lg font-semibold text-white mb-4">About this event</h3>
                            <p className="text-gray-400 leading-relaxed whitespace-pre-line">{event.description}</p>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-8 space-y-6">
                            {/* Event Info Card */}
                            <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-6">
                                <h3 className="text-lg font-semibold text-white mb-4">Event Info</h3>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-400">Ticket Price</span>
                                        <span className={`font-semibold ${event.ticketPrice === 0 ? 'text-green-400' : 'text-white'}`}>
                                            {formatPrice(event.ticketPrice)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-400">Event Type</span>
                                        <span className="text-white capitalize">{event.eventType}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-400">Category</span>
                                        <span className="text-white capitalize">{event.category}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-400">Status</span>
                                        <span className={`capitalize ${event.status === 'upcoming' ? 'text-green-400' :
                                                event.status === 'ongoing' ? 'text-blue-400' :
                                                    'text-gray-400'
                                            }`}>{event.status}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-6">
                                <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                                <div className="space-y-3">
                                    <Button
                                        variant="secondary"
                                        className="w-full"
                                        onClick={() => copyToClipboard(eventLink, 'link')}
                                    >
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                        </svg>
                                        Share Event
                                    </Button>
                                </div>
                            </div>

                            {/* Tags */}
                            {event.tags && event.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {event.tags.map((tag, index) => (
                                        <span key={index} className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-400 text-sm">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
