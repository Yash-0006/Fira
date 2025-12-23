import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import adminApi from '../api/adminApi';
import './ApprovalPage.css';

const ITEMS_PER_PAGE = 10;

export default function Brands() {
    const navigate = useNavigate();
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        fetchBrands();
    }, [filter, currentPage, search]);

    const fetchBrands = async () => {
        try {
            setLoading(true);
            const params = { page: currentPage, limit: ITEMS_PER_PAGE };
            if (filter !== 'all') params.status = filter;
            if (search) params.search = search;
            const data = await adminApi.getBrands(params);
            setBrands(data.brands || []);
            setTotalPages(data.totalPages || 1);
            setTotal(data.total || 0);
        } catch (err) {
            console.error('Failed to fetch brands:', err);
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
            await adminApi.updateBrandStatus(id, 'approved');
            fetchBrands();
        } catch (err) {
            console.error('Failed to approve brand:', err);
        }
    };

    const handleReject = async (id, e) => {
        e.stopPropagation();
        try {
            await adminApi.updateBrandStatus(id, 'rejected');
            fetchBrands();
        } catch (err) {
            console.error('Failed to reject brand:', err);
        }
    };

    const handleBlock = async (id, e) => {
        e.stopPropagation();
        try {
            await adminApi.updateBrandStatus(id, 'blocked');
            fetchBrands();
        } catch (err) {
            console.error('Failed to block brand:', err);
        }
    };

    const pendingCount = brands.filter(b => b.status === 'pending').length;

    return (
        <div className="approval-page">
            <div className="page-header">
                <div>
                    <h1>Brands</h1>
                    <p>Manage and approve brand profiles • {total} total</p>
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
                        placeholder="Search all brands..."
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
                                    <th>Brand</th>
                                    <th>Owner</th>
                                    <th>Type</th>
                                    <th>Followers</th>
                                    <th>Events</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {brands.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                                            No brands found
                                        </td>
                                    </tr>
                                ) : brands.map((brand) => (
                                    <tr key={brand._id} onClick={() => navigate(`/brands/${brand._id}`)} style={{ cursor: 'pointer' }}>
                                        <td>
                                            <div className="venue-info">
                                                <div className="avatar">{brand.name?.charAt(0) || 'B'}</div>
                                                <span className="venue-name">{brand.name}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div>
                                                <div>{brand.user?.name || 'N/A'}</div>
                                                <div className="text-muted">{brand.user?.email || ''}</div>
                                            </div>
                                        </td>
                                        <td style={{ textTransform: 'capitalize' }}>{brand.type || 'N/A'}</td>
                                        <td>{(brand.stats?.followers || 0).toLocaleString()}</td>
                                        <td>{brand.stats?.events || 0}</td>
                                        <td>
                                            <span className={`badge badge-${brand.status || 'approved'}`}>
                                                {brand.status || 'approved'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="actions">
                                                {brand.status === 'pending' && (
                                                    <>
                                                        <button className="btn btn-success btn-sm" onClick={(e) => handleApprove(brand._id, e)}>
                                                            Approve
                                                        </button>
                                                        <button className="btn btn-danger btn-sm" onClick={(e) => handleReject(brand._id, e)}>
                                                            Reject
                                                        </button>
                                                    </>
                                                )}
                                                {(brand.status === 'approved' || !brand.status) && (
                                                    <button className="btn btn-danger btn-sm" onClick={(e) => handleBlock(brand._id, e)}>
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
