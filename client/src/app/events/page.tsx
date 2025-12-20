'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import PartyBackground from '@/components/PartyBackground';
import EventCard from '@/components/EventCard';
import { Input, Button, Select } from '@/components/ui';
import { eventsApi } from '@/lib/api';
import { Event } from '@/lib/types';

const categories = [
    { value: 'All', label: 'All Categories' },
    { value: 'Party', label: 'Party' },
    { value: 'Concert', label: 'Concert' },
    { value: 'Wedding', label: 'Wedding' },
    { value: 'Corporate', label: 'Corporate' },
    { value: 'Birthday', label: 'Birthday' },
    { value: 'Festival', label: 'Festival' },
];

const sortOptions = [
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'top', label: 'Top Events' },
    { value: 'latest', label: 'Latest' },
    { value: 'nearby', label: 'Near You' },
];

export default function EventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedSort, setSelectedSort] = useState('upcoming');
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [locationError, setLocationError] = useState(false);

    useEffect(() => {
        fetchEvents();
    }, []);

    // Request location on mount
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                () => setLocationError(true)
            );
        } else {
            setLocationError(true);
        }
    }, []);

    const fetchEvents = async () => {
        try {
            setIsLoading(true);
            const data = await eventsApi.getUpcoming();
            setEvents(data as Event[]);
        } catch (error) {
            console.error('Failed to fetch events:', error);
            setEvents(getMockEvents());
        } finally {
            setIsLoading(false);
        }
    };

    const isFiltered = searchQuery !== '' || selectedCategory !== 'All' || selectedSort !== 'upcoming';

    // Sorting functions
    const sortByUpcoming = (a: Event, b: Event) => new Date(a.date).getTime() - new Date(b.date).getTime();
    const sortByTop = (a: Event, b: Event) => b.currentAttendees - a.currentAttendees;
    const sortByLatest = (a: Event, b: Event) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

    const filteredEvents = events
        .filter((event) => {
            const matchesSearch = event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                event.description.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = selectedCategory === 'All' ||
                event.category.toLowerCase() === selectedCategory.toLowerCase();
            return matchesSearch && matchesCategory;
        })
        .sort((a, b) => {
            if (selectedSort === 'top') return sortByTop(a, b);
            if (selectedSort === 'latest') return sortByLatest(a, b);
            return sortByUpcoming(a, b);
        });

    // Sections for non-filtered view
    const upcomingEvents = [...events].sort(sortByUpcoming).slice(0, 4);
    const topEvents = [...events].sort(sortByTop).slice(0, 4);
    const latestEvents = [...events].sort(sortByLatest).slice(0, 4);
    // Nearby would require actual geo sorting - for now show all if location available
    const nearbyEvents = location ? events.slice(0, 4) : [];

    const handleSeeAll = (sort: string) => {
        setSelectedSort(sort);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleEnableLocation = () => {
        if (!navigator.geolocation) return;

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                setLocationError(false);
            },
            () => {
                setLocationError(true);
                alert('Please enable location services in your browser settings to see nearby events.');
            }
        );
    };

    const Section = ({ title, data, sort }: { title: string; data: Event[]; sort?: string }) => {
        if (!data || data.length === 0) return null;

        return (
            <div className="mb-16">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white relative pl-4">
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-violet-500 to-pink-500 rounded-full"></span>
                        {title}
                    </h2>
                    {sort && (
                        <Button
                            variant="ghost"
                            className="text-gray-400 hover:text-white text-sm"
                            onClick={() => handleSeeAll(sort)}
                        >
                            See All
                        </Button>
                    )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {data.map((event) => (
                        <EventCard key={event._id} event={event} />
                    ))}
                </div>
            </div>
        );
    };

    return (
        <>
            <PartyBackground />
            <Navbar />

            <main className="relative z-20 min-h-screen pt-28 pb-16 px-4">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6">
                            Discover <span className="text-violet-400">Events</span>
                        </h1>
                        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                            Find the hottest parties, concerts, and gatherings happening near you.
                        </p>
                    </div>

                    {/* Search & Filter Bar */}
                    <div className="relative z-30 bg-black/70 backdrop-blur-sm border border-white/10 rounded-2xl p-4 mb-12 shadow-2xl transition-all">
                        <div className="flex flex-col md:flex-row gap-4 items-center">
                            <div className="flex-1 w-full">
                                <Input
                                    placeholder="Search events, venues, organizers..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="bg-black/40 border-white/10 focus:bg-black/60 h-[42px]"
                                    leftIcon={
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    }
                                />
                            </div>
                            <div className="flex gap-4 w-full md:w-auto">
                                <div className="w-full md:w-48">
                                    <Select
                                        value={selectedCategory}
                                        onChange={setSelectedCategory}
                                        options={categories}
                                        placeholder="Category"
                                        icon={
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                            </svg>
                                        }
                                    />
                                </div>
                                <div className="w-full md:w-48">
                                    <Select
                                        value={selectedSort}
                                        onChange={setSelectedSort}
                                        options={sortOptions}
                                        placeholder="Sort by"
                                        icon={
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                                            </svg>
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {isLoading && (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
                        </div>
                    )}

                    {!isLoading && !isFiltered && (
                        <>
                            <Section title="Upcoming Events" data={upcomingEvents} sort="upcoming" />
                            <Section title="Top Events" data={topEvents} sort="top" />
                            <Section title="Latest Events" data={latestEvents} sort="latest" />

                            {/* CTA Section */}
                            <div className="my-20 relative overflow-hidden rounded-3xl border border-white/10 bg-black/70 backdrop-blur-sm p-8 md:p-12 text-center group">
                                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay"></div>
                                <div className="relative z-10">
                                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                                        Want to create an event?
                                    </h2>
                                    <p className="text-gray-400 mb-8 max-w-xl mx-auto text-lg">
                                        Host your own party, concert, or gathering. Reach thousands of attendees and make it unforgettable.
                                    </p>
                                    <Button size="lg" className="bg-white text-black hover:bg-gray-200 font-bold px-8">
                                        Create Event
                                    </Button>
                                </div>
                            </div>

                            {/* Near You Section */}
                            <div className="mb-16">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold text-white relative pl-4">
                                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-violet-500 to-pink-500 rounded-full"></span>
                                        Near You
                                    </h2>
                                    {location && (
                                        <Button
                                            variant="ghost"
                                            className="text-gray-400 hover:text-white text-sm"
                                            onClick={() => handleSeeAll('nearby')}
                                        >
                                            See All
                                        </Button>
                                    )}
                                </div>

                                {location ? (
                                    nearbyEvents.length > 0 ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                            {nearbyEvents.map((event) => (
                                                <EventCard key={event._id} event={event} />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12 border border-white/5 rounded-2xl bg-white/5">
                                            <p className="text-gray-400">No events found near your location.</p>
                                        </div>
                                    )
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-16 border border-white/10 rounded-2xl bg-gradient-to-b from-white/5 to-transparent text-center">
                                        <div className="w-16 h-16 bg-violet-500/20 rounded-full flex items-center justify-center mb-4">
                                            <svg className="w-8 h-8 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-2">Locate Events Nearby</h3>
                                        <p className="text-gray-400 max-w-md mb-6">
                                            Enable location access to discover events happening around you.
                                        </p>
                                        <Button
                                            onClick={handleEnableLocation}
                                            variant="violet"
                                        >
                                            Enable Location
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {!isLoading && isFiltered && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {filteredEvents.map((event) => (
                                <EventCard key={event._id} event={event} />
                            ))}
                            {filteredEvents.length === 0 && (
                                <div className="col-span-full text-center py-20 text-gray-500">
                                    <p className="text-xl">No events found matching your criteria</p>
                                    <Button
                                        variant="ghost"
                                        className="mt-4 text-violet-400 hover:text-violet-300"
                                        onClick={() => {
                                            setSearchQuery('');
                                            setSelectedCategory('All');
                                            setSelectedSort('upcoming');
                                        }}
                                    >
                                        Clear Filters
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </>
    );
}

// Mock data for demo purposes
function getMockEvents(): Event[] {
    return [
        {
            _id: '1',
            organizer: { _id: 'u1', name: 'DJ Cosmic', email: '', avatar: null, phone: null, role: 'user', isVerified: true, emailVerified: true, verificationBadge: 'brand', socialLinks: { instagram: null, twitter: null, facebook: null, website: null }, followers: [], following: [], bankDetails: { accountName: null, accountNumber: null, ifscCode: null, bankName: null }, isActive: true, createdAt: '', updatedAt: '' },
            venue: { _id: 'v1', name: 'Skyline Terrace', owner: '', description: '', images: [], videos: [], capacity: { min: 0, max: 0 }, pricing: { basePrice: 0, pricePerHour: null, currency: 'INR' }, amenities: [], rules: [], location: { type: 'Point', coordinates: [0, 0] }, address: { street: '', city: 'Mumbai', state: '', pincode: '', country: '' }, availability: [], blockedDates: [], status: 'approved', rating: { average: 0, count: 0 }, isActive: true, createdAt: '', updatedAt: '' },
            booking: null,
            name: 'Neon Nights Festival',
            description: 'An electrifying night of EDM and visual art.',
            images: ['https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800'],
            date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            startTime: '21:00',
            endTime: '04:00',
            eventType: 'public',
            ticketType: 'paid',
            ticketPrice: 1500,
            maxAttendees: 500,
            currentAttendees: 342,
            privateCode: null,
            category: 'party',
            tags: ['EDM', 'Dance', 'Neon'],
            status: 'upcoming',
            isFeatured: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            _id: '2',
            organizer: { _id: 'u2', name: 'Indie Collective', email: '', avatar: null, phone: null, role: 'user', isVerified: true, emailVerified: true, verificationBadge: 'band', socialLinks: { instagram: null, twitter: null, facebook: null, website: null }, followers: [], following: [], bankDetails: { accountName: null, accountNumber: null, ifscCode: null, bankName: null }, isActive: true, createdAt: '', updatedAt: '' },
            venue: { _id: 'v2', name: 'The Loft Studio', owner: '', description: '', images: [], videos: [], capacity: { min: 0, max: 0 }, pricing: { basePrice: 0, pricePerHour: null, currency: 'INR' }, amenities: [], rules: [], location: { type: 'Point', coordinates: [0, 0] }, address: { street: '', city: 'Bangalore', state: '', pincode: '', country: '' }, availability: [], blockedDates: [], status: 'approved', rating: { average: 0, count: 0 }, isActive: true, createdAt: '', updatedAt: '' },
            booking: null,
            name: 'Acoustic Evening',
            description: 'An intimate acoustic session with local artists.',
            images: ['https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800'],
            date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
            startTime: '19:00',
            endTime: '22:00',
            eventType: 'public',
            ticketType: 'free',
            ticketPrice: 0,
            maxAttendees: 80,
            currentAttendees: 65,
            privateCode: null,
            category: 'concert',
            tags: ['Acoustic', 'Live Music', 'Indie'],
            status: 'upcoming',
            isFeatured: true,
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            _id: '3',
            organizer: { _id: 'u3', name: 'TechMeet India', email: '', avatar: null, phone: null, role: 'user', isVerified: false, emailVerified: true, verificationBadge: 'none', socialLinks: { instagram: null, twitter: null, facebook: null, website: null }, followers: [], following: [], bankDetails: { accountName: null, accountNumber: null, ifscCode: null, bankName: null }, isActive: true, createdAt: '', updatedAt: '' },
            venue: { _id: 'v3', name: 'Conference Center', owner: '', description: '', images: [], videos: [], capacity: { min: 0, max: 0 }, pricing: { basePrice: 0, pricePerHour: null, currency: 'INR' }, amenities: [], rules: [], location: { type: 'Point', coordinates: [0, 0] }, address: { street: '', city: 'Hyderabad', state: '', pincode: '', country: '' }, availability: [], blockedDates: [], status: 'approved', rating: { average: 0, count: 0 }, isActive: true, createdAt: '', updatedAt: '' },
            booking: null,
            name: 'Startup Mixer 2025',
            description: 'Network with founders, investors, and tech enthusiasts.',
            images: ['https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800'],
            date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
            startTime: '10:00',
            endTime: '18:00',
            eventType: 'public',
            ticketType: 'paid',
            ticketPrice: 500,
            maxAttendees: 200,
            currentAttendees: 156,
            privateCode: null,
            category: 'corporate',
            tags: ['Startup', 'Networking', 'Tech'],
            status: 'upcoming',
            isFeatured: false,
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            _id: '4',
            organizer: { _id: 'u4', name: 'Priya & Rahul', email: '', avatar: null, phone: null, role: 'user', isVerified: false, emailVerified: true, verificationBadge: 'none', socialLinks: { instagram: null, twitter: null, facebook: null, website: null }, followers: [], following: [], bankDetails: { accountName: null, accountNumber: null, ifscCode: null, bankName: null }, isActive: true, createdAt: '', updatedAt: '' },
            venue: { _id: 'v4', name: 'Heritage Villa', owner: '', description: '', images: [], videos: [], capacity: { min: 0, max: 0 }, pricing: { basePrice: 0, pricePerHour: null, currency: 'INR' }, amenities: [], rules: [], location: { type: 'Point', coordinates: [0, 0] }, address: { street: '', city: 'Delhi', state: '', pincode: '', country: '' }, availability: [], blockedDates: [], status: 'approved', rating: { average: 0, count: 0 }, isActive: true, createdAt: '', updatedAt: '' },
            booking: null,
            name: 'Wedding Reception',
            description: 'Join us for an evening of celebration and joy.',
            images: ['https://images.unsplash.com/photo-1519741497674-611481863552?w=800'],
            date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
            startTime: '18:00',
            endTime: '23:00',
            eventType: 'private',
            ticketType: 'free',
            ticketPrice: 0,
            maxAttendees: 300,
            currentAttendees: 0,
            privateCode: 'PR2025',
            category: 'wedding',
            tags: ['Wedding', 'Reception', 'Celebration'],
            status: 'upcoming',
            isFeatured: false,
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            _id: '5',
            organizer: { _id: 'u5', name: 'RetroBeats Club', email: '', avatar: null, phone: null, role: 'user', isVerified: true, emailVerified: true, verificationBadge: 'organizer', socialLinks: { instagram: null, twitter: null, facebook: null, website: null }, followers: [], following: [], bankDetails: { accountName: null, accountNumber: null, ifscCode: null, bankName: null }, isActive: true, createdAt: '', updatedAt: '' },
            venue: { _id: 'v5', name: 'Beach Resort Pavilion', owner: '', description: '', images: [], videos: [], capacity: { min: 0, max: 0 }, pricing: { basePrice: 0, pricePerHour: null, currency: 'INR' }, amenities: [], rules: [], location: { type: 'Point', coordinates: [0, 0] }, address: { street: '', city: 'Chennai', state: '', pincode: '', country: '' }, availability: [], blockedDates: [], status: 'approved', rating: { average: 0, count: 0 }, isActive: true, createdAt: '', updatedAt: '' },
            booking: null,
            name: 'Retro Beach Party',
            description: '80s and 90s vibes at the beach with live DJs.',
            images: ['https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800'],
            date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
            startTime: '17:00',
            endTime: '01:00',
            eventType: 'public',
            ticketType: 'paid',
            ticketPrice: 999,
            maxAttendees: 400,
            currentAttendees: 287,
            privateCode: null,
            category: 'party',
            tags: ['Retro', 'Beach', 'Party'],
            status: 'upcoming',
            isFeatured: true,
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            _id: '6',
            organizer: { _id: 'u6', name: 'Sarah', email: '', avatar: null, phone: null, role: 'user', isVerified: false, emailVerified: true, verificationBadge: 'none', socialLinks: { instagram: null, twitter: null, facebook: null, website: null }, followers: [], following: [], bankDetails: { accountName: null, accountNumber: null, ifscCode: null, bankName: null }, isActive: true, createdAt: '', updatedAt: '' },
            venue: { _id: 'v6', name: 'Garden Marquee', owner: '', description: '', images: [], videos: [], capacity: { min: 0, max: 0 }, pricing: { basePrice: 0, pricePerHour: null, currency: 'INR' }, amenities: [], rules: [], location: { type: 'Point', coordinates: [0, 0] }, address: { street: '', city: 'Pune', state: '', pincode: '', country: '' }, availability: [], blockedDates: [], status: 'approved', rating: { average: 0, count: 0 }, isActive: true, createdAt: '', updatedAt: '' },
            booking: null,
            name: 'Birthday Bash - Sarah Turns 30!',
            description: 'Celebrating three decades of awesomeness!',
            images: ['https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800'],
            date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
            startTime: '19:00',
            endTime: '00:00',
            eventType: 'private',
            ticketType: 'free',
            ticketPrice: 0,
            maxAttendees: 50,
            currentAttendees: 0,
            privateCode: 'SARAH30',
            category: 'birthday',
            tags: ['Birthday', 'Party', 'Celebration'],
            status: 'upcoming',
            isFeatured: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
    ];
}
