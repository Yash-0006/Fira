import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import './DetailPage.css';

// Mock venue data
const mockVenue = {
    id: '1',
    name: 'Skyline Rooftop Lounge',
    owner: 'John Doe',
    email: 'john@example.com',
    phone: '+91 98765 43210',
    city: 'Mumbai',
    address: '15th Floor, Tower A, Business District',
    capacity: 500,
    pricePerHour: 15000,
    status: 'approved',
    rating: 4.5,
    totalBookings: 45,
    totalRevenue: 675000,
    amenities: ['WiFi', 'Parking', 'Catering', 'Sound System', 'Stage'],
};

// Mock booking history
const mockBookings = [
    { id: '1', event: 'New Year Bash 2025', organizer: 'Party Plus', date: '2024-12-31', duration: '7 hours', amount: 105000, status: 'confirmed' },
    { id: '2', event: 'Corporate Summit', organizer: 'TechCorp', date: '2024-12-28', duration: '4 hours', amount: 60000, status: 'confirmed' },
    { id: '3', event: 'Wedding Reception', organizer: 'Sharma Family', date: '2024-12-25', duration: '6 hours', amount: 90000, status: 'completed' },
    { id: '4', event: 'Product Launch', organizer: 'StartupXYZ', date: '2024-12-20', duration: '3 hours', amount: 45000, status: 'completed' },
    { id: '5', event: 'Birthday Party', organizer: 'Private', date: '2024-12-15', duration: '5 hours', amount: 75000, status: 'completed' },
    { id: '6', event: 'Music Night', organizer: 'DJ Cosmic', date: '2024-12-10', duration: '6 hours', amount: 90000, status: 'completed' },
];

const ITEMS_PER_PAGE = 5;

export default function VenueDetail() {
    const { id } = useParams();
    const [currentPage, setCurrentPage] = useState(1);

    const venue = mockVenue;

    const totalPages = Math.ceil(mockBookings.length / ITEMS_PER_PAGE);
    const paginatedBookings = mockBookings.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

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
                            {venue.address}, {venue.city} • Capacity: {venue.capacity}
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
                        <div className="metric-value">{venue.totalBookings}</div>
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
                        <div className="metric-value revenue-text">{formatCurrency(venue.totalRevenue)}</div>
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
                        <div className="metric-value">{venue.rating}</div>
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
                        <div style={{ fontWeight: 500 }}>{venue.owner}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Email</div>
                        <div>{venue.email}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Phone</div>
                        <div>{venue.phone}</div>
                    </div>
                </div>

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
            </div>

            {/* Booking History */}
            <div className="card mt-6">
                <div className="card-header">
                    <h2>Booking History</h2>
                </div>

                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Event</th>
                                <th>Organizer</th>
                                <th>Date</th>
                                <th>Duration</th>
                                <th>Amount</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedBookings.map((booking) => (
                                <tr key={booking.id}>
                                    <td style={{ fontWeight: 500 }}>{booking.event}</td>
                                    <td>{booking.organizer}</td>
                                    <td>{booking.date}</td>
                                    <td>{booking.duration}</td>
                                    <td style={{ color: 'var(--accent-green)', fontWeight: 600 }}>
                                        {formatCurrency(booking.amount)}
                                    </td>
                                    <td>
                                        <span className={`badge badge-${booking.status === 'confirmed' ? 'pending' : 'approved'}`}>
                                            {booking.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="pagination">
                        <button
                            className="page-btn"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(currentPage - 1)}
                        >
                            Previous
                        </button>
                        <div className="page-numbers">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    className={`page-num ${currentPage === page ? 'active' : ''}`}
                                    onClick={() => setCurrentPage(page)}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>
                        <button
                            className="page-btn"
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(currentPage + 1)}
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
