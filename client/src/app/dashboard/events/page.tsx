'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui';
import { eventsApi, ticketsApi } from '@/lib/api';

interface Event {
    _id: string;
    name: string;
    date: string;
    startTime: string;
    venue: {
        name: string;
        address: { city: string };
    };
    images?: string[];
    status: string;
    currentAttendees?: number;
    maxAttendees?: number;
}

interface Ticket {
    _id: string;
    event: Event;
    status: string;
}

export default function EventsPage() {
    const router = useRouter();
    const { isAuthenticated, isLoading, user } = useAuth();
    const [activeTab, setActiveTab] = useState<'attending' | 'organizing'>('attending');
    const [attendingEvents, setAttendingEvents] = useState<Event[]>([]);
    const [organizingEvents, setOrganizingEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/signin');
        }
    }, [isLoading, isAuthenticated, router]);

    useEffect(() => {
        const fetchEvents = async () => {
            if (!user?._id) return;
            try {
                setLoading(true);
                setError('');

                // Fetch organizing events
                const orgEvents = await eventsApi.getUserEvents(user._id) as Event[];
                setOrganizingEvents(orgEvents);

                // Fetch attending events (from tickets)
                const tickets = await ticketsApi.getUserTickets(user._id) as Ticket[];
                const attending = tickets
                    .filter(t => t.status === 'active' && t.event)
                    .map(t => t.event);
                setAttendingEvents(attending);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load events');
            } finally {
                setLoading(false);
            }
        };

        if (isAuthenticated && user?._id) {
            fetchEvents();
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
        });
    };

    const currentEvents = activeTab === 'attending' ? attendingEvents : organizingEvents;

    return (
        <DashboardLayout>
            <div className="p-6 lg:p-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">My Events</h1>
                    <p className="text-gray-400">Events you&apos;re attending or organizing</p>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-8">
                    <button
                        onClick={() => setActiveTab('attending')}
                        className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${activeTab === 'attending'
                            ? 'bg-white text-black shadow-lg shadow-white/10'
                            : 'bg-white/[0.04] text-gray-400 hover:bg-white/[0.08] hover:text-white border border-white/[0.08]'
                            }`}
                    >
                        Attending ({attendingEvents.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('organizing')}
                        className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${activeTab === 'organizing'
                            ? 'bg-gradient-to-r from-violet-500 to-pink-500 text-white shadow-lg shadow-violet-500/20'
                            : 'bg-white/[0.04] text-gray-400 hover:bg-white/[0.08] hover:text-white border border-white/[0.08]'
                            }`}
                    >
                        Organizing ({organizingEvents.length})
                    </button>
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

                {/* Events Grid */}
                {!loading && !error && (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {currentEvents.map((event) => (
                            <div
                                key={event._id}
                                className="group bg-white/[0.02] backdrop-blur-sm border border-white/[0.08] rounded-2xl overflow-hidden hover:bg-white/[0.04] hover:border-white/[0.12] transition-all duration-300"
                            >
                                {/* Event Image */}
                                <div className="h-40 bg-gradient-to-br from-violet-500/30 to-blue-500/30 relative">
                                    {event.images?.[0] ? (
                                        <img src={event.images[0]} alt={event.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <svg className="w-12 h-12 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                    )}
                                    <div className="absolute top-3 left-3">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-sm border ${event.status === 'published'
                                            ? 'bg-green-500/20 text-green-400 border-green-500/20'
                                            : event.status === 'draft'
                                                ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20'
                                                : 'bg-gray-500/20 text-gray-400 border-gray-500/20'
                                            }`}>
                                            {event.status || 'Active'}
                                        </span>
                                    </div>
                                </div>

                                {/* Event Details */}
                                <div className="p-5">
                                    <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-violet-300 transition-colors">
                                        {event.name}
                                    </h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            {formatDate(event.date)} • {event.startTime}
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-500">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            </svg>
                                            {event.venue?.name}{event.venue?.address?.city ? `, ${event.venue.address.city}` : ''}
                                        </div>
                                    </div>

                                    {/* Capacity Bar for Organizing */}
                                    {activeTab === 'organizing' && event.maxAttendees && (
                                        <div className="mt-4">
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className="text-gray-400">Attendees</span>
                                                <span className="text-white">{event.currentAttendees || 0}/{event.maxAttendees}</span>
                                            </div>
                                            <div className="h-1.5 bg-white/[0.1] rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-violet-500 to-pink-500 rounded-full"
                                                    style={{ width: `${((event.currentAttendees || 0) / event.maxAttendees) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div className="mt-4 pt-4 border-t border-white/[0.05] flex gap-2">
                                        <Link href={`/events/${event._id}`} className="flex-1">
                                            <Button variant="secondary" size="sm" className="w-full">
                                                View Details
                                            </Button>
                                        </Link>
                                        {activeTab === 'organizing' && (
                                            <Button variant="ghost" size="sm">Manage</Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && currentEvents.length === 0 && (
                    <div className="text-center py-16">
                        <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <h3 className="text-xl font-semibold text-white mb-2">
                            {activeTab === 'attending' ? 'No events to attend' : 'No events organized'}
                        </h3>
                        <p className="text-gray-400 mb-6">
                            {activeTab === 'attending'
                                ? 'Explore events and get your tickets!'
                                : 'Create your first event and start selling tickets.'}
                        </p>
                        <Button onClick={() => router.push(activeTab === 'attending' ? '/events' : '/create/event')}>
                            {activeTab === 'attending' ? 'Browse Events' : 'Create Event'}
                        </Button>
                    </div>
                )}

                {/* FAB for Creating Events */}
                {activeTab === 'organizing' && (
                    <Link
                        href="/create/event"
                        className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-r from-violet-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg shadow-violet-500/30 hover:scale-105 transition-transform"
                    >
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                    </Link>
                )}
            </div>
        </DashboardLayout>
    );
}
