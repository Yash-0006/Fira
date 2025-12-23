import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import adminApi from '../api/adminApi';
import './DetailPage.css';

const ITEMS_PER_PAGE = 5;

export default function VenueDetail() {
    const { id } = useParams();
    const [venue, setVenue] = useState(null);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchVenue();
    }, [id]);

    const fetchVenue = async () => {
        try {
            setLoading(true);
            const data = await adminApi.getVenueById(id);
            setVenue(data);
            setStats(data.stats || {});
        } catch (err) {
            console.error('Failed to fetch venue:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount || 0);
    };

    if (loading) {
        return (
            <div className="detail-page">
                <div className="detail-header">
                    <div className="back-nav">
                        <Link to="/venues" className="back-btn">← Back to Venues</Link>
                    </div>
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    if (!venue) {
        return (
            <div className="detail-page">
                <div className="detail-header">
                    <div className="back-nav">
                        <Link to="/venues" className="back-btn">← Back to Venues</Link>
                    </div>
                    <p>Venue not found</p>
                </div>
            </div>
        );
    }

    return (
        <div className="detail-page">
            {/* Header */}
            <div className="detail-header">
                <div className="back-nav">
                    <Link to="/venues" className="back-btn">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                        Back to Venues
                    </Link>
                </div>
                <div className="detail-title-row">
                    <div>
                        <h1>{venue.name}</h1>
                        <p className="detail-meta">
                            {venue.address?.street}, {venue.address?.city} • Capacity: {venue.capacity}
                        </p>
                    </div>
                    <span className={`badge badge-${venue.status}`}>{venue.status}</span>
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
                        <div className="metric-value">{stats.totalBookings || 0}</div>
                        <div className="metric-label">Total Bookings</div>
                    </div>
                </div>

                <div className="metric-card">
                    <div className="metric-icon revenue">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                        </svg>
                    </div>
                    <div className="metric-info">
                        <div className="metric-value revenue-text">{formatCurrency(stats.totalRevenue)}</div>
                        <div className="metric-label">Total Revenue</div>
                    </div>
                </div>

                <div className="metric-card">
                    <div className="metric-icon price">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 6v6l4 2" />
                        </svg>
                    </div>
                    <div className="metric-info">
                        <div className="metric-value">{formatCurrency(venue.pricePerHour)}</div>
                        <div className="metric-label">Per Hour</div>
                    </div>
                </div>

                <div className="metric-card">
                    <div className="metric-icon users">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                    </div>
                    <div className="metric-info">
                        <div className="metric-value">{venue.rating?.average?.toFixed(1) || 'N/A'}</div>
                        <div className="metric-label">Average Rating</div>
                    </div>
                </div>
            </div>

            {/* Owner Info */}
            <div className="card mt-6">
                <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Owner Information</h2>
                <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                    <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Name</div>
                        <div style={{ fontWeight: 500 }}>{venue.owner?.name || 'N/A'}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Email</div>
                        <div>{venue.owner?.email || 'N/A'}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Phone</div>
                        <div>{venue.owner?.phone || 'N/A'}</div>
                    </div>
                </div>

                {venue.amenities && venue.amenities.length > 0 && (
                    <>
                        <h3 style={{ fontSize: '0.875rem', fontWeight: 500, marginTop: '1.5rem', marginBottom: '0.75rem' }}>Amenities</h3>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {venue.amenities.map((amenity, i) => (
                                <span key={i} style={{
                                    padding: '0.375rem 0.75rem',
                                    background: 'rgba(139, 92, 246, 0.15)',
                                    color: 'var(--accent-violet)',
                                    borderRadius: '9999px',
                                    fontSize: '0.75rem',
                                    fontWeight: 500
                                }}>
                                    {amenity}
                                </span>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Stats Summary */}
            <div className="card mt-6">
                <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Booking Summary</h2>
                <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                    <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Completed Bookings</div>
                        <div style={{ fontWeight: 600, fontSize: '1.25rem' }}>{stats.completedBookings || 0}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Total Revenue</div>
                        <div style={{ fontWeight: 600, fontSize: '1.25rem', color: 'var(--accent-green)' }}>{formatCurrency(stats.totalRevenue)}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
