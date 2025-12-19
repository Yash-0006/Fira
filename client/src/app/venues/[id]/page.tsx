'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import PartyBackground from '@/components/PartyBackground';
import { Button, Modal } from '@/components/ui';
import { venuesApi } from '@/lib/api';
import { Venue } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/Toast';

export default function VenueDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { isAuthenticated } = useAuth();
    const { showToast } = useToast();
    const [venue, setVenue] = useState<Venue | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<string | null>(() => {
        const today = new Date();
        // Use local date format to avoid timezone issues
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    });

    // Format date for display as dd/mm/yyyy
    const formatDateForDisplay = (dateStr: string | null) => {
        if (!dateStr) return '';
        const [year, month, day] = dateStr.split('-');
        return `${day}/${month}/${year}`;
    };
    const [bookingData, setBookingData] = useState({
        date: '',
        startTime: '',
        endTime: '',
        guests: 50,
        purpose: '',
    });

    useEffect(() => {
        if (params.id) {
            fetchVenue(params.id as string);
        }
    }, [params.id]);

    const fetchVenue = async (id: string) => {
        try {
            setIsLoading(true);
            const data = await venuesApi.getById(id);
            setVenue(data as Venue);
        } catch (error) {
            console.error('Failed to fetch venue:', error);
            // Use mock data
            setVenue(getMockVenue(id));
        } finally {
            setIsLoading(false);
        }
    };

    const handleBooking = () => {
        if (!isAuthenticated) {
            showToast('Please sign in to book this venue', 'warning');
            router.push('/signin');
            return;
        }
        // Set the selected date in booking data when opening modal
        if (selectedDate) {
            setBookingData({ ...bookingData, date: selectedDate });
        }
        setIsBookingModalOpen(true);
    };

    const submitBooking = async () => {
        try {
            showToast('Booking request sent! Awaiting owner approval.', 'success');
            setIsBookingModalOpen(false);
        } catch {
            showToast('Failed to submit booking request', 'error');
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(price);
    };

    if (isLoading) {
        return (
            <>
                <PartyBackground />
                <Navbar />
                <main className="relative z-20 min-h-screen pt-28 pb-16 px-4">
                    <div className="max-w-6xl mx-auto">
                        <div className="animate-pulse">
                            <div className="h-96 bg-white/5 rounded-2xl mb-8" />
                            <div className="h-8 bg-white/5 rounded w-1/3 mb-4" />
                            <div className="h-4 bg-white/5 rounded w-full mb-2" />
                            <div className="h-4 bg-white/5 rounded w-2/3" />
                        </div>
                    </div>
                </main>
            </>
        );
    }

    if (!venue) {
        return (
            <>
                <PartyBackground />
                <Navbar />
                <main className="relative z-20 min-h-screen pt-28 pb-16 px-4 flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-white mb-2">Venue not found</h1>
                        <p className="text-gray-400 mb-6">The venue you&apos;re looking for doesn&apos;t exist.</p>
                        <Button onClick={() => router.push('/venues')}>Browse Venues</Button>
                    </div>
                </main>
            </>
        );
    }

    return (
        <>
            <PartyBackground />
            <Navbar />

            <main className="relative z-20 min-h-screen pt-28 pb-16 px-4">
                <div className="max-w-6xl mx-auto">
                    {/* Image Gallery */}
                    <div className="mb-8">
                        <div className="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden mb-4">
                            {venue.images && venue.images.length > 0 ? (
                                <img
                                    src={venue.images[selectedImage]}
                                    alt={venue.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-violet-500/20 to-pink-500/20 flex items-center justify-center">
                                    <svg className="w-24 h-24 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16" />
                                    </svg>
                                </div>
                            )}
                        </div>

                        {/* Thumbnail Gallery */}
                        {venue.images && venue.images.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto pb-2">
                                {venue.images.map((image, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedImage(index)}
                                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${selectedImage === index ? 'border-violet-500' : 'border-transparent opacity-60 hover:opacity-100'
                                            }`}
                                    >
                                        <img src={image} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Title & Location */}
                            <div>
                                <div className="flex items-center gap-3 mb-3">
                                    <h1 className="text-3xl md:text-4xl font-bold text-white">{venue.name}</h1>
                                    {venue.status === 'approved' && (
                                        <span className="px-2 py-1 rounded-full bg-green-500/20 border border-green-500/30 text-green-400 text-xs font-medium">
                                            Verified
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 text-gray-400 mb-4">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    </svg>
                                    <span>{venue.address.street}, {venue.address.city}, {venue.address.state}</span>
                                </div>

                                {/* Owner Info */}
                                {venue.owner && typeof venue.owner === 'object' && (
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white font-medium overflow-hidden">
                                            {(venue.owner as { avatar?: string; name?: string }).avatar ? (
                                                <img src={(venue.owner as { avatar: string }).avatar} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                (venue.owner as { name?: string }).name?.charAt(0).toUpperCase()
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-white font-medium">{(venue.owner as { name?: string }).name}</span>
                                                <svg className="w-4 h-4 text-violet-400" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <span className="text-gray-400 text-sm">Venue Owner</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Description */}
                            <div className="bg-black/70 backdrop-blur-sm border border-white/5 rounded-2xl p-6">
                                <h2 className="text-xl font-semibold text-white mb-4">About this venue</h2>
                                <p className="text-gray-400 leading-relaxed">{venue.description}</p>
                            </div>

                            {/* Amenities */}
                            {venue.amenities && venue.amenities.length > 0 && (
                                <div className="bg-black/70 backdrop-blur-sm border border-white/5 rounded-2xl p-6">
                                    <h2 className="text-xl font-semibold text-white mb-4">Amenities</h2>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {venue.amenities.map((amenity, index) => (
                                            <div key={index} className="flex items-center gap-2 text-gray-300">
                                                <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                {amenity}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Rules */}
                            {venue.rules && venue.rules.length > 0 && (
                                <div className="bg-black/70 backdrop-blur-sm border border-white/5 rounded-2xl p-6">
                                    <h2 className="text-xl font-semibold text-white mb-4">Venue Rules</h2>
                                    <ul className="space-y-2">
                                        {venue.rules.map((rule, index) => (
                                            <li key={index} className="flex items-start gap-2 text-gray-400">
                                                <svg className="w-5 h-5 text-yellow-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                </svg>
                                                {rule}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Day-wise Availability Calendar */}
                            <div className="bg-black/70 backdrop-blur-sm border border-white/5 rounded-2xl p-6">
                                <h2 className="text-xl font-semibold text-white mb-4">Availability Calendar</h2>
                                <p className="text-gray-400 text-sm mb-6">Showing availability for the next 2 months. Day-wise booking only.</p>

                                {/* Legend */}
                                <div className="flex flex-wrap gap-4 mb-6">
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded bg-green-500/30 border border-green-500/50"></div>
                                        <span className="text-sm text-gray-400">Available</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded bg-red-500/30 border border-red-500/50"></div>
                                        <span className="text-sm text-gray-400">Booked</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded bg-gray-500/30 border border-gray-500/50"></div>
                                        <span className="text-sm text-gray-400">Unavailable</span>
                                    </div>
                                </div>

                                {/* Calendar Grid */}
                                <div className="grid grid-cols-7 gap-2">
                                    {/* Day headers */}
                                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                                        <div key={day} className="text-center text-xs text-gray-500 font-medium py-2">
                                            {day}
                                        </div>
                                    ))}

                                    {/* Generate 60 days of slots */}
                                    {(() => {
                                        const slots = [];
                                        const today = new Date();
                                        today.setHours(0, 0, 0, 0);

                                        // Add empty slots for days before the start day of week
                                        const firstDayOfWeek = today.getDay();
                                        for (let i = 0; i < firstDayOfWeek; i++) {
                                            slots.push(
                                                <div key={`empty-${i}`} className="aspect-square"></div>
                                            );
                                        }

                                        // Generate 60 days
                                        for (let i = 0; i < 60; i++) {
                                            const date = new Date(today);
                                            date.setDate(date.getDate() + i);

                                            // Check if this date is in blockedDates or daySlots
                                            const daySlot = (venue as Venue & { daySlots?: Array<{ date: string; isAvailable: boolean; isBooked: boolean }> }).daySlots?.find(
                                                (slot) => new Date(slot.date).toDateString() === date.toDateString()
                                            );

                                            let bgClass = 'bg-green-500/20 border-green-500/40 hover:bg-green-500/30 cursor-pointer';
                                            // Use local date format to avoid timezone issues
                                            const year = date.getFullYear();
                                            const month = String(date.getMonth() + 1).padStart(2, '0');
                                            const day = String(date.getDate()).padStart(2, '0');
                                            const dateStr = `${year}-${month}-${day}`;
                                            const isSelected = selectedDate === dateStr;

                                            if (daySlot?.isBooked) {
                                                bgClass = 'bg-red-500/20 border-red-500/40 cursor-not-allowed';
                                            } else if (daySlot && !daySlot.isAvailable) {
                                                bgClass = 'bg-gray-500/20 border-gray-500/40 cursor-not-allowed';
                                            } else if (isSelected) {
                                                bgClass = 'bg-violet-500/30 border-violet-500 ring-2 ring-violet-500 cursor-pointer';
                                            }

                                            const isToday = i === 0;

                                            slots.push(
                                                <button
                                                    key={date.toISOString()}
                                                    className={`aspect-square rounded-lg border text-xs font-medium flex flex-col items-center justify-center transition-colors ${bgClass}`}
                                                    onClick={() => {
                                                        if (!daySlot?.isBooked && daySlot?.isAvailable !== false) {
                                                            setSelectedDate(dateStr);
                                                        }
                                                    }}
                                                    disabled={daySlot?.isBooked || daySlot?.isAvailable === false}
                                                >
                                                    <span className={`${isSelected ? 'text-violet-300' : isToday ? 'text-violet-400' : 'text-gray-300'}`}>
                                                        {date.getDate()}
                                                    </span>
                                                    <span className="text-[10px] text-gray-500">
                                                        {date.toLocaleString('default', { month: 'short' })}
                                                    </span>
                                                </button>
                                            );
                                        }

                                        return slots;
                                    })()}
                                </div>
                            </div>
                        </div>

                        {/* Sidebar - Booking Card */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-28 bg-black/70 backdrop-blur-sm border border-white/5 rounded-2xl p-6">
                                {/* Price */}
                                <div className="mb-6">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl font-bold text-white">{formatPrice(venue.pricing.basePrice)}</span>
                                        <span className="text-gray-400">base price</span>
                                    </div>
                                    {venue.pricing.pricePerHour && (
                                        <p className="text-sm text-gray-500 mt-1">
                                            + {formatPrice(venue.pricing.pricePerHour)} per hour
                                        </p>
                                    )}
                                </div>

                                {/* Quick Info */}
                                <div className="space-y-4 mb-6 pb-6 border-b border-white/10">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-400">Capacity</span>
                                        <span className="text-white">{venue.capacity.min} - {venue.capacity.max} guests</span>
                                    </div>
                                    {venue.rating.count > 0 && (
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-400">Rating</span>
                                            <div className="flex items-center gap-1">
                                                <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                                <span className="text-white">{venue.rating.average.toFixed(1)}</span>
                                                <span className="text-gray-500">({venue.rating.count} reviews)</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <Button className="w-full" size="lg" onClick={handleBooking}>
                                    Request Booking
                                </Button>

                                <p className="text-xs text-gray-500 text-center mt-4">
                                    You won&apos;t be charged until the owner accepts your request
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Booking Modal */}
            <Modal
                isOpen={isBookingModalOpen}
                onClose={() => setIsBookingModalOpen(false)}
                title="Request Booking"
                size="lg"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Selected Date</label>
                        <div className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white">
                            {selectedDate ? formatDateForDisplay(selectedDate) : 'Please select a date from the calendar'}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Select a different date from the calendar above if needed</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Start Time</label>
                            <input
                                type="time"
                                value={bookingData.startTime}
                                onChange={(e) => setBookingData({ ...bookingData, startTime: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">End Time</label>
                            <input
                                type="time"
                                value={bookingData.endTime}
                                onChange={(e) => setBookingData({ ...bookingData, endTime: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Expected Guests</label>
                        <input
                            type="number"
                            min={venue?.capacity.min}
                            max={venue?.capacity.max}
                            value={bookingData.guests}
                            onChange={(e) => setBookingData({ ...bookingData, guests: parseInt(e.target.value) })}
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Purpose / Event Type</label>
                        <textarea
                            value={bookingData.purpose}
                            onChange={(e) => setBookingData({ ...bookingData, purpose: e.target.value })}
                            placeholder="Describe your event..."
                            rows={3}
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                        />
                    </div>
                    <div className="flex gap-3 pt-4">
                        <Button variant="secondary" className="flex-1" onClick={() => setIsBookingModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button className="flex-1" onClick={submitBooking}>
                            Submit Request
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    );
}

// Mock venue data
function getMockVenue(id: string): Venue {
    return {
        _id: id,
        owner: 'owner1',
        name: 'The Grand Ballroom',
        description: 'Experience luxury and elegance at The Grand Ballroom, one of the most prestigious event venues in Mumbai. Our stunning space features crystal chandeliers, marble flooring, and floor-to-ceiling windows overlooking the Arabian Sea. Perfect for weddings, corporate events, galas, and celebrations of all kinds.\n\nWith a dedicated team of event professionals and state-of-the-art facilities, we ensure every event is executed flawlessly. Our in-house catering team offers a diverse menu of international and local cuisines to delight your guests.',
        images: [
            'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200',
            'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800',
            'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=800',
            'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800',
        ],
        videos: [],
        capacity: { min: 50, max: 500 },
        pricing: { basePrice: 50000, pricePerHour: 5000, currency: 'INR' },
        amenities: ['Parking', 'Catering', 'Sound System', 'Lighting', 'AC', 'WiFi', 'Stage', 'Green Room', 'Valet', 'Security'],
        rules: ['No outside alcohol', 'Event must end by midnight', 'Advance booking required', 'Decoration approval needed'],
        location: { type: 'Point', coordinates: [72.8777, 19.0760] },
        address: { street: 'Marine Drive', city: 'Mumbai', state: 'Maharashtra', pincode: '400002', country: 'India' },
        availability: [],
        blockedDates: [],
        status: 'approved',
        rating: { average: 4.8, count: 124 },
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
}
