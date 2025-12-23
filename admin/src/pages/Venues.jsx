import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import adminApi from '../api/adminApi';
import './ApprovalPage.css';

const ITEMS_PER_PAGE = 10;

export default function Venues() {
    const navigate = useNavigate();
    const [venues, setVenues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        fetchVenues();
    }, [filter, currentPage, search]);

    const fetchVenues = async () => {
        try {
            setLoading(true);
            const params = { page: currentPage, limit: ITEMS_PER_PAGE };
            if (filter !== 'all') params.status = filter;
            if (search) params.search = search;
            const data = await adminApi.getVenues(params);
            setVenues(data.venues || []);
            setTotalPages(data.totalPages || 1);
            setTotal(data.total || 0);
        } catch (err) {
            console.error('Failed to fetch venues:', err);
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
            await adminApi.updateVenueStatus(id, 'approved');
            fetchVenues();
        } catch (err) {
            console.error('Failed to approve venue:', err);
        }
    };

    const handleReject = async (id, e) => {
        e.stopPropagation();
        try {
            await adminApi.updateVenueStatus(id, 'rejected');
            fetchVenues();
        } catch (err) {
            console.error('Failed to reject venue:', err);
        }
    };

    const handleBlock = async (id, e) => {
        e.stopPropagation();
        try {
            await adminApi.updateVenueStatus(id, 'blocked');
            fetchVenues();
        } catch (err) {
            console.error('Failed to block venue:', err);
        }
    };

    const pendingCount = venues.filter(v => v.status === 'pending').length;

    return (
        <div className="approval-page">
            <div className="page-header">
                <div>
                    <h1>Venues</h1>
                    <p>Manage and approve venue listings • {total} total</p>
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
                            onClick={() => { setFilter(status); setCurrentPage(1); }}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                    ))}
                </div>
                <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                        type="text"
                        placeholder="Search all venues..."
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
                                    <th>Venue</th>
                                    <th>Owner</th>
                                    <th>Location</th>
                                    <th>Capacity</th>
                                    <th>Status</th>
                                    <th>Created</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {venues.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                                            No venues found
                                        </td>
                                    </tr>
                                ) : venues.map((venue) => (
                                    <tr key={venue._id} onClick={() => navigate(`/venues/${venue._id}`)} style={{ cursor: 'pointer' }}>
                                        <td>
                                            <div className="venue-info">
                                                <div className="venue-thumb">
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
                                                    </svg>
                                                </div>
                                                <span className="venue-name">{venue.name}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div>
                                                <div>{venue.owner?.name || 'N/A'}</div>
                                                <div className="text-muted">{venue.owner?.email || ''}</div>
                                            </div>
                                        </td>
                                        <td>{venue.address?.city || 'N/A'}</td>
                                        <td>{(venue.capacity || 0).toLocaleString()}</td>
                                        <td>
                                            <span className={`badge badge-${venue.status}`}>
                                                {venue.status}
                                            </span>
                                        </td>
                                        <td>{new Date(venue.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            <div className="actions">
                                                {venue.status === 'pending' && (
                                                    <>
                                                        <button className="btn btn-success btn-sm" onClick={(e) => handleApprove(venue._id, e)}>
                                                            Approve
                                                        </button>
                                                        <button className="btn btn-danger btn-sm" onClick={(e) => handleReject(venue._id, e)}>
                                                            Reject
                                                        </button>
                                                    </>
                                                )}
                                                {venue.status === 'approved' && (
                                                    <button className="btn btn-danger btn-sm" onClick={(e) => handleBlock(venue._id, e)}>
                                                        Block
                                                    </button>
                                                )}
                                                {venue.status === 'blocked' && (
                                                    <button className="btn btn-success btn-sm" onClick={(e) => handleApprove(venue._id, e)}>
                                                        Unblock
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
