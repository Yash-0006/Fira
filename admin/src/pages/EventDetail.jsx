import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import './DetailPage.css';

// Mock event data
const mockEvent = {
    id: '1',
    name: 'New Year Bash 2025',
    organizer: 'Party Plus',
    email: 'events@partyplus.com',
    venue: 'Skyline Rooftop',
    date: '2024-12-31',
    startTime: '21:00',
    endTime: '04:00',
    ticketsSold: 245,
    maxAttendees: 500,
    ticketPrice: 1500,
    revenue: 367500,
    status: 'approved',
    category: 'Party',
    description: 'The biggest New Year celebration in town!',
};

// Mock ticket buyers
const mockBuyers = [
    { id: '1', name: 'John Doe', email: 'john@example.com', phone: '+91 98765 43210', quantity: 2, amount: 3000, date: '2024-12-20', status: 'confirmed' },
    { id: '2', name: 'Sarah Wilson', email: 'sarah@example.com', phone: '+91 87654 32109', quantity: 4, amount: 6000, date: '2024-12-19', status: 'confirmed' },
    { id: '3', name: 'Mike Johnson', email: 'mike@example.com', phone: '+91 76543 21098', quantity: 1, amount: 1500, date: '2024-12-18', status: 'confirmed' },
    { id: '4', name: 'Emma Brown', email: 'emma@example.com', phone: '+91 65432 10987', quantity: 3, amount: 4500, date: '2024-12-17', status: 'cancelled' },
    { id: '5', name: 'Alex Turner', email: 'alex@example.com', phone: '+91 54321 09876', quantity: 2, amount: 3000, date: '2024-12-16', status: 'confirmed' },
    { id: '6', name: 'Lisa Park', email: 'lisa@example.com', phone: '+91 43210 98765', quantity: 5, amount: 7500, date: '2024-12-15', status: 'confirmed' },
    { id: '7', name: 'David Lee', email: 'david@example.com', phone: '+91 32109 87654', quantity: 2, amount: 3000, date: '2024-12-14', status: 'confirmed' },
    { id: '8', name: 'Nina Patel', email: 'nina@example.com', phone: '+91 21098 76543', quantity: 1, amount: 1500, date: '2024-12-13', status: 'confirmed' },
];

const ITEMS_PER_PAGE = 5;

export default function EventDetail() {
    const { id } = useParams();
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState('');

    const event = mockEvent; // In real app, fetch by id

    const filteredBuyers = mockBuyers.filter(b =>
        b.name.toLowerCase().includes(search.toLowerCase()) ||
        b.email.toLowerCase().includes(search.toLowerCase())
    );

    const totalPages = Math.ceil(filteredBuyers.length / ITEMS_PER_PAGE);
    const paginatedBuyers = filteredBuyers.slice(
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
                    <Link to="/events" className="back-btn">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                        Back to Events
                    </Link>
                </div>
                <div className="detail-title-row">
                    <div>
                        <h1>{event.name}</h1>
                        <p className="detail-meta">
                            {event.venue} • {event.date} • {event.startTime} - {event.endTime}
                        </p>
                    </div>
                    <span className={`badge badge-${event.status}`}>{event.status}</span>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="metrics-grid">
                <div className="metric-card">
                    <div className="metric-icon tickets">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M2 9a3 3 0 013-3h14a3 3 0 013 3M2 9v8a3 3 0 003 3h14a3 3 0 003-3V9M2 9l10 6 10-6" />
                        </svg>
                    </div>
                    <div className="metric-info">
                        <div className="metric-value">{event.ticketsSold}</div>
                        <div className="metric-label">Tickets Sold</div>
                    </div>
                    <div className="metric-progress">
                        <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${(event.ticketsSold / event.maxAttendees) * 100}%` }} />
                        </div>
                        <span className="progress-text">{Math.round((event.ticketsSold / event.maxAttendees) * 100)}% of {event.maxAttendees}</span>
                    </div>
                </div>

                <div className="metric-card">
                    <div className="metric-icon revenue">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                        </svg>
                    </div>
                    <div className="metric-info">
                        <div className="metric-value revenue-text">{formatCurrency(event.revenue)}</div>
                        <div className="metric-label">Total Revenue</div>
                    </div>
                </div>

                <div className="metric-card">
                    <div className="metric-icon price">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="2" y="5" width="20" height="14" rx="2" />
                            <path d="M2 10h20" />
                        </svg>
                    </div>
                    <div className="metric-info">
                        <div className="metric-value">{formatCurrency(event.ticketPrice)}</div>
                        <div className="metric-label">Ticket Price</div>
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
                        <div className="metric-value">{mockBuyers.length}</div>
                        <div className="metric-label">Total Bookings</div>
                    </div>
                </div>
            </div>

            {/* Ticket Buyers Table */}
            <div className="card mt-6">
                <div className="card-header">
                    <h2>Ticket Buyers</h2>
                    <input
                        type="text"
                        placeholder="Search buyers..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                        className="search-input"
                    />
                </div>

                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Buyer</th>
                                <th>Phone</th>
                                <th>Tickets</th>
                                <th>Amount</th>
                                <th>Date</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedBuyers.map((buyer) => (
                                <tr key={buyer.id}>
                                    <td>
                                        <div className="buyer-info">
                                            <div className="avatar">{buyer.name.charAt(0)}</div>
                                            <div>
                                                <div className="buyer-name">{buyer.name}</div>
                                                <div className="buyer-email">{buyer.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{buyer.phone}</td>
                                    <td>{buyer.quantity}</td>
                                    <td style={{ color: 'var(--accent-green)', fontWeight: 600 }}>
                                        {formatCurrency(buyer.amount)}
                                    </td>
                                    <td>{buyer.date}</td>
                                    <td>
                                        <span className={`badge badge-${buyer.status === 'confirmed' ? 'approved' : 'rejected'}`}>
                                            {buyer.status}
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
