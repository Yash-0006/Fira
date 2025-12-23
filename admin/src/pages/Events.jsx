import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import adminApi from '../api/adminApi';
import './ApprovalPage.css';

const ITEMS_PER_PAGE = 10;

export default function Events() {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        fetchEvents();
    }, [filter, currentPage, search]);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const params = { page: currentPage, limit: ITEMS_PER_PAGE };
            if (filter === 'public' || filter === 'private') {
                params.eventType = filter;
            } else if (filter !== 'all') {
                params.status = filter;
            }
            if (search) params.search = search;
            const data = await adminApi.getEvents(params);
            setEvents(data.events || []);
            setTotalPages(data.totalPages || 1);
            setTotal(data.total || 0);
        } catch (err) {
            console.error('Failed to fetch events:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setSearch(searchInput);
        setCurrentPage(1);
    };

    const handleApprove = async (id, e) => {
        e.stopPropagation();
        try {
            await adminApi.updateEventStatus(id, 'upcoming');
            fetchEvents();
        } catch (err) {
            console.error('Failed to approve event:', err);
        }
    };

    const handleReject = async (id, e) => {
        e.stopPropagation();
        try {
            await adminApi.updateEventStatus(id, 'rejected');
            fetchEvents();
        } catch (err) {
            console.error('Failed to reject event:', err);
        }
    };

    const handleBlock = async (id, e) => {
        e.stopPropagation();
        try {
            await adminApi.updateEventStatus(id, 'blocked');
            fetchEvents();
        } catch (err) {
            console.error('Failed to block event:', err);
        }
    };

    const pendingCount = events.filter(e => e.status === 'pending' || e.status === 'draft').length;

    return (
        <div className="approval-page">
            <div className="page-header">
                <div>
                    <h1>Events</h1>
                    <p>Manage and approve event listings • {total} total</p>
                </div>
                <div className="header-stats">
                    <span className="pending-badge">{pendingCount} pending</span>
                </div>
            </div>

            {/* Filters */}
            <div className="filters" style={{ justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {['all', 'draft', 'upcoming', 'completed', 'public', 'private'].map(status => (
                        <button
                            key={status}
                            className={`filter-btn ${filter === status ? 'active' : ''}`}
                            onClick={() => { setFilter(status); setCurrentPage(1); }}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                    ))}
                </div>
                <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                        type="text"
                        placeholder="Search all events..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="search-input"
                    />
                    <button type="submit" className="btn btn-primary btn-sm">Search</button>
                    {search && (
                        <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => { setSearch(''); setSearchInput(''); setCurrentPage(1); }}
                        >
                            Clear
                        </button>
                    )}
                </form>
            </div>

            {search && (
                <div style={{ marginBottom: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    Showing results for "{search}"
                </div>
            )}

            {/* Table */}
            <div className="card mt-4">
                {loading ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
                ) : (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Event</th>
                                    <th>Organizer</th>
                                    <th>Venue</th>
                                    <th>Date</th>
                                    <th>Tickets</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {events.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                                            No events found
                                        </td>
                                    </tr>
                                ) : events.map((event) => (
                                    <tr key={event._id} onClick={() => navigate(`/events/${event._id}`)} style={{ cursor: 'pointer' }}>
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
                                                <div>{event.organizer?.name || 'N/A'}</div>
                                                <div className="text-muted">{event.organizer?.email || ''}</div>
                                            </div>
                                        </td>
                                        <td>{event.venue?.name || 'N/A'}</td>
                                        <td>{new Date(event.date).toLocaleDateString()}</td>
                                        <td>
                                            <div>
                                                <div>{event.currentAttendees || 0} / {event.maxAttendees}</div>
                                                <div className="progress-bar">
                                                    <div
                                                        className="progress-fill"
                                                        style={{ width: `${((event.currentAttendees || 0) / event.maxAttendees) * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge badge-${event.status === 'upcoming' ? 'approved' : event.status}`}>
                                                {event.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="actions">
                                                {(event.status === 'draft' || event.status === 'pending') && (
                                                    <>
                                                        <button className="btn btn-success btn-sm" onClick={(e) => handleApprove(event._id, e)}>
                                                            Approve
                                                        </button>
                                                        <button className="btn btn-danger btn-sm" onClick={(e) => handleReject(event._id, e)}>
                                                            Reject
                                                        </button>
                                                    </>
                                                )}
                                                {event.status === 'upcoming' && (
                                                    <button className="btn btn-danger btn-sm" onClick={(e) => handleBlock(event._id, e)}>
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
                )}

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
                            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                let page;
                                if (totalPages <= 5) {
                                    page = i + 1;
                                } else if (currentPage <= 3) {
                                    page = i + 1;
                                } else if (currentPage >= totalPages - 2) {
                                    page = totalPages - 4 + i;
                                } else {
                                    page = currentPage - 2 + i;
                                }
                                return (
                                    <button
                                        key={page}
                                        className={`page-num ${currentPage === page ? 'active' : ''}`}
                                        onClick={() => setCurrentPage(page)}
                                    >
                                        {page}
                                    </button>
                                );
                            })}
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
