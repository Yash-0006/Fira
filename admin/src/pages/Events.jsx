import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ApprovalPage.css';

const mockEvents = [
    {
        id: '1',
        name: 'New Year Bash 2025',
        organizer: 'Party Plus',
        email: 'events@partyplus.com',
        venue: 'Skyline Rooftop',
        date: '2024-12-31',
        ticketsSold: 245,
        maxAttendees: 500,
        revenue: 367500,
        status: 'pending',
        createdAt: '2024-12-20',
    },
    {
        id: '2',
        name: 'Live Concert - Rock Night',
        organizer: 'Music Hub',
        email: 'hello@musichub.com',
        venue: 'Beach Club',
        date: '2025-01-15',
        ticketsSold: 890,
        maxAttendees: 1000,
        revenue: 1335000,
        status: 'approved',
        createdAt: '2024-12-18',
    },
    {
        id: '3',
        name: 'Tech Meetup - AI Edition',
        organizer: 'StartupHub',
        email: 'contact@startuphub.com',
        venue: 'Convention Center',
        date: '2025-01-20',
        ticketsSold: 0,
        maxAttendees: 200,
        revenue: 0,
        status: 'pending',
        createdAt: '2024-12-22',
    },
];

export default function Events() {
    const navigate = useNavigate();
    const [events, setEvents] = useState(mockEvents);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');

    const filteredEvents = events.filter(e => {
        const matchesFilter = filter === 'all' ? true : e.status === filter;
        const matchesSearch = e.name.toLowerCase().includes(search.toLowerCase()) ||
            e.organizer.toLowerCase().includes(search.toLowerCase()) ||
            e.venue.toLowerCase().includes(search.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const handleApprove = (id) => {
        setEvents(events.map(e =>
            e.id === id ? { ...e, status: 'approved' } : e
        ));
    };

    const handleReject = (id) => {
        setEvents(events.map(e =>
            e.id === id ? { ...e, status: 'rejected' } : e
        ));
    };

    const handleBlock = (id) => {
        setEvents(events.map(e =>
            e.id === id ? { ...e, status: 'blocked' } : e
        ));
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const pendingCount = events.filter(e => e.status === 'pending').length;

    return (
        <div className="approval-page">
            <div className="page-header">
                <div>
                    <h1>Events</h1>
                    <p>Manage and approve event listings</p>
                </div>
                <div className="header-stats">
                    <span className="pending-badge">{pendingCount} pending</span>
                </div>
            </div>

            {/* Filters */}
            <div className="filters" style={{ justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {['all', 'pending', 'approved', 'rejected'].map(status => (
                        <button
                            key={status}
                            className={`filter-btn ${filter === status ? 'active' : ''}`}
                            onClick={() => setFilter(status)}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                    ))}
                </div>
                <input
                    type="text"
                    placeholder="Search events..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="search-input"
                />
            </div>

            {/* Table */}
            <div className="card mt-4">
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Event</th>
                                <th>Organizer</th>
                                <th>Venue</th>
                                <th>Date</th>
                                <th>Tickets</th>
                                <th>Revenue</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredEvents.map((event) => (
                                <tr key={event.id} onClick={() => navigate(`/events/${event.id}`)} style={{ cursor: 'pointer' }}>
                                    <td>
                                        <div className="venue-info">
                                            <div className="venue-thumb" style={{ background: 'rgba(59, 130, 246, 0.2)', color: 'var(--accent-blue)' }}>
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <rect x="3" y="4" width="18" height="18" rx="2" />
                                                    <path d="M16 2v4M8 2v4M3 10h18" />
                                                </svg>
                                            </div>
                                            <span className="venue-name">{event.name}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div>
                                            <div>{event.organizer}</div>
                                            <div className="text-muted">{event.email}</div>
                                        </div>
                                    </td>
                                    <td>{event.venue}</td>
                                    <td>{event.date}</td>
                                    <td>
                                        <div>
                                            <div>{event.ticketsSold} / {event.maxAttendees}</div>
                                            <div className="progress-bar">
                                                <div
                                                    className="progress-fill"
                                                    style={{ width: `${(event.ticketsSold / event.maxAttendees) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ color: 'var(--accent-green)', fontWeight: 600 }}>
                                        {formatCurrency(event.revenue)}
                                    </td>
                                    <td>
                                        <span className={`badge badge-${event.status}`}>
                                            {event.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="actions">
                                            {event.status === 'pending' && (
                                                <>
                                                    <button className="btn btn-success btn-sm" onClick={() => handleApprove(event.id)}>
                                                        Approve
                                                    </button>
                                                    <button className="btn btn-danger btn-sm" onClick={() => handleReject(event.id)}>
                                                        Reject
                                                    </button>
                                                </>
                                            )}
                                            {event.status === 'approved' && (
                                                <button className="btn btn-danger btn-sm" onClick={() => handleBlock(event.id)}>
                                                    Block
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
