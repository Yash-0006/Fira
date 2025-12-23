import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import './DetailPage.css';

// Mock brand data
const mockBrand = {
    id: '1',
    name: 'Party Plus Entertainment',
    owner: 'Sarah Johnson',
    email: 'hello@partyplus.com',
    phone: '+91 87654 32109',
    category: 'Event Planner',
    followers: 8900,
    status: 'approved',
    rating: 4.7,
    totalEvents: 45,
    totalRevenue: 2850000,
    description: 'Premier event planning and entertainment company specializing in corporate events and private parties.',
    socialLinks: {
        instagram: '@partyplus',
        twitter: '@partyplusent',
    },
};

// Mock events hosted
const mockEvents = [
    { id: '1', name: 'New Year Bash 2025', venue: 'Skyline Rooftop', date: '2024-12-31', ticketsSold: 245, revenue: 367500, status: 'upcoming' },
    { id: '2', name: 'Christmas Party', venue: 'Beach Club', date: '2024-12-25', ticketsSold: 180, revenue: 270000, status: 'completed' },
    { id: '3', name: 'Corporate Gala', venue: 'Convention Center', date: '2024-12-15', ticketsSold: 320, revenue: 480000, status: 'completed' },
    { id: '4', name: 'Music Festival', venue: 'Open Grounds', date: '2024-11-30', ticketsSold: 1500, revenue: 1125000, status: 'completed' },
    { id: '5', name: 'Halloween Night', venue: 'Club Paradise', date: '2024-10-31', ticketsSold: 400, revenue: 400000, status: 'completed' },
];

export default function BrandDetail() {
    const { id } = useParams();

    const brand = mockBrand;

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div className="detail-page">
            {/* Header */}
            <div className="detail-header">
                <div className="back-nav">
                    <Link to="/brands" className="back-btn">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                        Back to Brands
                    </Link>
                </div>
                <div className="detail-title-row">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div className="avatar" style={{ width: '4rem', height: '4rem', fontSize: '1.5rem' }}>
                            {brand.name.charAt(0)}
                        </div>
                        <div>
                            <h1>{brand.name}</h1>
                            <p className="detail-meta">
                                {brand.category} • {brand.followers.toLocaleString()} followers
                            </p>
                        </div>
                    </div>
                    <span className={`badge badge-${brand.status}`}>{brand.status}</span>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="metrics-grid">
                <div className="metric-card">
                    <div className="metric-icon tickets">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" />
                            <path d="M16 2v4M8 2v4M3 10h18" />
                        </svg>
                    </div>
                    <div className="metric-info">
                        <div className="metric-value">{brand.totalEvents}</div>
                        <div className="metric-label">Events Hosted</div>
                    </div>
                </div>

                <div className="metric-card">
                    <div className="metric-icon revenue">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                        </svg>
                    </div>
                    <div className="metric-info">
                        <div className="metric-value revenue-text">{formatCurrency(brand.totalRevenue)}</div>
                        <div className="metric-label">Total Revenue</div>
                    </div>
                </div>

                <div className="metric-card">
                    <div className="metric-icon users">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                        </svg>
                    </div>
                    <div className="metric-info">
                        <div className="metric-value">{brand.followers.toLocaleString()}</div>
                        <div className="metric-label">Followers</div>
                    </div>
                </div>

                <div className="metric-card">
                    <div className="metric-icon price">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                    </div>
                    <div className="metric-info">
                        <div className="metric-value">{brand.rating}</div>
                        <div className="metric-label">Average Rating</div>
                    </div>
                </div>
            </div>

            {/* Brand Info */}
            <div className="card mt-6">
                <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Brand Information</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{brand.description}</p>

                <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                    <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Owner</div>
                        <div style={{ fontWeight: 500 }}>{brand.owner}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Email</div>
                        <div>{brand.email}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Phone</div>
                        <div>{brand.phone}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Instagram</div>
                        <div style={{ color: 'var(--accent-violet)' }}>{brand.socialLinks.instagram}</div>
                    </div>
                </div>
            </div>

            {/* Events Hosted */}
            <div className="card mt-6">
                <div className="card-header">
                    <h2>Events Hosted</h2>
                </div>

                <div className="events-list">
                    {mockEvents.map((event) => (
                        <Link to={`/events/${event.id}`} key={event.id} className="event-item">
                            <div className="event-info">
                                <h3>{event.name}</h3>
                                <div className="event-details">
                                    <span>{event.venue}</span>
                                    <span>{event.date}</span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontWeight: 600, color: 'var(--accent-green)' }}>
                                        {formatCurrency(event.revenue)}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                        {event.ticketsSold} tickets
                                    </div>
                                </div>
                                <span className={`badge badge-${event.status === 'upcoming' ? 'pending' : 'approved'}`}>
                                    {event.status}
                                </span>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-muted)' }}>
                                    <path d="M9 18l6-6-6-6" />
                                </svg>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
