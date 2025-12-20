'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui';
import { ticketsApi, bookingsApi, notificationsApi, eventsApi } from '@/lib/api';
import { CloudCog } from 'lucide-react';

interface Ticket {
    _id: string;
    event: {
        _id: string;
        name: string;
        date: string;
        startTime: string;
        venue?: { name: string };
    };
    status: string;
}

interface Notification {
    _id: string;
    category: string;
    title: string;
    createdAt: string;
}

interface Booking {
    _id: string;
    status: string;
}

interface Event {
    _id: string;
    name: string;
}

interface Stats {
    upcomingEvents: number;
    activeTickets: number;
    bookings: number;
    organizing: number;
}

export default function DashboardPage() {
    const router = useRouter();
    const { user, isAuthenticated, isLoading } = useAuth();
    const [stats, setStats] = useState<Stats>({ upcomingEvents: 0, activeTickets: 0, bookings: 0, organizing: 0 });
    const [recentActivity, setRecentActivity] = useState<Notification[]>([]);
    const [upcomingTickets, setUpcomingTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/signin');
        }
    }, [isLoading, isAuthenticated, router]);

    useEffect(() => {
        console.log(isAuthenticated, user?._id);
        const fetchDashboardData = async () => {
            console.log(user);
            if (!user?._id) return;
            try {
                setLoading(true);

                // Fetch all data in parallel
                const [tickets, bookings, notifications, events] = await Promise.all([
                    ticketsApi.getUserTickets(user._id).catch(() => []) as Promise<Ticket[]>,
                    bookingsApi.getUserBookings(user._id).catch(() => []) as Promise<Booking[]>,
                    notificationsApi.getUserNotifications(user._id).catch(() => []) as Promise<Notification[]>,
                    eventsApi.getUserEvents(user._id).catch(() => []) as Promise<Event[]>,
                ]);
                console.log(tickets, bookings, notifications, events);
                
                const activeTickets = tickets.filter((t: Ticket) => t.status === 'active');
                const upcomingEvents = activeTickets.filter((t: Ticket) => new Date(t.event?.date) > new Date());

                setStats({
                    upcomingEvents: upcomingEvents.length,
                    activeTickets: activeTickets.length,
                    bookings: bookings.filter((b: Booking) => b.status !== 'cancelled').length,
                    organizing: events.length,
                });

                setRecentActivity(notifications.slice(0, 3));
                setUpcomingTickets(upcomingEvents.slice(0, 2));
            } catch (err) {
                console.error('Failed to fetch dashboard data:', err);
            } finally {
                setLoading(false);
            }
        };
        if (isAuthenticated && user?._id) {
            fetchDashboardData();
        }
    }, [isAuthenticated, user?._id]);

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="animate-spin w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full" />
                </div>
            </DashboardLayout>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    const quickStats = [
        { label: 'Upcoming Events', value: (stats?.upcomingEvents ?? 0).toString(), icon: 'calendar', color: 'violet' },
        { label: 'Active Tickets', value: (stats?.activeTickets ?? 0).toString(), icon: 'ticket', color: 'green' },
        { label: 'Bookings', value: (stats?.bookings ?? 0).toString(), icon: 'building', color: 'blue' },
        { label: 'Organizing', value: (stats?.organizing ?? 0).toString(), icon: 'users', color: 'pink' },
    ];

    const getIcon = (name: string) => {
        const icons: Record<string, React.ReactNode> = {
            'calendar': (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            ),
            'ticket': (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
            ),
            'building': (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
                </svg>
            ),
            'users': (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            ),
        };
        return icons[name] || null;
    };

    const colorClasses: Record<string, string> = {
        violet: 'bg-violet-500/20 text-violet-400',
        green: 'bg-green-500/20 text-green-400',
        blue: 'bg-blue-500/20 text-blue-400',
        pink: 'bg-pink-500/20 text-pink-400',
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(hours / 24);
        if (hours < 1) return 'Just now';
        if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
        return date.toLocaleDateString();
    };

    const getActivityIcon = (category: string) => {
        switch (category) {
            case 'events':
                return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
            case 'bookings':
                return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16" /></svg>;
            default:
                return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>;
        }
    };

    const getActivityColor = (category: string) => {
        switch (category) {
            case 'events': return 'bg-violet-500/20 text-violet-400';
            case 'bookings': return 'bg-blue-500/20 text-blue-400';
            case 'payments': return 'bg-emerald-500/20 text-emerald-400';
            default: return 'bg-green-500/20 text-green-400';
        }
    };

    return (
        <DashboardLayout>
            <div className="p-6 lg:p-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Welcome back, {user?.name?.split(' ')[0]}! 👋
                    </h1>
                    <p className="text-gray-400">Here&apos;s what&apos;s happening with your account.</p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {quickStats.map((stat) => (
                        <div
                            key={stat.label}
                            className="bg-white/[0.02] backdrop-blur-sm border border-white/[0.08] rounded-2xl p-5 hover:bg-white/[0.04] hover:border-white/[0.12] transition-all duration-300 group"
                        >
                            <div className={`w-12 h-12 rounded-xl ${colorClasses[stat.color]} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform`}>
                                {getIcon(stat.icon)}
                            </div>
                            <div className="text-2xl font-bold text-white mb-1">
                                {loading ? <div className="w-8 h-6 bg-white/10 rounded animate-pulse" /> : stat.value}
                            </div>
                            <div className="text-sm text-gray-400">{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* Quick Actions */}
                <div className="bg-white/[0.02] backdrop-blur-sm border border-white/[0.08] rounded-2xl p-6 mb-8">
                    <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
                    <div className="flex flex-wrap gap-3">
                        <Link href="/create/event">
                            <Button variant="secondary">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Create Event
                            </Button>
                        </Link>
                        <Link href="/venues">
                            <Button variant="secondary">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                Browse Venues
                            </Button>
                        </Link>
                        <Link href="/events">
                            <Button variant="secondary">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Find Events
                            </Button>
                        </Link>
                        {user?.role === 'venue_owner' && (
                            <Link href="/create/venue">
                                <Button variant="secondary">
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    List Venue
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Activity */}
                    <div className="bg-white/[0.02] backdrop-blur-sm border border-white/[0.08] rounded-2xl p-6">
                        <h2 className="text-lg font-semibold text-white mb-4">Recent Activity</h2>
                        <div className="space-y-4">
                            {loading ? (
                                [...Array(3)].map((_, i) => (
                                    <div key={i} className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-white/10 animate-pulse" />
                                        <div className="flex-1">
                                            <div className="w-3/4 h-4 bg-white/10 rounded animate-pulse mb-2" />
                                            <div className="w-1/4 h-3 bg-white/10 rounded animate-pulse" />
                                        </div>
                                    </div>
                                ))
                            ) : recentActivity.length > 0 ? (
                                recentActivity.map((activity) => (
                                    <div key={activity._id} className="flex items-start gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${getActivityColor(activity.category)}`}>
                                            {getActivityIcon(activity.category)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-white">{activity.title}</p>
                                            <p className="text-xs text-gray-500">{formatTime(activity.createdAt)}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-gray-500">No recent activity</p>
                            )}
                        </div>
                        <Link href="/dashboard/notifications" className="block mt-4 text-sm text-violet-400 hover:text-violet-300">
                            View all activity →
                        </Link>
                    </div>

                    {/* Upcoming Events */}
                    <div className="bg-white/[0.02] backdrop-blur-sm border border-white/[0.08] rounded-2xl p-6">
                        <h2 className="text-lg font-semibold text-white mb-4">Your Upcoming Events</h2>
                        <div className="space-y-4">
                            {loading ? (
                                [...Array(2)].map((_, i) => (
                                    <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                                        <div className="w-14 h-14 rounded-xl bg-white/10 animate-pulse" />
                                        <div className="flex-1">
                                            <div className="w-3/4 h-4 bg-white/10 rounded animate-pulse mb-2" />
                                            <div className="w-1/2 h-3 bg-white/10 rounded animate-pulse" />
                                        </div>
                                    </div>
                                ))
                            ) : upcomingTickets.length > 0 ? (
                                upcomingTickets.map((ticket) => {
                                    const eventDate = new Date(ticket.event?.date);
                                    return (
                                        <div key={ticket._id} className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-500/30 to-pink-500/30 flex items-center justify-center">
                                                <div className="text-center">
                                                    <div className="text-xs text-gray-400">{eventDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}</div>
                                                    <div className="text-lg font-bold text-white">{eventDate.getDate()}</div>
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-white truncate">{ticket.event?.name}</p>
                                                <p className="text-xs text-gray-400">{ticket.event?.startTime} • {ticket.event?.venue?.name || 'TBA'}</p>
                                            </div>
                                            <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs">Attending</span>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="text-sm text-gray-500 text-center py-4">No upcoming events</p>
                            )}
                        </div>
                        <Link href="/dashboard/events" className="block mt-4 text-sm text-violet-400 hover:text-violet-300">
                            View all events →
                        </Link>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
