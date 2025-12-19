'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import PartyBackground from '@/components/PartyBackground';
import VenueCard from '@/components/VenueCard';
import { VenueCardSkeleton, Input, Button, Select } from '@/components/ui';
import { venuesApi } from '@/lib/api';
import { Venue } from '@/lib/types';

const cities = [
    { value: 'All', label: 'All Cities' },
    { value: 'Mumbai', label: 'Mumbai' },
    { value: 'Delhi', label: 'Delhi' },
    { value: 'Bangalore', label: 'Bangalore' },
    { value: 'Chennai', label: 'Chennai' },
    { value: 'Hyderabad', label: 'Hyderabad' },
    { value: 'Pune', label: 'Pune' },
    { value: 'Kolkata', label: 'Kolkata' },
    { value: 'North Goa', label: 'Goa' },
];

const sortOptions = [
    { value: 'topRated', label: 'Top Rated' },
    { value: 'inDemand', label: 'In Demand' },
    { value: 'latest', label: 'Latest' },
    { value: 'nearby', label: 'Near You' },
];

export default function VenuesPage() {
    const [venues, setVenues] = useState<Venue[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCity, setSelectedCity] = useState('All');
    const [selectedSort, setSelectedSort] = useState('topRated');
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [locationError, setLocationError] = useState(false);

    useEffect(() => {
        fetchVenues();
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

    const fetchVenues = async () => {
        try {
            setIsLoading(true);
            const data = await venuesApi.getAll({ status: 'approved' });
            // Handle both array response and object response with venues property
            const venuesArray = Array.isArray(data) ? data : (data as { venues?: Venue[] }).venues || [];
            setVenues(venuesArray as Venue[]);
        } catch (error) {
            console.error('Failed to fetch venues:', error);
            setVenues([]);
        } finally {
            setIsLoading(false);
        }
    };

    const isFiltered = searchQuery !== '' || selectedCity !== 'All' || selectedSort !== 'topRated';

    // Sorting functions
    const sortByTopRated = (a: Venue, b: Venue) => b.rating.average - a.rating.average;
    const sortByInDemand = (a: Venue, b: Venue) => b.rating.count - a.rating.count; // More reviews = more demand
    const sortByLatest = (a: Venue, b: Venue) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

    const filteredVenues = venues
        .filter((venue) => {
            const matchesSearch = venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                venue.description.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCity = selectedCity === 'All' || venue.address.city === selectedCity;
            return matchesSearch && matchesCity;
        })
        .sort((a, b) => {
            if (selectedSort === 'inDemand') return sortByInDemand(a, b);
            if (selectedSort === 'latest') return sortByLatest(a, b);
            return sortByTopRated(a, b);
        });

    // Sections for non-filtered view
    const topRatedVenues = [...venues].sort(sortByTopRated).slice(0, 4);
    const inDemandVenues = [...venues].sort(sortByInDemand).slice(0, 4);
    const latestVenues = [...venues].sort(sortByLatest).slice(0, 4);
    // Nearby would require actual geo sorting - for now show all if location available
    const nearbyVenues = location ? venues.slice(0, 4) : [];

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
                alert('Please enable location services in your browser settings to see nearby venues.');
            }
        );
    };

    const Section = ({ title, data, sort }: { title: string; data: Venue[]; sort?: string }) => {
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
                    {data.map((venue) => (
                        <VenueCard key={venue._id} venue={venue} />
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
                            Discover <span className="text-violet-400">Venues</span>
                        </h1>
                        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                            Find the perfect space for your next event. From intimate gatherings to grand celebrations.
                        </p>
                    </div>

                    {/* Search & Filter Bar */}
                    <div className="relative z-30 bg-black/70 backdrop-blur-sm border border-white/10 rounded-2xl p-4 mb-12 shadow-2xl transition-all">
                        <div className="flex flex-col md:flex-row gap-4 items-center">
                            <div className="flex-1 w-full">
                                <Input
                                    placeholder="Search venues, locations, amenities..."
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
                                        value={selectedCity}
                                        onChange={setSelectedCity}
                                        options={cities}
                                        placeholder="City"
                                        icon={
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <VenueCardSkeleton key={i} />
                            ))}
                        </div>
                    )}

                    {!isLoading && !isFiltered && (
                        <>
                            <Section title="Top Rated" data={topRatedVenues} sort="topRated" />
                            <Section title="In Demand" data={inDemandVenues} sort="inDemand" />
                            <Section title="Recently Added" data={latestVenues} sort="latest" />

                            {/* CTA Section */}
                            <div className="my-20 relative overflow-hidden rounded-3xl border border-white/10 bg-black/70 backdrop-blur-sm p-8 md:p-12 text-center group">
                                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay"></div>
                                <div className="relative z-10">
                                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                                        Looking to list a venue?
                                    </h2>
                                    <p className="text-gray-400 mb-8 max-w-xl mx-auto text-lg">
                                        Partner with us and reach thousands of event organizers. List your venue and start receiving booking requests.
                                    </p>
                                    <Button size="lg" className="bg-white text-black hover:bg-gray-200 font-bold px-8">
                                        List Your Venue
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
                                    nearbyVenues.length > 0 ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                            {nearbyVenues.map((venue) => (
                                                <VenueCard key={venue._id} venue={venue} />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12 border border-white/5 rounded-2xl bg-white/5">
                                            <p className="text-gray-400">No venues found near your location.</p>
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
                                        <h3 className="text-xl font-bold text-white mb-2">Locate Venues Nearby</h3>
                                        <p className="text-gray-400 max-w-md mb-6">
                                            Enable location access to discover venues near you.
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
                            {filteredVenues.map((venue) => (
                                <VenueCard key={venue._id} venue={venue} />
                            ))}
                            {filteredVenues.length === 0 && (
                                <div className="col-span-full text-center py-20 text-gray-500">
                                    <p className="text-xl">No venues found matching your criteria</p>
                                    <Button
                                        variant="ghost"
                                        className="mt-4 text-violet-400 hover:text-violet-300"
                                        onClick={() => {
                                            setSearchQuery('');
                                            setSelectedCity('All');
                                            setSelectedSort('topRated');
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
