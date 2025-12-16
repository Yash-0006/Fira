'use client';

import Link from 'next/link';

const parties = [
    {
        id: 1,
        title: 'Neon Nights: EDM Festival',
        date: 'Dec 28',
        time: '9 PM',
        venue: 'Skyline Rooftop, LA',
        image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&h=400&fit=crop',
        price: '$45',
        attendees: 342,
    },
    {
        id: 2,
        title: "New Year's Eve Gala",
        date: 'Dec 31',
        time: '8 PM',
        venue: 'The Grand Ballroom, NY',
        image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&h=400&fit=crop',
        price: '$150',
        attendees: 489,
    },
    {
        id: 3,
        title: 'Beach Sunset Party',
        date: 'Jan 12',
        time: '4 PM',
        venue: 'Ocean View Estate, Miami',
        image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600&h=400&fit=crop',
        price: '$35',
        attendees: 278,
    },
    {
        id: 4,
        title: 'Tech Startup Mixer',
        date: 'Jan 5',
        time: '6 PM',
        venue: 'Industrial Loft, Brooklyn',
        image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=400&fit=crop',
        price: 'Free',
        attendees: 156,
    },
];

export default function PartiesSection() {
    return (
        <section id="parties-section" className="min-h-screen bg-black py-24 px-4 sm:px-6 lg:px-8 flex items-center">
            <div className="max-w-6xl mx-auto w-full">
                <div className="rounded-3xl p-8 md:p-12 lg:p-16 border-2 border-white/20">
                    {/* Section Header */}
                    <div className="text-center mb-16">
                        <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 text-white">
                            Upcoming <span className="accent-text">Parties</span>
                        </h2>
                        <p className="text-gray-500 max-w-xl mx-auto">
                            Discover the hottest events happening around you
                        </p>
                    </div>

                    {/* Parties Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {parties.map((party) => (
                            <div
                                key={party.id}
                                className="glass-card overflow-hidden group cursor-pointer"
                            >
                                {/* Image */}
                                <div className="relative h-40 overflow-hidden">
                                    <img
                                        src={party.image}
                                        alt={party.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                                    {/* Date Badge */}
                                    <div className="absolute top-3 left-3 text-white">
                                        <div className="text-lg font-bold">{party.date.split(' ')[1]}</div>
                                        <div className="text-xs text-gray-300">{party.date.split(' ')[0]}</div>
                                    </div>

                                    {/* Price */}
                                    <div className="absolute bottom-3 right-3">
                                        <span className={`text-sm font-medium ${party.price === 'Free' ? 'text-emerald-400' : 'text-white'}`}>
                                            {party.price}
                                        </span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-4">
                                    <h3 className="text-sm font-medium text-white mb-1 line-clamp-1 group-hover:text-violet-400 transition-colors">
                                        {party.title}
                                    </h3>
                                    <p className="text-gray-500 text-xs flex items-center gap-1 mb-2">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        </svg>
                                        {party.venue}
                                    </p>
                                    <div className="flex items-center justify-between text-xs text-gray-600">
                                        <span>{party.time}</span>
                                        <span>{party.attendees}+ going</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* View More Button */}
                    <div className="text-center mt-12">
                        <Link
                            href="/events"
                            className="btn-primary px-6 py-3 rounded-full inline-flex items-center gap-2"
                        >
                            View all parties
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
