import { useState, useEffect } from 'react';
import adminApi from '../api/adminApi';
import './ApprovalPage.css';

const ITEMS_PER_PAGE = 10;

export default function Users() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        fetchUsers();
    }, [filter, currentPage, search]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const params = { page: currentPage, limit: ITEMS_PER_PAGE };
            if (filter === 'blocked') params.status = 'blocked';
            if (filter === 'active') params.status = 'active';
            if (search) params.search = search;
            const data = await adminApi.getUsers(params);
            setUsers(data.users || []);
            setTotalPages(data.totalPages || 1);
            setTotal(data.total || 0);
        } catch (err) {
            console.error('Failed to fetch users:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setSearch(searchInput);
        setCurrentPage(1);
    };

    const handleBlock = async (id) => {
        try {
            await adminApi.blockUser(id);
            fetchUsers();
        } catch (err) {
            console.error('Failed to block user:', err);
        }
    };

    const handleUnblock = async (id) => {
        try {
            await adminApi.unblockUser(id);
            fetchUsers();
        } catch (err) {
            console.error('Failed to unblock user:', err);
        }
    };

    const blockedUsers = users.filter(u => u.isBlocked).length;

    return (
        <div className="approval-page">
            <div className="page-header">
                <div>
                    <h1>Users</h1>
                    <p>Manage platform users • {total} total</p>
                </div>
                <div className="header-stats">
                    <span className="pending-badge" style={{ background: 'rgba(239, 68, 68, 0.2)', color: 'var(--accent-red)' }}>
                        {blockedUsers} blocked
                    </span>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="filters" style={{ justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {['all', 'active', 'blocked'].map(status => (
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
                        placeholder="Search all users..."
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
                                    <th>User</th>
                                    <th>Badge</th>
                                    <th>Phone</th>
                                    <th>Followers</th>
                                    <th>Joined</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                                            No users found
                                        </td>
                                    </tr>
                                ) : users.map((user) => (
                                    <tr key={user._id}>
                                        <td>
                                            <div className="venue-info">
                                                <div className="avatar">{user.name?.charAt(0) || 'U'}</div>
                                                <div>
                                                    <div className="venue-name">{user.name}</div>
                                                    <div className="text-muted">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge ${user.verificationBadge === 'brand' ? 'badge-approved' :
                                                    user.verificationBadge === 'organizer' ? 'badge-active' :
                                                        'badge-pending'
                                                }`} style={{ textTransform: 'capitalize' }}>
                                                {user.verificationBadge || 'none'}
                                            </span>
                                        </td>
                                        <td>{user.phone || 'N/A'}</td>
                                        <td>{(user.followers?.length || 0).toLocaleString()}</td>
                                        <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            <span className={`badge ${user.isBlocked ? 'badge-rejected' : 'badge-approved'}`}>
                                                {user.isBlocked ? 'Blocked' : 'Active'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="actions">
                                                {user.isBlocked ? (
                                                    <button className="btn btn-success btn-sm" onClick={() => handleUnblock(user._id)}>
                                                        Unblock
                                                    </button>
                                                ) : (
                                                    <button className="btn btn-danger btn-sm" onClick={() => handleBlock(user._id)}>
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
