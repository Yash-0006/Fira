import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import adminApi from '../api/adminApi';
import './DetailPage.css';

export default function BrandDetail() {
    const { id } = useParams();
    const [brand, setBrand] = useState(null);
    const [events, setEvents] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBrand();
    }, [id]);

    const fetchBrand = async () => {
        try {
            setLoading(true);
            const data = await adminApi.getBrandById(id);
            setBrand(data);
            setEvents(data.events || []);
            setStats(data.stats || {});
        } catch (err) {
            console.error('Failed to fetch brand:', err);
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
                        <Link to="/brands" className="back-btn">← Back to Brands</Link>
                    </div>
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    if (!brand) {
        return (
            <div className="detail-page">
                <div className="detail-header">
                    <div className="back-nav">
                        <Link to="/brands" className="back-btn">← Back to Brands</Link>
                    </div>
                    <p>Brand not found</p>
                </div>
            </div>
        );
    }

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
                            {brand.name?.charAt(0) || 'B'}
                        </div>
                        <div>
                            <h1>{brand.name}</h1>
                            <p className="detail-meta">
                                {brand.type} • {(brand.stats?.followers || 0).toLocaleString()} followers
                            </p>
                        </div>
                    </div>
                    <span className={`badge badge-${brand.status || 'approved'}`}>{brand.status || 'approved'}</span>
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
                        <div className="metric-value">{stats.eventsHosted || brand.stats?.events || 0}</div>
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
                        <div className="metric-value revenue-text">{formatCurrency(stats.totalRevenue)}</div>
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
                        <div className="metric-value">{(brand.stats?.followers || 0).toLocaleString()}</div>
                        <div className="metric-label">Followers</div>
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
                        <div className="metric-value">{(brand.stats?.views || 0).toLocaleString()}</div>
                        <div className="metric-label">Profile Views</div>
                    </div>
                </div>
            </div>

            {/* Brand Info */}
            <div className="card mt-6">
                <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Brand Information</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{brand.bio || 'No bio available'}</p>

                <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                    <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Owner</div>
                        <div style={{ fontWeight: 500 }}>{brand.user?.name || 'N/A'}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Email</div>
                        <div>{brand.user?.email || 'N/A'}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Phone</div>
                        <div>{brand.user?.phone || 'N/A'}</div>
                    </div>
                    {brand.socialLinks?.instagram && (
                        <div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Instagram</div>
                            <div style={{ color: 'var(--accent-violet)' }}>{brand.socialLinks.instagram}</div>
                        </div>
                    )}
                </div>
            </div>

            {/* Events Hosted */}
            <div className="card mt-6">
                <div className="card-header">
                    <h2>Events Hosted</h2>
                </div>

                {events.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No events found
                    </div>
                ) : (
                    <div className="events-list">
                        {events.map((event) => (
                            <Link to={`/events/${event._id}`} key={event._id} className="event-item">
                                <div className="event-info">
                                    <h3>{event.name}</h3>
                                    <div className="event-details">
                                        <span>{event.venue?.name || 'N/A'}</span>
                                        <span>{new Date(event.date).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                            {event.currentAttendees || 0} / {event.maxAttendees} tickets
                                        </div>
                                    </div>
                                    <span className={`badge badge-${event.status === 'upcoming' ? 'approved' : event.status}`}>
                                        {event.status}
                                    </span>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-muted)' }}>
                                        <path d="M9 18l6-6-6-6" />
                                    </svg>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
